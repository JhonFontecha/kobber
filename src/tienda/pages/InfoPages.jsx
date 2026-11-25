import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/contact'
import { fmt } from '../lib/format'

function Pending({ children }) {
  return (
    <aside className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-graphite-800">
      <p className="font-semibold text-graphite-900">Pendiente de confirmar</p>
      <p className="mt-1">{children}</p>
    </aside>
  )
}

function Page({ title, description, path, children }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 min-w-0">
      <Seo title={title} description={description} path={path} />
      <h1 className="text-2xl sm:text-3xl font-bold text-graphite-900 break-words">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-graphite-700">{children}</div>
    </article>
  )
}

export function TerminosPage() {
  return (
    <Page
      title="Términos y condiciones"
      description="Condiciones de compra en la tienda Kobber: precios con IVA incluido, envíos y derecho de retracto."
      path="/tienda/terminos"
    >
      <Pending>
        Falta publicar la razón social, el NIT y el domicilio del comerciante. Esos datos no se inventan acá.
      </Pending>
      <p>
        Estos términos aplican a las compras hechas en la tienda en línea de Kobber. El precio que ves en cada
        producto es el precio final al consumidor e incluye IVA. En el checkout no se suma otro IVA. El envío,
        cuando aplica, se muestra aparte antes de confirmar.
      </p>
      <p>
        Al confirmar un pedido no se hace un cobro con tarjeta. El pago queda pendiente y se coordina por
        contra entrega o por transferencia. No hay una pasarela conectada todavía, así que nadie debe
        ingresar el número de la tarjeta en este sitio.
      </p>
      <p>
        El envío cuesta $15.000 si el subtotal es menor a $200.000 y es gratis desde ese monto. Esos valores
        los define el servidor y pueden cambiar; el total que vale es el que devuelve la confirmación del pedido.
      </p>
      <h2 className="text-base font-bold text-graphite-900 pt-2">Disponibilidad</h2>
      <p>
        Solo se puede pedir lo que tiene stock. Si un producto figura agotado, no se puede comprar. El stock
        que ves es el que está cargado: no se completa con unidades ficticias.
      </p>
      <h2 className="text-base font-bold text-graphite-900 pt-2">Ofertas</h2>
      <p>
        Un precio tachado solo aparece cuando hay un precio anterior real cargado en el catálogo. No usamos
        descuentos calculados al azar ni cuentas regresivas.
      </p>
      <h2 className="text-base font-bold text-graphite-900 pt-2">Derecho de retracto</h2>
      <p>
        En ventas a distancia la Ley 1480 de 2012 reconoce el derecho de retracto, por regla general dentro
        de los cinco días hábiles siguientes a la entrega, salvo las excepciones que la misma ley prevé.
        Para ejercerlo escribinos por WhatsApp al {WHATSAPP_DISPLAY} con el número de pedido.
      </p>
      <Pending>
        Falta definir quién asume el flete de una devolución y el plazo interno de reembolso. Hasta que el
        titular lo publique, se aplica lo que ordena la Ley 1480.
      </Pending>
      <p>
        También podés leer la <Link to="/tienda/privacidad" className="text-kobber-700 underline">política de privacidad</Link> y
        la página de <Link to="/tienda/contacto" className="text-kobber-700 underline">contacto</Link>.
      </p>
    </Page>
  )
}

export function PrivacidadPage() {
  return (
    <Page
      title="Política de privacidad"
      description="Tratamiento de datos personales de la tienda Kobber, conforme a la Ley 1581 de 2012."
      path="/tienda/privacidad"
    >
      <Pending>
        Falta el nombre del responsable del tratamiento, su NIT, domicilio y el correo de habeas data.
        Hasta entonces el canal para ejercer tus derechos es el WhatsApp publicado en la tienda.
      </Pending>
      <p>
        Esta política se rige por la Ley 1581 de 2012 y el Decreto 1377 de 2013. Al confirmar un pedido
        autorizás el tratamiento de los datos que escribís en el formulario, para las finalidades de abajo.
      </p>
      <h2 className="text-base font-bold text-graphite-900 pt-2">Qué datos recogemos</h2>
      <p>
        Nombre, correo, teléfono, dirección de envío, ciudad, departamento y, si pedís factura distinta,
        razón social y documento. También guardamos el detalle del pedido y el método de pago elegido
        (contra entrega o transferencia). No pedimos ni guardamos número de tarjeta, fecha de vencimiento ni CVV.
      </p>
      <h2 className="text-base font-bold text-graphite-900 pt-2">Para qué</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Armar, cobrar y entregar el pedido.</li>
        <li>Contactarte por teléfono o WhatsApp para coordinar el pago y la entrega.</li>
        <li>Atender un retracto, un cambio o una consulta sobre ese pedido.</li>
      </ul>
      <p>
        No vendemos estos datos. No los usamos para enviar publicidad. Hoy la tienda no manda un correo
        automático al confirmar la compra.
      </p>
      <h2 className="text-base font-bold text-graphite-900 pt-2">Tus derechos</h2>
      <p>
        Podés conocer, actualizar, rectificar y suprimir tus datos, y revocar la autorización, escribiendo
        por WhatsApp al {WHATSAPP_DISPLAY} con el número de pedido. También podés acudir a la
        Superintendencia de Industria y Comercio.
      </p>
      <p>
        El carrito se guarda en este navegador (localStorage) para que no se pierda al recargar. Eso se
        explica en la página de <Link to="/tienda/cookies" className="text-kobber-700 underline">cookies y almacenamiento</Link>.
      </p>
    </Page>
  )
}

export function CookiesPage() {
  return (
    <Page
      title="Cookies y almacenamiento local"
      description="Qué guarda el navegador cuando usás la tienda Kobber. No usamos cookies de publicidad."
      path="/tienda/cookies"
    >
      <p>
        La tienda no usa cookies de analítica ni de publicidad. Para funcionar guarda tres datos en tu navegador:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><span className="font-medium">kobber-cart</span> (localStorage): los productos del carrito.</li>
        <li><span className="font-medium">kobber_splash_shown</span> (sessionStorage): para no repetir la animación de entrada en la misma visita.</li>
        <li><span className="font-medium">kobber_admin_token</span> (sessionStorage): solo si alguien del equipo entra al panel desde este navegador. Se borra al cerrar la pestaña.</li>
      </ul>
      <p>
        Son datos necesarios para el pedido y el acceso interno. Podés borrarlos desde la configuración
        del navegador; si borrás el carrito, los productos que habías agregado desaparecen de esta sesión.
      </p>
    </Page>
  )
}

export function ContactoPage() {
  return (
    <Page
      title="Contacto"
      description="Escribinos por WhatsApp para pedidos, cambios y consultas de la tienda Kobber."
      path="/tienda/contacto"
    >
      <p>
        El canal que está activo es WhatsApp. No hay un formulario que prometa enviar un correo: nadie
        lo recibiría.
      </p>
      <p>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#128C7E] text-white font-semibold hover:opacity-90"
        >
          Escribir por WhatsApp · {WHATSAPP_DISPLAY}
        </a>
      </p>
      <Pending>
        Correo electrónico, dirección física, horario y redes sociales todavía no están confirmados.
        No los publicamos hasta tener el dato.
      </Pending>
      <p>
        Para mirar un pedido que ya confirmaste, usá <Link to="/tienda/pedido" className="text-kobber-700 underline">rastrear pedido</Link> con
        el número y el mismo correo del checkout.
      </p>
    </Page>
  )
}

export function NosotrosPage() {
  return (
    <Page
      title="Quiénes somos"
      description="Kobber es una ferretería con catálogo Truper, Pretul y otras marcas, a la venta en Colombia."
      path="/tienda/nosotros"
    >
      <p>
        Kobber vende herramientas y ferretería, con catálogo de marcas como Truper y Pretul, para clientes
        en Colombia. Los precios de esta tienda incluyen IVA.
      </p>
      <Pending>
        La razón social, el NIT y la sede se publican cuando el titular los confirme.
      </Pending>
      <p>
        ¿Buscás trabajo o querés escribirnos? Por ahora el único canal es la página de{' '}
        <Link to="/tienda/contacto" className="text-kobber-700 underline">contacto</Link>.
      </p>
    </Page>
  )
}

export function PedidoPage() {
  return <RastreoPedido />
}

function RastreoPedido() {
  const params = new URLSearchParams(window.location.search)
  const [numero, setNumero] = useState(params.get('numero') || '')
  const [email, setEmail] = useState('')
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const buscar = async (e) => {
    e.preventDefault()
    setError('')
    setPedido(null)
    setLoading(true)
    try {
      const qs = new URLSearchParams({ email: email.trim() })
      const res = await fetch(`/api/store/pedidos/${encodeURIComponent(numero.trim())}?${qs}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'No encontramos un pedido con esos datos.')
      setPedido(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page
      title="Rastrear pedido"
      description="Consultá el estado de un pedido de Kobber con el número y el correo que usaste al comprar."
      path="/tienda/pedido"
    >
      <p>Ingresá el número que te mostró la confirmación y el mismo correo del pedido.</p>
      <form onSubmit={buscar} className="grid sm:grid-cols-2 gap-3 max-w-xl">
        <div>
          <label htmlFor="pedido-numero" className="text-xs font-medium text-graphite-700 mb-1 block">Número de pedido</label>
          <input id="pedido-numero" required value={numero} onChange={e => setNumero(e.target.value)}
            className="w-full px-3 py-2.5 border border-graphite-200 rounded-lg text-sm" placeholder="KOB-…" />
        </div>
        <div>
          <label htmlFor="pedido-email" className="text-xs font-medium text-graphite-700 mb-1 block">Correo</label>
          <input id="pedido-email" required type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-graphite-200 rounded-lg text-sm" placeholder="tu@email.com" />
        </div>
        <button type="submit" disabled={loading}
          className="sm:col-span-2 py-2.5 bg-kobber-500 text-white font-semibold rounded-lg hover:bg-kobber-600 disabled:opacity-50">
          {loading ? 'Buscando…' : 'Consultar'}
        </button>
      </form>
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{error}</p>}
      {pedido && (
        <div className="border border-graphite-200 rounded-xl p-4 bg-white space-y-2">
          <p className="font-semibold text-graphite-900">{pedido.numero}</p>
          <p>Estado del pedido: {pedido.estado}. Pago: {pedido.pago_estado}.</p>
          <p>{pedido.instrucciones}</p>
          <ul className="space-y-1">
            {pedido.items?.map((item, i) => (
              <li key={i}>{item.cantidad} × {item.nombre} — {fmt(item.subtotal)}</li>
            ))}
          </ul>
          <p className="font-semibold">Total {fmt(pedido.totales?.total)} · IVA incluido {fmt(pedido.totales?.iva_incluido)}</p>
        </div>
      )}
    </Page>
  )
}
