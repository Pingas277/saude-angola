"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type RevenuePoint = { date: string; label: string; amount: number };

const BRAND_BLUE = "#2F74C4";
const BRAND_BLUE_LIGHT = "#5C9CE0";

function fmtAOA(n: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RevenueAreaChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_BLUE} stopOpacity={0.4} />
            <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity={0} />
          </linearGradient>
        </defs>
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
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1_000_000
              ? `${(v / 1_000_000).toFixed(1)}M`
              : v >= 1_000
                ? `${Math.round(v / 1_000)}k`
                : String(v)
          }
          width={48}
        />
        <Tooltip
          cursor={{ stroke: BRAND_BLUE_LIGHT, strokeDasharray: "3 3" }}
          contentStyle={{
            background: "var(--card, white)",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: 8,
            fontSize: 12,
            padding: "8px 10px",
          }}
          labelStyle={{ color: "var(--muted-foreground, #64748b)", fontSize: 11 }}
          formatter={(value: number) => [fmtAOA(value), "Recebido"]}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke={BRAND_BLUE}
          strokeWidth={2}
          fill="url(#rev-fill)"
          dot={false}
          activeDot={{
            r: 4,
            fill: BRAND_BLUE,
            stroke: "var(--background, white)",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
