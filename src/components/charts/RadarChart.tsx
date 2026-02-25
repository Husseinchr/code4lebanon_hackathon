'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarDataPoint {
  subject: string
  value: number
  fullMark?: number
}

interface RadarChartProps {
  data: RadarDataPoint[]
  color?: string
  height?: number
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)', color: 'var(--text)' }}
    >
      <p className="font-semibold">{payload[0].payload.subject}</p>
      <p style={{ color: payload[0].color }}>{payload[0].value}%</p>
    </div>
  )
}

export function RadarChartComponent({ data, color = '#e11d48', height = 240 }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 10 }} />
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
