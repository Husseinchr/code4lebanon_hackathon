import { api, CHANNEL_COLORS, TRACK_COLORS } from '@/lib/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { GrowthChart } from '@/components/charts/GrowthChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { HorizontalBarChart } from '@/components/charts/HorizontalBarChart'
import { Tr } from '@/lib/lang'
import {
  Activity,
  CheckCircle2,
  Globe,
  MapPin,
  TrendingUp,
  Users,
} from 'lucide-react'

const C = '#e11d48'
const CE = '#10b981'
const CS = '#0ea5e9'
const CI = '#6366f1'

export const revalidate = 30

export default async function OverviewPage() {
  const [summary, dissemination] = await Promise.all([
    api.summary(),
    api.dissemination(),
  ])

  const channelDonut = Object.entries(summary.by_channel).map(([key, count]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value: count as number,
    color: CHANNEL_COLORS[key] ?? '#64748b',
  }))

  const trackBars = Object.entries(summary.by_track).map(([key, count]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value: count as number,
    color: TRACK_COLORS[key] ?? '#6366f1',
  })).sort((a, b) => b.value - a.value)

  const completionPct = Math.round(summary.completion_rate * 100)

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        badge={<Tr en="Live Dashboard" ar="لوحة مباشرة" />}
        title={<Tr en="National Upskilling Initiative" ar="مبادرة التطوير المهني الوطنية" />}
        subtitle={
          <span suppressHydrationWarning>
            <Tr en="Lebanon's Digital & AI transformation" ar="تحول لبنان الرقمي والذكاء الاصطناعي" />
            {' · '}<Tr en="Last updated" ar="آخر تحديث" />
            {' '}{new Date(summary.last_updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label={<Tr en="Total Registrations" ar="إجمالي التسجيلات" />} value={summary.total_registrations} icon={<Users size={18} style={{ color: C }} />} color={C} delay={0} />
        <StatCard label={<Tr en="Completed Surveys" ar="الاستطلاعات المكتملة" />} value={summary.completed_registrations} icon={<CheckCircle2 size={18} style={{ color: CE }} />} color={CE} trend={{ value: completionPct, label: `${completionPct}% rate` }} delay={80} />
        <StatCard label={<Tr en="Regions Covered" ar="المناطق المشمولة" />} value={summary.regions_covered} suffix="/8" icon={<MapPin size={18} style={{ color: CS }} />} color={CS} delay={160} />
        <StatCard label={<Tr en="Active Surveys" ar="الاستطلاعات النشطة" />} value={summary.active_surveys} icon={<Activity size={18} style={{ color: CI }} />} color={CI} delay={240} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <ChartCard
            title={<Tr en="Registration Growth" ar="نمو التسجيلات" />}
            subtitle={<Tr en="Cumulative registrations over time" ar="التسجيلات التراكمية عبر الزمن" />}
          >
            <GrowthChart data={dissemination.growth_over_time} color="#e11d48" height={220} />
          </ChartCard>
        </div>
        <ChartCard title={<Tr en="By Channel" ar="حسب القناة" />} subtitle={<Tr en="Registration source breakdown" ar="توزيع مصادر التسجيل" />}>
          <DonutChart data={channelDonut} height={190} />
          <div className="mt-4 space-y-2">
            {channelDonut.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{d.name}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title={<Tr en="Training Track Demand" ar="الطلب على مسارات التدريب" />} subtitle={<Tr en="Registrations per track" ar="التسجيلات لكل مسار" />}>
          <HorizontalBarChart data={trackBars} height={200} />
        </ChartCard>

        <ChartCard title={<Tr en="Skill Self-Assessment" ar="تقييم المهارات الذاتي" />} subtitle={<Tr en="Digital literacy levels across all registrants" ar="مستويات الثقافة الرقمية لجميع المسجلين" />}>
          <div className="space-y-4 mt-2">
            {Object.entries(summary.skills_distribution).map(([skill, levels]) => {
              const total = Object.values(levels as Record<string, number>).reduce((a, b) => a + b, 0)
              const skillName = skill.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              return (
                <div key={skill}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text)' }}>{skillName}</p>
                  <div className="flex rounded-full overflow-hidden h-2">
                    {['Advanced', 'Intermediate', 'Basic', 'None'].map((lvl) => {
                      const count = (levels as Record<string, number>)[lvl] ?? 0
                      const pct = total > 0 ? (count / total) * 100 : 0
                      const colors: Record<string, string> = {
                        Advanced: '#10b981', Intermediate: '#0ea5e9', Basic: '#f59e0b', None: '#374151',
                      }
                      return (
                        <div
                          key={lvl}
                          style={{ width: `${pct}%`, background: colors[lvl] }}
                          title={`${lvl}: ${count}`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex gap-3 mt-1.5">
                    {['Advanced', 'Intermediate', 'Basic', 'None'].map((lvl) => {
                      const count = (levels as Record<string, number>)[lvl] ?? 0
                      const colors: Record<string, string> = {
                        Advanced: '#10b981', Intermediate: '#0ea5e9', Basic: '#f59e0b', None: '#94a3b8',
                      }
                      return (
                        <div key={lvl} className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors[lvl] }} />
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>{lvl}: {count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </ChartCard>
      </div>

      <div
        className="mt-4 rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'var(--primary-dim)', border: '1px solid rgba(225,29,72,0.3)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--primary)' }}
        >
          <TrendingUp size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            <Tr en="Top performing track:" ar="المسار الأعلى أداءً:" />
            {' '}<span style={{ color: 'var(--primary)' }}>{summary.top_track.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
            &nbsp;·&nbsp;
            <Tr en="Top channel:" ar="القناة الأولى:" />
            {' '}<span style={{ color: 'var(--primary)' }}>{summary.top_channel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {summary.regions_covered} <Tr en="of 8 Lebanese governorates reached" ar="من 8 محافظات لبنانية" />
            {' · '}{completionPct}% <Tr en="completion rate" ar="معدل الإتمام" />
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe size={14} style={{ color: 'var(--muted)' }} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}><Tr en="Live data" ar="بيانات مباشرة" /></span>
        </div>
      </div>
    </div>
  )
}
