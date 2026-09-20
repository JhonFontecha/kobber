import asyncio
import base64
import io
import json
import re
import ssl
import time
import traceback
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
Eres experto en catalogo de ferreteria y herramientas para MercadoLibre Colombia.
Tu tarea es generar una descripcion optimizada y sugerir atributos faltantes
para el siguiente producto de la marca {marca}.

DATOS DEL PRODUCTO
Nombre: {nombre}
Categoria: {categoria}
Marca: {marca}
Variantes disponibles: {variantes}
Descripcion actual: {descripcion_actual}
Caracteristicas extraidas: {caracteristicas}
Atributos ya registrados: {atributos}

FORMATO EXACTO PARA LA DESCRIPCION
Sigue este formato EXACTAMENTE. Sin HTML. Sin simbolos especiales (nada de asteriscos,
guiones decorativos, emojis, virgulillas, ni caracteres que no sean letras, numeros,
puntuacion basica o acentos normales del espanol). Texto plano 100% compatible con
MercadoLibre Colombia.

Estructura obligatoria (copia literalmente los encabezados):

Somos Kobber, tu aliado en ferreteria y herramientas de alta calidad. Distribuimos las mejores marcas del mercado, comprometidos con ofrecerte productos confiables, duraderos y al mejor precio. Trabajamos para satisfacer las necesidades de profesionales, contratistas y aficionados en toda Colombia.

Nombre: [nombre comercial completo del producto]
Marca: {marca}
Descripcion: [Una oracion con funcion principal y beneficio clave. Si hay varias
             variantes de tamano, agrega "disponible en varias medidas".]
Caracteristicas principales: [Lista separada por comas, sin guiones ni puntos]
Serie o linea: [nombre de la linea/serie si aplica, o el tipo de producto]

Caracteristicas
[Atributo 1]: [valor con unidad]
[Atributo 2]: [valor con unidad]
[Atributo 3]: [valor con unidad]
(incluye material, medidas, capacidad, potencia, norma; minimo 5 atributos)

[Parrafo ampliado: describe usos, aplicaciones y detalles tecnicos relevantes
 en 2-4 oraciones. Menciona donde se usa, para quien es ideal y que lo diferencia.]

[Especificaciones tecnicas en formato clave: valor, una por linea]
Aplicaciones: [lista de aplicaciones separadas por coma — minimo 6]

INSTRUCCIONES ADICIONALES
1. Usa tu conocimiento de los productos Truper/Pretul/FIERO para completar informacion.
2. Se preciso con medidas y materiales; no inventes datos que no puedas confirmar.
3. NUNCA menciones "garantia de por vida", "garantia de fabrica" ni ningun tipo de garantia
   a menos que el dato venga explicitamente en los atributos o caracteristicas del producto.
4. Usa terminologia colombiana de ferreteria.
5. Optimiza para busquedas en MercadoLibre Colombia.
5. COLOR: Revisa los atributos registrados. Si YA existe un atributo "color", NO lo modifiques.
   Si NO existe, agregalo en atributos_sugeridos usando tu conocimiento visual del producto.
   FORMATO OBLIGATORIO: "Color1/Color2" (cuerpo / empunadura o accesorio).
   Ejemplos correctos: "Plateado/Naranja", "Negro/Rojo", "Amarillo/Negro"
   Formato: {{"nombre": "color", "valor": "Color1/Color2", "unidad": null}}
6. PULGADAS: en la descripcion (y en cualquier atributo/medida que generes), si una
   medida va en pulgadas usa el simbolo " pegado al numero, sin espacio entre el numero
   y el simbolo (9", 8", 3", 1/2" — nunca "9 \"" con espacio).
7. ORTOGRAFIA DE MARCA: se escribe "Truper" (una sola P) — NUNCA "Trupper". No lo
   escribas de memoria: usa exactamente el valor recibido en Marca ({marca}), letra por
   letra, en cada lugar donde menciones la marca (linea "Marca:", "Serie o linea",
   parrafo ampliado, etc). No confies en tu conocimiento general de la marca.
8. MARCA SIN CONFIRMAR: si Marca dice "SIN CONFIRMAR", el catalogo no permitio
   identificarla con certeza al capturar el producto. NO asumas Truper ni ninguna otra
   marca — intenta deducirla de Nombre/Descripcion actual/Caracteristicas si hay una
   pista clara e inequivoca; si no la hay, omite toda mencion de marca (no escribas
   "SIN CONFIRMAR" literal en el texto, y en la linea "Marca:" deja el valor vacio).

TITULOS PARA MERCADOLIBRE COLOMBIA
Genera 4 titulos. Cada uno debe usar un sinonimo distinto como primera palabra
para capturar diferentes busquedas del mismo producto.

IMPORTANTE — ESPANOL COLOMBIANO, NO MEXICANO:
El catalogo fuente (Truper) esta escrito en espanol de Mexico. Traduce los terminos a como
los busca un comprador colombiano en ferreteria, aunque el catalogo diga otra cosa. Ejemplos
de terminos que CAMBIAN entre Mexico y Colombia:
  - "cincho" (MX) -> "abrazadera" (CO)
  - "perico"/"chalupa" (MX, tipo de pinza) -> "pinza" o "alicate" (CO — "perico" no se usa)
  - "desarmador" (MX) -> "destornillador" (CO)
  - "cinta canela" (MX) -> "cinta de enmascarar" o "cinta pegante" (CO)
  - "taquete" (MX) -> "chazo" o "taco de expansion" (CO)
  - "cubeta" (MX, balde) -> "balde" (CO)
Ante la duda, priorizá siempre el termino que usaria un comprador colombiano buscando en
MercadoLibre, nunca el que aparece literal en el catalogo.

COMO SE TITULA REALMENTE EN MERCADOLIBRE COLOMBIA:
Los compradores buscan con texto libre y ML ordena por relevancia de palabras clave. Los
titulos que mejor posicionan siguen este patron:
  [Termino de busqueda generico] [Marca] [Diferenciador especifico] [Medida/material/uso]
- La PRIMERA palabra es la que mas gente escribiria en el buscador (el nombre generico de
  la herramienta) — nunca la marca ni un adjetivo.
- No uses relleno que no aporta busqueda: "profesional", "alta calidad", "nuevo", "garantia"
  — nadie busca por esas palabras, solo ocupan caracteres que le restan al diferenciador.
- El diferenciador debe ser algo por lo que un comprador SI filtraria: material (cromo
  vanadio, acero), medida (9", 1/2"), norma (ASME) o uso especifico (electricista, plomeria).

FORMULA: [Sinonimo generico] + [Marca] + [Diferenciador clave] + [Medida o material]

REGLAS:
1. LIMITE ESTRICTO: maximo 60 caracteres por titulo, espacios incluidos.
   ANTES de escribir cada titulo, cuenta sus caracteres. Si supera 60, elimina
   palabras del final hasta que quede en 60 o menos. NUNCA entregues un titulo
   de mas de 60 caracteres.
2. El primer termino de cada titulo debe ser un sinonimo diferente del producto
   (ej: alicate / pinzas / tenaza / cortador / pela-cable / ponchador).
3. Incluye la marca ({marca}) en todos los titulos — EXCEPTO si Marca dice
   "SIN CONFIRMAR": en ese caso NO la menciones ni la inventes (nunca asumas Truper),
   usa ese espacio para el diferenciador tecnico en su lugar.
4. Incluye el diferenciador mas relevante: material, tamano, uso, norma o funcion especial.
5. No uses articulos (el, la, los, de, para) — ocupan caracteres sin aportar a busquedas.
6. No repitas el mismo sinonimo en dos titulos.
7. Si el producto tiene variantes de tamano, elige la mas representativa o usa "Varias Medidas".
8. Usa terminologia colombiana de ferreteria — ver la lista de arriba, no mexicanismos.
9. Sin acentos ni tildes en los titulos (ML los indexa mejor sin ellos).
10. No uses palabras de relleno sin valor de busqueda (profesional, calidad, nuevo, garantia).
11. PULGADAS: si la medida va en pulgadas, usa el simbolo " pegado al numero, sin espacio
    entre el numero y el simbolo (9", 8", 3", 1/2" — nunca "9 "" ni "9 Pulgadas").

EJEMPLO para un alicate de electricista 9 pulgadas cromo vanadio Truper (catalogo dice "perico"):
  "Alicate Electricista Truper 9" Cromo Vanadio"    44 chars OK
  "Pinzas Electricista Truper Alta Palanca Cr-V"    45 chars OK
  "Tenaza Electricista Truper 9" Acero ASME"        40 chars OK
  "Cortafrio Electricista Truper 9" Palanca"        40 chars OK

Responde UNICAMENTE con este JSON (sin markdown):
{{
  "descripcion": "...",
  "atributos_sugeridos": [
    {{"nombre": "...", "valor": "...", "unidad": "..."}},
    ...
  ],
  "titulos_por_variante": [
    {{
      "clave": "CLAVE-SKU-1",
      "titulos": [
        "Sinonimo1 {marca} diferenciador medida-variante1",
        "Sinonimo2 {marca} diferenciador medida-variante1",
        "Sinonimo3 {marca} diferenciador medida-variante1",
        "Sinonimo4 {marca} diferenciador medida-variante1"
      ]
    }},
    {{
      "clave": "CLAVE-SKU-2",
      "titulos": [
        "Sinonimo1 {marca} diferenciador medida-variante2",
        "Sinonimo2 {marca} diferenciador medida-variante2",
        "Sinonimo3 {marca} diferenciador medida-variante2",
        "Sinonimo4 {marca} diferenciador medida-variante2"
      ]
    }}
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
    variantes_str = "\n".join(
        f"  - Clave: {v.get('clave','(sin clave)')} | Descripción: {v.get('descripcion','')}"
        for v in variantes
    ) or "  - una variante sin clave"
    atributos_str  = " | ".join(
        f"{a.get('nombre','')}: {a.get('valor','')} {a.get('unidad','') or ''}".strip()
        for a in atributos
    ) or "ninguno"

    prompt = ENHANCE_PROMPT.format(
        nombre            = nombre,
        marca             = marca or "SIN CONFIRMAR",
        categoria         = categoria or "",
        variantes         = variantes_str or "una variante",
        descripcion_actual= descripcion_actual or "sin descripción",
        caracteristicas   = " | ".join(caracteristicas or []) or "ninguna",
        atributos         = atributos_str,
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    msg    = client.messages.create(
        model      = "claude-haiku-4-5-20251001",
        max_tokens = 4096,
        messages   = [{"role": "user", "content": prompt}],
    )

    raw = msg.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"): raw = raw[4:]

    try:
        return json.loads(raw)
    except Exception:
        return {"descripcion": descripcion_actual, "atributos_sugeridos": [], "titulos_por_variante": []}


_ENHANCE_SEM = asyncio.Semaphore(5)   # máximo 5 llamadas Claude simultáneas


async def _enhance_one(p: dict, page_num: int | None = None) -> None:
    """Mejora descripción y títulos de un producto. Modifica el dict en-place."""
    if page_num is not None:
        p["pagina_catalogo"] = p.get("pagina_catalogo") or page_num
    all_attrs = list(p.get("atributos", []))
    for v in p.get("variantes", []):
        all_attrs.extend(v.get("atributos", []))
    async with _ENHANCE_SEM:
        enhanced = await asyncio.to_thread(
            enhance_product_data_safe,
            p.get("nombre", ""), p.get("marca") or "",
            p.get("categoria", ""), p.get("variantes", []),
            p.get("descripcion", ""), p.get("caracteristicas", []), all_attrs,
        )
    if enhanced.get("descripcion"):
        p["descripcion"] = enhanced["descripcion"]
    titulos_raw = enhanced.get("titulos_por_variante") or []
    p["titulos_por_variante"] = _truncar_titulos(titulos_raw)
    if enhanced.get("atributos_sugeridos"):
        p["atributos_sugeridos"] = enhanced["atributos_sugeridos"]


async def _fetch_images_one(p: dict) -> None:
    """Busca imagenes candidatas (URLs directas en truper.com) para revisar antes de
    guardar. No las guarda en BD — solo las agrega al dict en memoria para que el
    frontend muestre una galeria seleccionable durante la revision."""
    from routes.images import _fetch_for_clave

    claves = [v["clave"] for v in p.get("variantes", []) if v.get("clave")]
    if not claves:
        p["imagenes_candidatas"] = []
        return

    resultados = await asyncio.gather(*[_fetch_for_clave(c) for c in claves])
    seen: set = set()
    unique = [u for urls in resultados for u in urls if not (u in seen or seen.add(u))]
    p["imagenes_candidatas"] = unique


def _truncar_titulos(titulos_por_variante, max_chars: int = 60) -> list:
    if not titulos_por_variante:
        return []
    resultado = []
    for item in titulos_por_variante:
        titulos_ok = []
        for t in item.get("titulos", []):
            if len(t) <= max_chars:
                titulos_ok.append(t)
            else:
                titulos_ok.append(t[:max_chars].rsplit(" ", 1)[0])
        resultado.append({"clave": item.get("clave", ""), "titulos": titulos_ok})
    return resultado


def enhance_product_data_safe(nombre, marca, categoria, variantes, descripcion_actual, caracteristicas, atributos) -> dict:
    """
    Versión segura con dos intentos.
    - Siempre guarda la mejor descripción obtenida (aunque los títulos fallen).
    - Reintenta una vez si titulos_por_variante viene vacío o null.
    """
    best = {"descripcion": descripcion_actual, "atributos_sugeridos": [], "titulos_por_variante": []}

    for intento in range(2):
        try:
            result = enhance_product_data(nombre, marca, categoria, variantes, descripcion_actual, caracteristicas, atributos)

            # Siempre conservar la mejor descripción disponible
            if result.get("descripcion"):
                best["descripcion"] = result["descripcion"]
            if result.get("atributos_sugeridos"):
                best["atributos_sugeridos"] = result["atributos_sugeridos"]

            if result.get("titulos_por_variante"):
                best["titulos_por_variante"] = result["titulos_por_variante"]
                return best  # Tenemos todo — salir

            if intento == 0:
                print(f"[enhance] titulos_por_variante vacío para '{nombre}' — reintentando")

        except Exception as e:
            print(f"[enhance] Fallo para '{nombre}' (intento {intento+1}): {e}")

    return best  # Devuelve lo mejor que se pudo obtener


EXTRACTION_PROMPT = """Eres un experto en catálogos de herramientas Truper. Tu tarea es extraer TODOS los productos visibles en esta página con máxima precisión, especialmente en los precios.

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

4. CADA FILA TIENE SU PROPIO PRECIO.
   Lee el precio fila por fila. No copies el precio de una fila a otra.
   Si una fila no tiene precio visible, usa null — no inventes ni promedies.

5. ANTES DE ESCRIBIR EL JSON, VERIFICA:
   ¿El precio_distribuidor de cada producto corresponde exactamente a lo que dice
   la columna "Distribuidor" en esa fila? Si no coincide, corrígelo.

6. CLAVES Y CÓDIGOS SKU — LECTURA EXACTA DE CARACTERES:
   Los códigos como "T210-9X", "CIA-15N", "PEX-12" mezclan letras y números.
   Presta especial atención a estos caracteres fáciles de confundir:
   - La letra "I" (mayúscula) vs el número "1" (uno) vs la letra "l" (ele minúscula)
   - La letra "O" (mayúscula) vs el número "0" (cero)
   - La letra "X" vs el número "×" o el símbolo "x"
   - La letra "S" vs el número "5"
   - La letra "Z" vs el número "2"
   - La letra "B" vs el número "8" (ej: clave real "MOTB-4" mal leída como "MOT8-4")
   Copia el código EXACTAMENTE como aparece en el catálogo, carácter por carácter.
   NUNCA adivines ni normalices un código — si dice "9X", escribe "9X", no "9I" ni "91".

7. PULGADAS: en "nombre" y "descripcion" (familia y variantes), si una medida va en
   pulgadas usa el símbolo " pegado al número, sin espacio entre el número y el símbolo
   (9", 8", 3", 1/2" — nunca "9 \"" con espacio). Aplica aunque el catálogo fuente traiga
   el espacio.

════════════════════════════════════════
ORIENTACIÓN DEL CUADRO DE PRECIOS
════════════════════════════════════════

El cuadro de precios puede venir en dos orientaciones:

A) FILAS: cada fila es un SKU distinto (lo más común).
   Código | Clave  | Descripción  | Precio | NC | Caja | Máster
   12345  | T200-6 | 6" (15 cm)   | 18000  |  2 |   12 |    48
   12346  | T200-7 | 7" (18 cm)   | 21000  |  2 |   12 |    48

B) COLUMNAS: cada columna es un SKU distinto.
   Atributo | SKU 1   | SKU 2   | SKU 3
   Código   | 12345   | 12346   | 12347
   Clave    | T200-6  | T200-7  | T200-8
   Precio   | 18000   | 21000   | 25000

En ambos casos extrae todos los SKU como entradas del array "variantes".

════════════════════════════════════════
ESTRUCTURA A EXTRAER
════════════════════════════════════════

Para cada familia de producto devuelve:
- nombre: nombre completo de la familia (ej: "Alicates de electricista con jalacables")
- descripcion: descripción larga con usos y características técnicas
- marca: DEDUCE la marca activamente antes de rendirte a null — mira TODA la página, no
  solo el texto junto al producto:
  1. Texto impreso junto al producto o en el encabezado/pie de la página (ej: "TRUPER",
     "PRETUL", "FIERO").
  2. Logo o isotipo de marca visible en cualquier parte de la página (esquinas, membrete,
     franja de color característica de cada marca), aunque no haya texto junto al producto.
  3. Encabezado de sección o de página que indique la marca de todo ese bloque — el
     catálogo agrupa productos por marca en secciones, así que una marca declarada al
     inicio de la sección aplica a los productos de esa sección aunque no se repita en
     cada fila.
  El catálogo mezcla varias marcas reales (Truper, Pretul, FIERO, y posiblemente otras) —
  NUNCA asumas que un producto es TRUPER solo porque la mayoría del catálogo lo es.
  Usa null ÚNICAMENTE si tras revisar los 3 puntos anteriores sigue sin haber ninguna
  pista — no inventes ni copies la marca de otra página sin evidencia en esta.
  Ortografía: cuando la marca sea Truper, respeta su ortografía real — se escribe
  "TRUPER" con una sola P, NUNCA "TRUPPER".
- categoria: categoría principal (ej: "Alicates")
- subcategoria: subcategoría si existe, o null
- seccion: letra de sección visible en la página (ej: "C", "E", "J", "L"), o null
- pagina_catalogo: número entero visible en la esquina superior derecha o izquierda (ej: 18, 42). Si no hay número visible, usa null
- caracteristicas: bullets exactamente como aparecen (ej: ["Adhesivo acrílico", "Resistente al agua"])
- atributos: atributos que aplican a TODA la familia (no por variante)
  - nombre: clave en minúsculas sin espacios (ej: "grano", "tipo_adhesivo")
  - valor: valor como string
  - unidad: unidad de medida o null
- variantes: CADA fila/columna del cuadro de precios (una entrada por SKU)
  - codigo: código numérico de pedido (ej: "12542"), o null
  - clave: clave/SKU alfanumérico (ej: "CIA-15N"), o null
  - descripcion: descripción de esta variante (ej: "25mm (1\\") Largo 5m")
  - precio_distribuidor: número entero sin "$" ni "," — extraído SOLO de la columna "Distribuidor"
                         Ejemplos correctos: 13000, 25000, 445000, 9200
                         Ejemplos INCORRECTOS: 13, 25, 445, "$13,000", "13,000"
  - nc: número entero de la columna NC (1, 2 o 3 típicamente) — NO es precio
  - unidades_caja: número entero de la columna Caja, o null
  - unidades_master: número entero de la columna Máster, o null
  - color: color del producto identificado VISUALMENTE en la imagen (mira la foto o ilustración del producto).
            Usa el formato "Color1/Color2" — el color principal del cuerpo y el color de la empuñadura o accesorio.
            Ejemplos: "Plateado/Naranja", "Amarillo/Negro", "Rojo/Negro", "Plateado/Rojo"
            NO lo saques del texto escrito — obsérvalos directamente en la imagen del producto.
            Si no hay imagen visible del producto en la página, usa null.
  - atributos: atributos específicos de esta variante
    - nombre: clave en minúsculas sin espacios (ej: "ancho", "largo", "peso", "presion")
    - valor: valor como string (ej: "25", "5", "1.5")
    - unidad: unidad de medida o null (ej: "mm", "m", "kg", "psi")

Responde ÚNICAMENTE con JSON válido, sin texto antes ni después:
{"productos": []}"""


ACCEPTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def _page_to_jpeg_bytes(page, max_width: int = 1400) -> bytes:
    img_obj = page.images[0] if page.images else None
    img = None
    if img_obj:
        try:
            w, h = img_obj["srcsize"]
            raw = img_obj["stream"].get_data()
            img = Image.frombytes("RGB", (w, h), raw)
        except (ValueError, TypeError) as e:
            # El stream puede venir comprimido (ej. DCTDecode/JPEG) o en un modo de
            # color distinto a RGB sin comprimir — get_data() no lo decodifica en esos
            # casos, así que los bytes crudos no coinciden con width*height*3 y
            # frombytes falla. Renderizamos la página completa como fallback en vez
            # de perder la página entera.
            print(f"[extract] no se pudo leer imagen embebida directamente ({e}); "
                  f"renderizando pagina completa como fallback")
    if img is None:
        img = page.to_image(resolution=100).original

    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def _page_from_filename(filename: str) -> int | None:
    m = re.search(r'(?:p(?:ag(?:ina)?)?[_\-\s]?)(\d+)', filename.lower())
    return int(m.group(1)) if m else None


def _image_file_to_jpeg_bytes(image_bytes: bytes, max_width: int = 1400) -> bytes:
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def _extract_json(text: str) -> dict:
    text = text.strip()
    # Quitar apertura de bloque de código si existe (con o sin cierre)
    if text.startswith("```"):
        # Saltar la primera línea (```json o ```)
        text = text.split("\n", 1)[1] if "\n" in text else ""
        # Quitar cierre si está presente
        if text.rstrip().endswith("```"):
            text = text.rstrip()[:-3].rstrip()
    return json.loads(text)


def _call_claude(image_bytes: bytes) -> list[dict]:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=16384,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": EXTRACTION_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": "image/jpeg", "data": image_b64},
                },
            ],
        }],
    )

    text = response.content[0].text
    data = _extract_json(text)
    return data.get("productos", [])


def _save_to_supabase(products_data: list) -> dict:
    from routes.images import _save_images

    db = get_client()
    saved_products  = 0
    saved_variants  = 0
    product_ids_saved: list[str] = []
    # Productos para los que el frontend NO mando seleccion de imagenes (revision
    # vieja o llamada directa a /save) — a esos les corremos el fetch en background
    # como antes. Si mando seleccion (aunque sea vacia = "ninguna"), la respetamos
    # y no pisamos la decision del usuario con un fetch a ciegas.
    product_ids_sin_seleccion: list[str] = []

    for p in products_data:
        nombre       = p.get("nombre", "")
        # No forzar "TRUPER" cuando Claude no pudo confirmar la marca en la pagina —
        # el catalogo incluye Truper/Pretul/FIERO y a veces otras; asumir Truper por
        # defecto mete marca incorrecta en productos que en realidad son de otra marca.
        marca        = p.get("marca") or ""
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

        # Deduplicación: saltar si ya existe un producto con mismo nombre y marca
        existing = db.table("products") \
            .select("id") \
            .eq("nombre", nombre) \
            .eq("marca", marca) \
            .limit(1) \
            .execute()
        if existing.data:
            print(f"[save] Duplicado ignorado: '{nombre}' ({marca})")
            continue

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

        # Imagenes elegidas por el usuario en la revision (checkboxes sobre las
        # imagenes_candidatas encontradas durante la extraccion). None = el frontend
        # no mando este campo -> cae al fetch en background de siempre.
        imagenes_sel = p.get("imagenes_seleccionadas")
        if imagenes_sel is not None:
            if imagenes_sel:
                _save_images(product_id, imagenes_sel)
        else:
            product_ids_sin_seleccion.append(product_id)

        # Atributos de familia extraídos del catálogo
        attrs_to_insert = list(family_attrs)

        if attrs_to_insert:
            db.table("product_attributes").insert([
                {"product_id": product_id, "variant_id": None,
                 "nombre": a["nombre"], "valor": a["valor"], "unidad": a.get("unidad")}
                for a in attrs_to_insert
            ]).execute()

        atributos_sugeridos = p.get("atributos_sugeridos", [])
        if atributos_sugeridos:
            db.table("product_attributes").insert([
                {"product_id": product_id, "variant_id": None,
                 "nombre": a["nombre"], "valor": a["valor"], "unidad": a.get("unidad")}
                for a in atributos_sugeridos
            ]).execute()

        # Índice clave → titulos para lookup O(1)
        titulos_idx = {
            item["clave"]: item["titulos"]
            for item in p.get("titulos_por_variante", [])
            if item.get("clave")
        }

        # Variantes y sus atributos
        for v in variantes:
            clave = v.get("clave")
            vresult = db.table("product_variants").insert({
                "product_id":          product_id,
                "codigo":              v.get("codigo"),
                "clave":               clave,
                "descripcion":         v.get("descripcion"),
                "precio_distribuidor": v.get("precio_distribuidor"),
                "nc":                  v.get("nc"),
                "unidades_caja":       v.get("unidades_caja"),
                "unidades_master":     v.get("unidades_master"),
                "stock":               0,
                "estado":              "activo",
                "titulos_sugeridos":   titulos_idx.get(clave, []),
            }).execute()
            variant_id = vresult.data[0]["id"]
            saved_variants += 1

            variant_attrs = list(v.get("atributos", []))

            # Si el catálogo incluyó color en la variante, agregarlo como atributo
            if v.get("color"):
                variant_attrs.append({"nombre": "color", "valor": v["color"], "unidad": None})

            if variant_attrs:
                db.table("product_attributes").insert([
                    {"product_id": product_id, "variant_id": variant_id,
                     "nombre": a["nombre"], "valor": a["valor"], "unidad": a.get("unidad")}
                    for a in variant_attrs
                ]).execute()

    return {
        "productos":   saved_products,
        "variantes":   saved_variants,
        "product_ids": product_ids_saved,
        "product_ids_sin_seleccion": product_ids_sin_seleccion,
    }


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
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY no configurada en el .env")

    filename = file.filename.lower()
    ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""
    is_image = ext in ACCEPTED_IMAGE_EXTENSIONS
    is_pdf = ext == ".pdf"

    if not is_image and not is_pdf:
        raise HTTPException(status_code=400, detail="Se aceptan PDF, JPG, PNG o WEBP")

    file_bytes = await file.read()

    # ── Flujo imagen ──────────────────────────────────────────────────────────
    if is_image:
        page_num_from_file = _page_from_filename(file.filename)

        async def generate_from_image():
            yield _sse({"type": "start", "total": 1})
            try:
                img_bytes = await asyncio.to_thread(_image_file_to_jpeg_bytes, file_bytes)
                products = await asyncio.to_thread(_call_claude, img_bytes)

                page_fallback = page_num_from_file or 1
                for p in products:
                    p["pagina_catalogo"] = p.get("pagina_catalogo") or page_fallback

                await asyncio.gather(
                    *[_enhance_one(p) for p in products],
                    *[_fetch_images_one(p) for p in products],
                )

                yield _sse({"type": "progress", "page": 1, "total": 1,
                            "page_found": len(products), "total_found": len(products)})
                yield _sse({"type": "done", "total_paginas": 1,
                            "total_productos": len(products), "productos": products, "errores": []})
            except Exception as e:
                print(f"[extract] imagen — error: {e!r}")
                traceback.print_exc()
                yield _sse({"type": "page_error", "page": 1, "error": str(e)})
                yield _sse({"type": "done", "total_paginas": 1,
                            "total_productos": 0, "productos": [], "errores": [{"pagina": 1, "error": str(e)}]})

        return StreamingResponse(
            generate_from_image(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    # ── Flujo PDF ─────────────────────────────────────────────────────────────
    try:
        pdf = pdfplumber.open(io.BytesIO(file_bytes))
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
            t_start = time.time()
            try:
                img_bytes = _page_to_jpeg_bytes(page)
                products = await asyncio.to_thread(_call_claude, img_bytes)

                for p in products:
                    p["pagina_catalogo"] = p.get("pagina_catalogo") or page_num
                await asyncio.gather(
                    *[_enhance_one(p) for p in products],
                    *[_fetch_images_one(p) for p in products],
                )

                all_products.extend(products)
                yield _sse({
                    "type":        "progress",
                    "page":        page_num,
                    "total":       total_pages,
                    "page_found":  len(products),
                    "total_found": len(all_products),
                    "elapsed_s":   round(time.time() - t_start, 1),
                })
            except json.JSONDecodeError as e:
                print(f"[extract] pagina {page_num} — JSON invalido: {e}")
                errors.append({"pagina": page_num, "error": f"No se pudo parsear JSON: {e}"})
                yield _sse({"type": "page_error", "page": page_num, "error": str(e),
                            "elapsed_s": round(time.time() - t_start, 1)})
            except Exception as e:
                print(f"[extract] pagina {page_num} — error: {e!r}")
                traceback.print_exc()
                errors.append({"pagina": page_num, "error": str(e)})
                yield _sse({"type": "page_error", "page": page_num, "error": str(e),
                            "elapsed_s": round(time.time() - t_start, 1)})

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

    # Buscar imágenes en background SOLO para los productos donde el frontend no
    # mando una seleccion explicita (ver _save_to_supabase) — si el usuario ya
    # eligio/desmarco imagenes en la revision, esa decision ya se guardo y no la
    # pisamos con un fetch a ciegas.
    if result.get("product_ids_sin_seleccion"):
        background_tasks.add_task(_fetch_and_save_images_bulk, result["product_ids_sin_seleccion"])

    return result
