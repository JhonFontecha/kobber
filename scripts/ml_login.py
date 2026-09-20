"""
Abre (o reutiliza) el Chrome real y persistente propio de Kobber, y una
pestaña ahí para que hagas login en ML. Esa ventana queda corriendo como
proceso del sistema — no la lanza Playwright — así que sigue abierta después
de que este script termina y ml_scrape_template.py puede reutilizarla.

Usa el Chrome instalado de verdad (no el Chromium de pruebas que trae
Playwright por defecto): ML detecta ese Chromium "sin historial" como
navegador automatizado y puede bloquear el login con "Alcanzaste el límite
de intentos". Con Chrome real y un perfil persistente, se ve como un
navegador normal y recurrente.

Corre con:  python3 scripts/ml_login.py
"""
from playwright.sync_api import sync_playwright
from ml_chrome import ensure_kobber_chrome, KOBBER_CDP_URL

try:
    ensure_kobber_chrome()
except RuntimeError as e:
    print(f"❌ {e}")
    raise SystemExit(1)

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(KOBBER_CDP_URL)
    ctx  = browser.contexts[0] if browser.contexts else browser.new_context()
    page = ctx.new_page()

    page.goto("https://www.mercadolibre.com.co/publicar-masivamente/categories")

    print("\n=================================================")
    print("  Pestaña abierta en el Chrome de Kobber.")
    print("  1. Inicia sesión con tu cuenta")
    print("  2. Asegúrate de llegar a la página de categorías")
    print("  3. Vuelve aquí y presiona Enter para continuar")
    print("=================================================\n")
    input("Presiona Enter cuando estés listo...")

    page.screenshot(path="/tmp/ml_categories_login.png")

    print(f"\nURL actual: {page.url}")
    print(f"Título: {page.title()}")
    page.close()  # solo la pestaña — la ventana queda abierta para reutilizarse
    print("\nListo. Ya puedes correr ml_scrape_template.py")
