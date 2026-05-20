import { redirect } from "next/navigation";
import {
  Pill,
  Download,
  FileText,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Stethoscope,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDatePT, formatDateTimePT } from "@/lib/labels";

export const metadata = { title: "Receitas · Lunga" };

type Medication = {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

type RxRow = {
  id: string;
  medications: Medication[] | unknown;
  qr_code: string;
  notes: string | null;
  issued_at: string;
  expires_at: string | null;
  doctor:
    | { full_name: string | null; specialty: string | null }
    | { full_name: string | null; specialty: string | null }[]
    | null;
};

function pickDoctor(v: RxRow["doctor"]): {
  name: string;
  specialty: string | null;
} {
  const r = Array.isArray(v) ? v[0] : v;
  return { name: r?.full_name ?? "—", specialty: r?.specialty ?? null };
}
function asMeds(v: unknown): Medication[] {
  return Array.isArray(v) ? (v as Medication[]) : [];
}

export default async function ReceitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!patient) redirect("/perfil?onboarding=1");

  const { data: rows } = await supabase
    .from("prescriptions")
    .select(
      "id, medications, qr_code, notes, issued_at, expires_at, doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty)"
    )
    .eq("patient_id", patient.id)
    .order("issued_at", { ascending: false });

  const list = (rows as RxRow[] | null) ?? [];
  const now = Date.now();
  const activeCount = list.filter(
    (r) => !r.expires_at || new Date(r.expires_at).getTime() >= now
  ).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-primary">
            Saúde
          </div>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            <Pill className="size-6 text-primary" />
            As minhas receitas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.length === 0
              ? "Receitas médicas emitidas pelos seus médicos."
              : `${list.length} receita(s) · ${activeCount} válida(s)`}
          </p>
        </div>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Pill className="size-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Ainda não tem receitas
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Após uma consulta, as receitas emitidas pelo médico aparecem aqui —
            com código QR e PDF para a farmácia.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((rx) => {
            const meds = asMeds(rx.medications);
            const dr = pickDoctor(rx.doctor);
            const expired = rx.expires_at
              ? new Date(rx.expires_at).getTime() < now
              : false;
            return (
              <li
                key={rx.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Stethoscope className="size-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-foreground">
                        Dr(a). {dr.name}
                        {dr.specialty ? (
                          <span className="font-normal text-muted-foreground">
                            {" · "}
                            {dr.specialty}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" />
                        Emitida {formatDateTimePT(rx.issued_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " +
                        (expired
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary")
                      }
                    >
                      {expired ? (
                        <>
                          <XCircle className="size-3.5" /> Expirada
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5" /> Válida
                        </>
                      )}
                    </span>
                    {rx.expires_at && (
                      <span className="text-[11px] text-muted-foreground">
                        até {formatDatePT(rx.expires_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Medications */}
                <div className="p-5">
                  {meds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Sem medicação registada.
                    </p>
                  ) : (
                    <ol className="space-y-3">
                      {meds.map((m, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground">
                              {m.name ?? "—"}
                              {m.dosage ? (
                                <span className="text-muted-foreground">
                                  {" · "}
                                  {m.dosage}
                                </span>
                              ) : null}
                            </div>
                            {(m.frequency || m.duration || m.instructions) && (
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {[m.frequency, m.duration, m.instructions]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {rx.notes && (
                    <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Notas:{" "}
                      </span>
                      {rx.notes}
                    </p>
                  )}
                </div>

                {/* Footer actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-5 py-3">
                  <code className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    {rx.qr_code}
                  </code>
                  <a
                    href={`/api/receita/${rx.id}/pdf`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Download className="size-4" />
                    Descarregar PDF
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <FileText className="size-3.5" />
        Cada receita tem um código QR único, verificável na farmácia.
      </p>
    </main>
  );
}
