import type { ReactNode } from "react";

type Tone = "emerald" | "amber" | "slate" | "sky" | "red";

// Clinical-minimal: card stays neutral; the tone only tints the small icon
// badge and the label, so the accent is a quiet signal, not a fill.
const TONE_LABEL: Record<Tone, string> = {
  emerald: "text-primary",
  amber: "text-amber-600 dark:text-amber-400",
  slate: "text-muted-foreground",
  sky: "text-sky-600 dark:text-sky-400",
  red: "text-destructive",
};
const TONE_ICON: Record<Tone, string> = {
  emerald: "bg-primary/10 text-primary",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  slate: "bg-muted text-muted-foreground",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  red: "bg-destructive/10 text-destructive",
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
  // Scale the value down as it gets longer so currency strings like
  // "35 000,00 AOA" never overflow a narrow card.
  const len = String(value).length;
  const valueSize =
    len <= 6
      ? "text-3xl"
      : len <= 10
        ? "text-2xl"
        : len <= 16
          ? "text-xl"
          : "text-lg";

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/15">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-[11px] font-medium uppercase tracking-wider ${TONE_LABEL[tone]}`}
          >
            {label}
          </div>
          <div
            className={`mt-2 break-words font-semibold leading-tight tracking-tight text-foreground tabular-nums ${valueSize}`}
          >
            {value}
          </div>
          {hint && (
            <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
          )}
          {trend && (
            <div
              className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                trend.positive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {trend.positive ? "↑" : "→"} {trend.value}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`grid size-10 shrink-0 place-items-center rounded-lg text-lg ${TONE_ICON[tone]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
