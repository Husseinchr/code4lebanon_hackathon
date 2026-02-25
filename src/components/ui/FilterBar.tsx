'use client'

interface Option {
  value: string
  label: string
}

interface FilterBarProps {
  filters: {
    key: string
    label: string
    value: string
    options: Option[]
    onChange: (value: string) => void
  }[]
}

export function FilterBar({ filters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {filters.map((f) => (
        <div key={f.key} className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            {f.label}
          </label>
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border-light)',
              color: 'var(--text)',
            }}
          >
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
