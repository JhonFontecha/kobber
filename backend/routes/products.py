import json
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_conn, row_to_dict

router = APIRouter()


class ProductCreate(BaseModel):
    nombre: str
    sku: Optional[str] = None
    descripcion: Optional[str] = None
    variantes: Optional[list] = []
    precio_distribuidor: Optional[float] = None
    precio_mc: Optional[float] = None
    unidades_caja: Optional[int] = None
    categoria: Optional[str] = None
    margen: Optional[float] = 0
    imagenes: Optional[list] = []
    pagina_catalogo: Optional[int] = None
    estado: Optional[str] = "pendiente"


class ProductUpdate(BaseModel):
    nombre: Optional[str] = None
    sku: Optional[str] = None
    descripcion: Optional[str] = None
    variantes: Optional[list] = None
    precio_distribuidor: Optional[float] = None
    precio_mc: Optional[float] = None
    unidades_caja: Optional[int] = None
    categoria: Optional[str] = None
    margen: Optional[float] = None
    imagenes: Optional[list] = None
    estado: Optional[str] = None


class BulkSave(BaseModel):
    productos: list[ProductCreate]


@router.get("/")
def list_products(estado: Optional[str] = None, categoria: Optional[str] = None):
    with get_conn() as conn:
        query = "SELECT * FROM products WHERE 1=1"
        params = []
        if estado:
            query += " AND estado = ?"
            params.append(estado)
        if categoria:
            query += " AND categoria = ?"
            params.append(categoria)
        query += " ORDER BY created_at DESC"
        rows = conn.execute(query, params).fetchall()
    return [row_to_dict(r) for r in rows]


@router.get("/stats")
def get_stats():
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        by_estado = conn.execute(
            "SELECT estado, COUNT(*) as cnt FROM products GROUP BY estado"
        ).fetchall()
        by_cat = conn.execute(
            "SELECT categoria, COUNT(*) as cnt FROM products GROUP BY categoria ORDER BY cnt DESC LIMIT 10"
        ).fetchall()
    return {
        "total": total,
        "por_estado": {r["estado"]: r["cnt"] for r in by_estado},
        "por_categoria": [{"categoria": r["categoria"], "cantidad": r["cnt"]} for r in by_cat],
    }


@router.get("/{product_id}")
def get_product(product_id: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return row_to_dict(row)


@router.post("/")
def create_product(product: ProductCreate):
    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO products
               (nombre, sku, descripcion, variantes, precio_distribuidor, precio_mc,
                unidades_caja, categoria, margen, imagenes, pagina_catalogo, estado)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                product.nombre,
                product.sku,
                product.descripcion,
                json.dumps(product.variantes or []),
                product.precio_distribuidor,
                product.precio_mc,
                product.unidades_caja,
                product.categoria,
                product.margen or 0,
                json.dumps(product.imagenes or []),
                product.pagina_catalogo,
                product.estado or "pendiente",
            ),
        )
        product_id = cur.lastrowid
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    return row_to_dict(row)


@router.post("/bulk")
def bulk_save(body: BulkSave):
    saved = []
    with get_conn() as conn:
        for p in body.productos:
            cur = conn.execute(
                """INSERT INTO products
                   (nombre, sku, descripcion, variantes, precio_distribuidor, precio_mc,
                    unidades_caja, categoria, margen, imagenes, pagina_catalogo, estado)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    p.nombre,
                    p.sku,
                    p.descripcion,
                    json.dumps(p.variantes or []),
                    p.precio_distribuidor,
                    p.precio_mc,
                    p.unidades_caja,
                    p.categoria,
                    p.margen or 0,
                    json.dumps(p.imagenes or []),
                    p.pagina_catalogo,
                    p.estado or "pendiente",
                ),
            )
            saved.append(cur.lastrowid)
    return {"guardados": len(saved), "ids": saved}


@router.patch("/{product_id}")
def update_product(product_id: int, product: ProductUpdate):
    fields = product.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="Nada que actualizar")

    for key in ("variantes", "imagenes"):
        if key in fields and isinstance(fields[key], list):
            fields[key] = json.dumps(fields[key])

    fields["updated_at"] = "datetime('now')"
    set_clause = ", ".join(
        f"{k} = datetime('now')" if v == "datetime('now')" else f"{k} = ?"
        for k, v in fields.items()
    )
    values = [v for v in fields.values() if v != "datetime('now')"]
    values.append(product_id)

    with get_conn() as conn:
        conn.execute(
            f"UPDATE products SET {set_clause} WHERE id = ?", values
        )
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return row_to_dict(row)


@router.delete("/{product_id}")
def delete_product(product_id: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    return {"ok": True}
