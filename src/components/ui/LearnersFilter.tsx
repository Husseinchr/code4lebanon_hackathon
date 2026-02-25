'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useLang } from '@/lib/lang'

export function LearnersFilter() {
  const router = useRouter()
  const params = useSearchParams()
  const { lang } = useLang()
  const ar = lang === 'ar'

  const CHANNEL_OPTIONS = [
    { value: 'university',    label: ar ? 'جامعة' : 'University' },
    { value: 'public_sector', label: ar ? 'القطاع العام' : 'Public Sector' },
    { value: 'ngo',           label: ar ? 'منظمة غير حكومية' : 'NGO' },
    { value: 'employer',      label: ar ? 'صاحب عمل' : 'Employer' },
    { value: 'other',         label: ar ? 'أخرى' : 'Other' },
  ]

  const TRACK_OPTIONS = [
    { value: 'microsoft_ai_academy',        label: ar ? 'أكاديمية الذكاء الاصطناعي' : 'AI Academy (Microsoft)' },
    { value: 'oracle_technical_leadership', label: ar ? 'القيادة التقنية (Oracle)' : 'Technical Leadership (Oracle)' },
    { value: 'lebanon_coding',              label: ar ? 'لبنان للبرمجة' : 'Lebanon Coding' },
    { value: 'digital_literacy',            label: ar ? 'الثقافة الرقمية' : 'Digital Literacy' },
    { value: 'national_cybersecurity',      label: ar ? 'الأمن السيبراني' : 'Cybersecurity' },
  ]

  const REGION_OPTIONS = [
    { value: 'Beirut',          label: ar ? 'بيروت' : 'Beirut' },
    { value: 'Mount Lebanon',   label: ar ? 'جبل لبنان' : 'Mount Lebanon' },
    { value: 'North Lebanon',   label: ar ? 'شمال لبنان' : 'North Lebanon' },
    { value: 'South Lebanon',   label: ar ? 'جنوب لبنان' : 'South Lebanon' },
    { value: 'Bekaa',           label: ar ? 'البقاع' : 'Bekaa' },
    { value: 'Nabatieh',        label: ar ? 'النبطية' : 'Nabatieh' },
    { value: 'Akkar',           label: ar ? 'عكار' : 'Akkar' },
    { value: 'Baalbek-Hermel',  label: ar ? 'بعلبك-الهرمل' : 'Baalbek-Hermel' },
  ]

  const FILTERS = [
    { key: 'channel', label: ar ? 'القناة' : 'Channel', options: CHANNEL_OPTIONS },
    { key: 'region',  label: ar ? 'المنطقة' : 'Region',  options: REGION_OPTIONS },
    { key: 'track',   label: ar ? 'المسار' : 'Track',   options: TRACK_OPTIONS },
  ]

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    router.push(`/learners?${p.toString()}`)
  }

  return (
    <div
      className="flex flex-wrap gap-3 mb-6 p-4 rounded-2xl"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {FILTERS.map((f) => (
        <div key={f.key} className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{f.label}</label>
          <select
            value={params.get(f.key) ?? ''}
            onChange={(e) => update(f.key, e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              color: 'var(--text)',
            }}
          >
            <option value="">{ar ? 'الكل' : 'All'}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
