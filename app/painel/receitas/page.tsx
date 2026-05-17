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
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        As minhas receitas
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Receitas médicas emitidas pelos seus médicos.
      </p>

      {!list.length ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Ainda não tem receitas. Após uma consulta, as receitas emitidas aparecem aqui.
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((rx) => {
            const meds = asMeds(rx.medications);
            return (
              <li
                key={rx.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">
                      Emitida em {formatDateTimePT(rx.issued_at)}
                    </div>
                    <div className="text-sm text-muted-foreground">
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
                      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90"
                    >
                      Descarregar PDF
                    </a>
                    <code className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                      {rx.qr_code}
                    </code>
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                  {meds.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">
                      Sem medicação registada.
                    </li>
                  ) : (
                    meds.map((m, i) => (
                      <li key={i} className="px-3 py-2 text-sm">
                        <div className="font-medium text-foreground">
                          {m.name ?? "—"} {m.dosage ? `· ${m.dosage}` : ""}
                        </div>
                        <div className="text-muted-foreground">
                          {[m.frequency, m.duration, m.instructions]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </li>
                    ))
                  )}
                </ul>

                {rx.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">Notas: {rx.notes}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
