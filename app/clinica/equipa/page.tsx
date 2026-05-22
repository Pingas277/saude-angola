import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  Mail,
  Phone,
  Search,
  Stethoscope,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/labels";
import AdminHeader from "../_components/AdminHeader";
import AddStaffForm from "./AddStaffForm";
import StaffRowActions from "./StaffRowActions";

export const metadata = { title: "Equipa · Lunga" };

const ROLE_TILE: Record<string, string> = {
  doctor: "from-sky-500 to-blue-600",
  nurse: "from-emerald-500 to-teal-600",
  receptionist: "from-amber-500 to-orange-600",
  admin: "from-indigo-500 to-purple-600",
};

const ROLE_PILL: Record<string, string> = {
  doctor: "bg-sky-50 text-sky-700 ring-sky-200",
  nurse: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  receptionist: "bg-amber-50 text-amber-700 ring-amber-200",
  admin: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

const ROLE_ICON: Record<string, typeof Users> = {
  admin: Building2,
  doctor: Stethoscope,
  nurse: Activity,
  receptionist: UserCog,
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "—";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default async function EquipaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: admin } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (admin?.role !== "admin" || !admin.clinic_id) redirect("/clinica");

  const { data: staffRaw } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, role, specialty, medical_license, avatar_url, created_at"
    )
    .eq("clinic_id", admin.clinic_id)
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  let staff = (staffRaw ?? []).filter((s) => s.role !== "patient");

  if (query) {
    const qLower = query.toLowerCase();
    staff = staff.filter(
      (s) =>
        (s.full_name ?? "").toLowerCase().includes(qLower) ||
        (s.email ?? "").toLowerCase().includes(qLower) ||
        (s.specialty ?? "").toLowerCase().includes(qLower)
    );
  }

  const byRole = (r: string) => staff.filter((s) => s.role === r).length;

  // Per-doctor appointment counts (total + this month) for the clinic.
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: clinicAppts } = await supabase
    .from("appointments")
    .select("doctor_id, scheduled_at, status")
    .eq("clinic_id", admin.clinic_id);

  const apptStats = new Map<string, { total: number; month: number }>();
  for (const a of (clinicAppts as
    | { doctor_id: string; scheduled_at: string; status: string }[]
    | null) ?? []) {
    if (!a.doctor_id) continue;
    const s = apptStats.get(a.doctor_id) ?? { total: 0, month: 0 };
    s.total += 1;
    if (new Date(a.scheduled_at) >= monthStart) s.month += 1;
    apptStats.set(a.doctor_id, s);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <AdminHeader
        eyebrow="Gestão"
        title="Equipa da clínica"
        subtitle={`${staff.length} membro${staff.length === 1 ? "" : "s"} ativo${staff.length === 1 ? "" : "s"}.`}
        icon={<Users className="size-5" />}
      />

      {/* ─── Role stats ─── */}
      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <RoleTile
          icon={Stethoscope}
          label="Médicos"
          value={byRole("doctor")}
          color="from-sky-500 to-blue-600"
        />
        <RoleTile
          icon={Activity}
          label="Enfermeiros"
          value={byRole("nurse")}
          color="from-emerald-500 to-teal-600"
        />
        <RoleTile
          icon={UserCog}
          label="Recepção"
          value={byRole("receptionist")}
          color="from-amber-500 to-orange-600"
        />
        <RoleTile
          icon={Building2}
          label="Administração"
          value={byRole("admin")}
          color="from-indigo-500 to-purple-600"
        />
      </section>

      {/* ─── Add member ─── */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-5 py-3">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm">
            <UserPlus className="size-3.5" />
          </span>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Adicionar membro
          </h2>
        </div>
        <div className="p-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Procure por email. O utilizador (que já deve ter conta) é promovido
            à função selecionada nesta clínica.
          </p>
          <AddStaffForm />
        </div>
      </section>

      {/* ─── Search ─── */}
      <section className="mt-5 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <form
          method="GET"
          action="/clinica/equipa"
          className="flex items-center gap-2"
        >
          <div className="flex flex-1 items-center gap-2.5 rounded-full border border-border bg-muted/40 px-4 py-2 transition-colors focus-within:border-primary focus-within:bg-card">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Procurar por nome, email ou especialidade…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:shadow-md"
          >
            Procurar
          </button>
          {query && (
            <Link
              href="/clinica/equipa"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Link>
          )}
        </form>
      </section>

      {/* ─── Members list ─── */}
      <section className="mt-5">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <Users className="size-3.5" />
          Membros
        </h2>

        {staff.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            {query
              ? `Nenhum membro corresponde a "${query}".`
              : "Ainda sem membros na equipa."}
          </div>
        ) : (
          <ul className="space-y-2.5">
            {staff.map((s) => {
              const name = s.full_name ?? s.email ?? "—";
              const Icon = ROLE_ICON[s.role] ?? Users;
              const ringColor = ROLE_TILE[s.role] ?? "from-slate-500 to-slate-700";
              const isDoctor = s.role === "doctor";
              const stats = apptStats.get(s.id);
              return (
                <li
                  key={s.id}
                  className="group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  {/* Role-coloured avatar ring */}
                  <div
                    className={`shrink-0 rounded-xl bg-gradient-to-br ${ringColor} p-0.5 shadow-sm`}
                  >
                    <div className="grid size-12 place-items-center overflow-hidden rounded-[10px] bg-card text-sm font-bold text-foreground">
                      {s.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.avatar_url}
                          alt={name}
                          className="size-full object-cover"
                        />
                      ) : (
                        initials(name)
                      )}
                    </div>
                  </div>

                  {/* Identity + meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold tracking-tight text-foreground">
                        {name}
                      </span>
                      {s.id === user.id && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          você
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {s.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3" />
                          {s.email}
                        </span>
                      )}
                      {s.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3" />
                          {s.phone}
                        </span>
                      )}
                      {s.specialty && (
                        <span className="inline-flex items-center gap-1">
                          <Stethoscope className="size-3 text-primary" />
                          {s.specialty}
                        </span>
                      )}
                      {s.medical_license && (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <BadgeCheck className="size-3 text-emerald-600" />
                          {s.medical_license}
                        </span>
                      )}
                    </div>

                    {/* Doctor activity chips */}
                    {isDoctor && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 ring-1 ring-sky-200">
                          <CalendarClock className="size-2.5" />
                          {stats?.total ?? 0} consultas
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                          {stats?.month ?? 0} este mês
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Role pill */}
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${ROLE_PILL[s.role] ?? "bg-slate-50 text-slate-700 ring-slate-200"}`}
                  >
                    <Icon className="size-3" />
                    {ROLE_LABELS[s.role] ?? s.role}
                  </span>

                  {/* Doctor activity link */}
                  {isDoctor && (
                    <Link
                      href={`/clinica/equipa/${s.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition-all hover:shadow-lg"
                    >
                      Ver atividade
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}

                  {/* Actions */}
                  {s.id !== user.id && (
                    <StaffRowActions targetId={s.id} currentRole={s.role} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function RoleTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span
        className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-4" />
      </span>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
