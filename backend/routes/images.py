"""
Descarga de imágenes desde trupper.com.
- Método original: adivinando nombres de archivo
- Método nuevo: scraping del BancoContenidoDigital oficial de Trupper
"""

import asyncio
import re
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_client

router = APIRouter()

BASE_URL    = "https://www.truper.com/media/import/imagenes/"
BANCO_URL   = "https://www.truper.com/BancoContenidoDigital"
TIMEOUT     = 12.0
MAX_VARS    = 5
_HEADERS    = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
}


async def _scrape_banco(clave: str, client: httpx.AsyncClient) -> dict:
    """
    Busca la clave en el BancoContenidoDigital de Trupper.
    Devuelve {trupper_id, imagenes: [...urls...], found: bool}
    """
    search_url = (
        f"{BANCO_URL}/index.php?r=site%2Fsearch"
        f"&Productos%5Bclave%5D={clave}"
    )
    try:
        r = await client.get(search_url, headers=_HEADERS, follow_redirects=True, timeout=TIMEOUT)
    except Exception:
        return {"clave": clave, "trupper_id": None, "imagenes": [], "found": False}

    if r.status_code != 200:
        return {"clave": clave, "trupper_id": None, "imagenes": [], "found": False}

    # Extraer el ID de Trupper (data-id del primer card)
    ids = re.findall(r'data-id="(\d+)"', r.text)
    if not ids:
        return {"clave": clave, "trupper_id": None, "imagenes": [], "found": False}

    trupper_id = ids[0]

    # Cargar página de detalle → tiene TODAS las imágenes
    detail_url = f"{BANCO_URL}/index.php?r=producto/view&id={trupper_id}"
    try:
        r2 = await client.get(detail_url, headers=_HEADERS, follow_redirects=True, timeout=TIMEOUT)
    except Exception:
        return {"clave": clave, "trupper_id": trupper_id, "imagenes": [], "found": False}

    imgs = re.findall(
        r'src="(https://www\.truper\.com/[^"]+\.(?:jpg|png|jpeg|webp))"',
        r2.text, re.IGNORECASE,
    )
    # Deduplicar manteniendo orden
    seen: set = set()
    unique = [u for u in imgs if not (u in seen or seen.add(u))]

    return {
        "clave":      clave,
        "trupper_id": trupper_id,
        "imagenes":   unique,
        "found":      len(unique) > 0,
    }


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
        # Sin IDs → buscar solo productos SIN imágenes
        todos = db.table("product_variants").select("product_id, clave").execute().data
        con_imgs = {
            r["product_id"]
            for r in db.table("product_images").select("product_id").execute().data
        }
        rows = [r for r in todos if r["product_id"] not in con_imgs]

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


# ── BancoContenidoDigital scraping ────────────────────────────────────────────

@router.get("/banco/{clave}")
async def scrape_banco_for_clave(clave: str):
    """Busca imágenes en el BancoContenidoDigital de Trupper para una clave."""
    async with httpx.AsyncClient() as client:
        result = await _scrape_banco(clave, client)
    return result


class BancoSampleRequest(BaseModel):
    limit: int = 10


@router.post("/banco/sample")
async def scrape_banco_sample(body: BancoSampleRequest):
    """
    Toma hasta `limit` productos de la BD que tengan clave,
    busca sus imágenes en BancoContenidoDigital y devuelve los resultados.
    """
    db = get_client()
    rows = db.table("products").select(
        "id, nombre, marca, "
        "product_variants(id, clave, codigo)"
    ).limit(50).execute().data

    # Recoger una clave por producto (la primera variante con clave)
    productos = []
    for p in rows:
        clave = next(
            (v["clave"] for v in (p.get("product_variants") or []) if v.get("clave")),
            None,
        )
        if clave:
            productos.append({
                "product_id": p["id"],
                "nombre":     p.get("nombre", ""),
                "marca":      p.get("marca", ""),
                "clave":      clave,
            })
        if len(productos) >= body.limit:
            break

    if not productos:
        return {"resultados": [], "total": 0}

    # Scraping concurrente (máx 5 a la vez para no saturar Trupper)
    SEM = asyncio.Semaphore(5)

    async def fetch_one(info: dict) -> dict:
        async with SEM:
            async with httpx.AsyncClient() as client:
                banco = await _scrape_banco(info["clave"], client)
        return {**info, **banco}

    results = await asyncio.gather(*[fetch_one(p) for p in productos])

    return {
        "resultados": list(results),
        "total":      len(results),
        "con_imagenes": sum(1 for r in results if r["found"]),
    }


class SaveImagesRequest(BaseModel):
    product_id: str
    urls: list[str]


@router.post("/banco/save")
def save_banco_images(body: SaveImagesRequest):
    """Guarda las URLs seleccionadas en product_images."""
    _save_images(body.product_id, body.urls, fuente="banco_trupper")
    return {"ok": True, "guardadas": len(body.urls)}
