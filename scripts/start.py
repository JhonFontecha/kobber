"""Local cross-platform launcher. Run with Python 3.10+."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from runtime_paths import configure_console

configure_console()


def venv_python(root=ROOT, platform=sys.platform):
    return root / "backend" / "venv" / ("Scripts/python.exe" if platform == "win32" else "bin/python")


def run(args, **kwargs):
    subprocess.run([str(x) for x in args], cwd=ROOT, check=True, **kwargs)


def occupied(port):
    with socket.socket() as sock:
        sock.settimeout(1)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def healthy(url, service=None):
    try:
        with urllib.request.urlopen(url, timeout=3) as response:
            return response.status == 200 and (not service or json.load(response).get("service") == service)
    except Exception:
        return False


def validate_node(node):
    version = tuple(map(int, subprocess.check_output([node, "--version"], text=True).strip().lstrip("v").split(".")))
    if not (version >= (22, 12, 0) or (20, 19, 0) <= version < (21, 0, 0)):
        raise RuntimeError("Instala Node 22.12+ (recomendado: Node 24 LTS).")


def mirror_output(name, process, log):
    """Mirror each child line to the launcher window and its persistent log."""
    if process.stdout is None:
        return
    for line in process.stdout:
        log.write(line)
        log.flush()
        print(f"[{name}] {line}", end="", flush=True)


def prepare(check_only=False):
    if sys.version_info < (3, 10):
        raise RuntimeError("Se requiere Python 3.10 o superior; recomendado 3.14.")
    node = shutil.which("node")
    npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
    if not node or not npm:
        raise RuntimeError("Instala Node.js y npm y vuelve a abrir el iniciador.")
    validate_node(node)
    python = venv_python()
    if not python.exists():
        if check_only:
            raise RuntimeError("Falta backend/venv. Ejecuta el iniciador sin --check.")
        run([sys.executable, "-m", "venv", python.parent.parent])
    # CheckOnly is read-only; normal launch reconciles all declared requirements.
    if not check_only:
        run([python, "-m", "pip", "install", "--quiet", "-r", ROOT / "backend/requirements.txt"])
    run([python, "-m", "pip", "check"])
    run([python, "-c", "import fastapi,uvicorn,anthropic,pdfplumber,PIL,openpyxl,dotenv,httpx,supabase,playwright"])
    state = ROOT / ".kobber"
    stamp = state / "frontend.sha256"
    lock = hashlib.sha256((ROOT / "package-lock.json").read_bytes()).hexdigest()
    vite = ROOT / "node_modules/vite/bin/vite.js"
    try:
        installed_lock = stamp.read_text(encoding="ascii").strip()
    except OSError:
        installed_lock = None
    if not vite.exists() or installed_lock != lock:
        if check_only:
            if not vite.exists():
                raise RuntimeError("Faltan dependencias del frontend.")
        else:
            run([npm, "ci"])
            state.mkdir(mode=0o700, exist_ok=True)
            stamp.write_text(lock, encoding="ascii")
    envfile = ROOT / "backend/.env"
    if not envfile.exists():
        if check_only:
            raise RuntimeError("Falta backend/.env.")
        shutil.copyfile(ROOT / "backend/.env.example", envfile)
        if os.name != "nt":
            envfile.chmod(0o600)
        print("Completa backend/.env y ejecuta de nuevo el iniciador.")
        if os.name == "nt":
            os.startfile(envfile, "open")
        elif sys.platform == "darwin":
            run(["open", "-t", envfile])
        raise RuntimeError("Credenciales pendientes en backend/.env.")
    check = """import config
values = {name: getattr(config, name) for name in ('SUPABASE_URL','SUPABASE_KEY','SUPABASE_SERVICE_KEY')}
missing = [name for name,value in values.items() if not value.strip() or '...' in value or 'tu-proyecto' in value]
if missing: raise SystemExit('Configura backend/.env: ' + ', '.join(missing))
print('Configuracion Supabase: OK')
if not config.ANTHROPIC_API_KEY or '...' in config.ANTHROPIC_API_KEY: print('Anthropic pendiente: las funciones IA no estaran disponibles.')
"""
    run([python, "-c", check], env={**os.environ, "PYTHONPATH": str(ROOT / "backend")})
    return python, node, vite


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--prepare-only", action="store_true")
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not args.check and not args.prepare_only:
        # Do not reuse another checkout or a backend holding stale .env credentials.
        for port in (8000, 5173):
            if occupied(port):
                raise RuntimeError(f"Puerto {port} ocupado. Cierra el iniciador anterior y vuelve a intentarlo; no se detuvo ningun proceso.")
    python, node, vite = prepare(args.check)
    if args.check:
        print("Verificacion local completada (sin iniciar servicios ni consultar Supabase).")
        return
    if args.prepare_only:
        print("Preparacion completada: dependencias y configuracion local verificadas.")
        return
    children = []
    logs = []
    output_threads = []
    state = ROOT / ".kobber"
    state.mkdir(mode=0o700, exist_ok=True)
    try:
        commands = [
            ("backend", [python, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000",
                         "--app-dir", ROOT / "backend", "--no-proxy-headers"]),
            ("frontend", [node, vite, "--host", "127.0.0.1", "--port", "5173", "--strictPort"]),
        ]
        for name, command in commands:
            log = (state / f"{name}.log").open("w", encoding="utf-8")
            logs.append(log)
            process = subprocess.Popen(
                [str(x) for x in command], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, encoding="utf-8", errors="replace", bufsize=1,
                env={**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8"},
                **({"creationflags": subprocess.CREATE_NO_WINDOW} if os.name == "nt" else {}),
            )
            children.append(process)
            thread = threading.Thread(target=mirror_output, args=(name, process, log), daemon=True)
            thread.start()
            output_threads.append(thread)
        deadline = time.monotonic() + 40
        while not (healthy("http://127.0.0.1:8000/health", "kobber-admin") and healthy("http://127.0.0.1:5173/")):
            if any(p.poll() is not None for p in children) or time.monotonic() > deadline:
                raise RuntimeError(f"No arrancaron los servicios; consulta {state} (backend.log / frontend.log).")
            time.sleep(0.5)
        db_ok = healthy("http://127.0.0.1:8000/health/db")
        print("\n" + "=" * 62)
        print(" KOBBER INICIO CORRECTAMENTE")
        print("=" * 62)
        print(" Tienda:              http://127.0.0.1:5173/")
        print(" Panel administrativo: http://127.0.0.1:5173/admin")
        print(" API:                 http://127.0.0.1:8000")
        print(" Documentacion API:   http://127.0.0.1:8000/docs")
        print(f" Supabase:            {'conectado' if db_ok else 'ERROR de conexion'}")
        print(f" Registros:           {state}")
        print("=" * 62)
        print("Mantén esta ventana abierta. Presiona Ctrl+C para detener Kobber.")
        if not args.no_browser:
            webbrowser.open("http://127.0.0.1:5173/admin")
        while all(p.poll() is None for p in children):
            time.sleep(0.5)
        raise RuntimeError("Un servicio termino. Consulta los registros en .kobber.")
    except KeyboardInterrupt:
        print("\nCerrando Kobber...")
    finally:
        for process in children:
            if process.poll() is None:
                process.terminate()
        for process in children:
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        for thread in output_threads:
            thread.join(timeout=2)
        for log in logs:
            log.close()


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, OSError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
