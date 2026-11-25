import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Wrench } from 'lucide-react'
import { setAdminToken } from '../../auth'
import Seo from '../components/Seo'

const PUBLIC_ONLY = import.meta.env.VITE_PUBLIC_ONLY === 'true'

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setEnviando(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const detail = data.detail
        throw new Error(typeof detail === 'string' ? detail : 'No se pudo iniciar sesión.')
      }
      if (PUBLIC_ONLY) {
        setInfo('Credenciales válidas. El panel de administración no está publicado en esta tienda; se abre en el equipo interno.')
        return
      }
      setAdminToken(data.token)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-graphite-50 px-4 py-12">
      <Seo
        title="Acceso al panel"
        description="Ingreso del equipo de Kobber. La contraseña se verifica en el servidor."
        path="/tienda/login"
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-accent rounded-xl items-center justify-center mb-3">
            <Wrench size={22} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-graphite-900">Acceso al panel</h1>
          <p className="text-sm text-graphite-600 mt-1">
            Cuenta de administrador. Para comprar no hace falta registrarse.
          </p>
        </div>

        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-xs font-medium text-graphite-700 mb-1 block">Correo electrónico</label>
              <input id="login-email" type="email" required autoComplete="username" placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 border border-graphite-200 rounded-lg text-sm
                           focus:outline-none focus:border-accent bg-white transition-colors" />
            </div>

            <div>
              <label htmlFor="login-password" className="text-xs font-medium text-graphite-700 mb-1 block">Contraseña</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2.5 pr-10 border border-graphite-200 rounded-lg text-sm
                             focus:outline-none focus:border-accent bg-white transition-colors"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-500 hover:text-graphite-800">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            )}
            {info && (
              <p className="text-xs text-graphite-800 bg-graphite-50 border border-graphite-200 rounded-lg px-3 py-2" role="status">
                {info}
              </p>
            )}

            <button type="submit" disabled={enviando}
              className="w-full py-3 bg-accent text-white font-semibold rounded-lg
                         hover:bg-accent-dark transition-colors text-sm mt-2 disabled:opacity-50">
              {enviando ? 'Verificando…' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-sm text-graphite-600 mt-5">
            <Link to="/tienda" className="text-accent font-medium hover:underline">Volver a la tienda</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
