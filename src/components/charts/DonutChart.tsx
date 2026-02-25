'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface DonutItem {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutItem[]
  height?: number
  innerRadius?: number
  outerRadius?: number
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)', color: 'var(--text)' }}
    >
      <p className="font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
      <p className="font-bold">{payload[0].value}</p>
    </div>
  )
}

export function DonutChart({
  data,
  height = 200,
  innerRadius = 55,
  outerRadius = 80,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ top: 0 }}
      >
        <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          {total.toLocaleString()}
        </span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>total</span>
      </div>
    </div>
  )
}
