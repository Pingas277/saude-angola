import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/labels";
import StatCard from "../_ui/StatCard";
import SectionHeading from "../_ui/SectionHeading";
import PageHeading from "../_ui/PageHeading";
import EmptyState from "../_ui/EmptyState";
import QueueActions from "./QueueActions";

export const metadata = { title: "Recepção · ANGOLASAUDE" };

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  confirmed: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-muted text-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  no_show: "bg-destructive/10 text-destructive",
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
function greetingPT(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
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
        <EmptyState
          icon="🏥"
          title="Sem clínica atribuída"
          desc="Peça ao administrador da clínica para o associar à equipa."
        />
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

  const upcoming = list.filter(
    (a) => a.status === "scheduled" && a.scheduled_at >= nowIso
  );
  const checkedIn = list.filter((a) => a.status === "confirmed");
  const inConsultation = list.filter((a) => a.status === "in_progress");
  const finished = list.filter(
    (a) =>
      a.status === "completed" ||
      a.status === "cancelled" ||
      a.status === "no_show"
  );

  const firstName = profile?.full_name?.split(" ")[0] ?? "recepção";

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <PageHeading
        eyebrow={`${greetingPT()}, ${firstName}`}
        title="Fila de hoje"
        subtitle={`${list.length} ${list.length === 1 ? "marcação" : "marcações"} programadas para hoje na clínica.`}
        action={
          <Link
            href="/recepcao/marcar"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            + Nova marcação
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard tone="sky" icon="🕐" label="Por chegar" value={upcoming.length} hint="Aguardam check-in" />
        <StatCard tone="emerald" icon="✅" label="Em espera" value={checkedIn.length} hint="Check-in feito" />
        <StatCard tone="amber" icon="🩺" label="Em consulta" value={inConsultation.length} hint="No consultório" />
        <StatCard tone="slate" icon="📋" label="Finalizadas" value={finished.length} hint="Hoje" />
      </section>

      <Section title="A chegar / por confirmar">
        <List
          rows={list.filter((a) => a.status === "scheduled")}
          emptyText="Nenhum paciente por chegar."
          emptyIcon="🚶"
          showActions
        />
      </Section>

      <Section title="Em espera (check-in feito)">
        <List
          rows={checkedIn}
          emptyText="Sem pacientes em espera."
          emptyIcon="🪑"
          showActions
        />
      </Section>

      <Section title="Em consulta">
        <List
          rows={inConsultation}
          emptyText="Sem consultas em curso."
          emptyIcon="🩺"
          showActions
        />
      </Section>

      <Section title="Finalizadas hoje">
        <List
          rows={finished}
          emptyText="Nenhuma consulta finalizada ainda."
          emptyIcon="✅"
        />
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
    <section className="mt-10">
      <SectionHeading title={title} />
      {children}
    </section>
  );
}

function List({
  rows,
  emptyText,
  emptyIcon,
  showActions,
}: {
  rows: ApptRow[];
  emptyText: string;
  emptyIcon?: string;
  showActions?: boolean;
}) {
  if (!rows.length) {
    return <EmptyState icon={emptyIcon ?? "—"} title={emptyText} />;
  }
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {rows.map((a) => {
        const p = pickPatient(a.patient);
        const dr = pickDoctor(a.doctor);
        return (
          <li
            key={a.id}
            className="flex flex-wrap items-center gap-4 px-5 py-4"
          >
            <div className="w-16 shrink-0 text-sm font-bold text-foreground">
              {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground">{p.name}</div>
              <div className="mt-0.5 truncate text-sm text-muted-foreground">
                Dr(a). {dr.name}
                {dr.specialty ? ` · ${dr.specialty}` : ""}
                {p.phone ? ` · ${p.phone}` : ""}
                {a.reason ? ` · ${a.reason}` : ""}
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_BADGE[a.status] ?? "bg-muted text-foreground"
              }`}
            >
              {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
              {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
            </span>
            {showActions && <QueueActions appointmentId={a.id} status={a.status} />}
          </li>
        );
      })}
    </ul>
  );
}
