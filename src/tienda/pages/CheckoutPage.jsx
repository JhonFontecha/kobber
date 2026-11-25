import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Building2, Banknote, ShoppingCart, Check, Lock } from 'lucide-react'
import useCartStore, { selectTotal } from '../store/cartStore'
import { fmt, ivaIncluido, envioDe } from '../lib/format'
import ProductImage from '../components/ProductImage'
import Seo from '../components/Seo'

const METODOS_FALLBACK = [
  {
    id: 'contra_entrega',
    label: 'Pago contra entrega',
    descripcion: 'Pagás en efectivo al recibir el pedido. Coordinamos la entrega por teléfono. No hay cobro en línea.',
  },
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    descripcion: 'El pedido queda pendiente de pago. Te contactamos para enviarte los datos de la transferencia.',
  },
]

const ICONOS = { contra_entrega: Banknote, transferencia: Building2 }

const DEPARTAMENTOS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas',
  'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
  'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
  'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
]

const inputClass = 'w-full px-3 py-2.5 border border-graphite-200 rounded-lg text-sm bg-white focus:outline-none focus:border-kobber-500 transition-colors'
const labelClass = 'text-xs font-medium text-graphite-700 mb-1 block'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore(s => s.items)
  const clear = useCartStore(s => s.clearCart)
  const setOpen = useCartStore(s => s.setOpen)
  const subtotal = useCartStore(selectTotal)

  useEffect(() => { setOpen(false) }, [setOpen])

  const [reglas, setReglas] = useState(null)
  const [metodos, setMetodos] = useState(METODOS_FALLBACK)
  const [envio_, setEnvio] = useState({ nombre: '', email: '', telefono: '', direccion: '', ciudad: '', depto: 'Bogotá D.C.', cp: '', notas: '' })
  const [factura, setFactura] = useState({ mismo: true, razon_social: '', nit: '', direccion: '', ciudad: '' })
  const [pago, setPago] = useState('contra_entrega')
  const [aceptaTerm, setAcepta] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [pedido, setPedido] = useState(null)

  useEffect(() => {
    fetch('/api/store/pagos')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        if (data.metodos?.length) setMetodos(data.metodos)
        if (data.envio) setReglas(data.envio)
      })
      .catch(() => {})
  }, [])

  const iva = ivaIncluido(subtotal)
  const envio = envioDe(subtotal, reglas)
  const totalFinal = subtotal + envio
  const sinVariante = items.some(i => !i.producto.variantId)

  if (items.length === 0 && !pedido) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Seo title="Finalizar compra" description="Checkout de la tienda Kobber." path="/tienda/checkout" />
        <ShoppingCart size={48} strokeWidth={1} className="mx-auto text-graphite-500 mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-graphite-900">Tu carrito está vacío</h1>
        <p className="text-sm text-graphite-600 mt-2">Agregá productos antes de hacer el pedido</p>
        <Link to="/tienda/catalogo"
          className="inline-block mt-6 px-6 py-2.5 bg-kobber-500 text-white text-sm font-semibold rounded-md hover:bg-kobber-600 transition-colors">
          Ver catálogo
        </Link>
      </div>
    )
  }

  if (pedido) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Seo title="Pedido recibido" description="Tu pedido quedó registrado. Guardá el número: no enviamos correo automático." path="/tienda/checkout" />
        <div className="inline-flex w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-5">
          <Check size={32} className="text-green-700" strokeWidth={3} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-graphite-900">Pedido recibido</h1>
        <p className="text-3xl font-bold text-kobber-700 mt-3 tracking-wide">{pedido.numero}</p>
        <p className="text-graphite-700 mt-4 text-sm leading-relaxed">{pedido.mensaje}</p>
        <p className="text-sm text-graphite-700 mt-3">{pedido.instrucciones}</p>
        <dl className="mt-6 text-sm text-left max-w-sm mx-auto space-y-1.5">
          <div className="flex justify-between"><dt>Subtotal (IVA incluido)</dt><dd>{fmt(pedido.totales.subtotal)}</dd></div>
          <div className="flex justify-between text-graphite-600"><dt>IVA incluido</dt><dd>{fmt(pedido.totales.iva_incluido)}</dd></div>
          <div className="flex justify-between"><dt>Envío</dt><dd>{pedido.totales.envio === 0 ? 'Gratis' : fmt(pedido.totales.envio)}</dd></div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-graphite-200">
            <dt>Total</dt><dd>{fmt(pedido.totales.total)}</dd>
          </div>
        </dl>
        <p className="text-xs text-graphite-600 mt-4">Pago: {pedido.pago_estado}. No se hizo un cobro en línea.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={`/tienda/pedido?numero=${encodeURIComponent(pedido.numero)}`}
            className="px-5 py-2.5 border border-graphite-300 text-sm font-semibold rounded-md text-graphite-800 hover:border-kobber-500">
            Consultar este pedido
          </Link>
          <Link to="/tienda"
            className="px-5 py-2.5 bg-kobber-500 text-white text-sm font-semibold rounded-md hover:bg-kobber-600">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (sinVariante) {
      setError('Hay productos viejos en el carrito. Quitálos y volvé a agregarlos desde el catálogo.')
      return
    }
    setEnviando(true)
    try {
      const res = await fetch('/api/store/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ producto, cantidad }) => ({
            variant_id: producto.variantId,
            cantidad,
          })),
          metodo_pago: pago,
          cliente: {
            nombre: envio_.nombre,
            email: envio_.email,
            telefono: envio_.telefono,
          },
          envio: {
            direccion: envio_.direccion,
            ciudad: envio_.ciudad,
            departamento: envio_.depto,
            codigo_postal: envio_.cp || null,
            notas: envio_.notas || null,
          },
          factura: {
            mismo_envio: factura.mismo,
            razon_social: factura.mismo ? null : factura.razon_social,
            documento: factura.mismo ? null : factura.nit,
            direccion: factura.mismo ? null : factura.direccion,
            ciudad: factura.mismo ? null : factura.ciudad,
          },
          acepta_terminos: aceptaTerm,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const detail = data.detail
        throw new Error(typeof detail === 'string' ? detail : 'No se pudo registrar el pedido.')
      }
      clear()
      setPedido(data)
    } catch (err) {
      setError(err.message || 'No se pudo registrar el pedido.')
    } finally {
      setEnviando(false)
    }
  }

  const section = 'card p-5 sm:p-6'
  const h2 = 'text-base font-bold text-graphite-900 mb-4 flex items-center gap-2'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-w-0">
      <Seo
        title="Finalizar compra"
        description="Confirmá tu pedido en Kobber. El precio incluye IVA. El pago queda pendiente: contra entrega o transferencia."
        path="/tienda/checkout"
      />
      <button type="button" onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-graphite-600 hover:text-graphite-900 mb-5 transition-colors">
        <ArrowLeft size={15} aria-hidden="true" /> Volver
      </button>

      <h1 className="text-2xl font-bold text-graphite-900 mb-2">Finalizar compra</h1>
      <p className="text-sm text-graphite-600 mb-6">
        El total lo calcula el servidor. El pago no se cobra acá: queda pendiente de coordinar.
      </p>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-6">
        <div className="space-y-5 min-w-0">
          <section className={section}>
            <h2 className={h2}>
              <span className="w-6 h-6 rounded-full bg-kobber-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              Información de envío
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="env-nombre" className={labelClass}>Nombre completo</label>
                <input id="env-nombre" required autoComplete="name" value={envio_.nombre} onChange={e => setEnvio(s => ({ ...s, nombre: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="env-email" className={labelClass}>Correo electrónico</label>
                <input id="env-email" required type="email" autoComplete="email" value={envio_.email} onChange={e => setEnvio(s => ({ ...s, email: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="env-tel" className={labelClass}>Teléfono</label>
                <input id="env-tel" required type="tel" autoComplete="tel" value={envio_.telefono} onChange={e => setEnvio(s => ({ ...s, telefono: e.target.value }))} className={inputClass} placeholder="300 000 0000" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="env-dir" className={labelClass}>Dirección</label>
                <input id="env-dir" required autoComplete="street-address" value={envio_.direccion} onChange={e => setEnvio(s => ({ ...s, direccion: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="env-ciudad" className={labelClass}>Ciudad</label>
                <input id="env-ciudad" required autoComplete="address-level2" value={envio_.ciudad} onChange={e => setEnvio(s => ({ ...s, ciudad: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="env-depto" className={labelClass}>Departamento</label>
                <select id="env-depto" value={envio_.depto} onChange={e => setEnvio(s => ({ ...s, depto: e.target.value }))} className={inputClass}>
                  {DEPARTAMENTOS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="env-cp" className={labelClass}>Código postal <span className="font-normal text-graphite-500">(opcional)</span></label>
                <input id="env-cp" autoComplete="postal-code" value={envio_.cp} onChange={e => setEnvio(s => ({ ...s, cp: e.target.value }))} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="env-notas" className={labelClass}>Notas para la entrega <span className="font-normal text-graphite-500">(opcional)</span></label>
                <textarea id="env-notas" value={envio_.notas} onChange={e => setEnvio(s => ({ ...s, notas: e.target.value }))} rows={2} className={inputClass} />
              </div>
            </div>
          </section>

          <section className={section}>
            <h2 className={h2}>
              <span className="w-6 h-6 rounded-full bg-kobber-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              Datos de facturación
            </h2>
            <label className="flex items-center gap-2.5 cursor-pointer mb-4">
              <input type="checkbox" checked={factura.mismo} onChange={e => setFactura(s => ({ ...s, mismo: e.target.checked }))} className="w-4 h-4 accent-[#C2622E]" />
              <span className="text-sm text-graphite-700">Usar los mismos datos del envío</span>
            </label>
            {!factura.mismo && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="fac-razon" className={labelClass}>Razón social o nombre</label>
                  <input id="fac-razon" required={!factura.mismo} value={factura.razon_social} onChange={e => setFactura(s => ({ ...s, razon_social: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="fac-doc" className={labelClass}>NIT o cédula</label>
                  <input id="fac-doc" required={!factura.mismo} value={factura.nit} onChange={e => setFactura(s => ({ ...s, nit: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="fac-ciudad" className={labelClass}>Ciudad</label>
                  <input id="fac-ciudad" required={!factura.mismo} value={factura.ciudad} onChange={e => setFactura(s => ({ ...s, ciudad: e.target.value }))} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="fac-dir" className={labelClass}>Dirección fiscal</label>
                  <input id="fac-dir" required={!factura.mismo} value={factura.direccion} onChange={e => setFactura(s => ({ ...s, direccion: e.target.value }))} className={inputClass} />
                </div>
              </div>
            )}
          </section>

          <section className={section}>
            <h2 className={h2}>
              <span className="w-6 h-6 rounded-full bg-kobber-500 text-white text-xs flex items-center justify-center font-bold">3</span>
              Método de pago
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {metodos.map((metodo) => {
                const Icon = ICONOS[metodo.id] || Banknote
                return (
                  <label key={metodo.id}
                    className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors
                      ${pago === metodo.id ? 'border-kobber-500 bg-kobber-50/40' : 'border-graphite-200 hover:border-graphite-300'}`}>
                    <input type="radio" name="pago" value={metodo.id} checked={pago === metodo.id} onChange={() => setPago(metodo.id)}
                      className="mt-0.5 accent-[#C2622E]" />
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <Icon size={20} aria-hidden="true" className={pago === metodo.id ? 'text-kobber-700' : 'text-graphite-600'} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-graphite-900">{metodo.label}</p>
                        <p className="text-xs text-graphite-600 mt-0.5">{metodo.descripcion}</p>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="min-w-0">
          <div className="card p-5 lg:sticky lg:top-20 space-y-4">
            <h2 className="font-bold text-graphite-900">Resumen del pedido</h2>
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex gap-2.5">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-graphite-50 shrink-0">
                    <ProductImage src={producto.imagen} alt="" width={96} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-graphite-800 line-clamp-2 leading-snug">{producto.nombre}</p>
                    <p className="text-xs font-semibold text-graphite-900 mt-0.5">{fmt(producto.precio * cantidad)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 text-sm pt-3 border-t border-graphite-200">
              <div className="flex justify-between text-graphite-700">
                <span>Subtotal (IVA incluido)</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-graphite-600">
                <span>IVA incluido (19%)</span><span>{fmt(iva)}</span>
              </div>
              <div className="flex justify-between text-graphite-700">
                <span>Envío</span>
                <span>{envio === 0 ? <span className="text-green-700 font-medium">Gratis</span> : fmt(envio)}</span>
              </div>
              {envio > 0 && (
                <p className="text-[11px] text-graphite-600">Envío gratis desde {fmt(reglas?.gratis_desde ?? 200000)}</p>
              )}
              <div className="flex justify-between font-bold text-graphite-900 text-base pt-2 border-t border-graphite-200">
                <span>Total estimado</span>
                <span className="text-kobber-700">{fmt(totalFinal)}</span>
              </div>
            </div>

            {sinVariante && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                Hay productos agregados con una versión anterior de la tienda. Quitálos del carrito y volvé a agregarlos.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{error}</p>
            )}

            <label className="flex items-start gap-2 cursor-pointer">
              <input required type="checkbox" checked={aceptaTerm} onChange={e => setAcepta(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#C2622E]" />
              <span className="text-xs text-graphite-700 leading-snug">
                Acepto los <Link to="/tienda/terminos" target="_blank" rel="noopener noreferrer" className="text-kobber-700 hover:underline">términos y condiciones</Link> y
                la <Link to="/tienda/privacidad" target="_blank" rel="noopener noreferrer" className="text-kobber-700 hover:underline">política de privacidad</Link>
              </span>
            </label>

            <button type="submit" disabled={enviando || !aceptaTerm || sinVariante}
              className="w-full flex items-center justify-center gap-2 py-3 bg-kobber-500 text-white font-semibold rounded-lg
                         hover:bg-kobber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {enviando ? 'Guardando pedido…' : <><Lock size={15} aria-hidden="true" /> Confirmar pedido — {fmt(totalFinal)}</>}
            </button>
            <p className="text-center text-[11px] text-graphite-600">
              La conexión va cifrada (HTTPS). No pedimos datos de tarjeta.
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}
