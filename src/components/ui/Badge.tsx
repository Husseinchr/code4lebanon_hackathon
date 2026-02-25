interface BadgeProps {
  children: React.ReactNode
  color?: string
  size?: 'sm' | 'md'
}

export function Badge({ children, color = 'var(--primary)', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full uppercase tracking-wide ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {children}
    </span>
  )
}

interface StatusDotProps {
  status: 'completed' | 'partial' | 'pending'
}

const STATUS_CONFIG = {
  completed: { color: '#10b981', label: 'Completed' },
  partial:   { color: '#f59e0b', label: 'Partial' },
  pending:   { color: '#64748b', label: 'Pending' },
}

export function StatusDot({ status }: StatusDotProps) {
  const { color, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="text-xs" style={{ color }}>{label}</span>
    </span>
  )
}
