import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Package, ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { fetchProductoDetalle } from '../hooks/useStoreProducts'
import { fmt } from '../lib/format'
import ProductImage from '../components/ProductImage'
import Seo from '../components/Seo'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [varIdx, setVarIdx] = useState(0)
  const [imgIdx, setImgIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const setOpen = useCartStore(s => s.setOpen)

  useEffect(() => {
    setLoading(true)
    fetchProductoDetalle(id)
      .then(p => { setProducto(p); setVarIdx(0); setImgIdx(0) })
      .catch(() => setProducto(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status">
      <div className="w-10 h-10 border-2 border-kobber-500 border-t-transparent rounded-full animate-spin" />
      <span className="sr-only">Cargando producto</span>
    </div>
  )

  if (!producto) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <Seo title="Producto no encontrado" description="Ese producto no está en el catálogo de Kobber." path={`/tienda/producto/${id}`} />
      <p className="text-xl font-bold text-graphite-900">Producto no encontrado</p>
      <Link to="/tienda/catalogo" className="mt-4 inline-flex items-center gap-2 text-kobber-700 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Volver al catálogo
      </Link>
    </div>
  )

  const variante = producto.variantes[varIdx]
  const precio = variante?.precio_venta ?? producto.precio
  const anterior = variante?.precio_anterior
  const imagenes = producto.imagenes ?? []
  const descripcionCorta = (producto.descripcion || producto.nombre || '').replace(/\s+/g, ' ').slice(0, 160)

  const handleAdd = () => {
    if (!variante) return
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
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    setOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-w-0 overflow-x-clip">
      <Seo
        title={producto.nombre}
        description={descripcionCorta}
        path={`/tienda/producto/${producto.id}`}
        image={imagenes[0]}
        type="product"
      />
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-graphite-600 mb-6 min-w-0" aria-label="Miga de pan">
        <Link to="/tienda" className="hover:text-kobber-700 transition-colors">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link to="/tienda/catalogo" className="hover:text-kobber-700 transition-colors">Catálogo</Link>
        {producto.categoria_ml && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/tienda/catalogo?categoria=${encodeURIComponent(producto.categoria_ml)}`}
              className="hover:text-kobber-700 transition-colors break-words">
              {producto.categoria_ml}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-graphite-800 break-words">{producto.nombre}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 min-w-0">
        <div className="space-y-3 min-w-0">
          <div className="relative bg-graphite-50 rounded-xl aspect-square overflow-hidden max-w-full">
            {imagenes.length > 0 ? (
              <>
                <ProductImage
                  src={imagenes[imgIdx]}
                  alt={producto.nombre}
                  width={800}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full h-full object-contain p-4 sm:p-6"
                />
                {imagenes.length > 1 && (
                  <>
                    <button type="button" aria-label="Foto anterior"
                      onClick={() => setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full
                                 flex items-center justify-center hover:bg-white shadow-card transition-colors">
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <button type="button" aria-label="Foto siguiente"
                      onClick={() => setImgIdx(i => (i + 1) % imagenes.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full
                                 flex items-center justify-center hover:bg-white shadow-card transition-colors">
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-graphite-500" role="img" aria-label="Sin imagen">
                <Package size={80} strokeWidth={1} aria-hidden="true" />
              </div>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
              {imagenes.map((url, i) => (
                <button type="button" key={url + i} onClick={() => setImgIdx(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors
                    ${i === imgIdx ? 'border-kobber-500' : 'border-transparent hover:border-graphite-300'}`}>
                  <ProductImage src={url} alt="" width={128} className="w-full h-full object-contain bg-graphite-50 p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-bold text-kobber-700 uppercase tracking-widest">{producto.marca}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-graphite-900 leading-tight mt-1 break-words">
              {producto.nombre}
            </h1>
            {producto.categoria_ml && (
              <p className="text-sm text-graphite-600 mt-2 break-words">{producto.categoria_ml}</p>
            )}
          </div>

          <div className="bg-kobber-50 rounded-xl px-5 py-4 min-w-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-graphite-900">{fmt(precio)}</span>
              {anterior && (
                <span className="text-base text-graphite-600 line-through">{fmt(anterior)}</span>
              )}
            </div>
            <p className="text-xs text-kobber-800 mt-1">IVA incluido · {producto.plazo_envio || 'El envío se calcula al confirmar el pedido'}</p>
          </div>

          {producto.variantes.length > 1 && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-graphite-700 mb-3 break-words">
                Seleccionar variante
                {variante?.descripcion && <span className="ml-2 text-graphite-900">— {variante.descripcion}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {producto.variantes.map((v, i) => (
                  <button type="button" key={v.id} onClick={() => setVarIdx(i)}
                    className={`max-w-full px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all break-words
                      ${i === varIdx
                        ? 'bg-kobber-500 text-white border-kobber-500 shadow-sm'
                        : 'border-graphite-200 text-graphite-700 hover:border-kobber-500 hover:text-kobber-700'}`}>
                    {v.clave}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
            <span className="text-sm text-graphite-700">Disponible</span>
            {variante?.clave && <span className="text-xs text-graphite-600">Ref: {variante.clave}</span>}
          </div>

          <button type="button" onClick={handleAdd}
            disabled={!variante}
            className={`w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl
                       text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                       ${added ? 'bg-green-700 text-white' : 'bg-kobber-500 text-white hover:bg-kobber-600 active:scale-[0.98]'}`}>
            {added ? <><CheckCircle2 size={18} aria-hidden="true" /> Agregado al carrito</> : <><ShoppingCart size={18} aria-hidden="true" /> Agregar al carrito</>}
          </button>

          {producto.descripcion && (
            <div className="border-t border-graphite-200 pt-5 min-w-0">
              <h2 className="font-semibold text-graphite-900 mb-3">Descripción</h2>
              <div className="text-sm text-graphite-700 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                {producto.descripcion}
              </div>
            </div>
          )}

          {producto.caracteristicas?.length > 0 && (
            <div className="border-t border-graphite-200 pt-5 min-w-0">
              <h2 className="font-semibold text-graphite-900 mb-3">Características</h2>
              <ul className="space-y-2">
                {producto.caracteristicas.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-graphite-700 break-words min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-kobber-500 mt-1.5 shrink-0" />
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {producto.atributos?.length > 0 && (
            <div className="border-t border-graphite-200 pt-5 min-w-0">
              <h2 className="font-semibold text-graphite-900 mb-3">Especificaciones</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                {producto.atributos.map((a, i) => (
                  <div key={i} className="bg-graphite-50 rounded-lg px-3 py-2 min-w-0">
                    <dt className="text-[10px] font-semibold text-graphite-600 uppercase tracking-wide break-words">{a.nombre}</dt>
                    <dd className="text-sm font-medium text-graphite-900 mt-0.5 break-words [overflow-wrap:anywhere]">
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
