"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarClock, Clock, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { generateSlots, timeToMinutes } from "@/lib/slots";
import { bookAppointmentAction, type BookingState } from "./actions";

const ALL_SLOTS = generateSlots();

export default function BookingSheet({
  doctorId,
  doctorName,
  doctorSpecialty,
  clinicName,
  defaultDate,
}: {
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string | null;
  clinicName: string | null;
  defaultDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [state, formAction, isPending] = useActionState<BookingState, FormData>(
    bookAppointmentAction,
    null
  );

  // Today's "minutes since midnight" — used to grey-out past slots when the
  // selected date is today.
  const isToday = useMemo(() => {
    const today = new Date();
    const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return ymd === date;
  }, [date]);

  const nowMinutes = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, [date]);

  // Fetch busy slots whenever doctor or date changes
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
        Marcar consulta
        <ArrowRight className="h-3.5 w-3.5" />
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <CalendarClock className="h-3.5 w-3.5" />
            Marcar consulta
          </div>
          <SheetTitle className="text-2xl">Dr(a). {doctorName}</SheetTitle>
          <SheetDescription>
            {[doctorSpecialty, clinicName].filter(Boolean).join(" · ") ||
              "Médico verificado"}
          </SheetDescription>
        </SheetHeader>

        <form action={formAction} className="grid gap-5 px-4 pb-4">
          <input type="hidden" name="doctor_id" value={doctorId} />
          <input type="hidden" name="time" value={time ?? ""} />

          <div className="space-y-1.5">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              min={defaultDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Slot picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Horário disponível
              </Label>
              {loadingSlots && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {ALL_SLOTS.map((slot) => {
                const isBusy = busySlots.includes(slot);
                const isPast = isToday && timeToMinutes(slot) <= nowMinutes;
                const isDisabled = isBusy || isPast;
                const isSelected = slot === time;
                return (
                  <button
                    type="button"
                    key={slot}
                    disabled={isDisabled}
                    onClick={() => setTime(slot)}
                    className={
                      "rounded-md px-2 py-1.5 text-xs font-semibold transition " +
                      (isSelected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : isDisabled
                        ? "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-300 line-through"
                        : "border border-slate-300 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50")
                    }
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            {!loadingSlots && (
              <p className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-white ring-1 ring-slate-300" />
                  livre
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-slate-100 ring-1 ring-slate-200" />
                  ocupado
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-emerald-600" />
                  selecionado
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de consulta</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium has-checked:border-emerald-500 has-checked:bg-emerald-50 has-checked:text-emerald-900">
                <input
                  type="radio"
                  name="appointment_type"
                  value="in_person"
                  defaultChecked
                  className="text-emerald-600"
                />
                Presencial
              </label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium has-checked:border-emerald-500 has-checked:bg-emerald-50 has-checked:text-emerald-900">
                <input
                  type="radio"
                  name="appointment_type"
                  value="telemedicine"
                  className="text-emerald-600"
                />
                Vídeo
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Motivo da consulta</Label>
            <Textarea
              id="reason"
              name="reason"
              rows={3}
              placeholder="Ex.: Dor de cabeça frequente há uma semana"
            />
            <p className="text-xs text-slate-500">
              Opcional, mas ajuda o médico a preparar-se.
            </p>
          </div>

          {state?.error && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {state.error}
            </div>
          )}

          <SheetFooter className="px-0">
            <Button
              type="submit"
              disabled={isPending || !time}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              {isPending
                ? "A confirmar…"
                : time
                ? `Confirmar ${date} às ${time}`
                : "Escolha um horário"}
            </Button>
          </SheetFooter>

          <p className="text-center text-xs text-slate-500">
            Receberá uma confirmação no seu painel imediatamente.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}
