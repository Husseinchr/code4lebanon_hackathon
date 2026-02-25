'use client'

import dynamic from 'next/dynamic'
import type { RegionStat } from '@/lib/types'

const LeafletInner = dynamic(
  () =>
    import('./LebanonLeafletMapInner').then((m) => m.LebanonLeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 390,
          border: '1px solid var(--border)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading map…</p>
      </div>
    ),
  },
)

export function LebanonLeafletMap({ regions }: { regions: RegionStat[] }) {
  return <LeafletInner regions={regions} />
}
