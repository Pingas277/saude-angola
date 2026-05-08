import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/labels";
import StatCard from "../_ui/StatCard";
import ActionCard from "../_ui/ActionCard";
import SectionHeading from "../_ui/SectionHeading";
import PageHeading from "../_ui/PageHeading";
import EmptyState from "../_ui/EmptyState";

export const metadata = { title: "Painel do Médico · Saúde Angola" };

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-sky-100 text-sky-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-red-100 text-red-700",
};

type ApptRow = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  appointment_type: string;
  reason: string | null;
  patient: {
    id: string;
    profile: { full_name: string | null } | { full_name: string | null }[] | null;
  } | { id: string; profile: { full_name: string | null } | { full_name: string | null }[] | null }[] | null;
};

function pickPatient(p: ApptRow["patient"]): { id: string; name: string } {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r) return { id: "", name: "—" };
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return { id: r.id, name: prof?.full_name ?? "Paciente" };
}

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function endOfTodayISO(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function greetingPT(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

export default async function MedicoHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const startToday = startOfTodayISO();
  const endToday = endOfTodayISO();
  const nowIso = new Date().toISOString();

  const baseSelect =
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name))";

  const [
    { data: today },
    { count: upcomingCount },
    { count: rxCount },
    { count: recordCount },
    { count: teleWaitingCount },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select(baseSelect)
      .eq("doctor_id", user.id)
      .gte("scheduled_at", startToday)
      .lte("scheduled_at", endToday)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .gte("scheduled_at", nowIso)
      .in("status", ["scheduled", "confirmed", "in_progress"]),
    supabase
      .from("prescriptions")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", user.id),
    supabase
      .from("medical_records")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", user.id),
    supabase
      .from("consultations")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting")
      .is("doctor_id", null),
  ]);

  const todayList = (today as ApptRow[] | null) ?? [];
  const upcomingToday = todayList.filter((a) => a.scheduled_at >= nowIso);

  const lastName = profile?.full_name?.split(" ").slice(-1)[0] ?? "";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeading
        eyebrow={`${greetingPT()}, Doutor${lastName ? ` ${lastName}` : ""}`}
        title="Painel clínico"
        subtitle="Resumo da sua atividade de hoje. Atalhos para a agenda, telemedicina e pacientes."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          tone="emerald"
          icon="🗓️"
          label="Hoje"
          value={todayList.length}
          hint={
            upcomingToday.length === 1
              ? `${upcomingToday.length} ainda por atender`
              : `${upcomingToday.length} ainda por atender`
          }
        />
        <StatCard
          tone="sky"
          icon="📅"
          label="Próximas"
          value={upcomingCount ?? 0}
          hint="Marcadas e confirmadas"
        />
        <StatCard
          tone="amber"
          icon="💊"
          label="Receitas"
          value={rxCount ?? 0}
          hint="Total emitidas"
        />
        <StatCard
          tone="slate"
          icon="📋"
          label="Registos"
          value={recordCount ?? 0}
          hint="Anotações clínicas"
        />
      </section>

      {/* Telemedicina banner */}
      <section
        className={
          "mt-8 overflow-hidden rounded-2xl border " +
          ((teleWaitingCount ?? 0) > 0
            ? "border-red-200 bg-gradient-to-br from-red-50 via-white to-amber-50"
            : "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50")
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div
              className={
                "grid h-12 w-12 place-items-center rounded-xl text-2xl " +
                ((teleWaitingCount ?? 0) > 0
                  ? "bg-red-600 text-white"
                  : "bg-emerald-600 text-white")
              }
            >
              {(teleWaitingCount ?? 0) > 0 ? "🚨" : "🎥"}
            </div>
            <div>
              <div
                className={
                  "text-xs font-bold uppercase tracking-wider " +
                  ((teleWaitingCount ?? 0) > 0
                    ? "text-red-700"
                    : "text-emerald-700")
                }
              >
                Telemedicina
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {(teleWaitingCount ?? 0) > 0
                  ? `${teleWaitingCount} paciente${(teleWaitingCount ?? 0) === 1 ? "" : "s"} à espera`
                  : "Sem pacientes em espera"}
              </h2>
              <p className="text-sm text-slate-600">
                {(teleWaitingCount ?? 0) > 0
                  ? "Atendimento por vídeo pendente."
                  : "Será notificado quando alguém entrar na fila."}
              </p>
            </div>
          </div>
          <Link
            href="/medico/telemedicina"
            className={
              "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition " +
              ((teleWaitingCount ?? 0) > 0
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-emerald-600 text-white hover:bg-emerald-700")
            }
          >
            Abrir lista →
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          title="Agenda de hoje"
          action={{ href: "/medico/agenda", label: "Ver agenda completa" }}
        />

        {todayList.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="Sem consultas marcadas para hoje"
            desc="Quando algum paciente marcar consulta consigo, aparece aqui."
          />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {todayList.map((a) => {
              const patient = pickPatient(a.patient);
              return (
                <li key={a.id}>
                  <Link
                    href={`/medico/consulta/${a.id}`}
                    className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-emerald-50/40"
                  >
                    <div className="w-20 shrink-0 text-sm font-bold text-slate-900">
                      {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">
                        {patient.name}
                      </div>
                      <div className="mt-0.5 truncate text-sm text-slate-600">
                        {a.duration_minutes} min
                        {a.reason ? ` · ${a.reason}` : ""}
                      </div>
                    </div>
                    <Badge
                      className={
                        STATUS_BADGE[a.status] ?? "bg-slate-100 text-slate-700"
                      }
                    >
                      {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700">
                      {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
                    </Badge>
                    <span aria-hidden className="text-slate-400 group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <SectionHeading title="Atalhos" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActionCard
            href="/medico/agenda"
            icon="📅"
            title="Agenda completa"
            desc="Próximas consultas e histórico do mês."
          />
          <ActionCard
            href="/medico/pacientes"
            icon="🩺"
            title="Os meus pacientes"
            desc="Pacientes que já consultou."
          />
          <ActionCard
            href="/medico/telemedicina"
            icon="🎥"
            title="Telemedicina"
            desc="Atender pacientes por vídeo."
          />
          <ActionCard
            href="/medico/perfil"
            icon="👤"
            title="O meu perfil"
            desc="Cédula profissional, especialidade, contactos."
          />
        </div>
      </section>
    </main>
  );
}

function Badge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
