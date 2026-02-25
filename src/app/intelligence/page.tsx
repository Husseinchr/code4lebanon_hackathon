import { api } from '@/lib/api'
import { Tr } from '@/lib/lang'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Globe,
  Lightbulb,
  MapPin,
  Radio,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

export const revalidate = 30

/* ─── helpers ─────────────────────────────────────────────── */
const GRADE_COLOR: Record<string, string> = {
  A: '#10b981', B: '#0ea5e9', C: '#f59e0b', D: '#f97316', F: '#e11d48',
}

const STATUS_COLOR: Record<string, string> = {
  good: '#10b981', warning: '#f59e0b', critical: '#e11d48',
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#e11d48', warning: '#f59e0b', info: '#0ea5e9',
}

const PRIORITY_COLOR: Record<string, string> = {
  high: '#e11d48', medium: '#f59e0b', low: '#10b981',
}

const COHORT_COLOR: Record<string, string> = {
  career_climbers: '#6366f1', digital_newcomers: '#0ea5e9', future_builders: '#10b981',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  geographic_gap: <MapPin size={14} />,
  skill_gap:      <Zap size={14} />,
  track_demand:   <BarChart2 size={14} />,
  channel_gap:    <Radio size={14} />,
  program_design: <Lightbulb size={14} />,
}

const ALERT_TYPE_ICONS: Record<string, React.ReactNode> = {
  region_silent:    <MapPin size={14} />,
  skill_mismatch:   <Zap size={14} />,
  track_imbalance:  <BarChart2 size={14} />,
  channel_inactive: <Radio size={14} />,
}

/* ─── Radial Gauge SVG ─────────────────────────────────────── */
function RadialGauge({ score, grade }: { score: number; grade: string }) {
  const r = 70
  const cx = 90
  const cy = 90
  const circumference = 2 * Math.PI * r
  const trackOffset = circumference * (1 - score / 100)
  const gradeColor = GRADE_COLOR[grade] ?? '#94a3b8'

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      {/* track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
      {/* progress */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={gradeColor}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={trackOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 8px ${gradeColor}88)` }}
      />
      {/* score */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text)" fontSize="28" fontWeight="700">
        {score}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="var(--muted)" fontSize="11">
        / 100
      </text>
      {/* grade badge */}
      <text x={cx} y={cy + 36} textAnchor="middle" fill={gradeColor} fontSize="18" fontWeight="800">
        {grade}
      </text>
    </svg>
  )
}

/* ─── Page ─────────────────────────────────────────────────── */
export default async function IntelligencePage() {
  const [readiness, alertsData, recsData, cohortData] = await Promise.all([
    api.programReadiness(),
    api.alerts(),
    api.recommendations(),
    api.cohortProfile(),
  ])

  const criticalAlerts = alertsData.critical ?? 0
  const highPriority   = recsData.summary?.high ?? 0
  const segments       = cohortData.cohorts?.length ?? 0

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        badge={<Tr en="Intelligence" ar="الذكاء التحليلي" />}
        title={<Tr en="Intelligence Hub" ar="مركز الذكاء التحليلي" />}
        subtitle={<Tr
          en="Program readiness, live alerts, recommendations & cohort profiles"
          ar="جاهزية البرنامج، التنبيهات، التوصيات وملفات المجموعات"
        />}
      />

      {/* ── top stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={<Tr en="Readiness Score" ar="درجة الجاهزية" />}
          value={readiness.overall_score}
          icon={<Sparkles size={16} />}
          color="#6366f1"
          suffix="/100"
        />
        <StatCard
          label={<Tr en="Critical Alerts" ar="تنبيهات حرجة" />}
          value={criticalAlerts}
          icon={<AlertTriangle size={16} />}
          color="#e11d48"
        />
        <StatCard
          label={<Tr en="High-Priority Actions" ar="إجراءات ذات أولوية عالية" />}
          value={highPriority}
          icon={<Zap size={16} />}
          color="#f97316"
        />
        <StatCard
          label={<Tr en="Learner Segments" ar="شرائح المتعلمين" />}
          value={segments}
          icon={<Users size={16} />}
          color="#0ea5e9"
        />
      </div>

      {/* ── program readiness ──────────────────────────────── */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            <Tr en="Program Readiness" ar="جاهزية البرنامج" />
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold ms-auto"
            style={{
              background: `${GRADE_COLOR[readiness.grade] ?? '#94a3b8'}22`,
              color: GRADE_COLOR[readiness.grade] ?? '#94a3b8',
            }}
          >
            {readiness.status}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* gauge */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <RadialGauge score={readiness.overall_score} grade={readiness.grade} />
            {readiness.top_blocker && (
              <div
                className="rounded-xl p-3 text-xs max-w-[180px] text-center"
                style={{ background: '#e11d4811', border: '1px solid #e11d4833', color: '#e11d48' }}
              >
                <span className="font-semibold block mb-1">
                  <Tr en="Top Blocker" ar="أبرز عائق" />
                </span>
                {readiness.top_blocker}
              </div>
            )}
          </div>

          {/* dimensions */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {readiness.dimensions?.map((d: {
              name: string; score: number; weight: number;
              status: string; detail: string;
            }) => {
              const sc = STATUS_COLOR[d.status] ?? '#94a3b8'
              return (
                <div
                  key={d.name}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--surface)', border: `1px solid ${sc}44` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{d.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>weight {d.weight}%</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ background: `${sc}22`, color: sc }}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                  {/* score bar */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ background: 'var(--border)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${d.score}%`, background: sc }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8 text-right" style={{ color: sc }}>{d.score}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{d.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── alerts + recommendations ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* alerts */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                <Tr en="Live Alerts" ar="التنبيهات الفورية" />
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              {(['critical', 'warning', 'info'] as const).map((sev) => (
                <span
                  key={sev}
                  className="px-2 py-0.5 rounded-full font-semibold capitalize"
                  style={{ background: `${SEVERITY_COLOR[sev]}22`, color: SEVERITY_COLOR[sev] }}
                >
                  {alertsData[sev]} {sev}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {alertsData.alerts?.map((alert: {
              type: string; severity: string; message: string; action: string;
            }, i: number) => {
              const sc = SEVERITY_COLOR[alert.severity] ?? '#94a3b8'
              return (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{ background: `${sc}0d`, border: `1px solid ${sc}33` }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ color: sc }}>{ALERT_TYPE_ICONS[alert.type]}</span>
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: sc }}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs ms-auto capitalize" style={{ color: 'var(--muted)' }}>
                      {alert.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {alert.message}
                  </p>
                  <p className="text-xs italic" style={{ color: 'var(--muted)' }}>
                    → {alert.action}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* recommendations */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} style={{ color: '#f59e0b' }} />
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                <Tr en="Strategic Recommendations" ar="التوصيات الاستراتيجية" />
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              {(['high', 'medium', 'low'] as const).map((p) => (
                recsData.summary?.[p] > 0 && (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={{ background: `${PRIORITY_COLOR[p]}22`, color: PRIORITY_COLOR[p] }}
                  >
                    {recsData.summary[p]} {p}
                  </span>
                )
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {recsData.recommendations?.map((rec: {
              id: string; category: string; priority: string;
              insight: string; recommendation: string;
            }) => {
              const pc = PRIORITY_COLOR[rec.priority] ?? '#94a3b8'
              return (
                <div
                  key={rec.id}
                  className="rounded-xl p-3"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ color: pc }}>{CATEGORY_ICONS[rec.category] ?? <Globe size={14} />}</span>
                    <span
                      className="text-xs font-bold capitalize"
                      style={{ color: pc }}
                    >
                      {rec.priority}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full ms-auto capitalize"
                      style={{ background: 'var(--border)', color: 'var(--muted)' }}
                    >
                      {rec.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {rec.insight}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {rec.recommendation}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── cohort profiles ────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 mb-2"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Users size={16} style={{ color: '#0ea5e9' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            <Tr en="Learner Cohort Profiles" ar="ملفات مجموعات المتعلمين" />
          </span>
          <span className="text-xs ms-auto" style={{ color: 'var(--muted)' }}>
            {cohortData.total_learners} <Tr en="total" ar="مجموع" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cohortData.cohorts?.map((cohort: {
            id: string; name: string; count: number; percentage: number;
            profile: string; top_track: string; top_channel: string;
            avg_skill_level: string; content_advice: string; recommendation: string;
            regions: Record<string, number>;
          }) => {
            const cc = COHORT_COLOR[cohort.id] ?? '#94a3b8'
            const regionEntries = Object.entries(cohort.regions ?? {})
            const maxRegion = Math.max(...regionEntries.map(([, v]) => v), 1)

            return (
              <div
                key={cohort.id}
                className="rounded-xl p-4"
                style={{ background: 'var(--surface)', border: `1px solid ${cc}44` }}
              >
                {/* header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: cc, boxShadow: `0 0 8px ${cc}88` }}
                      />
                      <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{cohort.name}</span>
                    </div>
                    <p className="text-xs mt-0.5 ms-5" style={{ color: 'var(--muted)' }}>
                      {cohort.count} learners · {cohort.percentage}%
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: `${cc}22`, color: cc }}
                  >
                    {cohort.avg_skill_level}
                  </span>
                </div>

                {/* profile */}
                <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{cohort.profile}</p>

                {/* track + channel badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    🎓 {cohort.top_track}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    📡 {cohort.top_channel.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* content advice */}
                <div
                  className="rounded-lg p-2.5 mb-3 text-xs"
                  style={{ background: `${cc}11`, border: `1px solid ${cc}33` }}
                >
                  <span className="font-semibold block mb-0.5" style={{ color: cc }}>
                    <Tr en="Content advice" ar="نصيحة المحتوى" />
                  </span>
                  <span style={{ color: 'var(--text)' }}>{cohort.content_advice}</span>
                </div>

                {/* recommendation */}
                <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    <Tr en="Recommendation: " ar="توصية: " />
                  </span>
                  {cohort.recommendation}
                </p>

                {/* regional mini-bars */}
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>
                    <Tr en="Regional distribution" ar="التوزيع الجغرافي" />
                  </p>
                  <div className="space-y-1.5">
                    {regionEntries.map(([region, count]) => (
                      <div key={region} className="flex items-center gap-2">
                        <span className="text-xs w-24 flex-shrink-0 truncate" style={{ color: 'var(--muted)' }}>
                          {region}
                        </span>
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--border)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(count / maxRegion) * 100}%`, background: cc }}
                          />
                        </div>
                        <span className="text-xs font-semibold w-4 text-right" style={{ color: 'var(--text)' }}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
