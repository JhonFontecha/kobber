"""
Maneja el Chrome real y persistente propio de Kobber para automatizar ML.

Se lanza como proceso independiente del sistema operativo (no como browser
"owned" por Playwright) para que sobreviva entre corridas de los scripts:
Playwright mata el navegador que él mismo lanza en cuanto su conexión se
cierra, así que si quisiéramos reutilizar la misma ventana/pestaña entre
ejecuciones, no podemos usar p.chromium.launch_persistent_context() — hay
que lanzar Chrome aparte y solo conectarnos por CDP.

Usa channel Chrome real (no el Chromium de pruebas de Playwright) porque ML
bloquea ese último como navegador automatizado.
"""
import subprocess
import time
import urllib.request
from pathlib import Path

PROFILE_DIR    = Path("/tmp/ml_chrome_profile")
CDP_PORT       = 9223
KOBBER_CDP_URL = f"http://localhost:{CDP_PORT}"
CHROME_BIN     = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def _cdp_alive() -> bool:
    try:
        urllib.request.urlopen(f"{KOBBER_CDP_URL}/json/version", timeout=1.5)
        return True
    except Exception:
        return False


def ensure_kobber_chrome(timeout: float = 20.0) -> None:
    """Se asegura de que el Chrome del perfil de Kobber esté corriendo con
    depuración remota. Si ya está abierto, no hace nada (se reutiliza)."""
    if _cdp_alive():
        return

    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    subprocess.Popen(
        [
            CHROME_BIN,
            f"--remote-debugging-port={CDP_PORT}",
            f"--user-data-dir={PROFILE_DIR}",
            "--no-first-run",
            "--no-default-browser-check",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,  # independiente del proceso que lo lanza
    )

    deadline = time.time() + timeout
    while time.time() < deadline:
        if _cdp_alive():
            return
        time.sleep(0.5)
    raise RuntimeError("No se pudo iniciar el Chrome del perfil de Kobber")
