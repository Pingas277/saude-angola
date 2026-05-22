import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  History,
  Mail,
  Phone,
  Stethoscope,
  UserX,
  Users,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/labels";
import ConsultasBarChart, {
  type ConsultaPoint,
} from "@/app/_ui/charts/ConsultasBarChart";

export const metadata = { title: "Atividade do médico · Lunga" };

const STATUS_BADGE: Record<string, { cls: string; dot: string }> = {
  scheduled: { cls: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
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
function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DoctorActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  // The doctor must belong to the same clinic as the admin.
  const { data: doctor } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, specialty, medical_license, avatar_url, role, clinic_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (
    !doctor ||
    doctor.role !== "doctor" ||
    doctor.clinic_id !== admin.clinic_id
  ) {
    notFound();
  }

  const { data: apptsRaw } = await supabase
    .from("appointments")
    .select(
      "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name, avatar_url))"
    )
    .eq("doctor_id", id)
    .eq("clinic_id", admin.clinic_id)
    .order("scheduled_at", { ascending: false });

  const appts = (apptsRaw as ApptRow[] | null) ?? [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const total = appts.length;
  const monthCount = appts.filter(
    (a) => new Date(a.scheduled_at) >= monthStart
  ).length;
  const completed = appts.filter((a) => a.status === "completed").length;
  const noShow = appts.filter((a) => a.status === "no_show").length;
  const uniquePatients = new Set(
    appts.map((a) => pickOne(a.patient)?.id).filter(Boolean)
  ).size;

  // 14-day trend
  const start14 = new Date();
  start14.setHours(0, 0, 0, 0);
  start14.setDate(start14.getDate() - 13);
  const buckets = new Map<string, number>();
  for (const a of appts) {
    if (["cancelled", "no_show"].includes(a.status)) continue;
    const k = new Date(a.scheduled_at).toISOString().slice(0, 10);
    if (new Date(a.scheduled_at) >= start14) {
      buckets.set(k, (buckets.get(k) ?? 0) + 1);
    }
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

  const nowIso = now.toISOString();
  const upcoming = appts
    .filter((a) => a.scheduled_at >= nowIso)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const past = appts.filter((a) => a.scheduled_at < nowIso);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {/* Back */}
      <Link
        href="/clinica/equipa"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Equipa
      </Link>

      {/* ─── Doctor header card ─── */}
      <section className="mt-5 flex flex-wrap items-center gap-5 rounded-3xl border border-border bg-gradient-to-br from-sky-50/60 to-emerald-50/60 p-6 shadow-sm">
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-0.5 shadow-md shadow-sky-500/20">
          <div className="grid size-20 place-items-center overflow-hidden rounded-[14px] bg-white text-xl font-bold text-sky-700">
            {doctor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name ?? ""}
                className="size-full object-cover"
              />
            ) : (
              initials(doctor.full_name)
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Atividade do médico
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Dr(a). {doctor.full_name ?? "—"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {doctor.specialty && (
              <span className="inline-flex items-center gap-1">
                <Stethoscope className="size-3 text-primary" />
                {doctor.specialty}
              </span>
            )}
            {doctor.medical_license && (
              <span className="inline-flex items-center gap-1 font-mono">
                <CheckCircle2 className="size-3 text-emerald-600" />
                {doctor.medical_license}
              </span>
            )}
            {doctor.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3" />
                {doctor.email}
              </span>
            )}
            {doctor.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" />
                {doctor.phone}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          icon={CalendarClock}
          label="Total consultas"
          value={total}
          color="from-sky-500 to-blue-600"
        />
        <Stat
          icon={CalendarCheck}
          label="Este mês"
          value={monthCount}
          color="from-emerald-500 to-teal-600"
        />
        <Stat
          icon={CheckCircle2}
          label="Concluídas"
          value={completed}
          color="from-slate-500 to-slate-700"
        />
        <Stat
          icon={UserX}
          label="Faltas"
          value={noShow}
          color="from-rose-500 to-pink-600"
        />
        <Stat
          icon={Users}
          label="Pacientes"
          value={uniquePatients}
          color="from-indigo-500 to-purple-600"
        />
      </section>

      {/* ─── 14-day trend ─── */}
      <section className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Consultas · últimos 14 dias
        </div>
        <div className="mt-4">
          <ConsultasBarChart data={consultas14} />
        </div>
      </section>

      {/* ─── Upcoming ─── */}
      {upcoming.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <CalendarCheck className="size-3.5" />
            Próximas consultas
          </h2>
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <ApptItem key={a.id} a={a} />
            ))}
          </ul>
        </section>
      )}

      {/* ─── History ─── */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <History className="size-3.5" />
          Histórico ({past.length})
        </h2>
        {past.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Sem consultas anteriores.
          </div>
        ) : (
          <ul className="space-y-2">
            {past.slice(0, 40).map((a) => (
              <ApptItem key={a.id} a={a} muted />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function ApptItem({ a, muted }: { a: ApptRow; muted?: boolean }) {
  const patient = pickOne(a.patient);
  const prof = pickOne(patient?.profile ?? null);
  const name = prof?.full_name ?? "Paciente";
  const isVideo = a.appointment_type === "telemedicine";
  const status = STATUS_BADGE[a.status] ?? STATUS_BADGE.scheduled;

  return (
    <li
      className={
        "flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm " +
        (muted ? "opacity-90" : "")
      }
    >
      {/* Avatar */}
      <div className="shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-sm">
        <div className="grid size-10 place-items-center overflow-hidden rounded-[8px] bg-card text-xs font-bold text-foreground">
          {prof?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={prof.avatar_url}
              alt={name}
              className="size-full object-cover"
            />
          ) : (
            initials(name)
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">
          {name}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3" />
            {fmtDate(a.scheduled_at)} · {fmtTime(a.scheduled_at)}
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
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {a.duration_minutes} min
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
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${status.cls}`}
      >
        <span className={`size-1.5 rounded-full ${status.dot}`} />
        {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
      </span>
    </li>
  );
}
