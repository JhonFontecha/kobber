"""Archivos locales de MercadoLibre, compartidos por backend y scripts."""
from pathlib import Path
import re

ML_DIR = Path(__file__).resolve().parents[1] / ".kobber" / "mercadolibre"

def ml_path(name):
    ML_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
    # Las categorias pueden contener caracteres invalidos en Windows.
    safe = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', name)
    return str(ML_DIR / safe)
