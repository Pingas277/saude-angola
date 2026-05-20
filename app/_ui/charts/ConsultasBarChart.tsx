"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ConsultaPoint = { date: string; label: string; total: number };

const BRAND_BLUE = "#2F74C4";

export default function ConsultasBarChart({ data }: { data: ConsultaPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          opacity={0.1}
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={28}
        />
        <Tooltip
          cursor={{ fill: BRAND_BLUE, fillOpacity: 0.08 }}
          contentStyle={{
            background: "var(--card, white)",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: 8,
            fontSize: 12,
            padding: "8px 10px",
          }}
          labelStyle={{ color: "var(--muted-foreground, #64748b)", fontSize: 11 }}
          formatter={(value: number) => [value, "Consultas"]}
        />
        <Bar
          dataKey="total"
          fill={BRAND_BLUE}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
