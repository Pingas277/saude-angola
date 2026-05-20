"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

// Tiny inline trend. Pass `data` as an array of {v:number}; meant to sit
// inside KPI tiles (height ~32px). Use over coloured backgrounds with the
// `stroke` prop (defaults to white).
export default function Sparkline({
  data,
  stroke = "#ffffff",
  fill = "rgba(255,255,255,0.25)",
  height = 36,
}: {
  data: { v: number }[];
  stroke?: string;
  fill?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sp-${stroke.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={2}
          fill={fill === "auto" ? `url(#sp-${stroke.replace(/[^a-z0-9]/gi, "")})` : fill}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
