"""Corrige las dos lecturas sistemáticas del PDF de Truper al guardar una clave.

No adivina otras letras. Esas se corrigen a mano, contra el banco, en
scripts/corregir_claves_truper.sql.
"""
from __future__ import annotations

import re

_TIMES = re.compile(r"(?<=[\d/])I(?=\d)")


def normalizar_clave(clave: str | None) -> str | None:
    """'7-I/4' → '7-1/4' y '1/4I6' → '1/4X6'. El resto de la clave no se toca."""
    if clave is None:
        return None
    text = str(clave).strip()
    if not text:
        return text
    text = text.upper().replace("I/", "1/")
    return _TIMES.sub("X", text)
