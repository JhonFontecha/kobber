import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import StorePage from './tienda/StorePage'
import { applyRoundedFavicon } from './utils/roundedFavicon'
import './index.css'

applyRoundedFavicon()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Panel de administrador */}
        <Route path="/admin/*" element={<App />} />
        {/* Tienda pública */}
        <Route path="/tienda/*" element={<StorePage />} />
        {/* Redirige raíz a tienda */}
        <Route path="/*" element={<StorePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
