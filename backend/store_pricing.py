"""Reglas de precio de la tienda pública.

El precio que ve el cliente es final: incluye IVA. El costo de distribuidor
nunca sale de este módulo hacia una respuesta HTTP. El margen lo define la
base (`porcentaje_kobber`) o, si esa columna está vacía, `KOBBER_MARGEN_DEFAULT`.
Un query param del cliente no entra acá.

Una oferta solo existe cuando `precio_anterior` es un precio de venta real
mayor al actual. No se inventan descuentos.
"""
from __future__ import annotations

import math
import os

IVA_DEFAULT = 0.19


def cop(value: float) -> int:
    """Enteros en pesos. Mismo criterio que Math.round para números positivos."""
    return int(math.floor(float(value) + 0.5))


def settings() -> dict:
    return {
        "margen_default": float(os.getenv("KOBBER_MARGEN_DEFAULT", "30")),
        "envio": int(os.getenv("KOBBER_ENVIO_COSTO", "15000")),
        "envio_gratis_desde": int(os.getenv("KOBBER_ENVIO_GRATIS_DESDE", "200000")),
        "iva": float(os.getenv("KOBBER_IVA", str(IVA_DEFAULT))),
        "plazo_envio": os.getenv("KOBBER_PLAZO_ENVIO", "Envío en 3 a 5 días hábiles"),
    }


def precio_venta(precio_distribuidor, porcentaje_kobber, margen_default: float | None = None):
    """Precio final al público (IVA incluido). None si no hay costo."""
    if precio_distribuidor is None or precio_distribuidor == "":
        return None
    base = float(precio_distribuidor)
    if base <= 0:
        return None
    if porcentaje_kobber is None or porcentaje_kobber == "":
        margen = settings()["margen_default"] if margen_default is None else margen_default
    else:
        margen = float(porcentaje_kobber)
    return cop(base * (1 + margen / 100))


def oferta(precio, precio_anterior):
    """Devuelve (precio_anterior, descuento) solo si el anterior es real y mayor.

    Un valor vacío, cero o menor o igual al precio actual no es una oferta:
    mostrarlo tachado incumpliría la Ley 1480.
    """
    if precio is None or precio_anterior is None or precio_anterior == "":
        return None, None
    try:
        anterior = cop(float(precio_anterior))
    except (TypeError, ValueError):
        return None, None
    if anterior <= int(precio):
        return None, None
    descuento = cop((1 - (int(precio) / anterior)) * 100)
    if descuento <= 0:
        return None, None
    return anterior, descuento


def iva_incluido(subtotal: int, iva: float | None = None) -> int:
    """Porción de IVA ya contenida en un precio final. No se suma al total."""
    rate = settings()["iva"] if iva is None else iva
    if subtotal <= 0 or rate <= 0:
        return 0
    base = subtotal / (1 + rate)
    return cop(subtotal - base)


def costo_envio(subtotal: int, umbral: int | None = None, costo: int | None = None) -> int:
    cfg = settings()
    umbral = cfg["envio_gratis_desde"] if umbral is None else umbral
    costo = cfg["envio"] if costo is None else costo
    if subtotal <= 0:
        return 0
    return 0 if subtotal >= umbral else int(costo)


def totales(subtotal: int) -> dict:
    iva = iva_incluido(subtotal)
    envio = costo_envio(subtotal)
    return {
        "subtotal": int(subtotal),
        "iva_incluido": iva,
        "envio": envio,
        "total": int(subtotal) + envio,
        "moneda": "COP",
        "iva_ya_incluido": True,
    }


# Métodos coordinados a mano. Una pasarela (Wompi, Mercado Pago, etc.) se agrega
# como otro método con requiere_pasarela=True y un adaptador en PASARELAS.
# Hasta entonces el pedido queda pendiente de pago: no se simula un cobro.
METODOS_PAGO = {
    "contra_entrega": {
        "id": "contra_entrega",
        "label": "Pago contra entrega",
        "descripcion": "Pagás en efectivo al recibir el pedido. Coordinamos la entrega por el teléfono que dejaste. No hay cobro en línea.",
        "requiere_pasarela": False,
    },
    "transferencia": {
        "id": "transferencia",
        "label": "Transferencia bancaria",
        "descripcion": "El pedido queda pendiente de pago. Te contactamos para enviarte los datos de la transferencia. Todavía no hay una pasarela conectada.",
        "requiere_pasarela": False,
    },
}

# id de método -> callable(pedido) -> {"pasarela": str, "redirect_url": str, "pasarela_ref": str}
PASARELAS: dict = {}

CAMPOS_TARJETA = {
    "cvv", "cvc", "pan", "tarjeta", "numero_tarjeta", "card_number",
    "numero", "titular", "vence", "vencimiento", "security_code",
}
