import { redirect } from "next/navigation";
import {
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Video,
  MapPin,
  Clock3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/labels";
import StatCard from "../../_ui/StatCard";
import AdminHeader from "../_components/AdminHeader";

export const metadata = { title: "Agenda da Clínica · Lunga" };

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
  patient:
    | { id: string; profile: { full_name: string | null } | { full_name: string | null }[] | null }
    | { id: string; profile: { full_name: string | null } | { full_name: string | null }[] | null }[]
    | null;
  doctor:
    | { full_name: string | null; specialty: string | null }
    | { full_name: string | null; specialty: string | null }[]
    | null;
};

function pickPatientName(p: ApptRow["patient"]): string {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r) return "Paciente";
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return prof?.full_name ?? "Paciente";
}
function pickDoctor(d: ApptRow["doctor"]) {
  const r = Array.isArray(d) ? d[0] : d;
  return { name: r?.full_name ?? "—", specialty: r?.specialty ?? null };
}
function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles!patients_profile_id_fkey(full_name)), doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)";

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

  const up = (upcoming as ApptRow[] | null) ?? [];
  const hist = (past as ApptRow[] | null) ?? [];

  const todayStr = new Date().toDateString();
  const todayCount = up.filter(
    (a) => new Date(a.scheduled_at).toDateString() === todayStr
  ).length;
  const doneCount = hist.filter((a) => a.status === "completed").length;

  // Group upcoming by day
  const groups = new Map<string, ApptRow[]>();
  for (const a of up) {
    const k = dayKey(a.scheduled_at);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(a);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <AdminHeader
        eyebrow="Operação"
        title="Agenda da clínica"
        subtitle="Todas as marcações dos médicos da clínica, num só sítio."
        icon={<CalendarDays className="size-5" />}
      />

      <section className="mt-8 grid grid-cols-3 gap-4">
        <StatCard tone="emerald" icon={<CalendarClock className="size-5" />} label="Hoje" value={todayCount} hint="marcações" />
        <StatCard tone="sky" icon={<CalendarDays className="size-5" />} label="Próximas" value={up.length} hint="futuras" />
        <StatCard tone="slate" icon={<CheckCircle2 className="size-5" />} label="Concluídas" value={doneCount} hint="histórico recente" />
      </section>

      {/* Upcoming grouped by day */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Próximas</h2>
        {up.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Sem marcações futuras.
          </div>
        ) : (
          <div className="mt-3 space-y-6">
            {[...groups.entries()].map(([day, rows]) => (
              <div
                key={day}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                    {day}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {rows.length} consulta{rows.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {rows.map((a) => (
                    <Row key={a.id} a={a} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Histórico</h2>
        {hist.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Sem marcações anteriores.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {hist.map((a) => (
              <Row key={a.id} a={a} muted />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Row({ a, muted }: { a: ApptRow; muted?: boolean }) {
  const dr = pickDoctor(a.doctor);
  const time = new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(a.scheduled_at).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
  });
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <div className="w-16 shrink-0 text-center">
        <div
          className={
            "rounded-md px-2 py-1 text-xs font-semibold " +
            (muted
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary")
          }
        >
          {time}
        </div>
        {muted && (
          <div className="mt-0.5 text-[10px] text-muted-foreground">{date}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">
          {pickPatientName(a.patient)}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          Dr(a). {dr.name}
          {dr.specialty ? ` · ${dr.specialty}` : ""}
          {a.reason ? ` · ${a.reason}` : ""}
        </div>
      </div>
      <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
        {a.appointment_type === "telemedicine" ? (
          <Video className="size-3.5" />
        ) : (
          <MapPin className="size-3.5" />
        )}
        <Clock3 className="size-3.5" />
        {a.duration_minutes}m
      </span>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          STATUS_BADGE[a.status] ?? "bg-muted text-foreground"
        }`}
      >
        {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
      </span>
    </li>
  );
}
