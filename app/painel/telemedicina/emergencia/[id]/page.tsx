import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Emergência · Saúde Angola" };

export default async function EmergenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: c } = await supabase
    .from("consultations")
    .select("id, status, ai_urgency, ai_triage_summary, patient_id")
    .eq("id", id)
    .maybeSingle();

  if (!c || c.patient_id !== patient.id) notFound();
  // If urgency isn't actually emergency or the consult already moved past
  // waiting, skip the interstitial.
  if (c.ai_urgency !== "emergency" || c.status !== "waiting") {
    redirect(`/painel/telemedicina/sala/${c.id}`);
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-2xl items-center px-6 py-10">
      <div className="w-full overflow-hidden rounded-2xl border border-red-200 bg-white shadow-lg">
        <div className="flex items-center gap-3 bg-red-700 px-6 py-4 text-white">
          <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-2xl font-bold">
            !
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-red-100">
              Possível emergência
            </div>
            <div className="text-lg font-bold">
              Os seus sintomas podem precisar de atendimento imediato
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          <p className="text-base text-slate-800">
            Com base na triagem, a urgência foi classificada como{" "}
            <strong className="text-red-700">emergência</strong>. A telemedicina
            <strong> não substitui </strong> uma urgência hospitalar em situações
            críticas.
          </p>

          <ul className="space-y-2 rounded-lg bg-red-50 p-4 text-sm text-red-900">
            <li>• Se está com dor no peito intensa, dificuldade grande em respirar, hemorragia abundante ou perda de consciência:</li>
            <li className="font-bold">→ Ligue 112 imediatamente.</li>
            <li>• Ou desloque-se à urgência mais próxima.</li>
          </ul>

          {c.ai_triage_summary && (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {c.ai_triage_summary}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:112"
              className="flex-1 rounded-md bg-red-600 px-4 py-3 text-center text-base font-bold text-white shadow-sm hover:bg-red-700"
            >
              📞 Ligar 112
            </a>
            <Link
              href={`/painel/telemedicina/sala/${c.id}?aceito=1`}
              className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Continuar com telemedicina mesmo assim
            </Link>
          </div>

          <p className="text-center text-xs text-slate-500">
            Se continuar, um médico vai atender por vídeo, mas isso pode demorar
            mais do que uma chamada para o 112.
          </p>
        </div>
      </div>
    </main>
  );
}
