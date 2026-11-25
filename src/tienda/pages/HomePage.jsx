import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, HeadphonesIcon, Tag } from 'lucide-react'
import { useStoreProducts } from '../hooks/useStoreProducts'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'

const SLIDES = [
  {
    id: 1,
    titulo: 'Herramientas profesionales para cada proyecto',
    subtitulo: 'Catálogo Truper, Pretul y otras marcas. Los precios de la tienda incluyen IVA.',
    cta: 'Ver catálogo',
    href: '/tienda/catalogo',
    bg: 'from-graphite-900 to-graphite-800',
    img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=960&h=540&q=70',
  },
  {
    id: 2,
    titulo: 'Ofertas solo cuando el precio anterior es real',
    subtitulo: 'Si hay una rebaja cargada en el catálogo, la vas a ver tachada. Si no, no inventamos descuentos.',
    cta: 'Ver ofertas',
    href: '/tienda/ofertas',
    bg: 'from-kobber-700 to-kobber-500',
    img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=960&h=540&q=70',
  },
  {
    id: 3,
    titulo: 'Seguridad industrial',
    subtitulo: 'Explorá el catálogo de protección para obra, industria y construcción.',
    cta: 'Ver catálogo',
    href: '/tienda/catalogo',
    bg: 'from-graphite-800 to-success/80',
    img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=960&h=540&q=70',
  },
]

const VALORES = [
  { icon: Truck, titulo: 'Envío a Colombia', desc: 'El costo se ve antes de confirmar' },
  { icon: ShieldCheck, titulo: 'Precio final', desc: 'IVA incluido en la ficha' },
  { icon: HeadphonesIcon, titulo: 'WhatsApp', desc: 'Consultas por el canal de contacto' },
  { icon: Tag, titulo: 'Ofertas reales', desc: 'Solo si hay un precio anterior cargado' },
]

export default function HomePage({ onQuickView }) {
  const [slide, setSlide] = useState(0)
  const destacados = useStoreProducts({ page: 1, pageSize: 8, orden: 'nombre' })
  const ofertas = useStoreProducts({ page: 1, pageSize: 8, enOferta: true, orden: 'descuento' })

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 7000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setSlide(s => (s + 1) % SLIDES.length)
  const s = SLIDES[slide]
  const maxDescuento = Math.max(0, ...(ofertas.productos || []).map(p => p.descuento || 0))

  return (
    <div className="min-w-0">
      <Seo
        title="Kobber | Ferretería"
        description="Ferretería Kobber en Colombia. Herramientas Truper, Pretul y más, con precios finales e IVA incluido."
        path="/"
      />

      <section className="relative overflow-hidden" aria-roledescription="carrusel" aria-label="Destacados">
        <div className={`bg-gradient-to-r ${s.bg} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white min-w-0">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-3">
                  Ferretería Kobber
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {s.titulo}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-white/85 leading-relaxed max-w-md">
                  {s.subtitulo}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={s.href}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-graphite-900
                               font-semibold rounded-lg hover:bg-kobber-500 hover:text-white transition-colors">
                    {s.cta} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link to="/tienda/catalogo"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 text-white
                               font-medium rounded-lg hover:bg-white/10 transition-colors">
                    Todo el catálogo
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src={s.img}
                  alt=""
                  width={960}
                  height={540}
                  {...(slide === 0 ? { fetchpriority: 'high' } : {})}
                  loading={slide === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-72 object-cover rounded-xl shadow-modal"
                />
              </div>
            </div>
          </div>
        </div>

        <button type="button" onClick={prev} aria-label="Diapositiva anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40
                     rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button type="button" onClick={next} aria-label="Diapositiva siguiente"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40
                     rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {SLIDES.map((item, i) => (
            <button key={item.id} type="button" onClick={() => setSlide(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              className={`rounded-full transition-all duration-200
                ${i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
          ))}
        </div>
      </section>

      <section className="bg-white border-b border-graphite-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {VALORES.map(v => (
              <li key={v.titulo} className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-md bg-kobber-50 flex items-center justify-center shrink-0">
                  <v.icon size={20} className="text-accent" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-graphite-900">{v.titulo}</p>
                  <p className="text-xs text-graphite-600">{v.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-graphite-900">Del catálogo</h2>
            <p className="text-sm text-graphite-600 mt-1">Una selección para empezar a mirar</p>
          </div>
          <Link to="/tienda/catalogo"
            className="hidden sm:flex items-center gap-1 text-sm text-kobber-700 font-medium hover:underline">
            Ver todos <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        {destacados.loading ? (
          <p className="text-sm text-graphite-600">Cargando productos…</p>
        ) : destacados.productos.length === 0 ? (
          <p className="text-sm text-graphite-600">No hay productos para mostrar en este momento.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {destacados.productos.slice(0, 8).map(p => <ProductCard key={p.id} producto={p} onQuickView={onQuickView} />)}
          </div>
        )}
      </section>

      <section className="bg-graphite-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {maxDescuento > 0 ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Hay ofertas de hasta <span className="text-kobber-300">{maxDescuento}%</span>
              </h2>
              <p className="mt-3 text-white/80 max-w-xl mx-auto">
                El porcentaje sale del precio anterior cargado en cada producto.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Catálogo con precio final</h2>
              <p className="mt-3 text-white/80 max-w-xl mx-auto">
                En este momento no hay ofertas con un precio anterior cargado. Podés recorrer el catálogo completo.
              </p>
            </>
          )}
          <Link to={maxDescuento > 0 ? '/tienda/ofertas' : '/tienda/catalogo'}
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-kobber-500 text-white
                       font-semibold rounded-lg hover:bg-kobber-600 transition-colors">
            {maxDescuento > 0 ? 'Ver ofertas' : 'Ver catálogo'} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-graphite-900">Ofertas activas</h2>
            <p className="text-sm text-graphite-600 mt-1">
              Solo productos con un precio anterior real
            </p>
          </div>
          <Link to="/tienda/ofertas"
            className="hidden sm:flex items-center gap-1 text-sm text-kobber-700 font-medium hover:underline">
            Ver todas <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        {ofertas.loading ? (
          <p className="text-sm text-graphite-600">Cargando ofertas…</p>
        ) : ofertas.productos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-graphite-300 bg-white px-6 py-10 text-center">
            <p className="font-semibold text-graphite-900">No hay ofertas activas</p>
            <p className="text-sm text-graphite-600 mt-2 max-w-md mx-auto">
              Cuando un producto tenga un precio anterior cargado, va a aparecer acá. Mientras tanto el catálogo sigue disponible.
            </p>
            <Link to="/tienda/catalogo" className="inline-block mt-4 text-sm font-semibold text-kobber-700 hover:underline">
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ofertas.productos.map(p => <ProductCard key={p.id} producto={p} onQuickView={onQuickView} />)}
          </div>
        )}
      </section>
    </div>
  )
}
