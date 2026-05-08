import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/labels";
import QueueActions from "./QueueActions";

export const metadata = { title: "Recepção · Saúde Angola" };

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
    profile: { full_name: string | null; phone: string | null } |
      { full_name: string | null; phone: string | null }[] | null;
  } | { id: string; profile: { full_name: string | null; phone: string | null } |
      { full_name: string | null; phone: string | null }[] | null }[] | null;
  doctor: { full_name: string | null; specialty: string | null } |
    { full_name: string | null; specialty: string | null }[] | null;
};

function pickPatient(p: ApptRow["patient"]): { id: string; name: string; phone: string | null } {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r) return { id: "", name: "Paciente", phone: null };
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return {
    id: r.id,
    name: prof?.full_name ?? "Paciente",
    phone: prof?.phone ?? null,
  };
}
function pickDoctor(d: ApptRow["doctor"]): { name: string; specialty: string | null } {
  const r = Array.isArray(d) ? d[0] : d;
  return { name: r?.full_name ?? "—", specialty: r?.specialty ?? null };
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

export default async function RecepcaoHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const clinicId = profile?.clinic_id;
  if (!clinicId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Sem clínica atribuída</h1>
        <p className="mt-2 text-sm text-slate-600">
          Peça ao administrador da clínica para o associar à equipa.
        </p>
      </main>
    );
  }

  const startToday = startOfTodayISO();
  const endToday = endOfTodayISO();
  const nowIso = new Date().toISOString();
  const select =
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name, phone)), doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)";

  const { data: rows } = await supabase
    .from("appointments")
    .select(select)
    .eq("clinic_id", clinicId)
    .gte("scheduled_at", startToday)
    .lte("scheduled_at", endToday)
    .order("scheduled_at", { ascending: true });

  const list = (rows as ApptRow[] | null) ?? [];

  // Bucketize for kanban-style columns
  const upcoming = list.filter(
    (a) => a.status === "scheduled" && a.scheduled_at >= nowIso
  );
  const checkedIn = list.filter((a) => a.status === "confirmed");
  const inConsultation = list.filter((a) => a.status === "in_progress");
  const finished = list.filter(
    (a) => a.status === "completed" || a.status === "cancelled" || a.status === "no_show"
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fila de hoje
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {list.length} {list.length === 1 ? "marcação" : "marcações"} para hoje na clínica.
          </p>
        </div>
        <Link
          href="/recepcao/marcar"
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          + Nova marcação
        </Link>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Por chegar" value={upcoming.length} accent="bg-sky-100 text-sky-800" />
        <Stat label="Em espera" value={checkedIn.length} accent="bg-emerald-100 text-emerald-800" />
        <Stat label="Em consulta" value={inConsultation.length} accent="bg-amber-100 text-amber-800" />
        <Stat label="Finalizadas" value={finished.length} accent="bg-slate-100 text-slate-700" />
      </section>

      <Section title="A chegar / por confirmar">
        <List
          rows={list.filter((a) => a.status === "scheduled")}
          emptyText="Nenhum paciente por chegar."
          showActions
        />
      </Section>

      <Section title="Em espera (check-in feito)">
        <List rows={checkedIn} emptyText="Sem pacientes em espera." showActions />
      </Section>

      <Section title="Em consulta">
        <List rows={inConsultation} emptyText="Sem consultas em curso." showActions />
      </Section>

      <Section title="Finalizadas hoje">
        <List rows={finished} emptyText="Nenhuma consulta finalizada ainda." />
      </Section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${accent}`}>
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function List({
  rows,
  emptyText,
  showActions,
}: {
  rows: ApptRow[];
  emptyText: string;
  showActions?: boolean;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {rows.map((a) => {
        const p = pickPatient(a.patient);
        const dr = pickDoctor(a.doctor);
        return (
          <li
            key={a.id}
            className="flex flex-wrap items-center gap-4 px-5 py-4"
          >
            <div className="w-16 shrink-0 text-sm font-medium text-slate-900">
              {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-900">{p.name}</div>
              <div className="mt-0.5 truncate text-sm text-slate-600">
                Dr(a). {dr.name}
                {dr.specialty ? ` · ${dr.specialty}` : ""}
                {p.phone ? ` · ${p.phone}` : ""}
                {a.reason ? ` · ${a.reason}` : ""}
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_BADGE[a.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
            </span>
            {showActions && <QueueActions appointmentId={a.id} status={a.status} />}
          </li>
        );
      })}
    </ul>
  );
}
