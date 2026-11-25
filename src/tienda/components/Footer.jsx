import { Link } from 'react-router-dom'
import logo from '../../assets/logo-k.png'
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/contact'

const cols = [
  {
    title: 'Empresa',
    links: [
      { label: 'Quiénes somos', to: '/tienda/nosotros' },
      { label: 'Contacto', to: '/tienda/contacto' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Contacto', to: '/tienda/contacto' },
      { label: 'Rastrear pedido', to: '/tienda/pedido' },
      { label: 'Devoluciones', to: '/tienda/terminos' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos y condiciones', to: '/tienda/terminos' },
      { label: 'Política de privacidad', to: '/tienda/privacidad' },
      { label: 'Cookies', to: '/tienda/cookies' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-graphite-900 text-white mt-20">
      <div className="border-b border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <p className="font-semibold text-lg text-white">¿Dudas con un pedido?</p>
            <p className="text-graphite-300 text-sm mt-1">Escribinos por WhatsApp. No hay un boletín con descuento automático.</p>
          </div>
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer"
            className="px-5 py-2 bg-kobber-500 text-white text-sm font-semibold rounded-md hover:bg-kobber-600">
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <img src={logo} alt="Kobber" width={40} height={40} className="w-10 h-10 rounded-xl object-cover mb-4" />
            <p className="text-graphite-300 text-sm leading-relaxed">
              Ferretería con catálogo Truper, Pretul y otras marcas. Precios de la tienda con IVA incluido.
            </p>
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer"
              className="inline-flex mt-4 text-sm text-white underline decoration-white/40 hover:decoration-white"
              aria-label="WhatsApp de Kobber">
              WhatsApp
            </a>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <p className="font-semibold text-sm text-white mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-graphite-300 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-graphite-400 text-xs">
          <p>© {new Date().getFullYear()} Kobber. Todos los derechos reservados.</p>
          <p>Colombia</p>
        </div>
      </div>
    </footer>
  )
}
