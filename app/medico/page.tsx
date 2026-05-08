import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/labels";

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

export default async function MedicoHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

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

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Bom dia, Doutor
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Resumo da sua atividade clínica.
        </p>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Consultas hoje" value={todayList.length.toString()} hint="No total" />
        <StatCard
          label="Próximas hoje"
          value={upcomingToday.length.toString()}
          hint="Ainda por atender"
        />
        <StatCard
          label="Próximas consultas"
          value={(upcomingCount ?? 0).toString()}
          hint="Marcadas e por atender"
        />
        <StatCard
          label="Receitas emitidas"
          value={(rxCount ?? 0).toString()}
          hint={`${recordCount ?? 0} registos clínicos`}
        />
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Agenda de hoje
          </h2>
          <Link
            href="/medico/agenda"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Ver agenda completa →
          </Link>
        </div>

        {todayList.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Não tem consultas marcadas para hoje.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {todayList.map((a) => {
              const patient = pickPatient(a.patient);
              return (
                <li key={a.id}>
                  <Link
                    href={`/medico/consulta/${a.id}`}
                    className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-emerald-50/40"
                  >
                    <div className="w-24 shrink-0 text-sm font-medium text-slate-900">
                      {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">{patient.name}</div>
                      <div className="mt-0.5 truncate text-sm text-slate-600">
                        {a.duration_minutes} min
                        {a.reason ? ` · ${a.reason}` : ""}
                      </div>
                    </div>
                    <Badge className={STATUS_BADGE[a.status] ?? "bg-slate-100 text-slate-700"}>
                      {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700">
                      {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
                    </Badge>
                    <span aria-hidden className="text-slate-400">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Telemedicina
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {(teleWaitingCount ?? 0) > 0
                ? `${teleWaitingCount} paciente(s) à espera de atendimento por vídeo`
                : "Sem pacientes em espera no momento"}
            </h2>
          </div>
          <Link
            href="/medico/telemedicina"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Abrir lista →
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ActionCard
          href="/medico/agenda"
          title="Ver agenda completa"
          desc="Próximas consultas e histórico."
        />
        <ActionCard
          href="/medico/pacientes"
          title="Lista de pacientes"
          desc="Pacientes que já consultou."
        />
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function ActionCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:bg-emerald-50/40"
    >
      <div>
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 text-sm text-slate-600">{desc}</div>
      </div>
      <span
        aria-hidden
        className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
      >
        →
      </span>
    </Link>
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

