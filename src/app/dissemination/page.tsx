import { api, CHANNEL_COLORS } from '@/lib/api'
import { Tr } from '@/lib/lang'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { GrowthChart } from '@/components/charts/GrowthChart'
import { HorizontalBarChart } from '@/components/charts/HorizontalBarChart'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatCard } from '@/components/ui/StatCard'
import { Activity, Radio, Users } from 'lucide-react'

export const revalidate = 30

export default async function DisseminationPage() {
  const data = await api.dissemination()

  const maxCount = Math.max(...data.by_channel.map((c) => c.count), 1)

  const channelBars = data.by_channel.map((c) => ({
    name: c.label,
    value: c.count,
    color: CHANNEL_COLORS[c.channel] ?? '#64748b',
  }))

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        badge={<Tr en="Dissemination" ar="الانتشار" />}
        title={<Tr en="Dissemination Performance" ar="أداء الانتشار" />}
        subtitle={<Tr en="How registrations are reaching learners across Lebanon" ar="كيف تصل التسجيلات إلى المتعلمين عبر لبنان" />}
      />

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard label={<Tr en="Total Registrations" ar="إجمالي التسجيلات" />} value={data.total} icon={<Users size={18} style={{ color: '#e11d48' }} />} color="#e11d48" delay={0} />
        <StatCard label={<Tr en="Active Channels" ar="القنوات النشطة" />} value={data.by_channel.length} icon={<Radio size={18} style={{ color: '#6366f1' }} />} color="#6366f1" delay={80} />
        <StatCard label={<Tr en="Growth Points" ar="نقاط النمو" />} value={data.growth_over_time.length} icon={<Activity size={18} style={{ color: '#10b981' }} />} color="#10b981" delay={160} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <ChartCard title={<Tr en="Cumulative Growth" ar="النمو التراكمي" />} subtitle={<Tr en="Total registrations over time across all channels" ar="إجمالي التسجيلات عبر الزمن لجميع القنوات" />}>
            <GrowthChart data={data.growth_over_time} color="#e11d48" height={240} showCumulative />
          </ChartCard>
        </div>
        <ChartCard title={<Tr en="Channel Breakdown" ar="توزيع القنوات" />} subtitle={<Tr en="Share per access channel" ar="الحصة لكل قناة وصول" />}>
          <HorizontalBarChart data={channelBars} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        {data.by_channel.map((channel) => (
          <ChartCard
            key={channel.channel}
            title={channel.label}
            subtitle={`${channel.count} registrations · ${channel.percentage}% of total`}
            action={
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: `${CHANNEL_COLORS[channel.channel] ?? '#64748b'}20`,
                  color: CHANNEL_COLORS[channel.channel] ?? '#64748b',
                }}
              >
                {channel.percentage}%
              </span>
            }
          >
            <ProgressBar
              value={channel.count}
              max={maxCount}
              color={CHANNEL_COLORS[channel.channel] ?? '#64748b'}
              height={6}
              delay={200}
            />

            {channel.sub_entities.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>
                  <Tr en="Top sub-entities" ar="أبرز الكيانات الفرعية" />
                </p>
                <div className="space-y-2.5">
                  {channel.sub_entities.slice(0, 5).map((se) => (
                    <div key={se.name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: 'var(--text)' }}>{se.name}</p>
                      </div>
                      <ProgressBar
                        value={se.count}
                        max={channel.count}
                        color={CHANNEL_COLORS[channel.channel] ?? '#64748b'}
                        height={4}
                      />
                      <span className="text-xs font-semibold w-5 text-right" style={{ color: 'var(--text)' }}>
                        {se.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {channel.growth.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}><Tr en="Growth trend" ar="اتجاه النمو" /></p>
                <GrowthChart
                  data={channel.growth}
                  color={CHANNEL_COLORS[channel.channel] ?? '#64748b'}
                  height={120}
                  showCumulative={false}
                />
              </div>
            )}
          </ChartCard>
        ))}
      </div>

      <ChartCard title={<Tr en="Daily New Registrations" ar="التسجيلات اليومية الجديدة" />} subtitle={<Tr en="Day-by-day registration activity" ar="نشاط التسجيل يوماً بيوم" />}>
        <GrowthChart data={data.growth_over_time} color="#0ea5e9" height={200} showCumulative={false} />
      </ChartCard>
    </div>
  )
}
