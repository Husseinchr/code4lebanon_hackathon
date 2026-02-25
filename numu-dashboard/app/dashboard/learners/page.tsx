import { DataTable } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/States";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPIStat } from "@/components/dashboard/KPIStat";
import { getResponses } from "@/lib/api";
import { parseDashboardFilters, type SearchParamsInput } from "@/lib/filters";
import { applyFilters, countBy, normalizeResponses, topBucket } from "@/lib/selectors";

const filtersConfig = [
  {
    key: "track",
    label: "Track",
    options: [
      { value: "all", label: "All tracks" },
      { value: "oracle_technical_leadership", label: "Oracle Technical Leadership" },
      { value: "microsoft_ai_academy", label: "Microsoft AI Academy" },
    ],
  },
  {
    key: "channel",
    label: "Channel",
    options: [
      { value: "all", label: "All channels" },
      { value: "university", label: "University" },
      { value: "employer", label: "Employer" },
      { value: "public_sector", label: "Public Sector" },
      { value: "ngo", label: "NGO" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "region",
    label: "Region",
    options: [
      { value: "all", label: "All regions" },
      { value: "Beirut", label: "Beirut" },
      { value: "Mount Lebanon", label: "Mount Lebanon" },
      { value: "North", label: "North" },
      { value: "South", label: "South" },
      { value: "Bekaa", label: "Bekaa" },
    ],
  },
];

export default async function LearnersPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const [responsesData, params] = await Promise.all([getResponses(), searchParams]);
  const filters = parseDashboardFilters(params);
  const learners = applyFilters(normalizeResponses(responsesData.responses), filters);

  return (
    <div className="dashboard-panel">
      <header>
        <h2 className="section-title">Unified Learner Profile</h2>
        <p className="section-subtitle">Search, segment, and drill into each learner profile.</p>
      </header>
      <FilterBar selectFilters={filtersConfig} />
      <section className="grid-kpi">
        <KPIStat label="Learners in view" value={learners.length} />
        <KPIStat label="Top region" value={topBucket(countBy(learners, (row) => row.region))} />
        <KPIStat label="Top track" value={topBucket(countBy(learners, (row) => row.track))} />
      </section>
      {learners.length ? <DataTable rows={learners} /> : <EmptyState label="No learners match current filters." />}
    </div>
  );
}
