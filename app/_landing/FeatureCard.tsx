"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { Check } from "lucide-react";
import { LiveIcon, type LiveIconHandle } from "@/components/ui/live-icon";

// Landing 'Tudo o que precisa' card. The animated icon draws itself once
// when the card scrolls into view (visible on mobile too), and replays on
// hover on desktop.
export default function FeatureCard({
  iconName,
  gradient,
  title,
  desc,
  chip,
}: {
  iconName: string;
  gradient: string;
  title: string;
  desc: string;
  chip: string;
}) {
  const icon = useRef<LiveIconHandle>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-15%" });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => icon.current?.startAnimation(), 150);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-sm transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <span
        className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-black/5 ring-1 ring-white/20 transition-transform duration-200 ease-out group-hover:scale-105`}
      >
        <LiveIcon ref={icon} name={iconName} size={24} />
      </span>

      <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>

      <div className="mt-5 flex-1" />
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
        <Check
          className="size-3 text-emerald-600 dark:text-emerald-400"
          strokeWidth={3}
        />
        {chip}
      </div>
    </div>
  );
}
