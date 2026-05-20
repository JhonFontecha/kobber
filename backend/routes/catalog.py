import asyncio
import base64
import io
import json
import re
import ssl
import urllib.parse
import urllib.request
from collections import defaultdict

import anthropic
import pdfplumber
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from config import ANTHROPIC_API_KEY
from database import get_client

router = APIRouter()

# ── Categorización ML ──────────────────────────────────────────────────────────

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode    = ssl.CERT_NONE

# Overrides manuales para productos que la API clasifica mal
_ML_CATEGORY_OVERRIDES: dict[str, str] = {
    "pisones truper":                              "Pistolas de Riego",
    "pistolas metálicas con recubrimiento truper": "Pistolas de Riego",
    "revolvedor para pasta, mortero y fachada":    "Mezcladores para Taladros",
    "revolvedor para pintura, cemento":            "Mezcladores para Taladros",
    "llave de banda de caucho":                    "Llaves Saca Filtros de Aceite",
    "juego de 4 raspadores":                       "Espátulas",
    "soldadura para tubería":                      "Cautines para Soldar",
}


def get_ml_category(nombre: str, reintentos: int = 3) -> str | None:
    """
    Consulta domain_discovery de ML y devuelve el category_name más relevante.
    Aplica overrides manuales para productos conocidos que se clasifican mal.
    """
    nombre_l = nombre.lower().strip()
    for key, cat in _ML_CATEGORY_OVERRIDES.items():
        if key in nombre_l:
            return cat

    url = (
        "https://api.mercadolibre.com/sites/MCO/domain_discovery/search"
        f"?limit=1&q={urllib.parse.quote(nombre)}"
    )
    for intento in range(reintentos):
        try:
            with urllib.request.urlopen(url, timeout=10, context=_ssl_ctx) as r:
                data = json.loads(r.read())
            return data[0]["category_name"] if data else None
        except Exception:
            if intento < reintentos - 1:
                import time; time.sleep(1)
    return None

# ── Mejora de descripción con Claude ──────────────────────────────────────────

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
3. Usa terminología colombiana.
4. Optimiza para búsquedas en MercadoLibre Colombia.
5. Si hay varias variantes, menciona que "disponible en varias medidas".

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


def enhance_product_data(
    nombre: str,
    marca: str,
    categoria: str,
    variantes: list,
    descripcion_actual: str,
    caracteristicas: list,
    atributos: list,
) -> dict:
    """
    Llama a Claude para generar una descripción mejorada y sugerir atributos.
    Retorna {descripcion, atributos_sugeridos, titulos_sugeridos}.
    """
    variantes_str  = " | ".join(
        f"{v.get('clave','')}: {v.get('descripcion','')}" for v in variantes
    )
    atributos_str  = " | ".join(
        f"{a.get('nombre','')}: {a.get('valor','')} {a.get('unidad','') or ''}".strip()
        for a in atributos
    ) or "ninguno"

    prompt = ENHANCE_PROMPT.format(
        nombre            = nombre,
        marca             = marca or "TRUPER",
        categoria         = categoria or "",
        variantes         = variantes_str or "una variante",
        descripcion_actual= descripcion_actual or "sin descripción",
        caracteristicas   = " | ".join(caracteristicas or []) or "ninguna",
        atributos         = atributos_str,
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    msg    = client.messages.create(
        model      = "claude-haiku-4-5-20251001",
        max_tokens = 1200,
        messages   = [{"role": "user", "content": prompt}],
    )

    raw = msg.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"): raw = raw[4:]

    try:
        return json.loads(raw)
    except Exception:
        return {"descripcion": descripcion_actual, "atributos_sugeridos": [], "titulos_sugeridos": []}


def enhance_product_data_safe(nombre, marca, categoria, variantes, descripcion_actual, caracteristicas, atributos) -> dict:
    """Versión segura — si Claude falla retorna la descripción original sin lanzar excepción."""
    try:
        return enhance_product_data(nombre, marca, categoria, variantes, descripcion_actual, caracteristicas, atributos)
    except Exception as e:
        print(f"[enhance] Fallo para '{nombre}': {e} — usando descripción original")
        return {"descripcion": descripcion_actual, "atributos_sugeridos": [], "titulos_sugeridos": []}


EXTRACTION_PROMPT = """Eres un experto en catálogos de herramientas Trupper. Tu tarea es extraer TODOS los productos visibles en esta página con máxima precisión, especialmente en los precios.

════════════════════════════════════════
REGLAS CRÍTICAS PARA PRECIOS — LEE ESTO PRIMERO
════════════════════════════════════════

1. LA ÚNICA COLUMNA DE PRECIO ES "Distribuidor".
   Ignora cualquier otro número en la tabla que no sea de esa columna.

2. LA COMA ES SEPARADOR DE MILES, NO DECIMAL.
   - "$13,000" → precio_distribuidor: 13000
   - "$25,000" → precio_distribuidor: 25000
   - "$445,000" → precio_distribuidor: 445000
   - "$9,200" → precio_distribuidor: 9200
   NUNCA devuelvas 13 ni 13.0 cuando el catálogo dice $13,000.

3. LA COLUMNA "NC" NO ES PRECIO.
   NC es un número pequeño (1, 2, 3) que indica la cantidad de piezas del empaque retail.
   precio_distribuidor y nc son campos DISTINTOS. NUNCA pongas el valor NC en precio_distribuidor.

4. CADA VARIANTE TIENE SU PROPIO PRECIO.
   Lee el precio fila por fila. No copies el precio de una fila a otra.
   Si una fila no tiene precio visible, usa null — no inventes ni promedies.

5. ANTES DE ESCRIBIR EL JSON, VERIFICA:
   ¿El precio_distribuidor de cada variante corresponde exactamente a lo que dice
   la columna "Distribuidor" en esa misma fila? Si no coincide, corrígelo.

════════════════════════════════════════
ESTRUCTURA A EXTRAER
════════════════════════════════════════

Para cada familia de producto devuelve:
- nombre: nombre completo de la familia (ej: "Cintas antideslizantes negras, en rollo")
- descripcion: descripción larga con usos y características técnicas
- marca: "TRUPPER" o "PRETUL" según sea visible, o null
- categoria: categoría principal (ej: "Cintas antideslizantes")
- subcategoria: subcategoría si existe (ej: "con abrasivo y advertencia"), o null
- seccion: letra de sección visible en la página (ej: "C", "E", "J", "L"), o null
- caracteristicas: bullets exactamente como aparecen (ej: ["Adhesivo acrílico", "Resistente al agua"])
- atributos: atributos que aplican a TODA la familia (no por variante)
  - nombre: clave en minúsculas sin espacios (ej: "grano", "tipo_adhesivo")
  - valor: valor como string
  - unidad: unidad de medida o null
- variantes: CADA fila del cuadro de precios (una entrada por fila)
  - codigo: código numérico de pedido (ej: "12542"), o null
  - clave: clave/SKU alfanumérico (ej: "CIA-15N"), o null
  - descripcion: descripción de esta variante (ej: "25mm (1\\") Largo 5m")
  - precio_distribuidor: número entero sin "$" ni "," — extraído SOLO de la columna "Distribuidor"
                         Ejemplos correctos: 13000, 25000, 445000, 9200
                         Ejemplos INCORRECTOS: 13, 25, 445, "$13,000", "13,000"
  - nc: número entero de la columna NC (1, 2 o 3 típicamente) — NO es precio
  - unidades_caja: número entero de la columna Caja, o null
  - unidades_master: número entero de la columna Máster, o null
  - atributos: atributos específicos de esta variante
    - nombre: clave en minúsculas sin espacios (ej: "ancho", "largo", "peso", "presion")
    - valor: valor como string (ej: "25", "5", "1.5")
    - unidad: unidad de medida o null (ej: "mm", "m", "kg", "psi")

Responde ÚNICAMENTE con JSON válido, sin texto antes ni después:
{"productos": []}"""


def _page_to_jpeg_bytes(page, max_width: int = 1400) -> bytes:
    img_obj = page.images[0] if page.images else None
    if img_obj:
        w, h = img_obj["srcsize"]
        raw = img_obj["stream"].get_data()
        img = Image.frombytes("RGB", (w, h), raw)
    else:
        img = page.to_image(resolution=150).original

    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def _extract_json(text: str) -> dict:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        text = match.group(1)
    return json.loads(text)


def _call_claude(image_bytes: bytes) -> list[dict]:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=8192,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": "image/jpeg", "data": image_b64},
                },
                {"type": "text", "text": EXTRACTION_PROMPT},
            ],
        }],
    )

    text = response.content[0].text
    data = _extract_json(text)
    return data.get("productos", [])


def _save_to_supabase(products_data: list) -> dict:
    db = get_client()
    saved_products  = 0
    saved_variants  = 0
    product_ids_saved: list[str] = []

    for p in products_data:
        nombre       = p.get("nombre", "")
        marca        = p.get("marca") or "TRUPER"
        categoria    = p.get("categoria") or ""
        variantes    = p.get("variantes", [])
        family_attrs = p.get("atributos", [])
        caracteristicas = p.get("caracteristicas", [])

        # Todos los atributos (familia + variantes) para el prompt
        all_attrs = list(family_attrs)
        for v in variantes:
            all_attrs.extend(v.get("atributos", []))

        # Categoría ML
        categoria_ml = get_ml_category(nombre)

        # La descripción ya viene mejorada desde la extracción (SSE)
        # Solo usamos lo que viene en p["descripcion"]

        # Insertar producto
        result = db.table("products").insert({
            "nombre":          nombre,
            "descripcion":     p.get("descripcion"),
            "marca":           marca,
            "categoria":       categoria,
            "subcategoria":    p.get("subcategoria"),
            "seccion":         p.get("seccion"),
            "pagina_catalogo": p.get("pagina_catalogo"),
            "caracteristicas": caracteristicas,
            "estado":          "pendiente",
            "categoria_ml":    categoria_ml,
        }).execute()
        product_id = result.data[0]["id"]
        saved_products += 1
        product_ids_saved.append(product_id)

        # Atributos de familia extraídos del catálogo
        attrs_to_insert = list(family_attrs)

        if attrs_to_insert:
            db.table("product_attributes").insert([
                {"product_id": product_id, "variant_id": None,
                 "nombre": a["nombre"], "valor": a["valor"], "unidad": a.get("unidad")}
                for a in attrs_to_insert
            ]).execute()

        # Variantes y sus atributos
        for v in variantes:
            vresult = db.table("product_variants").insert({
                "product_id":          product_id,
                "codigo":              v.get("codigo"),
                "clave":               v.get("clave"),
                "descripcion":         v.get("descripcion"),
                "precio_distribuidor": v.get("precio_distribuidor"),
                "nc":                  v.get("nc"),
                "unidades_caja":       v.get("unidades_caja"),
                "unidades_master":     v.get("unidades_master"),
                "stock":               0,
                "estado":              "activo",
            }).execute()
            variant_id = vresult.data[0]["id"]
            saved_variants += 1

            variant_attrs = v.get("atributos", [])
            if variant_attrs:
                db.table("product_attributes").insert([
                    {"product_id": product_id, "variant_id": variant_id,
                     "nombre": a["nombre"], "valor": a["valor"], "unidad": a.get("unidad")}
                    for a in variant_attrs
                ]).execute()

    return {"productos": saved_products, "variantes": saved_variants, "product_ids": product_ids_saved}


# ── Búsqueda de imágenes en background ────────────────────────────────────────

async def _fetch_and_save_images_bulk(product_ids: list[str]):
    """Busca imágenes para una lista de productos en paralelo y las guarda en BD."""
    from routes.images import _fetch_for_clave, _save_images

    db = get_client()
    rows = db.table("product_variants").select("product_id, clave") \
        .in_("product_id", product_ids).execute().data

    by_product: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        if r.get("clave"):
            by_product[r["product_id"]].append(r["clave"])

    async def fetch_one(product_id: str, claves: list[str]):
        all_urls: list[str] = []
        for clave in claves:
            urls = await _fetch_for_clave(clave)
            all_urls.extend(urls)
        seen: set = set()
        unique = [u for u in all_urls if not (u in seen or seen.add(u))]
        if unique:
            _save_images(product_id, unique)

    await asyncio.gather(*[
        fetch_one(pid, claves)
        for pid, claves in by_product.items()
    ])


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/extract")
async def extract_catalog(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF")

    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY no configurada en el .env")

    pdf_bytes = await file.read()

    try:
        pdf = pdfplumber.open(io.BytesIO(pdf_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo leer el PDF: {e}")

    total_pages = len(pdf.pages)
    if total_pages > 30:
        raise HTTPException(
            status_code=400,
            detail=f"El PDF tiene {total_pages} páginas. Sube máximo 30 a la vez.",
        )

    async def generate():
        all_products = []
        errors = []

        yield _sse({"type": "start", "total": total_pages})

        for i, page in enumerate(pdf.pages):
            page_num = i + 1
            try:
                img_bytes = _page_to_jpeg_bytes(page)
                products = await asyncio.to_thread(_call_claude, img_bytes)

                # Mejorar descripción de cada producto extraído antes de mostrarlo
                for p in products:
                    p["pagina_catalogo"] = page_num
                    all_attrs = list(p.get("atributos", []))
                    for v in p.get("variantes", []):
                        all_attrs.extend(v.get("atributos", []))
                    enhanced = await asyncio.to_thread(
                        enhance_product_data_safe,
                        p.get("nombre", ""),
                        p.get("marca", "TRUPER"),
                        p.get("categoria", ""),
                        p.get("variantes", []),
                        p.get("descripcion", ""),
                        p.get("caracteristicas", []),
                        all_attrs,
                    )
                    if enhanced.get("descripcion"):
                        p["descripcion"] = enhanced["descripcion"]

                all_products.extend(products)
                yield _sse({
                    "type":        "progress",
                    "page":        page_num,
                    "total":       total_pages,
                    "page_found":  len(products),
                    "total_found": len(all_products),
                })
            except json.JSONDecodeError as e:
                errors.append({"pagina": page_num, "error": f"No se pudo parsear JSON: {e}"})
                yield _sse({"type": "page_error", "page": page_num, "error": str(e)})
            except Exception as e:
                errors.append({"pagina": page_num, "error": str(e)})
                yield _sse({"type": "page_error", "page": page_num, "error": str(e)})

        yield _sse({
            "type":            "done",
            "total_paginas":   total_pages,
            "total_productos": len(all_products),
            "productos":       all_products,
            "errores":         errors,
        })

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/save")
async def save_extraction(body: dict, background_tasks: BackgroundTasks):
    """Guarda los productos extraídos en Supabase y lanza búsqueda de imágenes en background."""
    productos = body.get("productos", [])
    if not productos:
        raise HTTPException(status_code=400, detail="No hay productos para guardar")

    try:
        result = await asyncio.to_thread(_save_to_supabase, productos)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando en Supabase: {e}")

    # Buscar imágenes en background — no bloquea la respuesta al usuario
    if result.get("product_ids"):
        background_tasks.add_task(_fetch_and_save_images_bulk, result["product_ids"])

    return result
