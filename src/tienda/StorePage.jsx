import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header            from './components/Header'
import Footer            from './components/Footer'
import CartDrawer        from './components/CartDrawer'
import ProductQuickModal from './components/ProductQuickModal'
import SplashScreen      from './components/SplashScreen'
import HomePage          from './pages/HomePage'
import CatalogoPage      from './pages/CatalogoPage'
import OfertasPage       from './pages/OfertasPage'
import LoginPage         from './pages/LoginPage'
import ProductDetailPage from './pages/ProductDetailPage'

const SPLASH_KEY = 'kobber_splash_shown'

export default function StorePage() {
  const [showSplash,   ]  = useState(() => !sessionStorage.getItem(SPLASH_KEY))
  const [splashDone, setSplashDone] = useState(() => !!sessionStorage.getItem(SPLASH_KEY))
  const [searchQuery, setSearchQuery] = useState('')
  const [quickId,     setQuickId]     = useState(null)

  const handleSplashDone = () => {
    sessionStorage.setItem(SPLASH_KEY, '1')
    setSplashDone(true)
  }

  return (
    <>
      {showSplash && !splashDone && (
        <SplashScreen onComplete={handleSplashDone} />
      )}

      <div className="min-h-screen flex flex-col bg-[#F7F4F0]">
        <Header onSearch={setSearchQuery} />
        <CartDrawer />
        <ProductQuickModal productoId={quickId} onClose={() => setQuickId(null)} />

        <main className="flex-1">
          <Routes>
            <Route index               element={<HomePage     onQuickView={setQuickId} />} />
            <Route path="catalogo"     element={<CatalogoPage searchQuery={searchQuery} onQuickView={setQuickId} />} />
            <Route path="ofertas"      element={<OfertasPage  onQuickView={setQuickId} />} />
            <Route path="login"        element={<LoginPage />} />
            <Route path="producto/:id" element={<ProductDetailPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  )
}
