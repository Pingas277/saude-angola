"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Flash } from "@/lib/flash";

/**
 * Client component that fires a single toast on mount. The flash
 * is consumed (cookie deleted) on the server before this renders,
 * so a refresh will not double-fire.
 */
export default function FlashToast({ flash }: { flash: Flash | null }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!flash || fired.current) return;
    fired.current = true;
    const fn =
      flash.kind === "error"
        ? toast.error
        : flash.kind === "info"
          ? toast.info
          : toast.success;
    fn(flash.title, flash.desc ? { description: flash.desc } : undefined);
  }, [flash]);

  return null;
}
