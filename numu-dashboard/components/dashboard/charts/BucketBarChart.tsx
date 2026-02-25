"use client";

import type { Bucket } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BucketBarChart({ data, color = "#0ea5b5", height = 260 }: { data: Bucket[]; color?: string; height?: number }) {
  const rows = data.map((item) => ({ name: item.key, value: item.count }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 8, right: 12, left: -8, bottom: 6 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#dbe7f1" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#58708b" }} interval={0} angle={-12} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#58708b" }} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #c9d8e5" }} />
          <Bar dataKey="value" fill={color} radius={[8, 8, 3, 3]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
