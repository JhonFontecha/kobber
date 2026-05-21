import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Eye, Package } from 'lucide-react'
import useCartStore from '../store/cartStore'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function ProductCard({ producto, onQuickView }) {
  const addItem = useCartStore(s => s.addItem)
  const setOpen = useCartStore(s => s.setOpen)

  const imagen    = producto.imagenes?.[0] ?? producto.imagen ?? ''
  const precio    = producto.precio ?? 0
  const precioAnt = producto.precioAnterior ?? null
  const stock     = producto.stock_total ?? producto.stock ?? 0
  const descuento = precioAnt ? Math.round((1 - precio / precioAnt) * 100) : (producto.descuento ?? 0)
  const rating    = producto.rating ?? 4.5
  const agotado   = stock === 0

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation()
    const v = producto.variantes?.[0]
    addItem({
      id:     v ? `${producto.id}-${v.id}` : producto.id,
      nombre: producto.nombre,
      marca:  producto.marca,
      clave:  v?.clave ?? producto.clave ?? '',
      precio,
      imagen,
    })
    setOpen(true)
  }

  const handleQuick = (e) => {
    e.preventDefault(); e.stopPropagation()
    onQuickView?.(producto.id)
  }

  return (
    <article className="group flex flex-col overflow-hidden bg-white border border-graphite-200
                         rounded-lg shadow-card hover:shadow-float hover:-translate-y-0.5
                         transition-all duration-200">
      {/* Imagen */}
      <Link to={`/tienda/producto/${producto.id}`}
            className="relative overflow-hidden bg-graphite-50 aspect-square block">
        {imagen ? (
          <img src={imagen} alt={producto.nombre}
               className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
               loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-graphite-300">
            <Package size={40} strokeWidth={1} />
          </div>
        )}

        {/* Badges — kobber-100/700 para descuento (promocional, no estado) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {descuento > 0 && (
            <span className="bg-kobber-100 text-kobber-700 text-[11px] font-bold px-2 py-0.5 rounded">
              -{descuento}%
            </span>
          )}
          {/* Stock bajo — color de estado (warning) */}
          {stock > 0 && stock <= 10 && (
            <span className="bg-amber-50 text-warning text-[11px] font-bold px-2 py-0.5 rounded">
              Últimas {stock}
            </span>
          )}
        </div>

        {/* Vista rápida — graphite, no kobber (no es acción principal) */}
        {onQuickView && (
          <button onClick={handleQuick}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5
                       bg-graphite-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-full
                       opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                       transition-all duration-200 hover:bg-graphite-900 whitespace-nowrap">
            <Eye size={12} /> Vista rápida
          </button>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3">
        {/* Marca — kobber-700 para texto con tono de marca */}
        <p className="text-[10px] font-bold text-kobber-700 uppercase tracking-wider mb-0.5">
          {producto.marca}
        </p>
        <Link to={`/tienda/producto/${producto.id}`}
          className="text-sm font-medium text-graphite-800 leading-snug flex-1 line-clamp-2
                     hover:text-kobber-600 transition-colors">
          {producto.nombre}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-xs text-graphite-500">{rating}</span>
          {producto.variantes?.length > 1 && (
            <span className="text-xs text-graphite-400 ml-0.5">· {producto.variantes.length} var.</span>
          )}
        </div>

        {/* Precio — kobber-500 solo para el precio principal (acción de compra) */}
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-graphite-900 text-base">{fmt(precio)}</span>
          {precioAnt && (
            <span className="text-xs text-graphite-400 line-through">{fmt(precioAnt)}</span>
          )}
        </div>

        {/* CTA — kobber-500 para la acción principal de compra */}
        <button onClick={handleAdd} disabled={agotado}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold
                      rounded-md transition-all duration-150 active:scale-95
                      ${agotado
                        ? 'bg-graphite-100 text-graphite-400 cursor-not-allowed'
                        : 'bg-kobber-500 text-white hover:bg-kobber-600'}`}>
          <ShoppingCart size={13} />
          {agotado ? 'Agotado' : 'Agregar'}
        </button>
      </div>
    </article>
  )
}
