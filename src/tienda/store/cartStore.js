import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      open:  false,

      addItem(producto) {
        set(state => {
          const existing = state.items.find(i => i.producto.id === producto.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { producto, cantidad: 1 }] }
        })
      },

      removeItem(id) {
        set(state => ({ items: state.items.filter(i => i.producto.id !== id) }))
      },

      updateCantidad(id, cantidad) {
        if (cantidad <= 0) { get().removeItem(id); return }
        set(state => ({
          items: state.items.map(i =>
            i.producto.id === id ? { ...i, cantidad } : i
          ),
        }))
      },

      clearCart() { set({ items: [] }) },
      setOpen(open) { set({ open }) },
    }),
    { name: 'kobber-cart' }
  )
)

// Selectores derivados — usarlos en componentes
export const selectTotal = s => s.items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)
export const selectCount = s => s.items.reduce((acc, i) => acc + i.cantidad, 0)

export default useCartStore
