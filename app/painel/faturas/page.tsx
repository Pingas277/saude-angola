import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Receipt,
  Wallet,
  Clock3,
  CheckCircle2,
  ArrowRight,
  Download,
  Hash,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { familyLookup, loadPatientFamily } from "@/app/_app/family";
import {
  INVOICE_STATUS_LABELS,
  formatAOA,
  formatDateTimePT,
  formatDatePT,
} from "@/lib/labels";
import GradientStatCard from "../../_ui/GradientStatCard";

export const metadata = { title: "Faturas · Lunga" };

type InvoiceRow = {
  id: string;
  patient_id: string;
  amount: number | string;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  payment_reference: string | null;
};

export default async function FaturasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const family = await loadPatientFamily(supabase, user.id);
  if (!family.ownPatientId) redirect("/perfil?onboarding=1");
  const personByPatient = familyLookup(family.persons);

  const { data: rows } = await supabase
    .from("invoices")
    .select(
      "id, patient_id, amount, currency, status, due_date, paid_at, created_at, payment_reference"
    )
    .in("patient_id", family.patientIds)
    .order("created_at", { ascending: false });

  const list = (rows as InvoiceRow[] | null) ?? [];
  const pending = list.filter(
    (i) => i.status === "pending" || i.status === "overdue"
  );
  const others = list.filter(
    (i) => i.status !== "pending" && i.status !== "overdue"
  );

  const totalPaid = list
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const totalPending = pending.reduce(
    (s, i) => s + Number(i.amount ?? 0),
    0
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-primary">
            Financeiro
          </div>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            <Receipt className="size-6 text-primary" />
            As minhas faturas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pagamentos pendentes e histórico de comprovativos.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GradientStatCard
          tone="sky"
          icon={<Hash className="size-5" />}
          label="Total"
          value={list.length}
          hint={list.length === 1 ? "fatura" : "faturas"}
        />
        <GradientStatCard
          tone="emerald"
          icon={<CheckCircle2 className="size-5" />}
          label="Pagas"
          value={formatAOA(totalPaid)}
          hint={`${list.filter((i) => i.status === "paid").length} comprovativos`}
        />
        <GradientStatCard
          tone="amber"
          icon={<Clock3 className="size-5" />}
          label="Por pagar"
          value={formatAOA(totalPending)}
          hint={`${pending.length} pendente${pending.length === 1 ? "" : "s"}`}
        />
        <GradientStatCard
          tone="indigo"
          icon={<Wallet className="size-5" />}
          label="Movimento"
          value={formatAOA(totalPaid + totalPending)}
          hint="emitido"
        />
      </section>

      {/* Pending */}
      <section className="mt-10">
        <SectionTitle
          icon={<AlertTriangle className="size-4" />}
          title="Por pagar"
          count={pending.length}
        />
        <CardList
          rows={pending}
          empty="Sem faturas por pagar."
          showPay
          personByPatient={personByPatient}
        />
      </section>

      {/* History */}
      <section className="mt-10">
        <SectionTitle
          icon={<CalendarClock className="size-4" />}
          title="Histórico"
          count={others.length}
        />
        <CardList
          rows={others}
          empty="Sem faturas anteriores."
          personByPatient={personByPatient}
        />
      </section>
    </main>
  );
}

function SectionTitle({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {count}
        </span>
      </div>
    </div>
  );
}

function CardList({
  rows,
  empty,
  showPay,
  personByPatient,
}: {
  rows: InvoiceRow[];
  empty: string;
  showPay?: boolean;
  personByPatient: Map<
    string,
    { name: string; isSelf: boolean; relationship: string | null }
  >;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {rows.map((inv) => {
        const overdue = inv.status === "overdue";
        const paid = inv.status === "paid";
        const forPerson = personByPatient.get(inv.patient_id);
        const isForDependent = forPerson && !forPerson.isSelf;
        return (
          <li
            key={inv.id}
            className={
              "overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md " +
              (overdue ? "border-destructive/40" : "border-border")
            }
          >
            <div className="flex flex-wrap items-center gap-4 p-5">
              <span
                className={
                  "grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-sm " +
                  (paid
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                    : overdue
                      ? "bg-gradient-to-br from-rose-500 to-pink-600"
                      : "bg-gradient-to-br from-amber-400 to-orange-500")
                }
              >
                {paid ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <Receipt className="size-6" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xl font-semibold tabular-nums text-foreground">
                    {formatAOA(Number(inv.amount))}
                  </span>
                  {isForDependent && forPerson && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30">
                      Para {forPerson.name.split(" ")[0]}
                    </span>
                  )}
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                      (paid
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : overdue
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400")
                    }
                  >
                    {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {inv.payment_reference ?? "Consulta"} ·{" "}
                  {paid
                    ? `Paga em ${formatDateTimePT(inv.paid_at!)}`
                    : `Emitida em ${formatDateTimePT(inv.created_at)}`}
                  {inv.due_date && !paid
                    ? ` · Vence a ${formatDatePT(inv.due_date)}`
                    : ""}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/painel/faturas/${inv.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Ver
                </Link>
                {showPay && (
                  <Link
                    href={`/painel/faturas/${inv.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Pagar
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
                {paid && (
                  <a
                    href={`/api/fatura/${inv.id}/pdf`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                  >
                    <Download className="size-3.5" />
                    PDF
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
