"""
Backend público — sólo la tienda (src/tienda/). Pensado para deployar en un servidor real,
separado del backend completo (main.py) que sigue corriendo local en la Mac del Publicador.

No monta catalog/analyzer/images/products/excel — evita cargar ANTHROPIC_API_KEY y evita
cualquier dependencia de Playwright/Chrome, que no tienen sentido en un servidor headless.
Ver CLAUDE.md → "Deploy" para el detalle de por qué existen dos entry points.
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import store

app = FastAPI(title="Kobber Store API", version="0.1.0")

# Orígenes permitidos separados por coma en la env var ALLOWED_ORIGINS (configurar en Render
# una vez se conozca la URL real del static site) — localhost siempre permitido para poder
# probar el frontend local contra este backend público.
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
allow_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(store.router, prefix="/api/store", tags=["store"])
