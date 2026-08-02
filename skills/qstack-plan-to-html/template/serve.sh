#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVE_DIR="$(cd "$SCRIPT_DIR/../compound_engineering" && pwd)"
PORT="${1:-8000}"

case "$PORT" in
  ''|*[!0-9]*) echo "usage: $0 [port]" >&2; exit 2 ;;
esac

echo "Serving $SERVE_DIR at http://127.0.0.1:$PORT"
exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$SERVE_DIR"
