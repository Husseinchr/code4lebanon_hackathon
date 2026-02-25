import { api, AGE_LABELS, EMPLOYMENT_LABELS, TRACK_COLORS } from '@/lib/api'
import { Tr } from '@/lib/lang'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { HorizontalBarChart } from '@/components/charts/HorizontalBarChart'
import { SkillGapChart } from '@/components/charts/SkillGapChart'
import { ProgressBar } from '@/components/ui/ProgressBar'

export const revalidate = 30

const MOTIVATION_COLORS = ['#e11d48', '#f97316', '#f59e0b', '#10b981']
const GOAL_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#e11d48']

export default async function InterestsPage() {
  const data = await api.interests()

  const trackBars = data.by_track.map((t) => ({
    name: t.label,
    value: t.count,
    color: TRACK_COLORS[t.track] ?? '#6366f1',
  }))

  const motivationBars = data.motivations.map((m, i) => ({
    name: m.label,
    value: m.count,
    color: MOTIVATION_COLORS[i % MOTIVATION_COLORS.length],
  }))

  const goalBars = data.ai_goals.map((g, i) => ({
    name: g.label,
    value: g.count,
    color: GOAL_COLORS[i % GOAL_COLORS.length],
  }))

  const ageEntries = Object.entries(data.age_distribution).map(([k, v]) => ({
    label: AGE_LABELS[k] ?? k,
    value: v,
  }))
  const maxAge = Math.max(...ageEntries.map((e) => e.value), 1)

  const empEntries = Object.entries(data.employment_status).map(([k, v]) => ({
    label: EMPLOYMENT_LABELS[k] ?? k,
    value: v,
  }))
  const maxEmp = Math.max(...empEntries.map((e) => e.value), 1)

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        badge={<Tr en="Interests" ar="الاهتمامات" />}
        title={<Tr en="Interest & Strategy Insights" ar="رؤى الاهتمامات والاستراتيجية" />}
        subtitle={<Tr en="What learners want to achieve and where skill gaps exist" ar="ما يريد المتعلمون تحقيقه وأين توجد الفجوات المهارية" />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title={<Tr en="Training Track Demand" ar="الطلب على مسارات التدريب" />} subtitle={<Tr en="Registrations per programme" ar="التسجيلات لكل برنامج" />}>
          <HorizontalBarChart data={trackBars} />
        </ChartCard>

        <ChartCard title={<Tr en="Learning Motivations" ar="دوافع التعلم" />} subtitle={<Tr en="Why learners enrolled (multi-select)" ar="لماذا انضم المتعلمون (اختيار متعدد)" />}>
          <HorizontalBarChart data={motivationBars} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 mb-4">
        <ChartCard title={<Tr en="AI Goals" ar="أهداف الذكاء الاصطناعي" />} subtitle={<Tr en="What learners plan to do with AI (multi-select)" ar="ما يخطط المتعلمون لفعله بالذكاء الاصطناعي" />}>
          <HorizontalBarChart data={goalBars} height={goalBars.length * 44} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 mb-4">
        <ChartCard
          title={<Tr en="Skill Gap Analysis" ar="تحليل الفجوات المهارية" />}
          subtitle={<Tr en="Self-assessed skill levels across 4 domains — stacked by proficiency" ar="مستويات المهارات الذاتية عبر 4 مجالات — مرتبة حسب الكفاءة" />}
        >
          <SkillGapChart data={data.skill_gaps} height={260} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title={<Tr en="Age Distribution" ar="التوزيع العمري" />} subtitle={<Tr en="Learner age brackets" ar="الفئات العمرية للمتعلمين" />}>
          <div className="space-y-3 mt-2">
            {ageEntries.map((e) => (
              <div key={e.label} className="flex items-center gap-3">
                <span className="text-xs w-16 flex-shrink-0" style={{ color: 'var(--muted)' }}>{e.label}</span>
                <div className="flex-1">
                  <ProgressBar value={e.value} max={maxAge} color="#6366f1" height={8} delay={200} />
                </div>
                <span className="text-xs font-semibold w-6 text-right" style={{ color: 'var(--text)' }}>
                  {e.value}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title={<Tr en="Employment Status" ar="الحالة الوظيفية" />} subtitle={<Tr en="Learner occupational backgrounds" ar="الخلفيات المهنية للمتعلمين" />}>
          <div className="space-y-3 mt-2">
            {empEntries.map((e) => (
              <div key={e.label} className="flex items-center gap-3">
                <span className="text-xs w-36 flex-shrink-0 truncate" style={{ color: 'var(--muted)' }}>{e.label}</span>
                <div className="flex-1">
                  <ProgressBar value={e.value} max={maxEmp} color="#0ea5e9" height={8} delay={200} />
                </div>
                <span className="text-xs font-semibold w-6 text-right" style={{ color: 'var(--text)' }}>
                  {e.value}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
