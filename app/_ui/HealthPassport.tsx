"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight, X } from "lucide-react";
import { BLOOD_TYPE_LABELS, formatDatePT } from "@/lib/labels";

const GENDER_PT: Record<string, string> = {
  female: "Feminino",
  male: "Masculino",
  other: "Outro",
  prefer_not_to_say: "—",
};

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function shortId(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 9).toUpperCase();
}

type Props = {
  userId: string;
  profile: {
    full_name: string | null;
    avatar_url?: string | null;
  };
  patient: {
    id_number: string | null;
    date_of_birth: string | null;
    blood_type: string | null;
    gender: string | null;
    allergies?: string[] | null;
  } | null;
  issuedAt?: string;
};

export default function HealthPassport({
  userId,
  profile,
  patient,
  issuedAt,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const name = (profile.full_name ?? "—").toUpperCase();
  const age = ageFromDob(patient?.date_of_birth ?? null);
  const id = shortId(userId);

  // iOS-weighted easing — heavier start, soft landing — fits the booklet
  // gesture better than a symmetric ease. Asymmetric duration: opening is
  // the reveal moment so it's deliberate; closing snappy. (Emil's rule.)
  const flipTransition = reducedMotion
    ? "opacity 180ms ease-out"
    : open
      ? "transform 1.05s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 500ms cubic-bezier(0.4, 0, 0.2, 1)"
      : "transform 700ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 400ms cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div className="select-none">
      <div className="relative" style={{ perspective: "2400px" }}>
        <div className="relative">
          {/* Inside (data) page — anchors the height, sits behind the cover */}
          <DataPage
            name={name}
            age={age}
            id={id}
            profile={profile}
            patient={patient}
            issuedAt={issuedAt}
            isOpen={open}
            onClose={() => setOpen(false)}
            reducedMotion={reducedMotion}
          />

          {/* Cover — flips open from the left hinge */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar passaporte" : "Abrir passaporte"}
            className="group absolute inset-0 cursor-pointer overflow-hidden rounded-3xl border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
            style={{
              transformOrigin: "left center",
              transform: reducedMotion
                ? "none"
                : open
                  ? "rotateY(-170deg)"
                  : "rotateY(0deg)",
              opacity: reducedMotion && open ? 0 : 1,
              transition: flipTransition,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              pointerEvents: open ? "none" : "auto",
              WebkitTapHighlightColor: "transparent",
              boxShadow: open
                ? "0 30px 60px -30px rgba(0,0,0,0.25)"
                : "0 30px 60px -15px rgba(2, 32, 48, 0.55), 0 10px 20px -5px rgba(2, 32, 48, 0.3)",
            }}
          >
            <Cover />
          </button>
        </div>
      </div>

      {/* Hint under the booklet */}
      <div className="mt-4 flex items-center justify-center">
        {open ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-[background-color,color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-[0.97]"
          >
            <X className="size-3.5" />
            Fechar passaporte
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            Toque no passaporte para abrir
            <ChevronRight className="size-3.5 motion-safe:animate-pulse" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── COVER ─────────────────────────── */

function Cover() {
  return (
    <div className="relative size-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-sky-950 to-emerald-950 text-white transition-transform duration-300 ease-out [@media(hover:hover)]:group-hover:scale-[1.015] group-active:!scale-[0.985] motion-reduce:!scale-100 motion-reduce:transition-none">
      {/* Embossed dot pattern */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="cover-dots"
            x="0"
            y="0"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cover-dots)" />
      </svg>

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.45))]"
      />

      {/* Gold-ish inset borders (passport frame) */}
      <div className="pointer-events-none absolute inset-4 rounded-2xl border border-amber-200/25" />
      <div className="pointer-events-none absolute inset-[18px] rounded-[14px] border border-amber-200/10" />

      {/* Spine line on the left edge */}
      <div className="pointer-events-none absolute inset-y-4 left-2 w-px bg-gradient-to-b from-transparent via-amber-200/30 to-transparent" />

      <div className="relative flex h-full flex-col items-center justify-between px-8 py-10 text-center">
        {/* Top — country */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-amber-100/85">
            República de Angola
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-amber-200/55">
            <Image
              src="/brand/angola-flag.png"
              alt=""
              width={18}
              height={12}
              className="rounded-[2px] ring-1 ring-amber-200/30"
            />
            <span className="font-mono tracking-[0.3em]">· AO ·</span>
          </div>
        </div>

        {/* Centerpiece — emblem + title */}
        <div className="flex flex-col items-center gap-5">
          <div className="rounded-2xl bg-white/95 px-5 py-3 shadow-2xl shadow-black/40 ring-1 ring-amber-200/30">
            <Image
              src="/brand/logo-full.png"
              alt="lunga"
              width={180}
              height={68}
              className="h-16 w-auto sm:h-20"
              priority
            />
          </div>
          <div className="space-y-1.5">
            <div className="font-mono text-2xl font-black uppercase tracking-[0.32em] text-amber-100/95 sm:text-3xl">
              Passaporte
            </div>
            <div className="font-mono text-xs font-bold uppercase tracking-[0.42em] text-white/65 sm:text-sm">
              de Saúde
            </div>
          </div>
        </div>

        {/* Bottom — type/code badges + hint */}
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-[10px]">
            <div className="rounded border border-amber-200/30 px-2 py-0.5 font-mono uppercase tracking-[0.22em] text-amber-100/75">
              Tipo · P
            </div>
            <div className="rounded border border-amber-200/30 px-2 py-0.5 font-mono uppercase tracking-[0.22em] text-amber-100/75">
              Código · AO
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-amber-100/55">
            <span className="font-mono uppercase tracking-[0.32em]">
              Toque para abrir
            </span>
            <ChevronRight className="size-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── DATA PAGE ─────────────────────────── */

function DataPage({
  name,
  age,
  id,
  profile,
  patient,
  issuedAt,
  isOpen,
  onClose,
  reducedMotion,
}: {
  name: string;
  age: number | null;
  id: string;
  profile: Props["profile"];
  patient: Props["patient"];
  issuedAt?: string;
  isOpen: boolean;
  onClose: () => void;
  reducedMotion: boolean;
}) {
  // Stagger reveal — each section fades + rises into place after the cover
  // has rotated past edge-on (~350ms in). Closing snaps everything back fast.
  const reveal = (delay: number): React.CSSProperties => {
    if (reducedMotion) return {};
    return {
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? "translateY(0)" : "translateY(14px)",
      transition: isOpen
        ? `opacity 520ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`
        : "opacity 140ms ease-out, transform 140ms ease-out",
      willChange: "opacity, transform",
    };
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 text-white shadow-2xl shadow-sky-500/30">
      {/* Decorative pattern */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="passport-dots"
            x="0"
            y="0"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#passport-dots)" />
      </svg>
      {/* Soft orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-white/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-emerald-300/30 blur-3xl"
      />

      {/* Spine shadow (gives it that "inner page next to the binding" feel) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/30 to-transparent"
      />

      <div className="relative p-6 sm:p-8">
        {/* Top band */}
        <div
          className="flex flex-wrap items-center justify-between gap-3"
          style={reveal(280)}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/85">
              Passaporte de Saúde
            </div>
            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white/65">
              República de Angola
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/95 px-3 py-1.5 shadow-sm">
              <Image
                src="/brand/logo-full.png"
                alt="lunga"
                width={88}
                height={33}
                className="h-8 w-auto"
              />
            </div>
            {isOpen && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar passaporte"
                className="grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-[background-color,transform] duration-150 ease-out hover:bg-white/25 active:scale-95"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Photo + identity */}
        <div
          className="mt-7 flex flex-wrap items-start gap-5"
          style={reveal(380)}
        >
          <div className="relative">
            <div className="grid size-24 place-items-center overflow-hidden rounded-2xl border-4 border-white/90 bg-white text-2xl font-bold text-sky-700 shadow-xl">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? "Paciente"}
                  className="size-full object-cover"
                />
              ) : (
                initials(profile.full_name)
              )}
            </div>
            {/* Biometric-style stripes */}
            <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
              <span className="h-1 w-2 rounded-sm bg-white/70" />
              <span className="h-1 w-4 rounded-sm bg-white/50" />
              <span className="h-1 w-2 rounded-sm bg-white/70" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/75">
              Nome
            </div>
            <div className="mt-1 font-mono text-2xl font-bold leading-tight tracking-wider text-white sm:text-3xl">
              {name}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Field label="Idade" value={age !== null ? `${age}` : "—"} />
              <Field
                label="Género"
                value={patient?.gender ? GENDER_PT[patient.gender] ?? "—" : "—"}
              />
              <Field
                label="Tipo sang."
                value={
                  patient?.blood_type
                    ? BLOOD_TYPE_LABELS[patient.blood_type] ?? "—"
                    : "—"
                }
                emphasis
              />
              <Field
                label="Nascimento"
                value={
                  patient?.date_of_birth
                    ? formatDatePT(patient.date_of_birth)
                    : "—"
                }
              />
              <Field
                label="BI / NIF"
                value={patient?.id_number ?? "—"}
                mono
              />
              <Field
                label="Emitido"
                value={issuedAt ? formatDatePT(issuedAt) : "Hoje"}
              />
            </div>
          </div>
        </div>

        {/* Allergies (only if any) */}
        {patient?.allergies && patient.allergies.length > 0 && (
          <div
            className="relative mt-6 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur"
            style={reveal(480)}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
              ⚠ Alergias
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {patient.allergies.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Machine-readable footer */}
        <div
          className="mt-7 border-t border-white/20 pt-4"
          style={reveal(560)}
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/65">
              {`AO<<LUNGA<<${(profile.full_name ?? "")
                .toUpperCase()
                .replace(/\s+/g, "<")}`}
              {"<<".repeat(2)}
              {id}
            </div>
            <div className="text-right">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/75">
                ID
              </div>
              <div className="font-mono text-sm font-bold tracking-wider text-white">
                LG-{id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  emphasis,
  mono,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
        {label}
      </div>
      <div
        className={
          "mt-0.5 truncate font-semibold text-white " +
          (mono ? "font-mono " : "") +
          (emphasis ? "text-base sm:text-lg" : "text-sm sm:text-base")
        }
      >
        {value}
      </div>
    </div>
  );
}
