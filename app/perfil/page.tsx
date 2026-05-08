import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PerfilForm from "./PerfilForm";

export const metadata = { title: "Perfil · Saúde Angola" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: patient } = await supabase
    .from("patients")
    .select(
      "date_of_birth, blood_type, gender, id_number, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone"
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/painel" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-600 text-sm font-bold text-white">
              S
            </span>
            <span className="font-semibold text-slate-900">Saúde Angola</span>
          </Link>
          <Link
            href="/painel"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Voltar ao painel
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          O meu perfil
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Mantenha a sua informação clínica atualizada para um melhor atendimento.
        </p>

        <div className="mt-8">
          <PerfilForm
            initial={{
              full_name: profile?.full_name ?? "",
              phone: profile?.phone ?? null,
              date_of_birth: patient?.date_of_birth ?? null,
              blood_type: patient?.blood_type ?? "unknown",
              gender: patient?.gender ?? null,
              id_number: patient?.id_number ?? null,
              allergies: patient?.allergies ?? [],
              chronic_conditions: patient?.chronic_conditions ?? [],
              emergency_contact_name: patient?.emergency_contact_name ?? null,
              emergency_contact_phone: patient?.emergency_contact_phone ?? null,
            }}
          />
        </div>
      </div>
    </main>
  );
}
