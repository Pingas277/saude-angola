import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Pacientes · Saúde Angola" };

type Row = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  patients: { id: string; date_of_birth: string | null; id_number: string | null }[] | null;
};

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "receptionist") redirect("/painel");

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, patients(id, date_of_birth, id_number)")
    .eq("role", "patient")
    .order("full_name", { ascending: true })
    .limit(100);

  if (q.length >= 2) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: rows } = await query;
  const list = (rows as Row[] | null) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pacientes
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {q ? `Resultados para "${q}"` : "Todos os pacientes registados"}
            {" · "}{list.length} encontrado{list.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/recepcao/marcar"
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Novo paciente / marcar
        </Link>
      </div>

      <form className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Pesquisar por nome, email ou telefone (mín. 2 caracteres)"
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Procurar
        </button>
      </form>

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Sem resultados.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Idade</th>
                <th className="px-4 py-3">BI / NIF</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((p) => {
                const pat = p.patients?.[0];
                const age = ageFromDob(pat?.date_of_birth ?? null);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.full_name ?? "—"}
                      {!pat && (
                        <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          sem ficha
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {age !== null ? `${age} anos` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {pat?.id_number ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.phone ?? p.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/recepcao/marcar"
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        Marcar consulta →
                      </Link>
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
