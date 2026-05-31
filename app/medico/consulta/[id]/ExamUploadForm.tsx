"use client";

import { useActionState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { uploadExamAction, type ExamUploadState } from "./actions";

export type Encounter = {
  kind: "appointment" | "consultation";
  id: string;
};

export default function ExamUploadForm({
  encounter,
}: {
  encounter: Encounter;
}) {
  const [state, formAction, isPending] = useActionState<
    ExamUploadState,
    FormData
  >(uploadExamAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const hiddenName =
    encounter.kind === "appointment" ? "appointment_id" : "consultation_id";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name={hiddenName} value={encounter.id} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Laboratório" required>
          <input
            name="lab_name"
            required
            placeholder="Ex.: Lab Avenida"
            className={inputClass}
          />
        </Field>
        <Field label="Tipo de exame">
          <input
            name="test_name"
            placeholder="Ex.: Hemograma completo"
            className={inputClass}
          />
        </Field>
        <Field label="Data do resultado">
          <input name="result_date" type="date" className={inputClass} />
        </Field>
        <Field label="Ficheiro (PDF / imagem, máx 10 MB)" required>
          <input
            name="file"
            type="file"
            required
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
          />
        </Field>
      </div>

      <Field label="Resumo / interpretação (opcional)">
        <textarea
          name="result_summary"
          rows={3}
          placeholder="Ex.: Hemoglobina ligeiramente baixa, restantes parâmetros normais."
          className={inputClass}
        />
      </Field>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Exame carregado — o paciente já o vê em /painel/exames.
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          O ficheiro fica num bucket privado; o paciente acede via link
          assinado.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            "A carregar…"
          ) : (
            <>
              <Upload className="size-4" />
              Carregar exame
            </>
          )}
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

