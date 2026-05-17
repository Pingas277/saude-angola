import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDatePT } from "@/lib/labels";
import PageHeading from "../../_ui/PageHeading";
import EmptyState from "../../_ui/EmptyState";
import AddStockForm from "./AddStockForm";
import { adjustStockAction } from "./actions";

export const metadata = { title: "Farmácia · Saúde Angola" };

type StockItem = {
  id: string;
  medication_name: string;
  generic_name: string | null;
  quantity: number;
  minimum_stock: number;
  unit_price: number | null;
  batch_number: string | null;
  expiry_date: string | null;
};

function isExpiringSoon(date: string | null): boolean {
  if (!date) return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  return d <= in30;
}

export default async function FarmaciaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .maybeSingle();
  const clinicId = profile?.clinic_id;
  if (!clinicId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <EmptyState
          icon="🏥"
          title="Sem clínica atribuída"
          desc="Peça ao administrador da clínica para o associar à equipa."
        />
      </main>
    );
  }

  const { data } = await supabase
    .from("pharmacy_stock")
    .select(
      "id, medication_name, generic_name, quantity, minimum_stock, unit_price, batch_number, expiry_date"
    )
    .eq("clinic_id", clinicId)
    .order("medication_name", { ascending: true });

  const items = (data as StockItem[] | null) ?? [];
  const lowCount = items.filter((i) => i.quantity <= i.minimum_stock).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <PageHeading
        eyebrow="Enfermagem"
        title="Stock de farmácia"
        subtitle={`${items.length} ${items.length === 1 ? "item" : "itens"} · ${lowCount} com stock baixo.`}
        action={<AddStockForm />}
      />

      {items.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Sem medicamentos registados"
          desc="Adicione o primeiro item ao stock da clínica."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Medicamento</th>
                <th className="px-4 py-3">Stock</th>
                <th className="hidden px-4 py-3 sm:table-cell">Validade</th>
                <th className="hidden px-4 py-3 md:table-cell">Lote</th>
                <th className="px-4 py-3 text-right">Ajustar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((i) => {
                const low = i.quantity <= i.minimum_stock;
                const expSoon = isExpiringSoon(i.expiry_date);
                return (
                  <tr key={i.id} className={low ? "bg-amber-50/40" : ""}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {i.medication_name}
                      </div>
                      {i.generic_name && (
                        <div className="text-xs text-slate-500">
                          {i.generic_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                          (low
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800")
                        }
                      >
                        {i.quantity} un.
                      </span>
                      <div className="mt-1 text-xs text-slate-500">
                        mín. {i.minimum_stock}
                        {low ? " · repor" : ""}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {i.expiry_date ? (
                        <span
                          className={
                            expSoon
                              ? "font-medium text-red-700"
                              : "text-slate-600"
                          }
                        >
                          {formatDatePT(i.expiry_date)}
                          {expSoon ? " ⚠" : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                      {i.batch_number ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <AdjustBtn itemId={i.id} delta={-1} label="−1" />
                        <AdjustBtn itemId={i.id} delta={1} label="+1" />
                        <AdjustBtn itemId={i.id} delta={10} label="+10" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function AdjustBtn({
  itemId,
  delta,
  label,
}: {
  itemId: string;
  delta: number;
  label: string;
}) {
  return (
    <form action={adjustStockAction}>
      <input type="hidden" name="item_id" value={itemId} />
      <input type="hidden" name="delta" value={delta} />
      <button
        type="submit"
        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        {label}
      </button>
    </form>
  );
}
