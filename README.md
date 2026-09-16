# Kobber

Gestión de catálogo Truper/Pretul/FIERO, tienda pública y publicador de MercadoLibre Colombia.
La arquitectura se documenta en [CLAUDE.md](./CLAUDE.md).

## Instalación local en Windows y macOS

Cada computadora tiene su propia copia del código, configuración y sesión de MercadoLibre.
Si varias copias usan el mismo Supabase, comparten los datos reales del catálogo.

### Requisitos

Instalar una vez **Python 3.14**, **Node.js 24 LTS** (incluye npm), **Git** y **Google Chrome**.
Usar Windows 10/11 de 64 bits o una versión de macOS compatible con estos programas.
Chrome sólo es necesario para las funciones de MercadoLibre. El instalador no descarga los
programas del sistema: comprueba Python/Node y descarga las dependencias del proyecto.

En Windows, habilitar Python en PATH y abrir una terminal nueva tras instalarlo.
En macOS, `python3 --version` debe indicar 3.14; no usar el Python antiguo del sistema.
Se incluyen comprobaciones de instalación, compilación e inicio/parada para Windows y macOS
en `.github/workflows/portable.yml`. El flujo se ejecuta al subir cambios a GitHub;
no equivale a una prueba de login real de MercadoLibre ni de todas las versiones de cada sistema.

Clonar y entrar al proyecto:

```sh
git clone https://github.com/JhonFontecha/kobber.git
cd kobber
```

### Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\windows\instalar.ps1
# Completar backend/.env antes de usar el catálogo y la IA.
powershell -ExecutionPolicy Bypass -File .\scripts\windows\iniciar.ps1
```

`Bypass` sólo se aplica a esa ejecución; no cambia la política permanente de Windows.
También se puede usar `python scripts/kobber.py instalar` y `python scripts/kobber.py iniciar`.

### macOS (Terminal)

```sh
sh scripts/macos/instalar.sh
# Completar backend/.env antes de usar el catálogo y la IA.
sh scripts/macos/iniciar.sh
```

Los accesos por sistema están organizados así:

```text
scripts/
├── kobber.py           # Controlador común
├── windows/            # instalar.ps1, iniciar.ps1, detener.ps1, estado.ps1, actualizar.ps1
└── macos/              # instalar.sh, iniciar.sh, detener.sh, estado.sh, actualizar.sh
```

Los scripts pueden ejecutarse desde otra carpeta: encuentran el proyecto por su propia ubicación.
El instalador crea `backend/venv`, instala Python con `requirements.txt`, usa `npm ci` y compila
la interfaz. Copia `.env.example` sólo cuando no existe `.env`; nunca reemplaza tus credenciales.

### Credenciales

Completar `backend/.env` con `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY` y
`ANTHROPIC_API_KEY`. No subir este archivo a Git. Debe ser el Supabase de Kobber con sus tablas
ya creadas: el instalador no crea ni migra bases de datos.
Los servidores pueden encender sin credenciales válidas, pero el catálogo y las funciones IA
no funcionarán hasta configurarlas. Después de cambiar `.env`, detener e iniciar otra vez.

### Uso diario

| Acción | Windows (desde PowerShell) | macOS |
|---|---|---|
| Iniciar | `python scripts/kobber.py iniciar` | `sh scripts/macos/iniciar.sh` |
| Ver estado | `python scripts/kobber.py estado` | `sh scripts/macos/estado.sh` |
| Detener | `python scripts/kobber.py detener` | `sh scripts/macos/detener.sh` |
| Instalar/recompilar | `python scripts/kobber.py instalar` | `sh scripts/macos/instalar.sh` |
| Actualizar | `python scripts/kobber.py actualizar` | `sh scripts/macos/actualizar.sh` |

Los archivos `.ps1` equivalentes están en `scripts/windows/`; se ejecutan como en el ejemplo de instalación.

Tienda: http://127.0.0.1:5173 — Administrador: http://127.0.0.1:5173/admin.
Backend: http://127.0.0.1:8000/health.

`iniciar` mantiene dos procesos en segundo plano y sirve la interfaz **compilada**, sin recarga
al editar código. No instala un servicio del sistema ni inicia automáticamente al encender el equipo.
`detener` sólo controla los procesos creados por el supervisor de esta copia. No mata otros procesos
que ocupen los mismos puertos. Para servidores iniciados manualmente, cerrar sus terminales o
usar Ctrl+C antes de ejecutar estos comandos.

Los registros quedan en `.kobber/backend.log`, `.kobber/frontend.log` y `.kobber/supervisor.log`.
La carpeta `.kobber` no se comparte por Git. Si un servidor falla al arrancar, el supervisor detiene
el otro y el comando devuelve un error. El estado confirma los procesos locales, no la conexión
con Supabase, Anthropic o MercadoLibre.

Para usar otros puertos, definir ambas variables antes de iniciar (el proxy se adapta):

```powershell
# Windows
$env:KOBBER_PORT = '5183'
$env:KOBBER_API_PORT = '8010'
python scripts/kobber.py iniciar
```

```sh
# macOS
KOBBER_PORT=5183 KOBBER_API_PORT=8010 sh scripts/macos/iniciar.sh
```

### Actualizar el código

Primero detener; luego actualizar; por último iniciar. `actualizar` exige un árbol de Git limpio,
usa `git pull --ff-only` sobre la rama actual y su upstream, e instala/recompila las dependencias.
No sube cambios, no cambia de rama, no borra trabajo y no resuelve conflictos automáticamente.
Si hay cambios locales, guardarlos en Git antes de continuar. Si la instalación falla después
del pull, el código nuevo queda descargado, los servidores permanecen detenidos y se puede
repetir `instalar` tras corregir el error. No hay rollback automático.
Las credenciales y la sesión local se conservan. Para recibir estos scripts en otras máquinas,
primero deben estar publicados en la rama de GitHub que esas máquinas descargan.

### MercadoLibre

Chrome debe estar instalado y el equipo debe tener una sesión gráfica abierta. Iniciar sesión
con el botón del panel o, de forma interactiva en una terminal, con:

```powershell
# Windows
.\backend\venv\Scripts\python.exe scripts/ml_login.py
```

```sh
# macOS
backend/venv/bin/python scripts/ml_login.py
```

Las sesiones, capturas y plantillas se guardan en `.kobber/mercadolibre/` dentro de esta copia.
Las sesiones anteriores de `/tmp` no se migran: iniciar sesión nuevamente una vez.
Cada computadora necesita su propio login; no compartir las cookies por Git.

## Desarrollo manual

Para editar con recarga de la interfaz, usar dos terminales en la raíz (sin el supervisor activo):

```powershell
# Windows, terminal 1
.\backend\venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
# Terminal 2
npm run dev
```

```sh
# macOS, terminal 1
backend/venv/bin/python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
# Terminal 2
npm run dev
```

Verificación: `python -m unittest discover -s tests -v` (macOS: `python3`).
Compilación: `npm run build`. No se necesitan credenciales para compilar.

## Deploy de la tienda pública (servidor, no la Mac)

El Publicador (panel admin) no se deploya — sigue corriendo sólo local, en la Mac de la empresa
(necesita Playwright/Chrome y a alguien presente para loguearse en ML). Lo único que se sube a un
servidor es la **tienda pública**, como dos servicios separados definidos en `render.yaml`
(backend chico sin Playwright/Claude + frontend estático sin el panel admin) — detalle completo en
[CLAUDE.md → "Deploy"](./CLAUDE.md#deploy).

Pasos con [Render](https://render.com) (tiene free tier permanente):

1. Crear cuenta en Render y conectar el repo de GitHub.
2. "New" → "Blueprint" → elegir este repo → Render detecta `render.yaml` automáticamente.
3. Completar las variables marcadas como secretas en el dashboard (`SUPABASE_URL`, `SUPABASE_KEY`,
   `SUPABASE_SERVICE_KEY` del servicio `kobber-store-api`) — nunca van en el yaml ni en git.
4. Deployar. Si Render tuvo que renombrar algún servicio (nombre ocupado), actualizar a mano el
   rewrite del static site y `ALLOWED_ORIGINS` del backend con las URLs reales (ver nota en
   `render.yaml`).
