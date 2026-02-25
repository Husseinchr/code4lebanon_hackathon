import { BucketBarChart } from "@/components/dashboard/charts/BucketBarChart";
import { BucketDonutChart } from "@/components/dashboard/charts/BucketDonutChart";
import { ChartCard } from "@/components/dashboard/ChartCard";
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
  const ageHistogram = countBy(learners, (item) => item.ageRange);

  return (
    <div className="dashboard-panel">
      <header>
        <h2 className="section-title">Challenges & Strategy Insights</h2>
        <p className="section-subtitle">Understand learner demand, motivations, and readiness profile.</p>
      </header>
      <FilterBar selectFilters={filtersConfig} />

      <section className="grid-kpi">
        <KPIStat label="Total learners" value={learners.length} hint="Filtered cohort" />
        <KPIStat label="Top track" value={topBucket(trackDemand)} hint="Most selected program" />
        <KPIStat label="Top motivation" value={topBucket(motivations)} hint="Primary learner intent" />
      </section>

      <section className="grid-charts">
        <ChartCard title="Track demand" subtitle="Distribution by training track">
          {trackDemand.length ? <BucketDonutChart data={trackDemand} /> : <EmptyState label="No track demand data." />}
        </ChartCard>
        <ChartCard title="Motivations" subtitle="What drives participation">
          {motivations.length ? <BucketBarChart data={motivations} color="#0f766e" /> : <EmptyState label="No motivations data." />}
        </ChartCard>
        <ChartCard title="AI goals" subtitle="Desired outcomes from AI learning">
          {aiGoals.length ? <BucketBarChart data={aiGoals} color="#0284c7" /> : <EmptyState label="No AI goals data." />}
        </ChartCard>
        <ChartCard title="Age histogram" subtitle="Cohort concentration by age range">
          {ageHistogram.length ? <BucketBarChart data={ageHistogram} color="#f59e0b" /> : <EmptyState label="No age distribution data." />}
        </ChartCard>
      </section>
    </div>
  );
}
