"""
API de la tienda pública.

- Nunca devuelve precio de distribuidor ni acepta un margen por query string.
- Lista paginada y liviana; el detalle trae descripción y atributos.
- Los pedidos se valoran de nuevo en el servidor y se guardan en Supabase.
- El precio publicado ya incluye IVA. El envío se suma aparte; el IVA no.
"""
from __future__ import annotations

import hashlib
import logging
import os
import re
import secrets
import threading
import time
from pathlib import Path
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, HTTPException, Query, Request, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from store_pricing import (
    CAMPOS_TARJETA,
    METODOS_PAGO,
    PASARELAS,
    oferta,
    precio_venta,
    settings,
    totales,
)

router = APIRouter()
log = logging.getLogger("kobber.store")

_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_CACHE_TTL = 60
_WIDTHS = (320, 480, 800, 1200)
_IMAGE_HOST = "www.truper.com"
_IMAGE_PREFIX = "/media/"

_col_cache: dict[tuple[str, str], bool] = {}
_cache_lock = threading.Lock()
_cache: dict = {"exp": 0.0, "items": None, "categorias": None, "marcas": None}
_fixture_store = None
_fixture_announced = False

_VARIANT_BASE = (
    "id, product_id, clave, descripcion, precio_distribuidor, porcentaje_kobber, "
    "unidades_caja, estado"
)


def clear_store_cache():
    global _fixture_store
    _col_cache.clear()
    _fixture_store = None
    with _cache_lock:
        _cache.update(exp=0.0, items=None, categorias=None, marcas=None)


def _fixtures_enabled() -> bool:
    return (
        os.getenv("KOBBER_ENV", "development") == "development"
        and os.getenv("KOBBER_DEV_FIXTURES") == "1"
    )


def _db():
    global _fixture_store, _fixture_announced
    if _fixtures_enabled():
        if _fixture_store is None:
            from dev_fixtures import build_fixture_store
            _fixture_store = build_fixture_store()
            if not _fixture_announced:
                log.warning("Tienda usando catálogo de prueba en memoria (KOBBER_DEV_FIXTURES).")
                _fixture_announced = True
        return _fixture_store
    from database import get_client
    return get_client()


def _has_col(db, table: str, column: str) -> bool:
    key = (table, column)
    if key not in _col_cache:
        try:
            db.table(table).select(column).limit(1).execute()
            _col_cache[key] = True
        except Exception:
            _col_cache[key] = False
            log.info("%s.%s no existe todavía.", table, column)
    return _col_cache[key]


def _variant_cols(db) -> str:
    cols = _VARIANT_BASE
    if _has_col(db, "product_variants", "precio_anterior"):
        cols += ", precio_anterior"
    return cols


def _product_extra(db) -> str:
    extras = [col for col in ("vendible", "plazo_envio") if _has_col(db, "products", col)]
    return (", " + ", ".join(extras)) if extras else ""


def _plazo(row: dict) -> str:
    propio = (row.get("plazo_envio") or "").strip()
    return propio or settings()["plazo_envio"]


def _public_variant(variant: dict, venta: int, anterior, descuento) -> dict:
    """Campos de variante que sí puede ver la tienda. Sin costo ni inventario."""
    return {
        "id": variant.get("id"),
        "clave": variant.get("clave"),
        "descripcion": variant.get("descripcion"),
        "precio_venta": venta,
        "precio_anterior": anterior,
        "descuento": descuento,
        "unidades_caja": variant.get("unidades_caja"),
    }


def _build_item(row: dict) -> dict | None:
    if row.get("vendible") is False:
        return None
    variantes_raw = [v for v in (row.get("product_variants") or []) if v.get("estado") != "inactivo"]
    variantes = []
    for variant in variantes_raw:
        venta = precio_venta(variant.get("precio_distribuidor"), variant.get("porcentaje_kobber"))
        if venta is None:
            continue
        anterior, descuento = oferta(venta, variant.get("precio_anterior"))
        variantes.append(_public_variant(variant, venta, anterior, descuento))
    if not variantes:
        return None

    variantes.sort(key=lambda v: v["precio_venta"])
    primaria = variantes[0]
    fotos = sorted(row.get("product_images") or [], key=lambda img: img.get("orden") or 0)
    urls = [img["url"] for img in fotos if img.get("url")]
    atributos = [a for a in (row.get("product_attributes") or []) if not a.get("variant_id")]

    return {
        "id": row["id"],
        "nombre": row.get("nombre") or "",
        "descripcion": row.get("descripcion"),
        "marca": row.get("marca"),
        "categoria": row.get("categoria"),
        "categoria_ml": row.get("categoria_ml"),
        "caracteristicas": row.get("caracteristicas") or [],
        "atributos": [
            {"nombre": a.get("nombre"), "valor": a.get("valor"), "unidad": a.get("unidad")}
            for a in atributos
        ],
        "variantes": variantes,
        "imagenes": urls,
        "imagen": urls[0] if urls else None,
        "precio": primaria["precio_venta"],
        "precio_anterior": primaria["precio_anterior"],
        "descuento": primaria["descuento"],
        "disponible": True,
        "plazo_envio": _plazo(row),
    }


def _list_payload(item: dict) -> dict:
    return {
        "id": item["id"],
        "nombre": item["nombre"],
        "marca": item["marca"],
        "categoria": item["categoria"],
        "categoria_ml": item["categoria_ml"],
        "precio": item["precio"],
        "precio_anterior": item["precio_anterior"],
        "descuento": item["descuento"],
        "imagen": item["imagen"],
        "disponible": True,
        "plazo_envio": item["plazo_envio"],
        "variantes": [
            {
                "id": v["id"],
                "clave": v["clave"],
                "descripcion": v["descripcion"],
                "precio_venta": v["precio_venta"],
                "precio_anterior": v["precio_anterior"],
                "descuento": v["descuento"],
            }
            for v in item["variantes"]
        ],
    }


def _detail_payload(item: dict) -> dict:
    payload = _list_payload(item)
    payload.update({
        "descripcion": item.get("descripcion"),
        "caracteristicas": item.get("caracteristicas") or [],
        "atributos": item.get("atributos") or [],
        "imagenes": item.get("imagenes") or [],
        "variantes": item["variantes"],
    })
    return payload


def _load_catalog():
    now = time.monotonic()
    with _cache_lock:
        if _cache["items"] is not None and now < _cache["exp"]:
            return _cache["items"], _cache["categorias"], _cache["marcas"]

    db = _db()
    select = (
        "id, nombre, descripcion, marca, categoria, categoria_ml, caracteristicas"
        f"{_product_extra(db)}, "
        f"product_variants({_variant_cols(db)}), "
        "product_images(url, orden), "
        "product_attributes(nombre, valor, unidad, variant_id)"
    )
    try:
        rows = (
            db.table("products")
            .select(select)
            .neq("estado", "descartado")
            .order("nombre")
            .execute()
            .data
            or []
        )
    except Exception:
        log.exception("No se pudo leer el catálogo")
        raise HTTPException(status_code=503, detail="No se pudo cargar el catálogo.")

    items = []
    for row in rows:
        item = _build_item(row)
        if item:
            items.append(item)
    categorias = sorted({item["categoria_ml"] for item in items if item.get("categoria_ml")})
    marcas = sorted({item["marca"] for item in items if item.get("marca")})
    with _cache_lock:
        _cache.update(exp=time.monotonic() + _CACHE_TTL, items=items, categorias=categorias, marcas=marcas)
    return items, categorias, marcas


def _matches(item: dict, q: str) -> bool:
    blob = " ".join([
        item.get("nombre") or "",
        item.get("marca") or "",
        item.get("categoria") or "",
        item.get("categoria_ml") or "",
        item.get("descripcion") or "",
        " ".join((v.get("clave") or "") for v in item["variantes"]),
        " ".join((v.get("descripcion") or "") for v in item["variantes"]),
    ]).lower()
    return q.lower() in blob


def _sort(items: list[dict], orden: str):
    if orden == "precio-asc":
        items.sort(key=lambda item: item["precio"])
    elif orden == "precio-desc":
        items.sort(key=lambda item: item["precio"], reverse=True)
    elif orden == "descuento":
        items.sort(key=lambda item: (item.get("descuento") or 0, item["nombre"]), reverse=True)
    else:
        items.sort(key=lambda item: (item.get("nombre") or "").lower())


def _cache_header(response: Response, seconds: int = 30):
    response.headers["Cache-Control"] = f"public, max-age={seconds}"


@router.get("/productos")
def list_productos(
    response: Response,
    q: str | None = None,
    categoria: list[str] = Query(default=[]),
    marca: list[str] = Query(default=[]),
    min_price: float | None = None,
    max_price: float | None = None,
    en_oferta: bool = False,
    orden: str = "nombre",
    page: int = 1,
    page_size: int = 24,
):
    # `margen` no es un parámetro: si el cliente lo manda, FastAPI lo ignora.
    items, categorias, marcas = _load_catalog()
    filtered = list(items)
    if q and q.strip():
        needle = q.strip()
        filtered = [item for item in filtered if _matches(item, needle)]
    if categoria:
        wanted = set(categoria)
        filtered = [item for item in filtered if item.get("categoria_ml") in wanted]
    if marca:
        wanted = set(marca)
        filtered = [item for item in filtered if item.get("marca") in wanted]
    if min_price is not None:
        filtered = [item for item in filtered if item["precio"] >= min_price]
    if max_price is not None:
        filtered = [item for item in filtered if item["precio"] <= max_price]
    if en_oferta:
        filtered = [item for item in filtered if item.get("descuento")]

    _sort(filtered, orden if orden in {"nombre", "precio-asc", "precio-desc", "descuento", "relevancia"} else "nombre")
    page_size = min(max(int(page_size or 24), 1), 48)
    page = max(int(page or 1), 1)
    total = len(filtered)
    pages = (total + page_size - 1) // page_size if total else 0
    start = (page - 1) * page_size
    _cache_header(response, 30)
    return {
        "productos": [_list_payload(item) for item in filtered[start:start + page_size]],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
        "categorias": categorias,
        "marcas": marcas,
    }


@router.get("/productos/{product_id}")
def get_producto(product_id: str, response: Response):
    items, _, _ = _load_catalog()
    for item in items:
        if str(item["id"]) == str(product_id):
            _cache_header(response, 30)
            return _detail_payload(item)
    raise HTTPException(status_code=404, detail="Producto no encontrado")


@router.get("/pagos")
def listar_pagos():
    cfg = settings()
    return {
        "metodos": [
            {key: value for key, value in metodo.items() if key != "requiere_pasarela" or True}
            for metodo in METODOS_PAGO.values()
        ],
        "iva_incluido": True,
        "iva": cfg["iva"],
        "envio": {
            "costo": cfg["envio"],
            "gratis_desde": cfg["envio_gratis_desde"],
        },
        "pasarela": None,
    }


class ItemIn(BaseModel):
    variant_id: str
    cantidad: int = Field(ge=1, le=99)


class ClienteIn(BaseModel):
    nombre: str = Field(min_length=3, max_length=160)
    email: str = Field(min_length=5, max_length=160)
    telefono: str = Field(min_length=7, max_length=40)


class EnvioIn(BaseModel):
    direccion: str = Field(min_length=4, max_length=240)
    ciudad: str = Field(min_length=2, max_length=80)
    departamento: str = Field(min_length=2, max_length=80)
    codigo_postal: str | None = Field(default=None, max_length=16)
    notas: str | None = Field(default=None, max_length=500)


class FacturaIn(BaseModel):
    mismo_envio: bool = True
    razon_social: str | None = Field(default=None, max_length=160)
    documento: str | None = Field(default=None, max_length=32)
    direccion: str | None = Field(default=None, max_length=240)
    ciudad: str | None = Field(default=None, max_length=80)


class PedidoIn(BaseModel):
    items: list[ItemIn] = Field(min_length=1, max_length=30)
    metodo_pago: str
    cliente: ClienteIn
    envio: EnvioIn
    factura: FacturaIn | None = None
    acepta_terminos: bool = False


def _rechazar_tarjeta(raw: dict):
    encontrados = []

    def walk(node):
        if isinstance(node, dict):
            for key, value in node.items():
                if str(key).lower() in CAMPOS_TARJETA:
                    encontrados.append(str(key))
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(raw)
    if encontrados:
        raise HTTPException(
            status_code=400,
            detail="No recibimos datos de tarjeta. Elegí contra entrega o transferencia.",
        )


def _public_order(order: dict, items: list[dict]) -> dict:
    metodo = METODOS_PAGO.get(order.get("metodo_pago") or "", {})
    return {
        "numero": order.get("numero"),
        "estado": order.get("estado"),
        "pago_estado": order.get("pago_estado"),
        "metodo_pago": order.get("metodo_pago"),
        "metodo_label": metodo.get("label"),
        "instrucciones": metodo.get("descripcion"),
        "pasarela": order.get("pasarela"),
        "redirect_url": None,
        "correo_enviado": False,
        "created_at": order.get("created_at"),
        "totales": {
            "subtotal": order.get("subtotal"),
            "iva_incluido": order.get("iva_incluido"),
            "envio": order.get("envio"),
            "total": order.get("total"),
            "moneda": order.get("moneda") or "COP",
            "iva_ya_incluido": True,
        },
        "items": [
            {
                "nombre": item.get("nombre"),
                "clave": item.get("clave"),
                "cantidad": item.get("cantidad"),
                "precio_unitario": item.get("precio_unitario"),
                "subtotal": item.get("subtotal"),
            }
            for item in items
        ],
        "mensaje": (
            "Pedido recibido. No enviamos un correo automático: guardá el número de pedido. "
            "Te contactamos al teléfono que dejaste para coordinar el pago y la entrega."
        ),
    }


def _load_variants(db, ids: list[str]) -> list[dict]:
    parent = "nombre, marca, estado"
    if _has_col(db, "products", "vendible"):
        parent += ", vendible"
    cols = _variant_cols(db) + f", products({parent})"
    try:
        return db.table("product_variants").select(cols).in_("id", ids).execute().data or []
    except Exception:
        log.exception("No se pudieron leer las variantes del pedido")
        raise HTTPException(status_code=503, detail="No se pudo valuar el pedido.")


@router.post("/pedidos")
async def crear_pedido(request: Request):
    try:
        raw = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="El pedido no tiene un formato válido.")
    if not isinstance(raw, dict):
        raise HTTPException(status_code=400, detail="El pedido no tiene un formato válido.")
    _rechazar_tarjeta(raw)
    body = PedidoIn.model_validate(raw)

    if not body.acepta_terminos:
        raise HTTPException(status_code=400, detail="Tenés que aceptar los términos y la política de privacidad.")
    if not _EMAIL.match(body.cliente.email.strip()):
        raise HTTPException(status_code=400, detail="El correo no parece válido.")

    metodo = METODOS_PAGO.get(body.metodo_pago)
    if metodo is None:
        raise HTTPException(status_code=400, detail="Ese método de pago no está disponible.")
    if metodo["requiere_pasarela"] and body.metodo_pago not in PASARELAS:
        raise HTTPException(status_code=501, detail="Esa forma de pago todavía no está conectada.")

    factura = body.factura or FacturaIn()
    if not factura.mismo_envio and not (factura.razon_social and factura.documento):
        raise HTTPException(status_code=400, detail="Completá la razón social y el documento de facturación.")

    db = _db()
    ids = [item.variant_id for item in body.items]
    rows = _load_variants(db, ids)
    by_id = {str(row.get("id")): row for row in rows}

    lineas = []
    subtotal = 0
    for item in body.items:
        row = by_id.get(str(item.variant_id))
        if not row or row.get("estado") == "inactivo":
            raise HTTPException(status_code=400, detail="Hay un producto que ya no está disponible.")
        parent = row.get("products") or {}
        if isinstance(parent, list):
            parent = parent[0] if parent else {}
        if parent.get("estado") == "descartado" or parent.get("vendible") is False:
            raise HTTPException(status_code=400, detail="Hay un producto que ya no está disponible.")
        venta = precio_venta(row.get("precio_distribuidor"), row.get("porcentaje_kobber"))
        if venta is None:
            raise HTTPException(status_code=400, detail="Hay un producto sin precio de venta.")
        linea_total = venta * item.cantidad
        subtotal += linea_total
        extra = f" · {row['descripcion']}" if row.get("descripcion") else ""
        lineas.append({
            "variant_id": row.get("id"),
            "product_id": row.get("product_id"),
            "clave": row.get("clave"),
            "nombre": f"{parent.get('nombre') or 'Producto'}{extra}",
            "cantidad": item.cantidad,
            "precio_unitario": venta,
            "subtotal": linea_total,
        })

    montos = totales(subtotal)
    numero = "KOB-" + secrets.token_hex(4).upper()
    pedido = {
        "numero": numero,
        "estado": "recibido",
        "metodo_pago": body.metodo_pago,
        "pago_estado": "pendiente",
        "pasarela": None,
        "pasarela_ref": None,
        "cliente_nombre": body.cliente.nombre.strip(),
        "cliente_email": body.cliente.email.strip().lower(),
        "cliente_telefono": body.cliente.telefono.strip(),
        "envio_direccion": body.envio.direccion.strip(),
        "envio_ciudad": body.envio.ciudad.strip(),
        "envio_departamento": body.envio.departamento.strip(),
        "envio_cp": (body.envio.codigo_postal or "").strip() or None,
        "envio_notas": (body.envio.notas or "").strip() or None,
        "factura_mismo_envio": factura.mismo_envio,
        "factura_razon_social": (factura.razon_social or "").strip() or None,
        "factura_documento": (factura.documento or "").strip() or None,
        "factura_direccion": (factura.direccion or "").strip() or None,
        "factura_ciudad": (factura.ciudad or "").strip() or None,
        "subtotal": montos["subtotal"],
        "iva_incluido": montos["iva_incluido"],
        "envio": montos["envio"],
        "total": montos["total"],
        "moneda": "COP",
    }

    try:
        inserted = db.table("orders").insert(pedido).execute().data or []
    except Exception:
        log.exception("No se pudo guardar el pedido")
        raise HTTPException(
            status_code=503,
            detail="No se pudo guardar el pedido. Si acabás de actualizar la tienda, falta aplicar la migración de pedidos en Supabase.",
        )
    if not inserted:
        raise HTTPException(status_code=503, detail="No se pudo guardar el pedido.")
    saved = inserted[0]
    for linea in lineas:
        linea["order_id"] = saved["id"]
    try:
        db.table("order_items").insert(lineas).execute()
    except Exception:
        log.exception("El pedido %s quedó sin ítems", numero)
        raise HTTPException(status_code=503, detail="No se pudieron guardar los productos del pedido.")

    # Punto de extensión: un adaptador en PASARELAS completa pasarela/redirect
    # después de persistir el pedido. Hoy ningún método lo usa.
    if metodo["requiere_pasarela"]:
        extra = PASARELAS[body.metodo_pago](saved, lineas)
        saved["pasarela"] = extra.get("pasarela")
        saved["pasarela_ref"] = extra.get("pasarela_ref")
        order = _public_order(saved, lineas)
        order["redirect_url"] = extra.get("redirect_url")
        return order

    return _public_order(saved, lineas)


@router.get("/pedidos/{numero}")
def obtener_pedido(numero: str, email: str):
    if not _EMAIL.match(email.strip()):
        raise HTTPException(status_code=400, detail="El correo no parece válido.")
    db = _db()
    try:
        rows = db.table("orders").select("*").eq("numero", numero.strip()).limit(1).execute().data or []
    except Exception:
        log.exception("No se pudo consultar el pedido")
        raise HTTPException(status_code=503, detail="No se pudo consultar el pedido.")
    if not rows or (rows[0].get("cliente_email") or "").lower() != email.strip().lower():
        raise HTTPException(status_code=404, detail="No encontramos un pedido con esos datos.")
    order = rows[0]
    items = db.table("order_items").select("*").eq("order_id", order["id"]).execute().data or []
    return _public_order(order, items)


def _snap_width(width: int) -> int:
    width = int(width or 480)
    for allowed in _WIDTHS:
        if width <= allowed:
            return allowed
    return _WIDTHS[-1]


def _safe_image_url(src: str) -> str:
    parsed = urlparse(src)
    if parsed.scheme != "https" or parsed.hostname != _IMAGE_HOST:
        raise HTTPException(status_code=400, detail="Origen de imagen no permitido.")
    if parsed.port not in (None, 443) or parsed.username or parsed.password:
        raise HTTPException(status_code=400, detail="Origen de imagen no permitido.")
    if not parsed.path.startswith(_IMAGE_PREFIX):
        raise HTTPException(status_code=400, detail="Origen de imagen no permitido.")
    return f"https://{_IMAGE_HOST}{parsed.path}"


def _fetch_upstream(url: str) -> bytes:
    current = url
    headers = {"User-Agent": "KobberTienda/1.0", "Accept": "image/*"}
    with httpx.Client(timeout=15.0, follow_redirects=False) as client:
        for _ in range(3):
            response = client.get(current, headers=headers)
            if response.status_code in (301, 302, 303, 307, 308):
                location = response.headers.get("location")
                if not location:
                    break
                current = _safe_image_url(location if location.startswith("http") else f"https://{_IMAGE_HOST}{location}")
                continue
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="No se pudo obtener la imagen.")
            content_type = (response.headers.get("content-type") or "").split(";")[0].strip().lower()
            if not content_type.startswith("image/"):
                raise HTTPException(status_code=502, detail="La respuesta no es una imagen.")
            if len(response.content) > 8 * 1024 * 1024:
                raise HTTPException(status_code=502, detail="La imagen es demasiado grande.")
            return response.content
    raise HTTPException(status_code=502, detail="No se pudo obtener la imagen.")


@router.get("/imagen")
def imagen(src: str, w: int = 480):
    """Redimensiona fotos de truper.com. El navegador cachea el resultado."""
    url = _safe_image_url(src)
    width = _snap_width(w)
    digest = hashlib.sha256(f"{url}|{width}".encode()).hexdigest()
    cache_dir = Path(os.getenv("IMAGE_CACHE_DIR", "/tmp/kobber-image-cache"))
    cache_dir.mkdir(parents=True, exist_ok=True)
    target = cache_dir / f"{digest}.webp"
    if not target.exists():
        from io import BytesIO
        from PIL import Image

        raw = _fetch_upstream(url)
        try:
            with Image.open(BytesIO(raw)) as photo:
                photo = photo.convert("RGB")
                photo.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
                photo.save(target, "WEBP", quality=75, method=6)
        except HTTPException:
            raise
        except Exception:
            log.exception("No se pudo procesar %s", url)
            raise HTTPException(status_code=502, detail="No se pudo procesar la imagen.")

    return FileResponse(
        target,
        media_type="image/webp",
        headers={"Cache-Control": "public, max-age=604800"},
    )


def _site_url() -> str:
    return os.getenv("PUBLIC_SITE_URL", "https://kobber-tienda.onrender.com").rstrip("/")


@router.get("/sitemap.xml")
def sitemap():
    base = _site_url()
    paths = [
        "/",
        "/tienda/catalogo",
        "/tienda/ofertas",
        "/tienda/contacto",
        "/tienda/terminos",
        "/tienda/privacidad",
        "/tienda/cookies",
        "/tienda/nosotros",
    ]
    try:
        items, _, _ = _load_catalog()
        paths.extend(f"/tienda/producto/{item['id']}" for item in items)
    except HTTPException:
        items = []
    urls = "\n".join(f"  <url><loc>{base}{path}</loc></url>" for path in paths)
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{urls}\n</urlset>\n"
    )
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=3600"})
