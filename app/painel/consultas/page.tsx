import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarClock,
  Clock,
  History,
  Plus,
  Share2,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { waShareUrl } from "@/lib/whatsapp";
import EmptyState from "@/app/_ui/EmptyState";
import AppointmentActions from "./AppointmentActions";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/labels";

export const metadata = { title: "As minhas consultas · Lunga" };

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

const PT_WEEKDAYS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];
const PT_MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

type Doctor = {
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
};
type Clinic = {
  name: string | null;
  address: string | null;
  working_hours: unknown;
};

type ApptRow = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  appointment_type: string;
  reason: string | null;
  doctor_id: string;
  doctor: Doctor | Doctor[] | null;
  clinic: Clinic | Clinic[] | null;
};

function pickOne<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (
    (p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shortTime(d: Date): string {
  return d.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function relativeDayLabel(when: Date, now: Date): string {
  const diff = Math.round(
    (startOfDay(when).getTime() - startOfDay(now).getTime()) / 86400000
  );
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  if (diff > 1 && diff < 7) return `Em ${diff} dias`;
  return `${PT_WEEKDAYS[when.getDay()]}, ${when.getDate()} ${PT_MONTHS_SHORT[when.getMonth()]}`;
}

export default async function ConsultasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!patient) redirect("/perfil?onboarding=1");

  const nowIso = new Date().toISOString();

  const baseSelect =
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, doctor_id, doctor:profiles!appointments_doctor_id_fkey(full_name, specialty, avatar_url), clinic:clinics(name, address, working_hours)";

  const [{ data: upcomingRaw }, { data: pastRaw }] = await Promise.all([
    supabase
      .from("appointments")
      .select(baseSelect)
      .eq("patient_id", patient.id)
      .gte("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("appointments")
      .select(baseSelect)
      .eq("patient_id", patient.id)
      .lt("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: false })
      .limit(20),
  ]);

  const upcoming = (upcomingRaw as ApptRow[] | null) ?? [];
  const past = (pastRaw as ApptRow[] | null) ?? [];

  const spotlight = upcoming[0] ?? null;
  const rest = upcoming.slice(1);

  // Group `rest` by calendar day
  const groups: { key: string; date: Date; items: ApptRow[] }[] = [];
  for (const a of rest) {
    const d = new Date(a.scheduled_at);
    const k = dayKey(d);
    const last = groups[groups.length - 1];
    if (last && last.key === k) {
      last.items.push(a);
    } else {
      groups.push({ key: k, date: d, items: [a] });
    }
  }

  const upcomingCount = upcoming.length;
  const videoCount = upcoming.filter(
    (a) => a.appointment_type === "telemedicine"
  ).length;
  const inPersonCount = upcomingCount - videoCount;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Painel de consultas
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            As minhas consultas
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Próximas marcações e histórico recente.
          </p>
        </div>
        <Link
          href="/painel/marcar"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
        >
          <Plus className="size-4" />
          Marcar consulta
        </Link>
      </div>

      {/* ─── Quick stats ─── */}
      {upcomingCount > 0 && (
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <StatChip
            icon={CalendarCheck}
            label="Próximas"
            value={String(upcomingCount)}
            color="from-sky-500 to-blue-600"
          />
          <StatChip
            icon={Video}
            label="Por vídeo"
            value={String(videoCount)}
            color="from-emerald-500 to-teal-600"
          />
          <StatChip
            icon={Building2}
            label="Presenciais"
            value={String(inPersonCount)}
            color="from-amber-500 to-orange-600"
          />
        </div>
      )}

      {/* ─── Spotlight (next appointment) ─── */}
      {spotlight && <SpotlightCard appt={spotlight} />}

      {/* ─── Empty (no upcoming, no past) ─── */}
      {!spotlight && past.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon="🩺"
            title="Sem consultas, por enquanto"
            desc="Quando marcar uma consulta, ela aparece aqui."
            action={{
              href: "/painel/marcar",
              label: "Marcar a primeira consulta",
            }}
          />
        </div>
      )}

      {/* ─── Upcoming list, grouped by day ─── */}
      {rest.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <CalendarClock className="size-3.5" />
            Próximas
          </h2>
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.key}>
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-foreground">
                    {relativeDayLabel(g.date, new Date())}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    {g.date.getDate()} {PT_MONTHS_SHORT[g.date.getMonth()]}
                  </span>
                </div>
                <div className="space-y-2">
                  {g.items.map((a) => (
                    <ApptCard key={a.id} appt={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Histórico ─── */}
      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <History className="size-3.5" />
            Histórico
          </h2>
          <div className="space-y-2">
            {past.map((a) => (
              <ApptCard key={a.id} appt={a} historical />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
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
        <div className="text-xl font-bold tracking-tight text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function SpotlightCard({ appt }: { appt: ApptRow }) {
  const d = new Date(appt.scheduled_at);
  const now = new Date();
  const minutesUntil = Math.round((d.getTime() - now.getTime()) / 60000);
  const isVideo = appt.appointment_type === "telemedicine";
  const doctor = pickOne(appt.doctor);
  const clinic = pickOne(appt.clinic);

  const dayLabel = relativeDayLabel(d, now);
  const timeStr = shortTime(d);

  const countdown =
    minutesUntil <= 0
      ? "A começar agora"
      : minutesUntil < 60
        ? `Daqui a ${minutesUntil} min`
        : minutesUntil < 60 * 24
          ? `Daqui a ${Math.round(minutesUntil / 60)} h`
          : dayLabel;

  // Video room opens 30 min before, stays open 10 min after start.
  const canJoin = isVideo && minutesUntil <= 30 && minutesUntil >= -10;

  return (
    <section className="relative mt-7 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 p-6 text-white shadow-xl shadow-sky-500/30 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-white/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-emerald-300/30 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/85">
            Próxima consulta · {countdown}
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="rounded-2xl bg-white/95 p-0.5 shadow-lg">
              <div className="grid size-16 place-items-center overflow-hidden rounded-[14px] bg-white text-base font-bold text-sky-700">
                {doctor?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doctor.avatar_url}
                    alt={doctor.full_name ?? ""}
                    className="size-full object-cover"
                  />
                ) : (
                  initials(doctor?.full_name ?? null)
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl font-bold tracking-tight sm:text-2xl">
                Dr(a). {doctor?.full_name ?? "—"}
              </div>
              <div className="mt-0.5 text-sm text-white/80">
                {[doctor?.specialty, clinic?.name]
                  .filter(Boolean)
                  .join(" · ") || "Médico verificado"}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="size-4" />
              {dayLabel} · {timeStr}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {isVideo ? (
                <Video className="size-4" />
              ) : (
                <Building2 className="size-4" />
              )}
              {isVideo ? "Por vídeo" : "Presencial"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              {appt.duration_minutes} min
            </span>
          </div>

          {appt.reason && (
            <div className="mt-4 inline-flex max-w-md rounded-xl bg-white/10 px-3 py-2 text-xs leading-relaxed text-white/85 backdrop-blur">
              <span className="line-clamp-2">{appt.reason}</span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto">
          {canJoin ? (
            <Link
              href={`/painel/telemedicina/sala/${appt.id}`}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-sky-700 shadow-md transition-all hover:shadow-lg"
            >
              <Video className="size-4" />
              Entrar na consulta
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : isVideo ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-xs font-medium text-white/85 backdrop-blur">
              <Video className="size-4" />A sala abre 30 min antes
            </div>
          ) : clinic?.address ? (
            <div className="max-w-[14rem] rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-xs leading-relaxed text-white/85 backdrop-blur">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Onde
              </div>
              <div className="mt-0.5">{clinic.address}</div>
            </div>
          ) : null}

          {/* Share via WhatsApp — useful to forward to family */}
          <a
            href={waShareUrl(
              `Tenho consulta na Lunga: ${dayLabel} às ${timeStr}${
                doctor?.full_name ? ` com Dr(a). ${doctor.full_name}` : ""
              }${clinic?.name ? ` (${clinic.name})` : ""}.`
            )}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur transition-colors hover:bg-white/20"
          >
            <Share2 className="size-3.5" />
            Partilhar
          </a>
        </div>
      </div>
    </section>
  );
}

function ApptCard({
  appt,
  historical,
}: {
  appt: ApptRow;
  historical?: boolean;
}) {
  const d = new Date(appt.scheduled_at);
  const doctor = pickOne(appt.doctor);
  const clinic = pickOne(appt.clinic);
  const isVideo = appt.appointment_type === "telemedicine";
  const status = STATUS_BADGE[appt.status] ?? STATUS_BADGE.scheduled;

  return (
    <div
      className={
        "group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md " +
        (historical ? "opacity-90" : "")
      }
    >
      <div className="shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-sm">
        <div className="grid size-12 place-items-center overflow-hidden rounded-[10px] bg-card text-sm font-bold text-foreground">
          {doctor?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.avatar_url}
              alt={doctor.full_name ?? ""}
              className="size-full object-cover"
            />
          ) : (
            initials(doctor?.full_name ?? null)
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-foreground">
            Dr(a). {doctor?.full_name ?? "—"}
          </span>
          {doctor?.specialty && (
            <span className="text-xs text-muted-foreground">
              · {doctor.specialty}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {shortTime(d)}
          </span>
          {clinic?.name && (
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-3" />
              {clinic.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            {isVideo ? (
              <Video className="size-3" />
            ) : (
              <Building2 className="size-3" />
            )}
            {APPOINTMENT_TYPE_LABELS[appt.appointment_type] ??
              appt.appointment_type}
          </span>
        </div>
      </div>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${status.cls}`}
      >
        <span className={`size-1.5 rounded-full ${status.dot}`} />
        {APPOINTMENT_STATUS_LABELS[appt.status] ?? appt.status}
      </span>

      {/* Upcoming + still active → patient can reschedule / cancel */}
      {!historical &&
        (appt.status === "scheduled" || appt.status === "confirmed") && (
          <AppointmentActions
            appointmentId={appt.id}
            doctorId={appt.doctor_id}
            doctorName={doctor?.full_name ?? "Médico"}
            currentScheduledAt={appt.scheduled_at}
            clinicHours={clinic?.working_hours ?? null}
          />
        )}
    </div>
  );
}
