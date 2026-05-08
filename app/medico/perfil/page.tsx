import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DoctorProfileForm from "./DoctorProfileForm";

export const metadata = { title: "Perfil do Médico · Saúde Angola" };

export default async function MedicoPerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, medical_license, specialty, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "doctor") redirect("/painel");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4">
        <Link
          href="/medico"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Voltar
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        O meu perfil profissional
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Estes dados aparecem nas receitas e nas faturas que emite.
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <DoctorProfileForm
          initial={{
            full_name: profile?.full_name ?? "",
            phone: profile?.phone ?? null,
            medical_license: profile?.medical_license ?? null,
            specialty: profile?.specialty ?? null,
          }}
        />
      </div>
    </main>
  );
}
