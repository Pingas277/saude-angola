import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../(auth)/actions";
import Logo from "../_brand/Logo";
import PainelNav from "./PainelNav";

export default async function PainelLayout({
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
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const firstName = profile?.full_name?.split(" ")[0] ?? user.email;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo href="/painel" size="md" subtitle="Paciente" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <div className="font-medium text-slate-900">{firstName}</div>
              <div className="text-xs text-slate-500">Bem-vindo</div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6">
          <PainelNav />
        </div>
      </header>
      {children}
    </div>
  );
}
