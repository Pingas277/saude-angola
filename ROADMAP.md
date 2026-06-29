# Lunga — Roadmap

Estado atual da plataforma, organizado por sistema. Cada item tem:
- **Estado** — o que existe hoje
- **A fazer** — o que falta (ADD / FIX / CHANGE / IMPROVE)
- **Prioridade** — P0 (bloqueia lançamento) · P1 (qualidade do lançamento) · P2 (pós-lançamento) · P3 (futuro)
- **Esforço** — estimativa em horas

Última revisão: 2026-06-25

---

## 🌐 A. Público & Marketing

### A1. Landing page (`/`)
- **Estado**: Refrescada hoje com as 10 features. Multicaixa removido até pagamento real estar pronto.
- **A fazer**:
  - [ ] **ADD** — Secção de depoimentos/social proof real (precisamos de 3-5 clínicas piloto primeiro). `P2 · 6h`
  - [ ] **IMPROVE** — Photo da Serra da Leba é placeholder, trocar por foto real Angola que paga 100% direitos. `P2 · 2h`
  - [ ] **IMPROVE** — Phone mockup mostrar screenshot real do app, não desenho. `P1 · 4h`
- **Total**: ~12h

### A2. Páginas públicas (`/sobre`, `/precos`, `/privacidade`, `/termos`, `/parceria`)
- **Estado**: Existem mas conteúdo escrito antes de metade das features.
- **A fazer**:
  - [ ] **UPDATE** — `/sobre` mencionar missão, equipa, marcos. `P1 · 3h`
  - [ ] **UPDATE** — `/privacidade` revisão legal completa (Lei 22/11 + APD). `P0 · 8h` (precisa advogado angolano)
  - [ ] **UPDATE** — `/termos` — termos para paciente E para clínica (B2B contract). `P0 · 8h`
  - [ ] **ADD** — `/precos` — comparativo dos 3 planos com FAQ específica B2B. `P1 · 4h`
- **Total**: ~23h

### A3. SEO & metadata
- **Estado**: Metadata atualizada hoje. Open Graph com logo. Sitemap + robots OK.
- **A fazer**:
  - [ ] **ADD** — JSON-LD structured data (Organization, LocalBusiness para clínicas). `P2 · 4h`
  - [ ] **ADD** — Páginas por especialidade (`/cardiologia-angola`, `/pediatria-angola`) — captura de SEO local. `P2 · 8h`
- **Total**: ~12h

---

## 🔐 B. Autenticação

### B1. Página de login (`/entrar`)
- **Estado**: Funcional mas básica.
- **A fazer**:
  - [ ] **REDESIGN** — Layout split-screen (formulário + brand visual). `P1 · 3h`
  - [ ] **ADD** — "Mostrar palavra-passe" toggle. `P1 · 30min`
  - [ ] **ADD** — "Continuar com Google" (mais conversão em mercados mobile). `P1 · 4h`
  - [ ] **FIX** — Mensagens de erro genéricas — distinguir "email não existe" vs "palavra-passe errada" (com cuidado para não dar info a atacantes). `P1 · 2h`
  - [ ] **ADD** — Loading state no botão (atualmente flicker visível). `P1 · 30min`
  - [ ] **ADD** — Lembrar-me checkbox + sessão persistente. `P2 · 1h`
- **Total**: ~11h ← **utilizador pediu explicitamente**

### B2. Registar (`/registar`)
- **Estado**: 4-step wizard funcional.
- **A fazer**:
  - [ ] **IMPROVE** — Progress bar visual entre passos. `P1 · 1h`
  - [ ] **FIX** — Validação BI em tempo real (atualmente só no submit). `P1 · 2h`
  - [ ] **ADD** — Verificação telefónica por SMS (Twilio/Plivo). `P1 · 8h`
- **Total**: ~11h

---

## 🚪 C. Onboarding

### C1. Perfil (`/perfil`)
- **Estado**: Funciona, com edição básica e gestão de dependentes.
- **A fazer**:
  - [ ] **ADD** — Upload de avatar (atualmente só initials). `P1 · 3h`
  - [ ] **IMPROVE** — Wizard de primeira utilização (atualmente cai num form longo). `P1 · 4h`
  - [ ] **ADD** — Identity switcher no header do `/painel` (ver-se como dependente). `P1 · 5h` ← _deferido da sessão anterior_
- **Total**: ~12h

### C2. Verificação de identidade
- **Estado**: Verificação BI é só validação de formato (não confirma autenticidade).
- **A fazer**:
  - [ ] **ADD** — Integração SIAC ou equivalente (consulta gov de BI). `P1 · 16h` ← _depende de acesso ao SIAC_
  - [ ] **ADD** — Upload de foto do BI (anverso/verso) com OCR. `P2 · 8h`
- **Total**: ~24h

---

## 👤 D. Paciente

### D1. Dashboard (`/painel`)
- **Estado**: Cards próxima consulta + receitas + exames + faturas + passaporte. Mobile shell já mockup-style (bottom tab nav + quick actions grid + passaporte-header) ✅.
- **A fazer**:
  - [ ] **ADD** — Quick actions ("Marcar consulta", "Pedir receita", "Falar com médico") visíveis no top do desktop. `P1 · 3h`
  - [ ] **IMPROVE** — Empty states quando paciente é novo (atualmente cards vazios sem CTA). `P1 · 3h`
- **Total**: ~6h

### D2. Marcar (`/painel/marcar`)
- **Estado**: Clinic-first ✅ (mentor feedback). Lista clínicas → escolhes → vês médicos da clínica + filtro especialidade → BookingSheet.
- **A fazer**:
  - [ ] **ADD** — Filtros: especialidade × proximidade × seguro × idioma. `P1 · 8h`
  - [ ] **IMPROVE** — Mapa de Angola com pins das clínicas. `P2 · 8h`
  - [ ] **ADD** — Marcação por dependente (já tem seletor mas pode melhorar UX). `P2 · 2h`
- **Total**: ~18h

### D3. Telemedicina (`/painel/telemedicina/*`)
- **Estado**: Triagem com IA (Claude Haiku 4.5) ✅. Cancel/escape hatch ✅. Vídeo via Jitsi.
- **A fazer**:
  - [ ] **IMPROVE** — UI do resumo IA destacar visualmente a recomendação clínica. `P1 · 2h`
  - [ ] **ADD** — Histórico de triagens passadas. `P2 · 3h`
  - [ ] **REPLACE** — Jitsi → Daily.co ou LiveKit (Jitsi tem qualidade variável em 3G). `P2 · 16h`
- **Total**: ~21h

### D4. Receitas, Faturas, Exames (`/painel/{receitas,faturas,exames}`)
- **Estado**: Listagem + detalhe + PDFs. Labels "Para [nome]" para dependentes ✅.
- **A fazer**:
  - [ ] **IMPROVE** — Filtros (data, médico, tipo de exame). `P2 · 4h`
  - [ ] **ADD** — Pesquisa por nome de medicamento nas receitas. `P2 · 3h`
- **Total**: ~7h

### D5. Health Passport
- **Estado**: Cartão 3D animado com QR ✅. Para dependentes ✅. Emergency QR público + token regenerável + toggle ON/OFF + audit log de scans + página `/e/<token>` ✅. Tudo live em `lunga.ao`.
- **A fazer**:
  - [ ] **IMPROVE** — Download como PDF para imprimir (versão "papel" para carteira). `P2 · 2h`
  - [ ] **CHANGE** — Default ON → default OFF, com opt-in explícito no onboarding (passo do `/perfil`). `P2 · 2h`
- **Total**: ~4h

### D6. Notificações in-app
- **Estado**: Sino com badge + dropdown ✅. Realtime via Supabase.
- **A fazer**:
  - [ ] **ADD** — Push notifications via Web Push API. `P1 · 12h`
  - [ ] **ADD** — Email de digest diário/semanal (Resend ou Brevo). `P2 · 6h`
- **Total**: ~18h

---

## 👨‍⚕️ E. Médico

### E1. Dashboard + Agenda + Pacientes + Consulta
- **Estado**: Funcional, vê pacientes do dia, abre consulta, escreve notas, emite receita.
- **A fazer**:
  - [ ] **IMPROVE** — Modo "consulta em curso" full-screen (esconde tudo o resto). `P1 · 4h`
  - [ ] **ADD** — Templates de notas clínicas (SOAP). `P1 · 4h`
  - [ ] **ADD** — Histórico do paciente em sidebar durante consulta. `P1 · 6h`
- **Total**: ~14h

### E2. Receita digital
- **Estado**: Form + medicações + QR + PDF.
- **A fazer**:
  - [ ] **ADD** — Auto-complete de medicamentos (base de dados Infarmed/INAME). `P1 · 8h`
  - [ ] **ADD** — Avisos de interações medicamentosas. `P2 · 16h`
  - [ ] **ADD** — Reemitir receita anterior (recorrente). `P2 · 3h`
- **Total**: ~27h

### E3. Telemedicina (lado médico)
- **Estado**: Lista de pacientes em espera com urgência, claim, video call.
- **A fazer**:
  - [ ] **IMPROVE** — Mostrar resumo Claude em destaque (atualmente igual ao texto da heurística). `P1 · 2h`
  - [ ] **ADD** — Filtro por urgência (só ver emergencies). `P2 · 1h`
- **Total**: ~3h

---

## 🏥 F. Clínica

### F1. Dashboard + Agenda + Equipa + Faturas + Perfil + Horários
- **Estado**: Painel multi-tab com agenda, equipa, faturação, horários por dia da semana ✅.
- **A fazer**:
  - [ ] **ADD** — Métricas: faturação mensal, consultas/médico, taxa de no-show. `P1 · 6h`
  - [ ] **ADD** — Importação em massa de pacientes (CSV/Excel). `P1 · 6h`
  - [ ] **ADD** — Convidar médico/recepcionista por email. `P1 · 4h`
  - [ ] **ADD** — Upload de logo da clínica + foto. `P2 · 2h`
- **Total**: ~18h

---

## 🪑 G. Recepção & Enfermagem

### G1. Recepção
- **Estado**: Listar agenda do dia, marcar para pacientes (presenciais), pesquisar pacientes.
- **A fazer**:
  - [ ] **ADD** — Check-in do paciente quando chega à clínica. `P1 · 4h`
  - [ ] **ADD** — Registar pagamento à mão (cash/multibanco físico). `P1 · 3h`
  - [ ] **ADD** — Imprimir recibo para o paciente. `P1 · 2h`
- **Total**: ~9h

### G2. Enfermagem / Triagem física
- **Estado**: Form para sinais vitais, urgência manual.
- **A fazer**:
  - [ ] **ADD** — Triagem IA também aqui (mesma da telemedicina, contexto presencial). `P1 · 4h`
  - [ ] **ADD** — Stock da farmácia interna (atualmente sem inventory). `P2 · 12h`
- **Total**: ~16h

---

## 🛡️ H. Admin / Suporte

### H1. Painel admin (`/admin`)
- **Estado**: Refrescado na sessão de hoje. Vê leads + mensagens de contacto.
- **A fazer**:
  - [ ] **ADD** — Vista de clínicas: aprovar/rejeitar registo, ver subscrição. `P0 · 8h`
  - [ ] **ADD** — Vista de utilizadores: pesquisa, banir, ver atividade. `P1 · 6h`
  - [ ] **ADD** — Logs de auditoria (RLS é uma coisa, mas precisamos de quem-fez-o-quê). `P1 · 8h`
- **Total**: ~22h

### H2. Suporte com AI bot ← **utilizador pediu**
- **Estado**: ❌ Não existe. Suporte é só email.
- **A fazer**:
  - [ ] **ADD** — Bot widget no canto inferior direito de todas as páginas autenticadas
  - [ ] Modelo: **GPT-4o-mini** ($0.15/Mtok input, $0.60/Mtok output) — ≈ 7x mais barato que Haiku 4.5 e suficiente para suporte
  - [ ] Alternativa ainda mais barata: **Gemini Flash** (free tier 15 req/min, depois $0.075/Mtok)
  - [ ] Conhecimento: FAQ + screenshots + ações ("escalar para humano", "abrir ticket")
  - [ ] Custo estimado: 200 sessões/dia × ~$0.005 cada = ~$30/mês na escala média
  - [ ] **Esforço**: ~16h
  - **P1 · 16h**

---

## 💰 I. Plataforma & Infraestrutura

### I1. Pagamentos reais (Multicaixa)
- **Estado**: ❌ **MOCK**. `app/painel/faturas/[id]/actions.ts:9` tem aviso "DO NOT SHIP".
- **A fazer**:
  - [ ] **REPLACE** — Integração real com Proxypay (recomendado) ou EMIS direto. `P0 · 24h`
  - [ ] **ADD** — Webhook de confirmação de pagamento + reconciliação. `P0 · 8h`
  - [ ] **ADD** — Política de cancelamento com retenção/reembolso (hook já marcado no cancel action). `P1 · 6h`
- **Total**: ~38h ← **bloqueia receita real**

### I2. Email transacional
- **Estado**: Não há setup explícito (Supabase Auth envia password reset; resto silencioso).
- **A fazer**:
  - [ ] **ADD** — Provider (Resend recomendado, $0/mês até 3k emails). `P0 · 4h`
  - [ ] **ADD** — Templates: confirmação consulta, lembrete 24h antes, nova receita, fatura, nova mensagem. `P0 · 8h`
  - [ ] **ADD** — DNS records (SPF, DKIM, DMARC) — depende de novo domínio. `P0 · 2h`
- **Total**: ~14h

### I3. SMS
- **Estado**: ❌ Não existe.
- **A fazer**:
  - [ ] **ADD** — Provider (Twilio ou Vonage com cobertura Angola). `P1 · 4h`
  - [ ] **ADD** — Lembretes de consulta + códigos OTP. `P1 · 4h`
- **Total**: ~8h

### I4. PWA / Mobile
- **Estado**: Viewport + safe-area + iOS zoom fixes ✅ (hoje).
- **A fazer**:
  - [ ] **ADD** — `manifest.json` para PWA install. `P1 · 2h`
  - [ ] **ADD** — Service Worker para offline (pelo menos passaporte e receitas). `P2 · 16h`
  - [ ] **AUDIT** — Sweep das 30+ rotas em iPhone real para apanhar overflows residuais. `P1 · 6h`
- **Total**: ~24h

### I5. Performance & Loading
- **Estado**: Inconsistente. Algumas páginas têm skeletons, outras flicker, outras nada.
- **A fazer**:
  - [ ] **STANDARDIZE** — Skeleton components reutilizáveis para listas/cards. `P1 · 6h`
  - [ ] **ADD** — Optimistic UI em ações de baixo risco (marcar lida, cancelar consulta). `P1 · 6h`
  - [ ] **ADD** — Lighthouse audit + fixes (LCP/CLS/INP). `P2 · 6h`
- **Total**: ~18h

### I6. Error handling
- **Estado**: Mensagens técnicas em alguns sítios; sem error boundary.
- **A fazer**:
  - [ ] **ADD** — Error boundary global com retry. `P1 · 3h`
  - [ ] **STANDARDIZE** — Mensagens em PT amigável, com sugestão de ação. `P1 · 4h`
  - [ ] **ADD** — Página 500 personalizada. `P1 · 1h`
- **Total**: ~8h

### I7. Pesquisa / descoberta
- **Estado**: Procurar médico funciona mas básico.
- **A fazer**:
  - [ ] **IMPROVE** — Ordenação por relevância + distância + avaliação. `P1 · 8h`
  - [ ] **ADD** — Avaliações/reviews por paciente (com moderação). `P2 · 16h`
- **Total**: ~24h

### I8. WhatsApp deep integration
- **Estado**: Botões "Partilhar via WhatsApp" em receitas/exames/faturas.
- **A fazer**:
  - [ ] **ADD** — WhatsApp Business API: notificações + chatbot inicial → "abrir app". `P2 · 16h`
- **Total**: ~16h

### I9. Compliance / Legal
- **Estado**: RLS rigorosa ✅. Privacidade textualmente OK mas sem auditoria.
- **A fazer**:
  - [ ] **AUDIT** — APD: registo da Lunga como controller, DPIA, contratos com clínicas como processors. `P0 · advogado`
  - [ ] **ADD** — Página de export de dados pessoais (Lei 22/11 art. 19). `P0 · 4h`
  - [ ] **ADD** — Fluxo de eliminação de conta (right to erasure). `P0 · 4h`
- **Total**: ~8h + legal

### I10. Observabilidade
- **Estado**: Sentry ✅ instrumentado.
- **A fazer**:
  - [ ] **ADD** — Dashboards Sentry: error rate por rota, % de fallback heurístico no triage. `P1 · 3h`
  - [ ] **ADD** — Analytics produto (PostHog ou Mixpanel) — quantos completam triagem, quanto demora, etc. `P1 · 6h`
- **Total**: ~9h

### I11. Domínio + DNS ✅ DONE
- **Estado**: `https://lunga.ao` + `https://www.lunga.ao` live com SSL. Cookies cross-subdomain. `NEXT_PUBLIC_SITE_URL=https://lunga.ao`. Resta apenas: DNS records para email (Resend/SES) — depende do I2.

### I12. Supabase Pro plan upgrade (~$25/mês)
- **Estado**: ❌ Free tier — bloqueia 4 features de segurança/qualidade que pedem Pro. Sinalizado pelo utilizador 2026-06-27 quando tentou ativar Leaked Password Protection e descobriu que não está disponível em Free.
- **A fazer (quando upgradear)**:
  - [ ] **ENABLE** — **Leaked Password Protection** (Auth → Providers → Email): verifica passwords contra HaveIBeenPwned. Bloqueia "123456" e passwords vazadas em data breaches conhecidos. `P0 quando Pro · 5min`
  - [ ] **ENABLE** — **Custom SMTP** para Auth emails: hoje os emails de reset/confirmação saem do domínio supabase.io. Com Pro + SMTP próprio (Resend/Brevo/SendGrid) saem de `no-reply@lunga.ao`. Pré-requisito do I2 (email transacional). `P0 quando Pro · 30min`
  - [ ] **ENABLE** — **Daily backups + Point-in-Time Recovery (PITR)**: Free tier guarda backups limitados; Pro guarda 7 dias + PITR ao segundo. Crítico para data clínica regulada. `P0 quando Pro · automático`
  - [ ] **ENABLE** — **Database branching**: cria branches isoladas do DB para testar migrações antes de produção. Hoje aplicamos migrações direto em produção via MCP — funciona mas tem risco. `P1 quando Pro · automático`
  - [ ] **CONSIDER** — **Read replicas + advanced compute**: só importa quando passares de 1.000 utilizadores ativos. `P2 quando Pro`
- **Trigger natural**: quando começares a aceitar pacientes reais com receita médica armazenada (compliance), PITR + custom SMTP deixam de ser "nice" e passam a "obrigatório legalmente".
- **Custo**: $25/mês USD (~22.000 Kz/mês). Único custo recorrente da plataforma além do domínio + Vercel.
- **Total**: ~1h de config após upgrade

### I13. Backups + DR
- **Estado**: Supabase faz backups diários (pro tier) — não verificado restore.
- **A fazer**:
  - [ ] **TEST** — Fazer restore de backup numa branch e validar. `P1 · 2h`
  - [ ] **DOCUMENT** — Runbook de incidente. `P2 · 4h`
- **Total**: ~6h

---

## 📊 Resumo por prioridade

| Prioridade | Bloqueia... |
|---|---|
| **P0** (bloqueia lançamento real) | Multicaixa real (I1), email transacional (I2), compliance/APD (I9), termos+privacidade legal (A2) |
| **P1** (qualidade do lançamento) | Login redesign (B1), AI bot (H2), identity verification (C2), email lembretes (I2 extra) |
| **P2** (pós-lançamento) | Polish, dependents PDF passport, performance, error boundaries, busca avançada |
| **P3** (futuro) | SMS, deep WhatsApp, reviews, multi-clinic chains |

## ✅ Já shipped (movido para git history)

- I11. Domínio + DNS (lunga.ao + www.lunga.ao live, cookies cross-subdomain)
- B3. Recuperação de palavra-passe (`/esqueci-palavra-passe` → email → `/redefinir`)
- D2. Marcar clinic-first (`search_clinics` RPC + 2-view marcar page)
- D5. Emergency QR público (token + toggle + audit + dependents + `/e/<token>`)
- D1. Mobile patient shell (bottom tab nav + mockup-style)
- D3. Telemedicina com IA Claude Haiku 4.5 + cancel/escape hatch
- Security audit 9-point (HSTS+CSP+XFO+Referrer+Permissions, /admin guard, safeError, deps 26→4)

## 📌 Próximos movimentos sugeridos

1. **I2. Email transacional via Resend** (~14h, P0) — free 3k emails/mo, desbloqueia confirmações de consulta + lembretes + alertas de exames.
2. **B1. Login redesign** (~11h, P1) — split-screen, Google OAuth, show/hide password, lembrar-me, mensagens de erro melhores.
3. **H2. AI Support bot** (~16h, P1) — GPT-4o-mini, ~$30/mês a 200 sessões/dia.
4. **D6. Push notifications** (~12h, P1) — Web Push API, complementa o sistema in-app já existente.
5. **I1. Multicaixa real** (~38h, P0) — depende de conta business em Proxypay/EMIS (passo externo).

---

_Este roadmap evolui. Quando uma linha completa, riscar e mover para CHANGELOG. Quando uma nova ideia aparece, juntar ao sistema certo com prioridade._
