import asyncio
import base64
import io
import json
import re

import anthropic
import pdfplumber
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from config import ANTHROPIC_API_KEY
from database import get_client

router = APIRouter()

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
    saved_products = 0
    saved_variants = 0

    for p in products_data:
        # Insertar producto
        result = db.table("products").insert({
            "nombre":          p.get("nombre", ""),
            "descripcion":     p.get("descripcion"),
            "marca":           p.get("marca"),
            "categoria":       p.get("categoria"),
            "subcategoria":    p.get("subcategoria"),
            "seccion":         p.get("seccion"),
            "pagina_catalogo": p.get("pagina_catalogo"),
            "caracteristicas": p.get("caracteristicas", []),
            "estado":          "pendiente",
        }).execute()
        product_id = result.data[0]["id"]
        saved_products += 1

        # Atributos de la familia
        family_attrs = p.get("atributos", [])
        if family_attrs:
            db.table("product_attributes").insert([
                {"product_id": product_id, "variant_id": None,
                 "nombre": a["nombre"], "valor": a["valor"], "unidad": a.get("unidad")}
                for a in family_attrs
            ]).execute()

        # Variantes y sus atributos
        for v in p.get("variantes", []):
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

    return {"productos": saved_products, "variantes": saved_variants}


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
                for p in products:
                    p["pagina_catalogo"] = page_num
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
async def save_extraction(body: dict):
    """Guarda los productos extraídos (revisados) en Supabase."""
    productos = body.get("productos", [])
    if not productos:
        raise HTTPException(status_code=400, detail="No hay productos para guardar")

    try:
        result = _save_to_supabase(productos)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando en Supabase: {e}")

    return result
