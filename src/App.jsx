import { useState, useEffect, useRef } from 'react'
import logo from './assets/logo.png'

// ── helpers ──────────────────────────────────────────────────────────────────

async function parseError(r) {
  try {
    const data = await r.json()
    return data.detail || r.statusText
  } catch {
    return r.status === 0 || r.status >= 500
      ? 'No se pudo conectar con el backend. ¿Está corriendo en el puerto 8000?'
      : r.statusText || `Error ${r.status}`
  }
}

const api = {
  async get(path) {
    const r = await fetch(path)
    if (!r.ok) throw new Error(await parseError(r))
    return r.json()
  },
  async post(path, body) {
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error(await parseError(r))
    return r.json()
  },
  async postForm(path, formData) {
    const r = await fetch(path, { method: 'POST', body: formData })
    if (!r.ok) throw new Error(await parseError(r))
    return r.json()
  },
  async patch(path, body) {
    const r = await fetch(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error(await parseError(r))
    return r.json()
  },
  async delete(path) {
    const r = await fetch(path, { method: 'DELETE' })
    if (!r.ok) throw new Error(await parseError(r))
    return r.json()
  },
}

// ── shared UI ─────────────────────────────────────────────────────────────────

function Btn({ children, onClick, disabled, variant = 'primary', style = {} }) {
  const base = {
    padding: '9px 18px', borderRadius: 'var(--radius-md)', border: 'none',
    fontSize: '13px', fontWeight: '500', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s', ...style,
  }
  const variants = {
    primary: { background: 'var(--accent)', color: '#131211' },
    secondary: { background: 'var(--surface)', color: 'var(--text-primary)', border: '0.5px solid var(--border-strong)' },
    danger: { background: '#5c2020', color: '#f9f9f8' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '0.5px solid var(--border)' },
  }
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function Badge({ text, color = 'var(--text-tertiary)' }) {
  return (
    <span style={{
      fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
      background: 'var(--surface)', border: '0.5px solid var(--border)',
      color, fontWeight: '500',
    }}>
      {text}
    </span>
  )
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  const isError = msg.type === 'error'
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: isError ? '#3d1515' : 'var(--surface)',
      border: `0.5px solid ${isError ? '#7a3030' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)', padding: '12px 16px',
      fontSize: '13px', color: 'var(--text-primary)', maxWidth: 360,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      {msg.text}
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function Tabs({ active, onChange, stats }) {
  const tabs = [
    { id: 'productos', label: 'Productos', count: stats?.total },
    { id: 'importar',  label: 'Importar PDF' },
    { id: 'exportar',  label: 'Exportar Excel' },
  ]
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '7px 14px', borderRadius: 'var(--radius-md)', border: 'none',
            fontSize: '12px', fontWeight: '500', cursor: 'pointer',
            background: active === t.id ? 'var(--accent)' : 'var(--surface)',
            color: active === t.id ? '#131211' : 'var(--text-secondary)',
            border: active === t.id ? 'none' : '0.5px solid var(--border)',
          }}
        >
          {t.label}
          {t.count != null && (
            <span style={{ marginLeft: 6, opacity: 0.7 }}>({t.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Import PDF tab ─────────────────────────────────────────────────────────────

function ImportTab({ onImported, onToast }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const inputRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setResult(null) }
  }

  const handleExtract = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const data = await api.postForm('/api/catalog/extract', fd)
      setResult(data)
      if (data.errores?.length) {
        onToast({ type: 'error', text: `${data.errores.length} página(s) con errores de extracción.` })
      }
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAll = async () => {
    if (!result?.productos?.length) return
    setSaving(true)
    try {
      const data = await api.post('/api/products/bulk', { productos: result.productos })
      onToast({ type: 'ok', text: `${data.guardados} productos guardados.` })
      onImported()
      setResult(null)
      setFile(null)
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const updateProduct = (idx, field, value) => {
    setResult(prev => {
      const productos = [...prev.productos]
      productos[idx] = { ...productos[idx], [field]: value }
      return { ...prev, productos }
    })
  }

  const removeProduct = (idx) => {
    setResult(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== idx),
      total_productos: prev.total_productos - 1,
    }))
  }

  return (
    <div>
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 16,
      }}>
        <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: 4 }}>Subir catálogo PDF</p>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 14 }}>
          Máximo 30 páginas por vez. Claude analizará cada página y extraerá todos los productos.
        </p>

        <input ref={inputRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn variant="secondary" onClick={() => inputRef.current?.click()}>
            Seleccionar PDF
          </Btn>
          {file && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          )}
          <Btn onClick={handleExtract} disabled={!file || loading}>
            {loading ? 'Extrayendo...' : 'Extraer productos'}
          </Btn>
        </div>

        {loading && (
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: 12 }}>
            Claude está analizando el catálogo. Esto puede tomar unos minutos...
          </p>
        )}
      </div>

      {result && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {result.total_productos} productos extraídos de {result.total_paginas} página(s)
            </p>
            <Btn onClick={handleSaveAll} disabled={saving || !result.productos?.length}>
              {saving ? 'Guardando...' : `Guardar todos (${result.productos?.length})`}
            </Btn>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.productos?.map((p, idx) => (
              <ProductCard
                key={idx}
                product={p}
                isEditing={editIdx === idx}
                onEdit={() => setEditIdx(editIdx === idx ? null : idx)}
                onChange={(field, val) => updateProduct(idx, field, val)}
                onRemove={() => removeProduct(idx)}
                showSave={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Product card (reusable) ───────────────────────────────────────────────────

const ESTADOS = ['pendiente', 'revisado', 'publicado', 'descartado']
const ESTADO_COLOR = {
  pendiente:  'var(--text-tertiary)',
  revisado:   '#6fb86f',
  publicado:  'var(--accent)',
  descartado: '#7a3030',
}

function ProductCard({ product: p, isEditing, onEdit, onChange, onRemove, onSave, onFetchImages, showSave = true }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <input
              value={p.nombre || ''}
              onChange={e => onChange('nombre', e.target.value)}
              style={{
                width: '100%', background: 'var(--bg)', border: '0.5px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)', padding: '6px 10px', fontSize: '13px',
                color: 'var(--text-primary)', fontWeight: '500', marginBottom: 6,
              }}
            />
          ) : (
            <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: 4, wordBreak: 'break-word' }}>
              {p.nombre}
            </p>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {p.sku && <Badge text={p.sku} />}
            {p.categoria && <Badge text={p.categoria} color="var(--accent)" />}
            {p.pagina_catalogo && <Badge text={`Pág. ${p.pagina_catalogo}`} />}
            {p.estado && <Badge text={p.estado} color={ESTADO_COLOR[p.estado]} />}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {onFetchImages && p.id && (
            <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={onFetchImages}>
              {p.imagenes?.length ? `Fotos (${p.imagenes.length})` : 'Buscar fotos'}
            </Btn>
          )}
          <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={onEdit}>
            {isEditing ? 'Cerrar' : 'Editar'}
          </Btn>
          {showSave && onSave && (
            <Btn style={{ padding: '5px 10px', fontSize: '11px' }} onClick={onSave}>
              Guardar
            </Btn>
          )}
          {onRemove && (
            <Btn variant="danger" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={onRemove}>
              ✕
            </Btn>
          )}
        </div>
      </div>

      {isEditing && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <EditRow label="SKU">
            <EditInput value={p.sku} onChange={v => onChange('sku', v)} />
          </EditRow>
          <EditRow label="Descripción">
            <EditTextarea value={p.descripcion} onChange={v => onChange('descripcion', v)} rows={3} />
          </EditRow>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <EditRow label="Precio distribuidor" style={{ flex: 1, minWidth: 120 }}>
              <EditInput value={p.precio_distribuidor} onChange={v => onChange('precio_distribuidor', parseFloat(v) || null)} type="number" />
            </EditRow>
            <EditRow label="Precio MC" style={{ flex: 1, minWidth: 120 }}>
              <EditInput value={p.precio_mc} onChange={v => onChange('precio_mc', parseFloat(v) || null)} type="number" />
            </EditRow>
            <EditRow label="Margen %" style={{ flex: 1, minWidth: 100 }}>
              <EditInput value={p.margen} onChange={v => onChange('margen', parseFloat(v) || 0)} type="number" />
            </EditRow>
            <EditRow label="Uds/caja" style={{ flex: 1, minWidth: 80 }}>
              <EditInput value={p.unidades_caja} onChange={v => onChange('unidades_caja', parseInt(v) || null)} type="number" />
            </EditRow>
          </div>
          <EditRow label="Categoría MercadoLibre">
            <EditInput value={p.categoria} onChange={v => onChange('categoria', v)} />
          </EditRow>
          <EditRow label="Estado">
            <select
              value={p.estado || 'pendiente'}
              onChange={e => onChange('estado', e.target.value)}
              style={{
                background: 'var(--bg)', border: '0.5px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)', padding: '6px 10px',
                fontSize: '12px', color: 'var(--text-primary)',
              }}
            >
              {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </EditRow>

          {p.variantes?.length > 0 && (
            <EditRow label={`Variantes (${p.variantes.length})`}>
              <pre style={{
                fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--bg)',
                borderRadius: 'var(--radius-md)', padding: '8px 10px', margin: 0,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {JSON.stringify(p.variantes, null, 2)}
              </pre>
            </EditRow>
          )}

          {p.imagenes?.length > 0 && (
            <EditRow label={`Fotos (${p.imagenes.length})`}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {p.imagenes.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt={`foto ${i + 1}`}
                      style={{ width: 64, height: 64, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '0.5px solid var(--border)' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  </a>
                ))}
              </div>
            </EditRow>
          )}
        </div>
      )}
    </div>
  )
}

function EditRow({ label, children, style = {} }) {
  return (
    <div style={style}>
      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</p>
      {children}
    </div>
  )
}

function EditInput({ value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', background: 'var(--bg)', border: '0.5px solid var(--border-strong)',
        borderRadius: 'var(--radius-md)', padding: '6px 10px', fontSize: '12px',
        color: 'var(--text-primary)', boxSizing: 'border-box',
      }}
    />
  )
}

function EditTextarea({ value, onChange, rows = 2 }) {
  return (
    <textarea
      value={value ?? ''}
      rows={rows}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', background: 'var(--bg)', border: '0.5px solid var(--border-strong)',
        borderRadius: 'var(--radius-md)', padding: '6px 10px', fontSize: '12px',
        color: 'var(--text-primary)', resize: 'vertical', boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    />
  )
}

// ── Products tab ───────────────────────────────────────────────────────────────

function ProductsTab({ onToast, refreshKey }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [editIdx, setEditIdx] = useState(null)
  const [fetchingImages, setFetchingImages] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.get('/api/products/')
      setProducts(data)
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshKey])

  const handleSave = async (p) => {
    try {
      await api.patch(`/api/products/${p.id}`, p)
      await load()
      setEditIdx(null)
      onToast({ type: 'ok', text: 'Producto actualizado.' })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await api.delete(`/api/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
      onToast({ type: 'ok', text: 'Producto eliminado.' })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    }
  }

  const handleFetchImages = async (productId) => {
    try {
      const data = await api.post(`/api/images/fetch/${productId}`, {})
      if (data.total === 0) {
        onToast({ type: 'error', text: `No se encontraron fotos para SKU "${data.sku}" en Trupper.` })
      } else {
        onToast({ type: 'ok', text: `${data.total} foto(s) encontradas para ${data.sku}.` })
        await load()
      }
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    }
  }

  const handleFetchAllImages = async () => {
    if (!confirm(`¿Buscar fotos en Trupper para todos los productos con SKU? Puede tomar varios minutos.`)) return
    setFetchingImages(true)
    try {
      const data = await api.post('/api/images/fetch-bulk', {})
      onToast({ type: 'ok', text: `${data.con_imagenes} de ${data.procesados} productos con fotos encontradas.` })
      await load()
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setFetchingImages(false)
    }
  }

  const [localProducts, setLocalProducts] = useState([])
  useEffect(() => { setLocalProducts(products) }, [products])

  const filtered = filter
    ? localProducts.filter(p =>
        (p.nombre || '').toLowerCase().includes(filter.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(filter.toLowerCase()) ||
        (p.categoria || '').toLowerCase().includes(filter.toLowerCase())
      )
    : localProducts

  if (loading) return <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Cargando...</p>

  if (!localProducts.length) return (
    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>
      Aún no hay productos. Usa "Importar PDF" para comenzar.
    </p>
  )

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <input
          placeholder="Buscar por nombre, SKU o categoría..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            width: '100%', background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px',
            color: 'var(--text-primary)', boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {filtered.length} producto(s)
        </p>
        <Btn variant="ghost" style={{ fontSize: '11px', padding: '5px 10px' }}
          onClick={handleFetchAllImages} disabled={fetchingImages}>
          {fetchingImages ? 'Buscando fotos...' : 'Buscar fotos (todos)'}
        </Btn>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((p) => {
          const localIdx = localProducts.findIndex(lp => lp.id === p.id)
          return (
            <ProductCard
              key={p.id}
              product={localProducts[localIdx]}
              isEditing={editIdx === p.id}
              onEdit={() => setEditIdx(editIdx === p.id ? null : p.id)}
              onChange={(field, val) => {
                setLocalProducts(prev => {
                  const next = [...prev]
                  next[localIdx] = { ...next[localIdx], [field]: val }
                  return next
                })
              }}
              onRemove={() => handleDelete(p.id)}
              onSave={() => handleSave(localProducts[localIdx])}
              onFetchImages={() => handleFetchImages(p.id)}
              showSave={editIdx === p.id}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Export tab ─────────────────────────────────────────────────────────────────

function ExportTab({ onToast }) {
  const [margen, setMargen] = useState(30)
  const [categoria, setCategoria] = useState('')
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/products/stats').then(setStats).catch(() => {})
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/excel/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          margen_global: margen,
          categoria_ml: categoria || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Error exportando')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kobber_productos_${new Date().toISOString().slice(0,10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      onToast({ type: 'ok', text: 'Excel descargado.' })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 16,
      }}>
        <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: 14 }}>Configuración de exportación</p>

        {stats && (
          <div style={{
            background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '10px 14px',
            marginBottom: 16, fontSize: '12px', color: 'var(--text-secondary)',
          }}>
            {stats.total} productos en total — se exportarán todos los que no estén "descartados"
          </div>
        )}

        <EditRow label="Margen global de precio (%)" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="range" min={0} max={100} value={margen}
              onChange={e => setMargen(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent)', minWidth: 40 }}>
              {margen}%
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Precio venta = precio distribuidor × (1 + {margen}/100)
          </p>
        </EditRow>

        <EditRow label="Categoría ML (opcional — sobreescribe por producto)" style={{ marginBottom: 16 }}>
          <EditInput value={categoria} onChange={setCategoria} />
        </EditRow>

        <Btn onClick={handleExport} disabled={exporting}>
          {exporting ? 'Generando Excel...' : 'Descargar Excel para MercadoLibre'}
        </Btn>
      </div>

      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '16px 20px',
        fontSize: '12px', color: 'var(--text-tertiary)',
      }}>
        <p style={{ fontWeight: '500', marginBottom: 6, color: 'var(--text-secondary)' }}>El Excel incluye:</p>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
          <li>SKU / Código de vendedor</li>
          <li>Título del anuncio</li>
          <li>Descripción del producto</li>
          <li>Categoría MercadoLibre</li>
          <li>Precio de venta calculado con el margen</li>
          <li>Stock (unidades por caja)</li>
          <li>URLs de fotos</li>
          <li>Variantes disponibles</li>
        </ul>
        <p style={{ marginTop: 10 }}>
          Cuando tengas los templates oficiales de ML, podemos ajustar las columnas exactas.
        </p>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('productos')
  const [stats, setStats] = useState(null)
  const [toast, setToast] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadStats = () => {
    api.get('/api/products/stats').then(setStats).catch(() => {})
  }

  useEffect(() => { loadStats() }, [refreshKey])

  const handleImported = () => {
    setRefreshKey(k => k + 1)
    setTab('productos')
  }

  const onToast = (msg) => setToast(msg)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '28px 16px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <img src={logo} alt="Kobber" style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontSize: '15px', fontWeight: '500' }}>Kobber</span>
          <span style={{
            fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--surface)',
            padding: '2px 8px', borderRadius: '4px', border: '0.5px solid var(--border)',
          }}>
            catálogo MercadoLibre
          </span>
        </div>

        <Tabs active={tab} onChange={setTab} stats={stats} />

        {tab === 'importar'  && <ImportTab onImported={handleImported} onToast={onToast} />}
        {tab === 'productos' && <ProductsTab onToast={onToast} refreshKey={refreshKey} />}
        {tab === 'exportar'  && <ExportTab onToast={onToast} />}

      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
