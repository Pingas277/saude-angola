import Link from "next/link";
import {
  CalendarCheck,
  CalendarPlus,
  ChevronRight,
  FileText,
  FlaskConical,
  Pill,
  Receipt,
  Stethoscope,
  Video,
} from "lucide-react";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/labels";

/**
 * Mobile-only patient home — visual 1:1 with the landing PhoneMockup
 * (which the user loves and wants the real app to mirror). Hidden on
 * md+ where the existing /painel grid layout takes over.
 *
 * Mounted from app/painel/page.tsx via `md:hidden` so all the data
 * fetching stays in the page Server Component and we just receive
 * props.
 */

const QUICK_ACTIONS = [
  {
    href: "/painel/receitas",
    icon: Pill,
    label: "Receitas",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    href: "/painel/exames",
    icon: FlaskConical,
    label: "Exames",
    gradient: "from-cyan-500 to-sky-600",
  },
  {
    href: "/painel/faturas",
    icon: Receipt,
    label: "Faturas",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    href: "/painel/consultas",
    icon: CalendarCheck,
    label: "Consultas",
    gradient: "from-emerald-500 to-teal-600",
  },
] as const;

type Props = {
  firstName: string;
  greeting: string;
  dateLabel: string;
  patient: {
    id_number: string | null;
    date_of_birth: string | null;
    blood_type: string | null;
    gender: string | null;
  } | null;
  fullName: string | null;
  nextAppointment: {
    id: string;
    scheduled_at: string;
    status: string;
    appointment_type: string | null;
    doctorName: string | null;
    doctorSpecialty: string | null;
  } | null;
  latestNotification: {
    id: string;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    created_at: string;
    isUnread: boolean;
  } | null;
};

function ageFromDOB(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function shortCode(id: string | null): string {
  if (!id) return "—";
  // Stable, opaque-looking ID derived from id_number digits — we don't
  // expose the real BI on the mobile front card.
  const digits = id.replace(/\D/g, "");
  if (!digits) return "—";
  return `LG-${digits.slice(0, 3)}-${digits.slice(3, 7).padEnd(4, "0")}`;
}

function appointmentTimePT(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const time = d.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `Hoje ${time}`;
  const date = d.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
  });
  return `${date} · ${time}`;
}

function notifTimeAgo(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `há ${d}d`;
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
  });
}

export default function PatientMobileHome({
  firstName,
  greeting,
  dateLabel,
  patient,
  fullName,
  nextAppointment,
  latestNotification,
}: Props) {
  const age = ageFromDOB(patient?.date_of_birth ?? null);

  return (
    <main className="space-y-4 px-4 pb-24 pt-6 md:hidden">
      {/* ───── Header ───── (mirrors /painel desktop header eyebrow + h1 + date) */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">
            {greeting}, {firstName}
          </div>
          <h1 className="mt-1 text-lg font-semibold leading-tight tracking-tight text-foreground">
            O seu painel de saúde
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {dateLabel}
          </p>
        </div>
        <Link
          href="/painel/marcar"
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-sky-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-sky-700"
        >
          <CalendarPlus className="size-3" />
          Marcar
        </Link>
      </header>

      {/* ───── Health Passport ───── (gradient + dotted overlay + Lunga stamp) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-950 p-3.5 text-white shadow-md">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.22em] text-amber-100/85">
            <span>Passaporte de Saúde</span>
            <span>· AO ·</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-mono text-xs font-bold uppercase tracking-wide">
                {fullName ?? "—"}
              </div>
              <div className="mt-0.5 text-[10px] text-white/55">
                Tipo sang.{" "}
                <strong className="text-white">
                  {patient?.blood_type ?? "—"}
                </strong>
                {age !== null ? ` · ${age} anos` : ""}
              </div>
              <div className="mt-1 font-mono text-[9px] text-white/45">
                ID · {shortCode(patient?.id_number ?? null)}
              </div>
            </div>
            <div className="shrink-0 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-slate-900">
              lunga
            </div>
          </div>
        </div>
      </div>

      {/* ───── Próxima consulta ───── (or empty-state CTA) */}
      {nextAppointment ? (
        <Link
          href={`/painel/consultas`}
          className="relative block overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 p-3.5 text-white shadow-md shadow-sky-500/30"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/20 blur-2xl"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/85">
                Próxima · {appointmentTimePT(nextAppointment.scheduled_at)}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/20">
                  <Stethoscope className="size-3" />
                </span>
                <div className="truncate text-sm font-semibold leading-tight">
                  {nextAppointment.doctorName
                    ? `Dr(a). ${nextAppointment.doctorName}`
                    : "Médico a confirmar"}
                </div>
              </div>
              <div className="mt-0.5 pl-8 text-[10px] text-white/80">
                {nextAppointment.doctorSpecialty ?? "Consulta"}
                {nextAppointment.appointment_type === "video"
                  ? " · Vídeo"
                  : ""}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-700">
              {APPOINTMENT_STATUS_LABELS[nextAppointment.status] ??
                nextAppointment.status}
            </span>
          </div>
          {nextAppointment.appointment_type === "video" && (
            <div className="relative mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-white/95 px-3 py-1.5 text-xs font-bold text-sky-700">
              <Video className="size-3" />
              Entrar na consulta
            </div>
          )}
        </Link>
      ) : (
        <Link
          href="/painel/marcar"
          className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-3.5 shadow-sm"
        >
          <div>
            <div className="text-xs font-semibold text-foreground">
              Sem consultas marcadas
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              Toque aqui para marcar a próxima.
            </div>
          </div>
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <CalendarPlus className="size-4" />
          </span>
        </Link>
      )}

      {/* ───── Quick actions (4-grid, exact like mockup) ───── */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 transition-colors active:bg-accent/50"
            >
              <span
                className={`grid size-11 place-items-center rounded-2xl bg-gradient-to-br ${a.gradient} text-white shadow-md`}
              >
                <Icon className="size-5" />
              </span>
              <span className="text-[10px] font-medium text-foreground">
                {a.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ───── Notif peek (latest unread, links to full /painel/notificacoes) ───── */}
      {latestNotification && (
        <Link
          href={latestNotification.link ?? "/painel/notificacoes"}
          className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={
                "grid size-8 shrink-0 place-items-center rounded-lg " +
                (latestNotification.isUnread
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground")
              }
            >
              <FileText className="size-3.5" />
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-semibold text-foreground">
                {latestNotification.title}
              </div>
              <div className="truncate text-[10px] text-muted-foreground">
                {latestNotification.body
                  ? `${latestNotification.body} · ${notifTimeAgo(latestNotification.created_at)}`
                  : notifTimeAgo(latestNotification.created_at)}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {latestNotification.isUnread && (
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-sky-500"
              />
            )}
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      )}
    </main>
  );
}
