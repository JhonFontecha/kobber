from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import database
from routes import catalog, products, excel, images

app = FastAPI(title="Kobber API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    database.init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(catalog.router,  prefix="/api/catalog",  tags=["catalog"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(excel.router,    prefix="/api/excel",    tags=["excel"])
app.include_router(images.router,   prefix="/api/images",   tags=["images"])
