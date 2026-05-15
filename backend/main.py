from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import init_storage
from routes import catalog, products, excel, images

app = FastAPI(title="Kobber API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


app.include_router(catalog.router,  prefix="/api/catalog",  tags=["catalog"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(excel.router,    prefix="/api/excel",    tags=["excel"])
app.include_router(images.router,   prefix="/api/images",   tags=["images"])
