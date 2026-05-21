import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Pill,
  Stethoscope,
  User,
  Users,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/labels";
import ConsultasBarChart, {
  type ConsultaPoint,
} from "../_ui/charts/ConsultasBarChart";
import MedicoHeader from "./_components/MedicoHeader";

export const metadata = { title: "Painel do Médico · Lunga" };

const STATUS_BADGE: Record<string, { cls: string; dot: string }> = {
  scheduled: {
    cls: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
  },
  confirmed: {
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  in_progress: {
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  completed: {
    cls: "bg-slate-50 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  },
  cancelled: {
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
  no_show: {
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
};

type Profile = { full_name: string | null; avatar_url: string | null };
type Patient = { id: string; profile: Profile | Profile[] | null };
type ApptRow = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  appointment_type: string;
  reason: string | null;
  patient: Patient | Patient[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}
function patientFrom(p: ApptRow["patient"]) {
  const row = pickOne(p);
  const prof = pickOne(row?.profile ?? null);
  return {
    name: prof?.full_name ?? "Paciente",
    avatarUrl: prof?.avatar_url ?? null,
  };
}
function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "—";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
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

export default async function MedicoHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, specialty")
    .eq("id", user.id)
    .maybeSingle();

  const nowIso = new Date().toISOString();
  const baseSelect =
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name, avatar_url))";

  // 14-day window for trend chart
  const start14 = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 13);
    return d;
  })();

  const [
    { data: today },
    { count: upcomingCount },
    { count: rxCount },
    { count: recordCount },
    { count: teleWaitingCount },
    { data: appts14 },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select(baseSelect)
      .eq("doctor_id", user.id)
      .gte("scheduled_at", startOfTodayISO())
      .lte("scheduled_at", endOfTodayISO())
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
    supabase
      .from("appointments")
      .select("scheduled_at, status")
      .eq("doctor_id", user.id)
      .gte("scheduled_at", start14.toISOString()),
  ]);

  // 14-day series for the chart
  const buckets = new Map<string, number>();
  for (const a of (appts14 as { scheduled_at: string; status: string }[] | null) ?? []) {
    if (["cancelled", "no_show"].includes(a.status)) continue;
    const k = new Date(a.scheduled_at).toISOString().slice(0, 10);
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  const consultas14: ConsultaPoint[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(start14);
    d.setDate(start14.getDate() + i);
    const k = d.toISOString().slice(0, 10);
    consultas14.push({
      date: k,
      label: d.toLocaleDateString("pt-PT", { day: "2-digit" }),
      total: buckets.get(k) ?? 0,
    });
  }
  const totalLast14 = consultas14.reduce((s, p) => s + p.total, 0);

  const todayList = (today as ApptRow[] | null) ?? [];
  const pending = todayList.filter(
    (a) =>
      a.scheduled_at >= nowIso &&
      !["completed", "cancelled", "no_show"].includes(a.status)
  ).length;
  const waiting = teleWaitingCount ?? 0;
  const lastName = profile?.full_name?.split(" ").slice(-1)[0] ?? "";

  // The next consultation today, used to spotlight the upcoming patient.
  const nextUp = todayList.find(
    (a) =>
      a.scheduled_at >= nowIso &&
      !["completed", "cancelled", "no_show"].includes(a.status)
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <MedicoHeader
        eyebrow={`${greetingPT()}, Doutor${lastName ? ` ${lastName}` : ""}`}
        title="Painel clínico"
        subtitle={
          profile?.specialty
            ? `${profile.specialty} · atividade de hoje`
            : "Resumo da sua atividade de hoje."
        }
        icon={<Stethoscope className="size-5" />}
        action={
          <Link
            href="/medico/agenda"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
          >
            <CalendarDays className="size-4" />
            Agenda
          </Link>
        }
      />

      {/* ─── KPIs ─── */}
      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={CalendarClock}
          label="Consultas hoje"
          value={todayList.length}
          hint={`${pending} por atender`}
          color="from-sky-500 to-blue-600"
        />
        <StatTile
          icon={CalendarCheck}
          label="Próximas"
          value={upcomingCount ?? 0}
          hint="agendadas"
          color="from-emerald-500 to-teal-600"
        />
        <StatTile
          icon={Pill}
          label="Receitas"
          value={rxCount ?? 0}
          hint="emitidas"
          color="from-amber-500 to-orange-600"
        />
        <StatTile
          icon={ClipboardList}
          label="Registos"
          value={recordCount ?? 0}
          hint="clínicos"
          color="from-indigo-500 to-purple-600"
        />
      </section>

      {/* ─── Telemedicina banner ─── */}
      {waiting > 0 ? (
        <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 p-5 text-white shadow-md shadow-rose-500/30">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-white/15 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <AlertTriangle className="size-6 animate-pulse" />
              </span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
                  Telemedicina · agora
                </div>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  {waiting} paciente{waiting === 1 ? "" : "s"} à espera
                </h2>
                <p className="mt-0.5 text-sm text-white/85">
                  Atendimento por vídeo pendente.
                </p>
              </div>
            </div>
            <Link
              href="/medico/telemedicina"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-rose-700 shadow-sm transition-all hover:shadow-md"
            >
              Atender agora
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
              <Video className="size-4" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Telemedicina
              </div>
              <div className="mt-0.5 text-sm font-semibold text-emerald-900">
                Sem pacientes em espera
              </div>
            </div>
          </div>
          <Link
            href="/medico/telemedicina"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 transition-colors hover:text-emerald-800"
          >
            Abrir lista
            <ArrowRight className="size-3.5" />
          </Link>
        </section>
      )}

      {/* ─── 14-day trend ─── */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Consultas · últimos 14 dias
            </div>
            <h2 className="mt-1.5 text-lg font-semibold text-foreground">
              {totalLast14}{" "}
              <span className="text-xs font-medium text-muted-foreground">
                no total
              </span>
            </h2>
          </div>
          <Link
            href="/medico/agenda"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
          >
            Agenda
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="mt-4">
          <ConsultasBarChart data={consultas14} />
        </div>
      </section>

      {/* ─── Two columns: today + shortcuts ─── */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Today's agenda */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              <CalendarClock className="size-3.5" />
              Agenda de hoje
            </h2>
            <Link
              href="/medico/agenda"
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Agenda completa
              <ArrowRight className="size-3" />
            </Link>
          </div>
          {todayList.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Sem consultas marcadas para hoje.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {todayList.map((a) => (
                <TodayRow key={a.id} a={a} isNext={a.id === nextUp?.id} />
              ))}
            </ul>
          )}
        </div>

        {/* Shortcuts */}
        <div>
          <h2 className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Stethoscope className="size-3.5" />
            Atalhos
          </h2>
          <div className="mt-3 space-y-2.5">
            <Shortcut
              href="/medico/agenda"
              icon={CalendarDays}
              title="Agenda completa"
              desc="Próximas e histórico"
              color="from-sky-500 to-blue-600"
            />
            <Shortcut
              href="/medico/pacientes"
              icon={Users}
              title="Os meus pacientes"
              desc="Quem já consultou"
              color="from-emerald-500 to-teal-600"
            />
            <Shortcut
              href="/medico/telemedicina"
              icon={Video}
              title="Telemedicina"
              desc="Atender por vídeo"
              color="from-rose-500 to-pink-600"
            />
            <Shortcut
              href="/medico/perfil"
              icon={User}
              title="O meu perfil"
              desc="Cédula, especialidade"
              color="from-indigo-500 to-purple-600"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span
        className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </div>
        {hint && (
          <div className="text-[10px] text-muted-foreground">{hint}</div>
        )}
      </div>
    </div>
  );
}

function TodayRow({ a, isNext }: { a: ApptRow; isNext: boolean }) {
  const p = patientFrom(a.patient);
  const d = new Date(a.scheduled_at);
  const time = d.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isVideo = a.appointment_type === "telemedicine";
  const status = STATUS_BADGE[a.status] ?? STATUS_BADGE.scheduled;
  const minutesUntil = Math.round((d.getTime() - Date.now()) / 60000);
  const live = isVideo && minutesUntil <= 15 && minutesUntil >= -10;

  return (
    <li>
      <Link
        href={`/medico/consulta/${a.id}`}
        className={
          "group flex items-center gap-4 px-5 py-4 transition-colors " +
          (isNext ? "bg-sky-50/40 hover:bg-sky-50/70" : "hover:bg-accent/40")
        }
      >
        {/* Time chip */}
        <div className="w-[64px] shrink-0 text-center">
          <div
            className={
              "rounded-lg px-2 py-1.5 text-xs font-bold tabular-nums " +
              (isNext
                ? "bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm"
                : "bg-sky-100 text-sky-700")
            }
          >
            {time}
          </div>
        </div>

        {/* Avatar */}
        <div className="shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-sm">
          <div className="grid size-10 place-items-center overflow-hidden rounded-[8px] bg-card text-xs font-bold text-foreground">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrl}
                alt={p.name}
                className="size-full object-cover"
              />
            ) : (
              initials(p.name)
            )}
          </div>
        </div>

        {/* Identity + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-semibold text-foreground">
              {p.name}
            </span>
            {isNext && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-700">
                Próxima
              </span>
            )}
            {live && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                <span className="size-1 animate-pulse rounded-full bg-emerald-500" />
                Sala aberta
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {a.duration_minutes} min
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              {isVideo ? (
                <Video className="size-3" />
              ) : (
                <Building2 className="size-3" />
              )}
              {isVideo ? "Vídeo" : "Presencial"}
            </span>
            {a.reason && (
              <>
                <span aria-hidden>·</span>
                <span className="truncate">{a.reason}</span>
              </>
            )}
          </div>
        </div>

        <span
          className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 sm:inline-flex ${status.cls}`}
        >
          <span className={`size-1.5 rounded-full ${status.dot}`} />
          {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

function Shortcut({
  href,
  icon: Icon,
  title,
  desc,
  color,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
