import Link from "next/link";
import type { ReactNode } from "react";

export default function ActionCard({
  href,
  title,
  desc,
  icon,
  variant = "default",
}: {
  href: string;
  title: string;
  desc: string;
  icon?: ReactNode;
  variant?: "default" | "primary";
}) {
  const isPrimary = variant === "primary";
  return (
    <Link
      href={href}
      className={
        "group flex items-center gap-4 rounded-xl border p-5 transition " +
        (isPrimary
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-400 hover:shadow-md"
          : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm")
      }
    >
      {icon && (
        <div
          className={
            "grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl transition group-hover:scale-105 " +
            (isPrimary
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700")
          }
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 line-clamp-2 text-sm text-slate-600">{desc}</div>
      </div>
      <span
        aria-hidden
        className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
      >
        →
      </span>
    </Link>
  );
}
