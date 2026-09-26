#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
if [ -x "$ROOT/backend/venv/bin/python" ]; then
  PYTHON="$ROOT/backend/venv/bin/python"
else
  command -v python3 >/dev/null 2>&1 || { echo "ERROR: Python 3 no está instalado."; read -r -p "Enter para cerrar..."; exit 1; }
  PYTHON="$(command -v python3)"
fi
if ! "$PYTHON" "$ROOT/scripts/start.py" "$@"; then
  echo
  echo "No se pudo iniciar Kobber. Revisa el mensaje anterior."
  read -r -p "Enter para cerrar..."
  exit 1
fi
