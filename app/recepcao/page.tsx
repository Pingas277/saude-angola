import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarPlus,
  UserPlus,
  Clock3,
  AlertTriangle,
  Armchair,
  Stethoscope,
  CheckCircle2,
  Timer,
  Phone,
  Video,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_TYPE_LABELS } from "@/lib/labels";
import StatCard from "../_ui/StatCard";
import ConsultasBarChart, {
  type ConsultaPoint,
} from "../_ui/charts/ConsultasBarChart";
import RecepHeader from "./_components/RecepHeader";
import QueueActions from "./QueueActions";

export const metadata = { title: "Recepção · ANGOLASAUDE" };

type ApptRow = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  appointment_type: string;
  reason: string | null;
  patient:
    | { id: string; profile: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null }
    | { id: string; profile: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null }[]
    | null;
  doctor:
    | { full_name: string | null; specialty: string | null }
    | { full_name: string | null; specialty: string | null }[]
    | null;
};

function pickPatient(p: ApptRow["patient"]) {
  const r = Array.isArray(p) ? p[0] : p;
  const prof = r && (Array.isArray(r.profile) ? r.profile[0] : r.profile);
  return {
    name: prof?.full_name ?? "Paciente",
    phone: prof?.phone ?? null,
  };
}
function pickDoctor(d: ApptRow["doctor"]) {
  const r = Array.isArray(d) ? d[0] : d;
  return { name: r?.full_name ?? "—", specialty: r?.specialty ?? null };
}
function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "—";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function endOfTodayISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
function greetingPT(d = new Date()) {
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
    .select("clinic_id, full_name, clinic:clinics(name)")
    .eq("id", user.id)
    .maybeSingle();
  const clinicId = profile?.clinic_id;
  if (!clinicId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Sem clínica atribuída
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Peça ao administrador da clínica para o associar à equipa.
          </p>
        </div>
      </main>
    );
  }

  const clinic = Array.isArray(profile?.clinic)
    ? profile?.clinic[0]
    : profile?.clinic;
  const nowIso = new Date().toISOString();

  // 7-day flow window starts here for the chart
  const start7 = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 6);
    return d;
  })();

  const [{ data: rows }, { data: flow7 }] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name, phone)), doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)"
      )
      .eq("clinic_id", clinicId)
      .gte("scheduled_at", startOfTodayISO())
      .lte("scheduled_at", endOfTodayISO())
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("appointments")
      .select("scheduled_at, status")
      .eq("clinic_id", clinicId)
      .gte("scheduled_at", start7.toISOString()),
  ]);

  // 7-day flow series
  const flowBuckets = new Map<string, number>();
  for (const a of (flow7 as { scheduled_at: string; status: string }[] | null) ?? []) {
    if (["cancelled", "no_show"].includes(a.status)) continue;
    const k = new Date(a.scheduled_at).toISOString().slice(0, 10);
    flowBuckets.set(k, (flowBuckets.get(k) ?? 0) + 1);
  }
  const flow7Series: ConsultaPoint[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start7);
    d.setDate(start7.getDate() + i);
    const k = d.toISOString().slice(0, 10);
    flow7Series.push({
      date: k,
      label: d.toLocaleDateString("pt-PT", { weekday: "short" }),
      total: flowBuckets.get(k) ?? 0,
    });
  }
  const flow7Total = flow7Series.reduce((s, p) => s + p.total, 0);

  const list = (rows as ApptRow[] | null) ?? [];

  const aChegar = list.filter((a) => a.status === "scheduled");
  const emEspera = list.filter((a) => a.status === "confirmed");
  const emConsulta = list.filter((a) => a.status === "in_progress");
  const concluidas = list.filter((a) =>
    ["completed", "cancelled", "no_show"].includes(a.status)
  );
  const atrasados = aChegar.filter((a) => a.scheduled_at < nowIso);
  const nextArrival = aChegar.find((a) => a.scheduled_at >= nowIso);

  const firstName = profile?.full_name?.split(" ")[0] ?? "recepção";
  const todayLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <RecepHeader
        eyebrow={`${greetingPT()}, ${firstName}`}
        title="Fila de hoje"
        subtitle={`${clinic?.name ? clinic.name + " · " : ""}${todayLabel} · ${list.length} marcaç${list.length === 1 ? "ão" : "ões"}`}
        icon={<ClipboardList className="size-5" />}
        action={
          <>
            <Link
              href="/recepcao/marcar?modo=walkin"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <UserPlus className="size-4" />
              Walk-in
            </Link>
            <Link
              href="/recepcao/marcar"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <CalendarPlus className="size-4" />
              Nova marcação
            </Link>
          </>
        }
      />

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard tone="sky" icon={<Clock3 className="size-5" />} label="Por chegar" value={aChegar.length} hint="agendados" />
        <StatCard tone="red" icon={<AlertTriangle className="size-5" />} label="Atrasados" value={atrasados.length} hint="passou a hora" />
        <StatCard tone="emerald" icon={<Armchair className="size-5" />} label="Em espera" value={emEspera.length} hint="check-in feito" />
        <StatCard tone="amber" icon={<Stethoscope className="size-5" />} label="Em consulta" value={emConsulta.length} hint="no consultório" />
        <StatCard tone="slate" icon={<CheckCircle2 className="size-5" />} label="Concluídas" value={concluidas.length} hint="hoje" />
        <StatCard tone="sky" icon={<Timer className="size-5" />} label="Próxima" value={nextArrival ? hhmm(nextArrival.scheduled_at) : "—"} hint={nextArrival ? pickPatient(nextArrival.patient).name : "sem chegadas"} />
      </section>

      {/* 7-day flow */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              Fluxo da fila · últimos 7 dias
            </div>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {flow7Total}{" "}
              <span className="text-xs font-medium text-muted-foreground">
                consultas
              </span>
            </h2>
          </div>
        </div>
        <div className="mt-4">
          <ConsultasBarChart data={flow7Series} />
        </div>
      </section>

      {/* Queue board */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Column
          title="A chegar"
          icon={<Clock3 className="size-4" />}
          count={aChegar.length}
          rows={aChegar}
          empty="Ninguém por chegar."
          nowIso={nowIso}
        />
        <Column
          title="Em espera"
          icon={<Armchair className="size-4" />}
          count={emEspera.length}
          rows={emEspera}
          empty="Sala de espera vazia."
          nowIso={nowIso}
        />
        <Column
          title="Em consulta"
          icon={<Stethoscope className="size-4" />}
          count={emConsulta.length}
          rows={emConsulta}
          empty="Nenhuma consulta em curso."
          nowIso={nowIso}
        />
        <Column
          title="Concluídas"
          icon={<CheckCircle2 className="size-4" />}
          count={concluidas.length}
          rows={concluidas}
          empty="Ainda nada concluído."
          nowIso={nowIso}
          quiet
        />
      </section>
    </main>
  );
}

function Column({
  title,
  icon,
  count,
  rows,
  empty,
  nowIso,
  quiet,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  rows: ApptRow[];
  empty: string;
  nowIso: string;
  quiet?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-muted/30">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-primary">{icon}</span>
          {title}
        </div>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto p-3">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-xs text-muted-foreground">
            {empty}
          </div>
        ) : (
          rows.map((a) => (
            <QueueCard key={a.id} a={a} nowIso={nowIso} quiet={quiet} />
          ))
        )}
      </div>
    </div>
  );
}

function QueueCard({
  a,
  nowIso,
  quiet,
}: {
  a: ApptRow;
  nowIso: string;
  quiet?: boolean;
}) {
  const p = pickPatient(a.patient);
  const dr = pickDoctor(a.doctor);
  const late = a.status === "scheduled" && a.scheduled_at < nowIso;

  return (
    <div
      className={
        "rounded-xl border bg-card p-3.5 transition-colors " +
        (late
          ? "border-destructive/40 ring-1 ring-destructive/20"
          : "border-border")
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            "grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold " +
            (quiet
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary")
          }
        >
          {initials(p.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {p.name}
            </span>
            {late && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                <AlertTriangle className="size-2.5" />
                atrasado
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            Dr(a). {dr.name}
            {dr.specialty ? ` · ${dr.specialty}` : ""}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold tabular-nums text-foreground">
            {hhmm(a.scheduled_at)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {a.duration_minutes}m
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          {a.appointment_type === "telemedicine" ? (
            <Video className="size-3" />
          ) : (
            <MapPin className="size-3" />
          )}
          {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
        </span>
        {p.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="size-3" />
            {p.phone}
          </span>
        )}
        {a.reason && <span className="truncate">· {a.reason}</span>}
      </div>

      <div className="mt-3 border-t border-border pt-2.5">
        <QueueActions appointmentId={a.id} status={a.status} />
      </div>
    </div>
  );
}
