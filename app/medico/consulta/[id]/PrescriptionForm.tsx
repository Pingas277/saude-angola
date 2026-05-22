"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Pill,
  Plus,
  ScanLine,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { issuePrescriptionAction, type RxState } from "./actions";

type MedRow = { key: number; presetName?: string };

export type Encounter = {
  kind: "appointment" | "consultation";
  id: string;
};

export type PatientOption = { id: string; name: string };

// Frequently prescribed in Angola — one tap adds a pre-filled row.
const COMMON_MEDS = [
  "Paracetamol 500 mg",
  "Amoxicilina 500 mg",
  "Ibuprofeno 400 mg",
  "Artemeter + Lumefantrina",
  "Omeprazol 20 mg",
  "Metronidazol 250 mg",
  "Sais de reidratação oral",
];

const VALIDITY_OPTIONS = [
  { days: 15, label: "15 dias" },
  { days: 30, label: "30 dias" },
  { days: 60, label: "60 dias" },
  { days: 90, label: "90 dias" },
];

export default function PrescriptionForm({
  encounter,
  patients,
}: {
  /** Issued from a consultation page — ties the rx to the encounter. */
  encounter?: Encounter;
  /** Issued "quick" — the doctor picks the patient from this list. */
  patients?: PatientOption[];
}) {
  const [state, formAction, isPending] = useActionState<RxState, FormData>(
    issuePrescriptionAction,
    null
  );
  const [rows, setRows] = useState<MedRow[]>([{ key: 0 }]);
  const [validity, setValidity] = useState(30);
  const nextKey = useRef(1);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && state.prescriptionId) {
      formRef.current?.reset();
      setRows([{ key: nextKey.current++ }]);
      setValidity(30);
      window.open(
        `/api/receita/${state.prescriptionId}/pdf`,
        "_blank",
        "noopener"
      );
    }
  }, [state]);

  const hiddenName =
    encounter?.kind === "appointment"
      ? "appointment_id"
      : encounter?.kind === "consultation"
        ? "consultation_id"
        : null;

  function addRow(presetName?: string) {
    setRows((prev) => [...prev, { key: nextKey.current++, presetName }]);
  }
  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {encounter && hiddenName && (
        <input type="hidden" name={hiddenName} value={encounter.id} />
      )}
      <input type="hidden" name="expires_in_days" value={validity} />

      {/* ─── Patient picker (quick mode only) ─── */}
      {patients && (
        <div>
          <label
            htmlFor="rx_patient"
            className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <UserRound className="size-3" />
            Paciente
          </label>
          <select
            id="rx_patient"
            name="patient_id"
            required
            defaultValue=""
            className="block w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>
              Escolha um paciente…
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {patients.length === 0 && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Ainda não tem pacientes — só pode receitar a quem já consultou.
            </p>
          )}
        </div>
      )}

      {/* ─── Quick-add common meds ─── */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="size-3" />
          Adicionar rápido
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_MEDS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => addRow(m)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <Plus className="size-3 text-primary" />
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Medication cards ─── */}
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <fieldset
            key={row.key}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <legend className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-xs font-bold text-white shadow-sm">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Medicamento
                </span>
              </legend>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" />
                  Remover
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nome do medicamento" className="sm:col-span-2">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Pill className="size-3.5 shrink-0 text-primary" />
                  <input
                    name="med_name"
                    required={idx === 0}
                    defaultValue={row.presetName}
                    placeholder="Ex.: Paracetamol 500 mg"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </Field>
              <Field label="Dose">
                <input
                  name={`med_dosage_${idx}`}
                  placeholder="Ex.: 1 comprimido"
                  className={inputClass}
                />
              </Field>
              <Field label="Frequência">
                <input
                  name={`med_frequency_${idx}`}
                  placeholder="Ex.: 8/8 horas"
                  className={inputClass}
                />
              </Field>
              <Field label="Duração">
                <input
                  name={`med_duration_${idx}`}
                  placeholder="Ex.: 5 dias"
                  className={inputClass}
                />
              </Field>
              <Field label="Instruções">
                <input
                  name={`med_instructions_${idx}`}
                  placeholder="Ex.: Após as refeições"
                  className={inputClass}
                />
              </Field>
            </div>
          </fieldset>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addRow()}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
      >
        <Plus className="size-4 text-primary" />
        Adicionar outro medicamento
      </button>

      {/* ─── Validity ─── */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <Clock className="size-3" />
          Validade da receita
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {VALIDITY_OPTIONS.map((v) => (
            <button
              key={v.days}
              type="button"
              onClick={() => setValidity(v.days)}
              className={
                "rounded-xl border px-2 py-2 text-xs font-bold transition-all " +
                (validity === v.days
                  ? "border-transparent bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent")
              }
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Notes ─── */}
      <Field label="Notas para o paciente">
        <textarea
          name="notes"
          rows={2}
          placeholder="Ex.: Voltar à consulta em duas semanas. Em caso de febre persistente, contactar a clínica."
          className={
            "block w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          }
        />
      </Field>

      {/* ─── Error / success ─── */}
      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      {state?.ok && state.prescriptionId && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
            <CheckCircle2 className="size-5" />
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <div className="font-bold text-emerald-800">
              Receita emitida com sucesso
            </div>
            <div className="mt-0.5 text-emerald-700/90">
              O PDF abriu numa nova janela.{" "}
              <a
                href={`/api/receita/${state.prescriptionId}/pdf`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline"
              >
                <Download className="size-3" />
                Descarregar de novo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── Submit ─── */}
      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            A emitir receita…
          </>
        ) : (
          <>
            <Pill className="size-5" />
            Emitir receita
          </>
        )}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <ScanLine className="size-3.5 text-emerald-600" />
        A receita gera um QR único, verificável na farmácia.
      </p>
    </form>
  );
}

const inputClass =
  "block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
