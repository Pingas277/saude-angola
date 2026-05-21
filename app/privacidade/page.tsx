import { LegalLayout, Section } from "../_public/LegalLayout";

export const metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Lunga recolhe, utiliza e protege os seus dados pessoais e clínicos.",
};

export default function PrivacidadePage() {
  return (
    <LegalLayout title="Política de Privacidade" updated="18 de maio de 2026">
      <Section title="1. Quem somos">
        <p>
          A Lunga é uma plataforma digital de saúde que liga pacientes,
          médicos e clínicas privadas em Angola. Esta política explica que
          dados recolhemos, porquê, e quais são os seus direitos. O responsável
          pelo tratamento de dados pode ser contactado em{" "}
          <a
            href="mailto:privacidade@lunga.ao"
            className="font-medium text-primary hover:underline"
          >
            privacidade@lunga.ao
          </a>
          .
        </p>
      </Section>

      <Section title="2. Dados que recolhemos">
        <p>
          <strong className="text-foreground">Dados de conta:</strong> nome,
          email, telemóvel e palavra-passe (cifrada).
        </p>
        <p>
          <strong className="text-foreground">Dados clínicos:</strong>{" "}
          marcações, consultas, diagnósticos, receitas, exames, sinais vitais e
          informação de triagem que você ou um profissional de saúde introduz.
        </p>
        <p>
          <strong className="text-foreground">Dados de pagamento:</strong>{" "}
          referências e estado de pagamentos via Multicaixa Express. Não
          armazenamos credenciais bancárias.
        </p>
        <p>
          <strong className="text-foreground">Dados técnicos:</strong> dados
          mínimos de utilização e segurança necessários ao funcionamento do
          serviço.
        </p>
      </Section>

      <Section title="3. Como utilizamos os seus dados">
        <p>
          Utilizamos os dados para fornecer o serviço: permitir marcações e
          consultas, gerar receitas e faturas, processar pagamentos, manter o
          seu histórico clínico acessível a si e aos profissionais que o
          atendem, e garantir a segurança da plataforma. Não vendemos os seus
          dados nem os usamos para publicidade de terceiros.
        </p>
      </Section>

      <Section title="4. Base legal (RGPD)">
        <p>
          O tratamento assenta na execução do contrato de prestação do serviço,
          no seu consentimento (quando aplicável), no cumprimento de obrigações
          legais e no interesse legítimo em manter a plataforma segura. Os dados
          clínicos são tratados como categoria especial e sujeitos a proteção
          reforçada.
        </p>
      </Section>

      <Section title="5. Quem acede aos seus dados">
        <p>
          O acesso é restrito ao próprio titular e aos profissionais de saúde
          envolvidos no seu atendimento. Tecnicamente, isto é imposto ao nível
          da base de dados (Row-Level Security): cada utilizador só consegue ler
          os registos a que tem direito. Subcontratantes (alojamento,
          processamento de pagamentos) atuam sob contrato e apenas no necessário
          para prestar o serviço.
        </p>
      </Section>

      <Section title="6. Segurança">
        <p>
          As palavras-passe são cifradas, o acesso é autenticado e as
          comunicações são feitas por canais seguros. Aplicamos o princípio do
          menor privilégio e isolamento de dados por utilizador. Nenhum sistema
          é 100% infalível, mas comprometemo-nos a notificar incidentes
          relevantes nos termos da lei.
        </p>
      </Section>

      <Section title="7. Retenção">
        <p>
          Mantemos os dados enquanto a sua conta estiver ativa e pelo período
          exigido por obrigações legais aplicáveis a registos clínicos e
          financeiros. Pode pedir a eliminação da conta — alguns registos podem
          ter de ser conservados quando a lei o exigir.
        </p>
      </Section>

      <Section title="8. Os seus direitos">
        <p>
          Tem direito a aceder, retificar, eliminar, limitar ou opor-se ao
          tratamento dos seus dados, bem como à portabilidade. Para exercer
          estes direitos, contacte{" "}
          <a
            href="mailto:privacidade@lunga.ao"
            className="font-medium text-primary hover:underline"
          >
            privacidade@lunga.ao
          </a>
          .
        </p>
      </Section>

      <Section title="9. Cookies">
        <p>
          Utilizamos apenas os cookies estritamente necessários para autenticação
          e funcionamento do serviço. Não usamos cookies de publicidade.
        </p>
      </Section>

      <Section title="10. Alterações">
        <p>
          Esta política pode ser atualizada. Alterações materiais serão
          comunicadas através da plataforma ou por email.
        </p>
      </Section>
    </LegalLayout>
  );
}
