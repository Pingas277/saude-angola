"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  searchPatientsAction,
  registerWalkInAction,
  bookForPatientAction,
  type SearchState,
  type WalkInState,
  type BookState,
  type SearchResult,
} from "./actions";

type Doctor = {
  id: string;
  full_name: string;
  specialty: string | null;
};

type Step = "patient" | "book" | "done";

type SelectedPatient = {
  id: string; // patient.id
  display_name: string;
  phone: string | null;
};

export default function MarcarRecepcaoFlow({
  doctors,
  defaultDate,
  initialMode = "search",
}: {
  doctors: Doctor[];
  defaultDate: string;
  initialMode?: "search" | "walkin";
}) {
  const [step, setStep] = useState<Step>("patient");
  const [mode, setMode] = useState<"search" | "walkin">(initialMode);
  const [selected, setSelected] = useState<SelectedPatient | null>(null);
  const router = useRouter();

  if (step === "done" && selected) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-6">
        <h2 className="text-lg font-semibold text-primary">
          Marcação criada com sucesso
        </h2>
        <p className="mt-1 text-sm text-primary">
          Consulta marcada para {selected.display_name}.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setStep("patient");
              setMode("search");
              router.refresh();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Marcar outra
          </button>
          <button
            type="button"
            onClick={() => router.push("/recepcao")}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40"
          >
            Voltar à fila
          </button>
        </div>
      </div>
    );
  }

  if (step === "book" && selected) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          <span className="font-medium text-primary">Paciente: </span>
          <span className="text-primary">{selected.display_name}</span>
          {selected.phone ? (
            <span className="text-primary"> · {selected.phone}</span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setStep("patient");
            }}
            className="ml-3 text-xs font-medium text-primary underline hover:text-primary"
          >
            Trocar
          </button>
        </div>
        <BookForm
          patientId={selected.id}
          doctors={doctors}
          defaultDate={defaultDate}
          onDone={() => setStep("done")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setMode("search")}
          className={
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition " +
            (mode === "search"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          Paciente existente
        </button>
        <button
          type="button"
          onClick={() => setMode("walkin")}
          className={
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition " +
            (mode === "walkin"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          Novo paciente (walk-in)
        </button>
      </div>

      {mode === "search" ? (
        <SearchPanel
          onPick={(p) => {
            if (!p.patient_id) return;
            setSelected({
              id: p.patient_id,
              display_name: p.full_name ?? p.email ?? "Paciente",
              phone: p.phone,
            });
            setStep("book");
          }}
        />
      ) : (
        <WalkInPanel
          onCreated={(patientId, displayName, phone) => {
            setSelected({ id: patientId, display_name: displayName, phone });
            setStep("book");
          }}
        />
      )}
    </div>
  );
}

function SearchPanel({ onPick }: { onPick: (p: SearchResult) => void }) {
  const [state, formAction, isPending] = useActionState<SearchState, FormData>(
    searchPatientsAction,
    null
  );

  return (
    <div className="space-y-3">
      <form action={formAction} className="flex gap-2">
        <input
          name="q"
          required
          minLength={2}
          placeholder="Pesquisar por nome, email ou telefone"
          className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A procurar…" : "Procurar"}
        </button>
      </form>

      {state?.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state?.results && state.results.length === 0 && (
        <div className="rounded-md border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Nenhum paciente encontrado para “{state.query}”. Use a aba “Novo paciente” se for um walk-in.
        </div>
      )}

      {state?.results && state.results.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {state.results.map((p) => (
            <li
              key={p.profile_id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground">
                  {p.full_name ?? "—"}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {[p.email, p.phone].filter(Boolean).join(" · ") || "—"}
                  {!p.patient_id && " · sem ficha clínica"}
                </div>
              </div>
              <button
                type="button"
                disabled={!p.patient_id}
                onClick={() => onPick(p)}
                title={p.patient_id ? "" : "Paciente ainda não preencheu o perfil clínico"}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Selecionar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WalkInPanel({
  onCreated,
}: {
  onCreated: (patientId: string, displayName: string, phone: string | null) => void;
}) {
  const [state, formAction, isPending] = useActionState<WalkInState, FormData>(
    registerWalkInAction,
    null
  );
  const [draft, setDraft] = useState({ name: "", phone: "" });

  if (state?.ok && state.patient_id) {
    onCreated(state.patient_id, draft.name, draft.phone || null);
    return null;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome completo" required>
          <input
            name="full_name"
            required
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Telemóvel">
          <input
            name="phone"
            type="tel"
            placeholder="+244 9XX XXX XXX"
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="BI / NIF">
          <input
            name="id_number"
            placeholder="005468391LA042"
            className={inputClass}
          />
        </Field>
        <Field label="Data de nascimento">
          <input name="date_of_birth" type="date" className={inputClass} />
        </Field>
        <Field label="Género">
          <select name="gender" defaultValue="" className={inputClass}>
            <option value="">—</option>
            <option value="female">Feminino</option>
            <option value="male">Masculino</option>
            <option value="other">Outro</option>
            <option value="prefer_not_to_say">Prefiro não dizer</option>
          </select>
        </Field>
      </div>

      {state?.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A registar…" : "Registar paciente"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Cria uma ficha clínica para o paciente. Ele pode mais tarde reclamar a
        conta para aceder ao painel — para já, é gerido apenas pela recepção.
      </p>
    </form>
  );
}

function BookForm({
  patientId,
  doctors,
  defaultDate,
  onDone,
}: {
  patientId: string;
  doctors: Doctor[];
  defaultDate: string;
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState<BookState, FormData>(
    bookForPatientAction,
    null
  );

  if (state?.ok) {
    onDone();
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="patient_id" value={patientId} />

      <Field label="Médico" required>
        <select name="doctor_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Selecione um médico
          </option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name}
              {d.specialty ? ` — ${d.specialty}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Data" required>
          <input
            name="date"
            type="date"
            required
            min={defaultDate}
            defaultValue={defaultDate}
            className={inputClass}
          />
        </Field>
        <Field label="Hora" required>
          <input
            name="time"
            type="time"
            required
            defaultValue="09:00"
            step={900}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Tipo de consulta" required>
        <div className="flex gap-3">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm has-checked:border-emerald-500 has-checked:bg-primary/10">
            <input type="radio" name="appointment_type" value="in_person" defaultChecked />
            Presencial
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm has-checked:border-emerald-500 has-checked:bg-primary/10">
            <input type="radio" name="appointment_type" value="telemedicine" />
            Telemedicina
          </label>
        </div>
      </Field>

      <Field label="Motivo / observações">
        <textarea
          name="reason"
          rows={2}
          placeholder="Ex.: Dor de cabeça frequente"
          className={inputClass}
        />
      </Field>

      {state?.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || doctors.length === 0}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A marcar…" : "Confirmar marcação"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
