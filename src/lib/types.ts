export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface SkillsDistribution {
  digital_literacy: Record<string, number>
  cybersecurity: Record<string, number>
  ai_programming: Record<string, number>
  data_skills: Record<string, number>
}

export interface SummaryResponse {
  total_registrations: number
  completed_registrations: number
  completion_rate: number
  active_surveys: number
  last_updated: string
  by_channel: Record<string, number>
  by_track: Record<string, number>
  by_region: Record<string, number>
  regions_covered: number
  top_track: string
  top_channel: string
  skills_distribution: SkillsDistribution
}

export interface SubEntity {
  name: string
  count: number
}

export interface GrowthPoint {
  date: string
  count: number
  cumulative: number
}

export interface ChannelBreakdown {
  channel: string
  label: string
  count: number
  percentage: number
  sub_entities: SubEntity[]
  growth: GrowthPoint[]
}

export interface DisseminationResponse {
  total: number
  by_channel: ChannelBreakdown[]
  growth_over_time: GrowthPoint[]
}

export interface TrackDemand {
  track: string
  label: string
  count: number
  percentage: number
}

export interface MotivationItem {
  motivation: string
  label: string
  count: number
  percentage: number
}

export interface AiGoalItem {
  goal: string
  label: string
  count: number
  percentage: number
}

export interface InterestsResponse {
  by_track: TrackDemand[]
  motivations: MotivationItem[]
  ai_goals: AiGoalItem[]
  skill_gaps: Record<string, Record<string, number>>
  age_distribution: Record<string, number>
  employment_status: Record<string, number>
}

export interface CityCount {
  city: string
  count: number
}

export interface RegionStat {
  region: string
  count: number
  percentage: number
  cities: CityCount[]
  is_underrepresented: boolean
}

export interface UnderrepresentedRegion {
  region: string
  count: number
  percentage: number
  gap_from_threshold: number
  recommendation: string
}

export interface GeographyResponse {
  total_regions: number
  covered_regions: number
  coverage_percentage: number
  underrepresented_threshold: number
  regions: RegionStat[]
  underrepresented: UnderrepresentedRegion[]
}

export interface LearnerListItem {
  id: string
  name: string
  email: string
  training_track: string
  track_label: string
  channel: string
  channel_label: string
  region: string
  city: string
  age_range: string
  employment_status: string
  submission_status: string
  registered_at: string
  provider_badge: string | null
}

export interface LearnersResponse {
  learners: LearnerListItem[]
  pagination: PaginationMeta
}

export interface SkillsProfile {
  digital_literacy: string
  cybersecurity: string
  ai_programming: string
  data_skills: string
}

export interface GeoProfile {
  country: string
  region: string
  city: string
}

export interface UtmProfile {
  source: string | null
  medium: string | null
  campaign: string | null
}

export interface ProviderStatus {
  provider: string
  provider_track: string
  enrollment_date: string
  completion_percentage: number
  modules_completed: number
  total_modules: number
  is_certified: boolean
  certificate_id: string | null
  last_activity: string | null
}

export interface LearnerProfile {
  id: string
  name: string
  email: string
  phone: string
  age_range: string
  training_track: string
  track_label: string
  access_channel: string
  channel_label: string
  sub_entity: string | null
  employment_status: string
  job_level: string
  experience_years: string
  learning_reason: string[]
  ai_goals: string[]
  skills: SkillsProfile
  geo: GeoProfile
  utm: UtmProfile
  registered_at: string
  submission_status: string
  provider_status: ProviderStatus | null
}

export interface HealthResponse {
  status: string
  started_at: string
  records_loaded: number
  cache_age_seconds: number | null
}
