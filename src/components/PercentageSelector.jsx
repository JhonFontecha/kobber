const PERCENTAGES = [10, 15, 20, 25, 30, 35, 40, 50]

export default function PercentageSelector({ value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {PERCENTAGES.map((pct) => {
        const selected = value === pct
        return (
          <button
            key={pct}
            onClick={() => !disabled && onChange(pct)}
            disabled={disabled}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: selected ? '500' : '400',
              border: selected ? 'none' : '0.5px solid var(--border-strong)',
              background: selected ? 'var(--accent)' : 'var(--surface)',
              color: selected ? '#131211' : disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.1s',
            }}
          >
            {pct}%
          </button>
        )
      })}
    </div>
  )
}
