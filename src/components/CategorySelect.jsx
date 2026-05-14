const CATEGORIES = [
  'Herramientas eléctricas',
  'Herramientas manuales',
  'Fijación y anclaje',
  'Medición y trazado',
  'Equipos de seguridad',
  'Soldadura y corte',
  'Jardinería y exterior',
  'Organización y almacenaje',
]

export default function CategorySelect({ value, onChange, disabled }) {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '9px 12px',
          border: `0.5px solid ${value ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)',
          background: disabled ? 'var(--bg)' : 'var(--surface)',
          color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
          fontSize: '13px',
          appearance: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
        }}
      >
        <option value="">Selecciona una categoría...</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      {value && (
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
          Categoría seleccionada: <strong style={{ color: 'var(--text-secondary)' }}>{value}</strong>
        </p>
      )}
    </div>
  )
}
