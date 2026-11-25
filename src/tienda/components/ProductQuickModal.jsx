import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingCart, Package, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { fetchProductoDetalle } from '../hooks/useStoreProducts'
import { fmt } from '../lib/format'
import ProductImage from './ProductImage'

export default function ProductQuickModal({ productoId, onClose }) {
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [varIdx, setVarIdx] = useState(0)
  const [imgIdx, setImgIdx] = useState(0)
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

  useEffect(() => {
    if (!productoId) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [productoId, onClose])

  if (!productoId) return null

  const variante = producto?.variantes?.[varIdx]
  const precio = variante?.precio_venta ?? producto?.precio ?? 0
  const imagenes = producto?.imagenes ?? []

  const handleAdd = () => {
    if (!producto || !variante) return
    addItem({
      id: `${producto.id}-${variante.id}`,
      productId: producto.id,
      variantId: variante.id,
      nombre: `${producto.nombre}${variante.descripcion ? ' · ' + variante.descripcion : ''}`,
      marca: producto.marca,
      clave: variante.clave,
      precio,
      imagen: imagenes[0] ?? '',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Vista rápida">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-modal w-full max-w-2xl max-h-[92vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-graphite-200">
          <span className="text-xs font-semibold text-kobber-700 uppercase tracking-wide">Vista rápida</span>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="p-1.5 text-graphite-700 hover:text-graphite-900 hover:bg-graphite-50 rounded-md">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-graphite-600" role="status">
            <div className="w-8 h-8 border-2 border-kobber-500 border-t-transparent rounded-full animate-spin" />
            <span className="sr-only">Cargando</span>
          </div>
        ) : !producto ? (
          <div className="py-12 text-center text-graphite-700">No se pudo cargar el producto</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-0 min-w-0">
            <div className="relative bg-graphite-50 aspect-square overflow-hidden min-w-0">
              {imagenes.length > 0 ? (
                <>
                  <ProductImage src={imagenes[imgIdx]} alt={producto.nombre} width={640}
                    className="w-full h-full object-contain p-4" sizes="(max-width: 640px) 100vw, 320px" />
                  {imagenes.length > 1 && (
                    <>
                      <button type="button" aria-label="Foto anterior"
                        onClick={() => setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <ChevronLeft size={16} aria-hidden="true" />
                      </button>
                      <button type="button" aria-label="Foto siguiente"
                        onClick={() => setImgIdx(i => (i + 1) % imagenes.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-graphite-500" role="img" aria-label="Sin imagen">
                  <Package size={48} strokeWidth={1} aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col gap-4 min-w-0">
              <div>
                <p className="text-xs font-bold text-kobber-700 uppercase tracking-wide">{producto.marca}</p>
                <h2 className="text-lg font-bold text-graphite-900 leading-snug mt-1 break-words">{producto.nombre}</h2>
                {producto.categoria_ml && <p className="text-xs text-graphite-600 mt-1">{producto.categoria_ml}</p>}
              </div>

              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-bold text-graphite-900">{fmt(precio)}</span>
                {variante?.precio_anterior && (
                  <span className="text-sm text-graphite-600 line-through">{fmt(variante.precio_anterior)}</span>
                )}
              </div>
              <p className="text-xs text-graphite-600 -mt-2">Disponible · IVA incluido</p>
              {producto.plazo_envio && <p className="text-xs text-graphite-600 -mt-2">{producto.plazo_envio}</p>}

              {producto.variantes.length > 1 && (
                <div>
                  <p className="text-xs font-semibold text-graphite-700 mb-2">Variante</p>
                  <div className="flex flex-wrap gap-2">
                    {producto.variantes.map((v, i) => (
                      <button type="button" key={v.id} onClick={() => setVarIdx(i)}
                        className={`max-w-full px-3 py-1.5 rounded-md text-xs font-medium border transition-colors break-words
                          ${i === varIdx
                            ? 'bg-kobber-500 text-white border-kobber-500'
                            : 'border-graphite-200 text-graphite-700 hover:border-kobber-500 hover:text-kobber-700'}`}>
                        {v.clave}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {producto.descripcion && (
                <p className="text-sm text-graphite-700 leading-relaxed line-clamp-3 break-words">{producto.descripcion}</p>
              )}

              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                <span className="text-graphite-700">Disponible</span>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                  <button type="button" onClick={handleAdd}
                  disabled={!variante}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-kobber-500 text-white
                             font-semibold rounded-lg hover:bg-kobber-600 transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed">
                  <ShoppingCart size={16} aria-hidden="true" /> Agregar al carrito
                </button>
                <Link to={`/tienda/producto/${producto.id}`} onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-graphite-200
                             text-graphite-700 font-medium rounded-lg hover:border-kobber-500 hover:text-kobber-700
                             transition-colors text-sm">
                  Ver página completa <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
