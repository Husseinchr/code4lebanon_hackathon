import Link from 'next/link'
import { Suspense } from 'react'
import { api, CHANNEL_COLORS, TRACK_COLORS } from '@/lib/api'
import { Tr } from '@/lib/lang'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusDot } from '@/components/ui/Badge'
import { LearnersFilter } from '@/components/ui/LearnersFilter'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

export const revalidate = 0

interface Props {
  searchParams: {
    page?: string
    channel?: string
    region?: string
    track?: string
  }
}

export default async function LearnersPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page ?? '1', 10)
  const { channel, region, track } = searchParams

  const data = await api.learners({ page, limit: 12, channel, region, track })

  function buildHref(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {}
    if (channel) p.channel = channel
    if (region) p.region = region
    if (track) p.track = track
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === '') delete p[k]
      else p[k] = v
    })
    const qs = new URLSearchParams(p).toString()
    return `/learners${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        badge={<Tr en="Learners" ar="المتعلمون" />}
        title={<Tr en="Learner Directory" ar="دليل المتعلمين" />}
        subtitle={`${data.pagination.total} registrations · Page ${data.pagination.page} of ${data.pagination.total_pages}`}
      />

      <Suspense>
        <LearnersFilter />
      </Suspense>

      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ border: '1px solid var(--border)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Track', 'Channel', 'Region', 'Status', 'Provider', 'Date', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.learners.map((l, i) => (
              <tr
                key={l.id}
                style={{
                  background: i % 2 === 0 ? 'var(--card)' : 'var(--surface)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{l.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{l.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${TRACK_COLORS[l.training_track] ?? '#6366f1'}20`,
                      color: TRACK_COLORS[l.training_track] ?? '#6366f1',
                    }}
                  >
                    {l.track_label.split(',')[0]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: `${CHANNEL_COLORS[l.channel] ?? '#64748b'}20`,
                      color: CHANNEL_COLORS[l.channel] ?? '#64748b',
                    }}
                  >
                    {l.channel_label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                  <div>{l.region}</div>
                  <div>{l.city}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusDot status={l.submission_status as 'completed' | 'partial' | 'pending'} />
                </td>
                <td className="px-4 py-3">
                  {l.provider_badge ? (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: l.provider_badge === 'Microsoft' ? 'rgba(14,165,233,0.15)' : 'rgba(249,115,22,0.15)',
                        color: l.provider_badge === 'Microsoft' ? '#0ea5e9' : '#f97316',
                      }}
                    >
                      {l.provider_badge}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--subtle)' }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(l.registered_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short',
                  })}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/learners/${l.id}`}
                    className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--primary)' }}
                  >
                    View <ExternalLink size={11} />
                  </Link>
                </td>
              </tr>
            ))}
            {data.learners.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  <Tr en="No learners found for this filter combination." ar="لم يُعثر على متعلمين لهذه الفلاتر." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {data.pagination.total === 0 ? '0 results' : (
            <>
              Showing {(data.pagination.page - 1) * 12 + 1}–
              {Math.min(data.pagination.page * 12, data.pagination.total)} of{' '}
              {data.pagination.total}
            </>
          )}
        </p>
        <div className="flex gap-2">
          {data.pagination.has_prev && (
            <Link
              href={buildHref({ page: String(page - 1) })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <ChevronLeft size={14} /> Previous
            </Link>
          )}
          {data.pagination.has_next && (
            <Link
              href={buildHref({ page: String(page + 1) })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              Next <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
