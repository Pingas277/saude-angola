import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Video,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/labels";
import StatCard from "../../_ui/StatCard";
import MedicoHeader from "../_components/MedicoHeader";

export const metadata = { title: "Agenda · ANGOLASAUDE" };

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
function initials(name: string) {
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

export default async function AgendaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const nowIso = new Date().toISOString();
  const baseSelect =
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name))";

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
  const todayStr = new Date().toDateString();
  const todayCount = up.filter(
    (a) => new Date(a.scheduled_at).toDateString() === todayStr
  ).length;
  const doneCount = hist.filter((a) => a.status === "completed").length;

  const groups = new Map<string, ApptRow[]>();
  for (const a of up) {
    const k = dayKey(a.scheduled_at);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(a);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <MedicoHeader
        eyebrow="Operação"
        title="A minha agenda"
        subtitle="Próximas consultas e histórico clínico recente."
        icon={<CalendarDays className="size-5" />}
      />

      <section className="mt-8 grid grid-cols-3 gap-4">
        <StatCard tone="emerald" icon={<CalendarClock className="size-5" />} label="Hoje" value={todayCount} hint="marcações" />
        <StatCard tone="sky" icon={<CalendarDays className="size-5" />} label="Próximas" value={up.length} hint="futuras" />
        <StatCard tone="slate" icon={<CheckCircle2 className="size-5" />} label="Concluídas" value={doneCount} hint="histórico recente" />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Próximas</h2>
        {up.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Não tem consultas marcadas.
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

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Histórico</h2>
        {hist.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Sem consultas anteriores.
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
  const p = pickPatient(a.patient);
  const time = new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(a.scheduled_at).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
  });
  return (
    <li>
      <Link
        href={`/medico/consulta/${a.id}`}
        className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/40"
      >
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
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {date}
            </div>
          )}
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials(p.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {p.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {a.duration_minutes} min{a.reason ? ` · ${a.reason}` : ""}
          </div>
        </div>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
          {a.appointment_type === "telemedicine" ? (
            <Video className="size-3.5" />
          ) : (
            <MapPin className="size-3.5" />
          )}
        </span>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_BADGE[a.status] ?? "bg-muted text-foreground"
          }`}
        >
          {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}
