"use client";

import type { Bucket } from "@/lib/types";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BucketAreaChart({ data, height = 260 }: { data: Bucket[]; height?: number }) {
  const rows = data.map((item) => ({ name: item.key, value: item.count }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 10, right: 12, left: -8, bottom: 4 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5b5" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#0ea5b5" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#dbe7f1" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#58708b" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#58708b" }} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #c9d8e5" }} />
          <Area dataKey="value" type="monotone" stroke="#0e7490" strokeWidth={2.5} fill="url(#trendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
