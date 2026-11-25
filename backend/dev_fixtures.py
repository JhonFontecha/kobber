"""Catálogo chico para probar la tienda sin tocar la base real.

Se activa solo con KOBBER_ENV=development y KOBBER_DEV_FIXTURES=1.
"""
from __future__ import annotations

from memory_store import MemoryStore

# Foto real de Truper, chica en el sentido de que el proxy la redimensiona.
_FOTO = "https://www.truper.com/media/import/imagenes/ACEF-180.jpg"


def build_fixture_store() -> MemoryStore:
    store = MemoryStore(offers_column=True)

    products = [
        {
            "id": "prod-aceite",
            "nombre": "Aceitera de prueba",
            "descripcion": "Producto de prueba para el checkout local. El precio ya incluye IVA.",
            "marca": "Truper",
            "categoria": "Aceiteras",
            "categoria_ml": "Aceiteras Manuales",
            "caracteristicas": ["Pico rígido", "Cuerpo metálico"],
            "estado": "activo",
            "product_attributes": [
                {"nombre": "Capacidad", "valor": "180", "unidad": "ml", "variant_id": None},
            ],
            "product_images": [{"url": _FOTO, "orden": 0}],
            "product_variants": [
                {
                    "id": "var-aceite",
                    "clave": "ACEF-180",
                    "descripcion": "180 ml",
                    "precio_distribuidor": 9600,
                    "porcentaje_kobber": 30,
                    "precio_anterior": None,
                    "stock": 4,
                    "unidades_caja": 12,
                    "estado": "activo",
                }
            ],
        },
        {
            "id": "prod-oferta",
            "nombre": "Alicate en oferta de prueba",
            "descripcion": "El precio anterior está cargado a propósito para probar una oferta real.",
            "marca": "Pretul",
            "categoria": "Alicates",
            "categoria_ml": "Alicates",
            "caracteristicas": [],
            "estado": "activo",
            "product_attributes": [],
            "product_images": [{"url": _FOTO, "orden": 0}],
            "product_variants": [
                {
                    "id": "var-oferta",
                    "clave": "ALI-9",
                    "descripcion": "9 pulgadas",
                    "precio_distribuidor": 10000,
                    "porcentaje_kobber": 30,
                    "precio_anterior": 20000,
                    "stock": 2,
                    "unidades_caja": 6,
                    "estado": "activo",
                }
            ],
        },
        {
            "id": "prod-sinfoto",
            "nombre": "Candado sin foto de prueba",
            "descripcion": "No tiene URL de imagen y no tiene stock.",
            "marca": "Truper",
            "categoria": "Candados",
            "categoria_ml": "Candados",
            "caracteristicas": [],
            "estado": "activo",
            "product_attributes": [],
            "product_images": [],
            "product_variants": [
                {
                    "id": "var-sinfoto",
                    "clave": "CH-00",
                    "descripcion": None,
                    "precio_distribuidor": 5000,
                    "porcentaje_kobber": None,
                    "precio_anterior": None,
                    "stock": 0,
                    "unidades_caja": 1,
                    "estado": "activo",
                }
            ],
        },
    ]
    store.tables["products"] = products

    flat = []
    for product in products:
        parent = {
            "nombre": product["nombre"],
            "marca": product["marca"],
            "estado": product["estado"],
        }
        for variant in product["product_variants"]:
            flat.append({**variant, "product_id": product["id"], "products": parent})
    store.tables["product_variants"] = flat
    store.tables["orders"] = []
    store.tables["order_items"] = []
    return store
