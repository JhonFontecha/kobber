import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, HeadphonesIcon, Tag } from 'lucide-react'
import { getTendencias, getOfertas } from '../data/productos'
import ProductCard from '../components/ProductCard'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const SLIDES = [
  {
    id: 1,
    titulo:    'Herramientas profesionales para cada proyecto',
    subtitulo: 'Las mejores marcas: Truper, Pretul, Urrea y más a precios de distribuidor.',
    cta:       'Ver catálogo completo',
    href:      '/tienda/catalogo',
    bg:        'from-[#1A1510] to-[#3a2a1a]',
    img:       'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=500&fit=crop',
  },
  {
    id: 2,
    titulo:    'Ofertas de temporada — hasta 25% off',
    subtitulo: 'Taladros, sierras, compresores y accesorios con descuentos especiales.',
    cta:       'Ver ofertas',
    href:      '/tienda/ofertas',
    bg:        'from-[#9A5818] to-[#C8762C]',
    img:       'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=500&fit=crop',
  },
  {
    id: 3,
    titulo:    'Seguridad industrial — EPI certificado',
    subtitulo: 'Protección personal completa para obra, industria y construcción.',
    cta:       'Explorar seguridad',
    href:      '/tienda/catalogo?categoria=Seguridad+industrial',
    bg:        'from-[#1c3328] to-[#2E7D52]',
    img:       'https://images.unsplash.com/photo-1597766353939-97a5bb0f1b13?w=800&h=500&fit=crop',
  },
]

const VALORES = [
  { icon: Truck,           titulo: 'Envío rápido',       desc: 'A todo el país en 24-72 h' },
  { icon: ShieldCheck,     titulo: 'Garantía real',       desc: 'Respaldamos todos los productos' },
  { icon: HeadphonesIcon,  titulo: 'Soporte 7/7',         desc: 'Asesores disponibles siempre' },
  { icon: Tag,             titulo: 'Mejor precio',        desc: 'Competimos con cualquier oferta' },
]

export default function HomePage() {
  const [slide, setSlide] = useState(0)
  const tendencias = getTendencias()
  const ofertas    = getOfertas()

  // Auto-avance del carrusel
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setSlide(s => (s + 1) % SLIDES.length)

  const s = SLIDES[slide]

  return (
    <div>
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className={`bg-gradient-to-r ${s.bg} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-white">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-3">
                  Ferretería Kobber
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {s.titulo}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-white/75 leading-relaxed max-w-md">
                  {s.subtitulo}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={s.href}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1A1510]
                               font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors">
                    {s.cta} <ArrowRight size={16} />
                  </Link>
                  <Link to="/tienda/catalogo"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white
                               font-medium rounded-lg hover:bg-white/10 transition-colors">
                    Todo el catálogo
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <img src={s.img} alt={s.titulo}
                  className="w-full h-72 object-cover rounded-xl shadow-modal opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Controles carrusel */}
        <button onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40
                     rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronLeft size={18} />
        </button>
        <button onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40
                     rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-200
                ${i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
          ))}
        </div>
      </section>

      {/* ── VALORES ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#EAE5DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {VALORES.map(v => (
              <div key={v.titulo} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#FDF1E4] flex items-center justify-center shrink-0">
                  <v.icon size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#1A1510]">{v.titulo}</p>
                  <p className="text-xs text-[#9E9890]">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TENDENCIAS ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1510]">Más vendidos</h2>
            <p className="text-sm text-[#9E9890] mt-1">Los favoritos de nuestros clientes</p>
          </div>
          <Link to="/tienda/catalogo"
            className="hidden sm:flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tendencias.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
        <div className="mt-6 sm:hidden text-center">
          <Link to="/tienda/catalogo"
            className="inline-flex items-center gap-1 text-sm text-accent font-medium">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── BANNER PROMO ────────────────────────────────────────────────── */}
      <section className="bg-[#1A1510] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-accent text-white text-xs font-bold uppercase tracking-widest
                           px-3 py-1 rounded-full mb-4">
            Oferta especial
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Hasta <span className="text-accent">25% de descuento</span>
          </h2>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">
            En herramientas eléctricas seleccionadas. Válido por tiempo limitado.
          </p>
          <Link to="/tienda/ofertas"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white
                       font-semibold rounded-lg hover:bg-accent-dark transition-colors">
            Ver todas las ofertas <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── OFERTAS GRID ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1510]">Ofertas activas</h2>
            <p className="text-sm text-[#9E9890] mt-1">Precio tachado = precio anterior</p>
          </div>
          <Link to="/tienda/ofertas"
            className="hidden sm:flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ofertas.slice(0, 8).map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      </section>

      {/* ── SÍGUENOS ────────────────────────────────────────────────────── */}
      <section className="bg-[#FDF1E4] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl font-bold text-[#1A1510]">Síguenos en redes</h2>
          <p className="text-sm text-[#6B6258] mt-2">
            Trucos, novedades y ofertas exclusivas para seguidores
          </p>
          <div className="mt-6 flex justify-center gap-4">
            {[
              { label: 'Facebook',  href: '#', color: 'bg-blue-600' },
              { label: 'Instagram', href: '#', color: 'bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400' },
              { label: 'WhatsApp', href: '#', color: 'bg-green-500' },
              { label: 'TikTok',   href: '#', color: 'bg-[#1A1510]' },
            ].map(r => (
              <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer"
                 className={`${r.color} text-white text-sm font-medium px-5 py-2.5 rounded-lg
                              hover:opacity-90 transition-opacity`}>
                {r.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
