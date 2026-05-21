import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { productos, CATEGORIAS, MARCAS } from '../data/productos'
import ProductCard from '../components/ProductCard'

const ORDEN_OPTIONS = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'rating',      label: 'Mejor valorados' },
]

const PAGE_SIZE = 12

export default function CatalogoPage({ searchQuery = '' }) {
  const [searchParams] = useSearchParams()
  const catParam       = searchParams.get('categoria') || ''

  const [filtros, setFiltros]   = useState({
    categorias:     catParam ? [catParam] : [],
    marcas:         [],
    precioMin:      '',
    precioMax:      '',
    soloStock:      false,
  })
  const [orden, setOrden]       = useState('relevancia')
  const [page,  setPage]        = useState(1)
  const [sideOpen, setSideOpen] = useState(false)

  const toggleArr = (key, val) =>
    setFiltros(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }))

  const filtered = useMemo(() => {
    let list = [...productos]

    // Búsqueda
    const q = searchQuery.toLowerCase()
    if (q) list = list.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      p.clave.toLowerCase().includes(q)
    )

    // Filtros
    if (filtros.categorias.length) list = list.filter(p => filtros.categorias.includes(p.categoria))
    if (filtros.marcas.length)     list = list.filter(p => filtros.marcas.includes(p.marca))
    if (filtros.precioMin)         list = list.filter(p => p.precio >= Number(filtros.precioMin))
    if (filtros.precioMax)         list = list.filter(p => p.precio <= Number(filtros.precioMax))
    if (filtros.soloStock)         list = list.filter(p => p.stock > 0)

    // Orden
    if (orden === 'precio-asc')  list.sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-desc') list.sort((a, b) => b.precio - a.precio)
    if (orden === 'rating')      list.sort((a, b) => b.rating - a.rating)

    return list
  }, [filtros, orden, searchQuery])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFiltros = () => setFiltros({ categorias: [], marcas: [], precioMin: '', precioMax: '', soloStock: false })
  const hasFilters   = filtros.categorias.length || filtros.marcas.length || filtros.precioMin || filtros.precioMax || filtros.soloStock

  const Sidebar = () => (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#1A1510]">Filtros</h3>
        {hasFilters && (
          <button onClick={resetFiltros} className="text-xs text-accent hover:underline flex items-center gap-1">
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* Categorías */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#9E9890] uppercase tracking-wide mb-3">Categoría</p>
        <ul className="space-y-1.5">
          {CATEGORIAS.map(cat => (
            <li key={cat}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox"
                  checked={filtros.categorias.includes(cat)}
                  onChange={() => { toggleArr('categorias', cat); setPage(1) }}
                  className="w-4 h-4 accent-[#C8762C] rounded" />
                <span className="text-sm text-[#6B6258] group-hover:text-[#1A1510] transition-colors">
                  {cat}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Marcas */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#9E9890] uppercase tracking-wide mb-3">Marca</p>
        <ul className="space-y-1.5">
          {MARCAS.map(m => (
            <li key={m}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox"
                  checked={filtros.marcas.includes(m)}
                  onChange={() => { toggleArr('marcas', m); setPage(1) }}
                  className="w-4 h-4 accent-[#C8762C] rounded" />
                <span className="text-sm text-[#6B6258] group-hover:text-[#1A1510] transition-colors">{m}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Precio */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#9E9890] uppercase tracking-wide mb-3">Precio (COP)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Mín"
            value={filtros.precioMin}
            onChange={e => { setFiltros(f => ({ ...f, precioMin: e.target.value })); setPage(1) }}
            className="w-full px-2 py-1.5 text-sm border border-[#EAE5DD] rounded-md bg-white focus:outline-none focus:border-accent" />
          <input type="number" placeholder="Máx"
            value={filtros.precioMax}
            onChange={e => { setFiltros(f => ({ ...f, precioMax: e.target.value })); setPage(1) }}
            className="w-full px-2 py-1.5 text-sm border border-[#EAE5DD] rounded-md bg-white focus:outline-none focus:border-accent" />
        </div>
      </div>

      {/* Disponibilidad */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox"
            checked={filtros.soloStock}
            onChange={e => { setFiltros(f => ({ ...f, soloStock: e.target.checked })); setPage(1) }}
            className="w-4 h-4 accent-[#C8762C] rounded" />
          <span className="text-sm text-[#6B6258]">Solo disponibles</span>
        </label>
      </div>
    </aside>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A1510]">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo'}
          </h1>
          <p className="text-sm text-[#9E9890] mt-0.5">{filtered.length} productos</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button onClick={() => setSideOpen(v => !v)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#EAE5DD] rounded-md text-sm text-[#6B6258] hover:border-accent transition-colors">
            <SlidersHorizontal size={15} /> Filtros
            {hasFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>

          {/* Orden */}
          <div className="relative">
            <select
              value={orden}
              onChange={e => { setOrden(e.target.value); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2 border border-[#EAE5DD] rounded-md text-sm
                         text-[#6B6258] bg-white focus:outline-none focus:border-accent cursor-pointer">
              {ORDEN_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E9890] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="card p-5 sticky top-20">
            <Sidebar />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
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
          {paginated.length === 0 ? (
            <div className="text-center py-20 text-[#9E9890]">
              <p className="text-lg font-medium">Sin resultados</p>
              <p className="text-sm mt-1">Intenta con otros filtros o términos</p>
              <button onClick={resetFiltros} className="mt-4 text-accent text-sm hover:underline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(p => <ProductCard key={p.id} producto={p} />)}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border border-[#EAE5DD] rounded-md text-sm text-[#6B6258]
                           hover:border-accent hover:text-accent disabled:opacity-40 transition-colors">
                ← Anterior
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1
                  if (totalPages > 5 && page > 3) p = page - 2 + i
                  if (p > totalPages) return null
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-md text-sm font-medium transition-colors
                        ${p === page ? 'bg-accent text-white' : 'border border-[#EAE5DD] text-[#6B6258] hover:border-accent hover:text-accent'}`}>
                      {p}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 border border-[#EAE5DD] rounded-md text-sm text-[#6B6258]
                           hover:border-accent hover:text-accent disabled:opacity-40 transition-colors">
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
