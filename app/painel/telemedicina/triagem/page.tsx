import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TriageForm from "./TriageForm";

export const metadata = { title: "Triagem · Saúde Angola" };

export default async function TriagemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!patient) redirect("/perfil?onboarding=1");

  // If a consultation is already pending, skip the form.
  const { data: existing } = await supabase
    .from("consultations")
    .select("id")
    .eq("patient_id", patient.id)
    .in("status", ["waiting", "in_progress"])
    .limit(1)
    .maybeSingle();
  if (existing) redirect(`/painel/telemedicina/sala/${existing.id}`);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4">
        <Link
          href="/painel/telemedicina"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Voltar
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Triagem inicial
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Algumas perguntas rápidas para o médico já saber o que se passa quando
        atender a chamada.
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <TriageForm />
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Em caso de emergência grave (acidente, paragem cardíaca, hemorragia
        massiva), ligue 112 imediatamente.
      </p>
    </main>
  );
}
