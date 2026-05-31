import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Download,
  ExternalLink,
  FileText,
  FlaskConical,
  Hash,
  Share2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { waShareUrl } from "@/lib/whatsapp";
import { formatDatePT } from "@/lib/labels";

export const metadata = { title: "Exames · Lunga" };

type LabRow = {
  id: string;
  lab_name: string;
  test_name: string | null;
  file_url: string | null;
  result_summary: string | null;
  result_date: string | null;
  created_at: string;
  /** Resolved download URL: a signed lab-files URL for storage paths, the
   * original URL for legacy http(s) entries, null when no file. */
  downloadUrl: string | null;
};

const PT_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function monthKey(iso: string | null): { key: string; label: string } {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) {
    return { key: "sem-data", label: "Sem data" };
  }
  return {
    key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    label: `${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
  };
}

function shortId(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
}

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
    .select(
      "id, lab_name, test_name, file_url, result_summary, result_date, created_at"
    )
    .eq("patient_id", patient.id)
    .order("result_date", { ascending: false, nullsFirst: false });

  const rawList =
    ((rows as Omit<LabRow, "downloadUrl">[] | null) ?? []);

  // Resolve signed URLs for any file_url that's a lab-files storage path.
  // Legacy entries that already contain a full http(s) URL are passed through.
  const HTTP_RE = /^https?:\/\//i;
  const storagePaths = rawList
    .filter(
      (r): r is typeof r & { file_url: string } =>
        !!r.file_url && !HTTP_RE.test(r.file_url)
    )
    .map((r) => r.file_url);
  const signedMap = new Map<string, string>();
  if (storagePaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("lab-files")
      .createSignedUrls(storagePaths, 60 * 30); // 30 min
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) signedMap.set(s.path, s.signedUrl);
    }
  }
  const list: LabRow[] = rawList.map((r) => ({
    ...r,
    downloadUrl: !r.file_url
      ? null
      : HTTP_RE.test(r.file_url)
        ? r.file_url
        : (signedMap.get(r.file_url) ?? null),
  }));

  const labCount = new Set(list.map((r) => r.lab_name)).size;
  const latest = list.find((r) => r.result_date);

  // Group by month
  const groups = new Map<string, { label: string; items: LabRow[] }>();
  for (const r of list) {
    const { key, label } = monthKey(r.result_date ?? r.created_at);
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(r);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* ─── Header ─── */}
      <header>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          A minha saúde
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Os meus exames
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Resultados laboratoriais carregados pela sua clínica.
        </p>
      </header>

      {/* ─── Quick stats ─── */}
      {list.length > 0 && (
        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <StatChip
            icon={Hash}
            label="Total"
            value={String(list.length)}
            color="from-sky-500 to-indigo-600"
          />
          <StatChip
            icon={Building2}
            label="Laboratórios"
            value={String(labCount)}
            color="from-emerald-500 to-teal-600"
          />
          <StatChip
            icon={CalendarClock}
            label="Último"
            value={
              latest?.result_date ? formatDatePT(latest.result_date) : "—"
            }
            color="from-amber-500 to-orange-600"
          />
        </section>
      )}

      {/* ─── Empty ─── */}
      {!list.length && (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <FlaskConical className="size-6" />
          </span>
          <h2 className="mt-5 text-base font-semibold text-foreground">
            Ainda sem exames
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Quando a sua clínica carregar resultados, aparecem aqui — com
            o ficheiro original e um resumo. Sem papel.
          </p>
          <Link
            href="/painel/marcar"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
          >
            Marcar uma consulta
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {/* ─── Results by month ─── */}
      {list.length > 0 && (
        <section className="mt-8 space-y-6">
          {[...groups.entries()].map(([key, group]) => (
            <div key={key}>
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-foreground">
                  {group.label}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "resultado" : "resultados"}
                </span>
              </div>
              <ul className="space-y-2">
                {group.items.map((r) => (
                  <li key={r.id}>
                    <LabCard row={r} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ─── Help footer ─── */}
      {list.length > 0 && (
        <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Os resultados ficam guardados consigo, para sempre.
        </p>
      )}
    </main>
  );
}

/* ─────────────────────────── card ─────────────────────────── */

function LabCard({ row }: { row: LabRow }) {
  const friendlyId = `LG-EX-${shortId(row.id)}`;
  const waShareHref = waShareUrl(
    `Exame Lunga · ${friendlyId}\n${row.test_name ?? "Resultado"}${
      row.lab_name ? `\n${row.lab_name}` : ""
    }${row.result_date ? `\n${formatDatePT(row.result_date)}` : ""}${
      row.result_summary ? `\n\n${row.result_summary}` : ""
    }`
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
          <FlaskConical className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold tracking-tight text-foreground">
            {row.test_name ?? "Resultado"}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-3" />
              {row.lab_name}
            </span>
            {row.result_date && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="size-3" />
                  {formatDatePT(row.result_date)}
                </span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="font-mono text-[10px] uppercase tracking-wider">
              {friendlyId}
            </span>
          </div>
          {row.result_summary && (
            <p className="mt-3 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
              {row.result_summary}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {row.downloadUrl ? (
          <a
            href={row.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md"
          >
            <Download className="size-3.5" />
            Ver ficheiro
            <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3.5 py-2 text-xs font-medium text-muted-foreground">
            <FileText className="size-3.5" />
            Ficheiro não disponível
          </span>
        )}
        <a
          href={waShareHref}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500/40 hover:bg-emerald-50"
        >
          <Share2 className="size-3.5 text-emerald-600" />
          Partilhar via WhatsApp
        </a>
      </div>
    </article>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span
        className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-xl font-bold tracking-tight text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
