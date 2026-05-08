import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../(auth)/actions";
import ClinicaNav from "./ClinicaNav";

export default async function ClinicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, clinic:clinics(name, subscription_plan)")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/painel");

  const clinic = Array.isArray(profile?.clinic) ? profile?.clinic[0] : profile?.clinic;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/clinica" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-900 text-sm font-bold text-white">
              S
            </span>
            <div className="leading-tight">
              <div className="font-semibold text-slate-900">Saúde Angola</div>
              <div className="text-[11px] uppercase tracking-wide text-slate-600">
                Administração da Clínica
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-right text-sm sm:block">
              <div className="font-medium text-slate-900">
                {profile?.full_name ?? user.email}
              </div>
              {clinic?.name && (
                <div className="text-xs text-slate-500">
                  {clinic.name}
                  {clinic.subscription_plan
                    ? ` · plano ${clinic.subscription_plan}`
                    : ""}
                </div>
              )}
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Terminar sessão
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6">
          <ClinicaNav />
        </div>
      </header>
      {children}
    </div>
  );
}
