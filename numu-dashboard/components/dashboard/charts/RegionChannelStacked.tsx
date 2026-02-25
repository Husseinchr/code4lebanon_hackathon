"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RegionChannelStackedProps = {
  matrix: { region: string; channels: { key: string; count: number }[] }[];
};

const colors = ["#0ea5b5", "#0f766e", "#f59e0b", "#0284c7", "#7c3aed", "#ef4444"];

export function RegionChannelStacked({ matrix }: RegionChannelStackedProps) {
  const channels = [...new Set(matrix.flatMap((row) => row.channels.map((c) => c.key)))];
  const rows = matrix.map((row) => {
    const result: Record<string, string | number> = { region: row.region };
    for (const channel of channels) {
      result[channel] = row.channels.find((item) => item.key === channel)?.count ?? 0;
    }
    return result;
  });

  return (
    <div style={{ width: "100%", height: 290 }}>
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#dbe7f1" />
          <XAxis dataKey="region" tick={{ fontSize: 12, fill: "#58708b" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#58708b" }} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #c9d8e5" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {channels.map((channel, index) => (
            <Bar key={channel} dataKey={channel} stackId="a" fill={colors[index % colors.length]} radius={index === channels.length - 1 ? [6, 6, 0, 0] : 0} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
