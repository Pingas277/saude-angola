"use client";

import { useActionState, useState } from "react";
import { ArrowRight, CalendarClock } from "lucide-react";
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
import { bookAppointmentAction, type BookingState } from "./actions";

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
  const [state, formAction, isPending] = useActionState<BookingState, FormData>(
    bookAppointmentAction,
    null
  );

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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                min={defaultDate}
                defaultValue={defaultDate}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                name="time"
                type="time"
                required
                defaultValue="09:00"
                step={900}
              />
            </div>
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
              disabled={isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              {isPending ? "A confirmar…" : "Confirmar marcação"}
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
