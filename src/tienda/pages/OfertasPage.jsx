import { useStoreProducts } from '../hooks/useStoreProducts'
import ProductCard from '../components/ProductCard'
import { Loader2 } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function OfertasPage({ onQuickView }) {
  const { productos, loading } = useStoreProducts()
  // Mostrar todos los productos con stock como "ofertas"
  const conStock = productos.filter(p => p.stock_total > 0)

  return (
    <div>
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#9A5818] to-[#C8762C] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-white text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Disponibles ahora
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold">Productos disponibles</h1>
          <p className="mt-2 text-white/80">
            {loading ? 'Cargando...' : `${conStock.length} productos en stock`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {conStock.map(p => <ProductCard key={p.id} producto={p} onQuickView={onQuickView} />)}
          </div>
        )}
      </div>
    </div>
  )
}
