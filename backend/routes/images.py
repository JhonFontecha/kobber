"""
Descarga de imágenes desde trupper.com.
- Método principal: buscador real del Banco de Contenido Digital de Truper
  (rediseñado — la URL vieja "BancoContenidoDigital/index.php?r=..." ya no
  existe, redirige a una landing genérica). Da la lista EXACTA de imágenes
  por producto en vez de adivinar sufijos de archivo, así que no se pierden
  fotos que existan con un sufijo no contemplado.
- Respaldo: adivinar nombres de archivo (candidatos fijos), por si el buscador
  no encuentra la clave.
"""

import asyncio
import re
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_client

router = APIRouter()

BASE_URL     = "https://www.truper.com/media/import/imagenes/"
BANCO_URL    = "https://www.truper.com/banco-contenido-digital"
BANCO_SEARCH = f"{BANCO_URL}/searching/searchByWord"
TIMEOUT      = 12.0
MAX_VARS     = 5
_HEADERS     = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
    # El sitio nuevo exige esta cookie de región (se setea al visitar la
    # home) para no devolver 500 en /searching/searchByWord.
    "Cookie": "reg=mx",
}

# Sufijos de foto de EMPAQUE (no de producto) que trae el sitio nuevo, además
# de EI/EIND que ya conocíamos: "E" = tarjeta/blister, "EM" = caja máster.
_PACKAGING_SUFFIXES = {"E", "EI", "EIND", "EM"}
_SUFFIX_RE = re.compile(r"\+([A-Za-z]+)\d*\.(?:jpg|jpeg|png|webp)$", re.IGNORECASE)


def _is_product_photo(url: str) -> bool:
    """False si la URL es una foto de empaque (blister/inner/individual/máster)."""
    m = _SUFFIX_RE.search(url)
    if not m:
        return True  # sin sufijo -> foto base del producto
    return m.group(1).upper() not in _PACKAGING_SUFFIXES


async def _scrape_banco(clave: str, client: httpx.AsyncClient) -> dict:
    """
    Busca la clave en el buscador real del Banco de Contenido Digital de
    Truper (API JSON) y trae la lista exacta de imágenes desde la página de
    detalle del producto. Devuelve {trupper_id, imagenes: [...urls...], found}.

    El buscador hace match por substring y puede devolver varios productos
    (ej. buscar "T203-6" también devuelve "T203-6X") — se exige coincidencia
    EXACTA de clave para no traer las fotos de un producto distinto.
    """
    try:
        r = await client.get(
            BANCO_SEARCH, params={"q": clave}, headers=_HEADERS, timeout=TIMEOUT,
        )
        data = r.json()
    except Exception:
        return {"clave": clave, "trupper_id": None, "imagenes": [], "found": False}

    if not data.get("success"):
        return {"clave": clave, "trupper_id": None, "imagenes": [], "found": False}

    match = next(
        (item for item in data.get("results", [])
         if str(item.get("clave", "")).strip().lower() == clave.strip().lower()),
        None,
    )
    if not match or not match.get("url"):
        return {"clave": clave, "trupper_id": None, "imagenes": [], "found": False}

    trupper_id = match.get("id_productos")

    try:
        r2 = await client.get(match["url"], headers=_HEADERS, timeout=TIMEOUT)
    except Exception:
        return {"clave": clave, "trupper_id": trupper_id, "imagenes": [], "found": False}

    imgs = re.findall(
        r'src="(https://www\.truper\.com/media/import/imagenes/[^"]+\.(?:jpg|png|jpeg|webp))"',
        r2.text, re.IGNORECASE,
    )
    imgs = [u for u in imgs if _is_product_photo(u)]
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
    """
    Sufijos de Trupper: "FC" = foto de característica (producto real, con textos
    superpuestos) y "D" = detalle — ambos válidos. "EI" = Empaque Inner (caja máster)
    y "EIND" = Empaque INDividual (blister de venta) — son fotos de la caja, no del
    producto, y Kobber nunca envía en ese empaque original. No se buscan.
    """
    clave = clave.replace("/", "-")
    candidates = [f"{BASE_URL}{clave}.jpg"]
    for n in range(1, MAX_VARS + 1):
        candidates.append(f"{BASE_URL}{clave}+FC{n}.jpg")
        candidates.append(f"{BASE_URL}{clave}+D{n}.jpg")
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
    """
    Primero el buscador real de Truper (trae la lista exacta de fotos, sin
    adivinar sufijos). Si no encuentra la clave ahí, cae al método viejo de
    adivinar nombres de archivo fijos como respaldo.
    """
    async with httpx.AsyncClient() as client:
        banco = await _scrape_banco(clave, client)
        if banco["found"]:
            return banco["imagenes"]

        candidates = _build_candidates(clave)
        results = await asyncio.gather(*[_check_url(client, u) for u in candidates])
    return [u for u in results if u]


def _save_images(product_id: str, urls: list[str], fuente: str = "trupper_web", variant_id: str | None = None):
    db = get_client()
    # Borrar imágenes anteriores de esta fuente para este producto/variante
    q = db.table("product_images").delete().eq("product_id", product_id).eq("fuente", fuente)
    q = q.eq("variant_id", variant_id) if variant_id else q.is_("variant_id", "null")
    q.execute()
    if urls:
        db.table("product_images").insert([
            {"product_id": product_id, "variant_id": variant_id, "url": url, "orden": i, "fuente": fuente}
            for i, url in enumerate(urls)
        ]).execute()


@router.post("/fetch/{product_id}")
async def fetch_images_for_product(product_id: str):
    db = get_client()

    # Cada variante tiene su propia clave/código — hay que buscar imágenes por
    # variante para no mezclar las fotos de un código con las de otro.
    variants = db.table("product_variants")\
        .select("id, clave")\
        .eq("product_id", product_id)\
        .execute().data
    variants = [v for v in variants if v.get("clave")]
    if not variants:
        raise HTTPException(status_code=400, detail="El producto no tiene variantes con clave/SKU")

    resultados = []
    for v in variants:
        urls = await _fetch_for_clave(v["clave"])
        _save_images(product_id, urls, variant_id=v["id"])
        resultados.append({"variant_id": v["id"], "clave": v["clave"], "imagenes": urls, "total": len(urls)})

    return {
        "product_id": product_id,
        "variantes": resultados,
        "total": sum(r["total"] for r in resultados),
    }


class BulkFetchRequest(BaseModel):
    product_ids: Optional[list[str]] = None   # None = todos


@router.post("/fetch-bulk")
async def fetch_images_bulk(body: BulkFetchRequest):
    db = get_client()

    if body.product_ids:
        rows = db.table("product_variants")\
            .select("id, product_id, clave")\
            .in_("product_id", body.product_ids)\
            .execute().data
        variantes = [r for r in rows if r.get("clave")]
    else:
        # Sin IDs → buscar solo variantes SIN imágenes propias
        todos = db.table("product_variants").select("id, product_id, clave").execute().data
        con_imgs = {
            r["variant_id"]
            for r in db.table("product_images").select("variant_id")
                .not_.is_("variant_id", "null").execute().data
        }
        variantes = [r for r in todos if r.get("clave") and r["id"] not in con_imgs]

    if not variantes:
        return {"procesados": 0, "con_imagenes": 0, "resultados": []}

    results = []
    BATCH = 8

    for i in range(0, len(variantes), BATCH):
        batch = variantes[i: i + BATCH]

        async def fetch_one(v: dict) -> dict:
            urls = await _fetch_for_clave(v["clave"])
            _save_images(v["product_id"], urls, variant_id=v["id"])
            return {"product_id": v["product_id"], "variant_id": v["id"], "clave": v["clave"],
                    "imagenes": urls, "total": len(urls)}

        batch_results = await asyncio.gather(*[fetch_one(v) for v in batch])
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
