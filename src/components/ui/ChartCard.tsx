interface ChartCardProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function ChartCard({ title, subtitle, children, action, className = '' }: ChartCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 animate-fade-up ${className}`}
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm tracking-wide" style={{ color: 'var(--text)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
