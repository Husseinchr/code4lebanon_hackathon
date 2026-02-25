import { notFound } from "next/navigation";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { getResponseById } from "@/lib/api";
import { normalizeResponse } from "@/lib/selectors";

export default async function LearnerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResponseById(id).catch(() => null);
  if (!result) {
    notFound();
  }

  const learner = normalizeResponse(result.response);

  return (
    <div className="dashboard-panel">
      <header>
        <h2 className="section-title">{learner.name}</h2>
        <p className="section-subtitle">
          Provider badge:
          {" "}
          <strong>{learner.providerBadge}</strong>
        </p>
      </header>

      <section className="grid-charts">
        <ChartCard title="Contact">
          <p style={line}>Email: {learner.email}</p>
          <p style={line}>Phone: {learner.phone}</p>
        </ChartCard>
        <ChartCard title="Demographics">
          <p style={line}>Age range: {learner.ageRange}</p>
          <p style={line}>Employment: {learner.employmentStatus}</p>
          <p style={line}>Job level: {learner.jobLevel}</p>
          <p style={line}>Experience: {learner.yearsOfExperience}</p>
        </ChartCard>
        <ChartCard title="Program Preferences">
          <p style={line}>Track: {learner.track}</p>
          <p style={line}>Channel: {learner.channelType}</p>
          <p style={line}>Entity: {learner.channelEntityName}</p>
          <p style={line}>Motivations: {learner.motivations.join(", ") || "N/A"}</p>
          <p style={line}>AI goals: {learner.aiGoals.join(", ") || "N/A"}</p>
        </ChartCard>
        <ChartCard title="Skills & Metadata">
          <p style={line}>Skills: {learner.selfAssessedSkills.join(", ") || "N/A"}</p>
          <p style={line}>Region/City: {learner.region} / {learner.city}</p>
          <p style={line}>UTM: {learner.utmSource} / {learner.utmMedium} / {learner.utmCampaign}</p>
          <p style={line}>Submitted: {learner.submissionDate}</p>
        </ChartCard>
      </section>
    </div>
  );
}

const line: React.CSSProperties = {
  margin: "0 0 0.45rem",
};
