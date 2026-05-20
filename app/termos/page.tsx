import { LegalLayout, Section } from "../_public/LegalLayout";

export const metadata = {
  title: "Termos de Serviço",
  description:
    "Termos e condições de utilização da plataforma Lunga.",
};

export default function TermosPage() {
  return (
    <LegalLayout title="Termos de Serviço" updated="18 de maio de 2026">
      <Section title="1. Aceitação">
        <p>
          Ao criar uma conta ou utilizar a Lunga, aceita estes Termos de
          Serviço e a Política de Privacidade. Se não concordar, não utilize a
          plataforma.
        </p>
      </Section>

      <Section title="2. O serviço">
        <p>
          A Lunga é uma plataforma que permite procurar profissionais de
          saúde, marcar consultas presenciais ou por vídeo, receber receitas
          digitais, efetuar pagamentos e gerir informação clínica. As clínicas e
          os médicos são responsáveis pelos atos clínicos que praticam; a
          Lunga fornece a tecnologia que liga as partes.
        </p>
      </Section>

      <Section title="3. Conta e elegibilidade">
        <p>
          Deve fornecer informação verdadeira e manter a confidencialidade das
          suas credenciais. É responsável pela atividade realizada na sua conta.
          Contas de profissionais e de clínicas podem exigir verificação
          adicional.
        </p>
      </Section>

      <Section title="4. Uso aceitável">
        <p>
          Não pode utilizar a plataforma para fins ilícitos, fornecer
          informação falsa, tentar aceder a dados de terceiros, ou comprometer a
          segurança ou o funcionamento do serviço.
        </p>
      </Section>

      <Section title="5. Telemedicina e emergências">
        <p>
          A telemedicina não substitui atendimento de urgência. Em caso de
          emergência médica, ligue de imediato para o{" "}
          <strong className="text-foreground">112</strong> ou dirija-se ao
          serviço de urgência mais próximo. A triagem assistida é um apoio à
          decisão e não constitui, por si só, um diagnóstico.
        </p>
      </Section>

      <Section title="6. Pagamentos">
        <p>
          Os pagamentos são processados via Multicaixa Express. As consultas e
          serviços têm os preços indicados no momento da marcação. Reembolsos,
          quando aplicáveis, seguem a política da clínica prestadora e a
          legislação em vigor.
        </p>
      </Section>

      <Section title="7. Propriedade intelectual">
        <p>
          A marca Lunga, o software e o conteúdo da plataforma são
          propriedade da Lunga ou dos seus licenciadores. Os seus dados
          clínicos continuam a ser seus.
        </p>
      </Section>

      <Section title="8. Limitação de responsabilidade">
        <p>
          A plataforma é fornecida &quot;tal como está&quot;. Na medida
          permitida por lei, a Lunga não é responsável por decisões
          clínicas dos profissionais nem por danos indiretos resultantes do uso
          do serviço. Esforçamo-nos por garantir disponibilidade, mas não
          garantimos funcionamento ininterrupto.
        </p>
      </Section>

      <Section title="9. Cessação">
        <p>
          Pode encerrar a sua conta a qualquer momento. Podemos suspender ou
          encerrar contas que violem estes termos ou a lei.
        </p>
      </Section>

      <Section title="10. Lei aplicável">
        <p>
          Estes termos são regidos pela lei da República de Angola. Eventuais
          litígios serão submetidos aos tribunais competentes de Angola.
        </p>
      </Section>

      <Section title="11. Contacto">
        <p>
          Questões sobre estes termos:{" "}
          <a
            href="mailto:suporte@saudeangola.ao"
            className="font-medium text-primary hover:underline"
          >
            suporte@saudeangola.ao
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  );
}
