import React, { useState, useEffect, useRef } from 'react'
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
    primary: { background: 'var(--accent)', color: '#FFFFFF' },
    secondary: { background: 'var(--surface)', color: 'var(--text-primary)', border: '0.5px solid var(--border-strong)' },
    danger: { background: '#C0392B', color: '#FFFFFF' },
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
      background: isError ? '#FDF2F2' : 'var(--surface)',
      border: `0.5px solid ${isError ? '#E8BABA' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)', padding: '12px 16px',
      fontSize: '13px', color: isError ? '#9B1C1C' : 'var(--text-primary)', maxWidth: 360,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    }}>
      {msg.text}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'flujo',    label: 'Publicador',  icon: '⇢' },
  { id: 'productos_group', label: 'Productos', icon: '≡', children: [
    { id: 'importar', label: 'Subir productos',  icon: '↑' },
    { id: 'buscar',   label: 'Buscar productos',  icon: '⊞' },
  ]},
  { id: 'imagenes', label: 'Imágenes',    icon: '⊡' },
  { id: 'analizar', label: 'Analizar ML', icon: '⚑' },
]

function Sidebar({ active, onChange, stats, open, onToggle }) {
  const childIds = NAV_ITEMS.flatMap(i => (i.children || []).map(c => c.id))
  const activeParent = NAV_ITEMS.find(i => i.children?.some(c => c.id === active))?.id
  const [expanded, setExpanded] = useState(activeParent || null)

  const handleItemClick = (item) => {
    if (item.children) {
      setExpanded(expanded === item.id ? null : item.id)
    } else {
      onChange(item.id)
    }
  }

  const isChildActive = (item) => item.children?.some(c => c.id === active)

  return (
    <div style={{
      width: open ? 220 : 48,
      minWidth: open ? 220 : 48,
      borderLeft: '1px solid var(--border)',
      background: 'var(--surface)',
      boxShadow: '-2px 0 12px rgba(0,0,0,0.04)',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>

      {/* Toggle */}
      <button
        onClick={onToggle}
        title={open ? 'Cerrar menú' : 'Abrir menú'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px', color: 'var(--text-tertiary)',
          fontSize: '18px', lineHeight: 1,
          display: 'flex', justifyContent: open ? 'flex-end' : 'center', alignItems: 'center',
          borderBottom: '0.5px solid var(--border)',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
      >
        {open ? '›' : '‹'}
      </button>

      {/* Logo */}
      <div style={{
        padding: open ? '18px 16px 10px' : '18px 0 10px',
        display: 'flex', justifyContent: open ? 'flex-start' : 'center', alignItems: 'center',
        gap: 10, borderBottom: '0.5px solid var(--border)',
        overflow: 'hidden',
      }}>
        <img src={logo} alt="Kobber" style={{ width: 30, height: 30, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} />
        {open && (
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', margin: 0 }}>Kobber</p>
            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', margin: 0 }}>catálogo ML</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV_ITEMS.map(item => {
          const isActive    = active === item.id
          const hasChildren = !!item.children
          const childActive = isChildActive(item)
          const isExpanded  = expanded === item.id
          const count       = item.id === 'buscar' ? stats?.total : undefined

          return (
            <div key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                title={open ? undefined : item.label}
                style={{
                  width: '100%', background: (isActive || childActive) ? 'var(--bg)' : 'transparent',
                  border: 'none',
                  borderLeft: (isActive || childActive) ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: open ? '10px 16px' : '12px 0',
                  display: 'flex', alignItems: 'center',
                  gap: open ? 10 : 0, justifyContent: open ? 'flex-start' : 'center',
                  color: (isActive || childActive) ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: (isActive || childActive) ? '500' : '400',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                <span style={{ fontSize: '17px', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                {open && (
                  <>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                      {item.label}
                      {count != null && (
                        <span style={{ marginLeft: 5, fontSize: '11px', opacity: 0.55 }}>({count})</span>
                      )}
                    </span>
                    {hasChildren && (
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
                    )}
                  </>
                )}
              </button>

              {/* Submenú */}
              {hasChildren && open && isExpanded && (
                <div style={{ background: 'var(--bg)', borderLeft: '2px solid var(--border)', marginLeft: 16 }}>
                  {item.children.map(child => {
                    const childIsActive = active === child.id
                    return (
                      <button
                        key={child.id}
                        onClick={() => onChange(child.id)}
                        style={{
                          width: '100%', background: childIsActive ? 'var(--surface)' : 'transparent',
                          border: 'none',
                          borderLeft: childIsActive ? '2px solid var(--accent)' : '2px solid transparent',
                          cursor: 'pointer',
                          padding: '8px 14px',
                          display: 'flex', alignItems: 'center', gap: 8,
                          color: childIsActive ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: '12px', fontWeight: childIsActive ? '500' : '400',
                          transition: 'color 0.15s, background 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '14px', lineHeight: 1 }}>{child.icon}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {child.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

// ── Import PDF tab ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total, found }) {
  const pct = total ? Math.round((current / total) * 100) : 0
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Página {current} de {total}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500' }}>
          {found} producto{found !== 1 ? 's' : ''} encontrado{found !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{
        height: 6, background: 'var(--bg)', borderRadius: 3,
        overflow: 'hidden', border: '0.5px solid var(--border)',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: 'var(--accent)',
          borderRadius: 3, transition: 'width 0.4s ease',
        }} />
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 5 }}>
        {pct}% — Claude está analizando cada página...
      </p>
    </div>
  )
}

function ImportTab({ onImported, onToast }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)   // { current, total, found }
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const inputRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setResult(null); setProgress(null) }
  }

  const handleExtract = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    setProgress(null)

    try {
      const fd = new FormData()
      fd.append('file', file)

      const response = await fetch('/api/catalog/extract', { method: 'POST', body: fd })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Error ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop()

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          let event
          try { event = JSON.parse(part.slice(6)) } catch { continue }

          if (event.type === 'start') {
            setProgress({ current: 0, total: event.total, found: 0 })
          } else if (event.type === 'progress') {
            setProgress({ current: event.page, total: event.total, found: event.total_found })
          } else if (event.type === 'done') {
            setResult(event)
            if (event.errores?.length) {
              onToast({ type: 'error', text: `${event.errores.length} página(s) con errores de extracción.` })
            }
          }
        }
      }
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  const handleSaveAll = async () => {
    if (!result?.productos?.length) return
    setSaving(true)
    try {
      const data = await api.post('/api/catalog/save', { productos: result.productos })
      onToast({ type: 'ok', text: `${data.productos} productos y ${data.variantes} variantes guardados.` })
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
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: 4 }}>Subir catálogo PDF</p>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 14 }}>
          Máximo 30 páginas por vez. Claude analizará cada página y extraerá todos los productos.
        </p>

        <input ref={inputRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn variant="secondary" onClick={() => inputRef.current?.click()} disabled={loading}>
            Seleccionar PDF
          </Btn>
          {file && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          )}
          <Btn onClick={handleExtract} disabled={!file || loading}>
            {loading ? 'Analizando...' : 'Extraer productos'}
          </Btn>
        </div>

        {loading && progress && (
          <ProgressBar current={progress.current} total={progress.total} found={progress.found} />
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
  revisado:   '#2E7D52',
  publicado:  'var(--accent)',
  descartado: '#C0392B',
}

function ProductCard({ product: p, isEditing, onEdit, onChange, onRemove, onSave, onFetchImages, showSave = true }) {
  // Normalize field names: handles both Claude extraction format and Supabase format
  const variantes  = p.variantes       || p.product_variants || []
  const imagenes   = p.imagenes        || p.product_images   || []
  const primeraSku = variantes[0]?.clave || variantes[0]?.codigo || p.sku

  // ── Mejorar con IA ──────────────────────────────────────────────────────────
  const [enhancing,     setEnhancing]     = useState(false)
  const [enhanceResult, setEnhanceResult] = useState(null)
  const [applyDesc,     setApplyDesc]     = useState(true)
  const [applyAttrs,    setApplyAttrs]    = useState([])
  const [applying,      setApplying]      = useState(false)

  const handleEnhance = async () => {
    if (!p.id) return
    setEnhancing(true)
    setEnhanceResult(null)
    try {
      const r = await fetch(`/api/products/${p.id}/enhance`, { method: 'POST' })
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error') }
      const data = await r.json()
      setEnhanceResult(data)
      setApplyDesc(true)
      setApplyAttrs(data.atributos_sugeridos?.map((_, i) => i) || [])
    } catch (e) {
      alert(`Error: ${e.message}`)
    } finally {
      setEnhancing(false)
    }
  }

  const handleApply = async () => {
    if (!enhanceResult) return
    setApplying(true)
    try {
      const body = {
        descripcion:    applyDesc ? enhanceResult.descripcion : null,
        atributos_nuevos: (enhanceResult.atributos_sugeridos || []).filter((_, i) => applyAttrs.includes(i)),
      }
      const r = await fetch(`/api/products/${p.id}/apply-enhance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error') }
      if (applyDesc) onChange('descripcion', enhanceResult.descripcion)
      setEnhanceResult(null)
      alert('✅ Cambios aplicados correctamente')
    } catch (e) {
      alert(`Error: ${e.message}`)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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
            {primeraSku && <Badge text={primeraSku} />}
            {p.marca && <Badge text={p.marca} />}
            {p.categoria && <Badge text={p.categoria} color="var(--accent)" />}
            {p.pagina_catalogo && <Badge text={`Pág. ${p.pagina_catalogo}`} />}
            {p.estado && <Badge text={p.estado} color={ESTADO_COLOR[p.estado]} />}
            {variantes.length > 0 && <Badge text={`${variantes.length} var.`} />}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {onFetchImages && p.id && (
            <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={onFetchImages}>
              {imagenes.length ? `Fotos (${imagenes.length})` : 'Buscar fotos'}
            </Btn>
          )}
          {p.id && (
            <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={handleEnhance} disabled={enhancing}>
              {enhancing ? '...' : '✨ Mejorar'}
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
          <EditRow label="Descripción">
            <EditTextarea value={p.descripcion} onChange={v => onChange('descripcion', v)} rows={3} />
          </EditRow>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <EditRow label="Marca" style={{ flex: 1, minWidth: 120 }}>
              <EditInput value={p.marca} onChange={v => onChange('marca', v)} />
            </EditRow>
            <EditRow label="Categoría" style={{ flex: 1, minWidth: 150 }}>
              <EditInput value={p.categoria} onChange={v => onChange('categoria', v)} />
            </EditRow>
            <EditRow label="Sección" style={{ minWidth: 80 }}>
              <EditInput value={p.seccion} onChange={v => onChange('seccion', v)} />
            </EditRow>
          </div>
          <EditRow label="Subcategoría">
            <EditInput value={p.subcategoria} onChange={v => onChange('subcategoria', v)} />
          </EditRow>
          <EditRow label="Características (una por línea)">
            <EditTextarea
              value={(p.caracteristicas || []).join('\n')}
              onChange={v => onChange('caracteristicas', v.split('\n').filter(Boolean))}
              rows={3}
            />
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

          {variantes.length > 0 && (
            <EditRow label={`Variantes (${variantes.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {variantes.map((v, i) => (
                  <div key={i} style={{
                    fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)', padding: '6px 10px',
                    display: 'flex', gap: 10, flexWrap: 'wrap',
                  }}>
                    {(v.clave || v.codigo) && <span style={{ color: 'var(--accent)', fontWeight: '500' }}>{v.clave || v.codigo}</span>}
                    {v.descripcion && <span>{v.descripcion}</span>}
                    {v.precio_distribuidor != null && <span>${v.precio_distribuidor.toLocaleString()}</span>}
                    {v.unidades_caja && <span>Caja: {v.unidades_caja}</span>}
                  </div>
                ))}
              </div>
            </EditRow>
          )}

          {imagenes.length > 0 && (
            <EditRow label={`Fotos (${imagenes.length})`}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {imagenes.map((img, i) => {
                  const url = typeof img === 'string' ? img : img.url
                  return (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={`foto ${i + 1}`}
                        style={{ width: 64, height: 64, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '0.5px solid var(--border)' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    </a>
                  )
                })}
              </div>
            </EditRow>
          )}
        </div>
      )}

      {/* ── Panel Mejorar con IA ───────────────────────────────────────────── */}
      {enhanceResult && (
        <div style={{
          marginTop: 12, border: '1.5px solid var(--accent)', borderRadius: 'var(--radius-lg)',
          padding: '16px', background: 'var(--accent-dim)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: 'var(--accent)' }}>
              ✨ Sugerencias de Claude
            </p>
            <Btn variant="ghost" style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => setEnhanceResult(null)}>✕</Btn>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={applyDesc} onChange={e => setApplyDesc(e.target.checked)} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Reemplazar descripción
              </span>
            </label>
            <div style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              padding: '10px 12px', fontSize: '12px', color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 220, overflowY: 'auto',
              opacity: applyDesc ? 1 : 0.4,
            }}>
              {enhanceResult.descripcion}
            </div>
          </div>

          {/* Títulos sugeridos */}
          {enhanceResult.titulos_sugeridos?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Títulos sugeridos (referencia):
              </p>
              {enhanceResult.titulos_sugeridos.map((t, i) => (
                <p key={i} style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '0 0 3px',
                  background: '#fff', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                  {t}
                </p>
              ))}
            </div>
          )}

          {/* Atributos sugeridos */}
          {enhanceResult.atributos_sugeridos?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Atributos a agregar:
              </p>
              {enhanceResult.atributos_sugeridos.map((a, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, cursor: 'pointer' }}>
                  <input type="checkbox"
                    checked={applyAttrs.includes(i)}
                    onChange={e => setApplyAttrs(prev =>
                      e.target.checked ? [...prev, i] : prev.filter(x => x !== i)
                    )}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    <strong>{a.nombre}</strong>: {a.valor} {a.unidad || ''}
                  </span>
                </label>
              ))}
            </div>
          )}

          <Btn onClick={handleApply} disabled={applying || (!applyDesc && applyAttrs.length === 0)}>
            {applying ? 'Aplicando...' : 'Aplicar seleccionados'}
          </Btn>
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

const RES_COLS = '1fr 120px 95px 70px 105px 90px 80px'

function ProductsTab({ onToast }) {
  // Search state
  const [mode, setMode] = useState('idle')   // 'idle' | 'results'
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [variantPcts, setVariantPcts] = useState({})  // {variant_id: pct}
  const [summary, setSummary] = useState(null)

  // Input state
  const [pastedText, setPastedText] = useState('')
  const [defaultPct, setDefaultPct] = useState(30)
  const [excelFile, setExcelFile] = useState(null)
  const excelRef = useRef()

  // Edit state
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)

  // Enhance state
  const [enhancingId,   setEnhancingId]   = useState(null)
  const [enhanceResult, setEnhanceResult] = useState(null)
  const [enhApplyDesc,  setEnhApplyDesc]  = useState(true)
  const [enhApplyAttrs, setEnhApplyAttrs] = useState([])
  const [applying,      setApplying]      = useState(false)

  const handleEnhance = async (productId) => {
    setEnhancingId(productId)
    setEnhanceResult(null)
    try {
      const r = await fetch(`/api/products/${productId}/enhance`, { method: 'POST' })
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error') }
      const data = await r.json()
      setEnhanceResult({ ...data, productId })
      setEnhApplyDesc(true)
      setEnhApplyAttrs(data.atributos_sugeridos?.map((_, i) => i) || [])
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setEnhancingId(null)
    }
  }

  const handleApplyEnhance = async () => {
    if (!enhanceResult) return
    setApplying(true)
    try {
      const body = {
        descripcion:     enhApplyDesc ? enhanceResult.descripcion : null,
        atributos_nuevos: (enhanceResult.atributos_sugeridos || []).filter((_, i) => enhApplyAttrs.includes(i)),
      }
      const r = await fetch(`/api/products/${enhanceResult.productId}/apply-enhance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error') }
      if (enhApplyDesc) {
        setProducts(prev => prev.map(p =>
          p.id === enhanceResult.productId ? { ...p, descripcion: enhanceResult.descripcion } : p
        ))
      }
      setEnhanceResult(null)
      onToast({ type: 'ok', text: '✅ Descripción y atributos actualizados.' })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setApplying(false)
    }
  }

  const reset = () => {
    setMode('idle'); setProducts([]); setVariantPcts({}); setSummary(null)
    setEditId(null); setDraft(null)
  }

  // Inicializa variantPcts desde una lista de productos y un mapa {product_id: pct}
  const initVariantPcts = (prods, productPctMap) => {
    const vp = {}
    for (const p of prods)
      for (const v of (p.product_variants || []))
        vp[v.id] = productPctMap[p.id] ?? null
    setVariantPcts(vp)
  }

  // Cambia el % de todas las variantes de un producto a la vez
  const setProductPct = (p, pct) => {
    setVariantPcts(prev => {
      const next = { ...prev }
      for (const v of (p.product_variants || [])) next[v.id] = pct
      return next
    })
  }

  const setVariantPct = (variantId, pct) =>
    setVariantPcts(prev => ({ ...prev, [variantId]: pct }))

  const handleGenerateExcel = async () => {
    if (!products.length) return
    try {
      const items = products.map(p => ({
        product_id: p.id,
        variantes: (p.product_variants || []).map(v => ({
          variant_id: v.id,
          porcentaje: variantPcts[v.id] ?? null,
        })),
      }))
      const res = await fetch('/api/excel/generate-ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error') }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `kobber_ML_${new Date().toISOString().slice(0,10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      onToast({ type: 'ok', text: 'Excel generado y descargado.' })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    }
  }

  const searchByText = async () => {
    const codes = pastedText.split(',').map(c => c.trim()).filter(Boolean)
    if (!codes.length) return
    setLoading(true)
    try {
      const data = await api.post('/api/products/by-codes', { codes, porcentaje: defaultPct })
      setProducts(data.products)
      initVariantPcts(data.products, Object.fromEntries(data.products.map(p => [p.id, defaultPct])))
      setSummary({ total_codigos: codes.length, encontrados: data.encontrados, no_encontrados: data.no_encontrados })
      setMode('results')
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const searchByExcel = async () => {
    if (!excelFile) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', excelFile)
      const data = await api.postForm('/api/products/from-excel', fd)
      setProducts(data.products)
      initVariantPcts(data.products, data.porcentajes || {})
      setSummary({ total_codigos: data.total_codigos, encontrados: data.encontrados, no_encontrados: data.no_encontrados })
      setMode('results')
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (p) => { setEditId(p.id); setDraft(JSON.parse(JSON.stringify(p))) }
  const cancelEdit = () => { setEditId(null); setDraft(null) }
  const setField = (field, value) => setDraft(prev => ({ ...prev, [field]: value }))
  const setVariantField = (vid, field, value) =>
    setDraft(prev => ({
      ...prev,
      product_variants: (prev.product_variants || []).map(v => v.id === vid ? { ...v, [field]: value } : v),
    }))

  const handleSave = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const { nombre, descripcion, marca, categoria, subcategoria, seccion, caracteristicas, estado } = draft
      await api.patch(`/api/products/${draft.id}`, { nombre, descripcion, marca, categoria, subcategoria, seccion, caracteristicas, estado })
      for (const v of (draft.product_variants || [])) {
        const fields = {}
        for (const k of ['clave', 'codigo', 'descripcion', 'precio_distribuidor', 'nc', 'unidades_caja', 'stock', 'estado'])
          if (v[k] !== undefined) fields[k] = v[k]
        if (Object.keys(fields).length) await api.patch(`/api/products/variants/${v.id}`, fields)
      }
      setProducts(prev => prev.map(p => p.id === draft.id ? { ...p, ...draft } : p))
      cancelEdit()
      onToast({ type: 'ok', text: 'Producto actualizado.' })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await api.delete(`/api/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
      if (editId === id) cancelEdit()
      onToast({ type: 'ok', text: 'Producto eliminado.' })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    }
  }

  const primaryCode = (p) => {
    const v = (p.product_variants || [])[0]
    return v ? (v.clave || v.codigo) : null
  }
  const primaryPrice = (p) => {
    const v = (p.product_variants || [])[0]
    return v?.precio_distribuidor ?? null
  }
  const primaryPct = (p) => {
    const v = (p.product_variants || [])[0]
    return v ? (variantPcts[v.id] ?? null) : null
  }
  const calcVenta = (precio, pct) =>
    precio != null && pct != null ? Math.round(precio * (1 + pct / 100)) : null

  const cardStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }
  const inputBase = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px',
    color: 'var(--text-primary)', boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const variantInputStyle = {
    width: '100%', background: 'var(--bg)', border: '0.5px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)', padding: '6px 10px', fontSize: '12px',
    color: 'var(--text-primary)', boxSizing: 'border-box',
  }

  // ── Idle mode ─────────────────────────────────────────────────────────────────
  if (mode === 'idle') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Excel card */}
      <div style={cardStyle}>
        <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: 4 }}>Subir Excel</p>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 14 }}>
          El archivo debe tener al menos dos columnas: <strong>Código</strong> y <strong>% Ganancia</strong>
        </p>
        <input ref={excelRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
          onChange={e => setExcelFile(e.target.files?.[0] || null)} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn variant="secondary" onClick={() => excelRef.current?.click()} disabled={loading}>
            Seleccionar Excel
          </Btn>
          {excelFile && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {excelFile.name}
            </span>
          )}
          <Btn onClick={searchByExcel} disabled={!excelFile || loading}>
            {loading ? 'Buscando...' : 'Buscar productos'}
          </Btn>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>o</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Paste card */}
      <div style={cardStyle}>
        <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: 4 }}>Pegar códigos</p>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 14 }}>
          Ingresa los códigos separados por coma
        </p>
        <textarea
          placeholder="TRP-001, TRP-002, TRP-003, ..."
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
          rows={3}
          style={{ ...inputBase, resize: 'vertical', marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              % Ganancia:
            </label>
            <input
              type="number" min={0} max={500} value={defaultPct}
              onChange={e => setDefaultPct(Number(e.target.value))}
              style={{ ...inputBase, width: 70 }}
            />
          </div>
          <Btn onClick={searchByText} disabled={!pastedText.trim() || loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Btn>
        </div>
      </div>
    </div>
  )

  // ── Results mode ──────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={reset}>
          ← Nueva búsqueda
        </Btn>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>
          {summary?.encontrados} producto(s) encontrado(s) de {summary?.total_codigos} código(s)
        </span>
        <Btn onClick={handleGenerateExcel} disabled={!products.length}>
          ↓ Generar Excel
        </Btn>
      </div>

      {/* Not found */}
      {summary?.no_encontrados?.length > 0 && (
        <div style={{
          background: '#FEF9EC', border: '1px solid #F3DBAE', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 12, fontSize: '12px', color: '#7A5C1A',
        }}>
          <strong>No encontrados ({summary.no_encontrados.length}):</strong>{' '}
          {summary.no_encontrados.join(', ')}
        </div>
      )}

      {products.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>
          Ningún código coincidió con productos en la base de datos.
        </p>
      )}

      {/* Table header */}
      {products.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: RES_COLS, gap: 8,
          padding: '7px 12px',
          background: 'var(--accent)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
        }}>
          {['Nombre', 'Código', 'P. Dist.', 'Gan.', 'P. Venta', 'Estado', ''].map((h, i) => (
            <span key={i} style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: '600', letterSpacing: '0.03em' }}>{h}</span>
          ))}
        </div>
      )}

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {products.map((p, idx) => {
          const isEditing = editId === p.id
          const pct    = primaryPct(p)
          const pDist  = primaryPrice(p)
          const pVenta = calcVenta(pDist, pct)
          const code   = primaryCode(p)
          const isEven = idx % 2 === 0
          const nVariants = (p.product_variants || []).length

          return (
            <div key={p.id} style={{
              background: isEditing ? 'var(--surface)' : isEven ? '#FFFFFF' : '#F7F4F0',
              border: `1px solid ${isEditing ? 'var(--border-strong)' : 'transparent'}`,
              borderRadius: isEditing ? 'var(--radius-md)' : 0,
              borderBottom: isEditing ? undefined : '1px solid var(--border)',
              transition: 'background 0.1s',
            }}>
              <div
                style={{ display: 'grid', gridTemplateColumns: RES_COLS, gap: 8, padding: '10px 12px', alignItems: 'center' }}
                onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = 'rgba(200,118,44,0.06)' }}
                onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.nombre}
                  </p>
                  {p.marca && (
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {p.marca}{nVariants > 1 ? ` · ${nVariants} variantes` : ''}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {code || '—'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {pDist != null ? `$${pDist.toLocaleString()}` : '—'}
                </span>
                {/* % editable — cambia todas las variantes del producto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="number" min={0} max={999}
                    value={pct ?? ''}
                    onChange={e => setProductPct(p, e.target.value === '' ? null : Number(e.target.value))}
                    onClick={e => e.stopPropagation()}
                    style={{
                      width: 48, padding: '3px 5px', fontSize: '12px', textAlign: 'center',
                      background: 'transparent', border: '1px solid transparent',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>%</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: pVenta != null ? '#2E7D52' : 'var(--text-tertiary)' }}>
                  {pVenta != null ? `$${pVenta.toLocaleString()}` : '—'}
                </span>
                <Badge text={p.estado || 'pendiente'} color={ESTADO_COLOR[p.estado] || 'var(--text-tertiary)'} />
                <div style={{ display: 'flex', gap: 4 }}>
                  <Btn
                    variant={isEditing ? 'secondary' : 'ghost'}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => isEditing ? cancelEdit() : startEdit(p)}
                  >
                    {isEditing ? 'Cerrar' : 'Editar'}
                  </Btn>
                  <Btn
                    variant="ghost"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    disabled={enhancingId === p.id}
                    onClick={() => enhanceResult?.productId === p.id ? setEnhanceResult(null) : handleEnhance(p.id)}
                  >
                    {enhancingId === p.id ? '...' : '✨'}
                  </Btn>
                </div>
              </div>

              {/* Edit panel */}
              {isEditing && draft && (
                <div style={{ padding: '0 12px 16px' }}>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <EditRow label="Nombre" style={{ flex: '2 1 200px' }}>
                        <EditInput value={draft.nombre} onChange={v => setField('nombre', v)} />
                      </EditRow>
                      <EditRow label="Marca" style={{ flex: '1 1 100px' }}>
                        <EditInput value={draft.marca} onChange={v => setField('marca', v)} />
                      </EditRow>
                    </div>
                    <EditRow label="Descripción">
                      <EditTextarea value={draft.descripcion} onChange={v => setField('descripcion', v)} rows={2} />
                    </EditRow>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <EditRow label="Categoría" style={{ flex: '1 1 140px' }}>
                        <EditInput value={draft.categoria} onChange={v => setField('categoria', v)} />
                      </EditRow>
                      <EditRow label="Subcategoría" style={{ flex: '1 1 140px' }}>
                        <EditInput value={draft.subcategoria} onChange={v => setField('subcategoria', v)} />
                      </EditRow>
                      <EditRow label="Estado" style={{ flexShrink: 0 }}>
                        <select value={draft.estado || 'pendiente'} onChange={e => setField('estado', e.target.value)}
                          style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '6px 10px', fontSize: '12px', color: 'var(--text-primary)' }}>
                          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </EditRow>
                    </div>

                    {(draft.product_variants || []).length > 0 && (
                      <EditRow label={`Variantes (${draft.product_variants.length})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                          {draft.product_variants.map(v => {
                            const vPct   = variantPcts[v.id] ?? null
                            const vDist  = v.precio_distribuidor ?? null
                            const vVenta = calcVenta(vDist, vPct)
                            return (
                              <div key={v.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                  <EditRow label="Clave" style={{ flex: '1 1 80px' }}>
                                    <input value={v.clave ?? ''} onChange={e => setVariantField(v.id, 'clave', e.target.value)} style={variantInputStyle} />
                                  </EditRow>
                                  <EditRow label="Código" style={{ flex: '1 1 80px' }}>
                                    <input value={v.codigo ?? ''} onChange={e => setVariantField(v.id, 'codigo', e.target.value)} style={variantInputStyle} />
                                  </EditRow>
                                  <EditRow label="Descripción" style={{ flex: '2 1 160px' }}>
                                    <input value={v.descripcion ?? ''} onChange={e => setVariantField(v.id, 'descripcion', e.target.value)} style={variantInputStyle} />
                                  </EditRow>
                                  <EditRow label="Precio dist." style={{ flex: '1 1 80px' }}>
                                    <input type="number" value={vDist ?? ''} onChange={e => setVariantField(v.id, 'precio_distribuidor', e.target.value === '' ? null : Number(e.target.value))} style={variantInputStyle} />
                                  </EditRow>
                                  <EditRow label="Stock" style={{ flex: '0 1 70px' }}>
                                    <input type="number" value={v.stock ?? ''} onChange={e => setVariantField(v.id, 'stock', e.target.value === '' ? null : Number(e.target.value))} style={variantInputStyle} />
                                  </EditRow>
                                </div>
                                {/* Fila de % ganancia por variante */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>% Ganancia:</span>
                                  <input
                                    type="number" min={0} max={999}
                                    value={vPct ?? ''}
                                    onChange={e => setVariantPct(v.id, e.target.value === '' ? null : Number(e.target.value))}
                                    style={{ ...variantInputStyle, width: 70, textAlign: 'center' }}
                                  />
                                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>%</span>
                                  {vVenta != null && (
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#2E7D52', marginLeft: 4 }}>
                                      → ${vVenta.toLocaleString()}
                                    </span>
                                  )}
                                  {vDist != null && vPct == null && (
                                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ingresa % para ver precio</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </EditRow>
                    )}

                    <div style={{ display: 'flex', gap: 8, paddingTop: 4, alignItems: 'center' }}>
                      <Btn onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Btn>
                      <Btn variant="secondary" onClick={cancelEdit} disabled={saving}>Cancelar</Btn>
                      <Btn variant="danger" style={{ marginLeft: 'auto' }} onClick={() => handleDelete(draft.id)} disabled={saving}>
                        Eliminar
                      </Btn>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Panel ✨ Mejorar ─────────────────────────────────────────── */}
              {enhanceResult?.productId === p.id && (
                <div style={{
                  margin: '0 12px 12px', padding: 16,
                  border: '1.5px solid var(--accent)', borderRadius: 'var(--radius-lg)',
                  background: 'var(--accent-dim)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--accent)' }}>
                      ✨ Sugerencias de Claude
                    </p>
                    <Btn variant="ghost" style={{ padding: '3px 8px', fontSize: '11px' }}
                      onClick={() => setEnhanceResult(null)}>✕</Btn>
                  </div>

                  {/* Descripción */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={enhApplyDesc} onChange={e => setEnhApplyDesc(e.target.checked)} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Reemplazar descripción
                    </span>
                  </label>
                  <div style={{
                    background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                    padding: '10px 12px', fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                    maxHeight: 200, overflowY: 'auto', marginBottom: 12,
                    opacity: enhApplyDesc ? 1 : 0.4,
                  }}>
                    {enhanceResult.descripcion}
                  </div>

                  {/* Títulos sugeridos */}
                  {enhanceResult.titulos_sugeridos?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', margin: '0 0 6px' }}>
                        Títulos sugeridos:
                      </p>
                      {enhanceResult.titulos_sugeridos.map((t, i) => (
                        <p key={i} style={{
                          fontSize: '12px', margin: '0 0 4px', padding: '4px 8px',
                          background: '#fff', borderRadius: 4, border: '1px solid var(--border)',
                        }}>{t}</p>
                      ))}
                    </div>
                  )}

                  {/* Atributos sugeridos */}
                  {enhanceResult.atributos_sugeridos?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', margin: '0 0 6px' }}>
                        Atributos a agregar:
                      </p>
                      {enhanceResult.atributos_sugeridos.map((a, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, cursor: 'pointer' }}>
                          <input type="checkbox"
                            checked={enhApplyAttrs.includes(i)}
                            onChange={e => setEnhApplyAttrs(prev =>
                              e.target.checked ? [...prev, i] : prev.filter(x => x !== i)
                            )}
                          />
                          <span style={{ fontSize: '12px' }}>
                            <strong>{a.nombre}</strong>: {a.valor} {a.unidad || ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <Btn onClick={handleApplyEnhance} disabled={applying || (!enhApplyDesc && enhApplyAttrs.length === 0)}>
                    {applying ? 'Aplicando...' : 'Aplicar seleccionados'}
                  </Btn>
                </div>
              )}
            </div>
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
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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

// ── Images tab ────────────────────────────────────────────────────────────────

function ImagesTab({ onToast }) {
  const [loading,   setLoading]   = useState(false)
  const [results,   setResults]   = useState(null)   // {resultados, total, con_imagenes}
  const [selected,  setSelected]  = useState({})     // {product_id: Set<url>}
  const [saving,    setSaving]    = useState({})     // {product_id: bool}
  const [limit,     setLimit]     = useState(10)
  const [syncing,   setSyncing]   = useState(false)

  const handleSyncMissing = async () => {
    setSyncing(true)
    try {
      const data = await api.post('/api/images/fetch-bulk', {})
      onToast({ type: 'ok', text: `Sincronización completa: ${data.con_imagenes} productos con imágenes de ${data.procesados} procesados.` })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setSyncing(false)
    }
  }

  const load = async () => {
    setLoading(true)
    setResults(null)
    setSelected({})
    try {
      const data = await api.post('/api/images/banco/sample', { limit })
      setResults(data)
      // Pre-seleccionar todas las imágenes
      const sel = {}
      for (const r of data.resultados) {
        sel[r.product_id] = new Set(r.imagenes)
      }
      setSelected(sel)
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const toggleImg = (productId, url) => {
    setSelected(prev => {
      const s = new Set(prev[productId] || [])
      s.has(url) ? s.delete(url) : s.add(url)
      return { ...prev, [productId]: s }
    })
  }

  const handleSave = async (productId) => {
    const urls = [...(selected[productId] || [])]
    setSaving(prev => ({ ...prev, [productId]: true }))
    try {
      await api.post('/api/images/banco/save', { product_id: productId, urls })
      onToast({ type: 'ok', text: `${urls.length} imagen(es) guardadas.` })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setSaving(prev => ({ ...prev, [productId]: false }))
    }
  }

  const cardStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ ...cardStyle, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Búsqueda de imágenes</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Busca imágenes directamente en el Banco de Contenido Digital de Trupper
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Productos:</label>
            <input type="number" min={1} max={50} value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ width: 60, padding: '5px 8px', fontSize: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
          </div>
          <Btn variant="ghost" onClick={handleSyncMissing} disabled={syncing || loading}>
            {syncing ? 'Sincronizando...' : '↻ Sincronizar faltantes'}
          </Btn>
          <Btn onClick={load} disabled={loading}>
            {loading ? 'Buscando...' : '⊡ Buscar imágenes'}
          </Btn>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', fontSize: '13px' }}>
          Consultando BancoContenidoDigital de Trupper... puede tomar unos segundos.
        </div>
      )}

      {results && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              ['Total', results.total, 'var(--text-primary)'],
              ['Con imágenes', results.con_imagenes, '#2E7D52'],
              ['Sin imágenes', results.total - results.con_imagenes, results.total - results.con_imagenes > 0 ? '#C0392B' : 'var(--text-tertiary)'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 16px' }}>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color }}>{val}</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-tertiary)' }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {results.resultados.map(r => (
              <div key={r.product_id} style={cardStyle}>
                {/* Header del producto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.nombre}
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                      <Badge text={r.clave} color="var(--accent)" />
                      {r.marca && <Badge text={r.marca} />}
                      {r.trupper_id && <Badge text={`ID Trupper: ${r.trupper_id}`} />}
                      <Badge
                        text={r.found ? `${r.imagenes.length} imágenes` : 'Sin resultados'}
                        color={r.found ? '#2E7D52' : '#C0392B'}
                      />
                    </div>
                  </div>
                  {r.found && (
                    <Btn
                      style={{ padding: '5px 12px', fontSize: '11px', flexShrink: 0 }}
                      onClick={() => handleSave(r.product_id)}
                      disabled={saving[r.product_id] || (selected[r.product_id]?.size || 0) === 0}
                    >
                      {saving[r.product_id]
                        ? 'Guardando...'
                        : `Guardar seleccionadas (${selected[r.product_id]?.size || 0})`}
                    </Btn>
                  )}
                </div>

                {/* Galería */}
                {r.found ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.imagenes.map((url, i) => {
                      const isSel = selected[r.product_id]?.has(url)
                      return (
                        <div
                          key={i}
                          onClick={() => toggleImg(r.product_id, url)}
                          title={url.split('/').pop()}
                          style={{
                            position: 'relative', cursor: 'pointer',
                            border: `2px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-md)', overflow: 'hidden',
                            boxShadow: isSel ? '0 0 0 2px rgba(200,118,44,0.25)' : 'none',
                            transition: 'all 0.15s',
                          }}
                        >
                          <img
                            src={url}
                            alt={`img ${i+1}`}
                            style={{ width: 90, height: 90, objectFit: 'contain', background: '#fff', display: 'block' }}
                            onError={e => { e.target.style.display='none' }}
                          />
                          {isSel && (
                            <div style={{
                              position: 'absolute', top: 4, right: 4,
                              width: 18, height: 18, borderRadius: '50%',
                              background: 'var(--accent)', color: '#fff',
                              fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '700',
                            }}>✓</div>
                          )}
                          <p style={{
                            margin: 0, fontSize: '9px', color: 'var(--text-tertiary)',
                            textAlign: 'center', padding: '2px 4px',
                            background: 'var(--bg)', maxWidth: 90,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {url.split('/').pop()}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    No se encontraron imágenes en BancoContenidoDigital para la clave <strong>{r.clave}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Flow tab ──────────────────────────────────────────────────────────────────

const FLOW_STEPS = ['Buscar productos', 'Descargar plantillas', 'Subir plantilla', 'Rellenar y descargar']

function FlowStepper({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {FLOW_STEPS.map((label, i) => {
        const num    = i + 1
        const done   = num < current
        const active = num === current
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done || active ? 'var(--accent)' : 'var(--border)',
                color: done || active ? '#fff' : 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700',
                boxShadow: active ? '0 0 0 4px rgba(200,118,44,0.18)' : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{
                fontSize: '12px', fontWeight: active ? '600' : '400', whiteSpace: 'nowrap',
                color: active ? 'var(--accent)' : done ? 'var(--text-secondary)' : 'var(--text-tertiary)',
              }}>
                {label}
              </span>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 3, margin: '0 10px', marginBottom: 20,
                background: done ? 'var(--accent)' : 'var(--border)',
                borderRadius: 2, transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function FlowTab({ onToast }) {
  const [step, setStep] = useState(1)

  // ── Paso 1: búsqueda ────────────────────────────────────────────────────────
  const [searchMode,  setSearchMode]  = useState('idle')
  const [products,    setProducts]    = useState([])
  const [variantPcts, setVariantPcts] = useState({})
  const [summary,     setSummary]     = useState(null)
  const [pastedText,  setPastedText]  = useState('')
  const [defaultPct,  setDefaultPct]  = useState(30)
  const [searchFile,  setSearchFile]  = useState(null)
  const [searchLoad,  setSearchLoad]  = useState(false)
  const searchFileRef = useRef()

  // ── Paso 2: descargar plantillas ────────────────────────────────────────────
  const [downloading,   setDownloading]   = useState(false)
  const [templateBlob,  setTemplateBlob]  = useState(null)
  const [templateName,  setTemplateName]  = useState(null)

  // ── Paso 3: subir plantilla ─────────────────────────────────────────────────
  const [templateFile, setTemplateFile] = useState(null)
  const templateRef = useRef()

  // ── Paso 4: rellenar y descargar ────────────────────────────────────────────
  const [margen,   setMargen]   = useState('')
  const [filling,  setFilling]  = useState(false)

  // ── Helpers paso 1 ──────────────────────────────────────────────────────────
  const initVariantPcts = (prods, pctMap) => {
    const vp = {}
    for (const p of prods)
      for (const v of (p.product_variants || []))
        vp[v.id] = pctMap[p.id] ?? null
    setVariantPcts(vp)
  }

  const setProductPct = (p, pct) =>
    setVariantPcts(prev => {
      const next = { ...prev }
      for (const v of (p.product_variants || [])) next[v.id] = pct
      return next
    })

  const primaryCode  = p => { const v = (p.product_variants||[])[0]; return v ? (v.clave||v.codigo) : null }
  const primaryPrice = p => (p.product_variants||[])[0]?.precio_distribuidor ?? null
  const primaryPct   = p => { const v = (p.product_variants||[])[0]; return v ? (variantPcts[v.id]??null) : null }
  const calcVenta    = (precio, pct) => precio != null && pct != null ? Math.round(precio*(1+pct/100)) : null

  const searchByText = async () => {
    const codes = pastedText.split(',').map(c => c.trim()).filter(Boolean)
    if (!codes.length) return
    setSearchLoad(true)
    try {
      const data = await api.post('/api/products/by-codes', { codes, porcentaje: defaultPct })
      setProducts(data.products)
      initVariantPcts(data.products, Object.fromEntries(data.products.map(p => [p.id, defaultPct])))
      setSummary({ total_codigos: codes.length, encontrados: data.encontrados, no_encontrados: data.no_encontrados })
      setSearchMode('results')
    } catch (e) { onToast({ type: 'error', text: e.message }) }
    finally { setSearchLoad(false) }
  }

  const searchByExcel = async () => {
    if (!searchFile) return
    setSearchLoad(true)
    try {
      const fd = new FormData()
      fd.append('file', searchFile)
      const data = await api.postForm('/api/products/from-excel', fd)
      setProducts(data.products)
      initVariantPcts(data.products, data.porcentajes || {})
      setSummary({ total_codigos: data.total_codigos, encontrados: data.encontrados, no_encontrados: data.no_encontrados })
      setSearchMode('results')
    } catch (e) { onToast({ type: 'error', text: e.message }) }
    finally { setSearchLoad(false) }
  }

  // ── Helper paso 1 → paso 2 ──────────────────────────────────────────────────
  const handleContinueToStep2 = () => {
    if (!products.length) return
    setStep(2)
  }

  // ── Helper paso 2: descargar plantillas via scraper ──────────────────────────
  const handleDownloadTemplate = async () => {
    setDownloading(true)
    try {
      const product_ids = products.map(p => p.id)
      const r = await fetch('/api/analyzer/download-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids }),
      })
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error') }
      const blob = await r.blob()
      const cd   = r.headers.get('content-disposition') || ''
      const name = cd.match(/filename=([^;]+)/)?.[1] || `Publicar-${Date.now()}.xlsx`
      setTemplateBlob(blob)
      setTemplateName(name)

      // Descarga automática para el usuario
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href = url; a.download = name; a.click()
      URL.revokeObjectURL(url)

      onToast({ type: 'ok', text: 'Plantilla descargada. Continúa al paso 3.' })
      setStep(3)
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setDownloading(false)
    }
  }

  // ── Helper paso 3 → paso 4 ───────────────────────────────────────────────────
  const handleContinueToStep4 = () => {
    if (!templateFile && !templateBlob) return
    setStep(4)
  }

  // ── Helper paso 4: rellenar plantilla ────────────────────────────────────────
  const handleFill = async () => {
    const file = templateFile || (templateBlob
      ? new File([templateBlob], templateName || 'plantilla.xlsx',
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      : null)
    if (!file) return
    setFilling(true)
    try {
      const fd = new FormData()
      fd.append('ml_file', file)
      fd.append('product_ids', JSON.stringify(products.map(p => p.id)))
      const pct = parseFloat(margen) || 0
      const r   = await fetch(`/api/analyzer/fill-blank-template?margen=${pct}`, { method: 'POST', body: fd })
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error') }
      const filas = r.headers.get('X-Filas') || '?'
      const hojas = r.headers.get('X-Hojas') || '?'
      const blob  = await r.blob()
      const url   = URL.createObjectURL(blob)
      const a     = document.createElement('a')
      a.href = url
      a.download = `kobber_ML_listo_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      onToast({ type: 'ok', text: `✅ Listo: ${filas} productos en ${hojas} hojas. Descargado.` })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setFilling(false)
    }
  }

  const cardStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }
  const inputBase = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px',
    color: 'var(--text-primary)', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div>
      <FlowStepper current={step} />

      {/* ── PASO 1 ─────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {searchMode === 'idle' && (<>
            {/* Excel */}
            <div style={cardStyle}>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: 4 }}>Subir Excel con códigos</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 14 }}>
                Columnas: <strong>Código</strong> y <strong>% Ganancia</strong>
              </p>
              <input ref={searchFileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                onChange={e => setSearchFile(e.target.files?.[0] || null)} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Btn variant="secondary" onClick={() => searchFileRef.current?.click()} disabled={searchLoad}>
                  Seleccionar Excel
                </Btn>
                {searchFile && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{searchFile.name}</span>}
                <Btn onClick={searchByExcel} disabled={!searchFile || searchLoad}>
                  {searchLoad ? 'Buscando...' : 'Buscar'}
                </Btn>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>o</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Texto */}
            <div style={cardStyle}>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: 4 }}>Pegar códigos</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 14 }}>
                Separados por coma
              </p>
              <textarea placeholder="TRP-001, TRP-002, TRP-003, ..." value={pastedText}
                onChange={e => setPastedText(e.target.value)} rows={3}
                style={{ ...inputBase, resize: 'vertical', marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>% Ganancia:</label>
                  <input type="number" min={0} max={500} value={defaultPct}
                    onChange={e => setDefaultPct(Number(e.target.value))}
                    style={{ ...inputBase, width: 70 }} />
                </div>
                <Btn onClick={searchByText} disabled={!pastedText.trim() || searchLoad}>
                  {searchLoad ? 'Buscando...' : 'Buscar'}
                </Btn>
              </div>
            </div>
          </>)}

          {searchMode === 'results' && (<>
            {/* Barra de resultados */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => setSearchMode('idle')}>← Buscar de nuevo</Btn>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>
                {summary?.encontrados} producto(s) de {summary?.total_codigos} código(s)
              </span>
              <Btn onClick={handleContinueToStep2} disabled={!products.length}>
                Continuar al paso 2 →
              </Btn>
            </div>

            {summary?.no_encontrados?.length > 0 && (
              <div style={{ background: '#FEF9EC', border: '1px solid #F3DBAE', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '12px', color: '#7A5C1A' }}>
                <strong>No encontrados:</strong> {summary.no_encontrados.join(', ')}
              </div>
            )}

            {/* Tabla resultados */}
            <div style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '7px 12px', display: 'grid', gridTemplateColumns: RES_COLS, gap: 8 }}>
              {['Nombre', 'Código', 'P. Dist.', 'Gan.', 'P. Venta', 'Estado', ''].map((h,i) => (
                <span key={i} style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>{h}</span>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {products.map((p, idx) => {
                const pct    = primaryPct(p)
                const pDist  = primaryPrice(p)
                const pVenta = calcVenta(pDist, pct)
                const code   = primaryCode(p)
                const isEven = idx % 2 === 0
                return (
                  <div key={p.id} style={{
                    display: 'grid', gridTemplateColumns: RES_COLS, gap: 8, padding: '10px 12px', alignItems: 'center',
                    background: isEven ? '#fff' : '#F7F4F0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
                      {p.marca && <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{p.marca}</p>}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{code||'—'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{pDist!=null?`$${pDist.toLocaleString()}`:'—'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input type="number" min={0} max={999} value={pct??''}
                        onChange={e => setProductPct(p, e.target.value===''?null:Number(e.target.value))}
                        style={{ width: 48, padding: '3px 5px', fontSize: '12px', textAlign: 'center', background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor='var(--accent)'}
                        onBlur={e  => e.target.style.borderColor='transparent'} />
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>%</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: pVenta!=null?'#2E7D52':'var(--text-tertiary)' }}>
                      {pVenta!=null?`$${pVenta.toLocaleString()}`:'—'}
                    </span>
                    <Badge text={p.estado||'pendiente'} color={ESTADO_COLOR[p.estado]||'var(--text-tertiary)'} />
                    <span />
                  </div>
                )
              })}
            </div>
          </>)}
        </div>
      )}

      {/* ── PASO 2: Descargar plantillas ──────────────────────────────────────── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '12px' }}
              onClick={() => setStep(1)}>← Paso 1</Btn>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {products.length} producto(s) seleccionados
            </span>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: 4 }}>
              Descargar plantillas de ML
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 16 }}>
              El sistema ejecutará el scraper para descargar la plantilla con todas las categorías
              necesarias para los productos seleccionados. El navegador se abrirá automáticamente
              (la sesión ya está guardada).
            </p>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: '12px', fontWeight: '600', margin: '0 0 8px', color: 'var(--text-secondary)' }}>
                Categorías ML de los productos seleccionados:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[...new Set(products.map(p => p.categoria_ml).filter(Boolean))].map(cat => (
                  <Badge key={cat} text={cat} color="var(--accent)" />
                ))}
                {products.some(p => !p.categoria_ml) && (
                  <Badge text="Sin categoría ML" color="#999" />
                )}
              </div>
            </div>

            {templateBlob ? (
              <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, fontSize: '13px', color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>✅ Plantilla descargada: <strong>{templateName}</strong></span>
                <Btn variant="ghost" style={{ padding: '3px 10px', fontSize: '11px', marginLeft: 'auto' }}
                  onClick={() => { const u = URL.createObjectURL(templateBlob); const a = document.createElement('a'); a.href=u; a.download=templateName; a.click(); URL.revokeObjectURL(u) }}>
                  Volver a descargar
                </Btn>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={handleDownloadTemplate} disabled={downloading}>
                {downloading ? 'Ejecutando scraper... (1-2 min)' : '⬇ Descargar plantillas'}
              </Btn>
              {templateBlob && (
                <Btn onClick={() => setStep(3)}>
                  Continuar al paso 3 →
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PASO 3: Subir plantilla ───────────────────────────────────────────── */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '12px' }}
              onClick={() => setStep(2)}>← Paso 2</Btn>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Sube la plantilla descargada en el paso 2
            </span>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: 4 }}>
              Subir plantilla de ML
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 16 }}>
              Sube el archivo que se descargó automáticamente en el paso anterior
              (o búscalo en tu carpeta de Descargas si lo moviste).
            </p>

            <div
              style={{
                border: `2px dashed ${templateFile ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center',
                background: templateFile ? 'var(--accent-dim)' : 'var(--bg)', cursor: 'pointer',
                transition: 'all 0.15s', marginBottom: 16,
              }}
              onClick={() => templateRef.current?.click()}
            >
              <input ref={templateRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                onChange={e => setTemplateFile(e.target.files?.[0] || null)} />
              <p style={{ fontSize: '28px', margin: '0 0 8px' }}>📥</p>
              <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px' }}>
                {templateFile ? templateFile.name : 'Plantilla de MercadoLibre (.xlsx)'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                {templateFile ? '✅ Archivo listo' : 'Haz clic o arrastra el archivo aquí'}
              </p>
            </div>

            <Btn
              onClick={handleContinueToStep4}
              disabled={!templateFile && !templateBlob}
            >
              {templateFile ? 'Continuar al paso 4 →' : templateBlob ? 'Usar plantilla del paso 2 →' : 'Selecciona un archivo'}
            </Btn>
          </div>
        </div>
      )}

      {/* ── PASO 4: Rellenar y descargar ─────────────────────────────────────── */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: '12px' }}
              onClick={() => setStep(3)}>← Paso 3</Btn>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {products.length} producto(s) → {templateFile?.name || templateName}
            </span>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: 4 }}>
              Rellenar plantilla con datos de BD
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 16 }}>
              El sistema llenará cada hoja de la plantilla con los productos encontrados en el paso 1,
              usando los datos de la base de datos (precio, EAN, stock, descripción, fotos).
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                Margen sobre precio dist. (%)
              </label>
              <input
                type="number" min="0" max="200" step="0.5"
                value={margen}
                onChange={e => setMargen(e.target.value)}
                placeholder="0"
                style={{
                  width: 80, padding: '6px 10px', fontSize: '13px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)', color: 'var(--text-primary)',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                0 = precio distribuidor directo
              </span>
            </div>

            <Btn onClick={handleFill} disabled={filling}>
              {filling ? 'Rellenando plantilla...' : '⬇ Generar Excel para ML'}
            </Btn>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Analyze tab ───────────────────────────────────────────────────────────────

const ISSUE_ICONS = {
  NO_ENCONTRADO:    '⚠',
  SIN_PRECIO:       '💰',
  PRECIO_DIFERENTE: '💰',
  FALTA_EAN:        '🔢',
  SIN_EAN:          '🔢',
  TITULO_LARGO:     '📝',
  SIN_CODIGO_ML:    '🏷',
  SIN_STOCK:        '📦',
  SIN_DESC:         '📄',
  NO_EN_OUTPUT:     '👻',
}

function AnalyzeTab({ onToast }) {
  const [mlFile,  setMlFile]  = useState(null)
  const [margen,  setMargen]  = useState('')
  const [loading, setLoading] = useState(false)
  const mlRef = useRef()

  const handleGenerate = async () => {
    if (!mlFile) return
    setLoading(true)
    try {
      const fd  = new FormData()
      fd.append('ml_file', mlFile)
      const pct = parseFloat(margen) || 0
      const r   = await fetch(`/api/analyzer/fill-blank-template?margen=${pct}`, { method: 'POST', body: fd })
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error') }
      const filas = r.headers.get('X-Filas') || '?'
      const hojas = r.headers.get('X-Hojas') || '?'
      const blob  = await r.blob()
      const url   = URL.createObjectURL(blob)
      const a     = document.createElement('a')
      a.href      = url
      a.download  = `kobber_ML_completo_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      onToast({ type: 'ok', text: `Plantilla rellenada: ${filas} filas en ${hojas} hojas.` })
    } catch (e) {
      onToast({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: 4 }}>
          Rellenar plantilla de ML desde BD
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 20 }}>
          Sube la plantilla vacía descargada con el scraper. El sistema usa el plan de categorías
          generado para agregar automáticamente los productos de la BD en cada hoja.
        </p>

        <div
          style={{
            border: `2px dashed ${mlFile ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center',
            background: mlFile ? 'var(--accent-dim)' : 'var(--bg)', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onClick={() => mlRef.current?.click()}
        >
          <input ref={mlRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
            onChange={e => setMlFile(e.target.files?.[0] || null)} />
          <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📥</p>
          <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px' }}>
            {mlFile ? mlFile.name : 'Plantilla vacía de MercadoLibre'}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
            La que descargó el scraper (.xlsx)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Margen sobre precio dist. (%)
          </label>
          <input
            type="number" min="0" max="200" step="0.5"
            value={margen}
            onChange={e => setMargen(e.target.value)}
            placeholder="0"
            style={{
              width: 80, padding: '6px 10px', fontSize: '13px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg)', color: 'var(--text-primary)',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            0 = usa precio distribuidor directo
          </span>
        </div>

        <div style={{ marginTop: 16 }}>
          <Btn onClick={handleGenerate} disabled={!mlFile || loading}>
            {loading ? 'Procesando...' : '⬇ Rellenar desde BD'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('flujo')
  const [stats, setStats] = useState(null)
  const [toast, setToast] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const loadStats = () => {
    api.get('/api/products/stats').then(setStats).catch(() => {})
  }

  useEffect(() => { loadStats() }, [refreshKey])

  const handleImported = () => {
    setRefreshKey(k => k + 1)
    setTab('buscar')
  }

  const onToast = (msg) => setToast(msg)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
        <div style={{ maxWidth: ['buscar','analizar','flujo'].includes(tab) ? 960 : 700, margin: '0 auto' }}>
          {tab === 'flujo'    && <FlowTab     onToast={onToast} />}
          {tab === 'importar' && <ImportTab   onImported={handleImported} onToast={onToast} />}
          {tab === 'buscar'   && <ProductsTab onToast={onToast} />}
          {tab === 'imagenes' && <ImagesTab   onToast={onToast} />}
          {tab === 'analizar' && <AnalyzeTab  onToast={onToast} />}
        </div>
      </div>

      {/* Right sidebar */}
      <Sidebar
        active={tab}
        onChange={setTab}
        stats={stats}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
