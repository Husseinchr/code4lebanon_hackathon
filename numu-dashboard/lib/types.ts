export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  has_next_page: boolean;
};

export type SurveyField = {
  key: string;
  type: string;
  label: string;
  required: boolean;
};

export type SurveySection = {
  id: string;
  title: string;
  fields: SurveyField[];
};

export type SurveySchema = {
  sections: SurveySection[];
};

export type Survey = {
  id: string;
  slug: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  schema: SurveySchema;
};

export type RawResponsesPayload = {
  full_name?: string;
  email?: string;
  phone?: string;
  access_channel?: string;
  university_name?: string;
  employer_name?: string;
  public_sector_name?: string;
  ngo_name?: string;
  other_access_channel?: string;
  training_track?: string;
  learning_reason?: string[] | string;
  ai_goals?: string[] | string;
  age_range?: string;
  employment_status?: string;
  job_level?: string;
  years_of_experience?: string;
  self_assessed_skills?: string[] | string;
  [key: string]: unknown;
};

export type ResponseRecord = {
  id: string;
  survey_id: string;
  created_at: string;
  updated_at: string;
  geo_region?: string;
  geo_city?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  responses: RawResponsesPayload;
};

export type ResponsesListData = {
  responses: ResponseRecord[];
  pagination: Pagination;
};

export type NormalizedLearner = {
  id: string;
  surveyId: string;
  name: string;
  email: string;
  phone: string;
  track: string;
  channelType: string;
  channelEntityName: string;
  motivations: string[];
  aiGoals: string[];
  region: string;
  city: string;
  submissionDate: string;
  providerBadge: "Oracle" | "Microsoft" | "N/A";
  ageRange: string;
  employmentStatus: string;
  jobLevel: string;
  yearsOfExperience: string;
  selfAssessedSkills: string[];
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

export type DashboardFilters = {
  q?: string;
  track?: string;
  channel?: string;
  region?: string;
  ageRange?: string;
  employmentStatus?: string;
  fromDate?: string;
  toDate?: string;
};

export type Bucket = {
  key: string;
  count: number;
};
