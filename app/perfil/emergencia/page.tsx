import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  regenerateEmergencyTokenAction,
  setEmergencyCardEnabledAction,
} from "./actions";

export const metadata = { title: "Cartão de emergência · Lunga" };

type PatientRow = {
  id: string;
  full_name: string | null;
  relationship: string | null;
  emergency_token: string | null;
  emergency_card_enabled: boolean;
  isSelf: boolean;
  ownerName: string | null;
};

async function buildQr(token: string): Promise<{ url: string; svg: string }> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lunga-app.vercel.app";
  const url = `${baseUrl}/e/${token}`;
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 200,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  return { url, svg };
}

export default async function EmergenciaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: own } = await supabase
    .from("patients")
    .select("id, emergency_token, emergency_card_enabled")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data: dependents } = await supabase
    .from("patients")
    .select(
      "id, full_name, relationship, emergency_token, emergency_card_enabled"
    )
    .eq("guardian_profile_id", user.id)
    .is("profile_id", null)
    .order("created_at", { ascending: true });

  const rows: PatientRow[] = [];
  if (own) {
    rows.push({
      id: own.id,
      full_name: profile?.full_name ?? null,
      relationship: null,
      emergency_token: own.emergency_token ?? null,
      emergency_card_enabled: own.emergency_card_enabled ?? true,
      isSelf: true,
      ownerName: profile?.full_name ?? "—",
    });
  }
  for (const d of (dependents as Array<{
    id: string;
    full_name: string | null;
    relationship: string | null;
    emergency_token: string | null;
    emergency_card_enabled: boolean | null;
  }> | null) ?? []) {
    rows.push({
      id: d.id,
      full_name: d.full_name,
      relationship: d.relationship,
      emergency_token: d.emergency_token,
      emergency_card_enabled: d.emergency_card_enabled ?? true,
      isSelf: false,
      ownerName: d.full_name,
    });
  }

  // Pre-render QR svgs server-side for any enabled rows.
  const qrs = await Promise.all(
    rows.map((r) =>
      r.emergency_token && r.emergency_card_enabled
        ? buildQr(r.emergency_token)
        : Promise.resolve({ url: "", svg: "" })
    )
  );

  // Latest 5 scans per patient (for the audit log card).
  const ids = rows.map((r) => r.id);
  const { data: scansData } = ids.length
    ? await supabase
        .from("emergency_card_scans")
        .select("patient_id, scanned_at, user_agent")
        .in("patient_id", ids)
        .order("scanned_at", { ascending: false })
        .limit(50)
    : { data: [] as Array<{ patient_id: string; scanned_at: string; user_agent: string | null }> };
  const scansBy = new Map<
    string,
    Array<{ scanned_at: string; user_agent: string | null }>
  >();
  for (const s of (scansData as Array<{
    patient_id: string;
    scanned_at: string;
    user_agent: string | null;
  }> | null) ?? []) {
    const arr = scansBy.get(s.patient_id) ?? [];
    if (arr.length < 5) {
      arr.push({ scanned_at: s.scanned_at, user_agent: s.user_agent });
      scansBy.set(s.patient_id, arr);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Perfil
      </Link>

      <header className="mt-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Privacidade & emergência
        </div>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          <ShieldAlert className="size-6 text-rose-600" />
          Cartão de Emergência
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Cada pessoa tem um QR único. Em emergência, qualquer médico ou
          paramédico pode scanear o QR e ver{" "}
          <strong className="font-semibold text-foreground">
            só
          </strong>{" "}
          a informação clinicamente relevante: nome próprio, idade, tipo
          sanguíneo, alergias, doenças crónicas e contacto de
          emergência. Pode desativar ou regerar o link a qualquer
          momento.
        </p>
      </header>

      <section className="mt-8 space-y-5">
        {rows.map((row, i) => {
          const qr = qrs[i];
          const scans = scansBy.get(row.id) ?? [];
          return (
            <article
              key={row.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              {/* Row header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {row.isSelf
                      ? "O seu cartão"
                      : `Dependente${row.relationship ? ` · ${row.relationship}` : ""}`}
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-foreground">
                    {row.ownerName ?? "—"}
                  </div>
                </div>
                <StatusPill enabled={row.emergency_card_enabled} />
              </div>

              {/* Body */}
              <div className="grid gap-5 px-5 py-5 sm:grid-cols-[200px_1fr]">
                {/* QR / placeholder */}
                <div>
                  {row.emergency_card_enabled && qr.svg ? (
                    <a
                      href={qr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block size-[200px] rounded-2xl border-2 border-slate-900 bg-white p-3 shadow-md"
                    >
                      <div
                        className="size-full"
                        dangerouslySetInnerHTML={{ __html: qr.svg }}
                      />
                    </a>
                  ) : (
                    <div className="grid size-[200px] place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 text-center text-xs text-muted-foreground">
                      <div>
                        <ShieldOff className="mx-auto size-6 opacity-50" />
                        <div className="mt-2 font-semibold">
                          Cartão desativado
                        </div>
                        <div className="mt-1 text-[10px]">
                          O QR não resolve até reativar.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  {row.emergency_card_enabled && qr.url && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Link público
                      </div>
                      <a
                        href={qr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 break-all text-xs text-primary underline-offset-2 hover:underline"
                      >
                        {qr.url}
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {/* Toggle */}
                  <form action={setEmergencyCardEnabledAction}>
                    <input
                      type="hidden"
                      name="patient_id"
                      value={row.id}
                    />
                    <input
                      type="hidden"
                      name="enabled"
                      value={String(!row.emergency_card_enabled)}
                    />
                    <button
                      type="submit"
                      className={
                        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors " +
                        (row.emergency_card_enabled
                          ? "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                          : "bg-emerald-600 text-white hover:bg-emerald-700")
                      }
                    >
                      {row.emergency_card_enabled ? (
                        <>
                          <ShieldOff className="size-3.5" />
                          Desativar cartão
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-3.5" />
                          Ativar cartão
                        </>
                      )}
                    </button>
                  </form>

                  {/* Regenerate */}
                  {row.emergency_card_enabled && (
                    <form action={regenerateEmergencyTokenAction}>
                      <input
                        type="hidden"
                        name="patient_id"
                        value={row.id}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                      >
                        <RefreshCw className="size-3.5" />
                        Regerar link (revoga o anterior)
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Audit log */}
              {scans.length > 0 && (
                <div className="border-t border-border bg-muted/30 px-5 py-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Últimos {scans.length} acessos
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {scans.map((s, j) => (
                      <li key={j} className="flex items-center justify-between gap-2">
                        <span>
                          {new Date(s.scanned_at).toLocaleString("pt-PT", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="truncate text-right text-[10px]">
                          {s.user_agent ? shortUA(s.user_agent) : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

function StatusPill({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400">
      <ShieldCheck className="size-3.5" />
      Ativo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border">
      <ShieldOff className="size-3.5" />
      Desativado
    </span>
  );
}

function shortUA(ua: string): string {
  // Trim browser/UA strings to a readable hint without leaking details.
  if (/iPhone|iPad/.test(ua)) return "iPhone/iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return "Outro";
}
