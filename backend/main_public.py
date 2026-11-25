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

from http_security import SecurityHeadersMiddleware
from routes import auth, store

# En el servidor público los docs de OpenAPI quedan apagados. Para verlos en local:
# KOBBER_ENV=development.
_is_dev = os.getenv("KOBBER_ENV", "production") == "development"
_docs = {} if _is_dev else {"docs_url": None, "redoc_url": None, "openapi_url": None}

app = FastAPI(title="Kobber Store API", version="0.2.0", **_docs)

# Orígenes separados por coma en ALLOWED_ORIGINS. Nunca "*": va con credenciales.
_default_origins = "https://kobber-tienda.onrender.com,http://localhost:5173,http://127.0.0.1:5173"
allow_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.add_middleware(SecurityHeadersMiddleware)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(store.router, prefix="/api/store", tags=["store"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
