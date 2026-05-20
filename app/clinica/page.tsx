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
  CalendarCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  ROLE_LABELS,
  formatAOA,
} from "@/lib/labels";
import GradientStatCard from "../_ui/GradientStatCard";
import AdminHeader from "./_components/AdminHeader";
import RevenueAreaChart, {
  type RevenuePoint,
} from "../_ui/charts/RevenueAreaChart";
import ConsultasBarChart, {
  type ConsultaPoint,
} from "../_ui/charts/ConsultasBarChart";
import RoleDonutChart, {
  type RoleSlice,
} from "../_ui/charts/RoleDonutChart";

export const metadata = { title: "Painel da Clínica · Lunga" };

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
function startOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function daysAgoStart(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (n - 1));
  return d;
}
function dayKey(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toISOString().slice(0, 10);
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
            nenhuma clínica. Contacte o suporte da Lunga.
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
  const start30 = daysAgoStart(30).toISOString();
  const start14 = daysAgoStart(14).toISOString();

  const [
    { data: todayAppts },
    { count: monthApptCount },
    { data: paidMonth },
    { data: pendingInv },
    { data: staff },
    { data: latestInvoices },
    { data: revenue30 },
    { data: appts14 },
    { data: doctorsLast30 },
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
    supabase
      .from("invoices")
      .select("amount, paid_at")
      .eq("clinic_id", clinicId)
      .eq("status", "paid")
      .gte("paid_at", start30),
    supabase
      .from("appointments")
      .select("scheduled_at, status")
      .eq("clinic_id", clinicId)
      .gte("scheduled_at", start14),
    supabase
      .from("appointments")
      .select(
        "doctor_id, status, doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)"
      )
      .eq("clinic_id", clinicId)
      .gte("scheduled_at", start30)
      .not("status", "in", "(cancelled,no_show)"),
  ]);

  // ---- Aggregations ----
  const todayList = (todayAppts as ApptRow[] | null) ?? [];
  const monthRevenue = (paidMonth ?? []).reduce(
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

  // 30-day revenue series
  const revBuckets = new Map<string, number>();
  for (const r of (revenue30 as { amount: number | string; paid_at: string | null }[] | null) ?? []) {
    if (!r.paid_at) continue;
    const k = dayKey(r.paid_at);
    revBuckets.set(k, (revBuckets.get(k) ?? 0) + Number(r.amount ?? 0));
  }
  const revenueSeries: RevenuePoint[] = [];
  const start30d = daysAgoStart(30);
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30d);
    d.setDate(start30d.getDate() + i);
    const k = dayKey(d);
    revenueSeries.push({
      date: k,
      label: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
      amount: revBuckets.get(k) ?? 0,
    });
  }

  // 14-day appointments series (exclude cancelled/no_show)
  const apptBuckets = new Map<string, number>();
  for (const a of (appts14 as { scheduled_at: string; status: string }[] | null) ?? []) {
    if (["cancelled", "no_show"].includes(a.status)) continue;
    const k = dayKey(a.scheduled_at);
    apptBuckets.set(k, (apptBuckets.get(k) ?? 0) + 1);
  }
  const consultasSeries: ConsultaPoint[] = [];
  const start14d = daysAgoStart(14);
  for (let i = 0; i < 14; i++) {
    const d = new Date(start14d);
    d.setDate(start14d.getDate() + i);
    const k = dayKey(d);
    consultasSeries.push({
      date: k,
      label: d.toLocaleDateString("pt-PT", { day: "2-digit" }),
      total: apptBuckets.get(k) ?? 0,
    });
  }

  const roleSlices: RoleSlice[] = Object.entries(staffByRole).map(
    ([role, value]) => ({ name: ROLE_LABELS[role] ?? role, value })
  );

  // Top doctors (last 30 days)
  type DocAgg = { id: string; name: string; specialty: string | null; count: number };
  const docMap = new Map<string, DocAgg>();
  for (const a of (doctorsLast30 as Array<{
    doctor_id: string;
    doctor:
      | { full_name: string | null; specialty: string | null }
      | { full_name: string | null; specialty: string | null }[]
      | null;
  }> | null) ?? []) {
    if (!a.doctor_id) continue;
    const dr = Array.isArray(a.doctor) ? a.doctor[0] : a.doctor;
    const ex = docMap.get(a.doctor_id);
    if (ex) ex.count++;
    else
      docMap.set(a.doctor_id, {
        id: a.doctor_id,
        name: dr?.full_name ?? "—",
        specialty: dr?.specialty ?? null,
        count: 1,
      });
  }
  const topDoctors = [...docMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topMax = topDoctors[0]?.count ?? 0;

  const firstName = profile?.full_name?.split(" ")[0] ?? "administrador";

  const ROLE_ICON: Record<string, typeof Stethoscope> = {
    doctor: Stethoscope,
    nurse: Activity,
    receptionist: UserCog,
    admin: Building2,
  };
  const ROLE_DOT: Record<string, string> = {
    doctor: "#2F74C4",
    nurse: "#5C9CE0",
    receptionist: "#E08A4B",
    admin: "#F0B43C",
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
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
      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <GradientStatCard tone="sky" icon={<CalendarDays className="size-5" />} label="Consultas hoje" value={todayList.length} hint={`${monthApptCount ?? 0} este mês`} />
        <GradientStatCard tone="indigo" icon={<Users className="size-5" />} label="Pacientes hoje" value={distinctPatients} hint="distintos" />
        <GradientStatCard tone="teal" icon={<UserCog className="size-5" />} label="Equipa" value={staffCount} hint="membros ativos" />
        <GradientStatCard tone="emerald" icon={<Wallet className="size-5" />} label="Faturação (mês)" value={formatAOA(monthRevenue)} hint={`${(paidMonth ?? []).length} pagas`} spark={revenueSeries.map((p) => p.amount)} />
        <GradientStatCard tone="amber" icon={<Clock3 className="size-5" />} label="A receber" value={formatAOA(pendingTotal)} hint={`${(pendingInv ?? []).length} pendentes`} />
        <GradientStatCard tone="rose" icon={<TrendingUp className="size-5" />} label="Conclusão hoje" value={`${completion}%`} hint={`${doneToday}/${todayList.length || 0} concluídas`} />
      </section>

      {/* Charts row 1: revenue + donut */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                Faturação · últimos 30 dias
              </div>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {formatAOA(monthRevenue)}
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  recebido este mês
                </span>
              </h2>
            </div>
            <Link
              href="/clinica/faturas"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver faturas
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="mt-4">
            <RevenueAreaChart data={revenueSeries} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                Equipa
              </div>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Por função
              </h2>
            </div>
            <Link
              href="/clinica/equipa"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Gerir
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="mt-2">
            <RoleDonutChart data={roleSlices} total={staffCount} />
          </div>
          <ul className="mt-3 space-y-1.5">
            {Object.entries(staffByRole).length === 0 ? (
              <li className="text-xs text-muted-foreground">
                Ainda sem membros.
              </li>
            ) : (
              Object.entries(staffByRole).map(([role, n]) => {
                const Icon = ROLE_ICON[role] ?? Users;
                return (
                  <li
                    key={role}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        aria-hidden
                        className="size-2 rounded-full"
                        style={{
                          background: ROLE_DOT[role] ?? "#94a3b8",
                        }}
                      />
                      <Icon className="size-3.5 text-muted-foreground" />
                      {ROLE_LABELS[role] ?? role}
                    </span>
                    <span className="font-semibold text-foreground">{n}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>

      {/* Charts row 2: consultas bars + recent invoices */}
      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                Consultas · últimos 14 dias
              </div>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Volume diário
              </h2>
            </div>
            <Link
              href="/clinica/agenda"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Agenda
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="mt-4">
            <ConsultasBarChart data={consultasSeries} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                Financeiro
              </div>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">
                Faturas recentes
              </h2>
            </div>
            <Link
              href="/clinica/faturas"
              className="text-xs font-medium text-primary hover:underline"
            >
              Todas
            </Link>
          </div>
          {(latestInvoices ?? []).length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">
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
                const pname = pf?.full_name ?? "Paciente";
                return (
                  <li
                    key={inv.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {initials(pname)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {formatAOA(Number(inv.amount))}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {pname}
                      </div>
                    </div>
                    <span
                      className={
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold " +
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
                          ? "Atraso"
                          : "Pendente"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Top doctors (30d) */}
      <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              Médicos
            </div>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Top médicos · últimos 30 dias
            </h2>
          </div>
          <Link
            href="/clinica/agenda"
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver agenda
          </Link>
        </div>
        {topDoctors.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Ainda sem consultas neste período.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {topDoctors.map((d, i) => {
              const pct = topMax > 0 ? Math.round((d.count / topMax) * 100) : 0;
              return (
                <li key={d.id} className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        Dr(a). {d.name}
                      </span>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {d.count} consultas
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {d.specialty && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {d.specialty}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Today timeline */}
      <section className="mt-5 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Agenda de hoje
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {todayList.length}
            </span>
          </div>
          <Link
            href="/clinica/agenda"
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver agenda completa
          </Link>
        </div>
        {todayList.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Sem consultas marcadas para hoje.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {todayList.map((a) => {
              const pname = pickPatientName(a.patient);
              return (
                <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-14 shrink-0 rounded-md bg-muted px-2 py-1 text-center text-xs font-semibold text-foreground">
                    {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(pname)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {pname}
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
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Quick links */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <Link
          href="/clinica/equipa"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/15 hover:bg-accent/40"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">Equipa</div>
            <div className="text-xs text-muted-foreground">
              Adicionar / gerir membros
            </div>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/clinica/faturas"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/15 hover:bg-accent/40"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Receipt className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">Faturas</div>
            <div className="text-xs text-muted-foreground">Pagas e pendentes</div>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/clinica/perfil"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/15 hover:bg-accent/40"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">Clínica</div>
            <div className="text-xs text-muted-foreground">Perfil e plano</div>
          </div>
          <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
    </main>
  );
}
