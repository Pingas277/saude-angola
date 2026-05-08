import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  formatDateTimePT,
} from "@/lib/labels";

export const metadata = { title: "Agenda da Clínica · Saúde Angola" };

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
  doctor: { full_name: string | null; specialty: string | null } |
    { full_name: string | null; specialty: string | null }[] | null;
};

function pickPatientName(p: ApptRow["patient"]): string {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r) return "Paciente";
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return prof?.full_name ?? "Paciente";
}
function pickDoctor(d: ApptRow["doctor"]): { name: string; specialty: string | null } {
  const r = Array.isArray(d) ? d[0] : d;
  return { name: r?.full_name ?? "—", specialty: r?.specialty ?? null };
}

export default async function ClinicAgendaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: admin } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (admin?.role !== "admin" || !admin.clinic_id) redirect("/clinica");

  const nowIso = new Date().toISOString();
  const select =
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name)), doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)";

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("appointments")
      .select(select)
      .eq("clinic_id", admin.clinic_id)
      .gte("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("appointments")
      .select(select)
      .eq("clinic_id", admin.clinic_id)
      .lt("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: false })
      .limit(40),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Agenda da clínica
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Todas as marcações dos médicos da clínica.
        </p>
      </div>

      <Section title="Próximas">
        <List rows={(upcoming as ApptRow[] | null) ?? []} emptyText="Sem marcações futuras." />
      </Section>

      <Section title="Histórico">
        <List rows={(past as ApptRow[] | null) ?? []} emptyText="Sem marcações anteriores." />
      </Section>
    </main>
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

function List({ rows, emptyText }: { rows: ApptRow[]; emptyText: string }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {rows.map((a) => {
        const dr = pickDoctor(a.doctor);
        return (
          <li
            key={a.id}
            className="flex flex-wrap items-center gap-4 px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-900">
                {formatDateTimePT(a.scheduled_at)}
              </div>
              <div className="mt-0.5 truncate text-sm text-slate-600">
                {pickPatientName(a.patient)} · Dr(a). {dr.name}
                {dr.specialty ? ` (${dr.specialty})` : ""}
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
          </li>
        );
      })}
    </ul>
  );
}
