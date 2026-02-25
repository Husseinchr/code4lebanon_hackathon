import { ChartCard } from "@/components/dashboard/ChartCard";
import { EmptyState } from "@/components/dashboard/States";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPIStat } from "@/components/dashboard/KPIStat";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
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
    key: "age_range",
    label: "Age",
    options: [
      { value: "all", label: "All age groups" },
      { value: "18-24", label: "18-24" },
      { value: "25-34", label: "25-34" },
      { value: "35-44", label: "35-44" },
      { value: "45+", label: "45+" },
    ],
  },
  {
    key: "employment_status",
    label: "Employment",
    options: [
      { value: "all", label: "All statuses" },
      { value: "employed", label: "Employed" },
      { value: "student", label: "Student" },
      { value: "freelancer", label: "Freelancer" },
      { value: "self_employed", label: "Self employed" },
      { value: "unemployed", label: "Unemployed" },
    ],
  },
];

export default async function InsightsPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const [responsesData, params] = await Promise.all([getResponses(), searchParams]);
  const filters = parseDashboardFilters(params);
  const learners = applyFilters(normalizeResponses(responsesData.responses), filters);

  const trackDemand = countBy(learners, (item) => item.track);
  const motivations = countBy(
    learners.flatMap((item) => item.motivations.map((motivation) => ({ ...item, motivation }))),
    (item) => item.motivation,
  );
  const aiGoals = countBy(
    learners.flatMap((item) => item.aiGoals.map((goal) => ({ ...item, goal }))),
    (item) => item.goal,
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h2 style={{ margin: 0 }}>Interest & Strategy Insights</h2>
      <FilterBar selectFilters={filtersConfig} />

      <section style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <KPIStat label="Total learners" value={learners.length} />
        <KPIStat label="Top track" value={topBucket(trackDemand)} />
        <KPIStat label="Top motivation" value={topBucket(motivations)} />
      </section>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))" }}>
        <ChartCard title="Training track demand">
          {trackDemand.length ? <SimpleBarChart data={trackDemand} /> : <EmptyState label="No track demand data." />}
        </ChartCard>
        <ChartCard title="Motivations distribution">
          {motivations.length ? <SimpleBarChart data={motivations} /> : <EmptyState label="No motivations data." />}
        </ChartCard>
        <ChartCard title="AI goals distribution">
          {aiGoals.length ? <SimpleBarChart data={aiGoals} /> : <EmptyState label="No AI goals data." />}
        </ChartCard>
      </section>
    </div>
  );
}
