@echo off
setlocal EnableExtensions
title Iniciar Kobber
for %%I in ("%~dp0..\..") do set "ROOT=%%~fI"
cd /d "%ROOT%"

if exist "%ROOT%\backend\venv\Scripts\python.exe" (
  "%ROOT%\backend\venv\Scripts\python.exe" "%ROOT%\scripts\start.py" %*
) else (
  where py.exe >nul 2>nul || goto :missing_python
  py.exe -3 "%ROOT%\scripts\start.py" %*
)
if errorlevel 1 (
  echo.
  echo No se pudo iniciar Kobber. Revisa el mensaje anterior.
  pause
  exit /b 1
)
exit /b 0

:missing_python
echo ERROR: Python no esta instalado o no esta disponible en PATH.
pause
exit /b 1
