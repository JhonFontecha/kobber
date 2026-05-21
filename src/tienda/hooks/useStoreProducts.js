import { useState, useEffect, useCallback } from 'react'

const BASE = '/api/store/productos'

export function useStoreProducts({ q = '', categoria = '', marca = '', minPrice = '', maxPrice = '', soloStock = false, margen = 30 } = {}) {
  const [data,    setData]    = useState({ productos: [], total: 0, categorias: [], marcas: [] })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ margen })
      if (q)         params.set('q', q)
      if (categoria) params.set('categoria', categoria)
      if (marca)     params.set('marca', marca)
      if (minPrice)  params.set('min_price', minPrice)
      if (maxPrice)  params.set('max_price', maxPrice)
      if (soloStock) params.set('solo_stock', 'true')

      const res = await window.fetch(`${BASE}?${params}`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [q, categoria, marca, minPrice, maxPrice, soloStock, margen])

  useEffect(() => { fetch() }, [fetch])

  return { ...data, loading, error, refetch: fetch }
}

export async function fetchProductoDetalle(id, margen = 30) {
  const res = await window.fetch(`/api/store/productos/${id}?margen=${margen}`)
  if (!res.ok) throw new Error('Producto no encontrado')
  return res.json()
}
