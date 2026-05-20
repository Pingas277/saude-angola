import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, User, FileText, BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import MedicoHeader from "../_components/MedicoHeader";
import AvatarUpload from "../../_app/AvatarUpload";
import DoctorProfileForm from "./DoctorProfileForm";

export const metadata = { title: "Perfil do Médico · Lunga" };

export default async function MedicoPerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, medical_license, specialty, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "doctor") redirect("/painel");

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <Link
        href="/medico"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao painel
      </Link>

      <MedicoHeader
        eyebrow="Definições"
        title="O meu perfil profissional"
        subtitle="Estes dados aparecem nas receitas e nas faturas que emite."
        icon={<User className="size-5" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">
            Dados profissionais
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mantenha a cédula e a especialidade atualizadas — aparecem nos
            documentos clínicos.
          </p>
          <div className="mt-6 border-b border-border pb-6">
            <AvatarUpload
              userId={user.id}
              name={profile?.full_name ?? user.email ?? "Médico"}
              initialUrl={profile?.avatar_url ?? null}
            />
          </div>
          <div className="mt-6">
            <DoctorProfileForm
              initial={{
                full_name: profile?.full_name ?? "",
                phone: profile?.phone ?? null,
                medical_license: profile?.medical_license ?? null,
                specialty: profile?.specialty ?? null,
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
              <li>· Cabeçalho e assinatura das receitas (PDF)</li>
              <li>· Faturas e comprovativos que emite</li>
              <li>· Ficha do médico vista pelos pacientes</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <BadgeCheck className="size-4" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              Cédula profissional
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A cédula é obrigatória para que as receitas sejam aceites nas
              farmácias parceiras. Verifique que está correta.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
