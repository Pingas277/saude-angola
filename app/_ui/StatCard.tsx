import type { ReactNode } from "react";

type Tone = "emerald" | "amber" | "slate" | "sky" | "red";

const TONE_BG: Record<Tone, string> = {
  emerald: "bg-gradient-to-br from-emerald-50 to-white",
  amber: "bg-gradient-to-br from-amber-50 to-white",
  slate: "bg-gradient-to-br from-slate-50 to-white",
  sky: "bg-gradient-to-br from-sky-50 to-white",
  red: "bg-gradient-to-br from-red-50 to-white",
};
const TONE_BORDER: Record<Tone, string> = {
  emerald: "border-emerald-100",
  amber: "border-amber-100",
  slate: "border-slate-200",
  sky: "border-sky-100",
  red: "border-red-100",
};
const TONE_LABEL: Record<Tone, string> = {
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  slate: "text-slate-600",
  sky: "text-sky-700",
  red: "text-red-700",
};
const TONE_ICON: Record<Tone, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-200 text-slate-700",
  sky: "bg-sky-100 text-sky-700",
  red: "bg-red-100 text-red-700",
};

export default function StatCard({
  label,
  value,
  hint,
  tone = "emerald",
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${TONE_BORDER[tone]} ${TONE_BG[tone]} p-5 transition hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-[11px] font-semibold uppercase tracking-wider ${TONE_LABEL[tone]}`}>
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
          {hint && (
            <div className="mt-1 text-xs text-slate-500">{hint}</div>
          )}
          {trend && (
            <div
              className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                trend.positive ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {trend.positive ? "↑" : "→"} {trend.value}
            </div>
          )}
        </div>
        {icon && (
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${TONE_ICON[tone]} text-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
