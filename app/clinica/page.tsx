import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  ROLE_LABELS,
  formatAOA,
  formatDateTimePT,
} from "@/lib/labels";
import StatCard from "../_ui/StatCard";
import ActionCard from "../_ui/ActionCard";
import SectionHeading from "../_ui/SectionHeading";
import PageHeading from "../_ui/PageHeading";
import EmptyState from "../_ui/EmptyState";

export const metadata = { title: "Painel da Clínica · Saúde Angola" };

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
function greetingPT(d = new Date()): string {
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
    .select("clinic_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const clinicId = profile?.clinic_id;
  if (!clinicId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <EmptyState
          icon="🏥"
          title="Sem clínica atribuída"
          desc="O seu utilizador é administrador, mas ainda não está associado a nenhuma clínica. Contacte o suporte da Saúde Angola."
        />
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

  const firstName = profile?.full_name?.split(" ")[0] ?? "administrador";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeading
        eyebrow={`${greetingPT()}, ${firstName}`}
        title="Painel da clínica"
        subtitle="Atividade do dia, faturação do mês e atalhos para a gestão da equipa."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          tone="emerald"
          icon="🗓️"
          label="Consultas hoje"
          value={todayList.length}
          hint={`${monthApptCount ?? 0} este mês`}
        />
        <StatCard
          tone="amber"
          icon="💰"
          label="Faturação"
          value={formatAOA(monthRevenue)}
          hint={`${(paidThisMonth ?? []).length} faturas pagas (mês)`}
        />
        <StatCard
          tone="slate"
          icon="👥"
          label="Equipa"
          value={staffCount}
          hint={
            Object.entries(staffByRole)
              .filter(([role]) => role !== "patient")
              .map(([role, n]) => `${n} ${ROLE_LABELS[role] ?? role}`)
              .join(" · ") || "—"
          }
        />
        <StatCard
          tone="sky"
          icon="🩺"
          label="Pacientes hoje"
          value={
            new Set(
              todayList.map((a) => {
                const p = Array.isArray(a.patient) ? a.patient[0] : a.patient;
                return p?.id;
              })
            ).size
          }
          hint="Distintos com consulta hoje"
        />
      </section>

      <section className="mt-10">
        <SectionHeading
          title="Agenda de hoje"
          action={{ href: "/clinica/agenda", label: "Ver agenda completa" }}
        />

        {todayList.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="Sem consultas marcadas para hoje"
            desc="Quando os médicos da clínica receberem marcações, aparecem aqui."
          />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {todayList.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <div className="w-20 shrink-0 text-sm font-bold text-foreground">
                  {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">
                    {pickPatientName(a.patient)}
                  </div>
                  <div className="mt-0.5 truncate text-sm text-muted-foreground">
                    Dr(a). {pickName(a.doctor)}
                    {a.reason ? ` · ${a.reason}` : ""}
                  </div>
                </div>
                <Badge
                  className={
                    STATUS_BADGE[a.status] ?? "bg-muted text-foreground"
                  }
                >
                  {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                </Badge>
                <Badge className="bg-muted text-foreground">
                  {APPOINTMENT_TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            title="Atividade recente"
            action={{ href: "/clinica/faturas", label: "Ver todas" }}
          />
          {(latestInvoices ?? []).length === 0 ? (
            <EmptyState
              icon="🧾"
              title="Sem faturas emitidas"
              desc="As faturas dos médicos aparecem aqui assim que forem emitidas."
            />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
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
                      <div className="font-semibold text-foreground">
                        {formatAOA(Number(inv.amount))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pf?.full_name ?? "Paciente"} ·{" "}
                        {formatDateTimePT(inv.paid_at ?? inv.created_at)}
                      </div>
                    </div>
                    <Badge
                      className={
                        inv.status === "paid"
                          ? "bg-primary/10 text-primary"
                          : inv.status === "overdue"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
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
          <SectionHeading title="Atalhos" />
          <div className="grid grid-cols-1 gap-3">
            <ActionCard
              href="/clinica/equipa"
              icon="👥"
              title="Gerir equipa"
              desc="Adicionar ou remover médicos, enfermeiros e recepção."
            />
            <ActionCard
              href="/clinica/faturas"
              icon="🧾"
              title="Todas as faturas"
              desc="Pendentes, pagas e em atraso."
            />
            <ActionCard
              href="/clinica/perfil"
              icon="🏥"
              title="Perfil da clínica"
              desc="Nome, morada, contacto, plano de subscrição."
            />
          </div>
        </div>
      </section>
    </main>
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
