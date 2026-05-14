import json
from datetime import datetime
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from pydantic import BaseModel

from database import get_conn, row_to_dict

router = APIRouter()


class ExportRequest(BaseModel):
    product_ids: Optional[list[int]] = None  # None = todos
    margen_global: Optional[float] = None     # sobreescribe margen individual si se especifica
    categoria_ml: Optional[str] = None        # categoría para ML


def _calcular_precio_venta(precio_base: float, margen: float) -> float:
    return round(precio_base * (1 + margen / 100), 2)


@router.post("/export")
def export_excel(body: ExportRequest):
    with get_conn() as conn:
        if body.product_ids:
            placeholders = ",".join("?" * len(body.product_ids))
            rows = conn.execute(
                f"SELECT * FROM products WHERE id IN ({placeholders})",
                body.product_ids,
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM products WHERE estado != 'descartado' ORDER BY categoria, nombre"
            ).fetchall()

    if not rows:
        raise HTTPException(status_code=404, detail="No hay productos para exportar")

    products = [row_to_dict(r) for r in rows]

    wb = Workbook()
    ws = wb.active
    ws.title = "Productos MercadoLibre"

    # Encabezados
    headers = [
        "ID Interno",
        "SKU / Cód. vendedor",
        "Título del anuncio",
        "Descripción",
        "Categoría ML",
        "Condición",
        "Precio venta (MXN)",
        "Precio base (distribuidor)",
        "Margen %",
        "Stock / Unidades caja",
        "Fotos (URLs)",
        "Variantes",
        "Estado",
        "Página catálogo",
    ]

    header_fill = PatternFill("solid", fgColor="1E3A5F")
    header_font = Font(bold=True, color="FFFFFF")

    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    ws.row_dimensions[1].height = 30

    # Datos
    for row_idx, p in enumerate(products, 2):
        margen = body.margen_global if body.margen_global is not None else (p.get("margen") or 0)
        precio_base = p.get("precio_distribuidor") or p.get("precio_mc")
        precio_venta = _calcular_precio_venta(precio_base, margen) if precio_base else None

        categoria = body.categoria_ml or p.get("categoria") or ""
        imagenes = p.get("imagenes") or []
        fotos_str = " | ".join(imagenes) if imagenes else ""

        variantes = p.get("variantes") or []
        variantes_str = json.dumps(variantes, ensure_ascii=False) if variantes else ""

        ws.append([
            p["id"],
            p.get("sku") or "",
            p.get("nombre") or "",
            p.get("descripcion") or "",
            categoria,
            "Nuevo",
            precio_venta,
            precio_base,
            margen,
            p.get("unidades_caja") or "",
            fotos_str,
            variantes_str,
            p.get("estado") or "",
            p.get("pagina_catalogo") or "",
        ])

    # Anchos de columna
    col_widths = [10, 18, 45, 60, 30, 10, 16, 18, 10, 12, 50, 40, 12, 12]
    for col, width in enumerate(col_widths, 1):
        ws.column_dimensions[ws.cell(row=1, column=col).column_letter].width = width

    # Exportar
    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)

    filename = f"kobber_productos_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
