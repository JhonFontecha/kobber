@echo off
setlocal
cd /d "%~dp0"

title Iniciar Kobber

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-windows.ps1"
if errorlevel 1 (
  echo.
  echo No se pudo iniciar Kobber. Revisa el mensaje anterior.
  pause
)

endlocal
