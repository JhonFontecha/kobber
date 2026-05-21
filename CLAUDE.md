# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Kobber

Internal tool for Truper/Pretul/FIERO hardware catalog management and MercadoLibre Colombia bulk publishing. It extracts product data from PDF catalogs using Claude vision, enriches it with AI-generated descriptions, and produces Excel files in ML's bulk-upload format.

## Running the project

Two servers must run simultaneously:

```bash
# Backend (FastAPI) — from repo root
backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend

# Frontend (Vite + React) — from repo root
npm run dev
```

Frontend at http://localhost:5173 — all `/api/*` calls proxy to `http://localhost:8000`.

## Environment

Copy `backend/.env.example` (or create `backend/.env`) with:

```
ANTHROPIC_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...          # anon key
SUPABASE_SERVICE_KEY=...  # service_role key — required to bypass RLS
```

`config.py` loads `.env` relative to its own file path, so cwd doesn't matter.

## Architecture

### Backend (`backend/`)

FastAPI app in `main.py` with five routers:

| Router | Prefix | Responsibility |
|--------|--------|----------------|
| `catalog.py` | `/api/catalog` | PDF → Claude vision → product extraction; save to Supabase with AI description + background image fetch |
| `products.py` | `/api/products` | CRUD, search by code/Excel, `categoria_ml` backfill, Claude `✨ enhance` endpoint |
| `excel.py` | `/api/excel` | Generate Kobber-format Excel and ML bulk-upload Excel from DB data |
| `images.py` | `/api/images` | Fetch product images from Trupper.com (direct URL + BancoContenidoDigital scraping) |
| `analyzer.py` | `/api/analyzer` | Fill blank ML templates with DB data; detect ML column layout dynamically per sheet |

**Key shared functions:**
- `catalog.get_ml_category(nombre)` — calls ML's `domain_discovery` API to assign `categoria_ml`
- `catalog.enhance_product_data(...)` — calls Claude (Haiku) to generate descriptions in the universal format; `enhance_product_data_safe` never throws
- `database.get_client()` — singleton Supabase client using `service_role` key

### Database (Supabase)

Main tables: `products`, `product_variants`, `product_attributes`, `product_images`.

`products.categoria_ml` stores the ML category name (e.g. `"Mandriles"`) used to route products to the correct sheet in the ML template. Run `POST /api/products/backfill-categoria-ml` after adding the column or importing legacy data.

### ML template column detection

ML Excel files have different column layouts per category. `analyzer._ml_col_map(ws)` scans rows 2–5 and picks the row with the most keyword matches as the header row — this handles both old (headers at row 4) and new (headers at row 3) template formats.

### Frontend (`src/App.jsx`)

Single-file React app (~2300 lines). Key components:

- **FlowTab** — 4-step ML publisher: search products → download templates (Playwright scraper) → upload template → fill with DB data
- **ProductsTab** — search by code/clave or Excel upload; inline edit; `✨ Mejorar` button triggers Claude enhance
- **ImportTab** — PDF upload → SSE streaming extraction → review → save (descriptions are enhanced during extraction, visible before save)
- **ImagesTab** — browse/save Trupper images; "↻ Sincronizar faltantes" fetches images only for products with none
- **AnalyzeTab** — upload blank ML template → `fill-blank-template` fills it using `categoria_ml` from DB

### ML template scraper (`scripts/`)

Playwright scripts to automate ML's bulk-upload page:

1. `ml_login.py` — opens browser for manual login, saves session to `/tmp/ml_session.json`
2. `ml_scrape_template.py` — uses saved session to search categories and download the template; call with `--file /tmp/productos.txt`

Run from repo root using `backend/venv/bin/python3 scripts/<script>.py`.

## Important conventions

- **Fotos separator**: ML requires comma (`,`) between image URLs — not `|`. All Excel generation endpoints use `",".join(urls)`.
- **Gray cells**: In ML templates, cells pre-filled by catalog (products with an MCO code in column A) must not be overwritten — only SKU, stock, and EAN are safe to fill for catalog products.
- **Variant titles**: ML requires the same title for all variants of a product (per the Ayuda sheet).
- **Haiku for batch, Opus for interactive**: `enhance_product_data` during import uses `claude-haiku-4-5-20251001`; the `/enhance` endpoint (manual button) uses `claude-opus-4-7` for higher quality.
