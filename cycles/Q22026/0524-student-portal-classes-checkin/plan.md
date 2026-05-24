# plan.md — Large Cycle

## Cycle: 0524-student-portal-classes-checkin
## Gerado em: 2026-05-24

---

## Resumo do plano

Implementar a **Fase 2** do Portal do Aluno: modelo `class_*`, inscrições, instâncias de aula, check-in/cancelamento do aluno e visibilidade pré-aula para o professor — respeitando **CheckIn ≠ Presença** (**SPT-0**, **SPT-5.4**).

Abordagem em **3 stages** com checkpoint humano entre cada uma:

1. **Schema e RLS** — migration `010_*`, tabelas Fase 2 (incl. `attendances` preparatória), políticas **SEC-3.7**, `validate-rls.cjs`, seeds/fixtures de turma para testes.
2. **Portal do aluno** — substituir placeholder em `/portal/aulas`, domínio de janela de check-in (**D3**), actions de check-in/cancelamento (**D5**), UI com estados visuais (**SPT-7.2**), testes unitários da janela.
3. **Painel professor + integração** — item **Aulas** na sidebar; CRUD de turmas, recorrência e inscrições; listagem de sessões e check-ins com **polling 30s** (**SPT-6.1** parcial); indicador **PBS-3**; E2E ponta a ponta; smoke de não-regressão Fase 1.

**Pré-requisitos:** cycles `0524-student-portal-schema` (migration 009) e `0524-student-portal-auth` (Fase 1) concluídos — auth, shell, `profiles.role`, `students.user_id`.

**Fora deste cycle:** conversão check-in → presença (**SPT-6.2–6.4**), chamada/presença manual, loja, PIX funcional, bloqueio por inadimplência ou lotação.

---

## Decisões tomadas no refine

| # | Tema | Decisão | Motivo |
|---|---|---|---|
| D-F1 | Cancelamento de check-in | **DELETE** da linha em `check_ins` | **D5**; permite novo check-in na mesma janela; evita coluna `cancelled_at` na v1 |
| D-F2 | Unicidade check-in | **UNIQUE** `(class_session_id, student_id)` | Um check-in activo por aluno/sessão |
| D-F3 | Tabela `attendances` | **DDL + RLS na Stage 1**; **zero writes** na app neste cycle | Preparar conversão futura sem implementar **SPT-6.2–6.4** |
| D-F4 | Geração de sessões | Função em `lib/classes/session-generator.ts` expande **14 dias** (**SPT-4.3**); invocada ao salvar recorrência e no bootstrap de teste | Sem job/cron na v1; professor dispara ao gerir horários da turma |
| D-F5 | CRUD turmas/inscrições (professor) | **Dentro do escopo — Stage 3** | Cycle completo: turmas, horários recorrentes, inscrições aluno↔turma via UI no painel |
| D-F6 | Rotas professor | **`/aulas`** (sessões próximas), **`/aulas/turmas`**, **`/aulas/turmas/nova`**, **`/aulas/turmas/[classId]`**, **`/aulas/sessao/[sessionId]`** (check-ins) | Hub operacional + gestão de turmas; item **Aulas** na sidebar → `/aulas` |
| D-F13 | Nav sidebar professor | Item **"Aulas"** em `MAIN_NAV_ITEMS` (ícone `CalendarDays`) | Confirmado pelo humano 2026-05-24 |
| D-F14 | Actualização lista check-ins | **Polling 30s** + revalidate on focus na página de sessão | Confirmado pelo humano 2026-05-24; sem Supabase Realtime na v1 |
| D-F7 | Janela de listagem aluno | **7 dias** futuros (**SPT-7.1**); constante configurável em `lib/classes/constants.ts` | Distinto da janela de geração (14 dias) |
| D-F8 | Timezone check-in | **`America/Sao_Paulo`** via `APP_TIME_ZONE` existente | **D3**, **SPT-5.1** |
| D-F9 | `classes.instructor_profile_id` | FK → `profiles.id` (professor da conta) | **SPT-3.1**; exibir nome na listagem aluno |
| D-F10 | Modalidade da turma | Reutilizar enum **`student_kind`** (`adult` \| `kids`) | Alinha com `students.kind` e catálogo existente |
| D-F11 | Flag `classes.checkin` desligada | Aluno vê empty state / indisponibilidade em `/portal/aulas`; professor pode ver rota (dados vazios) ou mesma flag — **proposta: gate só no portal aluno** | **SPT-5.6**; master `student-portal.enabled` continua a aplicar-se globalmente |
| D-F12 | `day_of_week` em recorrência | **ISO 8601: 1 = segunda … 7 = domingo** | Convenção documentada; evita ambiguidade JS `getDay()` |

---

## Stages

### Stage 1 — Schema e RLS
- **Objetivo:** DDL Fase 2, políticas **SEC-3.7** para `class_*`, `check_ins`, `attendances`, `student_class_enrollments`; validação RLS; fixture de turma/sessão para testes.
- **Tasks:** ver `tasks.md` — Stage 1
- **Arquivos principais:** `db/migrations/010_student_portal_phase2_classes_checkin.sql`, `db/schema.sql`, `db/policies.sql`, `scripts/validate-rls.cjs`, `docs/security/rls.md`
- **Critério de saída:** `pnpm db:apply` (pedido explícito) + `pnpm db:validate-rls` passa com cenários student/professor/isolamento; nenhuma regressão nas políticas Fase 1.

### Stage 2 — Portal do aluno (aulas + check-in)
- **Objetivo:** Listagem real em `/portal/aulas`, actions check-in/cancelamento, validação de janela temporal, UI com estados (aberto / fechado / confirmado / cancelável), testes unitários.
- **Tasks:** ver `tasks.md` — Stage 2
- **Arquivos principais:** `lib/classes/*`, `lib/data/student-class-sessions.ts`, `actions/student-portal/check-in.ts`, `components/student/*`, `app/(student)/portal/aulas/page.tsx`, `lib/validations/student-portal.ts`
- **Critério de saída:** Aluno inscrito vê sessões; check-in/cancelamento dentro da janela funciona; fora da janela rejeitado com mensagem pt-BR; flag `student-portal.classes.checkin` respeitada; `pnpm test`, `pnpm build` passam.

### Stage 3 — Painel professor + integração
- **Objetivo:** Item **Aulas** na sidebar; CRUD turmas/recorrência/inscrições; listagem de sessões; check-ins com polling 30s e **PBS-3**; E2E professor→aluno→professor; não-regressão Fase 1.
- **Tasks:** ver `tasks.md` — Stage 3
- **Arquivos principais:** `components/layout/dashboard-nav-config.tsx`, `actions/classes.ts`, `app/(dashboard)/aulas/**`, `components/classes/*`, `lib/data/*`, `lib/validations/classes.ts`, `e2e/*`
- **Critério de saída:** Professor cria turma, define recorrência, inscreve aluno, sessões geradas; aluno faz check-in; professor vê na lista (polling); E2E passa; Fase 1 sem regressão.

---

## Arquivos afetados (visão geral)

| Arquivo | Stage(s) | Tipo de mudança |
|---|---|---|
| `db/migrations/010_student_portal_phase2_classes_checkin.sql` | 1 | create |
| `db/schema.sql` | 1 | edit |
| `db/policies.sql` | 1 | edit |
| `scripts/validate-rls.cjs` | 1 | edit |
| `docs/security/rls.md` | 1 | edit |
| `lib/classes/constants.ts` | 1, 2 | create |
| `lib/classes/checkin-window.ts` | 2 | create |
| `lib/classes/session-generator.ts` | 1, 2 | create |
| `lib/classes/checkin-window.test.ts` | 2 | create |
| `lib/data/student-class-sessions.ts` | 2 | create |
| `lib/data/class-session-check-ins.ts` | 3 | create |
| `actions/student-portal/check-in.ts` | 2 | create |
| `lib/validations/student-portal.ts` | 2 | edit |
| `components/student/class-session-list.tsx` | 2 | create |
| `components/student/class-session-card.tsx` | 2 | create |
| `app/(student)/portal/aulas/page.tsx` | 2 | edit |
| `components/layout/dashboard-nav-config.tsx` | 3 | edit — item Aulas |
| `actions/classes.ts` | 3 | create — CRUD turmas, schedules, enrollments |
| `lib/validations/classes.ts` | 3 | create |
| `app/(dashboard)/aulas/page.tsx` | 3 | create — sessões próximas |
| `app/(dashboard)/aulas/turmas/**` | 3 | create — CRUD turmas |
| `app/(dashboard)/aulas/sessao/[sessionId]/page.tsx` | 3 | create — check-ins + polling |
| `components/classes/session-check-ins-panel.tsx` | 3 | create |
| `components/classes/class-form.tsx`, `class-enrollments-panel.tsx` | 3 | create |
| `lib/routes.ts` | 3 | edit |
| `e2e/student-portal-classes.spec.ts` | 3 | create |
| `scripts/setup-e2e-test-accounts.cjs` | 1, 3 | edit |

---

## Specs afetadas

- `spec/features/student-portal/readme.md` — **SPT-12** Fase 2; estado de implementação
- `spec/features/supabase-schema/readme.md` — tabelas `class_*`, `check_ins`, `attendances`, `student_class_enrollments`
- `spec/features/rls-security/readme.md` — **SEC-3.7** completo para tabelas Fase 2
- `docs/security/rls.md` — políticas e bootstrap de turma de teste
- `spec/features/app-shell/readme.md` — rotas `/aulas` professor (proposta mínima)
- `spec/features/payments-billing-status/readme.md` — referência **PBS-3** na lista de check-ins (cross-ref)

---

## Riscos globais

| Risco | Probabilidade | Stage afetada | Mitigação |
|---|---|---|---|
| Confundir check-in com presença | Média | 2, 3 | Tabelas separadas; zero write em `attendances`; copy UI distinto; cenários Gherkin |
| RLS insuficiente para papel aluno | Alta | 1 | `validate-rls.cjs` com cenários IDOR; revisão `/security-review` na Stage 3 |
| CRUD turmas aumenta scope da Stage 3 | Média | 3 | Tasks granulares; reutilizar padrões `student-form` / `product-editor`; checkpoint humano |
| Regressão Fase 1 (auth/onboarding) | Média | 2, 3 | Smoke explícito no `validation.md` Stage 3 |
| Timezone / janela 6h incorrecta | Média | 2 | Testes unitários com instantes fixos; `APP_TIME_ZONE` |
| Scope creep (presença em lote, loja) | Média | 3 | Fora de escopo explícito; `attendances` DDL-only |

---

## Fora de escopo (confirmado)

- Loja, reservas, PIX funcional
- Conversão check-in → presença (**SPT-6.2–6.4**), chamada, presença manual
- Bloqueio check-in por inadimplência ou lotação (**Q1**, **D6**)
- QR, GPS, biometria, notificações
- Refactor amplo do painel professor

---

## Dependências entre stages

- **Stage 2** depende de: Stage 1 entregar DDL, RLS e fixture mínima (turma + inscrição + sessões).
- **Stage 3** depende de: Stage 2 entregar fluxo aluno funcional; Stage 1 entregar DDL/RLS para CRUD professor.

---

## Perguntas abertas (resolvidas)

- [x] **Nav professor:** item **"Aulas"** na sidebar — confirmado 2026-05-24.
- [x] **Cycle completo:** CRUD professor de turmas/recorrência/inscrições incluído na **Stage 3** (não apenas seed/SQL manual).
- [x] **Polling:** intervalo **30s** na lista de check-ins — confirmado 2026-05-24.
- [ ] **Autor em `request.md`:** permanece `{nome}` — preencher se desejado.

---

## Próximo passo

Após aprovação humana deste refine: **`/map-stage`** para Stage 1, depois **`/execute-stage`**.
