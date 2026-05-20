"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarClock,
  Check,
  Clock,
  Loader2,
  Moon,
  Sun,
  Sunrise,
  Video,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { generateSlots, timeToMinutes } from "@/lib/slots";
import { bookAppointmentAction, type BookingState } from "./actions";

const ALL_SLOTS = generateSlots();

const PT_WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const PT_MONTH_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function build14Days(startISO: string) {
  const [y, m, d] = startISO.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  return Array.from({ length: 14 }, (_, i) => {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    return {
      iso: isoDate(day),
      weekday: PT_WEEKDAY_SHORT[day.getDay()],
      day: day.getDate(),
      month: PT_MONTH_SHORT[day.getMonth()],
      isToday: i === 0,
      isWeekend: day.getDay() === 0 || day.getDay() === 6,
    };
  });
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function BookingSheet({
  doctorId,
  doctorName,
  doctorSpecialty,
  doctorAvatarUrl,
  clinicName,
  defaultDate,
  triggerVariant = "primary",
}: {
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string | null;
  doctorAvatarUrl?: string | null;
  clinicName: string | null;
  defaultDate: string;
  /** Visual variant of the trigger button. */
  triggerVariant?: "primary" | "compact";
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState<string | null>(null);
  const [type, setType] = useState<"in_person" | "telemedicine">("in_person");
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [state, formAction, isPending] = useActionState<BookingState, FormData>(
    bookAppointmentAction,
    null
  );

  const days = useMemo(() => build14Days(defaultDate), [defaultDate]);
  const selectedDay = days.find((d) => d.iso === date) ?? days[0];

  const isToday = useMemo(() => date === defaultDate, [date, defaultDate]);
  const nowMinutes = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Fetch busy slots whenever doctor/date changes
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
          console.error("[booking] get_doctor_busy_slots failed:", error);
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

  // Group slots by period
  const periods = useMemo(
    () => [
      {
        label: "Manhã",
        icon: Sunrise,
        slots: ALL_SLOTS.filter((s) => timeToMinutes(s) < 12 * 60),
      },
      {
        label: "Tarde",
        icon: Sun,
        slots: ALL_SLOTS.filter(
          (s) => timeToMinutes(s) >= 12 * 60 && timeToMinutes(s) < 17 * 60
        ),
      },
      {
        label: "Noite",
        icon: Moon,
        slots: ALL_SLOTS.filter((s) => timeToMinutes(s) >= 17 * 60),
      },
    ],
    []
  );

  const availableCount = useMemo(() => {
    return ALL_SLOTS.filter((s) => {
      if (busySlots.includes(s)) return false;
      if (isToday && timeToMinutes(s) <= nowMinutes) return false;
      return true;
    }).length;
  }, [busySlots, isToday, nowMinutes]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={
          triggerVariant === "primary"
            ? "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
            : "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
        }
      >
        <CalendarCheck className="size-4" />
        Marcar
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b border-border bg-gradient-to-br from-sky-50/60 to-emerald-50/60 px-6 pb-5 pt-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <CalendarClock className="size-3.5" />
            Marcar consulta
          </div>
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-md shadow-sky-500/20">
              <div className="grid size-14 place-items-center overflow-hidden rounded-[14px] bg-white text-base font-bold text-sky-700">
                {doctorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doctorAvatarUrl}
                    alt={doctorName}
                    className="size-full object-cover"
                  />
                ) : (
                  initials(doctorName)
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-xl tracking-tight">
                Dr(a). {doctorName}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-xs">
                {[doctorSpecialty, clinicName].filter(Boolean).join(" · ") ||
                  "Médico verificado"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable form area */}
        <form
          action={formAction}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
            <input type="hidden" name="doctor_id" value={doctorId} />
            <input type="hidden" name="time" value={time ?? ""} />
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="appointment_type" value={type} />

            {/* ───────── DATE STRIP ───────── */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <CalendarCheck className="size-3.5" />
                  Escolha a data
                </Label>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Próximas 2 semanas
                </span>
              </div>
              <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2">
                {days.map((d) => {
                  const isSelected = d.iso === date;
                  return (
                    <button
                      type="button"
                      key={d.iso}
                      onClick={() => setDate(d.iso)}
                      className={
                        "relative flex min-w-[62px] shrink-0 flex-col items-center justify-center rounded-2xl border px-3 py-2.5 text-center transition-all " +
                        (isSelected
                          ? "border-transparent bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/30"
                          : "border-border bg-card hover:border-primary/40 hover:bg-accent")
                      }
                    >
                      <div
                        className={
                          "text-[9px] font-bold uppercase tracking-[0.15em] " +
                          (isSelected
                            ? "text-white/85"
                            : d.isWeekend
                            ? "text-rose-500/80"
                            : "text-muted-foreground")
                        }
                      >
                        {d.isToday ? "Hoje" : d.weekday}
                      </div>
                      <div
                        className={
                          "mt-0.5 text-xl font-bold leading-none " +
                          (isSelected ? "text-white" : "text-foreground")
                        }
                      >
                        {d.day}
                      </div>
                      <div
                        className={
                          "mt-0.5 text-[9px] font-medium uppercase tracking-wider " +
                          (isSelected ? "text-white/80" : "text-muted-foreground")
                        }
                      >
                        {d.month}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ───────── SLOTS BY PERIOD ───────── */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Horário disponível
                </Label>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  {loadingSlots ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      A carregar…
                    </>
                  ) : availableCount > 0 ? (
                    <>
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {availableCount}{" "}
                      {availableCount === 1 ? "livre" : "livres"}
                    </>
                  ) : (
                    <span className="text-rose-500">Sem horários</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {periods.map((p) => {
                  const free = p.slots.filter(
                    (s) =>
                      !busySlots.includes(s) &&
                      !(isToday && timeToMinutes(s) <= nowMinutes)
                  ).length;
                  return (
                    <div key={p.label}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          <p.icon className="size-3.5" />
                          {p.label}
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {free} {free === 1 ? "livre" : "livres"}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {p.slots.map((slot) => {
                          const isBusy = busySlots.includes(slot);
                          const isPast =
                            isToday && timeToMinutes(slot) <= nowMinutes;
                          const isDisabled = isBusy || isPast;
                          const isSelected = slot === time;
                          return (
                            <button
                              type="button"
                              key={slot}
                              disabled={isDisabled}
                              onClick={() => setTime(slot)}
                              className={
                                "rounded-lg px-2 py-2 text-xs font-bold transition-all " +
                                (isSelected
                                  ? "scale-105 bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/30"
                                  : isDisabled
                                  ? "cursor-not-allowed border border-border/60 bg-muted/30 text-muted-foreground/40 line-through"
                                  : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5")
                              }
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ───────── TYPE PICKER ───────── */}
            <section>
              <Label className="mb-2.5 block">Tipo de consulta</Label>
              <div className="grid grid-cols-2 gap-2.5">
                <TypeCard
                  active={type === "in_person"}
                  icon={Building2}
                  title="Presencial"
                  desc="Ir à clínica"
                  gradient="from-sky-500 to-blue-600"
                  onClick={() => setType("in_person")}
                />
                <TypeCard
                  active={type === "telemedicine"}
                  icon={Video}
                  title="Vídeo"
                  desc="Falar por vídeo"
                  gradient="from-emerald-500 to-teal-600"
                  onClick={() => setType("telemedicine")}
                />
              </div>
            </section>

            {/* ───────── REASON ───────── */}
            <section className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder="Ex.: Dor de cabeça frequente há uma semana"
              />
              <p className="text-[11px] text-muted-foreground">
                Opcional, mas ajuda o médico a preparar-se.
              </p>
            </section>

            {state?.error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {state.error}
              </div>
            )}
          </div>

          {/* ───────── STICKY FOOTER ───────── */}
          <div className="border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
            {time ? (
              <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 px-3.5 py-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm">
                  <Check className="size-4" />
                </span>
                <div className="min-w-0 flex-1 text-sm leading-tight">
                  <div className="font-semibold text-foreground">
                    {selectedDay.weekday}, {selectedDay.day} {selectedDay.month}{" "}
                    · {time}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {type === "telemedicine"
                      ? "Consulta por vídeo"
                      : "Consulta presencial"}{" "}
                    · 30 min
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-3 rounded-xl border border-dashed border-border bg-muted/30 px-3.5 py-2.5 text-center text-xs text-muted-foreground">
                Escolha um horário acima para continuar
              </div>
            )}
            <button
              type="submit"
              disabled={isPending || !time}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  A confirmar…
                </>
              ) : (
                <>
                  Confirmar consulta
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Receberá a confirmação no seu painel imediatamente.
            </p>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function TypeCard({
  active,
  icon: Icon,
  title,
  desc,
  gradient,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative flex flex-col items-start gap-2.5 rounded-xl border p-3.5 text-left transition-all " +
        (active
          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-sm"
          : "border-border bg-card hover:border-primary/30 hover:bg-accent/50")
      }
    >
      <span
        className={
          "grid size-9 place-items-center rounded-lg text-white shadow-sm transition-all " +
          (active
            ? `bg-gradient-to-br ${gradient} scale-105`
            : "bg-slate-300")
        }
      >
        <Icon className="size-4" />
      </span>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      {active && (
        <span className="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm">
          <Check className="size-3" />
        </span>
      )}
    </button>
  );
}
