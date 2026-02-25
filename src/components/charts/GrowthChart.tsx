'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { GrowthPoint } from '@/lib/types'

interface GrowthChartProps {
  data: GrowthPoint[]
  color?: string
  height?: number
  showCumulative?: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border-light)',
        color: 'var(--text)',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name}>
          <span style={{ color: p.color }}>{p.name}: </span>
          <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function GrowthChart({
  data,
  color = '#e11d48',
  height = 220,
  showCumulative = true,
}: GrowthChartProps) {
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ height, background: 'var(--border)', opacity: 0.4 }}
      >
        <span className="text-xs" style={{ color: 'var(--muted)' }}>No data</span>
      </div>
    )
  }

  const key = showCumulative ? 'cumulative' : 'count'
  const label = showCumulative ? 'Cumulative' : 'New'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--muted)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={key}
          name={label}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${color.replace('#', '')})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
