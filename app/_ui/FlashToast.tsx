"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type FlashKind = "success" | "error" | "info";
type FlashPayload = { kind?: FlashKind; title?: string; desc?: string } | null;

/**
 * Reads the one-shot flash cookie via /api/flash (the route
 * handler also deletes it), then fires a single sonner toast.
 *
 * We fetch from the client because Next.js 15 forbids cookie
 * mutation from Server Components.
 */
export default function FlashToast() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch("/api/flash", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { flash: FlashPayload } | null) => {
        const f = data?.flash;
        if (!f?.title) return;
        const fn =
          f.kind === "error"
            ? toast.error
            : f.kind === "info"
              ? toast.info
              : toast.success;
        fn(f.title, f.desc ? { description: f.desc } : undefined);
      })
      .catch(() => {
        /* ignore — flash is a nice-to-have */
      });
  }, []);

  return null;
}
