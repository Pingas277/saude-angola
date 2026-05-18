import type { ReactNode } from "react";

export type Milestone = {
  marker: string; // e.g. "2026" or "Hoje"
  title: string;
  desc: string;
  icon: ReactNode;
  upcoming?: boolean; // dashed node = roadmap, not history
};

export default function Timeline({ items }: { items: Milestone[] }) {
  return (
    <ol className="relative ml-2">
      {/* vertical rail */}
      <span
        aria-hidden
        className="absolute left-[15px] top-2 bottom-2 w-px bg-border"
      />
      {items.map((m, i) => (
        <li key={i} className="relative flex gap-5 pb-10 last:pb-0">
          <span
            className={
              "relative z-10 mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border " +
              (m.upcoming
                ? "border-dashed border-primary/50 bg-background text-primary/70"
                : "border-primary bg-primary text-primary-foreground")
            }
          >
            {m.icon}
          </span>
          <div className="min-w-0 pt-0.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              {m.marker}
              {m.upcoming && (
                <span className="ml-2 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-muted-foreground">
                  objetivo
                </span>
              )}
            </div>
            <h3 className="mt-1 text-base font-semibold text-foreground">
              {m.title}
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {m.desc}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
