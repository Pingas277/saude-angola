import Link from "next/link";
import AuthShell from "../AuthShell";
import LoginForm from "./LoginForm";

export const metadata = { title: "Entrar · Lunga" };

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = redirect && redirect.startsWith("/") ? redirect : "/painel";

  return (
    <AuthShell
      eyebrow="Bem-vindo de volta"
      title="Entrar"
      subtitle="Aceda à sua conta para continuar o seu acompanhamento."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/registar" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
