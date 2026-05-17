import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Users,
  Wallet,
  Clock3,
  TrendingUp,
  Activity,
  Receipt,
  Building2,
  ArrowRight,
  Stethoscope,
  UserCog,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  ROLE_LABELS,
  formatAOA,
} from "@/lib/labels";
import StatCard from "../_ui/StatCard";
import AdminHeader from "./_components/AdminHeader";

export const metadata = { title: "Painel da Clínica · ANGOLASAUDE" };

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
  status: string;
  appointment_type: string;
  reason: string | null;
  patient:
    | { id: string; profile: { full_name: string | null } | { full_name: string | null }[] | null }
    | { id: string; profile: { full_name: string | null } | { full_name: string | null }[] | null }[]
    | null;
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
function startOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function greetingPT(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

export default async function ClinicaHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id, full_name, clinic:clinics(name)")
    .eq("id", user.id)
    .maybeSingle();

  const clinicId = profile?.clinic_id;
  if (!clinicId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Sem clínica atribuída
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O seu utilizador é administrador mas ainda não está associado a
            nenhuma clínica. Contacte o suporte da ANGOLASAUDE.
          </p>
        </div>
      </main>
    );
  }

  const clinic = Array.isArray(profile?.clinic)
    ? profile?.clinic[0]
    : profile?.clinic;

  const startToday = startOfTodayISO();
  const endToday = endOfTodayISO();
  const startMonth = startOfMonthISO();

  const [
    { data: todayAppts },
    { count: monthApptCount },
    { data: paidThisMonth },
    { data: pendingInv },
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
      .select("amount")
      .eq("clinic_id", clinicId)
      .gte("paid_at", startMonth)
      .eq("status", "paid"),
    supabase
      .from("invoices")
      .select("amount")
      .eq("clinic_id", clinicId)
      .in("status", ["pending", "overdue"]),
    supabase
      .from("profiles")
      .select("id, role")
      .eq("clinic_id", clinicId),
    supabase
      .from("invoices")
      .select(
        "id, amount, status, created_at, paid_at, patient:patients(profile:profiles(full_name))"
      )
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const todayList = (todayAppts as ApptRow[] | null) ?? [];
  const monthRevenue = (paidThisMonth ?? []).reduce(
    (s, r) => s + Number(r.amount ?? 0),
    0
  );
  const pendingTotal = (pendingInv ?? []).reduce(
    (s, r) => s + Number(r.amount ?? 0),
    0
  );
  const staffByRole: Record<string, number> = {};
  for (const s of staff ?? []) {
    if (s.role !== "patient")
      staffByRole[s.role] = (staffByRole[s.role] ?? 0) + 1;
  }
  const staffCount = Object.values(staffByRole).reduce((a, b) => a + b, 0);
  const distinctPatients = new Set(
    todayList.map((a) => {
      const p = Array.isArray(a.patient) ? a.patient[0] : a.patient;
      return p?.id;
    })
  ).size;
  const doneToday = todayList.filter((a) => a.status === "completed").length;
  const completion =
    todayList.length > 0
      ? Math.round((doneToday / todayList.length) * 100)
      : 0;
  const firstName = profile?.full_name?.split(" ")[0] ?? "administrador";

  const ROLE_ICON: Record<string, typeof Stethoscope> = {
    doctor: Stethoscope,
    nurse: Activity,
    receptionist: UserCog,
    admin: Building2,
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <AdminHeader
        eyebrow={`${greetingPT()}, ${firstName}`}
        title="Painel da clínica"
        subtitle={clinic?.name ?? "Visão geral da atividade e faturação."}
        icon={<Building2 className="size-5" />}
        action={
          <Link
            href="/clinica/agenda"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CalendarDays className="size-4" />
            Ver agenda
          </Link>
        }
      />

      {/* KPI grid */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard tone="emerald" icon={<CalendarDays className="size-5" />} label="Consultas hoje" value={todayList.length} hint={`${monthApptCount ?? 0} este mês`} />
        <StatCard tone="sky" icon={<Users className="size-5" />} label="Pacientes hoje" value={distinctPatients} hint="distintos" />
        <StatCard tone="slate" icon={<UserCog className="size-5" />} label="Equipa" value={staffCount} hint="membros ativos" />
        <StatCard tone="emerald" icon={<Wallet className="size-5" />} label="Faturação (mês)" value={formatAOA(monthRevenue)} hint={`${(paidThisMonth ?? []).length} pagas`} />
        <StatCard tone="amber" icon={<Clock3 className="size-5" />} label="A receber" value={formatAOA(pendingTotal)} hint={`${(pendingInv ?? []).length} pendentes`} />
        <StatCard tone="sky" icon={<TrendingUp className="size-5" />} label="Conclusão hoje" value={`${completion}%`} hint={`${doneToday}/${todayList.length || 0} concluídas`} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Today timeline */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              Agenda de hoje
            </h2>
            <Link
              href="/clinica/agenda"
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
              {todayList.map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-14 shrink-0">
                    <div className="rounded-md bg-muted px-2 py-1 text-center text-xs font-semibold text-foreground">
                      {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {pickPatientName(a.patient)}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      Dr(a). {pickName(a.doctor)}
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
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Revenue panel */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Faturação do mês
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recebido</span>
                <span className="text-sm font-semibold text-primary">
                  {formatAOA(monthRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Por receber
                </span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {formatAOA(pendingTotal)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${
                      monthRevenue + pendingTotal > 0
                        ? Math.round(
                            (monthRevenue / (monthRevenue + pendingTotal)) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <Link
              href="/clinica/faturas"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Receipt className="size-4" />
              Ver faturas
            </Link>
          </div>

          {/* Team by role */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Equipa por função
            </h2>
            <ul className="mt-3 space-y-2">
              {Object.entries(staffByRole).length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  Sem membros ainda.
                </li>
              ) : (
                Object.entries(staffByRole).map(([role, n]) => {
                  const Icon = ROLE_ICON[role] ?? Users;
                  return (
                    <li
                      key={role}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="size-4 text-primary" />
                        {ROLE_LABELS[role] ?? role}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {n}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
            <Link
              href="/clinica/equipa"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="size-4" />
              Gerir equipa
            </Link>
          </div>
        </div>
      </section>

      {/* Recent invoices */}
      <section className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Faturas recentes
          </h2>
          <Link
            href="/clinica/faturas"
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
        {(latestInvoices ?? []).length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Sem faturas emitidas.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {(
              latestInvoices as Array<{
                id: string;
                amount: number | string;
                status: string;
                created_at: string;
                paid_at: string | null;
                patient:
                  | { profile: { full_name: string | null } | { full_name: string | null }[] | null }
                  | { profile: { full_name: string | null } | { full_name: string | null }[] | null }[]
                  | null;
              }>
            ).map((inv) => {
              const pr = Array.isArray(inv.patient)
                ? inv.patient[0]
                : inv.patient;
              const pf = Array.isArray(pr?.profile)
                ? pr.profile[0]
                : pr?.profile;
              return (
                <li
                  key={inv.id}
                  className="flex items-center gap-4 px-5 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">
                      {formatAOA(Number(inv.amount))}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {pf?.full_name ?? "Paciente"} ·{" "}
                      {new Date(
                        inv.paid_at ?? inv.created_at
                      ).toLocaleDateString("pt-PT")}
                    </div>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium " +
                      (inv.status === "paid"
                        ? "bg-primary/10 text-primary"
                        : inv.status === "overdue"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400")
                    }
                  >
                    {inv.status === "paid"
                      ? "Paga"
                      : inv.status === "overdue"
                        ? "Em atraso"
                        : "Pendente"}
                  </span>
                  <a
                    href={`/api/fatura/${inv.id}/pdf`}
                    target="_blank"
                    rel="noopener"
                    className="hidden shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline sm:inline-flex"
                  >
                    PDF
                    <ArrowRight className="size-3" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
