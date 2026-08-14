import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StorePage from './tienda/StorePage'
import { applyRoundedFavicon } from './utils/roundedFavicon'
import './index.css'

applyRoundedFavicon()

// En builds públicos (VITE_PUBLIC_ONLY=true, seteado en el deploy del servidor) la ruta /admin
// ni se registra — import() dinámico para que Vite excluya App.jsx (Publicador) del bundle que
// bajan los visitantes de la tienda. En local, sin esa env var, todo funciona como siempre.
const PUBLIC_ONLY = import.meta.env.VITE_PUBLIC_ONLY === 'true'
const App = PUBLIC_ONLY ? null : lazy(() => import('./App'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Panel de administrador — no existe en el build público */}
        {!PUBLIC_ONLY && (
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={null}>
                <App />
              </Suspense>
            }
          />
        )}
        {/* Tienda pública */}
        <Route path="/tienda/*" element={<StorePage />} />
        {/* Redirige raíz a tienda */}
        <Route path="/*" element={<StorePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
