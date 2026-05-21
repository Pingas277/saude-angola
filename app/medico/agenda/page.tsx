import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  History,
  UserX,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/labels";
import MedicoHeader from "../_components/MedicoHeader";

export const metadata = { title: "Agenda · Lunga" };

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
type Patient = {
  id: string;
  profile: Profile | Profile[] | null;
};

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
    id: row?.id ?? "",
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

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function AgendaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const nowIso = new Date().toISOString();
  const baseSelect =
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name, avatar_url))";

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("appointments")
      .select(baseSelect)
      .eq("doctor_id", user.id)
      .gte("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("appointments")
      .select(baseSelect)
      .eq("doctor_id", user.id)
      .lt("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: false })
      .limit(30),
  ]);

  const up = (upcoming as ApptRow[] | null) ?? [];
  const hist = (past as ApptRow[] | null) ?? [];

  const now = new Date();
  const todayItems = up.filter((a) => isSameDay(new Date(a.scheduled_at), now));
  const laterItems = up.filter(
    (a) => !isSameDay(new Date(a.scheduled_at), now)
  );

  const doneCount = hist.filter((a) => a.status === "completed").length;
  const noShowCount = hist.filter((a) => a.status === "no_show").length;

  // Group `laterItems` by day
  const groups = new Map<string, ApptRow[]>();
  for (const a of laterItems) {
    const k = dayKey(a.scheduled_at);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(a);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <MedicoHeader
        eyebrow="Operação"
        title="A minha agenda"
        subtitle="Próximas consultas e histórico recente."
        icon={<CalendarDays className="size-5" />}
      />

      {/* ─── Quick stats ─── */}
      <section className="mt-7 grid gap-3 sm:grid-cols-4">
        <StatChip
          icon={CalendarClock}
          label="Hoje"
          value={todayItems.length}
          color="from-sky-500 to-blue-600"
        />
        <StatChip
          icon={CalendarDays}
          label="Próximas"
          value={up.length}
          color="from-emerald-500 to-teal-600"
        />
        <StatChip
          icon={CheckCircle2}
          label="Concluídas"
          value={doneCount}
          color="from-slate-500 to-slate-700"
        />
        <StatChip
          icon={UserX}
          label="Faltas"
          value={noShowCount}
          color="from-rose-500 to-pink-600"
        />
      </section>

      {/* ─── HOJE — prominent ─── */}
      {todayItems.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Hoje
            </h2>
            <span className="text-xs font-medium text-muted-foreground">
              {todayItems.length}{" "}
              {todayItems.length === 1 ? "consulta" : "consultas"}
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-sky-50/40 shadow-sm">
            <ul className="divide-y divide-emerald-100/70">
              {todayItems.map((a) => (
                <ApptRowComponent key={a.id} a={a} highlight />
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── Próximas ─── */}
      {laterItems.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <CalendarCheck className="size-3.5" />
            Próximas
          </h2>
          <div className="space-y-4">
            {[...groups.entries()].map(([day, rows]) => (
              <div
                key={day}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {day}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {rows.length}{" "}
                    {rows.length === 1 ? "consulta" : "consultas"}
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {rows.map((a) => (
                    <ApptRowComponent key={a.id} a={a} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Empty (no upcoming) ─── */}
      {up.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Não tem consultas marcadas.
        </div>
      )}

      {/* ─── Histórico ─── */}
      {hist.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <History className="size-3.5" />
            Histórico
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {hist.map((a) => (
              <ApptRowComponent key={a.id} a={a} muted />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function StatChip({
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
        className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-4" />
      </span>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

function ApptRowComponent({
  a,
  highlight,
  muted,
}: {
  a: ApptRow;
  highlight?: boolean;
  muted?: boolean;
}) {
  const p = patientFrom(a.patient);
  const d = new Date(a.scheduled_at);
  const time = d.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
  });
  const isVideo = a.appointment_type === "telemedicine";
  const status = STATUS_BADGE[a.status] ?? STATUS_BADGE.scheduled;

  // Within 15 min of start (for the "abre agora" hint on video)
  const minutesUntil = Math.round((d.getTime() - Date.now()) / 60000);
  const live = isVideo && minutesUntil <= 15 && minutesUntil >= -10;

  return (
    <li>
      <Link
        href={`/medico/consulta/${a.id}`}
        className={
          "group flex items-center gap-4 px-5 py-4 transition-colors " +
          (muted ? "hover:bg-accent/40" : "hover:bg-accent/60")
        }
      >
        {/* Time chip */}
        <div className="w-[68px] shrink-0 text-center">
          <div
            className={
              "rounded-lg px-2 py-1.5 text-xs font-bold tabular-nums " +
              (muted
                ? "bg-muted text-muted-foreground"
                : highlight
                  ? "bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm"
                  : "bg-sky-100 text-sky-700")
            }
          >
            {time}
          </div>
          {muted && (
            <div className="mt-1 text-[10px] text-muted-foreground">
              {date}
            </div>
          )}
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

        {/* Patient + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-semibold text-foreground">
              {p.name}
            </span>
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

        {/* Status pill */}
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
