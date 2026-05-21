import Link from "next/link";
import {
  Callout,
  DataTable,
  LegalLayout,
  Section,
} from "../_public/LegalLayout";

export const metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Lunga recolhe, utiliza e protege os seus dados pessoais e clínicos. Conforme a Lei n.º 22/11 de Angola.",
};

const TOC = [
  { id: "quem-somos", label: "Quem somos" },
  { id: "dados", label: "Que dados recolhemos" },
  { id: "finalidades", label: "Para que servem" },
  { id: "base-legal", label: "Base legal" },
  { id: "quem-acede", label: "Quem tem acesso" },
  { id: "transferencias", label: "Transferências internacionais" },
  { id: "seguranca", label: "Segurança" },
  { id: "retencao", label: "Retenção" },
  { id: "menores", label: "Crianças e menores" },
  { id: "direitos", label: "Os seus direitos" },
  { id: "cookies", label: "Cookies" },
  { id: "reclamacoes", label: "Reclamações" },
  { id: "alteracoes", label: "Alterações" },
  { id: "contacto", label: "Contacto" },
];

export default function PrivacidadePage() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      updated="22 de maio de 2026"
      toc={TOC}
      intro="A sua saúde é íntima. Os seus dados também. Esta página explica, em palavras simples, que dados a Lunga recolhe, para que servem, com quem são partilhados e quais os seus direitos."
    >
      <Section id="quem-somos" title="1. Quem somos">
        <p>
          A <strong className="text-foreground">Lunga</strong> é uma plataforma
          digital de saúde que liga pacientes, médicos e clínicas privadas em
          Angola. Esta plataforma é operada com sede em Angola.
        </p>
        <p>
          A Lunga é o{" "}
          <strong className="text-foreground">responsável pelo tratamento</strong>{" "}
          dos seus dados de conta. As clínicas e os médicos que o atendem são{" "}
          <strong className="text-foreground">co-responsáveis</strong> pelo
          tratamento dos dados clínicos gerados no decorrer de cada consulta.
        </p>
        <p>
          Para qualquer assunto relacionado com privacidade, contacte{" "}
          <a
            href="mailto:privacidade@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            privacidade@lunga.ao
          </a>
          .
        </p>
      </Section>

      <Section id="dados" title="2. Que dados recolhemos">
        <p>
          Só recolhemos o que é necessário para a Lunga funcionar. Cada
          categoria está listada em baixo, com a sua finalidade e o tempo que
          ficamos com ela.
        </p>

        <DataTable
          headers={["Categoria", "Exemplos", "Para quê", "Quanto tempo"]}
          rows={[
            [
              "Dados de conta",
              "Nome completo, email, telemóvel, palavra-passe (cifrada)",
              "Identificar o utilizador, comunicar consigo",
              "Enquanto a conta estiver ativa",
            ],
            [
              "Dados de identificação",
              "BI ou NIF, data de nascimento, género",
              "Identificar o paciente nas consultas; obrigações fiscais",
              "Conta ativa + obrigações legais",
            ],
            [
              "Dados clínicos",
              "Histórico, alergias, doenças crónicas, tipo sanguíneo, sinais vitais, diagnósticos, notas SOAP, receitas, exames",
              "Prestação de cuidados pelos médicos da clínica",
              "Mínimo de 5 anos após o último contacto, ou mais se a lei exigir",
            ],
            [
              "Dados de marcação",
              "Datas, horários, médico escolhido, motivo da consulta",
              "Marcar, lembrar e registar consultas",
              "Conta ativa + 5 anos",
            ],
            [
              "Dados de pagamento",
              "Referências Multicaixa Express, estado da fatura, valor, NIF",
              "Processar pagamentos e emitir faturas/recibos",
              "10 anos (obrigação fiscal em Angola)",
            ],
            [
              "Dados técnicos",
              "Endereço IP, modelo de dispositivo, log de acesso, cookies de sessão",
              "Segurança, deteção de fraude, suporte técnico",
              "12 meses",
            ],
          ]}
        />

        <Callout tone="info">
          <strong className="font-bold">Não recolhemos</strong> dados de
          geolocalização contínua, dados de redes sociais, dados de outros
          serviços que use no telemóvel, nem nada que não esteja na tabela
          acima.
        </Callout>
      </Section>

      <Section id="finalidades" title="3. Para que servem">
        <p>
          Usamos os seus dados exclusivamente para:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Permitir que marque consultas e seja atendido (presencial ou vídeo).</li>
          <li>Manter o seu histórico clínico acessível a si e aos profissionais que o atendem.</li>
          <li>Emitir receitas digitais válidas, com QR único para a farmácia.</li>
          <li>Processar pagamentos por Multicaixa Express e emitir faturas/recibos.</li>
          <li>Enviar-lhe avisos sobre as suas consultas, receitas, faturas.</li>
          <li>Garantir a segurança, fiabilidade e melhoria contínua da plataforma.</li>
          <li>Cumprir obrigações legais (fiscais, sanitárias, de proteção de dados).</li>
        </ul>
        <p className="font-semibold text-foreground">
          Não vendemos os seus dados. Não os usamos para publicidade de
          terceiros. Nunca os enviámos para fora dos casos descritos nesta
          política.
        </p>
      </Section>

      <Section id="base-legal" title="4. Base legal do tratamento">
        <p>
          O tratamento dos seus dados pessoais é feito ao abrigo da{" "}
          <strong className="text-foreground">
            Lei n.º 22/11, de 17 de junho — Lei da Proteção de Dados Pessoais da
            República de Angola
          </strong>
          , e dos princípios equivalentes do Regulamento Geral sobre a Proteção
          de Dados (RGPD da União Europeia), uma vez que parte da nossa
          infraestrutura está alojada na União Europeia.
        </p>
        <p>
          As bases legais aplicáveis são:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-foreground">Execução de contrato</strong> —
            para prestar o serviço que solicitou.
          </li>
          <li>
            <strong className="text-foreground">Consentimento expresso</strong>{" "}
            — para o tratamento de dados clínicos (categoria especial).
          </li>
          <li>
            <strong className="text-foreground">Obrigação legal</strong> —
            para faturação, retenção fiscal e registos clínicos exigidos por lei.
          </li>
          <li>
            <strong className="text-foreground">Interesse legítimo</strong> —
            para segurança, prevenção de fraude e administração técnica.
          </li>
        </ul>
      </Section>

      <Section id="quem-acede" title="5. Quem tem acesso aos seus dados">
        <p>
          O acesso é estritamente controlado e segregado por papel:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-foreground">Você</strong> — vê tudo o que é
            seu.
          </li>
          <li>
            <strong className="text-foreground">O médico que o atende</strong>{" "}
            — vê o que precisa para a consulta (histórico, alergias, receitas
            anteriores).
          </li>
          <li>
            <strong className="text-foreground">A clínica</strong> — vê
            marcações e faturas emitidas pelos seus médicos.
          </li>
          <li>
            <strong className="text-foreground">A farmácia parceira</strong>{" "}
            — vê apenas a receita que você apresentou (via QR), no momento de a
            dispensar.
          </li>
          <li>
            <strong className="text-foreground">Equipa técnica da Lunga</strong>{" "}
            — apenas quando estritamente necessário para resolver um problema, e
            sob obrigação de confidencialidade.
          </li>
        </ul>
        <p>
          Esta separação é imposta tecnicamente ao nível da base de dados, com{" "}
          <strong className="text-foreground">Row-Level Security</strong>:
          cada utilizador autenticado só consegue ler as linhas a que tem
          direito.
        </p>

        <p className="mt-3 font-semibold text-foreground">Subcontratantes</p>
        <p>
          Para operar a plataforma, recorremos a:
        </p>
        <DataTable
          headers={["Serviço", "Para quê", "Localização"]}
          rows={[
            ["Supabase", "Base de dados, autenticação, armazenamento de ficheiros", "União Europeia (Frankfurt, Alemanha)"],
            ["Vercel", "Alojamento da aplicação", "União Europeia"],
            ["Multicaixa Express (EMIS)", "Processamento de pagamentos", "Angola"],
            ["Anthropic", "Triagem assistida por IA (texto descritivo apenas, sem identificação direta)", "Estados Unidos"],
          ]}
        />
      </Section>

      <Section id="transferencias" title="6. Transferências internacionais">
        <p>
          Por razões técnicas, parte dos seus dados é armazenada em servidores
          na União Europeia. Esta região oferece um nível de proteção
          equivalente ou superior ao exigido pela Lei n.º 22/11.
        </p>
        <p>
          Quando a triagem por inteligência artificial é usada, o texto que
          descreve os sintomas é enviado ao prestador (Anthropic) nos Estados
          Unidos, sem que seja acompanhado de dados que o identifiquem
          diretamente. Os contratos com este prestador proíbem a utilização dos
          dados para fins de treino de modelo.
        </p>
        <p>
          Pode opor-se ao uso da triagem por IA a qualquer momento — a
          plataforma funciona em modo manual sem este componente.
        </p>
      </Section>

      <Section id="seguranca" title="7. Como protegemos os seus dados">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Comunicações cifradas em trânsito (TLS 1.3).</li>
          <li>Dados cifrados em repouso na base de dados.</li>
          <li>Palavras-passe nunca armazenadas em texto claro (bcrypt).</li>
          <li>Autenticação por sessão; nenhum tipo de revenda de credenciais.</li>
          <li>Isolamento por <em>Row-Level Security</em> ao nível PostgreSQL.</li>
          <li>Registo de auditoria de acessos a dados clínicos sensíveis.</li>
          <li>Princípio do menor privilégio para a equipa interna.</li>
        </ul>
        <p>
          Nenhum sistema é 100% infalível. Em caso de incidente de segurança que
          envolva os seus dados, comprometemo-nos a notificá-lo sem demora
          injustificada, e a comunicar o ocorrido à autoridade competente nos
          termos da lei.
        </p>
      </Section>

      <Section id="retencao" title="8. Quanto tempo guardamos">
        <p>
          Os períodos por categoria estão na tabela da{" "}
          <a href="#dados" className="font-semibold text-primary hover:underline">
            secção 2
          </a>
          . De forma geral:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-foreground">Dados clínicos</strong> —
            mantidos pelo menos 5 anos após o último contacto, conforme as
            regras profissionais e a lei aplicável.
          </li>
          <li>
            <strong className="text-foreground">Faturação e fiscal</strong> —
            10 anos (obrigação tributária angolana).
          </li>
          <li>
            <strong className="text-foreground">Conta do utilizador</strong> —
            enquanto estiver ativa. Quando pedir a eliminação, anonimizamos ou
            apagamos os dados, exceto os que a lei nos obriga a conservar.
          </li>
          <li>
            <strong className="text-foreground">Logs técnicos</strong> — 12
            meses.
          </li>
        </ul>
      </Section>

      <Section id="menores" title="9. Crianças e menores">
        <p>
          Pacientes com idade inferior a 18 anos só podem ser registados pelo
          pai, mãe ou responsável legal, que será o titular da conta e o ponto
          de contacto único da Lunga.
        </p>
        <p>
          O responsável legal pode autorizar profissionais de saúde a aceder ao
          histórico do menor durante uma consulta. Aos 18 anos, o titular passa
          a ser o próprio paciente e o responsável legal perde acesso, salvo
          consentimento expresso do paciente.
        </p>
      </Section>

      <Section id="direitos" title="10. Os seus direitos">
        <p>Ao abrigo da Lei n.º 22/11 e dos princípios do RGPD, tem direito a:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-foreground">Aceder</strong> aos seus dados
            (a maior parte está visível no seu painel).
          </li>
          <li>
            <strong className="text-foreground">Retificar</strong> dados
            incorretos ou desatualizados.
          </li>
          <li>
            <strong className="text-foreground">Eliminar</strong> dados quando
            já não forem necessários para a finalidade.
          </li>
          <li>
            <strong className="text-foreground">Limitar</strong> ou{" "}
            <strong className="text-foreground">opor-se</strong> a
            determinados tratamentos.
          </li>
          <li>
            <strong className="text-foreground">Portar</strong> os seus dados —
            recebê-los num formato estruturado e levá-los para outro prestador.
          </li>
          <li>
            <strong className="text-foreground">Retirar consentimento</strong>{" "}
            a qualquer momento, sem afetar a licitude do tratamento anterior.
          </li>
          <li>
            <strong className="text-foreground">Não ser sujeito</strong> a
            decisões automatizadas com efeitos legais — a triagem por IA é
            apenas um apoio, e qualquer decisão clínica é sempre humana.
          </li>
        </ul>
        <p>
          Para exercer qualquer destes direitos, escreva-nos para{" "}
          <a
            href="mailto:privacidade@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            privacidade@lunga.ao
          </a>
          . Respondemos no prazo máximo de 30 dias.
        </p>
      </Section>

      <Section id="cookies" title="11. Cookies e tecnologias semelhantes">
        <p>
          Utilizamos apenas cookies estritamente necessários para o
          funcionamento da plataforma:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-foreground">Sessão</strong> — para
            mantê-lo autenticado enquanto navega.
          </li>
          <li>
            <strong className="text-foreground">Preferências</strong> — última
            conta usada em{" "}
            <Link
              href="/entrar"
              className="font-semibold text-primary hover:underline"
            >
              /entrar
            </Link>{" "}
            (para o saudarmos pelo nome).
          </li>
          <li>
            <strong className="text-foreground">Avisos pós-ação</strong> —
            cookies temporários (60 s) para mostrar notificações como
            &ldquo;Consulta marcada!&rdquo; após uma ação.
          </li>
        </ul>
        <p>
          Não usamos cookies de marketing, de redes sociais nem de
          terceiros para publicidade.
        </p>
      </Section>

      <Section id="reclamacoes" title="12. Reclamações">
        <p>
          Se considerar que os seus dados não estão a ser tratados corretamente,
          o primeiro passo é falar connosco em{" "}
          <a
            href="mailto:privacidade@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            privacidade@lunga.ao
          </a>
          . Temos 30 dias para responder.
        </p>
        <p>
          Se não ficar satisfeito, tem o direito de apresentar reclamação à{" "}
          <strong className="text-foreground">
            Agência de Proteção de Dados de Angola (APD)
          </strong>{" "}
          ou à autoridade competente equivalente.
        </p>
      </Section>

      <Section id="alteracoes" title="13. Alterações a esta política">
        <p>
          Esta política pode ser atualizada. Alterações materiais serão
          comunicadas pelo painel da aplicação ou por email com pelo menos 15
          dias de antecedência. A versão em vigor é sempre a publicada nesta
          página, com a data de &ldquo;última atualização&rdquo; visível no
          topo.
        </p>
      </Section>

      <Section id="contacto" title="14. Contacto">
        <p>
          <strong className="text-foreground">Privacidade e proteção de dados</strong>{" "}
          —{" "}
          <a
            href="mailto:privacidade@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            privacidade@lunga.ao
          </a>
        </p>
        <p>
          <strong className="text-foreground">Suporte geral</strong> —{" "}
          <a
            href="mailto:suporte@lunga.ao"
            className="font-semibold text-primary hover:underline"
          >
            suporte@lunga.ao
          </a>
        </p>
        <p>Sede: Luanda, Angola.</p>
      </Section>
    </LegalLayout>
  );
}
