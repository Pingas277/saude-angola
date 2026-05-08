import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  ROLE_LABELS,
  formatAOA,
  formatDateTimePT,
} from "@/lib/labels";

export const metadata = { title: "Painel da Clínica · Saúde Angola" };

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
  status: string;
  appointment_type: string;
  reason: string | null;
  patient: {
    id: string;
    profile: { full_name: string | null } | { full_name: string | null }[] | null;
  } | { id: string; profile: { full_name: string | null } | { full_name: string | null }[] | null }[] | null;
  doctor: { full_name: string | null } | { full_name: string | null }[] | null;
};

function pickName<T extends { full_name?: string | null }>(
  v: T | T[] | null | undefined
): string {
  if (!v) return "—";
  const r = Array.isArray(v) ? v[0] : v;
  return r?.full_name ?? "—";
}

function pickPatientName(p: ApptRow["patient"]): string {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r) return "Paciente";
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return prof?.full_name ?? "Paciente";
}

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function endOfTodayISO(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
function startOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function ClinicaHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const clinicId = profile?.clinic_id;
  if (!clinicId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sem clínica atribuída
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          O seu utilizador é administrador, mas ainda não está associado a
          nenhuma clínica. Contacte o suporte da Saúde Angola.
        </p>
      </main>
    );
  }

  const startToday = startOfTodayISO();
  const endToday = endOfTodayISO();
  const startMonth = startOfMonthISO();

  const [
    { data: todayAppts },
    { count: monthApptCount },
    { data: paidThisMonth },
    { data: staff },
    { data: latestInvoices },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        "id, scheduled_at, status, appointment_type, reason, patient:patients(id, profile:profiles(full_name)), doctor:profiles!appointments_doctor_id_fkey(full_name)"
      )
      .eq("clinic_id", clinicId)
      .gte("scheduled_at", startToday)
      .lte("scheduled_at", endToday)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .gte("scheduled_at", startMonth),
    supabase
      .from("invoices")
      .select("amount, status, paid_at")
      .eq("clinic_id", clinicId)
      .gte("paid_at", startMonth)
      .eq("status", "paid"),
    supabase
      .from("profiles")
      .select("id, role")
      .eq("clinic_id", clinicId),
    supabase
      .from("invoices")
      .select(
        "id, amount, status, created_at, paid_at, payment_reference, patient:patients(profile:profiles(full_name))"
      )
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const todayList = (todayAppts as ApptRow[] | null) ?? [];
  const monthRevenue = (paidThisMonth ?? []).reduce(
    (sum, r) => sum + Number(r.amount ?? 0),
    0
  );
  const staffByRole: Record<string, number> = {};
  for (const s of staff ?? []) {
    staffByRole[s.role] = (staffByRole[s.role] ?? 0) + 1;
  }
  const staffCount = (staff ?? []).filter((s) => s.role !== "patient").length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Bom dia, {profile?.full_name?.split(" ")[0] ?? "administrador"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Resumo da atividade da clínica.
        </p>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Consultas hoje"
          value={todayList.length.toString()}
          hint={`${monthApptCount ?? 0} este mês`}
        />
        <StatCard
          label="Faturação (mês)"
          value={formatAOA(monthRevenue)}
          hint={`${(paidThisMonth ?? []).length} faturas pagas`}
        />
        <StatCard
          label="Equipa"
          value={staffCount.toString()}
          hint={Object.entries(staffByRole)
            .filter(([role]) => role !== "patient")
            .map(([role, n]) => `${n} ${ROLE_LABELS[role] ?? role}`)
            .join(" · ") || "—"}
        />
        <StatCard
          label="Pacientes únicos hoje"
          value={
            new Set(
              todayList.map((a) => {
                const p = Array.isArray(a.patient) ? a.patient[0] : a.patient;
                return p?.id;
              })
            ).size.toString()
          }
          hint="Distintos com consulta hoje"
        />
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Agenda de hoje
          </h2>
          <Link
            href="/clinica/agenda"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Ver agenda completa →
          </Link>
        </div>

        {todayList.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Sem consultas marcadas para hoje.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {todayList.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <div className="w-24 shrink-0 text-sm font-medium text-slate-900">
                  {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900">
                    {pickPatientName(a.patient)}
                  </div>
                  <div className="mt-0.5 truncate text-sm text-slate-600">
                    Dr(a). {pickName(a.doctor)}
                    {a.reason ? ` · ${a.reason}` : ""}
                  </div>
                </div>
                <Badge
                  className={
                    STATUS_BADGE[a.status] ?? "bg-slate-100 text-slate-700"
                  }
                >
                  {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                </Badge>
                <Badge className="bg-slate-100 text-slate-700">
                  {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Atividade recente
          </h2>
          {(latestInvoices ?? []).length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Sem faturas emitidas.
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {(latestInvoices as Array<{
                id: string;
                amount: number | string;
                status: string;
                created_at: string;
                paid_at: string | null;
                payment_reference: string | null;
                patient: { profile: { full_name: string | null } | { full_name: string | null }[] | null } |
                  { profile: { full_name: string | null } | { full_name: string | null }[] | null }[] | null;
              }>).map((inv) => {
                const pr = Array.isArray(inv.patient) ? inv.patient[0] : inv.patient;
                const pf = Array.isArray(pr?.profile) ? pr.profile[0] : pr?.profile;
                return (
                  <li
                    key={inv.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">
                        {formatAOA(Number(inv.amount))}
                      </div>
                      <div className="text-xs text-slate-500">
                        {pf?.full_name ?? "Paciente"} ·{" "}
                        {formatDateTimePT(inv.paid_at ?? inv.created_at)}
                      </div>
                    </div>
                    <Badge
                      className={
                        inv.status === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : inv.status === "overdue"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {inv.status === "paid"
                        ? "Paga"
                        : inv.status === "overdue"
                        ? "Em atraso"
                        : "Pendente"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Atalhos
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <ActionCard
              href="/clinica/equipa"
              title="Gerir equipa"
              desc="Adicionar ou remover médicos, enfermeiros e recepcionistas."
            />
            <ActionCard
              href="/clinica/faturas"
              title="Ver todas as faturas"
              desc="Pendentes, pagas e em atraso."
            />
            <ActionCard
              href="/clinica/perfil"
              title="Editar perfil da clínica"
              desc="Nome, morada, contacto e plano de subscrição."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function ActionCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40"
    >
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 text-xs text-slate-600">{desc}</div>
      </div>
      <span
        aria-hidden
        className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
      >
        →
      </span>
    </Link>
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
