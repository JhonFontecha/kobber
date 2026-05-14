import { useRef } from 'react'

export default function ImageUpload({ image, onImage }) {
  const inputRef = useRef()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    onImage({ file, url, name: file.name })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !image && inputRef.current.click()}
        style={{
          border: `1.5px dashed ${image ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)',
          padding: image ? '12px' : '36px 16px',
          textAlign: 'center',
          background: image ? 'var(--accent-dim)' : 'var(--bg)',
          cursor: image ? 'default' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {image ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={image.url}
              alt="Vista previa"
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border)' }}
            />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'var(--accent-dim)', color: 'var(--accent-text)',
                fontSize: '11px', fontWeight: '500',
                padding: '3px 10px', borderRadius: '20px', marginBottom: '6px'
              }}>
                ✓ Imagen cargada
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px', fontWeight: '500' }}>{image.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                {(image.file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onImage(null) }}
              style={{
                background: 'none', border: '0.5px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                fontSize: '11px', color: 'var(--text-secondary)',
              }}
            >
              Cambiar
            </button>
          </div>
        ) : (
          <>
            <div style={{
              width: '40px', height: '40px', background: 'var(--border)',
              borderRadius: '8px', margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>
              ↑
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Arrastra la imagen aquí o haz clic para seleccionar
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>JPG, PNG — máx. 10 MB</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
