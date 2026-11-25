import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Tag, ArrowRight } from 'lucide-react'
import { useStoreProducts } from '../hooks/useStoreProducts'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'

export default function OfertasPage({ onQuickView }) {
  const [page, setPage] = useState(1)
  const { productos, loading, error, total, pages } = useStoreProducts({
    enOferta: true,
    orden: 'descuento',
    page,
    pageSize: 24,
  })

  return (
    <div className="min-w-0">
      <Seo
        title="Ofertas"
        description="Ofertas de Kobber con precio anterior real. Si no hay una rebaja cargada, esta página queda vacía."
        path="/tienda/ofertas"
      />
      <div className="bg-graphite-900 py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={18} className="text-kobber-300" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-widest text-kobber-200">Ofertas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Precios anteriores reales</h1>
          <p className="mt-3 text-white/80 max-w-xl">
            Un producto aparece acá solo si en el catálogo hay un precio de venta anterior, mayor al de ahora.
            No hay cuenta regresiva ni descuentos inventados.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20" role="status">
            <Loader2 size={32} className="animate-spin text-kobber-600" aria-hidden="true" />
            <span className="sr-only">Cargando ofertas</span>
          </div>
        ) : error ? (
          <p className="text-center text-red-700 py-16" role="alert">{error}</p>
        ) : productos.length === 0 ? (
          <div className="text-center py-16 max-w-lg mx-auto">
            <p className="text-lg font-semibold text-graphite-900">No hay ofertas activas</p>
            <p className="text-sm text-graphite-600 mt-2">
              Ningún producto tiene un precio anterior cargado. Podés seguir mirando el catálogo con el precio vigente, IVA incluido.
            </p>
            <Link to="/tienda/catalogo"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-kobber-500 text-white font-semibold rounded-lg hover:bg-kobber-600">
              Ver catálogo <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-graphite-600 mb-4">
              <span className="font-semibold text-graphite-900">{total}</span> {total === 1 ? 'producto en oferta' : 'productos en oferta'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productos.map(p => <ProductCard key={p.id} producto={p} onQuickView={onQuickView} />)}
            </div>
            {pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 border border-graphite-200 rounded-md text-sm disabled:opacity-40">Anterior</button>
                <button type="button" disabled={page >= pages} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 border border-graphite-200 rounded-md text-sm disabled:opacity-40">Siguiente</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
