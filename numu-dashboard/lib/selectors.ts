import type {
  Bucket,
  DashboardFilters,
  NormalizedLearner,
  ResponseRecord,
} from "@/lib/types";

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function providerFromTrack(track: string): "Oracle" | "Microsoft" | "N/A" {
  if (track === "oracle_technical_leadership") return "Oracle";
  if (track === "microsoft_ai_academy") return "Microsoft";
  return "N/A";
}

function entityByChannel(record: ResponseRecord): string {
  const channel = String(record.responses.access_channel ?? "unknown");
  if (channel === "university") return String(record.responses.university_name ?? "N/A");
  if (channel === "employer") return String(record.responses.employer_name ?? "N/A");
  if (channel === "public_sector") return String(record.responses.public_sector_name ?? "N/A");
  if (channel === "ngo") return String(record.responses.ngo_name ?? "N/A");
  if (channel === "other") return String(record.responses.other_access_channel ?? "N/A");
  return "N/A";
}

export function normalizeResponse(record: ResponseRecord): NormalizedLearner {
  const track = String(record.responses.training_track ?? "unknown");
  return {
    id: record.id,
    surveyId: record.survey_id,
    name: String(record.responses.full_name ?? "Anonymous"),
    email: String(record.responses.email ?? ""),
    phone: String(record.responses.phone ?? ""),
    track,
    channelType: String(record.responses.access_channel ?? "unknown"),
    channelEntityName: entityByChannel(record),
    motivations: toArray(record.responses.learning_reason),
    aiGoals: toArray(record.responses.ai_goals),
    region: String(record.geo_region ?? "Unknown"),
    city: String(record.geo_city ?? "Unknown"),
    submissionDate: record.created_at.slice(0, 10),
    providerBadge: providerFromTrack(track),
    ageRange: String(record.responses.age_range ?? "Unknown"),
    employmentStatus: String(record.responses.employment_status ?? "Unknown"),
    jobLevel: String(record.responses.job_level ?? "Unknown"),
    yearsOfExperience: String(record.responses.years_of_experience ?? "Unknown"),
    selfAssessedSkills: toArray(record.responses.self_assessed_skills),
    utmSource: String(record.utm_source ?? ""),
    utmMedium: String(record.utm_medium ?? ""),
    utmCampaign: String(record.utm_campaign ?? ""),
  };
}

export function normalizeResponses(records: ResponseRecord[]): NormalizedLearner[] {
  return records.map(normalizeResponse);
}

export function applyFilters(records: NormalizedLearner[], filters: DashboardFilters): NormalizedLearner[] {
  return records.filter((item) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const text = `${item.name} ${item.channelEntityName} ${item.region}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    if (filters.track && filters.track !== "all" && item.track !== filters.track) return false;
    if (filters.channel && filters.channel !== "all" && item.channelType !== filters.channel) return false;
    if (filters.region && filters.region !== "all" && item.region !== filters.region) return false;
    if (filters.ageRange && filters.ageRange !== "all" && item.ageRange !== filters.ageRange) return false;
    if (
      filters.employmentStatus &&
      filters.employmentStatus !== "all" &&
      item.employmentStatus !== filters.employmentStatus
    ) {
      return false;
    }
    if (filters.fromDate && item.submissionDate < filters.fromDate) return false;
    if (filters.toDate && item.submissionDate > filters.toDate) return false;
    return true;
  });
}

export function countBy<T>(records: T[], getKey: (record: T) => string): Bucket[] {
  const map = new Map<string, number>();
  for (const record of records) {
    const key = getKey(record) || "Unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function topBucket(buckets: Bucket[]): string {
  if (!buckets.length) return "N/A";
  const top = buckets[0];
  return `${top.key} (${top.count})`;
}

export function lowRegions(records: NormalizedLearner[], n = 3): Bucket[] {
  return countBy(records, (r) => r.region)
    .sort((a, b) => a.count - b.count || a.key.localeCompare(b.key))
    .slice(0, n);
}

export function byDate(records: NormalizedLearner[]): Bucket[] {
  return countBy(records, (r) => r.submissionDate).sort((a, b) => a.key.localeCompare(b.key));
}

export function byRegionChannel(records: NormalizedLearner[]) {
  const regions = [...new Set(records.map((r) => r.region))].sort((a, b) => a.localeCompare(b));
  return regions.map((region) => {
    const subset = records.filter((record) => record.region === region);
    return {
      region,
      channels: countBy(subset, (record) => record.channelType),
    };
  });
}
