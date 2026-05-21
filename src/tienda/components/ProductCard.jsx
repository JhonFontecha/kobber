import { ShoppingCart, Star } from 'lucide-react'
import useCartStore from '../store/cartStore'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function ProductCard({ producto, size = 'md' }) {
  const addItem = useCartStore(s => s.addItem)
  const setOpen = useCartStore(s => s.setOpen)

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(producto)
    setOpen(true)
  }

  const isCompact = size === 'sm'

  return (
    <article className={`card group flex flex-col overflow-hidden hover:shadow-float transition-shadow duration-200
                         ${isCompact ? '' : ''}`}>
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F7F4F0] aspect-square">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {producto.descuento > 0 && (
            <span className="bg-accent text-white text-[11px] font-bold px-2 py-0.5 rounded">
              -{producto.descuento}%
            </span>
          )}
          {producto.stock <= 10 && producto.stock > 0 && (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">
              Últimas {producto.stock}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3">
        <p className="text-[10px] font-semibold text-accent uppercase tracking-wide mb-1">
          {producto.marca}
        </p>
        <h3 className={`font-medium text-[#1A1510] leading-snug flex-1 line-clamp-2
                         ${isCompact ? 'text-sm' : 'text-sm'}`}>
          {producto.nombre}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs text-[#6B6258]">{producto.rating}</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-end gap-2">
          <span className="font-bold text-[#1A1510] text-base">{fmt(producto.precio)}</span>
          {producto.precioAnterior && (
            <span className="text-xs text-[#9E9890] line-through">{fmt(producto.precioAnterior)}</span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleAdd}
          disabled={producto.stock === 0}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium
                     bg-accent text-white rounded-md hover:bg-accent-dark active:scale-95
                     transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={14} />
          {producto.stock === 0 ? 'Agotado' : 'Agregar'}
        </button>
      </div>
    </article>
  )
}
