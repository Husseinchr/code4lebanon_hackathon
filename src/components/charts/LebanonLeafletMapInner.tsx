'use client'

import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { RegionStat } from '@/lib/types'

const LEBANON_BOUNDS: [[number, number], [number, number]] = [
  [33.0,  35.0],
  [34.75, 36.7],
]

const REGION_COORDS: Record<string, [number, number]> = {
  'Beirut':          [33.8938, 35.5018],
  'Mount Lebanon':   [33.86,   35.62  ],
  'North Lebanon':   [34.4367, 35.8497],
  'South Lebanon':   [33.2705, 35.2038],
  'Bekaa':           [33.8469, 35.902 ],
  'Nabatieh':        [33.3775, 35.4838],
  'Akkar':           [34.5353, 36.0765],
  'Baalbek-Hermel':  [34.0039, 36.2163],
}

function getColor(pct: number, isUnder: boolean): string {
  if (pct === 0)   return '#475569'
  if (isUnder)     return '#f59e0b'
  if (pct >= 30)   return '#e11d48'
  if (pct >= 20)   return '#f97316'
  if (pct >= 10)   return '#10b981'
  return '#0ea5e9'
}

function radiusFromCount(count: number): number {
  if (count === 0)  return 6
  if (count <= 2)   return 9
  if (count <= 5)   return 13
  if (count <= 10)  return 17
  return 21
}

export function LebanonLeafletMapInner({ regions }: { regions: RegionStat[] }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') !== 'light')
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <div
      style={{
        height: 390,
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        bounds={LEBANON_BOUNDS}
        boundsOptions={{ padding: [24, 24] }}
        maxBounds={LEBANON_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={8}
        maxZoom={16}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          key={tileUrl}
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          noWrap
        />

        {regions.map((r) => {
          const coord = REGION_COORDS[r.region]
          if (!coord) return null

          const color  = getColor(r.percentage, r.is_underrepresented)
          const radius = radiusFromCount(r.count)

          return (
            <CircleMarker
              key={r.region}
              center={coord}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: r.count === 0 ? 0.35 : 0.75,
                weight: 2,
              }}
            >
              <Tooltip sticky>
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <strong>{r.region}</strong>
                  <br />
                  {r.count} registrations ({r.percentage}%)
                  {r.is_underrepresented && (
                    <>
                      <br />
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                        ⚠ Underrepresented
                      </span>
                    </>
                  )}
                  {r.count === 0 && (
                    <>
                      <br />
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>No registrations</span>
                    </>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
