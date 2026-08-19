#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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

echo "Serving $SERVE_DIR on $BIND_ADDRESS:$PORT"
exec python3 -m http.server "$PORT" --bind "$BIND_ADDRESS" --directory "$SERVE_DIR"
