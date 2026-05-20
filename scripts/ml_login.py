"""
Abre un browser, espera que hagas login en ML y guarda la sesión.
Corre con:  python3 scripts/ml_login.py
"""
from playwright.sync_api import sync_playwright

SESSION_FILE = "/tmp/ml_session.json"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=100)
    ctx     = browser.new_context()
    page    = ctx.new_page()

    page.goto("https://www.mercadolibre.com.co/publicar-masivamente/categories")

    print("\n=================================================")
    print("  Browser abierto en MercadoLibre.")
    print("  1. Inicia sesión con tu cuenta")
    print("  2. Asegúrate de llegar a la página de categorías")
    print("  3. Vuelve aquí y presiona Enter para continuar")
    print("=================================================\n")
    input("Presiona Enter cuando estés listo...")

    ctx.storage_state(path=SESSION_FILE)
    page.screenshot(path="/tmp/ml_categories_login.png")

    print(f"\nSesión guardada en: {SESSION_FILE}")
    print(f"URL actual: {page.url}")
    print(f"Título: {page.title()}")
    browser.close()
    print("\nListo. Ya puedes correr ml_scrape_template.py")
