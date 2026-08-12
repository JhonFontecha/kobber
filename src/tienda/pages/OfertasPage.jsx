import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Flame, Clock, Tag, ArrowRight, Zap } from 'lucide-react'
import { useStoreProducts } from '../hooks/useStoreProducts'
import ProductCard from '../components/ProductCard'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

// Hash determinístico para que cada producto siempre tenga el mismo descuento
const hashId = (id) => {
  const s = String(id)
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Descuento determinístico entre 10% y 45%
const getDescuento = (id) => 10 + (hashId(id) % 36)

const TIERS = [
  { id: 'todas', label: 'Todas',     min: 0  },
  { id: 'top',   label: 'Mega 30%+', min: 30 },
  { id: 'mid',   label: '20-29%',    min: 20, max: 30 },
  { id: 'low',   label: 'Hasta 19%', min: 10, max: 20 },
]

const ORDEN = [
  { id: 'descuento',   label: 'Mayor descuento' },
  { id: 'precio-asc',  label: 'Precio: menor a mayor' },
  { id: 'precio-desc', label: 'Precio: mayor a menor' },
]

// Countdown que termina a las 23:59:59 del día actual
function useCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const end = new Date(now); end.setHours(23, 59, 59, 999)
      const diff = Math.max(0, end - now)
      setTime({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

const Pad = ({ n }) => <span className="tabular-nums">{String(n).padStart(2, '0')}</span>

export default function OfertasPage({ onQuickView }) {
  const { productos, loading } = useStoreProducts()
  const [tier,  setTier]  = useState('todas')
  const [orden, setOrden] = useState('descuento')
  const { h, m, s }       = useCountdown()

  // Enriquecer productos con descuento + precio anterior
  const enriched = useMemo(() => {
    return productos
      .filter(p => p.stock_total > 0)
      .map(p => {
        const descuento = getDescuento(p.id)
        const precioAnterior = Math.round(p.precio / (1 - descuento / 100))
        return { ...p, descuento, precioAnterior }
      })
  }, [productos])

  // Filtrar por tier
  const filtered = useMemo(() => {
    const t = TIERS.find(x => x.id === tier)
    let list = enriched.filter(p => p.descuento >= t.min && (!t.max || p.descuento < t.max))
    if (orden === 'descuento')   list.sort((a, b) => b.descuento - a.descuento)
    if (orden === 'precio-asc')  list.sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-desc') list.sort((a, b) => b.precio - a.precio)
    return list
  }, [enriched, tier, orden])

  // Top 3 destacadas
  const destacadas = useMemo(
    () => [...enriched].sort((a, b) => b.descuento - a.descuento).slice(0, 3),
    [enriched]
  )

  return (
    <div>
      {/* ── Hero con countdown ────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-graphite-900 via-graphite-800 to-kobber-700 py-14 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-white relative">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={18} className="text-kobber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-kobber-300">Ofertas limitadas</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            Ofertas <span className="text-kobber-400">imperdibles</span>
          </h1>
          <p className="mt-3 text-white/70 max-w-xl">
            Hasta 45% de descuento en herramientas profesionales. Aprovecha antes de que se acaben.
          </p>

          {/* Countdown */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-lg">
            <Clock size={16} className="text-kobber-300" />
            <span className="text-sm text-white/80">Termina en</span>
            <div className="flex items-center gap-1 font-bold text-white">
              <Pad n={h} /><span className="text-kobber-400">:</span>
              <Pad n={m} /><span className="text-kobber-400">:</span>
              <Pad n={s} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* ── Top 3 más rebajadas ───────────────────────────────────────── */}
        {!loading && destacadas.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={20} className="text-kobber-500 fill-kobber-500" />
              <h2 className="text-xl font-bold text-graphite-900">Las más rebajadas</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {destacadas.map(p => (
                <Link key={p.id} to={`/tienda/producto/${p.id}`}
                  className="relative flex items-center gap-4 bg-white border border-graphite-200 rounded-xl p-4
                             hover:border-kobber-500 hover:shadow-float transition-all group overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-red-500 to-red-600 text-white
                                  text-sm font-bold px-3 py-1.5 rounded-bl-lg">
                    -{p.descuento}%
                  </div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-graphite-50 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                    {p.imagenes?.[0]
                      ? <img src={p.imagenes[0]} alt={p.nombre} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                      : <Tag size={28} className="text-graphite-300" />}
                  </div>
                  <div className="flex-1 min-w-0 pr-10">
                    <p className="text-[10px] font-bold text-kobber-700 uppercase tracking-wider">{p.marca}</p>
                    <p className="text-sm font-semibold text-graphite-900 line-clamp-2 leading-snug mt-0.5">{p.nombre}</p>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-base font-bold text-graphite-900">{fmt(p.precio)}</span>
                      <span className="text-xs text-graphite-400 line-through">{fmt(p.precioAnterior)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Filtros + Orden ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-graphite-200">
          <div className="flex flex-wrap gap-2">
            {TIERS.map(t => {
              const count = enriched.filter(p => p.descuento >= t.min && (!t.max || p.descuento < t.max)).length
              return (
                <button key={t.id} onClick={() => setTier(t.id)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-full border transition-colors
                    ${tier === t.id
                      ? 'bg-graphite-900 text-white border-graphite-900'
                      : 'bg-white text-graphite-600 border-graphite-200 hover:border-kobber-500 hover:text-kobber-600'}`}>
                  {t.label}
                  <span className={`ml-1.5 text-xs ${tier === t.id ? 'text-white/60' : 'text-graphite-400'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
          <select value={orden} onChange={e => setOrden(e.target.value)}
            className="px-3 py-2 text-sm border border-graphite-200 rounded-md bg-white focus:outline-none focus:border-kobber-500 cursor-pointer">
            {ORDEN.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        {/* ── Grid de ofertas ───────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-graphite-400">No hay ofertas en este rango.</p>
            <button onClick={() => setTier('todas')} className="mt-3 text-sm text-kobber-600 hover:underline">
              Ver todas las ofertas
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-graphite-500 mb-4">
              <span className="font-semibold text-graphite-900">{filtered.length}</span> productos en oferta
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(p => <ProductCard key={p.id} producto={p} onQuickView={onQuickView} />)}
            </div>
          </>
        )}

        {/* ── CTA al catálogo ───────────────────────────────────────────── */}
        <div className="mt-14 bg-graphite-900 rounded-2xl p-8 sm:p-10 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white">¿Buscas algo más?</h3>
          <p className="mt-2 text-white/60 max-w-md mx-auto">
            Explora el catálogo completo y encuentra herramientas profesionales para cada proyecto.
          </p>
          <Link to="/tienda/catalogo"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-kobber-500 text-white font-semibold
                       rounded-lg hover:bg-kobber-600 transition-colors">
            Ver catálogo completo <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
