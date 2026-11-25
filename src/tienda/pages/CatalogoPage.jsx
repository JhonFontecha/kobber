import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react'
import { useStoreProducts } from '../hooks/useStoreProducts'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'

const ORDEN_OPTIONS = [
  { value: 'nombre', label: 'Nombre A-Z' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
]

export default function CatalogoPage({ searchQuery = '', onQuickView }) {
  const [searchParams] = useSearchParams()
  const catParam = searchParams.get('categoria') || ''

  const [filtros, setFiltros] = useState({
    categorias: catParam ? [catParam] : [],
    marcas: [],
    precioMin: '',
    precioMax: '',
  })
  const [orden, setOrden] = useState('nombre')
  const [page, setPage] = useState(1)
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  useEffect(() => {
    if (!catParam) return
    setFiltros(f => ({ ...f, categorias: [catParam] }))
    setPage(1)
  }, [catParam])

  const { productos, total, pages, categorias, marcas, loading, error } = useStoreProducts({
    q: searchQuery,
    categorias: filtros.categorias,
    marcas: filtros.marcas,
    minPrice: filtros.precioMin,
    maxPrice: filtros.precioMax,
    orden,
    page,
    pageSize: 24,
  })

  const toggleArr = (key, val) => {
    setFiltros(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }))
    setPage(1)
  }
  const resetFiltros = () => {
    setFiltros({ categorias: [], marcas: [], precioMin: '', precioMax: '' })
    setPage(1)
  }
  const hasFilters = filtros.categorias.length || filtros.marcas.length || filtros.precioMin || filtros.precioMax

  const titulo = searchQuery ? `Resultados para “${searchQuery}”` : 'Catálogo'

  const Sidebar = () => (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-graphite-900">Filtros</h2>
        {hasFilters ? (
          <button type="button" onClick={resetFiltros} className="text-xs text-kobber-700 hover:underline flex items-center gap-1">
            <X size={12} aria-hidden="true" /> Limpiar
          </button>
        ) : null}
      </div>

      <fieldset className="mb-6">
        <legend className="text-xs font-semibold text-graphite-600 uppercase tracking-wide mb-3">Categoría</legend>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {categorias.map(cat => (
            <li key={cat}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={filtros.categorias.includes(cat)}
                  onChange={() => toggleArr('categorias', cat)}
                  className="w-4 h-4 accent-[#C2622E] rounded" />
                <span className="text-sm text-graphite-700 group-hover:text-graphite-900 transition-colors">{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-xs font-semibold text-graphite-600 uppercase tracking-wide mb-3">Marca</legend>
        <ul className="space-y-1.5">
          {marcas.map(m => (
            <li key={m}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={filtros.marcas.includes(m)}
                  onChange={() => toggleArr('marcas', m)}
                  className="w-4 h-4 accent-[#C2622E] rounded" />
                <span className="text-sm text-graphite-700 group-hover:text-graphite-900 transition-colors">{m}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-xs font-semibold text-graphite-600 uppercase tracking-wide mb-3">Precio (COP)</legend>
        <div className="flex gap-2">
          <input type="number" inputMode="numeric" aria-label="Precio mínimo" placeholder="Mín" value={filtros.precioMin}
            onChange={e => { setFiltros(f => ({ ...f, precioMin: e.target.value })); setPage(1) }}
            className="w-full min-w-0 px-2 py-1.5 text-sm border border-graphite-200 rounded-md bg-white focus:outline-none focus:border-kobber-500" />
          <input type="number" inputMode="numeric" aria-label="Precio máximo" placeholder="Máx" value={filtros.precioMax}
            onChange={e => { setFiltros(f => ({ ...f, precioMax: e.target.value })); setPage(1) }}
            className="w-full min-w-0 px-2 py-1.5 text-sm border border-graphite-200 rounded-md bg-white focus:outline-none focus:border-kobber-500" />
        </div>
      </fieldset>

    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-w-0">
      <Seo
        title={titulo}
        description="Catálogo de ferretería Kobber. Precios finales con IVA incluido. Filtrá por categoría y marca."
        path="/tienda/catalogo"
      />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-graphite-900 break-words">{titulo}</h1>
          <p className="text-sm text-graphite-600 mt-0.5">
            {loading ? 'Cargando…' : `${total} productos`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setSideOpen(v => !v)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-graphite-200 rounded-md text-sm text-graphite-700 hover:border-kobber-500 transition-colors">
            <SlidersHorizontal size={15} aria-hidden="true" /> Filtros
            {hasFilters ? <span className="w-2 h-2 rounded-full bg-kobber-500" /> : null}
          </button>
          <label className="relative">
            <span className="sr-only">Ordenar</span>
            <select value={orden} onChange={e => { setOrden(e.target.value); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2 border border-graphite-200 rounded-md text-sm text-graphite-700 bg-white focus:outline-none focus:border-kobber-500 cursor-pointer">
              {ORDEN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-graphite-500 pointer-events-none" aria-hidden="true" />
          </label>
        </div>
      </div>

      <div className="flex gap-8 min-w-0">
        <div className="hidden lg:block w-56 shrink-0">
          <div className="card p-5 sticky top-20"><Sidebar /></div>
        </div>

        {sideOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSideOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-72 max-w-[90vw] bg-white z-50 p-5 overflow-y-auto shadow-modal lg:hidden">
              <div className="flex items-center justify-between mb-5">
                <span className="font-semibold">Filtros</span>
                <button type="button" onClick={() => setSideOpen(false)} aria-label="Cerrar filtros"><X size={18} /></button>
              </div>
              <Sidebar />
              <button type="button" onClick={() => setSideOpen(false)}
                className="mt-6 w-full py-2.5 bg-kobber-500 text-white rounded-md font-medium text-sm">
                Ver {total} resultados
              </button>
            </div>
          </>
        )}

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-graphite-600" role="status">
              <Loader2 size={32} className="animate-spin" aria-hidden="true" />
              <span className="sr-only">Cargando catálogo</span>
            </div>
          ) : error ? (
            <p className="text-center py-20 text-red-700" role="alert">{error}</p>
          ) : productos.length === 0 ? (
            <div className="text-center py-20 text-graphite-700">
              <p className="text-lg font-medium text-graphite-900">Sin resultados</p>
              <button type="button" onClick={resetFiltros} className="mt-4 text-kobber-700 text-sm hover:underline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {productos.map(p => (
                <ProductCard key={p.id} producto={p} onQuickView={onQuickView} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginación">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border border-graphite-200 rounded-md text-sm text-graphite-700 hover:border-kobber-500 disabled:opacity-40 transition-colors">
                Anterior
              </button>
              <span className="text-sm text-graphite-600 px-2">Página {page} de {pages}</span>
              <button type="button" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="px-4 py-2 border border-graphite-200 rounded-md text-sm text-graphite-700 hover:border-kobber-500 disabled:opacity-40 transition-colors">
                Siguiente
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
