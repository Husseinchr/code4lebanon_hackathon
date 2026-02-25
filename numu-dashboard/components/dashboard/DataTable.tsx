import Link from "next/link";
import type { NormalizedLearner } from "@/lib/types";

type DataTableProps = {
  rows: NormalizedLearner[];
};

export function DataTable({ rows }: DataTableProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 14,
        background: "var(--surface)",
        overflowX: "auto",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
        <thead>
          <tr style={{ textAlign: "left", background: "#f8fafc" }}>
            {["Name", "Track", "Channel", "Entity", "Region", "Date", "Provider", "Profile"].map((header) => (
              <th key={header} style={{ padding: "0.7rem", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((learner) => (
            <tr key={learner.id}>
              <td style={cell}>{learner.name}</td>
              <td style={cell}>{learner.track}</td>
              <td style={cell}>{learner.channelType}</td>
              <td style={cell}>{learner.channelEntityName}</td>
              <td style={cell}>{learner.region}</td>
              <td style={cell}>{learner.submissionDate}</td>
              <td style={cell}>{learner.providerBadge}</td>
              <td style={cell}>
                <Link href={`/dashboard/learner/${learner.id}`} style={{ color: "var(--brand)", fontWeight: 600 }}>
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
  padding: "0.7rem",
  borderBottom: "1px solid #edf2f7",
  fontSize: 14,
};
