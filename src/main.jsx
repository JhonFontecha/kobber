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
        {/* Tienda pública */}
        <Route path="/tienda/*" element={<StorePage />} />
        {/* Herramienta interna Kobber */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
