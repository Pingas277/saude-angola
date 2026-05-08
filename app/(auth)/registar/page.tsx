import Link from "next/link";
import AuthShell from "../AuthShell";
import SignupForm from "./SignupForm";

export const metadata = { title: "Criar conta · Saúde Angola" };

export default function RegistarPage() {
  return (
    <AuthShell
      title="Criar conta"
      subtitle="Registe-se como paciente para aceder à plataforma."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/entrar" className="font-semibold text-emerald-700 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
