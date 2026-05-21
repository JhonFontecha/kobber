import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingCart, Star, Package, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { fetchProductoDetalle } from '../hooks/useStoreProducts'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function ProductQuickModal({ productoId, onClose }) {
  const [producto,     setProducto]     = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [varIdx,       setVarIdx]       = useState(0)
  const [imgIdx,       setImgIdx]       = useState(0)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    if (!productoId) return
    setLoading(true)
    setVarIdx(0); setImgIdx(0)
    fetchProductoDetalle(productoId)
      .then(setProducto)
      .catch(() => setProducto(null))
      .finally(() => setLoading(false))
  }, [productoId])

  if (!productoId) return null

  const variante = producto?.variantes?.[varIdx]
  const precio   = variante?.precio_venta ?? producto?.precio ?? 0
  const imagenes = producto?.imagenes ?? []

  const handleAdd = () => {
    if (!producto || !variante) return
    addItem({
      id:      `${producto.id}-${variante.id}`,
      nombre:  `${producto.nombre}${variante.descripcion ? ' · ' + variante.descripcion : ''}`,
      marca:   producto.marca,
      clave:   variante.clave,
      precio,
      imagen:  imagenes[0] ?? '',
    })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto"
             onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-graphite-200">
            <span className="text-xs font-semibold text-accent uppercase tracking-wide">Vista rápida</span>
            <button onClick={onClose} className="p-1.5 text-graphite-600 hover:text-graphite-900 hover:bg-graphite-50 rounded-md">
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-graphite-400">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !producto ? (
            <div className="py-12 text-center text-graphite-400">No se pudo cargar el producto</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-0">
              {/* Imagen */}
              <div className="relative bg-graphite-50 aspect-square sm:rounded-bl-xl overflow-hidden">
                {imagenes.length > 0 ? (
                  <>
                    <img src={imagenes[imgIdx]} alt={producto.nombre}
                         className="w-full h-full object-contain p-4" />
                    {imagenes.length > 1 && (
                      <>
                        <button onClick={() => setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                          <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => setImgIdx(i => (i + 1) % imagenes.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                          <ChevronRight size={16} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {imagenes.slice(0, 6).map((_, i) => (
                            <button key={i} onClick={() => setImgIdx(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-accent' : 'bg-graphite-300'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-graphite-300">
                    <Package size={48} strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold text-accent uppercase tracking-wide">{producto.marca}</p>
                  <h2 className="text-lg font-bold text-graphite-900 leading-snug mt-1">{producto.nombre}</h2>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs text-graphite-600">4.5 · {producto.categoria_ml}</span>
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-graphite-900">{fmt(precio)}</span>
                  {variante?.precio_distribuidor && (
                    <span className="text-sm text-graphite-400 line-through">{fmt(variante.precio_distribuidor)}</span>
                  )}
                </div>

                {/* Variantes */}
                {producto.variantes.length > 1 && (
                  <div>
                    <p className="text-xs font-semibold text-graphite-600 mb-2">Variante:</p>
                    <div className="flex flex-wrap gap-2">
                      {producto.variantes.map((v, i) => (
                        <button key={v.id} onClick={() => setVarIdx(i)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors
                            ${i === varIdx
                              ? 'bg-accent text-white border-accent'
                              : 'border-graphite-200 text-graphite-600 hover:border-accent hover:text-accent'}`}>
                          {v.clave}
                          {v.descripcion && <span className="ml-1 opacity-70">— {v.descripcion}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descripción corta */}
                {producto.descripcion && (
                  <p className="text-sm text-graphite-600 leading-relaxed line-clamp-3">
                    {producto.descripcion}
                  </p>
                )}

                {/* Stock */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${(variante?.stock ?? 0) > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
                  <span className="text-graphite-600">
                    {(variante?.stock ?? 0) > 0 ? `${variante.stock} disponibles` : 'Sin stock'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 mt-auto">
                  <button onClick={handleAdd}
                    disabled={!variante || (variante?.stock ?? 0) === 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-white
                               font-semibold rounded-lg hover:bg-accent-dark transition-colors
                               disabled:opacity-40 disabled:cursor-not-allowed">
                    <ShoppingCart size={16} /> Agregar al carrito
                  </button>
                  <Link to={`/tienda/producto/${producto.id}`} onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-graphite-200
                               text-graphite-600 font-medium rounded-lg hover:border-accent hover:text-accent
                               transition-colors text-sm">
                    Ver página completa <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
