import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import useCartStore from '../store/cartStore'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, updateCantidad, total, count, clearCart } = useCartStore()
  const subtotal = total
  const iva      = Math.round(subtotal * 0.19)
  const totalFinal = subtotal + iva

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-modal
                       flex flex-col transition-transform duration-300
                       ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5DD]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-accent" />
            <h2 className="font-semibold text-[#1A1510]">Carrito</h2>
            {count > 0 && (
              <span className="ml-1 bg-accent text-white text-xs font-bold rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart}
                className="text-xs text-[#9E9890] hover:text-red-500 transition-colors px-2 py-1">
                Vaciar
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="p-1.5 text-[#6B6258] hover:text-[#1A1510] hover:bg-[#F7F4F0] rounded-md transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-[#9E9890]">
              <ShoppingCart size={48} strokeWidth={1} />
              <div>
                <p className="font-medium text-[#6B6258]">Tu carrito está vacío</p>
                <p className="text-sm mt-1">Agrega productos para comenzar</p>
              </div>
              <button onClick={() => setOpen(false)}
                className="mt-2 px-5 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-dark transition-colors">
                Ver catálogo
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex gap-3">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-16 h-16 rounded-md object-cover bg-[#F7F4F0] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1510] line-clamp-2 leading-snug">
                      {producto.nombre}
                    </p>
                    <p className="text-xs text-[#9E9890] mt-0.5">{producto.marca} · {producto.clave}</p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Cantidad */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCantidad(producto.id, cantidad - 1)}
                          className="w-6 h-6 rounded border border-[#EAE5DD] flex items-center justify-center
                                     text-[#6B6258] hover:border-accent hover:text-accent transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-[#1A1510]">{cantidad}</span>
                        <button
                          onClick={() => updateCantidad(producto.id, cantidad + 1)}
                          className="w-6 h-6 rounded border border-[#EAE5DD] flex items-center justify-center
                                     text-[#6B6258] hover:border-accent hover:text-accent transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1A1510]">
                          {fmt(producto.precio * cantidad)}
                        </span>
                        <button onClick={() => removeItem(producto.id)}
                          className="p-1 text-[#9E9890] hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#EAE5DD] px-5 py-5 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#6B6258]">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B6258]">
                <span>IVA (19%)</span><span>{fmt(iva)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#1A1510] text-base pt-1.5 border-t border-[#EAE5DD]">
                <span>Total</span><span className="text-accent">{fmt(totalFinal)}</span>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white
                               font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              Proceder al pago <ArrowRight size={16} />
            </button>
            <p className="text-center text-xs text-[#9E9890]">Envío calculado al finalizar</p>
          </div>
        )}
      </div>
    </>
  )
}
