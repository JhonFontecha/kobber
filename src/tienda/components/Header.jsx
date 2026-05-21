import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, Wrench } from 'lucide-react'
import useCartStore from '../store/cartStore'

export default function Header({ onSearch }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchVal, setSearchVal]   = useState('')
  const { count, setOpen } = useCartStore()

  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      onSearch?.(searchVal.trim())
      navigate('/tienda/catalogo')
      setMobileOpen(false)
    }
  }

  const navLinks = [
    { to: '/tienda',          label: 'Inicio' },
    { to: '/tienda/catalogo', label: 'Catálogo' },
    { to: '/tienda/ofertas',  label: 'Ofertas' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EAE5DD] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/tienda" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <Wrench size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-[#1A1510] hidden sm:block">Kobber</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className="px-3 py-2 text-sm text-[#6B6258] hover:text-accent hover:bg-[#FDF1E4] rounded-md transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden sm:flex">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9890]" />
              <input
                type="text"
                placeholder="Buscar herramientas, marcas..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#F7F4F0] border border-[#EAE5DD] rounded-lg
                           focus:outline-none focus:border-accent focus:bg-white transition-colors"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Cart */}
            <button
              onClick={() => setOpen(true)}
              className="relative p-2 text-[#6B6258] hover:text-accent hover:bg-[#FDF1E4] rounded-md transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px]
                                 font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>

            {/* Login */}
            <Link to="/tienda/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B6258]
                         hover:text-accent hover:bg-[#FDF1E4] rounded-md transition-colors">
              <User size={16} />
              <span>Ingresar</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-[#6B6258] hover:text-accent rounded-md transition-colors"
              aria-label="Menú"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9890]" />
            <input
              type="text"
              placeholder="Buscar herramientas..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F7F4F0] border border-[#EAE5DD] rounded-lg focus:outline-none focus:border-accent"
            />
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#EAE5DD] bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 text-sm text-[#6B6258] hover:text-accent hover:bg-[#FDF1E4] rounded-md transition-colors">
              {l.label}
            </Link>
          ))}
          <Link to="/tienda/login" onClick={() => setMobileOpen(false)}
            className="py-2.5 px-3 text-sm text-[#6B6258] hover:text-accent hover:bg-[#FDF1E4] rounded-md transition-colors flex items-center gap-2">
            <User size={16} /> Ingresar
          </Link>
        </div>
      )}
    </header>
  )
}
