import Link from "next/link";
import { Callout, LegalLayout, Section } from "../_public/LegalLayout";
import ContactForm from "../_public/ContactForm";

export const metadata = {
  title: "Termos de Serviço",
  description:
    "Termos e condições de utilização da plataforma Lunga em Angola.",
};

const TOC = [
  { id: "aceitacao", label: "Aceitação" },
  { id: "servico", label: "O serviço" },
  { id: "natureza", label: "Natureza da plataforma" },
  { id: "conta", label: "Conta e elegibilidade" },
  { id: "uso", label: "Uso aceitável" },
  { id: "marcacoes", label: "Marcações e cancelamentos" },
  { id: "telemedicina", label: "Telemedicina e emergências" },
  { id: "receitas", label: "Receitas digitais" },
  { id: "pagamentos", label: "Pagamentos e reembolsos" },
  { id: "clinicas", label: "Clínicas e médicos" },
  { id: "dados", label: "Os seus dados" },
  { id: "pi", label: "Propriedade intelectual" },
  { id: "responsabilidade", label: "Limitação de responsabilidade" },
  { id: "indisponibilidade", label: "Indisponibilidade" },
  { id: "cessacao", label: "Cessação" },
  { id: "litigios", label: "Resolução de litígios" },
  { id: "lei", label: "Lei aplicável" },
  { id: "contacto", label: "Contacto" },
];

export default function TermosPage() {
  return (
    <LegalLayout
      title="Termos de Serviço"
      updated="22 de maio de 2026"
      toc={TOC}
      intro="Estes termos descrevem como pode usar a Lunga. Foram escritos para serem lidos por qualquer pessoa, não só por advogados — frases curtas, pouco juridiquês, sem letra miúda escondida."
    >
      <Section id="aceitacao" title="1. Aceitação destes termos">
        <p>
          Ao criar conta ou utilizar a Lunga, aceita estes Termos e a{" "}
          <Link
            href="/privacidade"
            className="font-semibold text-primary hover:underline"
          >
            Política de Privacidade
          </Link>
          . Se não concordar com qualquer parte, não utilize a plataforma.
        </p>
        <p>
          Estes termos podem ser atualizados. Alterações materiais serão
          comunicadas pelo painel ou por email com 15 dias de antecedência.
        </p>
      </Section>

      <Section id="servico" title="2. O serviço">
        <p>
          A Lunga é uma plataforma digital que permite a pacientes em Angola:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Procurar médicos e clínicas privadas.</li>
          <li>Marcar consultas presenciais ou por vídeo.</li>
          <li>Aceder a histórico clínico, receitas e exames.</li>
          <li>Receber receitas digitais com QR para a farmácia.</li>
          <li>Pagar consultas e faturas por Multicaixa Express.</li>
        </ul>
        <p>
          Pacientes têm acesso gratuito a todas estas funcionalidades. Clínicas
          pagam uma subscrição mensal pelos seus utilizadores (médicos,
          enfermeiros, recepção, administração).
        </p>
      </Section>

      <Section id="natureza" title="3. Natureza da plataforma">
        <p>
          A Lunga é uma{" "}
          <strong className="text-foreground">
            plataforma tecnológica de intermediação
          </strong>
          . Não é um prestador de cuidados de saúde, não emprega médicos, não
          dispensa medicamentos, nem substitui a relação direta entre paciente
          e profissional de saúde.
        </p>
        <p>
          Os atos clínicos — diagnóstico, prescrição, decisão sobre tratamento —
          são da exclusiva responsabilidade do médico e da clínica que o
          atendem, sujeitos às regras da{" "}
          <strong className="text-foreground">
            Ordem dos Médicos de Angola (OMA)
          </strong>{" "}
          e da legislação sanitária aplicável.
        </p>
      </Section>

      <Section id="conta" title="4. Conta e elegibilidade">
        <p>
          Para usar a Lunga deve:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Ter pelo menos 18 anos, ou ser registado por um responsável legal.</li>
          <li>Fornecer informação verdadeira e atualizada (nome, contacto, BI/NIF quando aplicável).</li>
          <li>Manter a confidencialidade da sua palavra-passe.</li>
          <li>Notificar-nos imediatamente em caso de acesso não autorizado.</li>
        </ul>
        <p>
          É responsável por toda a atividade realizada com a sua conta. Contas
          de profissionais de saúde e de clínicas estão sujeitas a verificação
          adicional (cédula profissional emitida pela OMA, inscrição da clínica,
          NIF, alvará sanitário quando aplicável).
        </p>
      </Section>

      <Section id="uso" title="5. Uso aceitável">
        <p>Ao usar a Lunga, compromete-se a não:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Fornecer informação falsa ou enganosa.</li>
          <li>Aceder ou tentar aceder a dados de terceiros sem autorização.</li>
          <li>Reutilizar receitas já dispensadas, partilhar QR de receitas com terceiros, ou falsificar documentos.</li>
          <li>Carregar conteúdo ofensivo, ilegal ou que viole direitos de outros.</li>
          <li>Usar a plataforma para fins não relacionados com cuidados de saúde.</li>
          <li>Tentar comprometer a segurança ou o funcionamento técnico do serviço (scraping, força bruta, etc.).</li>
        </ul>
        <p>
          A violação destas regras pode levar à suspensão imediata da conta,
          sem prejuízo de outras consequências legais.
        </p>
      </Section>

      <Section id="marcacoes" title="6. Marcações, cancelamentos e faltas">
        <p>
          As marcações ficam sujeitas à disponibilidade do médico escolhido. A
          confirmação aparece imediatamente no seu painel.
        </p>
        <p>
          <strong className="text-foreground">Cancelamento pelo paciente:</strong>
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-foreground">Mais de 24 h antes</strong> —
            sem custo. Pagamentos efetuados são reembolsados na totalidade.
          </li>
          <li>
            <strong className="text-foreground">Entre 24 h e 2 h antes</strong>{" "}
            — pode ser cobrada uma taxa parcial, conforme política da clínica.
          </li>
          <li>
            <strong className="text-foreground">Menos de 2 h ou falta</strong> —
            o valor da consulta pode ser cobrado integralmente.
          </li>
        </ul>
        <p>
          <strong className="text-foreground">Cancelamento pelo médico/clínica:</strong>
        </p>
        <p>
          Qualquer pagamento efetuado é reembolsado em 7 dias úteis e ser-lhe-á
          oferecida nova marcação na primeira disponibilidade.
        </p>
      </Section>

      <Section id="telemedicina" title="7. Telemedicina e emergências">
        <Callout tone="warn">
          <strong className="font-bold">A telemedicina não é para emergências.</strong>{" "}
          Em caso de paragem cardíaca, hemorragia massiva, falta de ar grave,
          desmaio, acidente — <strong>ligue 112 imediatamente</strong> ou
          dirija-se ao serviço de urgência mais próximo. A Lunga{" "}
          <strong>não</strong> substitui a urgência hospitalar.
        </Callout>
        <p>
          As consultas por vídeo destinam-se a situações em que o exame físico
          presencial não é indispensável. O médico pode, a qualquer momento,
          recomendar uma observação presencial e, nesses casos, a consulta de
          vídeo pode ser convertida sem custo.
        </p>
        <p>
          A triagem assistida por inteligência artificial é apenas um{" "}
          <strong className="text-foreground">apoio à decisão</strong>: não
          constitui diagnóstico nem prescrição. Qualquer decisão clínica é
          sempre tomada por um profissional humano.
        </p>
      </Section>

      <Section id="receitas" title="8. Receitas digitais">
        <p>
          As receitas emitidas na Lunga têm validade legal nos termos da
          legislação aplicável em Angola. Cada receita tem um{" "}
          <strong className="text-foreground">código QR único</strong> que
          permite à farmácia parceira verificar a sua autenticidade e o estado
          de dispensa.
        </p>
        <p>
          A validade temporal de cada receita está indicada no documento. Após o
          prazo de validade, a receita deixa de poder ser apresentada para
          aviamento.
        </p>
        <p>
          As receitas são pessoais e intransmissíveis. Apresentar uma receita
          em nome de terceiro, falsificá-la ou tentar dispensá-la mais do que
          o autorizado constitui violação destes termos e da lei.
        </p>
      </Section>

      <Section id="pagamentos" title="9. Pagamentos e reembolsos">
        <p>
          Os pagamentos das consultas são processados via{" "}
          <strong className="text-foreground">Multicaixa Express</strong>. A
          autorização é feita no seu telemóvel registado junto da operadora. A
          Lunga não armazena credenciais bancárias.
        </p>
        <p>
          Os preços indicados antes da marcação incluem os impostos aplicáveis.
          Após o pagamento, recebe automaticamente uma fatura/recibo no seu
          painel, descarregável em PDF e partilhável via WhatsApp.
        </p>
        <p>
          <strong className="text-foreground">Reembolsos</strong> seguem a
          política da clínica prestadora descrita na secção 6 e a legislação em
          vigor. Pedidos de reembolso são respondidos no prazo máximo de 7 dias
          úteis.
        </p>
        <p>
          Em caso de erro técnico (dupla cobrança, pagamento sem prestação do
          serviço), o reembolso é efetuado integralmente, no mesmo método de
          pagamento, no prazo máximo de 5 dias úteis.
        </p>
      </Section>

      <Section id="clinicas" title="10. Para clínicas e profissionais de saúde">
        <p>
          Clínicas e profissionais que aderem à Lunga comprometem-se a:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Manter inscrição e cédula profissional válidas (OMA, OFA quando aplicável).</li>
          <li>Cumprir as obrigações deontológicas e sanitárias angolanas.</li>
          <li>Tratar dados clínicos dos pacientes com confidencialidade absoluta.</li>
          <li>Honrar marcações confirmadas; em caso de impossibilidade, comunicar com a maior antecedência possível.</li>
          <li>Pagar pontualmente a subscrição da Lunga nos termos do contrato celebrado.</li>
        </ul>
        <p>
          A Lunga reserva-se o direito de remover do diretório clínicas ou
          profissionais que violem repetidamente estes compromissos ou as
          regras da sua Ordem profissional.
        </p>
      </Section>

      <Section id="dados" title="11. Os seus dados">
        <p>
          O tratamento dos seus dados pessoais e clínicos está descrito em
          detalhe na{" "}
          <Link
            href="/privacidade"
            className="font-semibold text-primary hover:underline"
          >
            Política de Privacidade
          </Link>
          . Em resumo: os seus dados são seus, nunca os vendemos, e estão
          isolados a nível técnico de forma a que apenas você e os profissionais
          que o atendem têm acesso.
        </p>
      </Section>

      <Section id="pi" title="12. Propriedade intelectual">
        <p>
          A marca <strong className="text-foreground">Lunga</strong>, o
          logótipo, o software, o design, a documentação e todo o conteúdo
          editorial da plataforma são propriedade da Lunga ou dos seus
          licenciadores.
        </p>
        <p>
          Os seus dados, históricos clínicos, receitas e ficheiros que carregar{" "}
          <strong className="text-foreground">continuam a ser seus</strong>. A
          Lunga apenas os processa para prestar o serviço descrito.
        </p>
      </Section>

      <Section id="responsabilidade" title="13. Limitação de responsabilidade">
        <p>
          A plataforma é fornecida &ldquo;tal como está&rdquo;. Na medida
          máxima permitida por lei:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            A Lunga{" "}
            <strong className="text-foreground">não é responsável</strong> por
            decisões clínicas dos profissionais de saúde nem pelo resultado de
            tratamentos.
          </li>
          <li>
            A Lunga{" "}
            <strong className="text-foreground">não é responsável</strong> por
            danos indiretos, perda de lucros ou perda de dados resultantes de
            uso indevido da plataforma.
          </li>
          <li>
            Em caso algum a responsabilidade total da Lunga excederá o valor
            pago pelo utilizador nos 12 meses anteriores ao incidente (zero,
            no caso de pacientes que não pagam).
          </li>
        </ul>
        <p>
          Nenhuma cláusula destes termos limita ou exclui responsabilidades que
          não possam ser limitadas ou excluídas por lei (incluindo dolo, culpa
          grave ou violação de direitos do consumidor).
        </p>
      </Section>

      <Section id="indisponibilidade" title="14. Indisponibilidade e manutenção">
        <p>
          Comprometemo-nos a manter a plataforma disponível 24/7 sempre que
          tecnicamente viável. Pode haver interrupções planeadas para
          manutenção, que tentaremos agendar fora do horário de pico.
        </p>
        <p>
          Em caso de interrupção não planeada que afete consultas marcadas,
          ofereceremos remarcação prioritária sem custos para os pacientes
          afetados.
        </p>
      </Section>

      <Section id="cessacao" title="15. Cessação">
        <p>
          Pode encerrar a sua conta a qualquer momento, escrevendo para{" "}
          <a
            href="mailto:suporte@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            suporte@lunga.ao
          </a>
          .
        </p>
        <p>
          A Lunga pode suspender ou encerrar contas que violem estes termos, a
          lei, ou que apresentem risco para outros utilizadores. Quando
          possível, será notificado com antecedência razoável.
        </p>
        <p>
          A cessação não afeta obrigações já constituídas (pagamentos
          pendentes, retenção de dados clínicos exigida por lei, etc.).
        </p>
      </Section>

      <Section id="litigios" title="16. Resolução de litígios">
        <p>
          Em caso de desacordo, comprometemo-nos a tentar resolver primeiro de
          forma amigável. Escreva-nos para{" "}
          <a
            href="mailto:suporte@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            suporte@lunga.ao
          </a>{" "}
          a expor o problema. Respondemos no prazo máximo de 15 dias úteis.
        </p>
        <p>
          Se não chegarmos a acordo, qualquer litígio será submetido à mediação
          ou aos tribunais competentes — ver secção seguinte.
        </p>
      </Section>

      <Section id="lei" title="17. Lei aplicável e foro">
        <p>
          Estes termos são regidos pela{" "}
          <strong className="text-foreground">lei da República de Angola</strong>
          . Para a resolução de qualquer litígio entre a Lunga e o utilizador
          é competente o foro de Luanda, sem prejuízo dos direitos
          imperativamente atribuídos ao consumidor pela lei.
        </p>
      </Section>

      <Section id="contacto" title="18. Contacto">
        <p>
          <strong className="text-foreground">Suporte geral</strong> —{" "}
          <a
            href="mailto:suporte@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            suporte@lunga.ao
          </a>
        </p>
        <p>
          <strong className="text-foreground">Adesão de clínica</strong> —{" "}
          <a
            href="mailto:suporte@lunga.ao?subject=Ades%C3%A3o%20de%20cl%C3%ADnica"
            className="font-semibold text-primary hover:underline"
          >
            suporte@lunga.ao
          </a>
        </p>
        <p>
          <strong className="text-foreground">Privacidade</strong> —{" "}
          <a
            href="mailto:privacidade@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            privacidade@lunga.ao
          </a>
        </p>
        <p>Sede: Luanda, República de Angola.</p>
      </Section>

      <ContactForm source="termos" />
    </LegalLayout>
  );
}
