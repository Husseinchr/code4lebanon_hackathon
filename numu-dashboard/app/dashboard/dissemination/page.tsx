import { ChartCard } from "@/components/dashboard/ChartCard";
import { EmptyState } from "@/components/dashboard/States";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPIStat } from "@/components/dashboard/KPIStat";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
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

export default async function DisseminationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const [responsesData, params] = await Promise.all([getResponses(), searchParams]);
  const filters = parseDashboardFilters(params);
  const learners = applyFilters(normalizeResponses(responsesData.responses), filters);
  const channelBuckets = countBy(learners, (item) => item.channelType);
  const entityBuckets = countBy(learners, (item) => item.channelEntityName);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h2 style={{ margin: 0 }}>Dissemination Performance</h2>
      <FilterBar selectFilters={selectFilters} />

      <section style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <KPIStat label="Total registrations" value={learners.length} />
        <KPIStat label="Top channel" value={topBucket(channelBuckets)} />
        <KPIStat label="Top entity" value={topBucket(entityBuckets)} />
      </section>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))" }}>
        <ChartCard title="Registrations by channel type" subtitle="Apply a channel filter for entity drilldown">
          {channelBuckets.length ? <SimpleBarChart data={channelBuckets} /> : <EmptyState label="No data for selected filters." />}
        </ChartCard>
        <ChartCard title="Top entities">
          {entityBuckets.length ? <SimpleBarChart data={entityBuckets.slice(0, 7)} /> : <EmptyState label="No entities found." />}
        </ChartCard>
        <ChartCard title="Registrations over time">
          {learners.length ? <SimpleBarChart data={byDate(learners)} /> : <EmptyState label="No timeline data." />}
        </ChartCard>
      </section>
    </div>
  );
}
