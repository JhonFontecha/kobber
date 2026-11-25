import { Link } from 'react-router-dom'
import { ShoppingCart, Eye } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { fmt } from '../lib/format'
import ProductImage from './ProductImage'

export default function ProductCard({ producto, onQuickView }) {
  const addItem = useCartStore(s => s.addItem)
  const setOpen = useCartStore(s => s.setOpen)

  const imagen = producto.imagen || producto.imagenes?.[0] || ''
  const variante = producto.variantes?.[0]
  const precio = variante?.precio_venta ?? producto.precio ?? 0
  const precioAnt = variante?.precio_anterior ?? producto.precio_anterior ?? null
  const descuento = variante?.descuento ?? producto.descuento ?? 0
  const plazo = producto.plazo_envio

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!variante?.id) return
    addItem({
      id: `${producto.id}-${variante.id}`,
      productId: producto.id,
      variantId: variante.id,
      nombre: producto.nombre,
      marca: producto.marca,
      clave: variante.clave || '',
      precio,
      imagen,
    })
    setOpen(true)
  }

  const handleQuick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(producto.id)
  }

  return (
    <article className="group flex flex-col overflow-hidden bg-white border border-graphite-200
                         rounded-lg shadow-card hover:shadow-float hover:-translate-y-0.5
                         transition-all duration-200 min-w-0">
      <Link to={`/tienda/producto/${producto.id}`}
            className="relative overflow-hidden bg-graphite-50 aspect-square block">
        <ProductImage
          src={imagen}
          alt={producto.nombre}
          width={480}
          sizes="(max-width: 640px) 45vw, 240px"
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {descuento > 0 && precioAnt && (
            <span className="bg-kobber-100 text-kobber-800 text-[11px] font-bold px-2 py-0.5 rounded">
              -{descuento}%
            </span>
          )}
        </div>

        {onQuickView && (
          <button type="button" onClick={handleQuick}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5
                       bg-graphite-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-full
                       opacity-0 group-hover:opacity-100 focus-visible:opacity-100 translate-y-2 group-hover:translate-y-0
                       transition-all duration-200 hover:bg-graphite-900 whitespace-nowrap">
            <Eye size={12} aria-hidden="true" /> Vista rápida
          </button>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-3 min-w-0">
        <p className="text-[10px] font-bold text-kobber-800 uppercase tracking-wider mb-0.5">
          {producto.marca}
        </p>
        <Link to={`/tienda/producto/${producto.id}`}
          className="text-sm font-medium text-graphite-800 leading-snug flex-1 line-clamp-2
                     hover:text-kobber-700 transition-colors break-words">
          {producto.nombre}
        </Link>
        {producto.variantes?.length > 1 && (
          <p className="text-xs text-graphite-600 mt-1">{producto.variantes.length} variantes</p>
        )}

        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-graphite-900 text-base">{fmt(precio)}</span>
          {precioAnt && descuento > 0 && (
            <span className="text-xs text-graphite-600 line-through">{fmt(precioAnt)}</span>
          )}
        </div>
        <p className="text-[11px] text-graphite-700 mt-0.5">Disponible · IVA incluido</p>
        {plazo && <p className="text-[11px] text-graphite-600">{plazo}</p>}

        <button type="button" onClick={handleAdd} disabled={!variante?.id}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold
                     rounded-md transition-all duration-150 active:scale-95
                     bg-kobber-500 text-white hover:bg-kobber-600 disabled:opacity-40">
          <ShoppingCart size={13} aria-hidden="true" />
          Agregar
        </button>
      </div>
    </article>
  )
}
