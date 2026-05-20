import type { ReactNode } from "react";
import AnimatedNumber from "./AnimatedNumber";
import Sparkline from "./Sparkline";

export type GradientTone =
  | "sky"
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "teal";

// Full-bleed coloured KPI tile. Background is a gradient; everything on top
// is white. Optional sparkline at the bottom and a small delta chip.
const GRADIENTS: Record<GradientTone, string> = {
  sky: "from-sky-500 via-sky-500 to-blue-600",
  emerald: "from-emerald-500 via-emerald-500 to-teal-600",
  amber: "from-amber-400 via-orange-500 to-orange-600",
  rose: "from-rose-400 via-rose-500 to-pink-600",
  indigo: "from-indigo-500 via-indigo-500 to-violet-600",
  teal: "from-teal-400 via-teal-500 to-emerald-600",
};

// Per-tone soft glow ring colour (rgba ish via opacity)
const RINGS: Record<GradientTone, string> = {
  sky: "shadow-sky-500/20",
  emerald: "shadow-emerald-500/20",
  amber: "shadow-orange-500/20",
  rose: "shadow-rose-500/20",
  indigo: "shadow-indigo-500/20",
  teal: "shadow-teal-500/20",
};

export default function GradientStatCard({
  label,
  value,
  hint,
  tone = "sky",
  icon,
  spark,
  delta,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: GradientTone;
  icon?: ReactNode;
  spark?: number[];
  delta?: { value: string; positive?: boolean };
}) {
  const sparkData = spark ? spark.map((v) => ({ v })) : null;

  // Scale value font by length so currency strings don't overflow.
  const len = String(value).length;
  const valueSize =
    len <= 5
      ? "text-3xl"
      : len <= 9
        ? "text-2xl"
        : len <= 14
          ? "text-xl"
          : "text-lg";

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg transition-transform hover:-translate-y-0.5 " +
        GRADIENTS[tone] +
        " " +
        RINGS[tone]
      }
    >
      {/* Soft highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/15 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -bottom-10 size-32 rounded-full bg-black/10 blur-2xl"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
            {label}
          </div>
          <div
            className={`mt-2 break-words font-semibold leading-tight tracking-tight tabular-nums ${valueSize}`}
          >
            {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          </div>
          {hint && (
            <div className="mt-1 text-xs font-medium text-white/80">{hint}</div>
          )}
          {delta && (
            <div
              className={
                "mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold backdrop-blur " +
                (delta.positive ? "text-white" : "text-white/85")
              }
            >
              {delta.positive ? "↑" : "↓"} {delta.value}
            </div>
          )}
        </div>
        {icon && (
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
            {icon}
          </div>
        )}
      </div>

      {sparkData && sparkData.length > 1 && (
        <div className="relative mt-3 -mx-1">
          <Sparkline data={sparkData} stroke="#ffffff" fill="auto" height={40} />
        </div>
      )}
    </div>
  );
}
