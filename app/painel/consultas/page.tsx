import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  formatDateTimePT,
} from "@/lib/labels";

export const metadata = { title: "Consultas · Lunga" };

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-sky-500/100/10 text-sky-600 dark:text-sky-400",
  confirmed: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/100/15 text-amber-600 dark:text-amber-400",
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
  doctor: { full_name: string | null } | { full_name: string | null }[] | null;
  clinic: { name: string | null } | { name: string | null }[] | null;
};

function pickName<T extends { full_name?: string | null; name?: string | null }>(
  v: T | T[] | null
): string {
  if (!v) return "—";
  const r = Array.isArray(v) ? v[0] : v;
  return r?.full_name ?? r?.name ?? "—";
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
    "id, scheduled_at, duration_minutes, status, appointment_type, reason, doctor:profiles!appointments_doctor_id_fkey(full_name), clinic:clinics(name)";

  const { data: upcoming } = await supabase
    .from("appointments")
    .select(baseSelect)
    .eq("patient_id", patient.id)
    .gte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true });

  const { data: past } = await supabase
    .from("appointments")
    .select(baseSelect)
    .eq("patient_id", patient.id)
    .lt("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            As minhas consultas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Próximas marcações e histórico recente.
          </p>
        </div>
        <Link
          href="/painel/marcar"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          + Marcar consulta
        </Link>
      </div>

      <Section title="Próximas">
        <List rows={(upcoming as ApptRow[] | null) ?? []} emptyText="Nenhuma consulta marcada." />
      </Section>

      <Section title="Histórico">
        <List rows={(past as ApptRow[] | null) ?? []} emptyText="Sem consultas anteriores." />
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
      {rows.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground">
              {formatDateTimePT(a.scheduled_at)}
            </div>
            <div className="mt-0.5 truncate text-sm text-muted-foreground">
              {pickName(a.doctor)} · {pickName(a.clinic)} · {a.duration_minutes} min
              {a.reason ? ` · ${a.reason}` : ""}
            </div>
          </div>
          <Badge className={STATUS_BADGE[a.status] ?? "bg-muted text-foreground"}>
            {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
          </Badge>
          <Badge className="bg-muted text-foreground">
            {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
          </Badge>
        </li>
      ))}
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
