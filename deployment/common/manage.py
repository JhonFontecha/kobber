"""Install and update a local Kobber checkout on Windows and macOS."""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS = ROOT / "scripts"
sys.path.insert(0, str(SCRIPTS))
sys.path.insert(0, str(ROOT / "backend"))

import start as launcher  # noqa: E402
from runtime_paths import configure_console  # noqa: E402

configure_console()
REPOSITORY = "https://github.com/JhonFontecha/kobber.git"


def find_chrome() -> str:
    configured = os.getenv("CHROME_EXECUTABLE")
    candidates: list[Path] = []
    if configured:
        candidates.append(Path(configured).expanduser())
    if os.name == "nt":
        candidates.extend(
            Path(os.environ[key]) / "Google" / "Chrome" / "Application" / "chrome.exe"
            for key in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA")
            if os.environ.get(key)
        )
    elif sys.platform == "darwin":
        candidates.extend((
            Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
            Path.home() / "Applications" / "Google Chrome.app" / "Contents" / "MacOS" / "Google Chrome",
        ))
    else:
        candidates.extend(Path(path) for path in ("/usr/bin/google-chrome", "/usr/bin/chromium"))
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    for name in ("google-chrome", "google-chrome-stable", "chromium"):
        found = shutil.which(name)
        if found:
            return found
    raise RuntimeError("Falta Google Chrome o CHROME_EXECUTABLE no apunta a un ejecutable válido.")


def command_output(command: list[str]) -> str:
    return subprocess.check_output(command, cwd=ROOT, text=True, encoding="utf-8").strip()


def check_prerequisites() -> None:
    git = shutil.which("git")
    node = shutil.which("node")
    npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
    if not git:
        raise RuntimeError("Falta Git. Instálalo desde https://git-scm.com/downloads")
    if not node or not npm:
        raise RuntimeError("Falta Node.js/npm. Instala Node 24 LTS desde https://nodejs.org/")
    launcher.validate_node(node)
    if sys.version_info < (3, 10):
        raise RuntimeError("Se requiere Python 3.10 o superior; recomendado Python 3.14.")
    chrome = find_chrome()
    print("Requisitos encontrados:")
    print(f"  Git:    {command_output([git, '--version'])}")
    print(f"  Python: {sys.version.split()[0]}")
    print(f"  Node:   {command_output([node, '--version'])}")
    print(f"  npm:    {command_output([npm, '--version'])}")
    print(f"  Chrome: {chrome}")


def configure_env() -> None:
    env_file = ROOT / "backend" / ".env"
    if env_file.exists():
        print("Configuración privada encontrada: backend/.env")
        return
    shutil.copyfile(ROOT / "backend" / ".env.example", env_file)
    if os.name != "nt":
        env_file.chmod(0o600)
    print("\nSe abrirá backend/.env. Completa las credenciales, guarda y cierra el editor.")
    if os.name == "nt":
        subprocess.run(["notepad.exe", str(env_file)], check=True)
    elif sys.platform == "darwin":
        subprocess.run(["open", "-W", "-a", "TextEdit", str(env_file)], check=True)
    else:
        raise RuntimeError(f"Edita manualmente {env_file} y vuelve a ejecutar el instalador.")


def verify_installation() -> None:
    python = launcher.venv_python()
    npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
    launcher.run([npm, "run", "build"])
    launcher.run([python, "-m", "unittest", "discover", "-s", "tests"])
    print("Compilación y pruebas: correctas.")


def create_launcher() -> None:
    if os.name == "nt":
        script = ROOT / "deployment" / "windows" / "crear_acceso_directo.ps1"
        subprocess.run([
            "powershell.exe", "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass",
            "-File", str(script), "-ProjectRoot", str(ROOT),
        ], check=True)
    elif sys.platform == "darwin":
        desktop = Path.home() / "Desktop"
        desktop.mkdir(exist_ok=True)
        shortcut = desktop / "Iniciar Kobber.command"
        target = ROOT / "deployment" / "macos" / "iniciar_Kobber.command"
        shortcut.write_text(f'#!/bin/bash\nexec "{target}" "$@"\n', encoding="utf-8")
        shortcut.chmod(0o700)
        print(f"Acceso directo creado: {shortcut}")


def start_kobber() -> int:
    python = launcher.venv_python()
    return subprocess.call([str(python), str(ROOT / "scripts" / "start.py")], cwd=ROOT)


def install(no_start: bool, no_shortcut: bool) -> int:
    print("\nPreparando Kobber...")
    check_prerequisites()
    configure_env()
    launcher.prepare(check_only=False)
    verify_installation()
    if not no_shortcut:
        create_launcher()
    print("\nInstalación de Kobber completada correctamente.")
    if no_start:
        return 0
    return start_kobber()


def update(no_start: bool, no_shortcut: bool) -> int:
    if launcher.occupied(8000) or launcher.occupied(5173):
        raise RuntimeError("Kobber está abierto. Cierra su ventana antes de actualizar.")
    check_prerequisites()
    branch = command_output(["git", "branch", "--show-current"])
    if branch != "main":
        raise RuntimeError(f"La instalación está en la rama {branch!r}; las actualizaciones requieren 'main'.")
    dirty = command_output(["git", "status", "--porcelain", "--untracked-files=no"])
    if dirty:
        raise RuntimeError("Hay cambios locales en la instalación. No se sobrescribió ningún archivo.")
    print("Buscando actualizaciones estables...")
    subprocess.run(["git", "fetch", "origin", "main"], cwd=ROOT, check=True)
    subprocess.run(["git", "merge", "--ff-only", "origin/main"], cwd=ROOT, check=True)
    # Start a fresh manager process so an updated start.py is imported.
    command = [sys.executable, str(Path(__file__).resolve()), "install"]
    if no_start:
        command.append("--no-start")
    if no_shortcut:
        command.append("--no-shortcut")
    return subprocess.call(command, cwd=ROOT)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("install", "update"))
    parser.add_argument("--no-start", action="store_true", help="Prepara sin iniciar los servicios.")
    parser.add_argument("--no-shortcut", action="store_true", help="No crea acceso directo en el escritorio.")
    args = parser.parse_args()
    if args.action == "install":
        return install(args.no_start, args.no_shortcut)
    return update(args.no_start, args.no_shortcut)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, OSError, subprocess.CalledProcessError) as exc:
        print(f"\nERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
