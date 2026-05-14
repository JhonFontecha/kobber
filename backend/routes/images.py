"""
Descarga de imágenes desde trupper.com usando el patrón de URLs conocido.

Patrones encontrados:
  {CLAVE}.jpg          → foto principal
  {CLAVE}+FC{N}.jpg   → fotos complementarias
  {CLAVE}+D{N}.jpg    → detalles
  {CLAVE}+EIND{N}.jpg → fotos en uso / empaque

No hace scraping: solo peticiones HEAD para verificar existencia.
"""

import asyncio
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_conn, row_to_dict

router = APIRouter()

BASE_URL = "https://www.truper.com/media/import/imagenes/"
TIMEOUT = 6.0
MAX_VARIANTS = 5  # máximo de variantes a probar por tipo


def _build_candidates(clave: str) -> list[str]:
    """Genera todas las URLs candidatas para un SKU/Clave.

    Normalización confirmada:
      "/" en la clave del catálogo → "-" en la URL  (ej: DP-1/8X4BP → DP-1-8X4BP)

    Patrones confirmados en Trupper:
      {CLAVE}.jpg         → foto principal (siempre)
      {CLAVE}+FC{N}.jpg   → fotos complementarias
      {CLAVE}+D{N}.jpg    → detalle (ej: TEBA-2)
      {CLAVE}+EI{N}.jpg   → en uso, variante corta (ej: FL-10N, JAN-15)
      {CLAVE}+EIND{N}.jpg → en uso industrial (ej: TEBA-2, JAN-15 — puede coexistir con +EI)
    HEAD request filtra automáticamente los que no existen.
    """
    clave = clave.replace("/", "-")
    candidates = [f"{BASE_URL}{clave}.jpg"]
    for n in range(1, MAX_VARIANTS + 1):
        candidates.append(f"{BASE_URL}{clave}+FC{n}.jpg")
        candidates.append(f"{BASE_URL}{clave}+D{n}.jpg")
        candidates.append(f"{BASE_URL}{clave}+EI{n}.jpg")
        candidates.append(f"{BASE_URL}{clave}+EIND{n}.jpg")
    return candidates


async def _check_url(client: httpx.AsyncClient, url: str) -> Optional[str]:
    """Devuelve la URL si existe (HTTP 200/304), None si no."""
    try:
        r = await client.head(url, follow_redirects=True, timeout=TIMEOUT)
        if r.status_code in (200, 304):
            return url
    except Exception:
        pass
    return None


async def _fetch_images_for_sku(sku: str) -> list[str]:
    """Devuelve todas las URLs válidas para un SKU dado."""
    candidates = _build_candidates(sku)
    async with httpx.AsyncClient() as client:
        tasks = [_check_url(client, url) for url in candidates]
        results = await asyncio.gather(*tasks)
    return [url for url in results if url]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/fetch/{product_id}")
async def fetch_images_for_product(product_id: int):
    """Busca las imágenes de un producto en trupper.com usando su SKU."""
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    product = row_to_dict(row)
    sku = product.get("sku")
    if not sku:
        raise HTTPException(status_code=400, detail="El producto no tiene SKU/Clave")

    found = await _fetch_images_for_sku(sku)

    if found:
        import json
        with get_conn() as conn:
            conn.execute(
                "UPDATE products SET imagenes = ?, updated_at = datetime('now') WHERE id = ?",
                (json.dumps(found), product_id),
            )

    return {
        "product_id": product_id,
        "sku": sku,
        "imagenes": found,
        "total": len(found),
    }


class BulkFetchRequest(BaseModel):
    product_ids: Optional[list[int]] = None  # None = todos los que tengan SKU


@router.post("/fetch-bulk")
async def fetch_images_bulk(body: BulkFetchRequest):
    """
    Busca imágenes para múltiples productos (o todos si no se especifican IDs).
    Procesa en lotes de 10 para no saturar trupper.com.
    """
    import json

    with get_conn() as conn:
        if body.product_ids:
            placeholders = ",".join("?" * len(body.product_ids))
            rows = conn.execute(
                f"SELECT id, sku FROM products WHERE id IN ({placeholders}) AND sku IS NOT NULL AND sku != ''",
                body.product_ids,
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, sku FROM products WHERE sku IS NOT NULL AND sku != ''"
            ).fetchall()

    if not rows:
        return {"procesados": 0, "con_imagenes": 0, "resultados": []}

    results = []
    BATCH_SIZE = 10

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]

        async def fetch_one(row):
            found = await _fetch_images_for_sku(row["sku"])
            return {"id": row["id"], "sku": row["sku"], "imagenes": found}

        batch_results = await asyncio.gather(*[fetch_one(r) for r in batch])

        with get_conn() as conn:
            for r in batch_results:
                if r["imagenes"]:
                    conn.execute(
                        "UPDATE products SET imagenes = ?, updated_at = datetime('now') WHERE id = ?",
                        (json.dumps(r["imagenes"]), r["id"]),
                    )

        results.extend(batch_results)

    con_imagenes = sum(1 for r in results if r["imagenes"])
    return {
        "procesados": len(results),
        "con_imagenes": con_imagenes,
        "resultados": results,
    }


@router.get("/preview/{sku}")
async def preview_images(sku: str):
    """
    Previsualiza qué imágenes existen en Trupper para un SKU dado
    sin modificar la base de datos. Útil para verificar antes de guardar.
    """
    found = await _fetch_images_for_sku(sku)
    return {"sku": sku, "imagenes": found, "total": len(found)}
