"use client";

import { useRef, type ReactNode } from "react";
import { LiveIcon, type LiveIconHandle } from "@/components/ui/live-icon";

// Landing 'Como funciona' step. Hovering the column plays the animated
// badge icon. The bottom chip keeps a static icon (too small to animate).
export default function StepCard({
  n,
  iconName,
  title,
  desc,
  chipIcon,
  chipLabel,
}: {
  n: string;
  iconName: string;
  title: string;
  desc: string;
  chipIcon: ReactNode;
  chipLabel: string;
}) {
  const icon = useRef<LiveIconHandle>(null);

  return (
    <div
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
      className="group relative flex flex-col items-center text-center"
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
        Passo {n}
      </div>

      <div className="relative mt-4 grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-xl shadow-primary/30 ring-4 ring-muted/30 transition-transform duration-200 ease-out group-hover:scale-105">
        <LiveIcon ref={icon} name={iconName} size={32} />
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>

      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md">
        {chipIcon}
        {chipLabel}
      </div>
    </div>
  );
}
