import Link from "next/link";
import type { NormalizedLearner } from "@/lib/types";

type DataTableProps = {
  rows: NormalizedLearner[];
};

export function DataTable({ rows }: DataTableProps) {
  return (
    <div
      className="card"
      style={{
        overflowX: "auto",
        background: "linear-gradient(180deg, #ffffff 0%, #f9fcff 100%)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
        <thead>
          <tr style={{ textAlign: "left", background: "#f0f7fb" }}>
            {["Name", "Track", "Channel", "Entity", "Region", "Date", "Provider", "Profile"].map((header) => (
              <th
                key={header}
                style={{
                  padding: "0.8rem",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((learner) => (
            <tr key={learner.id} style={{ background: learner.providerBadge === "Oracle" ? "#fff" : "#fbfdff" }}>
              <td style={cellPrimary}>{learner.name}</td>
              <td style={cell}>{learner.track}</td>
              <td style={cell}>{learner.channelType}</td>
              <td style={cell}>{learner.channelEntityName}</td>
              <td style={cell}>{learner.region}</td>
              <td style={cell}>{learner.submissionDate}</td>
              <td style={cell}>{learner.providerBadge}</td>
              <td style={cell}>
                <Link href={`/dashboard/learner/${learner.id}`} style={{ color: "var(--brand)", fontWeight: 700 }}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cell: React.CSSProperties = {
  padding: "0.72rem 0.8rem",
  borderBottom: "1px solid #e6edf4",
  fontSize: 13,
};

const cellPrimary: React.CSSProperties = {
  ...cell,
  fontWeight: 650,
};
