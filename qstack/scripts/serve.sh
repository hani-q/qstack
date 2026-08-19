#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${1:-8000}"
BIND_ADDRESS="${2:-127.0.0.1}"

case "$PORT" in
  ''|*[!0-9]*|0) echo "usage: $0 [port] [bind-address]" >&2; exit 2 ;;
esac
[ "$PORT" -le 65535 ] || { echo "usage: $0 [port] [bind-address]" >&2; exit 2; }
[ -n "$BIND_ADDRESS" ] || { echo "usage: $0 [port] [bind-address]" >&2; exit 2; }
[ "$#" -le 2 ] || { echo "usage: $0 [port] [bind-address]" >&2; exit 2; }

SERVE_DIR="$(cd "$SCRIPT_DIR/../compound_engineering" && pwd)"

echo "Serving $SERVE_DIR on $BIND_ADDRESS:$PORT"
exec python3 -m http.server "$PORT" --bind "$BIND_ADDRESS" --directory "$SERVE_DIR"
