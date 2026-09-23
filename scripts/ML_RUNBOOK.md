# Runbook — Publicador ML (Chrome persistente + scraper)

Guía operativa para el flujo de publicación masiva a MercadoLibre. Léela antes de
diagnosticar cualquier problema con "Verificar", "Agregar categorías en ML", o
los scripts `ml_*.py` — sobre todo en una máquina donde no se corrió antes.

## Cómo funciona (resumen)

- `scripts/ml_chrome.py::ensure_kobber_chrome()` lanza Google Chrome real como
  **proceso del sistema operativo** (no vía Playwright) con un perfil propio en
  `/tmp/ml_chrome_profile` y depuración remota en `http://localhost:9223`.
- Se lanza aparte de Playwright a propósito: Playwright mata cualquier browser
  que él mismo lanza en cuanto su conexión se cierra, así que si lo lanzáramos
  con `playwright.launch()` no sobreviviría entre corridas de `ml_login.py` y
  `ml_scrape_template.py`. Lanzándolo como proceso de sistema, la misma ventana
  se reutiliza — cada script solo se conecta por CDP y abre una pestaña nueva.
- No se puede usar el Chrome normal del usuario: Chrome bloquea
  `--remote-debugging-port` en el perfil por defecto (protección contra
  secuestro de sesión vía CDP). Por eso el perfil de `/tmp/ml_chrome_profile`
  es propio de Kobber, separado del Chrome de uso diario.
- Se usa Chrome real (no el Chromium de pruebas que trae Playwright) porque ML
  detecta ese Chromium como navegador automatizado y bloquea el login
  ("Alcanzaste el límite de intentos").
- Toda esta infraestructura es **local a cada máquina** — `/tmp/ml_chrome_profile`
  y la sesión de ML que contiene no se comparten entre Macs ni se suben a git.

## Primera vez en una máquina nueva

1. Confirmar que Google Chrome está instalado (`/Applications/Google Chrome.app`
   o `~/Applications/Google Chrome.app` — son las únicas rutas que
   `ml_chrome.py` busca). Si no está, instalarlo desde google.com/chrome.
2. Loguearse en ML de una de estas dos formas (misma sesión, mismo perfil):
   - **Desde el panel** (sin terminal): paso 2 del publicador, botón
     "🔑 Iniciar sesión ML" — sale solo cuando "↻ Verificar" muestra sin
     sesión. Llama a `POST /api/analyzer/ml-login`, que asegura el Chrome de
     Kobber y abre una pestaña ahí para loguearse a mano.
   - **Por terminal**: `backend/venv/bin/python3 scripts/ml_login.py` — mismo
     efecto, útil si el backend no está corriendo o para debug.
3. Verificar en el publicador (paso 2, botón "↻ Verificar") que muestre sesión
   activa.

## Checklist quick-diagnóstico

**"Verificar" muestra sin sesión (`no_session`) en una máquina donde ya se logueó antes:**
- Confirmar que el backend de ESA máquina está corriendo (`/ml-session-status`
  no lanza Chrome, solo intenta conectarse — si Chrome no está corriendo ahí,
  reporta `no_session` sin más detalle). Correr `ml_login.py` para relanzarlo.
- Puerto 9223 ocupado por otra cosa: `lsof -nP -iTCP:9223 -sTCP:LISTEN`.

**`ml_login.py` o el scraper truena con "No se encontró Google Chrome instalado":**
- Chrome no está en ninguna de las rutas que `ml_chrome.py::_CHROME_BIN_CANDIDATES`
  conoce. Instalarlo, o si está en una ruta no estándar, agregarla a esa lista.

**El scraper agrega la categoría equivocada (ej. una de cocina/hogar para un producto de ferretería):**
- Ver `TOP_LEVEL_EXCLUIDOS` y el orden de matching (`domain_name` antes que
  `category_name`, exacto antes que substring) en
  `ml_scrape_template.py::buscar_y_agregar`. Si el caso no lo resuelve,
  agregar el producto a `CATEGORY_OVERRIDES`.

**Un cambio de código no se refleja al probar (frontend o backend):**
- Casi siempre es un proceso viejo de `npm run dev` o `uvicorn --reload`
  compitiendo por el mismo puerto desde una sesión anterior. Ver la sección
  "Antes de reportar algo raro" en el README de la raíz del repo.

**Antes de tocar el matching o el manejo de Chrome:** releer las notas de
"Problemas conocidos" en `CLAUDE.md` — documentan restricciones ya
confirmadas empíricamente (bloqueo de CDP en perfil default, Playwright
matando su propio browser) para no volver a intentarlas.
