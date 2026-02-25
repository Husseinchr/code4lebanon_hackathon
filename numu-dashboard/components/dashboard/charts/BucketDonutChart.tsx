"use client";

import type { Bucket } from "@/lib/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const palette = ["#0ea5b5", "#0f766e", "#f59e0b", "#7c3aed", "#0284c7", "#ef4444", "#64748b"];

export function BucketDonutChart({ data, height = 260 }: { data: Bucket[]; height?: number }) {
  const rows = data.map((item) => ({ name: item.key, value: item.count }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={92} paddingAngle={2}>
            {rows.map((item, index) => (
              <Cell key={item.name} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #c9d8e5" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
