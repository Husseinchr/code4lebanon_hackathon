interface PageHeaderProps {
  title: React.ReactNode
  subtitle: React.ReactNode
  badge?: React.ReactNode
}

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {badge && (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}
        >
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
        {title}
      </h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
        {subtitle}
      </p>
    </div>
  )
}
