import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../(auth)/actions";
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/painel" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-600 text-sm font-bold text-white">
              S
            </span>
            <span className="font-semibold text-slate-900">Saúde Angola</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/perfil"
              className="hidden text-sm text-slate-600 hover:text-slate-900 sm:inline"
            >
              {profile?.full_name ?? user.email}
            </Link>
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
          <PainelNav />
        </div>
      </header>
      {children}
    </div>
  );
}
