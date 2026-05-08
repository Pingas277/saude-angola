import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MarcarRecepcaoFlow from "./MarcarRecepcaoFlow";

export const metadata = { title: "Nova marcação · Saúde Angola" };

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

type DoctorRow = {
  id: string;
  full_name: string | null;
  specialty: string | null;
};

export default async function MarcarRecepcaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "receptionist" || !profile.clinic_id) redirect("/painel");

  const { data: doctorsRaw } = await supabase
    .from("profiles")
    .select("id, full_name, specialty")
    .eq("role", "doctor")
    .eq("clinic_id", profile.clinic_id)
    .order("full_name", { ascending: true });

  const doctors = (doctorsRaw as DoctorRow[] | null ?? []).map((d) => ({
    id: d.id,
    full_name: d.full_name ?? "—",
    specialty: d.specialty,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-4">
        <Link
          href="/recepcao"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Voltar à fila
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Nova marcação
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Procure um paciente já registado ou registe um novo walk-in.
      </p>

      {doctors.length === 0 ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          A clínica ainda não tem médicos. Peça ao administrador para os
          adicionar em /clinica/equipa antes de marcar consultas.
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <MarcarRecepcaoFlow doctors={doctors} defaultDate={todayISODate()} />
        </div>
      )}
    </main>
  );
}
