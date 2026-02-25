import { BucketAreaChart } from "@/components/dashboard/charts/BucketAreaChart";
import { BucketBarChart } from "@/components/dashboard/charts/BucketBarChart";
import { BucketDonutChart } from "@/components/dashboard/charts/BucketDonutChart";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { EmptyState } from "@/components/dashboard/States";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPIStat } from "@/components/dashboard/KPIStat";
import { getResponses } from "@/lib/api";
import { parseDashboardFilters, type SearchParamsInput } from "@/lib/filters";
import { applyFilters, byDate, countBy, normalizeResponses, topBucket } from "@/lib/selectors";

const selectFilters = [
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
];

export default async function DisseminationPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const [responsesData, params] = await Promise.all([getResponses(), searchParams]);
  const filters = parseDashboardFilters(params);
  const learners = applyFilters(normalizeResponses(responsesData.responses), filters);
  const channelBuckets = countBy(learners, (item) => item.channelType);
  const entityBuckets = countBy(learners, (item) => item.channelEntityName);

  return (
    <div className="dashboard-panel">
      <header>
        <h2 className="section-title">Channel Performance</h2>
        <p className="section-subtitle">Track registration flow, source quality, and entity impact.</p>
      </header>
      <FilterBar selectFilters={selectFilters} />

      <section className="grid-kpi">
        <KPIStat label="Total registrations" value={learners.length} hint="All filtered learners" />
        <KPIStat label="Top channel" value={topBucket(channelBuckets)} hint="Highest-performing source" />
        <KPIStat label="Top entity" value={topBucket(entityBuckets)} hint="Best single partner" />
      </section>

      <section className="grid-charts">
        <ChartCard title="Registrations by channel" subtitle="Interactive distribution by source type">
          {channelBuckets.length ? <BucketDonutChart data={channelBuckets} /> : <EmptyState label="No data for selected filters." />}
        </ChartCard>
        <ChartCard title="Top entities" subtitle="Partner-level contribution drilldown">
          {entityBuckets.length ? <BucketBarChart data={entityBuckets.slice(0, 8)} /> : <EmptyState label="No entities found." />}
        </ChartCard>
        <ChartCard title="Registration trend" subtitle="Daily registration movement">
          {learners.length ? <BucketAreaChart data={byDate(learners)} /> : <EmptyState label="No timeline data." />}
        </ChartCard>
      </section>
    </div>
  );
}
