# Kobber

Herramienta interna para gestión de catálogo de herramientas Truper/Pretul/FIERO y publicación
masiva en MercadoLibre Colombia, más una tienda pública de cara al cliente. Ver **[CLAUDE.md](./CLAUDE.md)**
para arquitectura completa, rutas de API, esquema de base de datos y convenciones — este archivo
es sólo la guía para dejarlo corriendo desde cero.

## Requisitos previos

- **Python 3.14** (o compatible) con `venv`
- **Node.js 18+** y npm 9+
- Una **API key de Anthropic** ([console.anthropic.com](https://console.anthropic.com))
- Un **proyecto de Supabase** (Postgres + Storage) ya creado, con la URL y las keys a mano
- **Google Chrome** instalado (necesario para el publicador ML y los scripts de `scripts/ml_*.py`) —
  Playwright usa el Chrome del sistema directamente en vez de descargar su propio Chromium, porque
  en macOS 13 (Ventura) `playwright install chromium` falla por falta de soporte de esa versión de
  Playwright a ese OS. No hace falta correr `playwright install`.

## Puesta en marcha desde cero (clonar en una Mac nueva)

### 1. Backend

```bash
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
```

Si falla instalando Pillow (error compilando por falta de headers de jpeg), no es bloqueante —
correr `venv/bin/pip install pillow` suelto instala una versión más nueva que sí trae wheel
precompilado para macOS/Python 3.14.

Copiar `backend/.env.example` a `backend/.env` y completar las 4 variables (API key de Anthropic +
las 3 de Supabase). `config.py` carga el `.env` relativo a su propia ubicación, así que no importa
desde qué carpeta corras los comandos.

### 2. Frontend

```bash
# desde la raíz del repo
npm install
```

### 3. Sesión de MercadoLibre (para publicar/renovar plantillas)

`playwright` ya se instaló con `requirements.txt` — sólo falta crear la sesión guardada corriendo
esto una vez (abre un Chrome real para que te loguees a mano):

```bash
backend/venv/bin/python3 scripts/ml_login.py
```

La sesión expira cada tanto — cuando eso pase, correr el mismo comando de nuevo (o usar el botón
correspondiente en el panel admin, que hace lo mismo desde el backend).

## Correr en desarrollo

Dos servidores en simultáneo, cada uno en su propia terminal:

```bash
# Backend — desde la raíz del repo
backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend

# Frontend — desde la raíz del repo
npm run dev
```

Abrir http://localhost:5173 — tienda pública en `/`, panel admin en `/admin`. Las llamadas `/api/*`
se proxean automáticamente a `localhost:8000`.

## Antes de reportar algo raro: revisar procesos huérfanos

Si dejaste un `npm run dev` o `uvicorn --reload` corriendo de una sesión de terminal anterior (o de
una sesión de Claude Code anterior) y arrancás uno nuevo, es fácil terminar con **dos procesos**
compitiendo por el mismo puerto — el viejo sirviendo código desactualizado sin que se note (los
health checks básicos responden igual). Esto ya costó una sesión entera de debugging confuso
(2026-08-12: cambios en `App.jsx` que no se reflejaban en el navegador porque un Vite viejo de
horas atrás seguía escuchando en el 5173).

Si algo no refleja un cambio que sabés que hiciste:

```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN   # frontend
lsof -nP -iTCP:8000 -sTCP:LISTEN   # backend
ps -o pid,lstart,command -p <PID>  # ver hace cuánto arrancó ese proceso
```

Si el proceso es mucho más viejo que la sesión actual, matarlo (`kill <PID>`) y volver a arrancar
limpio antes de seguir investigando el código.

## Build para producción

```bash
npm run build
```

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
