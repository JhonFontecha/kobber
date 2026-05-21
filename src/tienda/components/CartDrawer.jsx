import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import useCartStore, { selectTotal, selectCount } from '../store/cartStore'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function CartDrawer() {
  const items          = useCartStore(s => s.items)
  const open           = useCartStore(s => s.open)
  const setOpen        = useCartStore(s => s.setOpen)
  const removeItem     = useCartStore(s => s.removeItem)
  const updateCantidad = useCartStore(s => s.updateCantidad)
  const clearCart      = useCartStore(s => s.clearCart)
  const total          = useCartStore(selectTotal)
  const count          = useCartStore(selectCount)

  const subtotal   = total
  const iva        = Math.round(subtotal * 0.19)
  const totalFinal = subtotal + iva

  return (
    <>
      {open && <div className="fixed inset-0 bg-graphite-900/40 z-50" onClick={() => setOpen(false)} />}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-modal
                       flex flex-col transition-transform duration-300
                       ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-graphite-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-graphite-700" />
            <h2 className="font-semibold text-graphite-900">Carrito</h2>
            {count > 0 && (
              <span className="bg-kobber-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-graphite-400 hover:text-danger transition-colors px-2 py-1">
                Vaciar
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="p-1.5 text-graphite-400 hover:text-graphite-900 hover:bg-graphite-100 rounded-md transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <ShoppingCart size={48} strokeWidth={1} className="text-graphite-300" />
              <div>
                <p className="font-medium text-graphite-700">Tu carrito está vacío</p>
                <p className="text-sm text-graphite-400 mt-1">Agrega productos para comenzar</p>
              </div>
              {/* kobber-500 en el CTA de regreso */}
              <button onClick={() => setOpen(false)}
                className="mt-2 px-5 py-2 bg-kobber-500 text-white text-sm font-semibold rounded-md hover:bg-kobber-600 transition-colors">
                Ver catálogo
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-graphite-50 shrink-0 flex items-center justify-center">
                    {producto.imagen
                      ? <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-contain p-1" />
                      : <ShoppingCart size={20} className="text-graphite-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-graphite-900 line-clamp-2 leading-snug">
                      {producto.nombre}
                    </p>
                    {/* kobber-700 para texto de marca en drawer */}
                    <p className="text-xs text-kobber-700 font-medium mt-0.5">{producto.marca}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateCantidad(producto.id, cantidad - 1)}
                          className="w-6 h-6 rounded border border-graphite-200 flex items-center justify-center
                                     text-graphite-500 hover:border-kobber-500 hover:text-kobber-500 transition-colors">
                          <Minus size={11} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-graphite-900">{cantidad}</span>
                        <button onClick={() => updateCantidad(producto.id, cantidad + 1)}
                          className="w-6 h-6 rounded border border-graphite-200 flex items-center justify-center
                                     text-graphite-500 hover:border-kobber-500 hover:text-kobber-500 transition-colors">
                          <Plus size={11} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-graphite-900">
                          {fmt(producto.precio * cantidad)}
                        </span>
                        <button onClick={() => removeItem(producto.id)}
                          className="p-1 text-graphite-300 hover:text-danger transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — kobber-500 en el CTA principal de pago */}
        {items.length > 0 && (
          <div className="border-t border-graphite-200 px-5 py-5 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-graphite-500">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-graphite-500">
                <span>IVA (19%)</span><span>{fmt(iva)}</span>
              </div>
              <div className="flex justify-between font-bold text-graphite-900 text-base pt-2 border-t border-graphite-200">
                <span>Total</span>
                {/* Precio total destacado — kobber-700 para énfasis de marca */}
                <span className="text-kobber-700">{fmt(totalFinal)}</span>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-kobber-500 text-white
                               font-semibold rounded-lg hover:bg-kobber-600 transition-colors">
              Proceder al pago <ArrowRight size={15} />
            </button>
            <p className="text-center text-xs text-graphite-400">Envío calculado al finalizar</p>
          </div>
        )}
      </div>
    </>
  )
}
