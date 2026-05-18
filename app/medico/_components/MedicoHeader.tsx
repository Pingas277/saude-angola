import type { ReactNode } from "react";

// Consistent, well-framed header for every doctor screen.
export default function MedicoHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <div>
          {eyebrow && (
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              {eyebrow}
            </div>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>
      )}
    </header>
  );
}
