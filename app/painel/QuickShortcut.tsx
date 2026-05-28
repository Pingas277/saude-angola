"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { LiveIcon, type LiveIconHandle } from "@/components/ui/live-icon";

// Painel 'Atalhos' shortcut. The icon draws itself once when the shortcut
// scrolls into view (mobile too) and replays on hover on desktop.
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
  const linkRef = useRef<HTMLAnchorElement>(null);
  const inView = useInView(linkRef, { once: true, margin: "-15%" });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => icon.current?.startAnimation(), 150);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <Link
      ref={linkRef}
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
