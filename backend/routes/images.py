"""
Descarga de imágenes desde trupper.com usando el patrón de URLs conocido.
Guarda los resultados en la tabla product_images de Supabase.
"""

import asyncio
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_client

router = APIRouter()

BASE_URL    = "https://www.truper.com/media/import/imagenes/"
TIMEOUT     = 6.0
MAX_VARS    = 5


def _build_candidates(clave: str) -> list[str]:
    clave = clave.replace("/", "-")
    candidates = [f"{BASE_URL}{clave}.jpg"]
    for n in range(1, MAX_VARS + 1):
        candidates.append(f"{BASE_URL}{clave}+FC{n}.jpg")
        candidates.append(f"{BASE_URL}{clave}+D{n}.jpg")
        candidates.append(f"{BASE_URL}{clave}+EI{n}.jpg")
        candidates.append(f"{BASE_URL}{clave}+EIND{n}.jpg")
    return candidates


async def _check_url(client: httpx.AsyncClient, url: str) -> Optional[str]:
    try:
        r = await client.head(url, follow_redirects=True, timeout=TIMEOUT)
        if r.status_code in (200, 304):
            return url
    except Exception:
        pass
    return None


async def _fetch_for_clave(clave: str) -> list[str]:
    candidates = _build_candidates(clave)
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[_check_url(client, u) for u in candidates])
    return [u for u in results if u]


def _save_images(product_id: str, urls: list[str], fuente: str = "trupper_web"):
    db = get_client()
    # Borrar imágenes anteriores de esta fuente para este producto
    db.table("product_images").delete().eq("product_id", product_id).eq("fuente", fuente).execute()
    if urls:
        db.table("product_images").insert([
            {"product_id": product_id, "url": url, "orden": i, "fuente": fuente}
            for i, url in enumerate(urls)
        ]).execute()


@router.post("/fetch/{product_id}")
async def fetch_images_for_product(product_id: str):
    db = get_client()

    # Obtener las claves de las variantes del producto
    variants = db.table("product_variants")\
        .select("clave")\
        .eq("product_id", product_id)\
        .execute().data

    claves = list({v["clave"] for v in variants if v.get("clave")})
    if not claves:
        raise HTTPException(status_code=400, detail="El producto no tiene variantes con clave/SKU")

    all_urls: list[str] = []
    for clave in claves:
        found = await _fetch_for_clave(clave)
        all_urls.extend(found)

    # Deduplicar manteniendo orden
    seen = set()
    unique_urls = [u for u in all_urls if not (u in seen or seen.add(u))]

    _save_images(product_id, unique_urls)

    return {
        "product_id": product_id,
        "claves_buscadas": claves,
        "imagenes": unique_urls,
        "total": len(unique_urls),
    }


class BulkFetchRequest(BaseModel):
    product_ids: Optional[list[str]] = None   # None = todos


@router.post("/fetch-bulk")
async def fetch_images_bulk(body: BulkFetchRequest):
    db = get_client()

    if body.product_ids:
        rows = db.table("product_variants")\
            .select("product_id, clave")\
            .in_("product_id", body.product_ids)\
            .execute().data
    else:
        rows = db.table("product_variants").select("product_id, clave").execute().data

    # Agrupar claves por producto
    from collections import defaultdict
    by_product: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        if r.get("clave"):
            by_product[r["product_id"]].append(r["clave"])

    if not by_product:
        return {"procesados": 0, "con_imagenes": 0, "resultados": []}

    results = []
    BATCH = 8

    product_ids = list(by_product.keys())
    for i in range(0, len(product_ids), BATCH):
        batch = product_ids[i: i + BATCH]

        async def fetch_one(pid: str) -> dict:
            claves = list(set(by_product[pid]))
            all_urls: list[str] = []
            for clave in claves:
                all_urls.extend(await _fetch_for_clave(clave))
            seen: set = set()
            unique = [u for u in all_urls if not (u in seen or seen.add(u))]
            _save_images(pid, unique)
            return {"product_id": pid, "imagenes": unique, "total": len(unique)}

        batch_results = await asyncio.gather(*[fetch_one(pid) for pid in batch])
        results.extend(batch_results)

    con_imagenes = sum(1 for r in results if r["total"] > 0)
    return {
        "procesados":   len(results),
        "con_imagenes": con_imagenes,
        "resultados":   results,
    }


@router.get("/preview/{clave}")
async def preview_images(clave: str):
    found = await _fetch_for_clave(clave)
    return {"clave": clave, "imagenes": found, "total": len(found)}
