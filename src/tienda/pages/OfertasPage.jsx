import { getOfertas } from '../data/productos'
import ProductCard from '../components/ProductCard'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function OfertasPage() {
  const ofertas = getOfertas()
  const totalAhorro = ofertas.reduce((acc, p) =>
    acc + (p.precioAnterior ? p.precioAnterior - p.precio : 0), 0)

  return (
    <div>
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#9A5818] to-[#C8762C] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-white text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest
                           px-3 py-1 rounded-full mb-3">
            Tiempo limitado
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold">Ofertas especiales</h1>
          <p className="mt-2 text-white/80">
            {ofertas.length} productos con descuento — Ahorra hasta {fmt(Math.max(...ofertas.map(p => p.precioAnterior ? p.precioAnterior - p.precio : 0)))}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ofertas.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      </div>
    </div>
  )
}
