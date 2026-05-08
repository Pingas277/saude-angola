import type { ReactNode } from "react";

export default function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
