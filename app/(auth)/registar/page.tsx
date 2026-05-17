import Link from "next/link";
import AuthShell from "../AuthShell";
import SignupForm from "./SignupForm";

export const metadata = { title: "Criar conta · ANGOLASAUDE" };

export default function RegistarPage() {
  return (
    <AuthShell
      title="Criar conta"
      subtitle="Registe-se como paciente para aceder à plataforma."
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
