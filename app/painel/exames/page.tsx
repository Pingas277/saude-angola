import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDatePT } from "@/lib/labels";

export const metadata = { title: "Exames · Saúde Angola" };

type LabRow = {
  id: string;
  lab_name: string;
  test_name: string | null;
  file_url: string | null;
  result_summary: string | null;
  result_date: string | null;
};

export default async function ExamesPage() {
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

  const { data: rows } = await supabase
    .from("lab_results")
    .select("id, lab_name, test_name, file_url, result_summary, result_date")
    .eq("patient_id", patient.id)
    .order("result_date", { ascending: false, nullsFirst: false });

  const list = (rows as LabRow[] | null) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Os meus exames
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Resultados laboratoriais carregados pela sua clínica.
      </p>

      {!list.length ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Ainda não tem exames registados.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {list.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900">
                  {r.test_name ?? "Resultado"}
                </div>
                <div className="mt-0.5 text-sm text-slate-600">
                  {r.lab_name}
                  {r.result_date ? ` · ${formatDatePT(r.result_date)}` : ""}
                </div>
                {r.result_summary && (
                  <p className="mt-1 text-sm text-slate-700">{r.result_summary}</p>
                )}
              </div>
              {r.file_url && (
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver ficheiro
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
