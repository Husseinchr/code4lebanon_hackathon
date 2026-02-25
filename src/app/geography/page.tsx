import { api } from '@/lib/api'
import { Tr } from '@/lib/lang'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { StatCard } from '@/components/ui/StatCard'
import { LebanonMap } from '@/components/charts/LebanonMap'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AlertTriangle, Globe, MapPin, TrendingUp } from 'lucide-react'

export const revalidate = 30

export default async function GeographyPage() {
  const data = await api.geography()

  const maxCount = Math.max(...data.regions.map((r) => r.count), 1)

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        badge={<Tr en="Geography" ar="الجغرافيا" />}
        title={<Tr en="Geographic Insights" ar="رؤى جغرافية" />}
        subtitle={<Tr en="Regional reach and coverage across Lebanon's 8 governorates" ar="الوصول الإقليمي والتغطية عبر محافظات لبنان الثماني" />}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label={<Tr en="Total Regions" ar="إجمالي المناطق" />} value={data.total_regions} icon={<Globe size={18} style={{ color: '#0ea5e9' }} />} color="#0ea5e9" delay={0} />
        <StatCard label={<Tr en="Regions Covered" ar="المناطق المشمولة" />} value={data.covered_regions} icon={<MapPin size={18} style={{ color: '#10b981' }} />} color="#10b981" delay={80} />
        <StatCard label={<Tr en="Coverage" ar="نسبة التغطية" />} value={data.coverage_percentage} suffix="%" icon={<TrendingUp size={18} style={{ color: '#6366f1' }} />} color="#6366f1" delay={160} />
        <StatCard label={<Tr en="Underrepresented" ar="ممثلة بشكل ناقص" />} value={data.underrepresented.length} icon={<AlertTriangle size={18} style={{ color: '#f59e0b' }} />} color="#f59e0b" delay={240} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title={<Tr en="Lebanon — Registration Heatmap" ar="لبنان — خريطة حرارة التسجيلات" />} subtitle={<Tr en="Click a region to explore" ar="انقر على منطقة للاستكشاف" />}>
          <LebanonMap regions={data.regions} />
        </ChartCard>

        <ChartCard title={<Tr en="Registration by Region" ar="التسجيلات حسب المنطقة" />} subtitle={<Tr en="Sorted by count" ar="مرتبة حسب العدد" />}>
          <div className="space-y-3 mt-2">
            {data.regions.filter((r) => r.count > 0).map((r) => (
              <div key={r.region}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.region}</span>
                    {r.is_underrepresented && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                      >
                        <Tr en="low" ar="منخفض" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{r.percentage}%</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{r.count}</span>
                  </div>
                </div>
                <ProgressBar
                  value={r.count}
                  max={maxCount}
                  color={r.is_underrepresented ? '#f59e0b' : '#10b981'}
                  height={6}
                  delay={200}
                />
                {r.cities.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {r.cities.map((c) => `${c.city} (${c.count})`).join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {data.underrepresented.length > 0 && (
        <ChartCard
          title={<Tr en="Outreach Recommendations" ar="توصيات التوعية" />}
          subtitle={`${data.underrepresented.length} regions below the ${data.underrepresented_threshold}% threshold`}
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-2">
            {data.underrepresented.map((r) => (
              <div
                key={r.region}
                className="rounded-xl p-4"
                style={{ background: 'var(--surface)', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{r.region}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {r.count} <Tr en="registrations" ar="تسجيلات" /> · {r.percentage}%
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(245,158,11,0.15)' }}
                  >
                    <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
                    <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>
                      -{r.gap_from_threshold}%
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {r.recommendation}
                </p>
                <div className="mt-3">
                  <ProgressBar
                    value={r.percentage}
                    max={data.underrepresented_threshold}
                    color="#f59e0b"
                    height={4}
                    delay={300}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {r.percentage}% / {data.underrepresented_threshold}% threshold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  )
}
