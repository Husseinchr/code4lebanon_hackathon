import { BucketBarChart } from "@/components/dashboard/charts/BucketBarChart";
import { RegionChannelStacked } from "@/components/dashboard/charts/RegionChannelStacked";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { EmptyState } from "@/components/dashboard/States";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KPIStat } from "@/components/dashboard/KPIStat";
import { LebanonLeafletMap } from "@/components/dashboard/LebanonLeafletMap";
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
  const mapRegions = matrix.map((row) => ({
    region: row.region,
    count: row.channels.reduce((sum, channel) => sum + channel.count, 0),
    topChannel: row.channels[0]?.key ?? "N/A",
  }));

  return (
    <div className="dashboard-panel">
      <header>
        <h2 className="section-title">Geographic Insights</h2>
        <p className="section-subtitle">Visualize region performance and channel distribution across Lebanon.</p>
      </header>
      <FilterBar selectFilters={filtersConfig} />

      <section className="grid-kpi">
        <KPIStat label="Total regions active" value={regions.length} hint="Regions with at least one learner" />
        <KPIStat label="Top region" value={topBucket(regions)} hint="Highest registration concentration" />
        <KPIStat label="Lowest region" value={weakest[0] ? `${weakest[0].key} (${weakest[0].count})` : "N/A"} hint="Current opportunity gap" />
      </section>

      <section className="grid-charts">
        <ChartCard title="Lebanon interactive map" subtitle="Hover checkpoints for region details">
          {mapRegions.length ? <LebanonLeafletMap regions={mapRegions} /> : <EmptyState label="No region has responses for selected filters." />}
        </ChartCard>

        <ChartCard title="Registrations by region" subtitle="Comparative regional volume">
          {regions.length ? <BucketBarChart data={regions} color="#0ea5b5" /> : <EmptyState label="No geography data for selected filters." />}
        </ChartCard>

        <ChartCard title="Gap analysis" subtitle="Lowest 3 regions by participation">
          {weakest.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {weakest.map((region, index) => (
                <div key={region.key} className="card" style={{ padding: "0.6rem 0.7rem", boxShadow: "none" }}>
                  #{index + 1} {region.key}: <strong>{region.count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="No regions available." />
          )}
        </ChartCard>

        <ChartCard title="Region x Channel stacked view" subtitle="Channel mix per region">
          {matrix.length ? <RegionChannelStacked matrix={matrix} /> : <EmptyState label="No channel breakdown data." />}
        </ChartCard>
      </section>
    </div>
  );
}
