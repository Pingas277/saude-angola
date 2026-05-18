import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CalendarClock,
  Pill,
  ClipboardList,
  Video,
  Users,
  User,
  Stethoscope,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/labels";
import StatCard from "../_ui/StatCard";
import MedicoHeader from "./_components/MedicoHeader";

export const metadata = { title: "Painel do Médico · ANGOLASAUDE" };

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
};

function pickPatient(p: ApptRow["patient"]) {
  const r = Array.isArray(p) ? p[0] : p;
  const prof = r && (Array.isArray(r.profile) ? r.profile[0] : r.profile);
  return { name: prof?.full_name ?? "Paciente" };
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
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name))";

  const [
    { data: today },
    { count: upcomingCount },
    { count: rxCount },
    { count: recordCount },
    { count: teleWaitingCount },
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
  ]);

  const todayList = (today as ApptRow[] | null) ?? [];
  const pending = todayList.filter(
    (a) => a.scheduled_at >= nowIso && !["completed", "cancelled", "no_show"].includes(a.status)
  ).length;
  const waiting = teleWaitingCount ?? 0;
  const lastName = profile?.full_name?.split(" ").slice(-1)[0] ?? "";

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
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CalendarDays className="size-4" />
            Agenda
          </Link>
        }
      />

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard tone="emerald" icon={<CalendarClock className="size-5" />} label="Consultas hoje" value={todayList.length} hint={`${pending} por atender`} />
        <StatCard tone="sky" icon={<CalendarDays className="size-5" />} label="Próximas" value={upcomingCount ?? 0} hint="marcadas/confirmadas" />
        <StatCard tone="amber" icon={<Pill className="size-5" />} label="Receitas" value={rxCount ?? 0} hint="emitidas" />
        <StatCard tone="slate" icon={<ClipboardList className="size-5" />} label="Registos" value={recordCount ?? 0} hint="clínicos" />
      </section>

      {/* Telemedicina banner */}
      <section
        className={
          "mt-6 overflow-hidden rounded-2xl border " +
          (waiting > 0
            ? "border-destructive/30 bg-destructive/10"
            : "border-primary/30 bg-primary/5")
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <span
              className={
                "grid size-11 place-items-center rounded-full text-primary-foreground " +
                (waiting > 0 ? "bg-destructive" : "bg-primary")
              }
            >
              {waiting > 0 ? (
                <AlertTriangle className="size-5" />
              ) : (
                <Video className="size-5" />
              )}
            </span>
            <div>
              <div
                className={
                  "text-xs font-semibold uppercase tracking-wider " +
                  (waiting > 0 ? "text-destructive" : "text-primary")
                }
              >
                Telemedicina
              </div>
              <h2 className="mt-0.5 text-base font-semibold text-foreground">
                {waiting > 0
                  ? `${waiting} paciente${waiting === 1 ? "" : "s"} à espera`
                  : "Sem pacientes em espera"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {waiting > 0
                  ? "Atendimento por vídeo pendente."
                  : "Será notificado quando alguém entrar na fila."}
              </p>
            </div>
          </div>
          <Link
            href="/medico/telemedicina"
            className={
              "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
              (waiting > 0
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90")
            }
          >
            Abrir lista
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Today agenda */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              Agenda de hoje
            </h2>
            <Link
              href="/medico/agenda"
              className="text-xs font-medium text-primary hover:underline"
            >
              Agenda completa
            </Link>
          </div>
          {todayList.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Sem consultas marcadas para hoje.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {todayList.map((a) => {
                const p = pickPatient(a.patient);
                return (
                  <li key={a.id}>
                    <Link
                      href={`/medico/consulta/${a.id}`}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/40"
                    >
                      <div className="w-14 shrink-0 rounded-md bg-muted px-2 py-1 text-center text-xs font-semibold text-foreground">
                        {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initials(p.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {p.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {a.duration_minutes} min
                          {a.reason ? ` · ${a.reason}` : ""}
                        </div>
                      </div>
                      <span
                        className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-flex ${
                          STATUS_BADGE[a.status] ?? "bg-muted text-foreground"
                        }`}
                      >
                        {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                      </span>
                      <span className="hidden shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground md:inline-flex">
                        {APPOINTMENT_TYPE_LABELS[a.appointment_type] ??
                          a.appointment_type}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Shortcuts */}
        <div>
          <h2 className="px-1 text-sm font-semibold text-foreground">
            Atalhos
          </h2>
          <div className="mt-3 space-y-3">
            <Shortcut href="/medico/agenda" icon={CalendarDays} title="Agenda completa" desc="Próximas e histórico" />
            <Shortcut href="/medico/pacientes" icon={Users} title="Os meus pacientes" desc="Quem já consultou" />
            <Shortcut href="/medico/telemedicina" icon={Video} title="Telemedicina" desc="Atender por vídeo" />
            <Shortcut href="/medico/perfil" icon={User} title="O meu perfil" desc="Cédula, especialidade" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Shortcut({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/15 hover:bg-accent/40"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
