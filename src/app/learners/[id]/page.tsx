import Link from 'next/link'
import { notFound } from 'next/navigation'
import { api, CHANNEL_COLORS, SKILL_COLORS, TRACK_COLORS } from '@/lib/api'
import { StatusDot } from '@/components/ui/Badge'
import { ChartCard } from '@/components/ui/ChartCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  ArrowLeft,
  Award,
  Briefcase,
  Globe,
  Layers,
  Mail,
  MapPin,
  Phone,
  Target,
  User,
} from 'lucide-react'

interface Props {
  params: { id: string }
}

const SKILL_LEVEL_NUM: Record<string, number> = {
  Advanced: 100,
  Intermediate: 65,
  Basic: 35,
  None: 0,
}

export default async function LearnerProfilePage({ params }: Props) {
  let profile
  try {
    profile = await api.learner(params.id)
  } catch {
    notFound()
  }

  const skills = [
    { label: 'Digital Literacy', key: 'digital_literacy', value: profile.skills.digital_literacy },
    { label: 'Cybersecurity',     key: 'cybersecurity',    value: profile.skills.cybersecurity    },
    { label: 'AI Programming',    key: 'ai_programming',   value: profile.skills.ai_programming   },
    { label: 'Data Skills',       key: 'data_skills',      value: profile.skills.data_skills      },
  ]

  const trackColor = TRACK_COLORS[profile.training_track] ?? '#6366f1'
  const channelColor = CHANNEL_COLORS[profile.access_channel] ?? '#64748b'

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/learners"
        className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} /> Back to Learners
      </Link>

      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `linear-gradient(135deg, ${trackColor}, transparent)` }}
        />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold"
              style={{ background: `${trackColor}25`, color: trackColor, border: `1px solid ${trackColor}40` }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{profile.name}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                  <Mail size={11} />{profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                    <Phone size={11} />{profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: `${trackColor}20`, color: trackColor }}
            >
              {profile.track_label}
            </span>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: `${channelColor}20`, color: channelColor }}
            >
              {profile.channel_label}
            </span>
            <StatusDot status={profile.submission_status as 'completed' | 'partial' | 'pending'} />
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          {[
            { icon: User,     label: 'Age Range',    value: profile.age_range.replace(/_/g, ' ') },
            { icon: Briefcase, label: 'Employment',  value: profile.employment_status.replace(/_/g, ' ') },
            { icon: Layers,   label: 'Job Level',    value: profile.job_level.replace(/_/g, ' ') },
            { icon: MapPin,   label: 'Location',     value: `${profile.geo.city}, ${profile.geo.region}` },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl p-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={12} style={{ color: 'var(--muted)' }} />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
              </div>
              <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text)' }}>{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Skill Self-Assessment" subtitle="Reported proficiency levels">
          <div className="space-y-4 mt-2">
            {skills.map((s) => {
              const numVal = SKILL_LEVEL_NUM[s.value] ?? 0
              const color = SKILL_COLORS[s.value] ?? '#64748b'
              return (
                <div key={s.key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{s.label}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}20`, color }}
                    >
                      {s.value || 'None'}
                    </span>
                  </div>
                  <ProgressBar value={numVal} max={100} color={color} height={6} delay={100} />
                </div>
              )
            })}
          </div>
        </ChartCard>

        <ChartCard title="Motivations & Goals" subtitle="Why and what for">
          <div className="space-y-4 mt-2">
            {profile.learning_reason.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Learning Reasons</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.learning_reason.map((r) => (
                    <span
                      key={r}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(225,29,72,0.12)', color: '#e11d48' }}
                    >
                      {r.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.ai_goals.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>AI Goals</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.ai_goals.map((g) => (
                    <span
                      key={g}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}
                    >
                      {g.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Location & Attribution" subtitle="Geographic and UTM data">
          <div className="space-y-3 mt-2">
            {[
              { icon: Globe,  label: 'Country', value: profile.geo.country },
              { icon: MapPin, label: 'Region',  value: profile.geo.region  },
              { icon: MapPin, label: 'City',    value: profile.geo.city    },
            ].filter((r) => r.value).map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(14,165,233,0.12)' }}
                >
                  <Icon size={13} style={{ color: '#0ea5e9' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{value}</p>
                </div>
              </div>
            ))}
            {(profile.utm.source || profile.utm.medium || profile.utm.campaign) && (
              <div
                className="mt-2 p-3 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>UTM Attribution</p>
                {profile.utm.source   && <p className="text-xs" style={{ color: 'var(--text)' }}>Source: <span style={{ color: 'var(--muted)' }}>{profile.utm.source}</span></p>}
                {profile.utm.medium   && <p className="text-xs" style={{ color: 'var(--text)' }}>Medium: <span style={{ color: 'var(--muted)' }}>{profile.utm.medium}</span></p>}
                {profile.utm.campaign && <p className="text-xs" style={{ color: 'var(--text)' }}>Campaign: <span style={{ color: 'var(--muted)' }}>{profile.utm.campaign}</span></p>}
              </div>
            )}
          </div>
        </ChartCard>

        {profile.provider_status ? (
          <ChartCard
            title="Provider Enrollment"
            subtitle={`${profile.provider_status.provider} · ${profile.provider_status.provider_track}`}
          >
            <div className="mt-2">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    background: profile.provider_status.provider === 'Microsoft'
                      ? 'rgba(14,165,233,0.15)'
                      : 'rgba(249,115,22,0.15)',
                    color: profile.provider_status.provider === 'Microsoft' ? '#0ea5e9' : '#f97316',
                  }}
                >
                  <Award size={14} />
                  <span className="text-xs font-bold">{profile.provider_status.provider}</span>
                </div>
                {profile.provider_status.is_certified && (
                  <span
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                  >
                    <Award size={12} /> Certified
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Completion</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                    {profile.provider_status.completion_percentage}%
                  </span>
                </div>
                <ProgressBar
                  value={profile.provider_status.completion_percentage}
                  max={100}
                  color="#10b981"
                  height={8}
                  delay={200}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Modules Done', value: profile.provider_status.modules_completed },
                  { label: 'Total Modules', value: profile.provider_status.total_modules },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
                  </div>
                ))}
              </div>

              {profile.provider_status.last_activity && (
                <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
                  Last activity:{' '}
                  {new Date(profile.provider_status.last_activity).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </ChartCard>
        ) : (
          <ChartCard title="Provider Enrollment" subtitle="No provider data available">
            <div
              className="flex items-center justify-center rounded-xl mt-2"
              style={{ height: 120, background: 'var(--surface)', border: '1px dashed var(--border)' }}
            >
              <div className="text-center">
                <Target size={24} className="mx-auto mb-2" style={{ color: 'var(--border-light)' }} />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>No provider enrollment</p>
              </div>
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}
