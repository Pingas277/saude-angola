import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export const metadata = { title: "Telemedicina · Saúde Angola" };

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

type PatientCard = {
  id: string;
  name: string;
  age: number | null;
  allergies: string[];
  chronicConditions: string[];
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

function pickPatient(p: WaitingRow["patient"]): PatientCard {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r)
    return {
      id: "",
      name: "Paciente",
      age: null,
      allergies: [],
      chronicConditions: [],
    };
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return {
    id: r.id,
    name: prof?.full_name ?? "Paciente",
    age: ageFromDob(r.date_of_birth),
    allergies: r.allergies ?? [],
    chronicConditions: r.chronic_conditions ?? [],
  };
}

export default async function TelemedicinaListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const baseSelect =
    "id, status, ai_urgency, ai_triage_summary, created_at, patient:patients(id, date_of_birth, allergies, chronic_conditions, profile:profiles(full_name))";

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

  const waitingRows = ((waiting as WaitingRow[] | null) ?? []).slice().sort((a, b) => {
    const ar = a.ai_urgency ? URGENCY_RANK[a.ai_urgency] : 99;
    const br = b.ai_urgency ? URGENCY_RANK[b.ai_urgency] : 99;
    if (ar !== br) return ar - br;
    return a.created_at.localeCompare(b.created_at);
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <RealtimeRefresh />
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Telemedicina
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pacientes em espera, ordenados por urgência. Atualiza em tempo real.
          </p>
        </div>
        <form action={refreshAction}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ↻ Atualizar
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Em espera ({waitingRows.length})
        </h2>
        {waitingRows.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
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
                    "rounded-xl border bg-white p-5 " +
                    (isEmergency
                      ? "border-red-300 ring-2 ring-red-200"
                      : "border-slate-200")
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {p.name}
                        </span>
                        {p.age !== null && (
                          <span className="text-xs text-slate-500">
                            · {p.age} anos
                          </span>
                        )}
                        {urgency && (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${URGENCY_BADGE_CLASS[urgency]}`}
                          >
                            {URGENCY_LABEL_PT[urgency]}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          à espera há {waitMin} min
                        </span>
                      </div>

                      {(p.allergies.length > 0 || p.chronicConditions.length > 0) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.allergies.map((a) => (
                            <span
                              key={`a-${a}`}
                              className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700"
                              title="Alergia"
                            >
                              ⚠ {a}
                            </span>
                          ))}
                          {p.chronicConditions.map((cc) => (
                            <span
                              key={`c-${cc}`}
                              className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                              title="Doença crónica"
                            >
                              {cc}
                            </span>
                          ))}
                        </div>
                      )}

                      {row.ai_triage_summary && (
                        <p className="mt-2 text-sm text-slate-600">
                          {row.ai_triage_summary}
                        </p>
                      )}
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Minhas consultas de vídeo
        </h2>
        {(mine as WaitingRow[] | null)?.length ? (
          <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {(mine as WaitingRow[]).map((row) => {
              const p = pickPatient(row.patient);
              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="mt-0.5 truncate text-sm text-slate-600">
                      {CONSULTATION_STATUS_LABELS[row.status] ?? row.status} ·{" "}
                      {formatDateTimePT(row.created_at)}
                    </div>
                  </div>
                  {row.status === "in_progress" && (
                    <a
                      href={`/medico/telemedicina/sala/${row.id}`}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                      Voltar à sala →
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
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
