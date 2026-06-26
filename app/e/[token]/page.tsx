import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  AlertTriangle,
  Droplet,
  Heart,
  Phone,
  ShieldAlert,
  ShieldOff,
  User as UserIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BLOOD_TYPE_LABELS } from "@/lib/labels";

export const metadata = {
  title: "Cartão de Emergência · Lunga",
  // Public emergency info — actively asking search engines NOT to index.
  robots: { index: false, follow: false },
};

type Card = {
  first_name: string | null;
  age: number | null;
  blood_type: string | null;
  gender: string | null;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  enabled: boolean;
};

const GENDER_PT: Record<string, string> = {
  female: "Feminino",
  male: "Masculino",
  other: "Outro",
};

export default async function EmergencyCardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // SECURITY DEFINER fn — runs as postgres, bypasses RLS on patients in
  // a controlled way. Returns only the subset we expose to the public,
  // and logs the scan to emergency_card_scans for the owner to review.
  const h = await headers();
  const ua = h.get("user-agent");
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("emergency_card", {
    p_token: token,
    p_user_agent: ua,
    p_ip: ip,
  });

  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    // Unknown token → real 404.
    notFound();
  }
  const c = (Array.isArray(data) ? data[0] : data) as Card;

  // The owner toggled the card off — show a tombstone instead of the
  // info. Better than 404 because the paramedic can at least see this
  // is a valid Lunga URL that was intentionally disabled.
  if (!c.enabled) {
    return (
      <main className="min-h-[100dvh] bg-slate-50">
        <div className="bg-slate-700 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white">
          <span className="inline-flex items-center gap-1.5">
            <ShieldOff className="size-3.5" />
            Cartão desativado
          </span>
        </div>
        <div className="mx-auto max-w-md px-5 py-12">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-200 text-slate-600">
              <ShieldOff className="size-7" />
            </span>
            <h1 className="mt-5 text-lg font-semibold text-foreground">
              Cartão de emergência desativado
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              O proprietário deste cartão optou por mantê-lo privado. Não
              é possível mostrar informação médica neste momento.
            </p>
            <p className="mt-6 text-[10px] text-muted-foreground">
              Lunga · Cartão de Emergência
            </p>
          </div>
        </div>
      </main>
    );
  }

  const allergies = (c.allergies ?? []).filter(
    (a) => a && a.toLowerCase() !== "no" && a.toLowerCase() !== "não"
  );
  const conditions = (c.chronic_conditions ?? []).filter(
    (a) => a && a.toLowerCase() !== "no" && a.toLowerCase() !== "não"
  );

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* Top alert strip — paramedic reads this first */}
      <div className="bg-rose-600 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm">
        <span className="inline-flex items-center gap-1.5">
          <ShieldAlert className="size-3.5" />
          Cartão de Emergência · Lunga
        </span>
      </div>

      <div className="mx-auto max-w-md px-5 py-6">
        {/* Identity block */}
        <header className="rounded-3xl border border-rose-200 bg-white p-5 shadow-md">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-rose-500/15 text-rose-700">
              <UserIcon className="size-6" />
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Identidade
              </div>
              <div className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
                {c.first_name ?? "—"}
                {c.age !== null && (
                  <span className="ml-2 text-base font-medium text-muted-foreground">
                    · {c.age} anos
                  </span>
                )}
              </div>
              {c.gender && GENDER_PT[c.gender] && (
                <div className="text-xs text-muted-foreground">
                  {GENDER_PT[c.gender]}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Blood type — big, fast read */}
        {c.blood_type && (
          <section className="mt-4 flex items-center gap-4 rounded-3xl border border-rose-200 bg-white p-5 shadow-sm">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30">
              <Droplet className="size-7" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Tipo sanguíneo
              </div>
              <div className="font-mono text-4xl font-black leading-none tracking-tight text-rose-700">
                {BLOOD_TYPE_LABELS[c.blood_type] ?? c.blood_type}
              </div>
            </div>
          </section>
        )}

        {/* Allergies — anchored visually, paramedic must not miss */}
        <Section
          title="Alergias"
          icon={AlertTriangle}
          empty="Sem alergias declaradas."
          values={allergies}
          accent="amber"
        />

        {/* Chronic conditions */}
        <Section
          title="Doenças crónicas"
          icon={Heart}
          empty="Sem doenças crónicas declaradas."
          values={conditions}
          accent="sky"
        />

        {/* Emergency contact */}
        {(c.emergency_contact_name || c.emergency_contact_phone) && (
          <section className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Contacto de emergência
            </div>
            <div className="mt-1 text-base font-bold text-foreground">
              {c.emergency_contact_name ?? "—"}
            </div>
            {c.emergency_contact_phone && (
              <a
                href={`tel:${c.emergency_contact_phone}`}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-bold text-white shadow-md shadow-emerald-600/30 transition-colors hover:bg-emerald-700"
              >
                <Phone className="size-5" />
                {c.emergency_contact_phone}
              </a>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-[10px] text-muted-foreground">
          Esta página mostra apenas a informação clinicamente relevante
          em emergência. Não inclui BI, morada, telefone do próprio ou
          histórico clínico.
        </footer>
      </div>
    </main>
  );
}

function Section({
  title,
  icon: Icon,
  empty,
  values,
  accent,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  empty: string;
  values: string[];
  accent: "amber" | "sky";
}) {
  const accentColors =
    accent === "amber"
      ? {
          ring: "border-amber-200",
          chip: "bg-amber-500/15 text-amber-800 ring-amber-300",
          iconBg: "bg-amber-500/15 text-amber-700",
          label: "text-amber-800",
        }
      : {
          ring: "border-sky-200",
          chip: "bg-sky-500/15 text-sky-800 ring-sky-300",
          iconBg: "bg-sky-500/15 text-sky-700",
          label: "text-sky-800",
        };

  return (
    <section
      className={`mt-4 rounded-3xl border ${accentColors.ring} bg-white p-5 shadow-sm`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${accentColors.iconBg}`}
        >
          <Icon className="size-4" />
        </span>
        <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accentColors.label}`}>
          {title}
        </div>
      </div>
      {values.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {values.map((v) => (
            <li
              key={v}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ${accentColors.chip}`}
            >
              {v}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );
}
