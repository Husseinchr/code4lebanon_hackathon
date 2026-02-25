'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface DataItem {
  name: string
  value: number
  color?: string
}

interface HorizontalBarChartProps {
  data: DataItem[]
  color?: string
  height?: number
  showPercentage?: boolean
  maxValue?: number
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)', color: 'var(--text)' }}
    >
      <p className="font-semibold mb-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="font-bold" style={{ color: payload[0].color }}>{payload[0].value}</p>
    </div>
  )
}

export function HorizontalBarChart({
  data,
  color = '#e11d48',
  height,
  showPercentage = false,
}: HorizontalBarChartProps) {
  const h = height ?? Math.max(data.length * 44, 160)

  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
        barSize={10}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: 'var(--muted)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={showPercentage ? (v: number) => `${v}%` : undefined}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: 'var(--text)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="value" radius={[0, 5, 5, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
