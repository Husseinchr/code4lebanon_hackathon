import Link from "next/link";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPIStat } from "@/components/dashboard/KPIStat";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { getLastResponseDate, getResponses } from "@/lib/api";
import { parseDashboardFilters, type SearchParamsInput } from "@/lib/filters";
import { applyFilters, byDate, countBy, normalizeResponses, topBucket } from "@/lib/selectors";

const pageFilters = [
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

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const [responsesData, lastResponseData, params] = await Promise.all([getResponses(), getLastResponseDate(), searchParams]);
  const filters = parseDashboardFilters(params);
  const normalized = applyFilters(normalizeResponses(responsesData.responses), filters);
  const byTrack = countBy(normalized, (item) => item.track);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <header>
        <h2 style={{ margin: 0 }}>Dashboard Overview</h2>
        <p style={{ margin: "0.3rem 0 0", color: "var(--muted)" }}>
          Last response date: {lastResponseData.last_response_date?.slice(0, 10) ?? "N/A"}
        </p>
      </header>

      <FilterBar selectFilters={pageFilters} />

      <section style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <KPIStat label="Total registrations" value={normalized.length} />
        <KPIStat label="Top track" value={topBucket(byTrack)} />
        <KPIStat label="Top region" value={topBucket(countBy(normalized, (item) => item.region))} />
      </section>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <ChartCard title="Registrations over time">
          <SimpleBarChart data={byDate(normalized)} />
        </ChartCard>
        <ChartCard title="Quick access">
          <div style={{ display: "grid", gap: 8 }}>
            <Link href="/dashboard/dissemination" style={quickLink}>Dissemination Performance</Link>
            <Link href="/dashboard/insights" style={quickLink}>Interest & Strategy Insights</Link>
            <Link href="/dashboard/geography" style={quickLink}>Geographic Insights</Link>
            <Link href="/dashboard/learners" style={quickLink}>Unified Learner Profile</Link>
          </div>
        </ChartCard>
      </section>
    </div>
  );
}

const quickLink: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "0.7rem",
  background: "#fff",
};
