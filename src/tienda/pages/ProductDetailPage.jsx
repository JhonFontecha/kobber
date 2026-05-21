import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Star, Package, ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { fetchProductoDetalle } from '../hooks/useStoreProducts'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function ProductDetailPage() {
  const { id }       = useParams()
  const [producto,   setProducto]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [varIdx,     setVarIdx]     = useState(0)
  const [imgIdx,     setImgIdx]     = useState(0)
  const [added,      setAdded]      = useState(false)
  const addItem  = useCartStore(s => s.addItem)
  const setOpen  = useCartStore(s => s.setOpen)

  useEffect(() => {
    setLoading(true)
    fetchProductoDetalle(id)
      .then(p => { setProducto(p); setVarIdx(0); setImgIdx(0) })
      .catch(() => setProducto(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!producto) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-xl font-bold text-graphite-900">Producto no encontrado</p>
      <Link to="/tienda/catalogo" className="mt-4 inline-flex items-center gap-2 text-accent hover:underline">
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>
    </div>
  )

  const variante = producto.variantes[varIdx]
  const precio   = variante?.precio_venta ?? producto.precio
  const imagenes = producto.imagenes ?? []

  const handleAdd = () => {
    addItem({
      id:     `${producto.id}-${variante.id}`,
      nombre: `${producto.nombre}${variante.descripcion ? ' · ' + variante.descripcion : ''}`,
      marca:  producto.marca,
      clave:  variante.clave,
      precio,
      imagen: imagenes[0] ?? '',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    setOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-graphite-400 mb-6">
        <Link to="/tienda" className="hover:text-accent transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/tienda/catalogo" className="hover:text-accent transition-colors">Catálogo</Link>
        <span>/</span>
        {producto.categoria_ml && (
          <>
            <Link to={`/tienda/catalogo?categoria=${encodeURIComponent(producto.categoria_ml)}`}
              className="hover:text-accent transition-colors">
              {producto.categoria_ml}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-graphite-600 truncate max-w-[200px]">{producto.nombre}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* ── Galería ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Imagen principal */}
          <div className="relative bg-graphite-50 rounded-xl aspect-square overflow-hidden">
            {imagenes.length > 0 ? (
              <>
                <img src={imagenes[imgIdx]} alt={producto.nombre}
                     className="w-full h-full object-contain p-6" />
                {imagenes.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full
                                 flex items-center justify-center hover:bg-white shadow-card transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setImgIdx(i => (i + 1) % imagenes.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full
                                 flex items-center justify-center hover:bg-white shadow-card transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-graphite-300">
                <Package size={80} strokeWidth={1} />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {imagenes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagenes.map((url, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors
                    ${i === imgIdx ? 'border-accent' : 'border-transparent hover:border-graphite-300'}`}>
                  <img src={url} alt="" className="w-full h-full object-contain bg-graphite-50 p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-bold text-accent uppercase tracking-widest">{producto.marca}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-graphite-900 leading-tight mt-1">
              {producto.nombre}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14}
                    className={s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-graphite-200 text-graphite-200'} />
                ))}
              </div>
              <span className="text-sm text-graphite-400">4.5 · {producto.categoria_ml}</span>
            </div>
          </div>

          {/* Precio */}
          <div className="bg-kobber-50 rounded-xl px-5 py-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-graphite-900">{fmt(precio)}</span>
              {variante?.precio_distribuidor && precio !== variante.precio_distribuidor && (
                <span className="text-base text-graphite-400 line-through">{fmt(variante.precio_distribuidor)}</span>
              )}
            </div>
            <p className="text-xs text-accent-text mt-1">IVA incluido · Envío calculado al finalizar</p>
          </div>

          {/* Variantes */}
          {producto.variantes.length > 1 && (
            <div>
              <p className="text-sm font-semibold text-graphite-600 mb-3">
                Seleccionar variante
                {variante?.descripcion && <span className="ml-2 text-graphite-900">— {variante.descripcion}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {producto.variantes.map((v, i) => (
                  <button key={v.id} onClick={() => setVarIdx(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                      ${i === varIdx
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'border-graphite-200 text-graphite-600 hover:border-accent hover:text-accent'}`}>
                    {v.clave}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${(variante?.stock ?? 0) > 10 ? 'bg-green-500' : (variante?.stock ?? 0) > 0 ? 'bg-amber-500' : 'bg-red-400'}`} />
            <span className="text-sm text-graphite-600">
              {(variante?.stock ?? 0) > 10 ? 'En stock' : (variante?.stock ?? 0) > 0 ? `Últimas ${variante.stock} unidades` : 'Sin stock'}
            </span>
            {variante?.clave && <span className="text-xs text-graphite-400 ml-2">Ref: {variante.clave}</span>}
          </div>

          {/* CTA */}
          <button onClick={handleAdd}
            disabled={!variante || (variante?.stock ?? 0) === 0}
            className={`w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl
                       text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                       ${added ? 'bg-green-600 text-white' : 'bg-accent text-white hover:bg-accent-dark active:scale-[0.98]'}`}>
            {added ? <><CheckCircle2 size={18} /> ¡Agregado al carrito!</> : <><ShoppingCart size={18} /> Agregar al carrito</>}
          </button>

          {/* Descripción */}
          {producto.descripcion && (
            <div className="border-t border-graphite-200 pt-5">
              <h3 className="font-semibold text-graphite-900 mb-3">Descripción</h3>
              <div className="text-sm text-graphite-600 leading-relaxed whitespace-pre-line">
                {producto.descripcion}
              </div>
            </div>
          )}

          {/* Características */}
          {producto.caracteristicas?.length > 0 && (
            <div className="border-t border-graphite-200 pt-5">
              <h3 className="font-semibold text-graphite-900 mb-3">Características</h3>
              <ul className="space-y-2">
                {producto.caracteristicas.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-graphite-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Especificaciones */}
          {producto.atributos?.length > 0 && (
            <div className="border-t border-graphite-200 pt-5">
              <h3 className="font-semibold text-graphite-900 mb-3">Especificaciones</h3>
              <dl className="grid grid-cols-2 gap-2">
                {producto.atributos.map((a, i) => (
                  <div key={i} className="bg-graphite-50 rounded-lg px-3 py-2">
                    <dt className="text-[10px] font-semibold text-graphite-400 uppercase tracking-wide">{a.nombre}</dt>
                    <dd className="text-sm font-medium text-graphite-900 mt-0.5">
                      {a.valor}{a.unidad ? ` ${a.unidad}` : ''}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
