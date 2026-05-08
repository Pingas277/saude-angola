import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MarcarForm from "./MarcarForm";

export const metadata = { title: "Marcar consulta · Saúde Angola" };

type DoctorRow = {
  id: string;
  full_name: string;
  clinic: { name: string | null } | { name: string | null }[] | null;
};

function tomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default async function MarcarPage() {
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

  const { data: rawDoctors } = await supabase
    .from("profiles")
    .select("id, full_name, clinic:clinics(name)")
    .eq("role", "doctor")
    .order("full_name", { ascending: true });

  const doctors = ((rawDoctors as DoctorRow[] | null) ?? []).map((d) => {
    const c = Array.isArray(d.clinic) ? d.clinic[0] : d.clinic;
    return {
      id: d.id,
      full_name: d.full_name,
      clinic_name: c?.name ?? null,
    };
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Marcar consulta
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Escolha um médico, a data e o tipo de consulta.
      </p>

      {doctors.length === 0 ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Ainda não há médicos disponíveis.</p>
          <p className="mt-1">
            A clínica precisa de adicionar médicos antes de poder marcar consultas.
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <MarcarForm doctors={doctors} defaultDate={tomorrowISODate()} />
        </div>
      )}
    </main>
  );
}
