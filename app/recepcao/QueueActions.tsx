"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAppointmentStatusAction } from "./queue-actions";

type Transition = { to: string; label: string; tone: "primary" | "ghost" | "warning" | "danger" };

function transitionsFor(status: string): Transition[] {
  if (status === "scheduled") {
    return [
      { to: "confirmed", label: "Check-in", tone: "primary" },
      { to: "no_show", label: "Não veio", tone: "warning" },
      { to: "cancelled", label: "Cancelar", tone: "ghost" },
    ];
  }
  if (status === "confirmed") {
    return [
      { to: "in_progress", label: "Em consulta", tone: "primary" },
      { to: "no_show", label: "Não veio", tone: "warning" },
    ];
  }
  if (status === "in_progress") {
    return [{ to: "completed", label: "Check-out", tone: "primary" }];
  }
  return [];
}

const TONE_CLS: Record<Transition["tone"], string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  ghost: "border border-border bg-card text-foreground hover:bg-muted/40",
  warning: "border border-amber-300 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15",
  danger: "border border-red-300 bg-destructive/10 text-destructive hover:bg-destructive/10",
};

export default function QueueActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const transitions = transitionsFor(status);

  if (transitions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {transitions.map((t) => (
        <button
          key={t.to}
          type="button"
          disabled={isPending}
          onClick={() => {
            const fd = new FormData();
            fd.set("appointment_id", appointmentId);
            fd.set("status", t.to);
            startTransition(async () => {
              await setAppointmentStatusAction(fd);
              router.refresh();
            });
          }}
          className={
            "rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 " +
            TONE_CLS[t.tone]
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
