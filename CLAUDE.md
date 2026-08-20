# CLAUDE.md

Esta es la documentación canónica del proyecto para IA (Claude Code u otra). Se sincroniza vía git,
así que está disponible en cualquier Mac donde se clone el repo. **Objetivo: que una sesión nueva de
IA pueda trabajar en Kobber sin releer todo el código fuente.**

Para dejar el proyecto corriendo desde cero (instalación, `.env`, primer arranque) ver
**[README.md](./README.md)** — este archivo asume que el entorno ya funciona y se enfoca en
arquitectura y convenciones.

> **Política de mantenimiento:** cualquier cambio que se suba (commit/push) que afecte arquitectura,
> rutas de API, esquema de base de datos, convenciones o flujo de trabajo **debe** actualizar este
> archivo en el mismo cambio. Si no estás seguro de si un cambio amerita actualizar la doc, actualízala
> igual — es más barato que quede desactualizada una sección de más que una de menos.

## Qué es Kobber

Herramienta interna para gestión de catálogo de herramientas Truper/Pretul/FIERO y publicación masiva
en MercadoLibre Colombia. El repo contiene **dos aplicaciones frontend distintas** montadas en el mismo
proyecto Vite:

1. **Panel admin** (`src/App.jsx`, ruta `/admin/*`) — herramienta interna: extrae productos de PDFs de
   catálogo con Claude Vision, los enriquece con descripciones IA, genera Excels para subir a ML.
2. **Tienda pública** (`src/tienda/`, rutas `/tienda/*` y `/*`) — e-commerce de cara al cliente final que
   lee del mismo backend/BD, con carrito, checkout y contacto por WhatsApp.

Ver `src/main.jsx` para el ruteo: `/admin/*` → `App`, todo lo demás → `StorePage` (tienda pública).

## Corriendo el proyecto

Dos servidores en simultáneo:

```bash
# Backend (FastAPI) — desde la raíz del repo
backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend

# Frontend (Vite + React) — desde la raíz del repo
npm run dev
```

Frontend en http://localhost:5173 (tienda pública en `/`, panel admin en `/admin`) — todas las llamadas
`/api/*` se proxean a `http://localhost:8000` (ver `vite.config.js`).

Backend health check: `GET /health` → `{"status": "ok"}`. Al arrancar imprime en consola si está usando
la `service_role` key de Supabase o la `anon` (con RLS activo) — revisar esto si algo falla con permisos.

### ⚠️ Antes de debuggear algo raro: descartar procesos huérfanos

Si un cambio en el código **no se refleja** en el navegador o en las respuestas del backend aunque
el archivo esté guardado correctamente — **antes de sospechar del código**, verificar que no haya
un servidor de desarrollo viejo (de una sesión de terminal o de Claude Code anterior) todavía
escuchando en el puerto y sirviendo código desactualizado en silencio:

```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN   # frontend
lsof -nP -iTCP:8000 -sTCP:LISTEN   # backend
ps -o pid,lstart,command -p <PID>  # confirmar si es más viejo que la sesión actual
```

Si aparece un proceso mucho más viejo que la sesión actual, matarlo y arrancar uno limpio. Esto
pasó de verdad el 2026-08-12 y costó una sesión entera de debugging confuso persiguiendo un bug de
React que en realidad no existía — el navegador estaba hablando con un Vite huérfano de horas antes.

## Entorno

`backend/.env` (no versionado, cada Mac lo mantiene local):

```
ANTHROPIC_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...          # anon key
SUPABASE_SERVICE_KEY=...  # service_role key — requerida para bypassear RLS
STORAGE_PATH=./storage    # legado de la era SQLite, ya casi no se usa
```

`config.py` carga `.env` relativo a su propia ubicación, así que el cwd no importa.

## Arquitectura

### Backend (`backend/`)

FastAPI (`main.py`), seis routers:

| Router | Prefix | Responsabilidad |
|--------|--------|----------------|
| `catalog.py` | `/api/catalog` | PDF → Claude Vision → extracción de productos; guarda en Supabase con descripción IA + fetch de imágenes en background |
| `products.py` | `/api/products` | CRUD de productos/variantes, búsqueda por código/Excel, backfill de `categoria_ml`, endpoint `✨ enhance` con Claude |
| `excel.py` | `/api/excel` | Genera Excel formato Kobber y Excel de carga masiva ML a partir de datos de la BD |
| `images.py` | `/api/images` | Trae imágenes de producto desde Truper.com (URL directa + scraping de BancoContenidoDigital) |
| `analyzer.py` | `/api/analyzer` | Llena plantillas ML en blanco con datos de la BD; detecta layout de columnas ML dinámicamente por hoja; automatiza login/scraping de ML vía Playwright |
| `store.py` | `/api/store` | Lee productos con precio de venta calculado (margen aplicado) para la tienda pública — **es lo que consume el frontend de tienda** |

**Funciones compartidas clave:**
- `catalog.get_ml_category(nombre)` — llama la API `domain_discovery` de ML para asignar `categoria_ml`
- `catalog.enhance_product_data(...)` — llama Claude (Haiku) para generar descripciones en formato universal; `enhance_product_data_safe` nunca lanza excepción
- `database.get_client()` — cliente Supabase singleton, usa `service_role` key si está seteada (si no, cae a `anon` y queda sujeto a RLS)

Los endpoints `GET /api/products/tienda` y `GET /api/products/tienda/{id}` que duplicaban la lógica
de `store.py` fueron eliminados de `products.py` (agosto 2026) — sin consumidor, el frontend siempre
llamó sólo a `/api/store/productos`.

### Base de datos (Supabase — Postgres + Storage)

Tablas principales: `products`, `product_variants`, `product_attributes`, `product_images`.

- `products.categoria_ml` guarda el nombre de categoría ML (ej. `"Mandriles"`), usado para rutear
  productos a la hoja correcta de la plantilla ML. Correr `POST /api/products/backfill-categoria-ml`
  después de agregar la columna o importar datos legado.
- `product_variants.precio_distribuidor` es el precio base (costo); el precio de venta se calcula
  al vuelo aplicando un margen (`precio_venta = precio_distribuidor * (1 + margen/100)`), nunca se
  persiste el precio de venta.
- `product_attributes` puede ser a nivel de familia de producto (`variant_id` nulo) o por variante.
- Imágenes y archivos ya no viven en `backend/storage/` local — todo vive en Supabase Storage (migrado
  desde SQLite + filesystem en mayo 2026).

### Títulos sugeridos por variante (editables)

`product_variants.titulos_sugeridos` guarda un array de ~4 títulos alternativos por variante,
generados por Claude junto con la descripción (`catalog.enhance_product_data`, prompt
`ENHANCE_PROMPT` — sección "TITULOS PARA MERCADOLIBRE COLOMBIA"). El prompt traduce términos del
catálogo fuente (español mexicano) a terminología colombiana de ferretería e imita el patrón de
títulos reales de ML (palabra clave genérica primero, marca, diferenciador técnico, sin relleno).

- Se generan automáticamente durante el import de PDF y también con el botón manual `✨ Mejorar`
  (ambos flujos llaman a `catalog.enhance_product_data`/`enhance_product_data_safe`, mismo prompt).
- Son **editables** en la UI en ambos lugares (componente compartido `EditableTitulos` en
  `App.jsx`): se puede modificar el texto, borrar un título o agregar uno nuevo por variante.
- El guardado real pasa por `POST /api/products/{id}/apply-enhance`, que ahora acepta
  `titulos_por_variante` en el body y actualiza `product_variants.titulos_sugeridos` por `clave`
  (`products.py`). En el import, se persisten directamente vía `_save_to_supabase` con lo que venga
  en el payload — no hay paso de "aplicar" separado.
- `products.enhance_product` (el endpoint del botón manual) usa `enhance_product_data_safe`
  (con reintento) — **no** la versión sin retry — para evitar respuestas sin títulos.
- Usados al llenar plantillas ML: `analyzer.py` genera una fila por cada título sugerido de la
  variante (o un título genérico `nombre + marca` si no hay ninguno guardado).

### Detección de columnas de plantilla ML

Los Excel de ML tienen layouts de columna distintos por categoría. `analyzer._ml_col_map(ws)` escanea
las filas 2–5 y elige la fila con más coincidencias de keywords como header — soporta formatos viejos
(headers en fila 4) y nuevos (headers en fila 3).

### Inferencia de atributos con Claude en `fill-blank-template`

`analyzer._fill_attrs_claude` completa columnas de atributos vacías con Claude (Haiku) para las filas
que `fill-blank-template` acaba de escribir. Detalles no obvios:

- `analyzer._extract_dropdown_options(ml_bytes, sheet_name)` parsea el XML crudo del `.xlsx` (openpyxl
  no soporta la extensión `x14:dataValidation` que usa ML) para sacar las listas desplegables reales
  de cada columna, referenciadas en la hoja oculta `"extra info"`. Esas opciones se pasan a Claude en
  el prompt y la respuesta se valida contra ellas — si Claude devuelve un valor que no está en la
  lista, se descarta en vez de escribirse (ML rechaza filas con valores de dropdown inválidos).
- `analyzer._coerce_numero` convierte valores puramente numéricos a `int`/`float` antes de escribirlos
  — columnas como Largo o Cantidad son de tipo decimal/entero en ML y pueden rechazar strings.
- `analyzer._limpiar_filas` vacía explícitamente las filas separadoras entre variantes y todo lo que
  queda después del último producto de cada hoja — la plantilla en blanco de ML trae valores
  "fantasma" (ej. `"Nuevo"`, `"Escribe o elige un valor"`) precargados en filas de datos vacías, no
  alcanza con no escribir nada encima.
- `analyzer._detectar_formato_venta` decide `"Unidad"` vs `"Pack"` por el nombre del producto (keywords
  tipo kit/set/combo, o una cantidad >1 explícita) — ver docstring para el caso borde de productos por
  peso/granel que no son Pack aunque tengan muchas piezas físicas.
- La columna `"Código universal de producto"` se deja siempre vacía — no existe EAN/UPC/GTIN real
  cargado en la BD y cualquier valor no-código (incluyendo el viejo `"Otra razón"`) hace que ML
  rechace la fila entera.

### Frontend — Panel admin (`src/App.jsx`, ~2770 líneas, componente único)

Componentes/tabs principales (todo en un solo archivo):

- **FlowTab** — publicador ML en 4 pasos: buscar productos → descargar plantillas (scraper Playwright) → subir plantilla → llenar con datos de BD
- **ProductsTab** — búsqueda por código/clave o carga de Excel; edición inline; botón `✨ Mejorar` dispara enhance de Claude, incluidos los títulos sugeridos por variante (editables, ver abajo)
- **ImportTab** — subida de PDF → extracción streaming (SSE) → revisión → guardar (las descripciones y títulos sugeridos se generan durante la extracción, editables antes de guardar)
- **ImagesTab** — explorar/guardar imágenes de Truper; "↻ Sincronizar faltantes" trae imágenes sólo para productos sin ninguna
- **AnalyzeTab** — subir plantilla ML en blanco → `fill-blank-template` la llena usando `categoria_ml` de la BD

### Frontend — Tienda pública (`src/tienda/`)

E-commerce con React Router + Zustand:

- `StorePage.jsx` — shell con rutas anidadas: `/` (Home), `/catalogo`, `/ofertas`, `/login`, `/checkout`, `/producto/:id`
- `store/cartStore.js` — carrito global con Zustand + persistencia en localStorage (`kobber-cart`); selectores `selectTotal`/`selectCount`
- `hooks/useStoreProducts.js` — hook de fetch a `/api/store/productos` con filtros (búsqueda, categoría, marca, precio, stock, margen)
- `components/` — `Header`, `Footer`, `CartDrawer`, `ProductCard`, `ProductQuickModal`, `SplashScreen`, `WhatsAppFloat` (botón flotante de contacto)
- `pages/LoginPage.jsx` — **login con credenciales hardcodeadas** (`admin@kobber.com` / `1234`) que redirige a `/admin`; no es autenticación real, es un gate simbólico al panel admin. No usar como base de seguridad.
- `pages/CheckoutPage.jsx` — flujo de checkout

Diseño: Tailwind con paleta custom "graphite" (ver `tailwind.config.js`), estilo consistente entre tienda y (parcialmente) panel admin.

### Scripts de automatización ML (`scripts/`)

Scripts Playwright que automatizan la carga masiva de ML (corren fuera del backend, invocados manualmente):

1. `ml_login.py` — abre browser para login manual, guarda sesión en `/tmp/ml_session.json`
2. `ml_scrape_template.py` — usa la sesión guardada para buscar categorías y descargar la plantilla; `--file /tmp/productos.txt` o lista de productos como args. Tiene `CATEGORY_OVERRIDES` y `SIN_CATEGORIA_ML` hardcodeados para casos donde la clasificación automática de ML falla.
3. `ml_inspect.py` — utilidad de debug para inspeccionar selectores de la página de ML

Correr desde la raíz del repo: `backend/venv/bin/python3 scripts/<script>.py`.

## Deploy

El proyecto se corre en **dos lugares distintos a propósito**, no es un descuido:

- **Mac de la empresa (local, siempre)** — el Publicador completo: `main.py` con los 6 routers,
  Playwright/Chrome para login y scraping de ML, `ANTHROPIC_API_KEY` para Claude Vision/Haiku.
  Necesita una persona presente para el login interactivo de ML (ver "Problemas conocidos" más
  abajo) — por eso no tiene sentido moverlo a un servidor.
- **Servidor (Render, `render.yaml`)** — sólo la tienda pública. Dos servicios separados:
  - `backend/main_public.py` — mismo `store.py` de siempre, pero **sin** `catalog`/`analyzer`/
    `images`/`products`/`excel`. No carga `ANTHROPIC_API_KEY` ni toca Playwright — no tiene sentido
    en un servidor headless (sin pantalla para el login de ML).
  - Build estático del frontend con `VITE_PUBLIC_ONLY=true`, que hace que `src/main.jsx` ni
    registre la ruta `/admin/*` (y por `React.lazy`, ni siquiera baja el bundle de `App.jsx`,
    ~2900 líneas, a los visitantes de la tienda).

Los dos backends comparten la misma base de Supabase (`SUPABASE_URL`/keys) — no hay sincronización
de datos entre "local" y "servidor", es la misma BD vista desde dos procesos distintos.

**Deploy con el Blueprint:** `render.yaml` en la raíz define ambos servicios de Render. Los nombres
de servicio (`kobber-store-api`, `kobber-tienda`) determinan la URL — si Render los renombra por
estar ocupados, hay que actualizar a mano el rewrite `/api/*` del static site (apunta a la URL del
backend) y `ALLOWED_ORIGINS` del backend (debe incluir la URL del static site). Las credenciales de
Supabase se cargan en el dashboard de Render, nunca en `render.yaml` ni en git.

## Convenciones importantes

- **Separador de fotos**: ML requiere coma (`,`) entre URLs de imagen — no `|`. Todos los endpoints de generación de Excel usan `",".join(urls)`.
- **Celdas grises**: en plantillas ML, las celdas pre-llenadas por catálogo (productos con código MCO en columna A) no deben sobreescribirse — sólo SKU, stock y EAN son seguros de llenar para productos de catálogo.
- **Títulos de variante**: ML requiere el mismo título para todas las variantes de un producto (según la hoja Ayuda).
- **Un solo modelo para descripción+títulos**: `enhance_product_data` (usado tanto en el import como en el botón manual `✨ Mejorar`) usa `claude-haiku-4-5-20251001` — revisar el modelo exacto en `catalog.py` porque cambia con el tiempo. No hay actualmente una ruta que use Opus.
- **Precio de venta nunca se persiste**: siempre se calcula desde `precio_distribuidor` + margen al momento de leer, tanto en `products.py` como en `store.py`.
- **Ortografía de marca**: la marca se escribe `"Truper"` (una sola P) — no `"Trupper"`. Aparece así en prompts (extracción, enhance), exports de Excel y el dominio de imágenes (`truper.com`). El PDF fuente puede tener la marca mal escrita o ambigua; el prompt de extracción exige copiar la marca EXACTAMENTE como aparece impresa en cada página, sin asumir ni heredar de otra página.
- **Cuotas**: el campo "Cuotas" en las plantillas/exports ML siempre se llena con `"Cuotas extra"`, nunca `"Cuotas"` a secas — regla de negocio fija, no queda a criterio de Claude (`analyzer.py` → `fill_blank_template`, `excel.py` → `generate_ml_excel`).
- **Pulgadas**: el número va pegado al símbolo `"`, sin espacio (`9"`, `8"`, `3"`, `1/2"` — nunca `9 "`). Aplica en cualquier punto donde Claude genera o normaliza texto de producto: `catalog.py` → `EXTRACTION_PROMPT` (nombre/descripción al capturar del catálogo) y `ENHANCE_PROMPT` (descripción y títulos sugeridos).

## Problemas conocidos / deuda técnica

- Login de tienda (`LoginPage.jsx`) no es autenticación real — credenciales hardcodeadas en el frontend, visibles en el bundle. No usar para proteger nada sensible sin reemplazarlo primero.
- `requirements.txt` pinea `Pillow==11.1.0` pero en la práctica se instala una versión más nueva porque la vieja falla al compilar desde fuente en Python 3.14/macOS (faltan headers de jpeg) — no es bloqueante, pero el pin está desactualizado.
- `playwright` está en `requirements.txt`. En macOS 13 (Ventura) `playwright install chromium` **falla** —
  Playwright dejó de dar soporte a Chromium en ese OS — por eso todos los `chromium.launch(...)` del
  proyecto (`analyzer.py` x2, `scripts/ml_login.py`, `ml_scrape_template.py`, `ml_inspect.py`) pasan
  `channel="chrome"` para usar el Google Chrome del sistema en vez del binario propio de Playwright.
  Requiere tener Chrome instalado — si no está, instalarlo desde google.com/chrome, no correr
  `playwright install`.
- El servidor de búsqueda pública de ML (`api.mercadolibre.com/sites/MCO/search` y `/products/search`) ahora devuelve 403 (`PolicyAgent`, firewall anti-bot) para requests sin sesión — incluso navegando con un browser real headless. Sólo `domain_discovery` (usado por `get_ml_category`) sigue público. Cualquier feature que necesite traer resultados de búsqueda reales de ML requiere sesión logueada vía Playwright (`ml_login.py`) o una app OAuth propia registrada en developers.mercadolibre.com — no hay atajo sin eso.
