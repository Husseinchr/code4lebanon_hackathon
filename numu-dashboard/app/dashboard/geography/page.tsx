import { ChartCard } from "@/components/dashboard/ChartCard";
import { EmptyState } from "@/components/dashboard/States";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPIStat } from "@/components/dashboard/KPIStat";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { getResponses } from "@/lib/api";
import { parseDashboardFilters, type SearchParamsInput } from "@/lib/filters";
import { applyFilters, byRegionChannel, countBy, lowRegions, normalizeResponses, topBucket } from "@/lib/selectors";

const filtersConfig = [
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

export default async function GeographyPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const [responsesData, params] = await Promise.all([getResponses(), searchParams]);
  const filters = parseDashboardFilters(params);
  const learners = applyFilters(normalizeResponses(responsesData.responses), filters);

  const regions = countBy(learners, (item) => item.region);
  const weakest = lowRegions(learners, 3);
  const matrix = byRegionChannel(learners);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h2 style={{ margin: 0 }}>Geographic Insights</h2>
      <FilterBar selectFilters={filtersConfig} />

      <section style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <KPIStat label="Total regions active" value={regions.length} />
        <KPIStat label="Top region" value={topBucket(regions)} />
        <KPIStat label="Lowest region" value={weakest[0] ? `${weakest[0].key} (${weakest[0].count})` : "N/A"} />
      </section>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))" }}>
        <ChartCard title="Registrations by region">
          {regions.length ? <SimpleBarChart data={regions} /> : <EmptyState label="No geography data for selected filters." />}
        </ChartCard>

        <ChartCard title="Gap analysis - lowest 3 regions">
          {weakest.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {weakest.map((region) => (
                <li key={region.key} style={{ marginBottom: 6 }}>
                  {region.key}: {region.count}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No regions available." />
          )}
        </ChartCard>

        <ChartCard title="Region x Channel breakdown">
          {matrix.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {matrix.map((row) => (
                <div key={row.region}>
                  <strong>{row.region}</strong>
                  <p style={{ margin: "0.2rem 0", color: "var(--muted)", fontSize: 13 }}>
                    {row.channels.map((channel) => `${channel.key}: ${channel.count}`).join(" | ") || "No data"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="No channel breakdown data." />
          )}
        </ChartCard>
      </section>
    </div>
  );
}
