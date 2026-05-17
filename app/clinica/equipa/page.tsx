import { redirect } from "next/navigation";
import {
  Users,
  Stethoscope,
  Activity,
  UserCog,
  Building2,
  UserPlus,
  Mail,
  Phone,
  BadgeCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/labels";
import StatCard from "../../_ui/StatCard";
import AdminHeader from "../_components/AdminHeader";
import AddStaffForm from "./AddStaffForm";
import StaffRowActions from "./StaffRowActions";

export const metadata = { title: "Equipa · ANGOLASAUDE" };

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-foreground/10 text-foreground",
  doctor: "bg-primary/10 text-primary",
  nurse: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  receptionist: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
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

export default async function EquipaPage() {
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
      "id, full_name, email, phone, role, specialty, medical_license, created_at"
    )
    .eq("clinic_id", admin.clinic_id)
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  const staff = (staffRaw ?? []).filter((s) => s.role !== "patient");
  const byRole = (r: string) => staff.filter((s) => s.role === r).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <AdminHeader
        eyebrow="Gestão"
        title="Equipa da clínica"
        subtitle={`${staff.length} membro${staff.length === 1 ? "" : "s"} ativo${staff.length === 1 ? "" : "s"} na sua clínica.`}
        icon={<Users className="size-5" />}
      />

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard tone="emerald" icon={<Stethoscope className="size-5" />} label="Médicos" value={byRole("doctor")} />
        <StatCard tone="sky" icon={<Activity className="size-5" />} label="Enfermeiros" value={byRole("nurse")} />
        <StatCard tone="amber" icon={<UserCog className="size-5" />} label="Recepção" value={byRole("receptionist")} />
        <StatCard tone="slate" icon={<Building2 className="size-5" />} label="Administradores" value={byRole("admin")} />
      </section>

      {/* Add member */}
      <section className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <UserPlus className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Adicionar membro
          </h2>
        </div>
        <div className="p-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Pesquise por email. O utilizador (que já deve ter conta) é promovido
            à função selecionada nesta clínica.
          </p>
          <AddStaffForm />
        </div>
      </section>

      {/* Members */}
      <section className="mt-6 rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Membros</h2>
        </div>
        {staff.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Ainda sem membros na equipa.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {staff.map((s) => {
              const name = s.full_name ?? s.email ?? "—";
              const Icon = ROLE_ICON[s.role] ?? Users;
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {name}
                      </span>
                      {s.id === user.id && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          você
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
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
                        <span>{s.specialty}</span>
                      )}
                      {s.medical_license && (
                        <span className="inline-flex items-center gap-1">
                          <BadgeCheck className="size-3" />
                          {s.medical_license}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      ROLE_BADGE[s.role] ?? "bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="size-3" />
                    {ROLE_LABELS[s.role] ?? s.role}
                  </span>
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
