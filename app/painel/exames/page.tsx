import { redirect } from "next/navigation";
import {
  FlaskConical,
  Hash,
  CalendarClock,
  Building2,
  Download,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDatePT } from "@/lib/labels";
import GradientStatCard from "../../_ui/GradientStatCard";

export const metadata = { title: "Exames · Lunga" };

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
  const labCount = new Set(list.map((r) => r.lab_name)).size;
  const latest = list.find((r) => r.result_date);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-primary">
            Saúde
          </div>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            <FlaskConical className="size-6 text-primary" />
            Os meus exames
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resultados laboratoriais carregados pela sua clínica.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <GradientStatCard
          tone="indigo"
          icon={<Hash className="size-5" />}
          label="Total"
          value={list.length}
          hint={list.length === 1 ? "exame" : "exames"}
        />
        <GradientStatCard
          tone="sky"
          icon={<Building2 className="size-5" />}
          label="Laboratórios"
          value={labCount}
          hint="únicos"
        />
        <GradientStatCard
          tone="emerald"
          icon={<CalendarClock className="size-5" />}
          label="Último"
          value={latest?.result_date ? formatDatePT(latest.result_date) : "—"}
          hint={latest?.test_name ?? "sem resultados"}
        />
      </section>

      {/* Results list */}
      {!list.length ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <FlaskConical className="size-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Ainda sem exames
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Quando a sua clínica carregar resultados laboratoriais, aparecem
            aqui — descarregáveis em PDF.
          </p>
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {list.map((r) => (
            <li
              key={r.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-4 p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
                  <FlaskConical className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-foreground">
                    {r.test_name ?? "Resultado"}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="size-3" />
                      {r.lab_name}
                    </span>
                    {r.result_date && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3" />
                        {formatDatePT(r.result_date)}
                      </span>
                    )}
                  </div>
                  {r.result_summary && (
                    <p className="mt-2 line-clamp-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                      {r.result_summary}
                    </p>
                  )}
                </div>
                {r.file_url && (
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Download className="size-3.5" />
                    Ver ficheiro
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
