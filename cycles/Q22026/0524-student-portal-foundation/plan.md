# plan.md — Medium Cycle

## Cycle: student-portal-foundation
## Gerado em: 2026-05-24

---

## Resumo do plano

Cycle **documental-only** (Fase 0). Consolidar a visão do Portal do Aluno em artefatos SDD executáveis, fechar (ou adiar explicitamente) as decisões D1–D7, validar o modelo de dados contra `students` e RLS existente, mapear phases futuras para cycles Large, e propor `spec/features/student-portal/readme.md` via `spec-delta.md`.

**Nenhum código, rota, migration, auth ou UI será alterado neste cycle.**

---

## Arquivos afetados

| Arquivo | Tipo de mudança | Motivo |
|---|---|---|
| `cycles/Q22026/0524-student-portal-foundation/plan.md` | create | Plano delta deste cycle |
| `cycles/Q22026/0524-student-portal-foundation/tasks.md` | create | Tasks documentais |
| `cycles/Q22026/0524-student-portal-foundation/scenarios.feature` | create | Contrato Gherkin para validação e cycles futuros |
| `cycles/Q22026/0524-student-portal-foundation/spec-delta.md` | create | Proposta de `spec/features/student-portal/readme.md` |
| `cycles/Q22026/0524-student-portal-foundation/validation.md` | create | Checklist de revisão documental |
| `cycles/Q22026/0524-student-portal-foundation/review.md` | create | Skeleton de revisão |
| `ROADMAP_PORTAL_ALUNO.md` | edit | Alinhar decisões, PIX placeholder, feature flags, status |
| `spec/features/student-portal/readme.md` | _proposto_ | Criado apenas após `/update-spec` — conteúdo em `spec-delta.md` |

---

## Dependências e ordem de execução

1. **Fechar decisões D1–D7** — desbloqueia modelo, cenários e phases; registrar em `plan.md` (secção abaixo) e refletir em `ROADMAP_PORTAL_ALUNO.md`.
2. **Validar modelo de dados** — revisar entidades contra `students`, `profiles`, SEC-; documentar em `spec-delta.md` (**SPT-10**).
3. **Redigir spec-delta completa** — contrato canónico proposto com prefixo **SPT-**; inclui glossário (`lesson_plans` ≠ aulas agendadas).
4. **Escrever scenarios.feature** — cenários derivados das regras **SPT-**; servem como aceite deste cycle (revisão humana) e base para cycles de implementação.
5. **Mapear phases → cycles Large** — Fases 1–4 com slugs sugeridos e critérios observáveis.
6. **Atualizar ROADMAP_PORTAL_ALUNO.md** — status, decisões, flag `student-portal.payments.pix`, secção PIX placeholder.
7. **Checkpoint humano** — aprovação antes de `/execute-cycle` ou `/create-cycle` da Fase 1.

---

## Decisões D1–D7 (fechadas neste cycle)

| # | Decisão | Status | Resolução | Owner |
|---|---|---|---|---|
| D1 | Domínio vs subdomínio | **Fechada** | Mesmo domínio; grupo App Router `(student)`; prefixo **`/portal`** (pt-BR); mesma instância Supabase e cookies SSR | Produto |
| D2 | Auth: role vs tabela separada | **Fechada** | Reutilizar Supabase Auth; **`profiles.role`** distingue `professor` / `student`; **`students.user_id`** (FK opcional → `auth.users`) liga conta ao cadastro; provisionamento inicial pelo professor (Fase 1) | Arquitetura |
| D3 | Janela de check-in | **Fechada** | Abre **6 horas** antes de `start_time`; fecha no **horário de início** da aula (timezone **America/Sao_Paulo**) | Produto |
| D4 | Presença manual pelo professor | **Fechada** | Sim — professor adiciona aluno que não fez check-in; origem `manual_instructor` | Produto |
| D5 | Cancelamento de check-in | **Fechada** | Sim — aluno cancela até o fechamento da janela (D3) | Produto |
| D6 | Limite de vagas | **Adiada** | Campo `capacity` nullable em `class_sessions`; bloqueio por lotação **fora da v1** — regra na Fase 2+ após validação operacional | Produto |
| D7 | Recorrência vs evento único | **Fechada** | **Recorrência semanal** (`class_recurring_schedules`) gera instâncias `class_sessions` para janela rolante (14 dias) | Arquitetura |

### Decisões complementares

| # | Tema | Status | Resolução |
|---|---|---|---|
| Q1 | Aptidão financeira para check-in | **Adiada (v1)** | Não bloquear check-in na v1; exibir indicador **PBS-3** ao professor na lista de check-ins. Regra de bloqueio opcional na Fase 2. |
| Q2 | Menores — responsável | **Fechada** | Fase 1: campo e-mail do responsável + aceite de termo; confirmação por e-mail adiada para Fase 4 se necessário |
| Q3 | Vínculo aluno → turma | **Fechada** | Tabela **`student_class_enrollments`** (N:N); aluno vê aulas das turmas em que está inscrito |
| Q4 | Promover ROADMAP para spec/ | **Fechada** | Manter `ROADMAP_PORTAL_ALUNO.md` como doc estratégico; promover **`spec/features/student-portal/readme.md`** via `/update-spec` após validação |

---

## Mapa phases → cycles futuros (Large)

| Fase | Slug sugerido | Tipo | Objetivo | Critério de aceite observável |
|---|---|---|---|---|
| 1 | `student-portal-auth` | Large (stage única ou 2 stages) | Auth, onboarding, shell `(student)`, vínculo `students.user_id` | Aluno convidado/provisionado faz login e vê `/portal` com saudação; RLS impede ver dados de outro aluno |
| 2 | `student-portal-classes-checkin` | Large (2–3 stages) | Turmas, aulas recorrentes, check-in, presença professor | Aluno faz check-in; professor vê lista e converte em presença em 1 clique; histórico persistido |
| 3 | `student-portal-shop` | Large (1–2 stages) | Produtos, reservas, confirmação presencial | Reserva reduz estoque; expiração devolve estoque; professor confirma pagamento |
| 4 | `student-portal-refinements` | Medium/Large | Histórico, métricas, notificações, E2E | Playwright cobre fluxos críticos; `pnpm db:validate-rls` inclui novas tabelas |

**Placeholder PIX (layout "Em breve"):** entra na **Fase 1** como secção estática em `/portal/financeiro` (ou equivalente), controlada por flag `student-portal.payments.pix` **desligada** — sem processamento. Funcionalidade real = cycle futuro separado.

---

## Feature flags planejadas

| Flag | Default | Capacidade |
|---|---|---|
| `student-portal.enabled` | `false` | Master switch do portal |
| `student-portal.classes.checkin` | `false` | Aulas + check-in |
| `student-portal.shop` | `false` | Loja + reservas |
| `student-portal.payments.pix` | `false` | Mostra layout QR/chave com aviso **"Em breve"** (sem pagamento real) |

---

## Specs afetadas

Após validação e `/update-spec`:

- **`spec/features/student-portal/readme.md`** _(novo)_ — contrato **SPT-**
- **`spec/features/authentication/readme.md`** — evolução AUTH para role `student` e redirects (Fase 1)
- **`spec/features/app-shell/readme.md`** — novo grupo de rotas `/portal` (Fase 1)
- **`spec/features/rls-security/readme.md`** — políticas para papel aluno (Fases 1–3)
- **`spec/features/supabase-schema/readme.md`** — novas tabelas (Fases 2–3)
- **`spec/product/spec.md`** / **`entities.md`** — alinhar ENT-* quando implementação começar

---

## Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Decisões propostas rejeitadas pelo humano | Média | Checkpoint explícito; status `proposta` até aprovação |
| Confundir `lesson_plans` (PED-) com aulas agendadas (SPT-) | Média | Glossário **SPT-0**; nomes de tabela `class_*` |
| Auth subestimada na Fase 1 | Alta | Documentar evolução AUTH em spec-delta; cycle Large dedicado |
| Check-in ≠ presença mal especificado | Média | Cenários Gherkin separados; regras **SPT-5** / **SPT-6** |
| PIX placeholder confundido com pagamento real | Baixa | Flag desligada + copy "Em breve" + cenário Gherkin dedicado |

---

## Fora de escopo (confirmado)

- Implementação de código, rotas, tabelas, auth, migrations, UI
- Pagamento online funcional, gateway, PCI
- QR code / biometria para check-in de presença
- Notificações push/e-mail (Fase 4)
- Capacidade/lotação bloqueante na v1 (D6 adiada)

---

## Perguntas abertas (checkpoint humano)

- [ ] Confirmar prefixo **`/portal`** — **confirmado** 2026-05-24
- [x] Aprovar escopo documental completo antes de `/create-cycle` → `student-portal-auth`
- [ ] Autor em `request.md` permanece `{nome}` — preencher se desejado
