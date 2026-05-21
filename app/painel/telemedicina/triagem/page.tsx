import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, ShieldCheck, Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import TriageForm from "./TriageForm";

export const metadata = { title: "Triagem · Lunga" };

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
      {/* Back */}
      <Link
        href="/painel/telemedicina"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Telemedicina
      </Link>

      {/* Emergency warning — top of page so nobody misses it */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 shadow-sm">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/30">
          <AlertTriangle className="size-4" />
        </span>
        <div className="leading-relaxed">
          <strong className="font-bold">
            Emergência grave?
          </strong>{" "}
          Acidente, paragem cardíaca, hemorragia massiva —{" "}
          <a
            href="tel:112"
            className="font-bold underline underline-offset-2 hover:no-underline"
          >
            ligue 112
          </a>{" "}
          imediatamente.
        </div>
      </div>

      {/* Header */}
      <header className="mt-7">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Telemedicina
        </div>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20">
            <Stethoscope className="size-5" />
          </span>
          Como se está a sentir?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Algumas perguntas rápidas — o médico vai ver tudo antes de atender,
          para ser mais rápido.
        </p>
      </header>

      {/* Form */}
      <div className="mt-8">
        <TriageForm />
      </div>

      {/* Privacy footer */}
      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-emerald-600" />
        Só o médico vê estas respostas.
      </p>
    </main>
  );
}
