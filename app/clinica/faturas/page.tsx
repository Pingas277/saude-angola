import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  INVOICE_STATUS_BADGE,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatAOA,
  formatDateTimePT,
} from "@/lib/labels";

export const metadata = { title: "Faturas da Clínica · Saúde Angola" };

type InvRow = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  due_date: string | null;
  created_at: string;
  patient: {
    profile: { full_name: string | null } | { full_name: string | null }[] | null;
  } | {
    profile: { full_name: string | null } | { full_name: string | null }[] | null;
  }[] | null;
};

function pickPatientName(p: InvRow["patient"]): string {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r) return "Paciente";
  const pr = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return pr?.full_name ?? "Paciente";
}

export default async function ClinicaFaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro } = await searchParams;
  const status = filtro ?? "todas";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: admin } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (admin?.role !== "admin" || !admin.clinic_id) redirect("/clinica");

  let query = supabase
    .from("invoices")
    .select(
      "id, amount, currency, status, payment_method, payment_reference, paid_at, due_date, created_at, patient:patients(profile:profiles(full_name))"
    )
    .eq("clinic_id", admin.clinic_id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status === "pendentes") query = query.in("status", ["pending", "overdue"]);
  else if (status === "pagas") query = query.eq("status", "paid");

  const { data: rows } = await query;
  const list = (rows as InvRow[] | null) ?? [];

  const total = list.length;
  const totalPaid = list
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const totalPending = list
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.amount ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Faturas da clínica
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} fatura(s) — {formatAOA(totalPaid)} pagas, {formatAOA(totalPending)} pendentes.
        </p>
      </div>

      <nav className="mt-6 flex gap-2">
        <FilterLink current={status} value="todas" label="Todas" />
        <FilterLink current={status} value="pendentes" label="Por pagar" />
        <FilterLink current={status} value="pagas" label="Pagas" />
      </nav>

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Sem faturas neste filtro.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Emitida</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/40/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {pickPatientName(inv.patient)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {formatAOA(Number(inv.amount))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        INVOICE_STATUS_BADGE[inv.status] ?? "bg-muted text-foreground"
                      }`}
                    >
                      {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inv.payment_method
                      ? PAYMENT_METHOD_LABELS[inv.payment_method] ?? inv.payment_method
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateTimePT(inv.created_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {inv.paid_at ? formatDateTimePT(inv.paid_at) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.status === "paid" && (
                      <a
                        href={`/api/fatura/${inv.id}/pdf`}
                        target="_blank"
                        rel="noopener"
                        className="text-xs font-medium text-primary hover:text-primary"
                      >
                        PDF →
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function FilterLink({
  current,
  value,
  label,
}: {
  current: string;
  value: string;
  label: string;
}) {
  const active = current === value;
  const href =
    value === "todas" ? "/clinica/faturas" : `/clinica/faturas?filtro=${value}`;
  return (
    <a
      href={href}
      className={
        "rounded-md px-3 py-1.5 text-sm font-medium transition " +
        (active
          ? "bg-foreground text-white"
          : "border border-border bg-card text-foreground hover:bg-muted/40")
      }
    >
      {label}
    </a>
  );
}
