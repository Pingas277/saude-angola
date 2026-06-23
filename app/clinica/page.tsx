import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Clock3,
  Receipt,
  Stethoscope,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  ROLE_LABELS,
  formatAOA,
} from "@/lib/labels";
import AdminHeader from "./_components/AdminHeader";
import RevenueAreaChart, {
  type RevenuePoint,
} from "../_ui/charts/RevenueAreaChart";
import ConsultasBarChart, {
  type ConsultaPoint,
} from "../_ui/charts/ConsultasBarChart";
import RoleDonutChart, { type RoleSlice } from "../_ui/charts/RoleDonutChart";

export const metadata = { title: "Painel da Clínica · Lunga" };

const STATUS_BADGE: Record<string, { cls: string; dot: string }> = {
  scheduled: { cls: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
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

type Profile = { full_name: string | null; avatar_url: string | null };
type ApptRow = {
  id: string;
  scheduled_at: string;
  status: string;
  appointment_type: string;
  reason: string | null;
  patient:
    | { id: string; profile: Profile | Profile[] | null }
    | { id: string; profile: Profile | Profile[] | null }[]
    | null;
  doctor: Profile | Profile[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}
function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
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
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20">
            <Building2 className="size-6" />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-foreground">
            Sem clínica atribuída
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            O seu utilizador é administrador mas ainda não está associado a
            nenhuma clínica. Contacte o suporte da Lunga.
          </p>
        </div>
      </main>
    );
  }

  const clinic = pickOne(profile?.clinic);

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
        "id, scheduled_at, status, appointment_type, reason, patient:patients(id, profile:profiles!patients_profile_id_fkey(full_name, avatar_url)), doctor:profiles!appointments_doctor_id_fkey(full_name, avatar_url)"
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
      .select("amount, status")
      .eq("clinic_id", clinicId)
      .in("status", ["pending", "overdue"]),
    supabase
      .from("profiles")
      .select("id, role")
      .eq("clinic_id", clinicId),
    supabase
      .from("invoices")
      .select(
        "id, amount, status, created_at, paid_at, patient:patients(profile:profiles!patients_profile_id_fkey(full_name, avatar_url))"
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
        "doctor_id, doctor:profiles!appointments_doctor_id_fkey(full_name, specialty, avatar_url)"
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
  const pendingRows =
    (pendingInv as { amount: number | string; status: string }[] | null) ?? [];
  const pendingTotal = pendingRows.reduce(
    (s, r) => s + Number(r.amount ?? 0),
    0
  );
  const overdueRows = pendingRows.filter((r) => r.status === "overdue");
  const overdueTotal = overdueRows.reduce(
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
    todayList.map((a) => pickOne(a.patient)?.id)
  ).size;
  const doneToday = todayList.filter((a) => a.status === "completed").length;
  const completion =
    todayList.length > 0
      ? Math.round((doneToday / todayList.length) * 100)
      : 0;

  // 30-day revenue series
  const revBuckets = new Map<string, number>();
  for (const r of (revenue30 as
    | { amount: number | string; paid_at: string | null }[]
    | null) ?? []) {
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
      label: d.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
      }),
      amount: revBuckets.get(k) ?? 0,
    });
  }

  // 14-day appointments series (exclude cancelled/no_show)
  const apptBuckets = new Map<string, number>();
  for (const a of (appts14 as
    | { scheduled_at: string; status: string }[]
    | null) ?? []) {
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
  type DocAgg = {
    id: string;
    name: string;
    specialty: string | null;
    avatarUrl: string | null;
    count: number;
  };
  const docMap = new Map<string, DocAgg>();
  for (const a of (doctorsLast30 as Array<{
    doctor_id: string;
    doctor:
      | { full_name: string | null; specialty: string | null; avatar_url: string | null }
      | { full_name: string | null; specialty: string | null; avatar_url: string | null }[]
      | null;
  }> | null) ?? []) {
    if (!a.doctor_id) continue;
    const dr = pickOne(a.doctor);
    const ex = docMap.get(a.doctor_id);
    if (ex) ex.count++;
    else
      docMap.set(a.doctor_id, {
        id: a.doctor_id,
        name: dr?.full_name ?? "—",
        specialty: dr?.specialty ?? null,
        avatarUrl: dr?.avatar_url ?? null,
        count: 1,
      });
  }
  const topDoctors = [...docMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topMax = topDoctors[0]?.count ?? 0;

  const firstName = profile?.full_name?.split(" ")[0] ?? "administrador";

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
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
          >
            <CalendarDays className="size-4" />
            Ver agenda
          </Link>
        }
      />

      {/* Overdue alert — only when there are overdue invoices */}
      {overdueRows.length > 0 && (
        <Link
          href="/clinica/faturas?filtro=atraso"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 px-4 py-3 shadow-sm transition-colors hover:border-rose-300"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-rose-800">
                {overdueRows.length} fatura
                {overdueRows.length === 1 ? "" : "s"} em atraso
              </div>
              <div className="text-xs text-rose-700/90">
                {formatAOA(overdueTotal)} por cobrar — vale a pena
                acompanhar.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-700">
            Ver faturas
            <ArrowRight className="size-3.5" />
          </span>
        </Link>
      )}

      {/* KPI grid */}
      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Kpi
          icon={CalendarDays}
          label="Consultas hoje"
          value={String(todayList.length)}
          hint={`${monthApptCount ?? 0} este mês`}
          color="from-sky-500 to-blue-600"
        />
        <Kpi
          icon={Users}
          label="Pacientes hoje"
          value={String(distinctPatients)}
          hint="distintos"
          color="from-indigo-500 to-purple-600"
        />
        <Kpi
          icon={UserCog}
          label="Equipa"
          value={String(staffCount)}
          hint="membros ativos"
          color="from-violet-500 to-purple-600"
        />
        <Kpi
          icon={Wallet}
          label="Faturação (mês)"
          value={formatAOA(monthRevenue)}
          hint={`${(paidMonth ?? []).length} pagas`}
          color="from-emerald-500 to-teal-600"
        />
        <Kpi
          icon={Clock3}
          label="A receber"
          value={formatAOA(pendingTotal)}
          hint={`${pendingRows.length} pendentes`}
          color="from-amber-500 to-orange-600"
        />
        <Kpi
          icon={TrendingUp}
          label="Conclusão hoje"
          value={`${completion}%`}
          hint={`${doneToday}/${todayList.length || 0} concluídas`}
          color="from-rose-500 to-pink-600"
        />
      </section>

      {/* Charts row 1: revenue + donut */}
      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          eyebrow="Faturação · últimos 30 dias"
          title={`${formatAOA(monthRevenue)} recebido este mês`}
          link={{ href: "/clinica/faturas", label: "Ver faturas" }}
        >
          <RevenueAreaChart data={revenueSeries} />
        </ChartCard>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Equipa
              </div>
              <h2 className="mt-1 text-base font-semibold text-foreground">
                Por função
              </h2>
            </div>
            <Link
              href="/clinica/equipa"
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Gerir
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="mt-2">
            <RoleDonutChart data={roleSlices} total={staffCount} />
          </div>
        </div>
      </section>

      {/* Charts row 2: consultas bars + recent invoices */}
      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          eyebrow="Consultas · últimos 14 dias"
          title="Volume diário"
          link={{ href: "/clinica/agenda", label: "Agenda" }}
        >
          <ConsultasBarChart data={consultasSeries} />
        </ChartCard>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              <Receipt className="size-3.5" />
              Faturas recentes
            </h2>
            <Link
              href="/clinica/faturas"
              className="text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
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
                  patient:
                    | { profile: Profile | Profile[] | null }
                    | { profile: Profile | Profile[] | null }[]
                    | null;
                }>
              ).map((inv) => {
                const pf = pickOne(pickOne(inv.patient)?.profile ?? null);
                const pname = pf?.full_name ?? "Paciente";
                const tone =
                  inv.status === "paid"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : inv.status === "overdue"
                      ? "bg-rose-50 text-rose-700 ring-rose-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200";
                return (
                  <li key={inv.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="shrink-0 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5">
                      <div className="grid size-8 place-items-center overflow-hidden rounded-[6px] bg-card text-[10px] font-bold text-foreground">
                        {pf?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={pf.avatar_url}
                            alt={pname}
                            className="size-full object-cover"
                          />
                        ) : (
                          initials(pname)
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-sm font-bold tabular-nums text-foreground">
                        {formatAOA(Number(inv.amount))}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {pname}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${tone}`}
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

      {/* Top doctors (30d) — clickable to activity page */}
      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Médicos
            </div>
            <h2 className="mt-1 text-base font-semibold text-foreground">
              Top médicos · últimos 30 dias
            </h2>
          </div>
          <Link
            href="/clinica/equipa"
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
          >
            Equipa
            <ArrowRight className="size-3" />
          </Link>
        </div>
        {topDoctors.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Ainda sem consultas neste período.
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {topDoctors.map((d, i) => {
              const pct = topMax > 0 ? Math.round((d.count / topMax) * 100) : 0;
              return (
                <li key={d.id}>
                  <Link
                    href={`/clinica/equipa/${d.id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-accent/40"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-xs font-bold text-white shadow-sm">
                      {i + 1}
                    </span>
                    <div className="shrink-0 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5">
                      <div className="grid size-9 place-items-center overflow-hidden rounded-[6px] bg-card text-[10px] font-bold text-foreground">
                        {d.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={d.avatarUrl}
                            alt={d.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          initials(d.name)
                        )}
                      </div>
                    </div>
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
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Today timeline */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            <CalendarCheck className="size-3.5" />
            Agenda de hoje
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {todayList.length}
            </span>
          </h2>
          <Link
            href="/clinica/agenda"
            className="text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
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
              const patient = pickOne(a.patient);
              const pf = pickOne(patient?.profile ?? null);
              const pname = pf?.full_name ?? "Paciente";
              const dr = pickOne(a.doctor);
              const status = STATUS_BADGE[a.status] ?? STATUS_BADGE.scheduled;
              return (
                <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-[60px] shrink-0 rounded-lg bg-sky-100 px-2 py-1.5 text-center text-xs font-bold tabular-nums text-sky-700">
                    {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="shrink-0 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5">
                    <div className="grid size-9 place-items-center overflow-hidden rounded-[6px] bg-card text-[10px] font-bold text-foreground">
                      {pf?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pf.avatar_url}
                          alt={pname}
                          className="size-full object-cover"
                        />
                      ) : (
                        initials(pname)
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {pname}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      Dr(a). {dr?.full_name ?? "—"}
                      {a.reason ? ` · ${a.reason}` : ""}
                    </div>
                  </div>
                  <span
                    className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 sm:inline-flex ${status.cls}`}
                  >
                    <span className={`size-1.5 rounded-full ${status.dot}`} />
                    {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Quick links */}
      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickLink
          href="/clinica/equipa"
          icon={Users}
          title="Equipa"
          desc="Adicionar e gerir membros"
          color="from-sky-500 to-blue-600"
        />
        <QuickLink
          href="/clinica/faturas"
          icon={Receipt}
          title="Faturas"
          desc="Pagas e pendentes"
          color="from-emerald-500 to-teal-600"
        />
        <QuickLink
          href="/clinica/perfil"
          icon={Building2}
          title="Clínica"
          desc="Perfil e plano"
          color="from-indigo-500 to-purple-600"
        />
      </section>
    </main>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </div>
        {hint && (
          <div className="truncate text-[10px] text-muted-foreground">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  eyebrow,
  title,
  link,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  link: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "rounded-3xl border border-border bg-card p-5 shadow-sm " +
        (className ?? "")
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </div>
          <h2 className="mt-1 text-base font-semibold text-foreground">
            {title}
          </h2>
        </div>
        <Link
          href={link.href}
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
        >
          {link.label}
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  desc,
  color,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
