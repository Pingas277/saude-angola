import Link from "next/link";
import AuthShell from "../AuthShell";
import SignupForm from "./SignupForm";

export const metadata = { title: "Criar conta · Lunga" };

export default function RegistarPage() {
  return (
    <AuthShell
      eyebrow="Comece grátis"
      title="Criar conta"
      subtitle="Grátis para pacientes — demora menos de um minuto."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/entrar" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
