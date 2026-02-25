import type { Bucket } from "@/lib/types";

type SimpleBarChartProps = {
  data: Bucket[];
};

export function SimpleBarChart({ data }: SimpleBarChartProps) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {data.map((item) => (
        <div key={item.key}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span>{item.key}</span>
            <strong>{item.count}</strong>
          </div>
          <div style={{ marginTop: 4, width: "100%", height: 10, borderRadius: 999, background: "#e9eff4" }}>
            <div
              style={{
                width: `${(item.count / max) * 100}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, var(--brand), #0a9396)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
