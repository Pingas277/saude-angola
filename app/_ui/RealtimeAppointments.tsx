"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Role = "patient" | "doctor" | "clinic";

/**
 * Subscribes to changes in the `appointments` table filtered by
 * the current user's role and key, and silently refreshes the
 * current route on any insert/update/delete. Lightweight — one
 * channel per mount.
 *
 * - role="patient" → filter by patient_id (UUID of patients.id)
 * - role="doctor"  → filter by doctor_id  (UUID of profiles.id)
 * - role="clinic"  → filter by clinic_id  (UUID of clinics.id)
 */
export default function RealtimeAppointments({
  role,
  filterId,
  channelPrefix = "lunga-appts",
}: {
  role: Role;
  filterId: string;
  channelPrefix?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!filterId) return;

    const supabase = createClient();
    const column =
      role === "patient"
        ? "patient_id"
        : role === "doctor"
          ? "doctor_id"
          : "clinic_id";

    const channel = supabase
      .channel(`${channelPrefix}-${role}-${filterId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `${column}=eq.${filterId}`,
        },
        (payload) => {
          // Soft refresh keeps server components in sync without
          // a full reload — no scroll jump.
          router.refresh();

          // Best-effort, very quiet hints. We avoid duplicating
          // the flash toast that fires after our own actions.
          if (payload.eventType === "INSERT") {
            toast.info("Nova consulta no seu painel.");
          } else if (payload.eventType === "UPDATE") {
            const newStatus = (payload.new as { status?: string } | null)
              ?.status;
            const oldStatus = (payload.old as { status?: string } | null)
              ?.status;
            if (newStatus && newStatus !== oldStatus) {
              toast.info("Estado da consulta atualizado.");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, filterId, channelPrefix, router]);

  return null;
}
