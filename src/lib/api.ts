import type {
  DisseminationResponse,
  GeographyResponse,
  HealthResponse,
  InterestsResponse,
  LearnerProfile,
  LearnersResponse,
  SummaryResponse,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const api = {
  health: () => get<HealthResponse>('/health'),

  summary: () => get<SummaryResponse>('/api/summary'),

  dissemination: (channel?: string) =>
    get<DisseminationResponse>(
      `/api/dissemination${channel ? `?channel=${channel}` : ''}`
    ),

  interests: (params?: { channel?: string; region?: string }) => {
    const q = new URLSearchParams()
    if (params?.channel) q.set('channel', params.channel)
    if (params?.region) q.set('region', params.region)
    const qs = q.toString()
    return get<InterestsResponse>(`/api/interests${qs ? `?${qs}` : ''}`)
  },

  geography: () => get<GeographyResponse>('/api/geography'),

  learners: (params?: {
    page?: number
    limit?: number
    channel?: string
    region?: string
    track?: string
  }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.channel) q.set('channel', params.channel)
    if (params?.region) q.set('region', params.region)
    if (params?.track) q.set('track', params.track)
    const qs = q.toString()
    return get<LearnersResponse>(`/api/learners${qs ? `?${qs}` : ''}`)
  },

  learner: (id: string) => get<LearnerProfile>(`/api/learner/${id}`),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  programReadiness: () => get<any>('/api/program-readiness'),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  alerts: (params?: { severity?: string }) => {
    const q = new URLSearchParams()
    if (params?.severity) q.set('severity', params.severity)
    const qs = q.toString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return get<any>(`/api/alerts${qs ? `?${qs}` : ''}`)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: (params?: { priority?: string; category?: string }) => {
    const q = new URLSearchParams()
    if (params?.priority) q.set('priority', params.priority)
    if (params?.category) q.set('category', params.category)
    const qs = q.toString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return get<any>(`/api/recommendations${qs ? `?${qs}` : ''}`)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cohortProfile: () => get<any>('/api/cohort-profile'),
}

export const TRACK_COLORS: Record<string, string> = {
  microsoft_ai_academy: '#0ea5e9',
  oracle_technical_leadership: '#f97316',
  lebanon_coding: '#8b5cf6',
  digital_literacy: '#10b981',
  national_cybersecurity: '#e11d48',
}

export const CHANNEL_COLORS: Record<string, string> = {
  university: '#6366f1',
  public_sector: '#0ea5e9',
  ngo: '#10b981',
  employer: '#f59e0b',
  other: '#94a3b8',
}

export const SKILL_COLORS: Record<string, string> = {
  Advanced: '#10b981',
  Intermediate: '#0ea5e9',
  Basic: '#f59e0b',
  None: '#374151',
}

export const AGE_LABELS: Record<string, string> = {
  under_18: 'Under 18',
  '18_24': '18–24',
  '25_34': '25–34',
  '35_44': '35–44',
  '45_54': '45–54',
  '55_plus': '55+',
}

export const EMPLOYMENT_LABELS: Record<string, string> = {
  student: 'Student',
  full_time: 'Employed full-time',
  part_time: 'Employed part-time',
  freelancer: 'Freelancer',
  entrepreneur: 'Entrepreneur',
  not_working: 'Not working',
}
