#!/bin/bash
set -euo pipefail

REPO_URL="https://github.com/JhonFontecha/kobber.git"
TARGET="$HOME/Documents/Proyectos/kobber"

echo "=============================================================="
echo " INSTALADOR DE KOBBER PARA macOS"
echo "=============================================================="

command -v git >/dev/null 2>&1 || { echo "ERROR: Instala Git o las herramientas Xcode Command Line Tools."; read -r -p "Enter para cerrar..."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "ERROR: Instala Python 3.10 o superior."; read -r -p "Enter para cerrar..."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "ERROR: Instala Node.js 24 LTS desde https://nodejs.org/"; read -r -p "Enter para cerrar..."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "ERROR: npm no está disponible."; read -r -p "Enter para cerrar..."; exit 1; }
test -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" || test -x "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" || { echo "ERROR: Instala Google Chrome."; read -r -p "Enter para cerrar..."; exit 1; }

if [ -d "$TARGET/.git" ]; then
  echo "Se encontró una instalación existente en $TARGET"
elif [ -e "$TARGET" ]; then
  echo "ERROR: $TARGET ya existe pero no es un repositorio Git. No se modificó."
  read -r -p "Enter para cerrar..."
  exit 1
else
  mkdir -p "$HOME/Documents/Proyectos"
  echo "Descargando Kobber desde la rama ajustes_kobber_J..."
  git clone --branch ajustes_kobber_J --single-branch "$REPO_URL" "$TARGET"
fi

if ! python3 "$TARGET/deployment/common/manage.py" install "$@"; then
  echo
  echo "La instalación no se completó. No se eliminaron archivos existentes."
  read -r -p "Enter para cerrar..."
  exit 1
fi
