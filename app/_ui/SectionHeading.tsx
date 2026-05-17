import Link from "next/link";

export default function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-primary">
          {title}
        </h2>
        {hint && (
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-sm font-medium text-primary hover:underline"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
