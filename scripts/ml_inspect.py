"""Inspecciona la página de ML para encontrar los selectores correctos."""
import time
from playwright.sync_api import sync_playwright

SESSION_FILE = "/tmp/ml_session.json"
URL = "https://www.mercadolibre.com.co/publicar-masivamente/categories"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=100)
    ctx  = browser.new_context(storage_state=SESSION_FILE)
    page = ctx.new_page()

    page.goto(URL)
    page.wait_for_load_state("networkidle", timeout=20000)
    time.sleep(2)

    # Volcar todos los botones visibles
    print("\n=== BOTONES EN LA PÁGINA ===")
    buttons = page.query_selector_all("button")
    for btn in buttons:
        try:
            txt  = btn.inner_text().strip()[:60]
            cls  = btn.get_attribute("class") or ""
            aria = btn.get_attribute("aria-label") or ""
            vis  = btn.is_visible()
            print(f"  visible={vis} | text={txt!r} | aria={aria!r} | class={cls[:50]!r}")
        except:
            pass

    print("\n=== LINKS/ANCHORS ===")
    links = page.query_selector_all("a")
    for a in links:
        try:
            txt = a.inner_text().strip()[:60]
            if txt: print(f"  {txt!r}")
        except:
            pass

    page.screenshot(path="/tmp/ml_inspect.png")
    print("\nScreenshot: /tmp/ml_inspect.png")
    input("\nPresiona Enter para cerrar...")
    browser.close()
