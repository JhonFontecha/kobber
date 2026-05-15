from datetime import datetime
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from pydantic import BaseModel

from database import get_client

router = APIRouter()


class ExportRequest(BaseModel):
    product_ids:    Optional[list[str]] = None   # None = todos
    margen_global:  Optional[float]     = None   # % de margen sobre precio distribuidor
    categoria_ml:   Optional[str]       = None   # sobreescribe categoría si se especifica


def _precio_venta(precio_base: float, margen: float) -> float:
    return round(precio_base * (1 + margen / 100), 2)


@router.post("/export")
def export_excel(body: ExportRequest):
    db = get_client()

    # Obtener productos con variantes y atributos
    query = db.table("products").select(
        "id, nombre, descripcion, marca, categoria, subcategoria, seccion, caracteristicas, estado, pagina_catalogo, "
        "product_attributes(nombre, valor, unidad, variant_id), "
        "product_variants(id, codigo, clave, descripcion, precio_distribuidor, nc, "
        "unidades_caja, unidades_master, stock, estado, "
        "product_attributes(nombre, valor, unidad)), "
        "product_images(url, orden)"
    )

    if body.product_ids:
        query = query.in_("id", body.product_ids)
    else:
        query = query.neq("estado", "descartado")

    products = query.order("categoria").order("nombre").execute().data

    if not products:
        raise HTTPException(status_code=404, detail="No hay productos para exportar")

    wb = Workbook()
    ws = wb.active
    ws.title = "Productos"

    headers = [
        "Producto ID",
        "Nombre producto",
        "Descripción producto",
        "Marca",
        "Categoría",
        "Subcategoría",
        "Sección",
        "Características",
        "Atributos familia",
        "Variante ID",
        "Código pedido",
        "Clave / SKU",
        "Descripción variante",
        "Precio distribuidor",
        "Precio venta (con margen)",
        "Margen %",
        "NC",
        "Uds/caja",
        "Uds/máster",
        "Stock",
        "Estado variante",
        "Atributos variante",
        "Fotos (URLs)",
        "Estado producto",
        "Página catálogo",
    ]

    header_fill = PatternFill("solid", fgColor="1E3A5F")
    header_font = Font(bold=True, color="FFFFFF")

    for col, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws.row_dimensions[1].height = 30

    def _attrs_str(attrs):
        return " | ".join(
            f"{a['nombre']}: {a['valor']}{' ' + a['unidad'] if a.get('unidad') else ''}"
            for a in (attrs or [])
        )

    # Una fila por variante
    row_idx = 2
    for p in products:
        fotos = sorted(p.get("product_images") or [], key=lambda x: x.get("orden", 0))
        fotos_str = " | ".join(f["url"] for f in fotos)

        caracteristicas_str = " | ".join(p.get("caracteristicas") or [])

        # Atributos de familia (variant_id is None)
        familia_attrs = [a for a in (p.get("product_attributes") or []) if not a.get("variant_id")]
        familia_attrs_str = _attrs_str(familia_attrs)

        variantes = p.get("product_variants") or []
        if not variantes:
            ws.append([
                p["id"], p.get("nombre") or "", p.get("descripcion") or "",
                p.get("marca") or "", p.get("categoria") or "",
                p.get("subcategoria") or "", p.get("seccion") or "",
                caracteristicas_str, familia_attrs_str,
                "", "", "", "", None, None, None, None, None, None, 0,
                "", "", fotos_str, p.get("estado") or "", p.get("pagina_catalogo"),
            ])
            row_idx += 1
            continue

        for v in variantes:
            margen = body.margen_global if body.margen_global is not None else 0
            precio_base = v.get("precio_distribuidor")
            precio_venta = _precio_venta(precio_base, margen) if precio_base else None

            ws.append([
                p["id"],
                p.get("nombre") or "",
                p.get("descripcion") or "",
                p.get("marca") or "",
                p.get("categoria") or "",
                p.get("subcategoria") or "",
                p.get("seccion") or "",
                caracteristicas_str,
                familia_attrs_str,
                v["id"],
                v.get("codigo") or "",
                v.get("clave") or "",
                v.get("descripcion") or "",
                precio_base,
                precio_venta,
                margen,
                v.get("nc"),
                v.get("unidades_caja"),
                v.get("unidades_master"),
                v.get("stock") or 0,
                v.get("estado") or "",
                _attrs_str(v.get("product_attributes")),
                fotos_str,
                p.get("estado") or "",
                p.get("pagina_catalogo"),
            ])
            row_idx += 1

    col_widths = [38, 45, 55, 12, 28, 22, 8, 50, 50, 38, 14, 16, 35, 18, 20, 10, 6, 8, 10, 8, 14, 50, 60, 14, 12]
    for col, width in enumerate(col_widths, 1):
        ws.column_dimensions[ws.cell(row=1, column=col).column_letter].width = width

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)

    filename = f"kobber_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
