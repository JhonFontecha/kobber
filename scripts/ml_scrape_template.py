"""
1. Consulta domain_discovery de ML para identificar la mejor categoría por producto.
2. Busca esa categoría en la página de publicación masiva usando el domain_name.
3. La agrega al listado y descarga la plantilla con todas.

Corre con:
  python3 scripts/ml_scrape_template.py --file /tmp/productos.txt
  python3 scripts/ml_scrape_template.py "Producto 1" "Producto 2" ...
"""
import sys, ssl, time, json, urllib.request, urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright

SESSION_FILE = "/tmp/ml_session.json"
DOWNLOAD_DIR = Path("/Users/jhon/Downloads")
URL          = "https://www.mercadolibre.com.co/publicar-masivamente/categories"

# ── Overrides manuales: cuando la API clasifica mal ──────────────────────────
CATEGORY_OVERRIDES = {
    "pistolas metálicas con recubrimiento truper": ("Pistolas de Riego",        "Pistolas de riego para jardiner"),
    "pistolas metálicas con recubrimiento truper (2 funciones, producto mejorado)": ("Pistolas de Riego", "Pistolas de riego para jardiner"),
    "revolvedor para pasta, mortero y fachada":    ("Mezcladores para Taladros","Mezcladores para taladros"),
    "llave de banda de caucho":                    ("Llaves Saca Filtros de Aceite", "Llaves saca filtros de aceite"),
}

# Productos sin categoría en ML — se omiten con aviso
SIN_CATEGORIA_ML = {
    "pisones truper",
    "soldadura para tubería de gas",
}

# ── Términos de búsqueda cortos para la página de ML ────────────────────────
# Cuando el nombre completo no da resultados, usar esta versión corta
SEARCH_OVERRIDES = {
    "Grapas Industriales":    "grapas",
    "Mangueras Industriales": "manguera industrial",
    "Palas":                  "pala jardin herramienta",
    "Pieamigos":              "pieamigo",
    "Pisos de Goma":          "pison",
    "Pistolas y Escopetas":   "pistola riego",
    "Alambres para Soldar":   "pasta soldar",
    "Cintas de Peligro":      "cinta peligro",
    "Bandas de Caucho":       "llave filtro aceite",
    "Alicates Crimpeadores":  "alicates crimpeadores",
}

# ── Leer queries ──────────────────────────────────────────────────────────────
if "--file" in sys.argv:
    idx = sys.argv.index("--file")
    with open(sys.argv[idx + 1]) as f:
        queries = [l.strip() for l in f if l.strip()]
elif len(sys.argv) > 1:
    queries = sys.argv[1:]
else:
    queries = ["Mandril 1/2 sin llave TRUPER"]

if not Path(SESSION_FILE).exists():
    print("Primero corre ml_login.py para guardar la sesión.")
    sys.exit(1)

# ── Paso 1: Identificar categorías vía API ───────────────────────────────────
ctx_ssl = ssl.create_default_context()
ctx_ssl.check_hostname = False
ctx_ssl.verify_mode    = ssl.CERT_NONE

def mejor_categoria(producto: str, reintentos: int = 3) -> dict | None:
    url = f"https://api.mercadolibre.com/sites/MCO/domain_discovery/search?limit=3&q={urllib.parse.quote(producto)}"
    for intento in range(reintentos):
        try:
            with urllib.request.urlopen(url, timeout=12, context=ctx_ssl) as r:
                data = json.loads(r.read())
            if data:
                top = data[0]
                return {
                    "category_name": top["category_name"],
                    "domain_name":   top["domain_name"],
                    "category_id":   top["category_id"],
                }
            return None
        except Exception as e:
            if intento < reintentos - 1:
                print(f"  ⏳ Reintentando ({intento+2}/{reintentos})...")
                time.sleep(2)
            else:
                print(f"  ⚠️  API error: {e}")
    return None

print("\n=== PASO 1: Identificando categorías vía API ===\n")
plan = []
categorias_a_agregar = {}   # category_name → {domain_name, producto_repr}

for q in queries:
    # Verificar si no tiene categoría en ML
    if q.lower().strip() in SIN_CATEGORIA_ML:
        print(f"  ⏭️  {q[:45]:<45} → sin categoría en ML (omitido)")
        continue

    # Verificar override manual
    override = CATEGORY_OVERRIDES.get(q.lower().strip())
    if override:
        cat_name, domain_name = override
        print(f"  🔧 {q[:45]:<45} → {cat_name:<28} [override manual]")
        plan.append({"producto": q, "category_name": cat_name, "domain_name": domain_name})
        if cat_name not in categorias_a_agregar:
            categorias_a_agregar[cat_name] = {"domain_name": domain_name, "producto_repr": q}
        time.sleep(0.1)
        continue

    cat = mejor_categoria(q)
    if cat:
        print(f"  ✅ {q[:45]:<45} → {cat['category_name']:<28} [{cat['domain_name']}]")
        plan.append({"producto": q, **cat})
        if cat["category_name"] not in categorias_a_agregar:
            categorias_a_agregar[cat["category_name"]] = {
                "domain_name": cat["domain_name"],
                "producto_repr": q,
            }
    else:
        print(f"  ❌ {q[:45]:<45} → sin resultado en API")
    time.sleep(0.3)

if not categorias_a_agregar:
    print("\nNo se identificó ninguna categoría. Abortando.")
    sys.exit(1)

print(f"\nCategorías únicas a agregar en ML: {len(categorias_a_agregar)}")
for c, info in sorted(categorias_a_agregar.items()):
    print(f"  · {c:<30} [{info['domain_name']}]")

# ── Paso 2: Scraping ──────────────────────────────────────────────────────────
def cerrar_tutorial(page):
    time.sleep(1.5)
    page.keyboard.press("Escape")
    time.sleep(0.5)
    for _ in range(5):
        btn = page.query_selector("button:has-text('Siguiente')")
        if btn and btn.is_visible():
            btn.click(); time.sleep(0.8)
        else:
            break
    try: page.mouse.click(1247, 30); time.sleep(0.5)
    except: pass
    try: page.mouse.click(640, 400); time.sleep(0.5)
    except: pass

def ir_a_tab_categorias(page):
    for sel in ["text=Buscar categorías", "button:has-text('Buscar categorías')"]:
        tab = page.query_selector(sel)
        if tab:
            tab.click(); time.sleep(1); return True
    return False

def buscar_y_agregar(page, producto: str, category_name: str, domain_name: str) -> bool:
    """
    Busca por nombre de producto en ML y selecciona el resultado que coincida
    con category_name O domain_name (lo que ML muestre en pantalla).
    """
    # Término de búsqueda: usar override si existe, si no el producto original
    termino = SEARCH_OVERRIDES.get(category_name, category_name)
    print(f"\n  Buscando: '{termino[:50]}' → esperando '{category_name}' / '{domain_name[:35]}'")

    page.screenshot(path=f"/tmp/ml_antes_busqueda.png")

    # Buscar el campo de texto con múltiples estrategias
    search = None
    SELECTORS = [
        "input[placeholder*='ategor']",
        "input[placeholder*='busca']",
        "input[placeholder*='Busca']",
        "input[placeholder*='categ']",
        "input[type='search']",
        "input[type='text']",
        ".andes-form-control__field",
        "[class*='search'] input",
        "[class*='Search'] input",
        "[class*='input'] input",
        "form input",
    ]
    for sel in SELECTORS:
        try:
            el = page.query_selector(sel)
            if el and el.is_visible():
                search = el
                print(f"  Campo encontrado: {sel}")
                break
        except:
            continue

    if not search:
        # Último recurso: cualquier input visible
        all_inputs = page.query_selector_all("input")
        for el in all_inputs:
            try:
                if el.is_visible():
                    search = el
                    print(f"  Campo encontrado via fallback (input visible)")
                    break
            except:
                continue

    if not search:
        page.screenshot(path=f"/tmp/ml_sin_campo_busqueda.png")
        print("  ⚠️  Campo de búsqueda no encontrado — ver /tmp/ml_sin_campo_busqueda.png")
        return False

    targets = [category_name.lower(), domain_name.lower()]

    # 1. Limpiar y escribir — varios métodos para mayor compatibilidad
    try:
        search.click(timeout=5000)
    except:
        try:
            search.focus()
        except:
            page.evaluate("el => el.focus()", search)

    time.sleep(0.3)

    try:
        search.fill(termino)
    except:
        try:
            search.triple_click()
            search.type(termino, delay=60)
        except:
            page.evaluate(f"el => {{ el.value = '{termino}'; el.dispatchEvent(new Event('input', {{bubbles:true}})); }}", search)

    time.sleep(0.5)

    # 2. Click en botón "Buscar" del formulario (NO el tab)
    #    Usamos JS para encontrar el botón dentro del mismo contenedor que el input
    clicked_buscar = page.evaluate("""() => {
        const inputs = document.querySelectorAll('input');
        for (const input of inputs) {
            const container = input.closest('form') || input.parentElement?.parentElement;
            if (!container) continue;
            const btn = container.querySelector('button');
            if (btn && !btn.getAttribute('role')?.includes('tab')) {
                btn.click();
                return true;
            }
        }
        return false;
    }""")
    if not clicked_buscar:
        search.press("Enter")

    time.sleep(2.5)
    page.screenshot(path=f"/tmp/ml_{category_name[:15].replace(' ','_')}_resultados.png")

    # 3. Primero buscar botones "Agregar" directamente visibles (resultados planos)
    def intentar_agregar():
        btns = [b for b in page.query_selector_all("button:has-text('Agregar')") if b.is_visible()]
        if not btns:
            return False
        # Buscar coincidencia con categoría esperada
        # Primero intentar coincidir con domain_name (más específico)
        # luego con category_name (más general)
        for target in targets:
            for btn in btns:
                try:
                    item_text = btn.evaluate(
                        "b => b.closest('li')?.innerText || b.parentElement?.innerText || ''"
                    ).strip().lower()
                    if target[:20] in item_text:
                        print(f"  ✅ Coincidencia: {item_text[:70]}")
                        btn.click(); time.sleep(1); return True
                except:
                    continue
        # Sin coincidencia exacta — mostrar opciones disponibles y NO hacer clic
        print(f"  ⚠️  Sin coincidencia exacta para '{category_name}'. Opciones disponibles:")
        for btn in btns[:5]:
            try:
                text = btn.evaluate(
                    "b => b.closest('li')?.innerText || b.parentElement?.innerText || ''"
                ).strip()
                print(f"       · {text[:70]}")
            except:
                pass
        return False

    # Intento 1: botones directos
    if intentar_agregar():
        return True

    # Intento 2: expandir acordeón y buscar Agregar dentro
    resultado_items = page.query_selector_all("ul > li, [class*='result'] li, [class*='category'] li")
    for item in resultado_items:
        try:
            texto = item.inner_text().strip().lower()
            if not texto or len(texto) > 200:
                continue
            if any(t[:15] in texto for t in targets):
                print(f"  📂 Expandiendo: {texto[:60]}")
                item.click(); time.sleep(1.5)
                if intentar_agregar():
                    return True
        except:
            continue

    print(f"  ❌ Sin botón Agregar para '{termino}' — revisa /tmp/ml_*.png")
    return False

print("\n=== PASO 2: Agregando categorías en ML ===")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=80)
    ctx     = browser.new_context(storage_state=SESSION_FILE, accept_downloads=True)
    page    = ctx.new_page()

    page.goto(URL)
    page.wait_for_load_state("domcontentloaded", timeout=30000)
    time.sleep(2)

    # Captura inicial para diagnóstico
    page.screenshot(path="/tmp/ml_inicio.png")
    current_url = page.url
    print(f"URL actual: {current_url}")

    # Detectar si fue redirigido al login
    if "login" in current_url or "registration" in current_url or "mercadolibre" not in current_url:
        print("❌ Sesión expirada — redirigido al login. Corre ml_login.py primero.")
        page.screenshot(path="/tmp/ml_login_redirect.png")
        browser.close(); sys.exit(1)

    cerrar_tutorial(page)

    if not ir_a_tab_categorias(page):
        page.screenshot(path="/tmp/ml_sin_tab_categorias.png")
        print("⚠️  No se encontró el tab 'Buscar categorías' — ver /tmp/ml_sin_tab_categorias.png")
        browser.close(); sys.exit(1)

    print("Tab activo: Buscar categorías\n")

    agregadas = 0
    for cat_name, info in sorted(categorias_a_agregar.items()):
        if buscar_y_agregar(page, info["producto_repr"], cat_name, info["domain_name"]):
            agregadas += 1

    print(f"\nCategorías agregadas: {agregadas}/{len(categorias_a_agregar)}")

    if agregadas == 0:
        print("No se agregó ninguna. Abortando.")
        browser.close(); sys.exit(1)

    # Descargar
    print("\nBuscando botón de descarga...")
    time.sleep(1)
    download_btn = None
    for sel in ["button:has-text('Descargar planilla')", "button:has-text('Descargar plantilla')",
                "button:has-text('Descargar')", "a:has-text('Descargar')"]:
        download_btn = page.query_selector(sel)
        if download_btn and download_btn.is_visible():
            print(f"  Botón: {download_btn.inner_text().strip()!r}")
            break

    if not download_btn:
        print("No se encontró el botón de descarga.")
        browser.close(); sys.exit(1)

    print("Descargando...")
    page.screenshot(path="/tmp/ml_antes_descarga.png")
    try:
        with page.expect_download(timeout=60000) as dl:
            download_btn.click(timeout=10000)
        download = dl.value
        dest = DOWNLOAD_DIR / download.suggested_filename
        download.save_as(dest)
        print(f"\n✅ Plantilla descargada: {dest}")
    except Exception as e:
        page.screenshot(path="/tmp/ml_error_descarga.png")
        print(f"\n❌ Error al descargar: {e}")
        print("   Captura guardada en /tmp/ml_error_descarga.png")
        browser.close(); sys.exit(1)
    browser.close()

print("\n=== RESUMEN ===")
for item in plan:
    print(f"  {item['producto'][:45]:<45} → {item['category_name']}")

# Guardar el plan como JSON para que fill-blank-template lo use
import json as _json
plan_path = "/tmp/ml_category_plan.json"
with open(plan_path, "w") as f:
    _json.dump(plan, f, ensure_ascii=False, indent=2)
print(f"\n💾 Plan guardado en: {plan_path}")
