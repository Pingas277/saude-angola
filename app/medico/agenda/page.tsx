import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  formatDateTimePT,
} from "@/lib/labels";

export const metadata = { title: "Agenda · Saúde Angola" };

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
    profile: { full_name: string | null } | { full_name: string | null }[] | null;
  } | { id: string; profile: { full_name: string | null } | { full_name: string | null }[] | null }[] | null;
};

function pickPatient(p: ApptRow["patient"]): { id: string; name: string } {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r) return { id: "", name: "—" };
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return { id: r.id, name: prof?.full_name ?? "Paciente" };
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

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          A minha agenda
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Próximas consultas e histórico clínico recente.
        </p>
      </div>

      <Section title="Próximas">
        <List
          rows={(upcoming as ApptRow[] | null) ?? []}
          emptyText="Não tem consultas marcadas."
        />
      </Section>

      <Section title="Histórico">
        <List
          rows={(past as ApptRow[] | null) ?? []}
          emptyText="Sem consultas anteriores."
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
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function List({ rows, emptyText }: { rows: ApptRow[]; emptyText: string }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {rows.map((a) => {
        const patient = pickPatient(a.patient);
        return (
          <li key={a.id}>
            <Link
              href={`/medico/consulta/${a.id}`}
              className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-primary/10/40"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground">
                  {formatDateTimePT(a.scheduled_at)}
                </div>
                <div className="mt-0.5 truncate text-sm text-muted-foreground">
                  {patient.name} · {a.duration_minutes} min
                  {a.reason ? ` · ${a.reason}` : ""}
                </div>
              </div>
              <Badge className={STATUS_BADGE[a.status] ?? "bg-muted text-foreground"}>
                {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
              </Badge>
              <Badge className="bg-muted text-foreground">
                {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
              </Badge>
              <span aria-hidden className="text-muted-foreground">→</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Badge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
