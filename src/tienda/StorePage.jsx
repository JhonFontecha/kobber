import { lazy, Suspense, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header            from './components/Header'
import Footer            from './components/Footer'
import CartDrawer        from './components/CartDrawer'
import ProductQuickModal from './components/ProductQuickModal'
import SplashScreen      from './components/SplashScreen'
import WhatsAppFloat     from './components/WhatsAppFloat'

const HomePage          = lazy(() => import('./pages/HomePage'))
const CatalogoPage      = lazy(() => import('./pages/CatalogoPage'))
const OfertasPage       = lazy(() => import('./pages/OfertasPage'))
const LoginPage         = lazy(() => import('./pages/LoginPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'))

const info = (name) => lazy(() => import('./pages/InfoPages').then(m => ({ default: m[name] })))
const TerminosPage   = info('TerminosPage')
const PrivacidadPage = info('PrivacidadPage')
const CookiesPage    = info('CookiesPage')
const ContactoPage   = info('ContactoPage')
const NosotrosPage   = info('NosotrosPage')
const PedidoPage     = info('PedidoPage')

const SPLASH_KEY = 'kobber_splash_shown'

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]" role="status">
      <div className="w-8 h-8 border-2 border-kobber-500 border-t-transparent rounded-full animate-spin" />
      <span className="sr-only">Cargando</span>
    </div>
  )
}

export default function StorePage() {
  const [showSplash] = useState(() => !sessionStorage.getItem(SPLASH_KEY))
  const [splashDone, setSplashDone] = useState(() => !!sessionStorage.getItem(SPLASH_KEY))
  const [searchQuery, setSearchQuery] = useState('')
  const [quickId, setQuickId] = useState(null)

  const handleSplashDone = () => {
    sessionStorage.setItem(SPLASH_KEY, '1')
    setSplashDone(true)
  }

  return (
    <>
      {showSplash && !splashDone && (
        <SplashScreen onComplete={handleSplashDone} />
      )}

      <div className="min-h-screen flex flex-col bg-[#F7F4F0] overflow-x-clip">
        <Header onSearch={setSearchQuery} />
        <CartDrawer />
        <ProductQuickModal productoId={quickId} onClose={() => setQuickId(null)} />

        <main className="flex-1 min-w-0">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route index element={<HomePage onQuickView={setQuickId} />} />
              <Route path="catalogo" element={<CatalogoPage searchQuery={searchQuery} onQuickView={setQuickId} />} />
              <Route path="ofertas" element={<OfertasPage onQuickView={setQuickId} />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="producto/:id" element={<ProductDetailPage />} />
              <Route path="terminos" element={<TerminosPage />} />
              <Route path="privacidad" element={<PrivacidadPage />} />
              <Route path="cookies" element={<CookiesPage />} />
              <Route path="contacto" element={<ContactoPage />} />
              <Route path="nosotros" element={<NosotrosPage />} />
              <Route path="pedido" element={<PedidoPage />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>

      <WhatsAppFloat />
    </>
  )
}
