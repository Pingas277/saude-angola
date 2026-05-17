import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/labels";
import AddStaffForm from "./AddStaffForm";
import StaffRowActions from "./StaffRowActions";

export const metadata = { title: "Equipa · ANGOLASAUDE" };

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-foreground text-white",
  doctor: "bg-primary/10 text-primary",
  nurse: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  receptionist: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  patient: "bg-muted text-foreground",
};

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
    .select("id, full_name, email, phone, role, specialty, medical_license, created_at")
    .eq("clinic_id", admin.clinic_id)
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  const staff = (staffRaw ?? []).filter((s) => s.role !== "patient");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Equipa da clínica
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {staff.length} membro{staff.length === 1 ? "" : "s"} ativo{staff.length === 1 ? "" : "s"}.
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Adicionar membro
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pesquise por email. O utilizador é promovido à função selecionada na
          sua clínica.
        </p>
        <div className="mt-4">
          <AddStaffForm />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Membros
        </h2>
        {staff.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Sem membros na equipa.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {staff.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">
                    {s.full_name ?? s.email ?? "—"}
                    {s.id === user.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {s.email}
                    {s.specialty ? ` · ${s.specialty}` : ""}
                    {s.medical_license ? ` · ${s.medical_license}` : ""}
                    {s.phone ? ` · ${s.phone}` : ""}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    ROLE_BADGE[s.role] ?? "bg-muted text-foreground"
                  }`}
                >
                  {ROLE_LABELS[s.role] ?? s.role}
                </span>
                {s.id !== user.id && (
                  <StaffRowActions targetId={s.id} currentRole={s.role} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
