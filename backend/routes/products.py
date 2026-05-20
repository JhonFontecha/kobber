import io
import time
from typing import Optional

import openpyxl
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from database import get_client
from routes.catalog import enhance_product_data, get_ml_category

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

class CodesSearch(BaseModel):
    codes: list[str]
    porcentaje: Optional[float] = None


def _search_variants_by_codes(db, codes: list[str]):
    """Returns (product_ids set, dict of original_code -> product_id)."""
    clean = [c.strip() for c in codes if c.strip()]
    all_variants = list(set(clean + [c.upper() for c in clean] + [c.lower() for c in clean]))

    rows_clave  = db.table("product_variants").select("product_id, clave, codigo").in_("clave",  all_variants).execute().data
    rows_codigo = db.table("product_variants").select("product_id, clave, codigo").in_("codigo", all_variants).execute().data

    product_ids: set = set()
    code_to_pid: dict = {}
    found: set = set()
    clean_lower = {c.lower(): c for c in clean}

    for v, field in [(r, "clave") for r in rows_clave] + [(r, "codigo") for r in rows_codigo]:
        pid = v.get("product_id")
        if not pid:
            continue
        product_ids.add(pid)
        db_val = str(v.get(field) or "").lower()
        if db_val in clean_lower:
            orig = clean_lower[db_val]
            found.add(orig)
            if orig not in code_to_pid:
                code_to_pid[orig] = pid

    no_encontrados = [c for c in clean if c not in found]
    return product_ids, code_to_pid, no_encontrados


_SELECT = (
    "*, product_variants(id, clave, codigo, descripcion, precio_distribuidor, "
    "nc, unidades_caja, stock, estado), product_images(url, orden)"
)


@router.post("/by-codes")
def search_by_codes(body: CodesSearch):
    if not body.codes:
        return {"products": [], "no_encontrados": [], "encontrados": 0}

    db = get_client()
    product_ids, _, no_encontrados = _search_variants_by_codes(db, body.codes)

    if not product_ids:
        return {"products": [], "no_encontrados": no_encontrados, "encontrados": 0}

    result = db.table("products").select(_SELECT).in_("id", list(product_ids)).execute()
    return {
        "products": result.data,
        "no_encontrados": no_encontrados,
        "encontrados": len(result.data),
    }


@router.post("/from-excel")
async def search_from_excel(file: UploadFile = File(...)):
    content = await file.read()
    try:
        wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
    except Exception:
        raise HTTPException(400, "No se pudo leer el archivo Excel")

    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        raise HTTPException(400, "El archivo está vacío")

    # Detect columns
    first = [str(c).lower().strip() if c is not None else "" for c in rows[0]]
    code_col, pct_col = 0, 1
    for i, h in enumerate(first):
        if any(k in h for k in ["cod", "sku", "clave", "artículo", "articulo", "ref", "item"]):
            code_col = i
        if any(k in h for k in ["porcent", "gananci", "margen", "utilidad", "%"]):
            pct_col = i

    first_cell = str(rows[0][code_col] or "").strip()
    is_header = not (first_cell and first_cell.replace("-", "").replace("_", "").isalnum()
                     and not any(k in first_cell.lower() for k in ["cod", "sku", "ref", "artículo"]))
    start = 1 if is_header else 0

    code_pct: dict = {}
    for row in rows[start:]:
        if not row or len(row) <= code_col or row[code_col] is None:
            continue
        code = str(row[code_col]).strip()
        if not code:
            continue
        pct = None
        if pct_col < len(row) and row[pct_col] is not None:
            try:
                val = float(row[pct_col])
                pct = val if val > 1 else round(val * 100, 2)
            except (ValueError, TypeError):
                pass
        code_pct[code] = pct

    if not code_pct:
        raise HTTPException(400, "No se encontraron códigos en el Excel")

    db = get_client()
    product_ids, code_to_pid, no_encontrados = _search_variants_by_codes(db, list(code_pct.keys()))

    if not product_ids:
        return {"products": [], "porcentajes": {}, "no_encontrados": no_encontrados,
                "total_codigos": len(code_pct), "encontrados": 0}

    result = db.table("products").select(_SELECT).in_("id", list(product_ids)).execute()

    porcentajes = {pid: code_pct[code] for code, pid in code_to_pid.items()
                   if code_pct.get(code) is not None}

    return {
        "products": result.data,
        "porcentajes": porcentajes,
        "no_encontrados": no_encontrados,
        "total_codigos": len(code_pct),
        "encontrados": len(result.data),
    }


@router.get("/search")
def search_products(q: Optional[str] = None):
    db = get_client()
    select_clause = (
        "*, product_variants(id, clave, codigo, descripcion, precio_distribuidor, "
        "nc, unidades_caja, stock, estado)"
    )

    if not q or not q.strip():
        result = db.table("products").select(select_clause).order("created_at", desc=True).execute()
        return result.data

    term = q.strip()
    product_ids: set = set()

    res = db.table("products").select("id").or_(
        f"nombre.ilike.%{term}%,marca.ilike.%{term}%,categoria.ilike.%{term}%,descripcion.ilike.%{term}%"
    ).execute()
    for p in res.data:
        product_ids.add(p["id"])

    res2 = db.table("product_variants").select("product_id").or_(
        f"clave.ilike.%{term}%,codigo.ilike.%{term}%"
    ).execute()
    for v in res2.data:
        if v["product_id"]:
            product_ids.add(v["product_id"])

    if not product_ids:
        return []

    result = db.table("products").select(select_clause).in_("id", list(product_ids)).execute()
    return result.data


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


# ── Backfill categoria_ml ──────────────────────────────────────────────────────

@router.post("/backfill-categoria-ml")
def backfill_categoria_ml():
    """
    Recorre todos los productos sin categoria_ml y llama domain_discovery
    para asignarles la categoría de ML. Devuelve un resumen del proceso.
    """
    db = get_client()

    productos = db.table("products").select("id, nombre, categoria_ml") \
        .is_("categoria_ml", "null").execute().data

    if not productos:
        return {"mensaje": "Todos los productos ya tienen categoria_ml", "actualizados": 0}

    actualizados = 0
    errores      = 0

    for p in productos:
        cat = get_ml_category(p["nombre"])
        if cat:
            db.table("products").update({"categoria_ml": cat}).eq("id", p["id"]).execute()
            actualizados += 1
        else:
            errores += 1
        time.sleep(0.3)

    return {
        "total":       len(productos),
        "actualizados": actualizados,
        "sin_categoria": errores,
    }


# ── Mejorar descripción y atributos con Claude ────────────────────────────────

ENHANCE_PROMPT = """\
Eres experto en catálogos de ferretería y herramientas para MercadoLibre Colombia.
Tu tarea es generar una descripción optimizada y sugerir atributos faltantes
para el siguiente producto de la marca {marca}.

════════════════════════════════════════
DATOS DEL PRODUCTO
════════════════════════════════════════
Nombre: {nombre}
Categoría: {categoria}
Marca: {marca}
Variantes disponibles: {variantes}
Descripción actual: {descripcion_actual}
Características extraídas: {caracteristicas}
Atributos ya registrados: {atributos}

════════════════════════════════════════
FORMATO UNIVERSAL PARA LA DESCRIPCIÓN
════════════════════════════════════════
Usa EXACTAMENTE este formato. Incluye solo las secciones que apliquen al producto.
Máximo 500 palabras. Sin HTML. Texto plano con los símbolos indicados.

[Una frase de apertura: qué es el producto + principal beneficio o uso]

✦ Características principales:
• [característica 1]
• [característica 2]
• [característica 3]
• [característica 4 si aplica]
• [característica 5 si aplica]

✦ Especificaciones técnicas:
• [atributo]: [valor con unidad]
• [atributo]: [valor con unidad]
(incluye solo specs relevantes: medidas, materiales, capacidad, potencia, etc.)

✦ Aplicaciones recomendadas:
• [uso o superficie 1]
• [uso o superficie 2]
• [uso o superficie 3]

✦ Incluye: [lista si tiene accesorios o piezas, omitir si no aplica]

✦ Compatibilidad: [si aplica para consumibles o accesorios, omitir si no aplica]

════════════════════════════════════════
INSTRUCCIONES ADICIONALES
════════════════════════════════════════
1. Usa tu conocimiento de los productos Truper/Pretul/FIERO para complementar información.
2. Sé preciso con medidas y materiales — no inventes datos que no puedas confirmar.
3. Usa terminología colombiana (ej: "cintas" no "tapes", "llave" no "llave inglesa" si es específica).
4. Optimiza para búsquedas en MercadoLibre Colombia.
5. Si hay varias variantes (tallas, medidas), menciona que "disponible en varias medidas".

Además de la descripción, devuelve sugerencias de atributos faltantes en formato JSON.

Responde ÚNICAMENTE con este JSON (sin markdown):
{{
  "descripcion": "...",
  "atributos_sugeridos": [
    {{"nombre": "...", "valor": "...", "unidad": "..."}},
    ...
  ],
  "titulos_sugeridos": [
    "título opción 1 (max 60 chars)",
    "título opción 2 (max 60 chars)"
  ]
}}
"""


@router.post("/{product_id}/enhance")
async def enhance_product(product_id: str):
    """
    Usa Claude para mejorar la descripción del producto y sugerir atributos faltantes.
    """
    db = get_client()
    result = db.table("products").select(
        "id, nombre, descripcion, marca, categoria, caracteristicas, "
        "product_attributes(nombre, valor, unidad, variant_id), "
        "product_variants(id, clave, descripcion, product_attributes(nombre, valor, unidad))"
    ).eq("id", product_id).execute().data

    if not result:
        raise HTTPException(404, "Producto no encontrado")

    p = result[0]

    variantes = [
        {"clave": v["clave"], "descripcion": v.get("descripcion")}
        for v in (p.get("product_variants") or [])
    ]
    familia_attrs = [
        a for a in (p.get("product_attributes") or []) if not a.get("variant_id")
    ]
    variante_attrs = [
        a for v in (p.get("product_variants") or [])
        for a in (v.get("product_attributes") or [])
    ]

    data = enhance_product_data(
        nombre             = p["nombre"],
        marca              = p.get("marca") or "TRUPER",
        categoria          = p.get("categoria") or "",
        variantes          = variantes,
        descripcion_actual = p.get("descripcion") or "",
        caracteristicas    = p.get("caracteristicas") or [],
        atributos          = familia_attrs + variante_attrs,
    )

    return {
        "descripcion":         data.get("descripcion", ""),
        "atributos_sugeridos": data.get("atributos_sugeridos", []),
        "titulos_sugeridos":   data.get("titulos_sugeridos", []),
        "producto_id":         product_id,
        "producto_nombre":     p["nombre"],
    }


@router.post("/{product_id}/apply-enhance")
def apply_enhance(product_id: str, body: dict):
    """Aplica la descripción mejorada y atributos sugeridos al producto."""
    db = get_client()

    fields: dict = {}
    if body.get("descripcion"):
        fields["descripcion"] = body["descripcion"]

    if fields:
        db.table("products").update(fields).eq("id", product_id).execute()

    # Insertar atributos sugeridos que no existan
    nuevos = body.get("atributos_nuevos", [])
    if nuevos:
        db.table("product_attributes").insert([
            {
                "product_id": product_id,
                "variant_id": None,
                "nombre":     a["nombre"],
                "valor":      a["valor"],
                "unidad":     a.get("unidad"),
            }
            for a in nuevos
        ]).execute()

    return {"ok": True}
