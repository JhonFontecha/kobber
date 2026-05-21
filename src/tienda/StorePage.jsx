import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header     from './components/Header'
import Footer     from './components/Footer'
import CartDrawer from './components/CartDrawer'
import HomePage   from './pages/HomePage'
import CatalogoPage from './pages/CatalogoPage'
import OfertasPage  from './pages/OfertasPage'
import LoginPage    from './pages/LoginPage'

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4F0]">
      <Header onSearch={setSearchQuery} />
      <CartDrawer />

      <main className="flex-1">
        <Routes>
          <Route index                element={<HomePage />} />
          <Route path="catalogo"      element={<CatalogoPage searchQuery={searchQuery} />} />
          <Route path="ofertas"       element={<OfertasPage />} />
          <Route path="login"         element={<LoginPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
