#!/bin/bash
# Doble clic para levantar Kobber localmente (backend + frontend), sin terminal
# ni Claude Code. Cierra esta ventana (o Ctrl+C) para apagar los dos servidores.

cd "$(dirname "$0")" || exit 1

echo "==================================================="
echo "  Kobber — iniciando backend y frontend"
echo "==================================================="

if [ ! -d "backend/venv" ]; then
  echo "❌ No existe backend/venv — corre primero la instalación (ver README.md)."
  read -n 1 -s -r -p "Presiona una tecla para cerrar..."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "❌ No existe node_modules — corre 'npm install' primero (ver README.md)."
  read -n 1 -s -r -p "Presiona una tecla para cerrar..."
  exit 1
fi

# Si ya hay algo escuchando en estos puertos (de una corrida anterior que no
# se cerró bien), lo avisamos en vez de fallar en silencio.
for port in 8000 5173; do
  pid=$(lsof -tiTCP:$port -sTCP:LISTEN 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "⚠️  El puerto $port ya está en uso (proceso $pid) — lo cierro para levantar limpio."
    kill "$pid" 2>/dev/null
    sleep 1
  fi
done

cleanup() {
  echo ""
  echo "Cerrando Kobber..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir backend &
BACKEND_PID=$!

npm run dev &
FRONTEND_PID=$!

sleep 3
open "http://localhost:5173"

echo ""
echo "✅ Kobber corriendo — http://localhost:5173"
echo "   Deja esta ventana abierta. Ciérrala (o Ctrl+C) para apagar todo."
echo ""

wait
