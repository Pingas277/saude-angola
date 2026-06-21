"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarCheck,
  Clock,
  Loader2,
  Moon,
  Sun,
  Sunrise,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import {
  coerceWorkingHours,
  slotsForDate,
  timeToMinutes,
} from "@/lib/slots";
import {
  cancelAppointmentAction,
  rescheduleAppointmentAction,
  type AppointmentMutationState,
} from "./actions";

const PT_WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const PT_MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function build14Days(fromISO: string) {
  const [y, m, d] = fromISO.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  return Array.from({ length: 14 }, (_, i) => {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    return {
      iso: isoDate(day),
      weekday: PT_WEEKDAYS[day.getDay()],
      day: day.getDate(),
      month: PT_MONTHS[day.getMonth()],
      isToday: i === 0,
    };
  });
}

export default function AppointmentActions({
  appointmentId,
  doctorId,
  doctorName,
  currentScheduledAt,
  clinicHours,
}: {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  currentScheduledAt: string;
  clinicHours: unknown;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-border pt-3 mt-3 w-full">
        <button
          type="button"
          onClick={() => setRescheduleOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <CalendarCheck className="size-3.5" />
          Reagendar
        </button>
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400"
        >
          <X className="size-3.5" />
          Cancelar
        </button>
      </div>

      <CancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        appointmentId={appointmentId}
        doctorName={doctorName}
        currentScheduledAt={currentScheduledAt}
      />
      <RescheduleSheet
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointmentId={appointmentId}
        doctorId={doctorId}
        currentScheduledAt={currentScheduledAt}
        clinicHours={clinicHours}
      />
    </>
  );
}

// =============================================================================
// Cancel confirmation
// =============================================================================

function CancelDialog({
  open,
  onOpenChange,
  appointmentId,
  doctorName,
  currentScheduledAt,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointmentId: string;
  doctorName: string;
  currentScheduledAt: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    AppointmentMutationState,
    FormData
  >(cancelAppointmentAction, null);

  useEffect(() => {
    if (state?.ok) {
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  const d = new Date(currentScheduledAt);
  const whenLabel = d.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const timeLabel = d.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-rose-500" />
            Cancelar consulta
          </DialogTitle>
          <DialogDescription>
            Tem a certeza que quer cancelar a consulta com{" "}
            <strong className="text-foreground">Dr(a). {doctorName}</strong> em{" "}
            <strong className="text-foreground">
              {whenLabel} às {timeLabel}
            </strong>
            ? A clínica vai ser avisada.
          </DialogDescription>
        </DialogHeader>

        {state?.error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </div>
        )}

        <form action={formAction}>
          <input type="hidden" name="appointment_id" value={appointmentId} />
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Manter consulta
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  A cancelar…
                </>
              ) : (
                "Sim, cancelar"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Reschedule — date + slot picker, then submits to rescheduleAppointmentAction
// =============================================================================

function RescheduleSheet({
  open,
  onOpenChange,
  appointmentId,
  doctorId,
  currentScheduledAt,
  clinicHours,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointmentId: string;
  doctorId: string;
  currentScheduledAt: string;
  clinicHours: unknown;
}) {
  const router = useRouter();
  const today = isoDate(new Date());
  const [date, setDate] = useState(today);
  const [time, setTime] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [state, formAction, isPending] = useActionState<
    AppointmentMutationState,
    FormData
  >(rescheduleAppointmentAction, null);

  useEffect(() => {
    if (state?.ok) {
      onOpenChange(false);
      router.refresh();
    }
  }, [state, onOpenChange, router]);

  const days = useMemo(() => build14Days(today), [today]);
  const workingHours = useMemo(
    () => coerceWorkingHours(clinicHours),
    [clinicHours]
  );
  const daySlots = useMemo(() => {
    const [y, m, d] = date.split("-").map(Number);
    return slotsForDate(workingHours, new Date(y, m - 1, d));
  }, [workingHours, date]);
  const clinicClosed = daySlots.length === 0;

  const isToday = date === today;
  const nowMin = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Don't let the user pick the same slot the appointment is already on.
  const currentISO = useMemo(() => {
    const d = new Date(currentScheduledAt);
    return {
      date: isoDate(d),
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    };
  }, [currentScheduledAt]);

  // Refresh busy slots whenever the doctor/date changes.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingSlots(true);
    setTime(null);
    const supabase = createClient();
    supabase
      .rpc("get_doctor_busy_slots", { doctor_uuid: doctorId, day: date })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[reschedule] get_doctor_busy_slots failed:", error);
          setBusySlots([]);
        } else {
          setBusySlots(Array.isArray(data) ? data : []);
        }
        setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId, date, open]);

  const periods = useMemo(
    () =>
      [
        {
          label: "Manhã",
          icon: Sunrise,
          slots: daySlots.filter((s) => timeToMinutes(s) < 12 * 60),
        },
        {
          label: "Tarde",
          icon: Sun,
          slots: daySlots.filter(
            (s) => timeToMinutes(s) >= 12 * 60 && timeToMinutes(s) < 17 * 60
          ),
        },
        {
          label: "Noite",
          icon: Moon,
          slots: daySlots.filter((s) => timeToMinutes(s) >= 17 * 60),
        },
      ].filter((p) => p.slots.length > 0),
    [daySlots]
  );

  const availableCount = useMemo(
    () =>
      daySlots.filter((s) => {
        if (busySlots.includes(s)) return false;
        if (isToday && timeToMinutes(s) <= nowMin) return false;
        if (date === currentISO.date && s === currentISO.time) return false;
        return true;
      }).length,
    [daySlots, busySlots, isToday, nowMin, date, currentISO]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reagendar consulta</SheetTitle>
          <SheetDescription>
            Escolha uma nova data e hora. A consulta passa para o estado
            &quot;agendada&quot; até a clínica confirmar.
          </SheetDescription>
        </SheetHeader>

        <form action={formAction} className="mt-6 space-y-6 px-4">
          <input type="hidden" name="appointment_id" value={appointmentId} />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="time" value={time ?? ""} />

          {/* Calendar strip */}
          <section>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nova data
            </label>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {days.map((dd) => (
                <button
                  key={dd.iso}
                  type="button"
                  onClick={() => setDate(dd.iso)}
                  className={
                    "flex w-14 shrink-0 flex-col items-center rounded-xl border px-2 py-2 text-center transition-all " +
                    (dd.iso === date
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/40")
                  }
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {dd.weekday}
                  </span>
                  <span className="mt-0.5 text-base font-bold">{dd.day}</span>
                  <span className="text-[9px] uppercase opacity-70">
                    {dd.month}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Slots */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Clock className="size-3.5" />
                Nova hora
              </label>
              <span className="text-[11px] font-medium text-muted-foreground">
                {loadingSlots ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" />
                    A carregar…
                  </span>
                ) : clinicClosed ? (
                  "Fechado"
                ) : availableCount > 0 ? (
                  <>
                    <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" />
                    {availableCount} {availableCount === 1 ? "livre" : "livres"}
                  </>
                ) : (
                  <span className="text-rose-500">Sem horários</span>
                )}
              </span>
            </div>

            {clinicClosed ? (
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  Clínica fechada neste dia
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Escolha outro dia com horário disponível.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {periods.map((p) => (
                  <div key={p.label}>
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      <p.icon className="size-3.5" />
                      {p.label}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {p.slots.map((s) => {
                        const busy = busySlots.includes(s);
                        const past = isToday && timeToMinutes(s) <= nowMin;
                        const sameAsCurrent =
                          date === currentISO.date && s === currentISO.time;
                        const disabled = busy || past || sameAsCurrent;
                        const selected = s === time;
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={disabled}
                            onClick={() => setTime(s)}
                            className={
                              "rounded-lg px-2 py-2 text-xs font-bold transition-all " +
                              (selected
                                ? "scale-105 bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/30"
                                : disabled
                                  ? "cursor-not-allowed border border-border/60 bg-muted/30 text-muted-foreground/40 line-through"
                                  : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5")
                            }
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {state?.error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !time || clinicClosed}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  A guardar…
                </>
              ) : (
                "Confirmar nova hora"
              )}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
