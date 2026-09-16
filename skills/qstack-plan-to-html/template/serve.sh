#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QSTACK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT="${1:-8000}"
BIND_ADDRESS="${2:-127.0.0.1}"

usage() {
  echo "usage: $0 [port] [bind-address]" >&2
  exit 2
}

case "$PORT" in
  ''|*[!0-9]*) usage ;;
esac

while [ "${PORT#0}" != "$PORT" ]; do
  PORT="${PORT#0}"
done

[ -n "$PORT" ] || usage
[ "${#PORT}" -le 5 ] || usage
[ "$PORT" -le 65535 ] || usage
[ -n "$BIND_ADDRESS" ] || usage
[ "$#" -le 2 ] || usage

SERVE_DIR="$(cd "$SCRIPT_DIR/../compound_engineering" && pwd)"

# card-ref reads this file to decide whether a card link can be a served URL.
# One key=value pair per line: bind, port, and the pid of the server process.
# It is written once the server starts and removed when this script exits, so a
# file naming a dead pid is a crash leftover and card-ref ignores it.
SERVE_STATE="$QSTACK_DIR/.serve"
SERVER_PID=""

# Read one key's value out of the state file, or print nothing when the file is
# gone or does not name that key.
serve_state_value() {
  [ -f "$SERVE_STATE" ] || return 0
  sed -n "s/^$1=//p" "$SERVE_STATE" | head -n 1
}

# The state file holds one server, so a second run in the same repository would
# overwrite the first run's entry and then delete the file out from under it.
# Refuse instead, unless the pid on file is dead, which means a crashed server
# left the file behind and this run may take it over.
EXISTING_PID="$(serve_state_value pid)"
case "$EXISTING_PID" in
  ''|*[!0-9]*) EXISTING_PID="" ;;
esac

if [ -n "$EXISTING_PID" ] && kill -0 "$EXISTING_PID" 2>/dev/null; then
  echo "$0: a plan server already runs on $(serve_state_value bind):$(serve_state_value port) as pid $EXISTING_PID" >&2
  exit 1
fi

# Remove the state file only while it still names this run's server, so an exit
# that never claimed the file leaves another run's entry alone.
cleanup() {
  if [ -n "$SERVER_PID" ] && [ "$(serve_state_value pid)" = "$SERVER_PID" ]; then
    rm -f "$SERVE_STATE"
  fi
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    SERVER_PID=""
  fi
}

trap cleanup EXIT
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

echo "Serving $SERVE_DIR on $BIND_ADDRESS:$PORT"

# Run the server as a child rather than exec-ing it, so the trap above can
# remove the state file when it stops.
python3 -m http.server "$PORT" --bind "$BIND_ADDRESS" --directory "$SERVE_DIR" &
SERVER_PID=$!

printf 'bind=%s\nport=%s\npid=%s\n' "$BIND_ADDRESS" "$PORT" "$SERVER_PID" \
  >"$SERVE_STATE"

STATUS=0
wait "$SERVER_PID" || STATUS=$?
cleanup
exit "$STATUS"
