"""Inspecciona la página de ML para encontrar los selectores correctos."""
import time
from playwright.sync_api import sync_playwright
from ml_chrome import ensure_kobber_chrome, KOBBER_CDP_URL
from runtime_paths import runtime_file

URL = "https://www.mercadolibre.com.co/publicar-masivamente/categories"

with sync_playwright() as p:
    ensure_kobber_chrome()
    browser = p.chromium.connect_over_cdp(KOBBER_CDP_URL)
    ctx = browser.contexts[0] if browser.contexts else browser.new_context()
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

    page.screenshot(path=str(runtime_file("ml_inspect.png")))
    print(f"\nScreenshot: {runtime_file('ml_inspect.png')}")
    input("\nPresiona Enter para cerrar...")
    page.close()
