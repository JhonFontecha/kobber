import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CreditCard, Smartphone, Building2, Banknote, ShoppingCart, Check, Lock } from 'lucide-react'
import useCartStore, { selectTotal } from '../store/cartStore'

const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const PAGOS = [
  { id: 'tarjeta',  label: 'Tarjeta de crédito / débito', Icon: CreditCard,  desc: 'Visa, Mastercard, Amex' },
  { id: 'pse',      label: 'PSE',                          Icon: Building2,   desc: 'Débito desde tu banco' },
  { id: 'nequi',    label: 'Nequi / Daviplata',            Icon: Smartphone,  desc: 'Pago desde la app' },
  { id: 'contra',   label: 'Pago contra entrega',          Icon: Banknote,    desc: 'Efectivo al recibir' },
]

const DEPARTAMENTOS = [
  'Bogotá D.C.', 'Antioquia', 'Valle del Cauca', 'Cundinamarca', 'Atlántico',
  'Santander', 'Bolívar', 'Norte de Santander', 'Tolima', 'Risaralda', 'Otro',
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items    = useCartStore(s => s.items)
  const clear    = useCartStore(s => s.clearCart)
  const subtotal = useCartStore(selectTotal)

  const iva        = Math.round(subtotal * 0.19)
  const envio      = subtotal > 200000 ? 0 : 15000
  const totalFinal = subtotal + iva + envio

  const [envio_, setEnvio]       = useState({ nombre: '', email: '', telefono: '', direccion: '', ciudad: '', depto: 'Bogotá D.C.', cp: '', notas: '' })
  const [factura, setFactura]    = useState({ mismo: true, razon_social: '', nit: '', direccion: '', ciudad: '' })
  const [pago, setPago]          = useState('tarjeta')
  const [tarjeta, setTarjeta]    = useState({ numero: '', titular: '', vence: '', cvv: '' })
  const [aceptaTerm, setAcepta]  = useState(false)
  const [enviando, setEnviando]  = useState(false)
  const [exito, setExito]        = useState(false)

  if (items.length === 0 && !exito) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={48} strokeWidth={1} className="mx-auto text-graphite-300 mb-4" />
        <h1 className="text-xl font-bold text-graphite-900">Tu carrito está vacío</h1>
        <p className="text-sm text-graphite-400 mt-2">Agrega productos antes de proceder al pago</p>
        <Link to="/tienda/catalogo"
          className="inline-block mt-6 px-6 py-2.5 bg-kobber-500 text-white text-sm font-semibold rounded-md hover:bg-kobber-600 transition-colors">
          Ver catálogo
        </Link>
      </div>
    )
  }

  if (exito) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-5">
          <Check size={32} className="text-green-600" strokeWidth={3} />
        </div>
        <h1 className="text-2xl font-bold text-graphite-900">¡Pedido confirmado!</h1>
        <p className="text-graphite-500 mt-3">
          Te enviamos un correo a <span className="font-medium text-graphite-700">{envio_.email}</span> con los detalles.
        </p>
        <p className="text-sm text-graphite-400 mt-1">Tiempo estimado de entrega: 3-5 días hábiles</p>
        <Link to="/tienda"
          className="inline-block mt-8 px-6 py-2.5 bg-kobber-500 text-white text-sm font-semibold rounded-md hover:bg-kobber-600 transition-colors">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setEnviando(true)
    setTimeout(() => {
      clear()
      setExito(true)
      setEnviando(false)
    }, 1200)
  }

  const inp = "w-full px-3 py-2.5 border border-graphite-200 rounded-lg text-sm bg-white focus:outline-none focus:border-kobber-500 transition-colors"
  const lbl = "text-xs font-medium text-graphite-600 mb-1 block"
  const section = "card p-5 sm:p-6"
  const h2     = "text-base font-bold text-graphite-900 mb-4 flex items-center gap-2"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-graphite-500 hover:text-graphite-900 mb-5 transition-colors">
        <ArrowLeft size={15} /> Volver
      </button>

      <h1 className="text-2xl font-bold text-graphite-900 mb-6">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-6">

        {/* IZQUIERDA: secciones */}
        <div className="space-y-5">

          {/* Envío */}
          <section className={section}>
            <h2 className={h2}>
              <span className="w-6 h-6 rounded-full bg-kobber-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              Información de envío
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={lbl}>Nombre completo *</label>
                <input required value={envio_.nombre} onChange={e => setEnvio(s => ({ ...s, nombre: e.target.value }))} className={inp} placeholder="Juan Pérez García" />
              </div>
              <div>
                <label className={lbl}>Correo electrónico *</label>
                <input required type="email" value={envio_.email} onChange={e => setEnvio(s => ({ ...s, email: e.target.value }))} className={inp} placeholder="tu@email.com" />
              </div>
              <div>
                <label className={lbl}>Teléfono *</label>
                <input required type="tel" value={envio_.telefono} onChange={e => setEnvio(s => ({ ...s, telefono: e.target.value }))} className={inp} placeholder="+57 300 123 4567" />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Dirección *</label>
                <input required value={envio_.direccion} onChange={e => setEnvio(s => ({ ...s, direccion: e.target.value }))} className={inp} placeholder="Cra 7 # 32-16 apto 502" />
              </div>
              <div>
                <label className={lbl}>Ciudad *</label>
                <input required value={envio_.ciudad} onChange={e => setEnvio(s => ({ ...s, ciudad: e.target.value }))} className={inp} placeholder="Bogotá" />
              </div>
              <div>
                <label className={lbl}>Departamento *</label>
                <select value={envio_.depto} onChange={e => setEnvio(s => ({ ...s, depto: e.target.value }))} className={inp}>
                  {DEPARTAMENTOS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Código postal</label>
                <input value={envio_.cp} onChange={e => setEnvio(s => ({ ...s, cp: e.target.value }))} className={inp} placeholder="110111" />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Notas para el repartidor</label>
                <textarea value={envio_.notas} onChange={e => setEnvio(s => ({ ...s, notas: e.target.value }))} rows={2} className={inp} placeholder="Conjunto residencial Las Flores, portería principal..." />
              </div>
            </div>
          </section>

          {/* Facturación */}
          <section className={section}>
            <h2 className={h2}>
              <span className="w-6 h-6 rounded-full bg-kobber-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              Datos de facturación
            </h2>
            <label className="flex items-center gap-2.5 cursor-pointer mb-4">
              <input type="checkbox" checked={factura.mismo} onChange={e => setFactura(s => ({ ...s, mismo: e.target.checked }))} className="w-4 h-4 accent-[#C8762C]" />
              <span className="text-sm text-graphite-700">Usar los mismos datos del envío</span>
            </label>
            {!factura.mismo && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={lbl}>Razón social / Nombre *</label>
                  <input required={!factura.mismo} value={factura.razon_social} onChange={e => setFactura(s => ({ ...s, razon_social: e.target.value }))} className={inp} placeholder="Empresa S.A.S. o nombre completo" />
                </div>
                <div>
                  <label className={lbl}>NIT / Cédula *</label>
                  <input required={!factura.mismo} value={factura.nit} onChange={e => setFactura(s => ({ ...s, nit: e.target.value }))} className={inp} placeholder="900123456-7" />
                </div>
                <div>
                  <label className={lbl}>Ciudad *</label>
                  <input required={!factura.mismo} value={factura.ciudad} onChange={e => setFactura(s => ({ ...s, ciudad: e.target.value }))} className={inp} placeholder="Bogotá" />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Dirección fiscal *</label>
                  <input required={!factura.mismo} value={factura.direccion} onChange={e => setFactura(s => ({ ...s, direccion: e.target.value }))} className={inp} />
                </div>
              </div>
            )}
          </section>

          {/* Pago */}
          <section className={section}>
            <h2 className={h2}>
              <span className="w-6 h-6 rounded-full bg-kobber-500 text-white text-xs flex items-center justify-center font-bold">3</span>
              Método de pago
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5 mb-5">
              {PAGOS.map(({ id, label, Icon, desc }) => (
                <label key={id}
                  className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors
                    ${pago === id ? 'border-kobber-500 bg-kobber-50/40' : 'border-graphite-200 hover:border-graphite-300'}`}>
                  <input type="radio" name="pago" value={id} checked={pago === id} onChange={e => setPago(e.target.value)}
                    className="mt-0.5 accent-[#C8762C]" />
                  <div className="flex items-start gap-2.5 flex-1">
                    <Icon size={20} className={pago === id ? 'text-kobber-600' : 'text-graphite-500'} />
                    <div>
                      <p className="text-sm font-semibold text-graphite-900">{label}</p>
                      <p className="text-xs text-graphite-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {pago === 'tarjeta' && (
              <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-graphite-200">
                <div className="sm:col-span-2">
                  <label className={lbl}>Número de tarjeta *</label>
                  <input required value={tarjeta.numero} onChange={e => setTarjeta(s => ({ ...s, numero: e.target.value }))} className={inp} placeholder="1234 5678 9012 3456" maxLength={19} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Titular *</label>
                  <input required value={tarjeta.titular} onChange={e => setTarjeta(s => ({ ...s, titular: e.target.value }))} className={inp} placeholder="Nombre como aparece en la tarjeta" />
                </div>
                <div>
                  <label className={lbl}>Vencimiento *</label>
                  <input required value={tarjeta.vence} onChange={e => setTarjeta(s => ({ ...s, vence: e.target.value }))} className={inp} placeholder="MM/AA" maxLength={5} />
                </div>
                <div>
                  <label className={lbl}>CVV *</label>
                  <input required value={tarjeta.cvv} onChange={e => setTarjeta(s => ({ ...s, cvv: e.target.value }))} className={inp} placeholder="123" maxLength={4} />
                </div>
              </div>
            )}

            {pago === 'pse' && (
              <p className="text-sm text-graphite-500 pt-4 border-t border-graphite-200">
                Serás redirigido a la pasarela PSE para completar el pago desde tu banco.
              </p>
            )}
            {pago === 'nequi' && (
              <p className="text-sm text-graphite-500 pt-4 border-t border-graphite-200">
                Recibirás una notificación en tu app Nequi o Daviplata para autorizar el pago.
              </p>
            )}
            {pago === 'contra' && (
              <p className="text-sm text-graphite-500 pt-4 border-t border-graphite-200">
                Paga en efectivo al momento de recibir tu pedido. Disponible solo en algunas ciudades.
              </p>
            )}
          </section>
        </div>

        {/* DERECHA: resumen */}
        <aside>
          <div className="card p-5 sticky top-20 space-y-4">
            <h2 className="font-bold text-graphite-900">Resumen del pedido</h2>

            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex gap-2.5">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-graphite-50 shrink-0 flex items-center justify-center relative">
                    {producto.imagen
                      ? <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-contain p-1" />
                      : <ShoppingCart size={16} className="text-graphite-300" />
                    }
                    <span className="absolute -top-1 -right-1 bg-graphite-900 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cantidad}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-graphite-700 line-clamp-2 leading-snug">{producto.nombre}</p>
                    <p className="text-xs font-semibold text-graphite-900 mt-0.5">{fmt(producto.precio * cantidad)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 text-sm pt-3 border-t border-graphite-200">
              <div className="flex justify-between text-graphite-500">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-graphite-500">
                <span>IVA (19%)</span><span>{fmt(iva)}</span>
              </div>
              <div className="flex justify-between text-graphite-500">
                <span>Envío</span>
                <span>{envio === 0 ? <span className="text-green-600 font-medium">Gratis</span> : fmt(envio)}</span>
              </div>
              {envio > 0 && (
                <p className="text-[11px] text-graphite-400 italic">Envío gratis en compras sobre {fmt(200000)}</p>
              )}
              <div className="flex justify-between font-bold text-graphite-900 text-base pt-2 border-t border-graphite-200">
                <span>Total</span>
                <span className="text-kobber-700">{fmt(totalFinal)}</span>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input required type="checkbox" checked={aceptaTerm} onChange={e => setAcepta(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#C8762C]" />
              <span className="text-xs text-graphite-600 leading-snug">
                Acepto los <a href="#" className="text-kobber-700 hover:underline">términos y condiciones</a> y la política de privacidad
              </span>
            </label>

            <button type="submit" disabled={enviando || !aceptaTerm}
              className="w-full flex items-center justify-center gap-2 py-3 bg-kobber-500 text-white font-semibold rounded-lg
                         hover:bg-kobber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {enviando ? 'Procesando…' : <><Lock size={15} /> Confirmar pago — {fmt(totalFinal)}</>}
            </button>

            <p className="text-center text-[11px] text-graphite-400">
              Tus datos están protegidos con encriptación SSL
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}
