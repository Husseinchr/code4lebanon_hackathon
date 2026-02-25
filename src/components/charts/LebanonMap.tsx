'use client'

import { useState } from 'react'
import type { RegionStat } from '@/lib/types'

interface LebanonMapProps {
  regions: RegionStat[]
  onRegionClick?: (region: string) => void
  selectedRegion?: string | null
}

const REGION_PATHS: Record<string, string> = {
  'Akkar': 'M 148 20 L 210 18 L 230 35 L 225 55 L 200 62 L 175 58 L 155 65 L 140 55 L 135 40 Z',
  'North Lebanon': 'M 90 45 L 148 20 L 140 55 L 155 65 L 145 85 L 118 90 L 95 80 L 80 65 L 82 50 Z',
  'Baalbek-Hermel': 'M 200 62 L 230 35 L 270 40 L 290 65 L 285 100 L 265 120 L 240 130 L 215 125 L 200 105 L 200 80 Z',
  'Mount Lebanon': 'M 75 90 L 95 80 L 118 90 L 145 85 L 160 100 L 155 130 L 140 148 L 118 155 L 95 148 L 78 135 L 68 115 Z',
  'Beirut': 'M 68 115 L 78 135 L 72 145 L 58 140 L 55 125 Z',
  'Bekaa': 'M 155 85 L 200 80 L 200 105 L 215 125 L 210 150 L 195 170 L 175 175 L 158 160 L 152 140 L 148 115 Z',
  'Nabatieh': 'M 95 148 L 118 155 L 140 148 L 148 165 L 145 185 L 128 195 L 105 195 L 88 182 L 83 165 Z',
  'South Lebanon': 'M 55 145 L 72 145 L 78 135 L 95 148 L 83 165 L 88 182 L 75 195 L 55 200 L 40 185 L 38 165 L 45 150 Z',
}

const REGION_LABEL_POS: Record<string, [number, number]> = {
  'Akkar':           [183, 42],
  'North Lebanon':   [111, 62],
  'Baalbek-Hermel':  [245, 85],
  'Mount Lebanon':   [110, 120],
  'Beirut':          [63, 130],
  'Bekaa':           [181, 128],
  'Nabatieh':        [116, 172],
  'South Lebanon':   [62, 175],
}

function getColor(pct: number, isUnder: boolean): string {
  if (pct === 0) return 'var(--border)'
  if (isUnder) return '#f59e0b'
  if (pct >= 30) return '#e11d48'
  if (pct >= 20) return '#f97316'
  if (pct >= 10) return '#10b981'
  return '#0ea5e9'
}

export function LebanonMap({ regions, onRegionClick, selectedRegion }: LebanonMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; region: RegionStat } | null>(null)

  const regionMap = Object.fromEntries(regions.map((r) => [r.region, r]))

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 50 340 180"
        className="w-full"
        style={{ maxHeight: 340 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {Object.entries(REGION_PATHS).map(([name, path]) => {
          const stat = regionMap[name]
          const isSelected = selectedRegion === name
          const isHovered = hovered === name
          const color = stat ? getColor(stat.percentage, stat.is_underrepresented) : 'var(--border)'
          const opacity = stat?.count === 0 ? 0.3 : isHovered || isSelected ? 1 : 0.75

          return (
            <g key={name}>
              <path
                d={path}
                fill={color}
                fillOpacity={opacity}
                stroke={isSelected ? '#fff' : isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isSelected ? 2 : 1}
                style={{ cursor: onRegionClick ? 'pointer' : 'default', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => {
                  setHovered(name)
                  if (stat) {
                    const rect = (e.target as SVGPathElement).ownerSVGElement!.getBoundingClientRect()
                    setTooltip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      region: stat,
                    })
                  }
                }}
                onMouseLeave={() => { setHovered(null); setTooltip(null) }}
                onClick={() => onRegionClick?.(name)}
              />
              {REGION_LABEL_POS[name] && (
                <text
                  x={REGION_LABEL_POS[name][0]}
                  y={REGION_LABEL_POS[name][1]}
                  textAnchor="middle"
                  fontSize={name === 'Beirut' ? 6 : 8}
                  fill="rgba(255,255,255,0.85)"
                  fontWeight="600"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {name === 'Baalbek-Hermel' ? 'B-Hermel' : name.split(' ')[0]}
                  {stat && stat.count > 0 && (
                    <>
                    </>
                  )}
                </text>
              )}
              {REGION_LABEL_POS[name] && stat && stat.count > 0 && (
                <text
                  x={REGION_LABEL_POS[name][0]}
                  y={REGION_LABEL_POS[name][1] + 10}
                  textAnchor="middle"
                  fontSize={8}
                  fill="rgba(255,255,255,0.6)"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {stat.percentage}%
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {tooltip && (
        <div
          className="absolute z-10 px-3 py-2 rounded-lg pointer-events-none text-xs"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            background: 'var(--card)',
            border: '1px solid var(--border-light)',
            color: 'var(--text)',
            maxWidth: 180,
          }}
        >
          <p className="font-bold">{tooltip.region.region}</p>
          <p style={{ color: 'var(--muted)' }}>{tooltip.region.count} registrations</p>
          <p style={{ color: 'var(--muted)' }}>{tooltip.region.percentage}% of total</p>
          {tooltip.region.is_underrepresented && (
            <p className="mt-1 font-semibold" style={{ color: '#f59e0b' }}>⚠ Underrepresented</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          { color: '#e11d48', label: '≥ 30%' },
          { color: '#f97316', label: '20–30%' },
          { color: '#10b981', label: '10–20%' },
          { color: '#0ea5e9', label: '< 10%' },
          { color: '#f59e0b', label: 'Underrep.' },
          { color: 'var(--border)', label: 'No data' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
