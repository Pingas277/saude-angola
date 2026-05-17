import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CONSULTATION_STATUS_LABELS,
  URGENCY_BADGE_CLASS,
  URGENCY_LABEL_PT,
  type Urgency,
} from "@/lib/triage";
import { formatDateTimePT } from "@/lib/labels";

export const metadata = { title: "Telemedicina · ANGOLASAUDE" };

type ConsultationRow = {
  id: string;
  status: string;
  ai_urgency: Urgency | null;
  ai_triage_summary: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

const ACTIVE = ["waiting", "in_progress", "scheduled"];

export default async function TelemedicinaHomePage() {
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
    .from("consultations")
    .select(
      "id, status, ai_urgency, ai_triage_summary, scheduled_at, started_at, ended_at, created_at"
    )
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const list = (rows as ConsultationRow[] | null) ?? [];
  const active = list.find((c) => ACTIVE.includes(c.status));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Telemedicina
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fale com um médico por vídeo, sem sair de casa.
          </p>
        </div>
        {!active && (
          <Link
            href="/painel/telemedicina/triagem"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            Iniciar nova consulta →
          </Link>
        )}
      </div>

      {active && (
        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/10 p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">
            {active.status === "waiting"
              ? "Está à espera de um médico"
              : active.status === "in_progress"
              ? "Consulta em curso"
              : "Consulta marcada"}
          </div>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            {active.ai_urgency
              ? `Urgência: ${URGENCY_LABEL_PT[active.ai_urgency]}`
              : "Consulta de telemedicina"}
          </h2>
          {active.ai_triage_summary && (
            <p className="mt-2 text-sm text-foreground">
              {active.ai_triage_summary}
            </p>
          )}
          <div className="mt-4">
            <Link
              href={`/painel/telemedicina/sala/${active.id}`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              Voltar à sala de espera →
            </Link>
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Consultas anteriores
        </h2>
        {list.filter((c) => !ACTIVE.includes(c.status)).length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Sem consultas de telemedicina anteriores.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {list
              .filter((c) => !ACTIVE.includes(c.status))
              .map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">
                      {formatDateTimePT(
                        c.ended_at ?? c.started_at ?? c.created_at
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-sm text-muted-foreground">
                      {CONSULTATION_STATUS_LABELS[c.status] ?? c.status}
                      {c.ai_triage_summary ? ` · ${c.ai_triage_summary}` : ""}
                    </div>
                  </div>
                  {c.ai_urgency && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${URGENCY_BADGE_CLASS[c.ai_urgency]}`}
                    >
                      {URGENCY_LABEL_PT[c.ai_urgency]}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}
