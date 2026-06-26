import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthShell from "../AuthShell";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { title: "Escolher nova palavra-passe · Lunga" };

export default async function RedefinirPage() {
  // The /auth/callback handler should have already exchanged the recovery
  // code for a session before sending the user here. If we don't have a
  // user, the link either expired or was opened on a different device —
  // bounce them back to the forgot-password page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/esqueci-palavra-passe?expirou=1");
  }

  return (
    <AuthShell
      eyebrow="Quase lá"
      title="Escolha uma nova palavra-passe"
      subtitle={`A conta ${user.email} está a recuperar acesso — defina uma palavra-passe e está pronto.`}
      footer={
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Não foi você?{" "}
          <Link href="/entrar" className="font-medium text-primary hover:underline">
            Voltar a entrar
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
