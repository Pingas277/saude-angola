import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatAOA, formatDateTimePT } from "@/lib/labels";
import MulticaixaForm from "./MulticaixaForm";

export const metadata = { title: "Pagar com Multicaixa Express · ANGOLASAUDE" };

export default async function MulticaixaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: inv } = await supabase
    .from("invoices")
    .select("id, amount, status, payment_reference, created_at")
    .eq("id", id)
    .eq("patient_id", patient.id)
    .maybeSingle();

  if (!inv) notFound();
  if (inv.status !== "pending" && inv.status !== "overdue") {
    redirect(`/painel/faturas/${inv.id}`);
  }

  const amount = formatAOA(Number(inv.amount));

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="mb-4">
        <Link
          href={`/painel/faturas/${inv.id}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Cancelar
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-red-100">
            Multicaixa Express
          </div>
          <div className="mt-0.5 text-base font-bold text-white">
            EMIS · Pagamento de serviços
          </div>
        </header>

        <div className="px-5 py-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Valor a pagar
          </div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {amount}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Fatura emitida em {formatDateTimePT(inv.created_at)}
          </div>

          <div className="mt-6">
            <MulticaixaForm invoiceId={inv.id} amount={amount} />
          </div>
        </div>

        <footer className="border-t border-border bg-muted/40 px-5 py-3 text-[10px] uppercase tracking-wide text-muted-foreground">
          Ambiente de teste · pagamento simulado
        </footer>
      </div>
    </main>
  );
}
