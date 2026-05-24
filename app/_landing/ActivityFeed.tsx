"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

// Social-proof feed shown below the doctor-search widget. Cycles one
// realistic-looking booking every ~4s with a soft fade+slide transition.
// Names are first-name + initial only so it reads as anonymised but real.

type ActivityItem = {
  name: string;
  specialty: string;
  province: string;
  minsAgo: number;
};

const ITEMS: ActivityItem[] = [
  { name: "Maria M.", specialty: "Cardiologia", province: "Luanda", minsAgo: 2 },
  { name: "João P.", specialty: "Pediatria", province: "Benguela", minsAgo: 5 },
  { name: "Ana S.", specialty: "Dermatologia", province: "Huambo", minsAgo: 8 },
  { name: "Carlos N.", specialty: "Oftalmologia", province: "Bié", minsAgo: 12 },
  { name: "Isabel D.", specialty: "Medicina Geral", province: "Cabinda", minsAgo: 15 },
  { name: "Tiago F.", specialty: "Ginecologia", province: "Namibe", minsAgo: 18 },
  { name: "Sofia A.", specialty: "Ortopedia", province: "Huíla", minsAgo: 22 },
];

const ROTATION_MS = 4000;

export default function ActivityFeed() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // Pause rotation when the tab is hidden — saves work and avoids the
    // feed having advanced 20 entries when the user comes back.
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      if (document.hidden) {
        timer = setTimeout(tick, 1000);
        return;
      }
      setIdx((i) => (i + 1) % ITEMS.length);
      timer = setTimeout(tick, ROTATION_MS);
    };

    timer = setTimeout(tick, ROTATION_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const item = ITEMS[idx];

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <span className="truncate text-foreground">
              <span className="font-semibold">{item.name}</span>
              <span className="text-muted-foreground"> marcou </span>
              <span className="font-medium">{item.specialty}</span>
              <span className="text-muted-foreground"> em </span>
              <span className="font-medium">{item.province}</span>
            </span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            há {item.minsAgo} min
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
