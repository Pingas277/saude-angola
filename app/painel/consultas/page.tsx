import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  formatDateTimePT,
} from "@/lib/labels";

export const metadata = { title: "Consultas · Saúde Angola" };

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-sky-100 text-sky-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-red-100 text-red-700",
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            As minhas consultas
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Próximas marcações e histórico recente.
          </p>
        </div>
        <Link
          href="/painel/marcar"
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
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
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function List({ rows, emptyText }: { rows: ApptRow[]; emptyText: string }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {rows.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900">
              {formatDateTimePT(a.scheduled_at)}
            </div>
            <div className="mt-0.5 truncate text-sm text-slate-600">
              {pickName(a.doctor)} · {pickName(a.clinic)} · {a.duration_minutes} min
              {a.reason ? ` · ${a.reason}` : ""}
            </div>
          </div>
          <Badge className={STATUS_BADGE[a.status] ?? "bg-slate-100 text-slate-700"}>
            {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
          </Badge>
          <Badge className="bg-slate-100 text-slate-700">
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
