from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_client

router = APIRouter()


# ── Modelos ───────────────────────────────────────────────────────────────────

class ProductUpdate(BaseModel):
    nombre:          Optional[str]       = None
    descripcion:     Optional[str]       = None
    marca:           Optional[str]       = None
    categoria:       Optional[str]       = None
    subcategoria:    Optional[str]       = None
    seccion:         Optional[str]       = None
    caracteristicas: Optional[list[str]] = None
    estado:          Optional[str]       = None


class VariantCreate(BaseModel):
    codigo:              Optional[str]   = None
    clave:               Optional[str]   = None
    descripcion:         Optional[str]   = None
    precio_distribuidor: Optional[float] = None
    nc:                  Optional[int]   = None
    unidades_caja:       Optional[int]   = None
    unidades_master:     Optional[int]   = None
    stock:               Optional[int]   = 0
    estado:              Optional[str]   = "activo"


class VariantUpdate(BaseModel):
    codigo:              Optional[str]   = None
    clave:               Optional[str]   = None
    descripcion:         Optional[str]   = None
    precio_distribuidor: Optional[float] = None
    nc:                  Optional[int]   = None
    unidades_caja:       Optional[int]   = None
    unidades_master:     Optional[int]   = None
    stock:               Optional[int]   = None
    estado:              Optional[str]   = None


# ── Productos ─────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats():
    db = get_client()
    products = db.table("products").select("estado, categoria").execute().data
    total = len(products)

    by_estado: dict = {}
    by_cat: dict = {}
    for p in products:
        e = p.get("estado") or "pendiente"
        by_estado[e] = by_estado.get(e, 0) + 1
        c = p.get("categoria") or "Sin categoría"
        by_cat[c] = by_cat.get(c, 0) + 1

    top_cat = sorted(by_cat.items(), key=lambda x: x[1], reverse=True)[:10]
    return {
        "total": total,
        "por_estado": by_estado,
        "por_categoria": [{"categoria": k, "cantidad": v} for k, v in top_cat],
    }


@router.get("/")
def list_products(estado: Optional[str] = None, categoria: Optional[str] = None):
    db = get_client()
    query = db.table("products").select(
        "*, product_variants(id, clave, codigo, descripcion, precio_distribuidor, stock, estado), "
        "product_images(id, url, orden)"
    )
    if estado:
        query = query.eq("estado", estado)
    if categoria:
        query = query.eq("categoria", categoria)
    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/{product_id}")
def get_product(product_id: str):
    db = get_client()
    result = db.table("products").select(
        "*, product_variants(*, product_attributes(nombre, valor, unidad)), "
        "product_attributes(id, variant_id, nombre, valor, unidad), "
        "product_images(id, url, orden, fuente)"
    ).eq("id", product_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return result.data


@router.patch("/{product_id}")
def update_product(product_id: str, body: ProductUpdate):
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="Nada que actualizar")

    db = get_client()
    result = db.table("products").update(fields).eq("id", product_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return result.data[0]


@router.delete("/{product_id}")
def delete_product(product_id: str):
    db = get_client()
    db.table("products").delete().eq("id", product_id).execute()
    return {"ok": True}


# ── Variantes ─────────────────────────────────────────────────────────────────

@router.post("/{product_id}/variants")
def add_variant(product_id: str, body: VariantCreate):
    db = get_client()
    result = db.table("product_variants").insert({
        "product_id": product_id,
        **body.model_dump(exclude_none=True),
    }).execute()
    return result.data[0]


@router.patch("/variants/{variant_id}")
def update_variant(variant_id: str, body: VariantUpdate):
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="Nada que actualizar")

    db = get_client()
    result = db.table("product_variants").update(fields).eq("id", variant_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Variante no encontrada")
    return result.data[0]


@router.delete("/variants/{variant_id}")
def delete_variant(variant_id: str):
    db = get_client()
    db.table("product_variants").delete().eq("id", variant_id).execute()
    return {"ok": True}
