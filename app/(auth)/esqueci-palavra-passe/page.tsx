import Link from "next/link";
import AuthShell from "../AuthShell";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = { title: "Recuperar palavra-passe · Lunga" };

export default async function EsqueciPalavraPassePage({
  searchParams,
}: {
  searchParams: Promise<{ expirou?: string }>;
}) {
  const sp = await searchParams;
  const expirou = sp.expirou === "1";

  return (
    <AuthShell
      eyebrow="Recuperar acesso"
      title="Esqueceu-se da palavra-passe?"
      subtitle={
        expirou
          ? "O link anterior expirou. Pedimos outro abaixo — chega em segundos."
          : "Sem stress. Escreva o seu email e enviamos um link para escolher uma nova."
      }
      footer={
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Lembrou-se?{" "}
          <Link
            href="/entrar"
            className="font-medium text-primary hover:underline"
          >
            Voltar a entrar
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
