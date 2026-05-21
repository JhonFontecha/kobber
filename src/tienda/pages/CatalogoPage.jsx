import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react'
import { useStoreProducts } from '../hooks/useStoreProducts'
import ProductCard from '../components/ProductCard'
import ProductQuickModal from '../components/ProductQuickModal'

const ORDEN_OPTIONS = [
  { value: 'relevancia',  label: 'Relevancia' },
  { value: 'precio-asc',  label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nombre',      label: 'Nombre A-Z' },
]

const PAGE_SIZE = 12

export default function CatalogoPage({ searchQuery = '' }) {
  const [searchParams] = useSearchParams()
  const catParam = searchParams.get('categoria') || ''

  const [filtros,   setFiltros]   = useState({ categorias: catParam ? [catParam] : [], marcas: [], precioMin: '', precioMax: '', soloStock: false })
  const [orden,     setOrden]     = useState('relevancia')
  const [page,      setPage]      = useState(1)
  const [sideOpen,  setSideOpen]  = useState(false)
  const [quickId,   setQuickId]   = useState(null)

  const { productos, total, categorias, marcas, loading } = useStoreProducts()

  const filtered = useMemo(() => {
    let list = [...productos]
    const q = searchQuery.toLowerCase()
    if (q) list = list.filter(p =>
      [p.nombre, p.marca, p.categoria, p.descripcion].join(' ').toLowerCase().includes(q)
    )
    if (filtros.categorias.length) list = list.filter(p => filtros.categorias.includes(p.categoria_ml))
    if (filtros.marcas.length)     list = list.filter(p => filtros.marcas.includes(p.marca))
    if (filtros.precioMin)         list = list.filter(p => p.precio >= Number(filtros.precioMin))
    if (filtros.precioMax)         list = list.filter(p => p.precio <= Number(filtros.precioMax))
    if (filtros.soloStock)         list = list.filter(p => p.stock_total > 0)
    if (orden === 'precio-asc')    list.sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-desc')   list.sort((a, b) => b.precio - a.precio)
    if (orden === 'nombre')        list.sort((a, b) => a.nombre.localeCompare(b.nombre))
    return list
  }, [productos, filtros, orden, searchQuery])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleArr = (key, val) => {
    setFiltros(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }))
    setPage(1)
  }
  const resetFiltros = () => { setFiltros({ categorias: [], marcas: [], precioMin: '', precioMax: '', soloStock: false }); setPage(1) }
  const hasFilters = filtros.categorias.length || filtros.marcas.length || filtros.precioMin || filtros.precioMax || filtros.soloStock

  const Sidebar = () => (
    <aside>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-graphite-900">Filtros</h3>
        {hasFilters && (
          <button onClick={resetFiltros} className="text-xs text-accent hover:underline flex items-center gap-1">
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* Categorías */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-graphite-400 uppercase tracking-wide mb-3">Categoría ML</p>
        <ul className="space-y-1.5">
          {categorias.map(cat => (
            <li key={cat}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={filtros.categorias.includes(cat)}
                  onChange={() => toggleArr('categorias', cat)}
                  className="w-4 h-4 accent-[#C8762C] rounded" />
                <span className="text-sm text-graphite-600 group-hover:text-graphite-900 transition-colors truncate">{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Marcas */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-graphite-400 uppercase tracking-wide mb-3">Marca</p>
        <ul className="space-y-1.5">
          {marcas.map(m => (
            <li key={m}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={filtros.marcas.includes(m)}
                  onChange={() => toggleArr('marcas', m)}
                  className="w-4 h-4 accent-[#C8762C] rounded" />
                <span className="text-sm text-graphite-600 group-hover:text-graphite-900 transition-colors">{m}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Precio */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-graphite-400 uppercase tracking-wide mb-3">Precio (COP)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Mín" value={filtros.precioMin}
            onChange={e => { setFiltros(f => ({ ...f, precioMin: e.target.value })); setPage(1) }}
            className="w-full px-2 py-1.5 text-sm border border-graphite-200 rounded-md bg-white focus:outline-none focus:border-accent" />
          <input type="number" placeholder="Máx" value={filtros.precioMax}
            onChange={e => { setFiltros(f => ({ ...f, precioMax: e.target.value })); setPage(1) }}
            className="w-full px-2 py-1.5 text-sm border border-graphite-200 rounded-md bg-white focus:outline-none focus:border-accent" />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" checked={filtros.soloStock}
          onChange={e => { setFiltros(f => ({ ...f, soloStock: e.target.checked })); setPage(1) }}
          className="w-4 h-4 accent-[#C8762C] rounded" />
        <span className="text-sm text-graphite-600">Solo disponibles</span>
      </label>
    </aside>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <ProductQuickModal productoId={quickId} onClose={() => setQuickId(null)} />

      {/* Topbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-graphite-900">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo'}
          </h1>
          <p className="text-sm text-graphite-400 mt-0.5">
            {loading ? 'Cargando...' : `${filtered.length} productos`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSideOpen(v => !v)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-graphite-200 rounded-md text-sm text-graphite-600 hover:border-accent transition-colors">
            <SlidersHorizontal size={15} /> Filtros
            {hasFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>
          <div className="relative">
            <select value={orden} onChange={e => { setOrden(e.target.value); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2 border border-graphite-200 rounded-md text-sm text-graphite-600 bg-white focus:outline-none focus:border-accent cursor-pointer">
              {ORDEN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-graphite-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="card p-5 sticky top-20"><Sidebar /></div>
        </div>

        {/* Mobile sidebar */}
        {sideOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSideOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-72 bg-white z-50 p-5 overflow-y-auto shadow-modal lg:hidden">
              <div className="flex items-center justify-between mb-5">
                <span className="font-semibold">Filtros</span>
                <button onClick={() => setSideOpen(false)}><X size={18} /></button>
              </div>
              <Sidebar />
              <button onClick={() => setSideOpen(false)}
                className="mt-6 w-full py-2.5 bg-accent text-white rounded-md font-medium text-sm">
                Ver {filtered.length} resultados
              </button>
            </div>
          </>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-graphite-400">
              <Loader2 size={32} className="animate-spin" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20 text-graphite-400">
              <p className="text-lg font-medium">Sin resultados</p>
              <button onClick={resetFiltros} className="mt-4 text-accent text-sm hover:underline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(p => (
                <ProductCard key={p.id} producto={p} onQuickView={setQuickId} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border border-graphite-200 rounded-md text-sm text-graphite-600 hover:border-accent hover:text-accent disabled:opacity-40 transition-colors">
                ← Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1
                if (totalPages > 5 && page > 3) p = page - 2 + i
                if (p > totalPages) return null
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-md text-sm font-medium transition-colors
                      ${p === page ? 'bg-accent text-white' : 'border border-graphite-200 text-graphite-600 hover:border-accent hover:text-accent'}`}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 border border-graphite-200 rounded-md text-sm text-graphite-600 hover:border-accent hover:text-accent disabled:opacity-40 transition-colors">
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
