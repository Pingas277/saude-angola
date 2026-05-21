import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  Pill,
  ScanLine,
  Share2,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDatePT, formatDateTimePT } from "@/lib/labels";

export const metadata = { title: "Receita · Lunga" };

type Medication = {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  notes?: string;
};

type Doctor = {
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
};
type Clinic = { name: string | null; phone: string | null };

type RxRow = {
  id: string;
  medications: Medication[] | unknown;
  qr_code: string;
  notes: string | null;
  issued_at: string;
  expires_at: string | null;
  doctor: Doctor | Doctor[] | null;
  appointment:
    | { clinic: Clinic | Clinic[] | null }
    | { clinic: Clinic | Clinic[] | null }[]
    | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function asMeds(v: unknown): Medication[] {
  return Array.isArray(v) ? (v as Medication[]) : [];
}

function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

function shortId(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export default async function ReceitaDetailPage({
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

  const { data: rxRaw } = await supabase
    .from("prescriptions")
    .select(
      `id, medications, qr_code, notes, issued_at, expires_at,
       doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty, avatar_url),
       appointment:appointments(clinic:clinics(name, phone))`
    )
    .eq("id", id)
    .eq("patient_id", patient.id)
    .maybeSingle();

  if (!rxRaw) notFound();
  const rx = rxRaw as RxRow;

  const meds = asMeds(rx.medications);
  const doctor = pickOne(rx.doctor);
  const apptRel = pickOne(rx.appointment);
  const clinic = pickOne(apptRel?.clinic ?? null);

  const now = Date.now();
  const expired = rx.expires_at
    ? new Date(rx.expires_at).getTime() < now
    : false;
  const daysLeft = rx.expires_at
    ? Math.ceil((new Date(rx.expires_at).getTime() - now) / 86400000)
    : null;

  // Server-render the QR as inline SVG — sky/emerald accent colour
  const qrSvg = await QRCode.toString(rx.qr_code, {
    type: "svg",
    margin: 1,
    color: { dark: "#0c4a6e", light: "#ffffff" },
    width: 220,
  });

  const friendlyId = `LG-RX-${shortId(rx.id)}`;
  const medsSummary = meds
    .map((m, i) => `${i + 1}. ${m.name ?? "—"}${m.dosage ? ` (${m.dosage})` : ""}`)
    .join("\n");
  const waText = encodeURIComponent(
    `Receita Lunga · ${friendlyId}\n${expired ? "(EXPIRADA)" : "Válida"}${
      doctor?.full_name ? `\nDr(a). ${doctor.full_name}` : ""
    }\n\n${medsSummary}\n\nQR: ${rx.qr_code}`
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* ─── Back ─── */}
      <Link
        href="/painel/receitas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar às receitas
      </Link>

      {/* ─── Hero with QR ─── */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 text-white shadow-xl shadow-sky-500/30">
        {/* Decorative orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-white/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-emerald-300/30 blur-3xl"
        />

        <div className="relative grid gap-6 p-7 sm:grid-cols-[1fr_220px] sm:items-center sm:p-9">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/85">
              <Pill className="size-3.5" />
              Receita médica
            </div>
            <div className="mt-3 font-mono text-2xl font-bold tracking-tight sm:text-3xl">
              {friendlyId}
            </div>
            <div className="mt-4">
              {expired ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  <XCircle className="size-3" />
                  Expirada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                  <CheckCircle2 className="size-3" />
                  Válida
                  {daysLeft !== null && daysLeft <= 14
                    ? ` · ${daysLeft} dia${daysLeft === 1 ? "" : "s"}`
                    : ""}
                </span>
              )}
            </div>
            <div className="mt-5 space-y-1.5 text-sm text-white/90">
              <div className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" />
                Emitida {formatDateTimePT(rx.issued_at)}
              </div>
              {rx.expires_at && (
                <div className="inline-flex items-center gap-1.5 text-white/80">
                  <Clock className="size-4" />
                  {expired ? "Expirou" : "Válida até"}{" "}
                  {formatDatePT(rx.expires_at)}
                </div>
              )}
            </div>
          </div>

          {/* QR card */}
          <div className="rounded-2xl bg-white p-3 shadow-2xl shadow-black/10">
            <div
              className="aspect-square w-full"
              // qrcode emits its own well-formed SVG
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-sky-700">
              <ScanLine className="size-3" />
              {rx.qr_code}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Doctor + clinic strip ─── */}
      <section className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-sm">
            <div className="grid size-11 place-items-center overflow-hidden rounded-[10px] bg-white text-sm font-bold text-sky-700">
              {doctor?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctor.avatar_url}
                  alt={doctor.full_name ?? ""}
                  className="size-full object-cover"
                />
              ) : (
                initials(doctor?.full_name ?? null)
              )}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Médico
            </div>
            <div className="text-sm font-semibold text-foreground">
              Dr(a). {doctor?.full_name ?? "—"}
            </div>
            {doctor?.specialty && (
              <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Stethoscope className="size-3 text-primary" />
                {doctor.specialty}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Building2 className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Clínica
            </div>
            <div className="text-sm font-semibold text-foreground">
              {clinic?.name ?? "Telemedicina"}
            </div>
            {clinic?.phone && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {clinic.phone}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Medications ─── */}
      <section className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Pill className="size-3.5" />
            Medicação
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground">
            {meds.length} {meds.length === 1 ? "medicamento" : "medicamentos"}
          </span>
        </div>

        {meds.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Sem medicação registada.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {meds.map((m, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl border border-border bg-background p-3.5 shadow-sm"
              >
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-xs font-bold text-white shadow-sm">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {m.name ?? "—"}
                    {m.dosage && (
                      <span className="font-normal text-muted-foreground">
                        {" · "}
                        {m.dosage}
                      </span>
                    )}
                  </div>
                  {(m.frequency || m.duration || m.instructions || m.notes) && (
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {[m.frequency, m.duration, m.instructions, m.notes]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {rx.notes && (
          <p className="mt-4 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Indicações do médico:{" "}
            </span>
            {rx.notes}
          </p>
        )}
      </section>

      {/* ─── How to use at pharmacy ─── */}
      <section className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
          <ScanLine className="size-3.5" />
          Como apresentar na farmácia
        </h3>
        <ol className="mt-3 space-y-1.5 text-sm text-emerald-900/85">
          <li>
            <strong>1.</strong> Mostre este código QR na farmácia parceira da
            Lunga.
          </li>
          <li>
            <strong>2.</strong> O farmacêutico lê e vê a receita
            automaticamente.
          </li>
          <li>
            <strong>3.</strong> Levanta a medicação. Sem papel.
          </li>
        </ol>
      </section>

      {/* ─── Actions ─── */}
      <section className="mt-5 flex flex-wrap items-center gap-2.5">
        <a
          href={`/api/receita/${rx.id}/pdf`}
          target="_blank"
          rel="noopener"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
        >
          <Download className="size-4" />
          Descarregar PDF
        </a>
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-emerald-500/40 hover:bg-emerald-50"
        >
          <Share2 className="size-4 text-emerald-600" />
          Partilhar via WhatsApp
        </a>
        {clinic?.phone && (
          <a
            href={`tel:${clinic.phone}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-accent"
          >
            <Building2 className="size-4" />
            Contactar clínica
          </a>
        )}
      </section>

      {/* ─── Help footer ─── */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        A receita está protegida pelo código QR.{" "}
        <a
          href={`mailto:suporte@lunga.ao?subject=Receita%20${friendlyId}`}
          className="font-semibold text-primary hover:underline"
        >
          Falar com o suporte
        </a>
      </p>
    </main>
  );
}
