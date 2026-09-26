@echo off
setlocal EnableExtensions
title Actualizar Kobber
for %%I in ("%~dp0..\..") do set "ROOT=%%~fI"
cd /d "%ROOT%"

if exist "%ROOT%\backend\venv\Scripts\python.exe" (
  "%ROOT%\backend\venv\Scripts\python.exe" "%ROOT%\deployment\common\manage.py" update %*
) else (
  where py.exe >nul 2>nul || goto :missing_python
  py.exe -3 "%ROOT%\deployment\common\manage.py" update %*
)
if errorlevel 1 (
  echo.
  echo No se pudo actualizar Kobber. Revisa el mensaje anterior.
  pause
  exit /b 1
)
exit /b 0

:missing_python
echo ERROR: Python no esta instalado o no esta disponible en PATH.
pause
exit /b 1
