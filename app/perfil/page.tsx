import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Logo from "../_brand/Logo";
import AvatarUpload from "../_app/AvatarUpload";
import PerfilForm from "./PerfilForm";
import DependentsSection, { type Dependent } from "./DependentsSection";

export const metadata = { title: "Perfil · Lunga" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: patient } = await supabase
    .from("patients")
    .select(
      "date_of_birth, blood_type, gender, id_number, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone"
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data: dependentsRaw } = await supabase
    .from("patients")
    .select(
      "id, full_name, relationship, date_of_birth, gender, blood_type, id_number"
    )
    .eq("guardian_profile_id", user.id)
    .is("profile_id", null)
    .order("created_at", { ascending: true });
  const dependents: Dependent[] = (dependentsRaw as Dependent[] | null) ?? [];

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Logo href="/painel" size="md" subtitle="Perfil" />
          <Link
            href="/painel"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao painel
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          O meu perfil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mantenha a sua informação clínica atualizada para um melhor atendimento.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">
            Foto de perfil
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aparece no menu lateral em toda a plataforma.
          </p>
          <div className="mt-5">
            <AvatarUpload
              userId={user.id}
              name={profile?.full_name ?? user.email ?? "Paciente"}
              initialUrl={profile?.avatar_url ?? null}
            />
          </div>
        </div>

        <div className="mt-6">
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

        <DependentsSection initial={dependents} />

        {/* Privacy & emergency entry — link to the dedicated page so the
            toggle / regenerate / scan log have room to breathe. */}
        <div className="mt-6">
          <Link
            href="/perfil/emergencia"
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-700">
                <ShieldAlert className="size-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Cartão de Emergência
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Gerir o QR público para si e dependentes.
                </div>
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </main>
  );
}
