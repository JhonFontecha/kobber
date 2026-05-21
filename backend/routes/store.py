"""
API para la tienda pública — lee productos de la BD con precio de venta aplicado.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException
from database import get_client

router = APIRouter()

_SELECT = (
    "id, nombre, descripcion, marca, categoria, categoria_ml, caracteristicas, estado, "
    "product_attributes(nombre, valor, unidad, variant_id), "
    "product_variants(id, clave, codigo, descripcion, precio_distribuidor, nc, stock, unidades_caja, estado), "
    "product_images(url, orden)"
)


def _serialize(p: dict, margen: float) -> dict | None:
    variantes = [v for v in (p.get("product_variants") or []) if v.get("estado") != "inactivo"]
    if not variantes:
        return None

    precio_base = next((v["precio_distribuidor"] for v in variantes if v.get("precio_distribuidor")), None)
    if precio_base is None:
        return None

    fotos = sorted(p.get("product_images") or [], key=lambda x: x.get("orden", 0))
    atributos_familia = [a for a in (p.get("product_attributes") or []) if not a.get("variant_id")]

    return {
        "id":              p["id"],
        "nombre":          p["nombre"],
        "descripcion":     p.get("descripcion"),
        "marca":           p.get("marca"),
        "categoria":       p.get("categoria"),
        "categoria_ml":    p.get("categoria_ml"),
        "caracteristicas": p.get("caracteristicas") or [],
        "atributos":       atributos_familia,
        "variantes": [
            {
                **v,
                "precio_venta": round(v["precio_distribuidor"] * (1 + margen / 100))
                                if v.get("precio_distribuidor") else None,
            }
            for v in variantes
        ],
        "imagenes":     [f["url"] for f in fotos],
        "precio":       round(precio_base * (1 + margen / 100)),
        "precio_dist":  precio_base,
        "stock_total":  sum(v.get("stock") or 0 for v in variantes),
    }


@router.get("/productos")
def list_productos(
    q:          Optional[str]   = None,
    categoria:  Optional[str]   = None,
    marca:      Optional[str]   = None,
    min_price:  Optional[float] = None,
    max_price:  Optional[float] = None,
    solo_stock: bool            = False,
    margen:     float           = 30,
):
    db = get_client()
    query = db.table("products").select(_SELECT).neq("estado", "descartado").order("nombre")
    if categoria:
        query = query.eq("categoria_ml", categoria)
    if marca:
        query = query.eq("marca", marca)

    rows = query.execute().data
    result = []

    for p in rows:
        item = _serialize(p, margen)
        if not item:
            continue

        if q:
            q_l = q.lower()
            searchable = " ".join([
                p.get("nombre", ""), p.get("marca", ""),
                p.get("categoria", ""), p.get("descripcion", "") or "",
                " ".join(v.get("clave", "") for v in (p.get("product_variants") or []))
            ]).lower()
            if q_l not in searchable:
                continue

        if min_price and item["precio"] < min_price:
            continue
        if max_price and item["precio"] > max_price:
            continue
        if solo_stock and item["stock_total"] == 0:
            continue

        result.append(item)

    # Categorías y marcas disponibles para filtros
    categorias = sorted({r["categoria_ml"] for r in rows if r.get("categoria_ml")})
    marcas     = sorted({r["marca"] for r in rows if r.get("marca")})

    return {"productos": result, "total": len(result), "categorias": categorias, "marcas": marcas}


@router.get("/productos/{product_id}")
def get_producto(product_id: str, margen: float = 30):
    db = get_client()
    rows = db.table("products").select(_SELECT).eq("id", product_id).execute().data
    if not rows:
        raise HTTPException(404, "Producto no encontrado")
    item = _serialize(rows[0], margen)
    if not item:
        raise HTTPException(404, "Producto sin variantes activas")
    return item
