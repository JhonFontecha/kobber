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
import os
import sys
import shutil
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
import config  # Load the same .env used by the backend.
from runtime_paths import project_path, runtime_file, configure_console

configure_console()
CDP_PORT       = 9223
KOBBER_CDP_URL = f"http://127.0.0.1:{CDP_PORT}"

# Ubicaciones típicas de Chrome en Mac — no asumir la ruta de una sola
# máquina (ver la corrección análoga que necesitó DOWNLOAD_DIR).
_CHROME_BIN_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    str(Path.home() / "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
]


def chrome_profile_dir(platform=sys.platform, environ=os.environ, home=Path.home()) -> Path:
    """Return a private, per-user Chrome profile outside the source checkout.

    Keeping browser state in the OS application-data directory avoids repository
    permission/ownership problems and keeps the ML session independent of where
    the project was cloned. KOBBER_CHROME_PROFILE_DIR remains available for
    installations that need an explicit location.
    """
    configured = environ.get("KOBBER_CHROME_PROFILE_DIR")
    if configured:
        return project_path(configured)
    if platform == "win32" and environ.get("LOCALAPPDATA"):
        # Chrome must create this final directory itself. In packaged/sandboxed
        # launchers, a directory created by Python can have an ACL that the GUI
        # Chrome process cannot use for its ProcessSingleton lock.
        return Path(environ["LOCALAPPDATA"]) / "KobberChromeProfile"
    if platform == "darwin":
        return home / "Library" / "Application Support" / "KobberChromeProfile"
    base = Path(environ.get("XDG_DATA_HOME", home / ".local" / "share"))
    return base / "KobberChromeProfile"


PROFILE_DIR = chrome_profile_dir()
# One log per launcher process avoids ACL/file-lock collisions when the backend
# and a diagnostic command run under different Windows security contexts.
CHROME_LOG = runtime_file(f"chrome-{os.getpid()}.log")


def _find_chrome_bin() -> str:
    configured = os.getenv("CHROME_EXECUTABLE")
    if configured:
        path = Path(configured).expanduser()
        if path.is_file():
            return str(path)
        raise RuntimeError("CHROME_EXECUTABLE no apunta a un archivo existente.")
    candidates = chrome_candidates(sys.platform, os.environ, Path.home())
    for path in candidates:
        if Path(path).is_file():
            return str(path)
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        found = shutil.which(name)
        if found:
            return found
    raise RuntimeError(
        "No se encontró Google Chrome instalado (se buscó en "
        f"{', '.join(map(str, candidates))}). Instálalo o configura CHROME_EXECUTABLE."
    )


def chrome_candidates(platform, environ, home):
    if platform == "win32":
        return [Path(environ[key]) / "Google/Chrome/Application/chrome.exe"
                for key in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA") if environ.get(key)]
    if platform == "darwin":
        return [Path(_CHROME_BIN_CANDIDATES[0]), home / "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    return [Path("/usr/bin/google-chrome"), Path("/usr/bin/google-chrome-stable"), Path("/usr/bin/chromium")]


def _cdp_alive() -> bool:
    try:
        with urllib.request.urlopen(f"{KOBBER_CDP_URL}/json/version", timeout=1.5):
            pass
        return True
    except Exception:
        return False


def ensure_kobber_chrome(timeout: float = 20.0) -> None:
    """Se asegura de que el Chrome del perfil de Kobber esté corriendo con
    depuración remota. Si ya está abierto, no hace nada (se reutiliza)."""
    if _cdp_alive():
        return

    chrome_bin = _find_chrome_bin()

    try:
        # Create only the already-user-owned parent when missing. Chrome creates
        # PROFILE_DIR and therefore owns the lock files inside it.
        PROFILE_DIR.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        log = CHROME_LOG.open("a", encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(f"No se puede escribir el perfil de Chrome {PROFILE_DIR}: {exc}") from exc

    try:
        process = subprocess.Popen(
            [
                chrome_bin,
                f"--remote-debugging-port={CDP_PORT}",
                "--remote-debugging-address=127.0.0.1",
                f"--user-data-dir={PROFILE_DIR}",
                "--no-first-run",
                "--no-default-browser-check",
            ],
            stdout=log,
            stderr=subprocess.STDOUT,
            **({"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS}
               if os.name == "nt" else {"start_new_session": True}),
        )
    finally:
        log.close()

    deadline = time.time() + timeout
    while time.time() < deadline:
        if _cdp_alive():
            return
        returncode = process.poll()
        if returncode is not None:
            raise RuntimeError(
                f"Chrome terminó antes de abrir el puerto {CDP_PORT} (código {returncode}). "
                f"Revisa el registro: {CHROME_LOG}"
            )
        time.sleep(0.5)
    raise RuntimeError(
        f"Chrome no abrió el puerto {CDP_PORT} en {timeout:.0f} segundos. "
        f"Perfil: {PROFILE_DIR}. Registro: {CHROME_LOG}"
    )
