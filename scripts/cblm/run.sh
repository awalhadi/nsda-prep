#!/usr/bin/env bash
# Runs a pipeline Python script inside the pinned, pipeline-only venv.
# Usage: bash scripts/cblm/run.sh <script.py> [args...]
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
venv="$here/.venv"

if [ ! -x "$venv/bin/python" ]; then
  python3 -m venv "$venv"
fi
if ! "$venv/bin/python" -c "import pymupdf" 2>/dev/null; then
  "$venv/bin/pip" install -q -r "$here/requirements.txt"
fi

script="$1"
shift
exec "$venv/bin/python" -I "$here/$script" "$@"
