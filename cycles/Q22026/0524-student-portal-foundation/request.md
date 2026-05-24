# request.md — Medium Cycle

## Cycle
- **Path:** `cycles/Q22026/0524-student-portal-foundation/`
- **Tipo:** Medium
- **Data:** 2026-05-24
- **Autor:** {nome}

---

## Contexto

O sistema atual é um painel para **professor/academia** gerir alunos, financeiro (`billing`) e graduações (`graduations`). Não existe área dedicada ao aluno.

Este cycle é de **fundação (Fase 0)**: transformar a ideia do Portal do Aluno em escopo validável, fechar decisões pendentes e produzir artefatos SDD — **sem implementar código, rotas, tabelas, auth, migrations ou UI**.

A iniciativa completa do Portal do Aluno será **Large** (múltiplas stages futuras: auth/onboarding → aulas/check-in → loja → refinamentos). Este cycle prepara o terreno.

Documento de referência já existente: `ROADMAP_PORTAL_ALUNO.md`.

---

## O que precisa ser feito

Cycle de fundação com entregáveis **documentais**:

### 1. Visão consolidada do Portal do Aluno

Três capacidades centrais na v1:

1. **Aulas** — aluno vê aulas disponíveis da sua turma/contexto (horário, professor, turma).
2. **Check-in** — antes da aula, aluno confirma "estou presente" com um clique; professor vê quem confirmou antes da aula começar.
3. **Loja com reserva** — aluno vê produtos com estoque > 0 e reserva para pagamento presencial na academia.

Capacidade adicional **planejada, não funcional na v1**:

4. **Pagamento por QR code / chave PIX** — incluir no escopo de UX como **layout placeholder** na área financeira do portal (ex.: seção com QR e chave copiável), sempre com aviso visível **"Em breve"** / funcionalidade indisponível. Sem gateway, sem PCI, sem processamento real neste roadmap inicial. Serve como reserva de espaço na experiência e alinhamento de produto para fase futura.

### 2. Decisões D1–D7 fechadas

Documentar status explícito (`Fechada` ou `Adiada` com motivo + owner) para:

| # | Decisão |
|---|---|
| D1 | Mesmo domínio (`/aluno/...`) ou subdomínio? |
| D2 | Aluno usa mesma tabela com role ou entidade expandida? |
| D3 | Janela de check-in (abertura e fechamento) |
| D4 | Professor pode marcar presença manual se aluno não fez check-in? |
| D5 | Aluno pode desfazer check-in? Até quando? |
| D6 | Limite de vagas por aula é requisito? |
| D7 | Recorrência de aulas (semanal) vs evento único |

### 3. Modelo de dados preliminar validado

Entidades novas ou impactadas:

- `Aluno` (já existe) — extensão para conta de acesso ao portal
- `Turma`, `AulaRecorrente`, `Aula` (instância)
- `CheckIn` (intenção antes da aula) e `Presenca` (registro oficial pós-aula) — **separados**
- `Produto`, `Reserva`

Revisar contra entidade `students` existente e padrão RLS do projeto.

### 4. Mapa de phases → cycles futuros

| Fase | Objetivo resumido |
|---|---|
| Fase 1 | Auth e onboarding do aluno (rotas `(student)`, vínculo Aluno ↔ auth_user) |
| Fase 2 | Aulas e check-in (core) |
| Fase 3 | Loja com reserva |
| Fase 4 | Refinamentos (histórico, métricas, notificações, E2E) |

Cada fase com critério de aceite testável.

### 5. Feature flags planejadas

- `student-portal.enabled`
- `student-portal.classes.checkin`
- `student-portal.shop`
- `student-portal.payments.pix` (placeholder "em breve" — flag desligada até fase futura)

### 6. Artefatos SDD (via `/refine-request`, não neste passo)

- `spec-delta.md` propondo `spec/features/student-portal/readme.md`
- `scenarios.feature` cobrindo check-in, presença manual, reserva e placeholder de pagamento
- Alinhamento de `ROADMAP_PORTAL_ALUNO.md` com decisões fechadas

---

## Motivação / valor

Reduzir risco de retrabalho antes de abrir cycles de implementação Large. Fechar decisões de produto, auth e modelagem cedo; garantir que RLS e multi-tenant sejam planejados desde o início; dar ao time um contrato claro do que entra na v1 vs fases futuras.

---

## Critérios de aceite

- [ ] D1–D7 documentadas com status `Fechada` ou `Adiada (motivo + owner)` — nenhuma permanece implícita
- [ ] Modelo de dados revisado com separação explícita **CheckIn ≠ Presença**
- [ ] Mapa de phases (1–4) com critérios de aceite observáveis por fase
- [ ] Escopo de pagamento PIX/QR documentado como **layout placeholder "Em breve"**, sem funcionalidade real na v1
- [ ] `spec-delta.md` propondo `spec/features/student-portal/readme.md` (gerado em `/refine-request`)
- [ ] `scenarios.feature` com fluxos de check-in (sucesso, janela fechada, cancelamento), presença manual do professor, reserva com estoque e placeholder de pagamento
- [ ] Out of scope explícito: pagamento online funcional, QR de presença, biometria
- [ ] Aprovação humana do escopo antes do primeiro cycle de implementação (Fase 1)

---

## Restrições e riscos conhecidos

**Restrições deste cycle (obrigatórias):**

- Não criar rotas
- Não criar tabelas
- Não alterar auth
- Não criar migrations
- Não mexer em UI
- Não implementar produto

**Restrições do portal (roadmap):**

- Sem reconhecimento facial, QR code de presença, GPS ou biometria
- Sem gateway de pagamento / PCI na v1 (PIX/QR apenas como layout "Em breve")
- Reutilizar stack: Supabase, RLS (`validate-rls.cjs`), server actions, Zod, App Router
- Isolamento multi-tenant via `account_id` (padrão SEC-)
- Auth atual é MVP professor — evolução para aluno deve ser **proposta**, não implementada aqui
- "Planos de aula" pedagógicos (`lesson-plans`) ≠ aulas agendadas do portal — domínios distintos

**Riscos:**

- Decisões D1–D7 abertas bloqueiam implementação — mitigar fechando neste cycle
- Confundir `lesson_plans` com `classes` — glossário e nomes distintos no modelo
- Auth subestimada na Fase 1 — documentar evolução de roles no spec-delta
- Check-in vira "marca de casa" — CheckIn ≠ Presença; professor confirma na aula
- RLS mal planejada para papel "aluno" — seguir padrão SEC- e incluir no spec-delta

---

## Fora de escopo

**Neste cycle (fundação):**

- Qualquer implementação (rotas, DB, auth, UI, server actions, testes E2E)

**No roadmap inicial do portal (cycles futuros):**

- Pagamento online funcional (gateway, PIX real, confirmação automática)
- Reconhecimento facial / biometria
- QR code ou código rotativo para check-in de presença
- Notificações push/e-mail (Fase 4)
- Refatoração ampla do painel professor fora do necessário para aulas/presença/reservas

---

## Specs relevantes

- `spec/features/authentication/readme.md`
- `spec/features/students-crud/readme.md`
- `spec/features/student-profile/readme.md`
- `spec/features/rls-security/readme.md`
- `spec/features/plans-billing-model/readme.md`
- `spec/features/payments-billing-status/readme.md`
- `spec/features/app-shell/readme.md`
- `spec/features/lesson-plans/readme.md` (domínio distinto — não confundir)
- `spec/security.md`
- `spec/harness.md`

---

## Referências

- `ROADMAP_PORTAL_ALUNO.md` — roadmap estratégico com D1–D7, modelo e fases
- Escopo validado via `/scope-cycle` em 2026-05-24

---

## Open questions (resolver neste cycle)

1. **D6 — Limite de vagas:** requisito na v1 ou adiável?
2. **Aptidão financeira para check-in:** aluno inadimplente pode fazer check-in?
3. **Menores de idade:** fluxo de responsável obrigatório na Fase 1 ou depois?
4. **Turma do aluno:** como vincular aluno → turma(s)? Campo novo ou N:N?
5. **D1 — Domínio/URL:** confirmar mesmo domínio `(student)` vs subdomínio?
6. **`ROADMAP_PORTAL_ALUNO.md`:** promover para `spec/` após validação ou manter como doc de planejamento até Fase 1?
