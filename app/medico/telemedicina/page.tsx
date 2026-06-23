import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  Video,
  AlertTriangle,
  Clock3,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClaimButton } from "./ClaimButton";
import RealtimeRefresh from "./RealtimeRefresh";
import {
  CONSULTATION_STATUS_LABELS,
  URGENCY_BADGE_CLASS,
  URGENCY_LABEL_PT,
  type Urgency,
} from "@/lib/triage";
import { formatDateTimePT } from "@/lib/labels";
import StatCard from "../../_ui/StatCard";
import MedicoHeader from "../_components/MedicoHeader";

export const metadata = { title: "Telemedicina · Lunga" };

const URGENCY_RANK: Record<Urgency, number> = {
  emergency: 0,
  high: 1,
  medium: 2,
  low: 3,
};

type PatientPayload = {
  id: string;
  date_of_birth: string | null;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  profile: { full_name: string | null } | { full_name: string | null }[] | null;
};

type WaitingRow = {
  id: string;
  status: string;
  ai_urgency: Urgency | null;
  ai_triage_summary: string | null;
  created_at: string;
  patient: PatientPayload | PatientPayload[] | null;
};

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}
function pickPatient(p: WaitingRow["patient"]) {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r)
    return { name: "Paciente", age: null as number | null, allergies: [] as string[], chronic: [] as string[] };
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return {
    name: prof?.full_name ?? "Paciente",
    age: ageFromDob(r.date_of_birth),
    allergies: r.allergies ?? [],
    chronic: r.chronic_conditions ?? [],
  };
}
function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "—";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default async function TelemedicinaListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const baseSelect =
    "id, status, ai_urgency, ai_triage_summary, created_at, patient:patients(id, date_of_birth, allergies, chronic_conditions, profile:profiles!patients_profile_id_fkey(full_name))";

  const [{ data: waiting }, { data: mine }] = await Promise.all([
    supabase
      .from("consultations")
      .select(baseSelect)
      .eq("status", "waiting")
      .is("doctor_id", null)
      .eq("consultation_type", "video")
      .order("created_at", { ascending: true }),
    supabase
      .from("consultations")
      .select(baseSelect)
      .eq("doctor_id", user.id)
      .in("status", ["in_progress", "completed"])
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const waitingRows = ((waiting as WaitingRow[] | null) ?? [])
    .slice()
    .sort((a, b) => {
      const ar = a.ai_urgency ? URGENCY_RANK[a.ai_urgency] : 99;
      const br = b.ai_urgency ? URGENCY_RANK[b.ai_urgency] : 99;
      if (ar !== br) return ar - br;
      return a.created_at.localeCompare(b.created_at);
    });
  const mineRows = (mine as WaitingRow[] | null) ?? [];
  const emergencies = waitingRows.filter(
    (r) => r.ai_urgency === "emergency"
  ).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <RealtimeRefresh />
      <MedicoHeader
        eyebrow="Atendimento por vídeo"
        title="Telemedicina"
        subtitle="Pacientes em espera, ordenados por urgência. Atualiza em tempo real."
        icon={<Video className="size-5" />}
        action={
          <form action={refreshAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className="size-4" />
              Atualizar
            </button>
          </form>
        }
      />

      <section className="mt-8 grid grid-cols-3 gap-4">
        <StatCard tone="sky" icon={<Clock3 className="size-5" />} label="Em espera" value={waitingRows.length} hint="na fila" />
        <StatCard tone="red" icon={<AlertTriangle className="size-5" />} label="Emergências" value={emergencies} hint="prioridade máxima" />
        <StatCard tone="slate" icon={<Video className="size-5" />} label="Minhas" value={mineRows.length} hint="vídeo recentes" />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">
          Em espera ({waitingRows.length})
        </h2>
        {waitingRows.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            Nenhum paciente está à espera no momento.
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {waitingRows.map((row) => {
              const p = pickPatient(row.patient);
              const urgency = row.ai_urgency;
              const waitMin = Math.max(
                0,
                Math.round(
                  (Date.now() - new Date(row.created_at).getTime()) / 60000
                )
              );
              const isEmergency = urgency === "emergency";
              return (
                <li
                  key={row.id}
                  className={
                    "rounded-2xl border bg-card p-5 " +
                    (isEmergency
                      ? "border-destructive/40 ring-1 ring-destructive/20"
                      : "border-border")
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span
                        className={
                          "grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold " +
                          (isEmergency
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary")
                        }
                      >
                        {initials(p.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {p.name}
                          </span>
                          {p.age !== null && (
                            <span className="text-xs text-muted-foreground">
                              {p.age} anos
                            </span>
                          )}
                          {urgency && (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${URGENCY_BADGE_CLASS[urgency]}`}
                            >
                              {URGENCY_LABEL_PT[urgency]}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="size-3" />
                            {waitMin} min
                          </span>
                        </div>

                        {(p.allergies.length > 0 || p.chronic.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {p.allergies.map((a) => (
                              <span
                                key={`a-${a}`}
                                className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"
                              >
                                ⚠ {a}
                              </span>
                            ))}
                            {p.chronic.map((cc) => (
                              <span
                                key={`c-${cc}`}
                                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400"
                              >
                                {cc}
                              </span>
                            ))}
                          </div>
                        )}

                        {row.ai_triage_summary && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {row.ai_triage_summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <ClaimButton consultationId={row.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">
          Minhas consultas de vídeo
        </h2>
        {mineRows.length ? (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {mineRows.map((row) => {
              const p = pickPatient(row.patient);
              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {initials(p.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {CONSULTATION_STATUS_LABELS[row.status] ?? row.status} ·{" "}
                      {formatDateTimePT(row.created_at)}
                    </div>
                  </div>
                  {row.status === "in_progress" && (
                    <a
                      href={`/medico/telemedicina/sala/${row.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Voltar à sala
                      <ArrowRight className="size-3.5" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Sem consultas de vídeo recentes.
          </div>
        )}
      </section>
    </main>
  );
}

async function refreshAction() {
  "use server";
  revalidatePath("/medico/telemedicina");
}
