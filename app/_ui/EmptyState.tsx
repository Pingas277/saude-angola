import Link from "next/link";
import type { ReactNode } from "react";

export default function EmptyState({
  icon = "📋",
  title,
  desc,
  action,
}: {
  icon?: ReactNode;
  title: string;
  desc?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-2xl">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
