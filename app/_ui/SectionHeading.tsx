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
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          {title}
        </h2>
        {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
