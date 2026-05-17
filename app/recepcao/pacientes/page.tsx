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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pacientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {q ? `Resultados para "${q}"` : "Todos os pacientes registados"}
            {" · "}{list.length} encontrado{list.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/recepcao/marcar"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90"
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
          className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90"
        >
          Procurar
        </button>
      </form>

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Sem resultados.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Idade</th>
                <th className="px-4 py-3">BI / NIF</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => {
                const pat = p.patients?.[0];
                const age = ageFromDob(pat?.date_of_birth ?? null);
                return (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {p.full_name ?? "—"}
                      {!pat && (
                        <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          sem ficha
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {age !== null ? `${age} anos` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {pat?.id_number ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.phone ?? p.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/recepcao/marcar"
                        className="text-xs font-medium text-primary hover:text-primary"
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
