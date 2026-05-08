"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Subscribes to all consultation INSERT/UPDATE/DELETE events. RLS filters
// what the doctor can actually see, so this is safe to leave broad — the
// doctor will just receive events for rows they can already read (their own
// claimed consults + any unassigned waiting row).
export default function RealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("doctor-telemed-pool")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consultations" },
        () => router.refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
