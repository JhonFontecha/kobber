import { useState, useEffect, useCallback } from 'react'

const EMPTY = { productos: [], total: 0, page: 1, pages: 0, page_size: 24, categorias: [], marcas: [] }

export function useStoreProducts({
  q = '',
  categorias = [],
  marcas = [],
  minPrice = '',
  maxPrice = '',
  soloStock = false,
  enOferta = false,
  orden = 'nombre',
  page = 1,
  pageSize = 24,
} = {}) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const categoriasKey = categorias.join('|')
  const marcasKey = marcas.join('|')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('page_size', String(pageSize))
      params.set('orden', orden)
      if (q) params.set('q', q)
      categoriasKey.split('|').filter(Boolean).forEach(c => params.append('categoria', c))
      marcasKey.split('|').filter(Boolean).forEach(m => params.append('marca', m))
      if (minPrice !== '' && minPrice != null) params.set('min_price', String(minPrice))
      if (maxPrice !== '' && maxPrice != null) params.set('max_price', String(maxPrice))
      if (soloStock) params.set('solo_stock', 'true')
      if (enOferta) params.set('en_oferta', 'true')

      const res = await window.fetch(`/api/store/productos?${params}`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e.message)
      setData(EMPTY)
    } finally {
      setLoading(false)
    }
  }, [q, categoriasKey, marcasKey, minPrice, maxPrice, soloStock, enOferta, orden, page, pageSize])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return { ...data, loading, error, refetch: fetchProducts }
}

export async function fetchProductoDetalle(id) {
  const res = await window.fetch(`/api/store/productos/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error('Producto no encontrado')
  return res.json()
}
