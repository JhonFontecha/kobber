"""Paths shared by the API and standalone scripts, independent of cwd."""
import os
import re
import sys
from pathlib import Path, PureWindowsPath

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"


def project_path(value: str) -> Path:
    path = Path(value).expanduser()
    if os.name != "nt" and PureWindowsPath(value).drive:
        raise ValueError("Windows path configured on another OS; use a relative path.")
    return (path if path.is_absolute() else PROJECT_ROOT / path).resolve()


def data_dir() -> Path:
    # Per checkout, ignored by Git. Can be relocated to a private user directory.
    return project_path(os.getenv("KOBBER_DATA_DIR", ".kobber"))


def runtime_file(name: str) -> Path:
    # External category names must never become directory traversal or invalid Windows names.
    safe = re.sub(r'[^\w.-]', '_', name, flags=re.UNICODE).strip('.')
    if not safe or safe.upper().split('.')[0] in {"CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(1, 10)), *(f"LPT{i}" for i in range(1, 10))}:
        safe = "kobber_" + safe
    folder = data_dir()
    folder.mkdir(parents=True, exist_ok=True, mode=0o700)
    return folder / safe


def configure_console() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
