import { redirect } from "next/navigation";
import { Building2, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AdminHeader from "../_components/AdminHeader";
import ClinicProfileForm from "./ClinicProfileForm";

export const metadata = { title: "Perfil da Clínica · Lunga" };

const PLAN_LABEL: Record<string, string> = {
  basic: "Básico",
  standard: "Padrão",
  premium: "Premium",
};

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
    .select(
      "id, name, address, province, phone, email, logo_url, subscription_plan"
    )
    .eq("id", admin.clinic_id)
    .maybeSingle();

  const plan = clinic?.subscription_plan ?? null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <AdminHeader
        eyebrow="Definições"
        title="Perfil da clínica"
        subtitle="Estes dados aparecem nas receitas e faturas emitidas pelos seus médicos."
        icon={<Building2 className="size-5" />}
        action={
          plan ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Plano {PLAN_LABEL[plan] ?? plan}
            </span>
          ) : undefined
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">
            Dados da clínica
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mantenha a informação atualizada — é o que os pacientes e as
            farmácias veem.
          </p>
          <div className="mt-6">
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
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              Onde estes dados aparecem
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>· Cabeçalho das receitas médicas (PDF)</li>
              <li>· Faturas e comprovativos de pagamento</li>
              <li>· Resultados de pesquisa de clínicas</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              Plano de subscrição
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              O plano é gerido pela Lunga. Para alterar limites ou
              funcionalidades, contacte{" "}
              <a
                href="mailto:suporte@lunga.ao"
                className="font-medium text-primary hover:underline"
              >
                suporte@lunga.ao
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
