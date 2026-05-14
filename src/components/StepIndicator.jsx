import React from 'react'

const steps = ['Imagen', 'Categoría', 'Porcentaje', 'Procesar']

export default function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
      {steps.map((label, i) => {
        const idx = i + 1
        const done = idx < current
        const active = idx === current
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '500', flexShrink: 0,
                background: done ? 'var(--accent)' : active ? '#3A3835' : 'var(--border)',
                color: done ? '#131211' : active ? '#F0EDE8' : 'var(--text-tertiary)',
              }}>
                {done ? '✓' : idx}
              </div>
              <span style={{
                fontSize: '12px',
                color: active ? 'var(--text-primary)' : done ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                fontWeight: active ? '500' : '400',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '1px', background: 'var(--border)', margin: '0 8px' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
