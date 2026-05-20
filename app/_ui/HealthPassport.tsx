import Image from "next/image";
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

export default function HealthPassport({
  userId,
  profile,
  patient,
  issuedAt,
}: {
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
}) {
  const name = (profile.full_name ?? "—").toUpperCase();
  const age = ageFromDob(patient?.date_of_birth ?? null);
  const id = shortId(userId);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 text-white shadow-2xl shadow-sky-500/30">
      {/* Decorative pattern */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="passport-dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
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

      <div className="relative p-6 sm:p-8">
        {/* Top band */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/85">
              Passaporte de Saúde
            </div>
            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white/65">
              República de Angola
            </div>
          </div>
          <div className="rounded-lg bg-white/95 px-3 py-1.5 shadow-sm">
            <Image
              src="/brand/logo-full.png"
              alt="lunga"
              width={88}
              height={45}
              className="h-7 w-auto"
            />
          </div>
        </div>

        {/* Photo + identity */}
        <div className="mt-7 flex flex-wrap items-start gap-5">
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
              <Field label="BI / NIF" value={patient?.id_number ?? "—"} mono />
              <Field
                label="Emitido"
                value={issuedAt ? formatDatePT(issuedAt) : "Hoje"}
              />
            </div>
          </div>
        </div>

        {/* Allergies (only if any) */}
        {patient?.allergies && patient.allergies.length > 0 && (
          <div className="relative mt-6 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
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
        <div className="mt-7 border-t border-white/20 pt-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/65">
              {`AO<<LUNGA<<${(profile.full_name ?? "").toUpperCase().replace(/\s+/g, "<")}`}
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
