@echo off
setlocal EnableExtensions
title Instalar Kobber

set "REPO_URL=https://github.com/JhonFontecha/kobber.git"
set "TARGET=%USERPROFILE%\Documents\Proyectos\kobber"

echo ==============================================================
echo  INSTALADOR DE KOBBER PARA WINDOWS
echo ==============================================================

where git.exe >nul 2>nul || goto :missing_git
where node.exe >nul 2>nul || goto :missing_node
where npm.cmd >nul 2>nul || goto :missing_node

set "PYTHON_CMD="
where py.exe >nul 2>nul && set "PYTHON_CMD=py.exe -3"
if not defined PYTHON_CMD where python.exe >nul 2>nul && set "PYTHON_CMD=python.exe"
if not defined PYTHON_CMD goto :missing_python

if exist "%TARGET%\.git" goto :existing
if exist "%TARGET%" (
  echo ERROR: Ya existe %TARGET% pero no es un repositorio Git.
  echo No se modifico esa carpeta.
  goto :failed
)

if not exist "%USERPROFILE%\Documents\Proyectos" mkdir "%USERPROFILE%\Documents\Proyectos"
echo Descargando Kobber desde la rama ajustes_kobber_J...
git clone --branch ajustes_kobber_J --single-branch "%REPO_URL%" "%TARGET%" || goto :failed
goto :configure

:existing
echo Se encontro una instalacion existente en:
echo %TARGET%
echo Se conservaran sus credenciales y datos locales.

:configure
call %PYTHON_CMD% "%TARGET%\deployment\common\manage.py" install %*
if errorlevel 1 goto :failed
exit /b 0

:missing_git
echo ERROR: Falta Git. Descargalo desde https://git-scm.com/downloads
goto :failed
:missing_node
echo ERROR: Falta Node.js 24 LTS. Descargalo desde https://nodejs.org/
goto :failed
:missing_python
echo ERROR: Falta Python 3.10 o superior. Descargalo desde https://python.org/downloads/
goto :failed
:failed
echo.
echo La instalacion no se completo. No se eliminaron archivos existentes.
pause
exit /b 1
