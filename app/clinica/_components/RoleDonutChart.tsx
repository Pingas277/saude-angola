"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type RoleSlice = { name: string; value: number };

const COLORS = ["#2F74C4", "#5C9CE0", "#E08A4B", "#F0B43C", "#94a3b8"];

export default function RoleDonutChart({
  data,
  total,
}: {
  data: RoleSlice[];
  total: number;
}) {
  const nonEmpty = data.filter((d) => d.value > 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={nonEmpty.length ? nonEmpty : [{ name: "—", value: 1 }]}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={84}
            paddingAngle={2}
            stroke="none"
          >
            {(nonEmpty.length ? nonEmpty : [{ name: "—", value: 1 }]).map(
              (_, i) => (
                <Cell
                  key={i}
                  fill={
                    nonEmpty.length
                      ? COLORS[i % COLORS.length]
                      : "rgba(127,127,127,0.15)"
                  }
                />
              )
            )}
          </Pie>
          {nonEmpty.length > 0 && (
            <Tooltip
              contentStyle={{
                background: "var(--card, white)",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: 8,
                fontSize: 12,
                padding: "6px 10px",
              }}
              labelStyle={{ color: "var(--muted-foreground, #64748b)" }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      {/* Centre label */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-semibold tracking-tight text-foreground">
            {total}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            membros
          </div>
        </div>
      </div>
    </div>
  );
}
