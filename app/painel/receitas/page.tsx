import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTimePT } from "@/lib/labels";

export const metadata = { title: "Receitas · Saúde Angola" };

type Medication = {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

type RxRow = {
  id: string;
  medications: Medication[] | unknown;
  qr_code: string;
  notes: string | null;
  issued_at: string;
  expires_at: string | null;
  doctor: { full_name: string | null } | { full_name: string | null }[] | null;
};

function pickName(v: RxRow["doctor"]): string {
  if (!v) return "—";
  const r = Array.isArray(v) ? v[0] : v;
  return r?.full_name ?? "—";
}

function asMeds(v: unknown): Medication[] {
  if (Array.isArray(v)) return v as Medication[];
  return [];
}

export default async function ReceitasPage() {
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
    .from("prescriptions")
    .select(
      "id, medications, qr_code, notes, issued_at, expires_at, doctor:profiles!prescriptions_doctor_id_fkey(full_name)"
    )
    .eq("patient_id", patient.id)
    .order("issued_at", { ascending: false });

  const list = (rows as RxRow[] | null) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        As minhas receitas
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Receitas médicas emitidas pelos seus médicos.
      </p>

      {!list.length ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Ainda não tem receitas. Após uma consulta, as receitas emitidas aparecem aqui.
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((rx) => {
            const meds = asMeds(rx.medications);
            return (
              <li
                key={rx.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">
                      Emitida em {formatDateTimePT(rx.issued_at)}
                    </div>
                    <div className="text-sm text-slate-600">
                      Por {pickName(rx.doctor)}
                      {rx.expires_at
                        ? ` · Válida até ${formatDateTimePT(rx.expires_at)}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <a
                      href={`/api/receita/${rx.id}/pdf`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                      Descarregar PDF
                    </a>
                    <code className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
                      {rx.qr_code}
                    </code>
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {meds.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-slate-500">
                      Sem medicação registada.
                    </li>
                  ) : (
                    meds.map((m, i) => (
                      <li key={i} className="px-3 py-2 text-sm">
                        <div className="font-medium text-slate-900">
                          {m.name ?? "—"} {m.dosage ? `· ${m.dosage}` : ""}
                        </div>
                        <div className="text-slate-600">
                          {[m.frequency, m.duration, m.instructions]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </li>
                    ))
                  )}
                </ul>

                {rx.notes && (
                  <p className="mt-3 text-sm text-slate-600">Notas: {rx.notes}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
