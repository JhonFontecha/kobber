import base64
import io
import json
import re

import anthropic
import pdfplumber
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image

from config import ANTHROPIC_API_KEY

router = APIRouter()

EXTRACTION_PROMPT = """Eres un experto en catálogos de herramientas Trupper.

Analiza esta página del catálogo y extrae TODOS los productos visibles.

Para cada producto devuelve:
- nombre: nombre completo del producto (ej: "Alicates de electricista profesionales, alta palanca, uso industrial, Comfort Grip")
- sku: código/clave principal del producto (ej: "T500-R6", "12350")
- descripcion: descripción completa incluyendo materiales, características y uso
- variantes: array de variantes disponibles con sus medidas y precios
  - sku: código específico de la variante
  - largo: medida de largo (con unidad, ej: "6\"", "150 mm")
  - largo_mm: medida en mm como número o null
  - precio_distribuidor: precio distribuidor como número sin símbolos, o null
  - precio_mc: precio MC como número sin símbolos, o null
- unidades_caja: cantidad de unidades por caja como número entero, o null
- categoria_sugerida: categoría apropiada para MercadoLibre (ej: "Herramientas > Alicates y tenazas")

Responde ÚNICAMENTE con JSON válido, sin texto antes ni después:
{"productos": []}"""


def _page_to_jpeg_bytes(page, max_width: int = 1400) -> bytes:
    img_obj = page.images[0] if page.images else None
    if img_obj:
        w, h = img_obj["srcsize"]
        raw = img_obj["stream"].get_data()
        img = Image.frombytes("RGB", (w, h), raw)
    else:
        # Render page at 150 DPI if no embedded image
        img = page.to_image(resolution=150).original

    # Resize if too wide (reduces token cost)
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def _extract_json(text: str) -> dict:
    """Try to parse JSON from Claude's response, handle markdown code blocks."""
    text = text.strip()
    # Remove markdown code block if present
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        text = match.group(1)
    return json.loads(text)


def _call_claude(image_bytes: bytes) -> list[dict]:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_b64,
                        },
                    },
                    {"type": "text", "text": EXTRACTION_PROMPT},
                ],
            }
        ],
    )

    text = response.content[0].text
    data = _extract_json(text)
    return data.get("productos", [])


@router.post("/extract")
async def extract_catalog(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF")

    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY no configurada en el .env del backend",
        )

    pdf_bytes = await file.read()

    try:
        pdf = pdfplumber.open(io.BytesIO(pdf_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo leer el PDF: {e}")

    total_pages = len(pdf.pages)
    if total_pages > 30:
        raise HTTPException(
            status_code=400,
            detail=f"El PDF tiene {total_pages} páginas. Sube máximo 30 páginas a la vez para no exceder los límites.",
        )

    all_products = []
    errors = []

    for i, page in enumerate(pdf.pages):
        page_num = i + 1
        try:
            img_bytes = _page_to_jpeg_bytes(page)
            products = _call_claude(img_bytes)
            for p in products:
                p["pagina_catalogo"] = page_num
            all_products.extend(products)
        except json.JSONDecodeError as e:
            errors.append({"pagina": page_num, "error": f"No se pudo parsear JSON: {e}"})
        except Exception as e:
            errors.append({"pagina": page_num, "error": str(e)})

    return {
        "total_paginas": total_pages,
        "total_productos": len(all_products),
        "productos": all_products,
        "errores": errors,
    }
