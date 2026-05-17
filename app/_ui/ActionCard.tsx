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
        "group flex items-center gap-4 rounded-xl border p-5 transition-colors " +
        (isPrimary
          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
          : "border-border bg-card hover:border-foreground/15 hover:bg-accent/40")
      }
    >
      {icon && (
        <div
          className={
            "grid size-12 shrink-0 place-items-center rounded-lg text-xl " +
            (isPrimary
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")
          }
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-foreground">{title}</div>
        <div className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {desc}
        </div>
      </div>
      <span
        aria-hidden
        className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
      >
        →
      </span>
    </Link>
  );
}
