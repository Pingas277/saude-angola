import Link from "next/link";
import { cookies } from "next/headers";
import AuthShell from "../AuthShell";
import LoginForm, { type LastUser } from "./LoginForm";

export const metadata = { title: "Entrar · Lunga" };

async function readLastUser(): Promise<LastUser | null> {
  const c = await cookies();
  const raw = c.get("lunga_last_user")?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.email === "string") {
      return {
        email: parsed.email,
        name: typeof parsed.name === "string" ? parsed.name : null,
        avatarUrl:
          typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : null,
      };
    }
  } catch {
    /* ignore malformed */
  }
  return null;
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect, error } = await searchParams;
  const redirectTo = redirect && redirect.startsWith("/") ? redirect : "/painel";
  const lastUser = await readLastUser();
  // Friendly subtitle when bounced back from /auth/callback after an
  // expired / replayed recovery link.
  const linkInvalido = error === "link_invalido";

  const firstName = lastUser?.name?.split(" ")[0] ?? null;

  return (
    <AuthShell
      eyebrow={lastUser ? "Olá, de novo" : "Bem-vindo de volta"}
      title={lastUser && firstName ? `Olá, ${firstName}` : "Entrar"}
      subtitle={
        linkInvalido
          ? "O link de recuperação expirou ou já foi usado. Tente de novo abaixo."
          : lastUser
            ? "Coloque a sua palavra-passe para continuar."
            : "Entre com o seu email e palavra-passe."
      }
      compact={!!lastUser}
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link
            href="/registar"
            className="font-medium text-primary hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={redirectTo} lastUser={lastUser} />
    </AuthShell>
  );
}
