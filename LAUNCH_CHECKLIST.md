# 🚀 Lunga — Checklist de Lançamento

> Lista completa do que falta para lançar a Lunga.
> Criado a 22 de maio de 2026. Marca os itens com `[x]` à medida que avanças.

---

## 📐 PARTE A — Técnico (o software)

### Já feito ✅
- [x] Rebrand ANGOLASAUDE → Lunga (logo, nome, cores)
- [x] Landing reconstruída (hero de marca, telemóvel, "Como funciona")
- [x] Painel do paciente (passaporte, consultas, marcar, faturas, receitas, exames)
- [x] Painel do médico (dashboard, agenda, pacientes, receita rápida)
- [x] Painel da clínica (dashboard, equipa, atividade por médico, faturas)
- [x] Telemedicina (triagem, sala de espera)
- [x] Toasts + atualizações em tempo real (Realtime)
- [x] Termos + Privacidade (texto legal — falta revisão por advogado)
- [x] Formulário de contacto + formulário de clínica (`/parceria`)
- [x] PDFs (fatura + receita) com header novo
- [x] Índices da base de dados + revisão de segurança RLS
- [x] Dados demo (seed) + script para apagar (unseed)

### Pendente — funcionalidades
- [ ] **PWA** — "Adicionar ao ecrã", funciona offline (~1.5 h)
- [ ] **AI triagem real** — pôr a `ANTHROPIC_API_KEY` no `.env.local` (~30 min depois)
- [ ] **Email real (Resend)** — confirmação de registo, lembrete 24 h, recibo. Precisa do domínio `lunga.ao` primeiro (~3 h)
- [ ] **Notificações push** — depende da PWA (~2 h)
- [ ] **Página de preços** `/precos` + calculadora de ROI para clínicas (~2 h)
- [ ] **Mapa interativo de Angola** no /sobre (~2 h)
- [ ] **Sentry** — apanhar erros em produção (~30 min)
- [ ] **Rate-limit** em login + marcação (~1 h)

### Pendente — coisas grandes
- [ ] **Multicaixa Express real** (EMIS / Proxypay) — depende da empresa + conta bancária
- [ ] **Vídeo real na telemedicina** (LiveKit / Daily) — hoje é placeholder
- [ ] **Inbox de admin** dentro da app — para ler mensagens de contacto e leads de clínicas
- [ ] **Recuperar palavra-passe** a funcionar — depende do email
- [ ] **Banner de consentimento de cookies** (exigido pela Lei 22/11)
- [ ] **Domínio `lunga.ao`** comprado + ligado ao Vercel
- [ ] **Backups** — plano Supabase Pro (recuperação ponto-no-tempo)
- [ ] **QA / testes** — passar por todos os fluxos como utilizador real
- [ ] **Antes de lançar:** correr `npm run unseed` para apagar os dados demo

---

## ⚖️ PARTE B — Legal e burocrático (Angola)

> ⚠️ Isto é o mapa do caminho — confirma cada passo com um **advogado** e um
> **contabilista** angolanos. Não é aconselhamento jurídico.

- [ ] **1. Constituir a empresa** — registar no Guichê Único da Empresa
  (GUE/BUE), provavelmente uma Sociedade por Quotas (Lda). Recebes certidão
  comercial, estatutos e o NIF da empresa.
- [ ] **2. NIF** — o NIF da empresa sai com o registo no GUE. O NIF pessoal
  dos sócios é o número do BI.
- [ ] **3. Conta bancária empresarial** (BAI / BFA / BIC / …) — para receber
  subscrições das clínicas e para o Multicaixa.
- [ ] **4. Licença comercial / Alvará** — Ministério do Comércio / município.
- [ ] **5. APD — Agência de Proteção de Dados** — registar/notificar como
  responsável pelo tratamento. A Lunga trata dados de saúde (categoria
  especial, Lei n.º 22/11). Obrigatório.
- [ ] **6. MINSA — Ministério da Saúde** — confirmar se operadores de
  plataforma de telemedicina precisam de autorização específica.
- [ ] **7. EMIS / Multicaixa Express** — registar a empresa como comerciante
  (via banco) para credenciais GPO. Alternativa: agregador Proxypay.
- [ ] **8. AGT — faturação certificada** — confirmar com contabilista se o
  software de faturas precisa de validação/comunicação à AGT (numeração
  sequencial, NIF, IVA).
- [ ] **9. Marca registada — IAPI** — registar "Lunga" (nome + logo) no
  Instituto Angolano da Propriedade Industrial.
- [ ] **10. Contabilista** — para impostos (IVA, Imposto Industrial) e contas.
- [ ] **11. Segurança Social (INSS)** — ao contratar o primeiro funcionário.
- [ ] **12. Revisão legal** dos Termos + Privacidade por advogado angolano
  (os textos atuais têm aviso "preliminar").

---

## 🗺️ Ordem recomendada

Os passos legais e técnicos entrelaçam-se. Começa os legais **já** (são lentos):

1. **Constituir empresa + NIF + conta bancária** (legal — semanas)
   → destranca: Multicaixa real, comprar `lunga.ao` no nome da empresa
2. **Comprar e ligar `lunga.ao`**
   → destranca: email real
3. **Registo na APD + revisão legal dos termos** (antes de dados reais)
4. **Técnico restante** (PWA, preços, mapa, Sentry, rate-limit) — sem bloqueios
5. **`npm run unseed`** → **lançamento** 🎉
