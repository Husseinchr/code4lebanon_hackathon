'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { SKILL_COLORS } from '@/lib/api'

interface SkillGapChartProps {
  data: Record<string, Record<string, number>>
  height?: number
}

const SKILL_LABELS: Record<string, string> = {
  digital_literacy: 'Digital Literacy',
  cybersecurity: 'Cybersecurity',
  ai_programming: 'AI Programming',
  data_skills: 'Data Skills',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{ background: 'var(--card)', border: '1px solid var(--border-light)', color: 'var(--text)' }}
    >
      <p className="font-semibold mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function SkillGapChart({ data, height = 240 }: SkillGapChartProps) {
  const chartData = Object.entries(data).map(([key, levels]) => ({
    skill: SKILL_LABELS[key] ?? key,
    ...levels,
  }))

  const levels = ['Advanced', 'Intermediate', 'Basic', 'None']

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={12}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="skill"
          tick={{ fill: 'var(--muted)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: 'var(--muted)', paddingTop: 12 }}
        />
        {levels.map((level) => (
          <Bar key={level} dataKey={level} stackId="a" fill={SKILL_COLORS[level]} radius={level === 'Advanced' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
