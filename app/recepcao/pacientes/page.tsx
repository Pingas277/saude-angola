import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Search,
  UserPlus,
  IdCard,
  Phone,
  Mail,
  CalendarPlus,
  FileWarning,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatCard from "../../_ui/StatCard";
import RecepHeader from "../_components/RecepHeader";

export const metadata = { title: "Pacientes · ANGOLASAUDE" };

type Row = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  patients:
    | { id: string; date_of_birth: string | null; id_number: string | null }[]
    | null;
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
function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
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
    .select(
      "id, full_name, email, phone, patients(id, date_of_birth, id_number)"
    )
    .eq("role", "patient")
    .order("full_name", { ascending: true })
    .limit(100);

  if (q.length >= 2) {
    query = query.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data: rows } = await query;
  const list = (rows as Row[] | null) ?? [];
  const withFicha = list.filter((p) => p.patients && p.patients.length > 0).length;
  const semFicha = list.length - withFicha;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <RecepHeader
        eyebrow="Diretório"
        title="Pacientes"
        subtitle={
          q
            ? `Resultados para “${q}” · ${list.length} encontrado${list.length === 1 ? "" : "s"}`
            : "Procure, consulte e marque para qualquer paciente da clínica."
        }
        icon={<Users className="size-5" />}
        action={
          <Link
            href="/recepcao/marcar?modo=walkin"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <UserPlus className="size-4" />
            Registar paciente
          </Link>
        }
      />

      <section className="mt-8 grid grid-cols-3 gap-4">
        <StatCard tone="sky" icon={<Users className="size-5" />} label="Resultados" value={list.length} hint={q ? "para a pesquisa" : "pacientes"} />
        <StatCard tone="emerald" icon={<IdCard className="size-5" />} label="Com ficha" value={withFicha} hint="ficha clínica criada" />
        <StatCard tone="amber" icon={<FileWarning className="size-5" />} label="Sem ficha" value={semFicha} hint="a completar" />
      </section>

      <form className="mt-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Pesquisar por nome, email ou telefone (mín. 2 caracteres)…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Procurar
          </button>
        </div>
      </form>

      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <Search className="size-6" />
          </span>
          <p className="mt-4 text-sm font-medium text-foreground">
            Sem resultados
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente outro nome, email ou telefone — ou registe um novo paciente.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Paciente</th>
                  <th className="hidden px-5 py-3 sm:table-cell">Idade</th>
                  <th className="hidden px-5 py-3 md:table-cell">BI / NIF</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Contacto</th>
                  <th className="px-5 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((p) => {
                  const pat = p.patients?.[0];
                  const age = ageFromDob(pat?.date_of_birth ?? null);
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-accent/40"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials(p.full_name)}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">
                              {p.full_name ?? "—"}
                            </div>
                            {!pat && (
                              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                <FileWarning className="size-2.5" />
                                sem ficha
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">
                        {age !== null ? `${age} anos` : "—"}
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                        {pat?.id_number ?? "—"}
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">
                        {p.phone ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="size-3" />
                            {p.phone}
                          </span>
                        ) : p.email ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="size-3" />
                            {p.email}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href="/recepcao/marcar"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <CalendarPlus className="size-3.5" />
                          Marcar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
