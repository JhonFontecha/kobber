import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import init_storage
from http_security import SecurityHeadersMiddleware
from routes import analyzer, auth, catalog, excel, images, products, store
from supabase_auth import require_admin

_admin = [Depends(require_admin)]

_is_prod = os.getenv("KOBBER_ENV", "development") == "production"
_docs = {"docs_url": None, "redoc_url": None, "openapi_url": None} if _is_prod else {}

app = FastAPI(title="Kobber API", version="0.2.0", **_docs)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)


@app.on_event("startup")
def startup():
    init_storage()
    from config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY
    svc = SUPABASE_SERVICE_KEY
    anon = SUPABASE_KEY
    print(f"[kobber] Supabase URL      : {SUPABASE_URL[:40] if SUPABASE_URL else '(vacío)'}")
    print(f"[kobber] SUPABASE_KEY      : {'(set, ' + str(len(anon)) + ' chars)' if anon else '(vacío)'}")
    print(f"[kobber] SUPABASE_SERVICE_KEY: {'(set, ' + str(len(svc)) + ' chars)' if svc else '(VACÍO — usando anon key!)'}")
    active = svc or anon
    print(f"[kobber] Clave activa      : {'service_role' if svc else 'anon (RLS activo!)'}")


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(catalog.router,   prefix="/api/catalog",   tags=["catalog"],  dependencies=_admin)
app.include_router(products.router,  prefix="/api/products",  tags=["products"], dependencies=_admin)
app.include_router(excel.router,     prefix="/api/excel",     tags=["excel"],    dependencies=_admin)
app.include_router(images.router,    prefix="/api/images",    tags=["images"],   dependencies=_admin)
app.include_router(analyzer.router,  prefix="/api/analyzer",  tags=["analyzer"], dependencies=_admin)
app.include_router(store.router,     prefix="/api/store",     tags=["store"])
app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
