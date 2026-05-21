import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const SvgFacebook  = () => <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const SvgInstagram = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
const SvgWhatsApp  = () => <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
const SvgTikTok    = () => <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.55V6.78a4.85 4.85 0 0 1-1.07-.09z"/></svg>

const redes = [
  { Icon: SvgFacebook,  label: 'Facebook',  href: '#' },
  { Icon: SvgInstagram, label: 'Instagram', href: '#' },
  { Icon: SvgWhatsApp,  label: 'WhatsApp',  href: '#' },
  { Icon: SvgTikTok,    label: 'TikTok',    href: '#' },
]

const cols = [
  { title: 'Empresa', links: ['Quiénes somos', 'Trabaja con nosotros', 'Blog'] },
  { title: 'Ayuda',   links: ['Centro de ayuda', 'Rastrear pedido', 'Devoluciones', 'Contacto'] },
  { title: 'Legal',   links: ['Términos y condiciones', 'Política de privacidad', 'Cookies'] },
]

export default function Footer() {
  return (
    /* graphite-900 solo en footer — el resto del sitio respira en crema/blanco */
    <footer className="bg-graphite-900 text-white mt-20">

      {/* Newsletter — kobber-500 como acción principal de suscripción */}
      <div className="border-b border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div>
            <p className="font-semibold text-lg text-white">¿Quieres recibir ofertas exclusivas?</p>
            <p className="text-graphite-400 text-sm mt-1">Suscríbete y obtén 10% en tu primera compra</p>
          </div>
          <form onSubmit={e => e.preventDefault()} className="flex w-full sm:w-auto gap-2 max-w-md">
            <input type="email" placeholder="tu@email.com"
              className="flex-1 px-4 py-2 rounded-md text-sm text-graphite-900 bg-white
                         border-0 focus:outline-none focus:ring-2 focus:ring-kobber-300" />
            <button type="submit"
              className="px-5 py-2 bg-kobber-500 text-white text-sm font-semibold rounded-md
                         hover:bg-kobber-600 transition-colors whitespace-nowrap">
              Suscribirse
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <img src={logo} alt="Kobber" className="h-10 w-auto" />
            </div>
            <p className="text-graphite-400 text-sm leading-relaxed">
              Tu ferretería de confianza. Herramientas profesionales Truper, Pretul y más marcas líderes.
            </p>
            <div className="flex items-center gap-2.5 mt-6">
              {redes.map(r => (
                <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer"
                   className="w-8 h-8 rounded-md bg-white/8 hover:bg-kobber-500/80 flex items-center
                              justify-center text-graphite-400 hover:text-white transition-colors"
                   aria-label={r.label}>
                  <r.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {cols.map(col => (
            <div key={col.title}>
              <p className="font-semibold text-sm text-white/80 mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-graphite-400 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-graphite-500 text-xs">
          <p>© {new Date().getFullYear()} Kobber Ferretería. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ en Colombia</p>
        </div>
      </div>
    </footer>
  )
}
