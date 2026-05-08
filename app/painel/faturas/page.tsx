import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  INVOICE_STATUS_BADGE,
  INVOICE_STATUS_LABELS,
  formatAOA,
  formatDateTimePT,
} from "@/lib/labels";

export const metadata = { title: "Faturas · Saúde Angola" };

type InvoiceRow = {
  id: string;
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

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!patient) redirect("/perfil?onboarding=1");

  const { data: rows } = await supabase
    .from("invoices")
    .select(
      "id, amount, currency, status, due_date, paid_at, created_at, payment_reference"
    )
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false });

  const list = (rows as InvoiceRow[] | null) ?? [];
  const pending = list.filter((i) => i.status === "pending" || i.status === "overdue");
  const others = list.filter((i) => i.status !== "pending" && i.status !== "overdue");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          As minhas faturas
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pagamentos pendentes e histórico de comprovativos.
        </p>
      </div>

      <Section title={`Por pagar (${pending.length})`}>
        <List rows={pending} emptyText="Sem faturas por pagar." showPay />
      </Section>

      <Section title="Histórico">
        <List rows={others} emptyText="Sem faturas anteriores." />
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

function List({
  rows,
  emptyText,
  showPay,
}: {
  rows: InvoiceRow[];
  emptyText: string;
  showPay?: boolean;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {rows.map((inv) => (
        <li key={inv.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900">
              {formatAOA(Number(inv.amount))}
            </div>
            <div className="mt-0.5 text-sm text-slate-600">
              {inv.payment_reference ?? "Consulta"} ·{" "}
              {inv.paid_at
                ? `Paga em ${formatDateTimePT(inv.paid_at)}`
                : `Emitida em ${formatDateTimePT(inv.created_at)}`}
              {inv.due_date && !inv.paid_at
                ? ` · Vence a ${new Date(inv.due_date).toLocaleDateString("pt-PT")}`
                : ""}
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              INVOICE_STATUS_BADGE[inv.status] ?? "bg-slate-100 text-slate-700"
            }`}
          >
            {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/painel/faturas/${inv.id}`}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ver
            </Link>
            {showPay && (
              <Link
                href={`/painel/faturas/${inv.id}`}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Pagar →
              </Link>
            )}
            {inv.paid_at && (
              <a
                href={`/api/fatura/${inv.id}/pdf`}
                target="_blank"
                rel="noopener"
                className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                PDF
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
