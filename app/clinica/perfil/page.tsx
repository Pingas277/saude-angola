import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClinicProfileForm from "./ClinicProfileForm";

export const metadata = { title: "Perfil da Clínica · Saúde Angola" };

export default async function ClinicProfilePage() {
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

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, name, address, province, phone, email, logo_url, subscription_plan")
    .eq("id", admin.clinic_id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Perfil da clínica
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Estes dados aparecem nas receitas e nas faturas emitidas pelos seus
          médicos.
        </p>
      </div>

      <div className="mt-8">
        <ClinicProfileForm
          initial={{
            name: clinic?.name ?? "",
            address: clinic?.address ?? null,
            province: clinic?.province ?? null,
            phone: clinic?.phone ?? null,
            email: clinic?.email ?? null,
            logo_url: clinic?.logo_url ?? null,
            subscription_plan: clinic?.subscription_plan ?? null,
          }}
        />
      </div>
    </main>
  );
}
