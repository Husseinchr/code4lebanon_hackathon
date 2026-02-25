import type { DashboardFilters } from "@/lib/types";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

function pick(params: SearchParamsInput, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseDashboardFilters(searchParams: SearchParamsInput): DashboardFilters {
  return {
    q: pick(searchParams, "q"),
    track: pick(searchParams, "track"),
    channel: pick(searchParams, "channel"),
    region: pick(searchParams, "region"),
    ageRange: pick(searchParams, "age_range"),
    employmentStatus: pick(searchParams, "employment_status"),
    fromDate: pick(searchParams, "from"),
    toDate: pick(searchParams, "to"),
  };
}
