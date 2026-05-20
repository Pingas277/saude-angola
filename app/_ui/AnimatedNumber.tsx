"use client";

import { useEffect, useRef, useState } from "react";

// Smooth count-up animation for numeric KPIs. Respects prefers-reduced-motion.
export default function AnimatedNumber({
  value,
  duration = 700,
}: {
  value: number;
  duration?: number;
}) {
  const [v, setV] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setV(value);
      return;
    }
    const from = 0;
    const to = value;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setV(from + (to - from) * ease);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const display = Number.isInteger(value) ? Math.round(v) : Number(v.toFixed(1));
  return <>{display.toLocaleString("pt-PT")}</>;
}
