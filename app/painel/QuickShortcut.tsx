"use client";

import Link from "next/link";
import { useRef } from "react";
import { LiveIcon, type LiveIconHandle } from "@/components/ui/live-icon";

// Painel 'Atalhos' shortcut. Same visual as before, but hovering the
// button plays the animated icon.
export default function QuickShortcut({
  href,
  iconName,
  label,
}: {
  href: string;
  iconName: string;
  label: string;
}) {
  const icon = useRef<LiveIconHandle>(null);

  return (
    <Link
      href={href}
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
      className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/15 hover:bg-accent/40"
    >
      <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <LiveIcon ref={icon} name={iconName} size={18} />
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </Link>
  );
}
