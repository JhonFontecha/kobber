import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react'
import useCartStore, { selectCount } from '../store/cartStore'
import logo from '../../assets/logo.png'

export default function Header({ onSearch }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchVal,  setSearchVal]  = useState('')
  const count   = useCartStore(selectCount)
  const setOpen = useCartStore(s => s.setOpen)
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
    <header className="sticky top-0 z-40 bg-white border-b border-graphite-200 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          {/* Logo — recortado a la K con esquinas redondeadas */}
          <Link to="/tienda" className="shrink-0">
            <div
              className="w-9 h-9 rounded-xl"
              style={{
                backgroundImage: `url(${logo})`,
                backgroundSize: '220%',
                backgroundPosition: 'center 15%',
                backgroundRepeat: 'no-repeat',
              }}
              role="img"
              aria-label="Kobber"
            />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-0.5 ml-4">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className="px-3 py-2 text-sm text-graphite-500 hover:text-graphite-900
                           hover:bg-graphite-100 rounded-md transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden sm:flex">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
              <input type="text"
                placeholder="Buscar herramientas, marcas..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-graphite-50 border border-graphite-200
                           rounded-lg focus:outline-none focus:border-kobber-500 focus:bg-white
                           text-graphite-900 placeholder-graphite-400 transition-colors" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Carrito — kobber-500 en el badge contador */}
            <button onClick={() => setOpen(true)}
              className="relative p-2 text-graphite-500 hover:text-graphite-900
                         hover:bg-graphite-100 rounded-md transition-colors"
              aria-label="Carrito">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-kobber-500 text-white text-[10px]
                                 font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>

            {/* Login */}
            <Link to="/tienda/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-graphite-500
                         hover:text-graphite-900 hover:bg-graphite-100 rounded-md transition-colors">
              <User size={15} />
              <span>Ingresar</span>
            </Link>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-graphite-500 hover:text-graphite-900 rounded-md transition-colors"
              aria-label="Menú">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
            <input type="text" placeholder="Buscar herramientas..."
              value={searchVal} onChange={e => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-graphite-50 border border-graphite-200
                         rounded-lg focus:outline-none focus:border-kobber-500 text-graphite-900" />
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-graphite-200 bg-white px-4 py-3 flex flex-col gap-0.5">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 text-sm text-graphite-600 hover:text-graphite-900
                         hover:bg-graphite-100 rounded-md transition-colors">
              {l.label}
            </Link>
          ))}
          <Link to="/tienda/login" onClick={() => setMobileOpen(false)}
            className="py-2.5 px-3 text-sm text-graphite-600 hover:text-graphite-900
                       hover:bg-graphite-100 rounded-md transition-colors flex items-center gap-2">
            <User size={15} /> Ingresar
          </Link>
        </div>
      )}
    </header>
  )
}
