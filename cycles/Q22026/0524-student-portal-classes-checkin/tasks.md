# tasks.md — Large Cycle

## Cycle: 0524-student-portal-classes-checkin

---

## Stage 1 — Schema e RLS

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 1.1 | Criar migration `010_*`: enums (`attendance_origin`), tabelas `classes`, `class_recurring_schedules`, `class_sessions`, `student_class_enrollments`, `check_ins`, `attendances` | `db/migrations/010_student_portal_phase2_classes_checkin.sql` | `done` | migration 010 aplicada |
| 1.2 | Espelhar DDL em schema greenfield | `db/schema.sql` | `done` | schema.sql |
| 1.3 | Índices: FKs, `(account_id)`, `(class_session_id, student_id)` unique em `check_ins` e `attendances`, `(student_id, class_id)` unique em enrollments | `db/migrations/010_*`, `db/schema.sql` | `done` | migration 010 |
| 1.4 | Políticas RLS professor: CRUD `classes`, schedules, sessions, enrollments por `account_id`; read/write `check_ins`/`attendances` por conta | `db/policies.sql` | `done` | policies.sql |
| 1.5 | Políticas RLS aluno: `SELECT` sessions/enrollments/classes da própria inscrição; `INSERT`/`DELETE` check-ins só `student_id` próprio; sem write em `attendances` | `db/policies.sql` | `done` | validate-rls |
| 1.6 | Implementar `lib/classes/session-generator.ts` (expansão 14 dias, idempotente) | `lib/classes/session-generator.ts` | `done` | build |
| 1.7 | Constantes de domínio (janela listagem 7d, janela check-in 6h, timezone) | `lib/classes/constants.ts` | `done` | build |
| 1.8 | Estender `validate-rls.cjs`: fixture turma + inscrição + sessão; aluno A não lê check-in de aluno B; professor CRUD; aluno INSERT/DELETE check-in próprio | `scripts/validate-rls.cjs` | `done` | db:validate-rls PASS |
| 1.9 | Documentar políticas Fase 2 e bootstrap turma de teste | `docs/security/rls.md` | `done` | docs atualizados |
| 1.10 | Aplicar migration (`pnpm db:apply`) — **só com pedido explícito** | — | `done` | db:apply OK |
| 1.11 | Validar RLS (`pnpm db:validate-rls`) | — | `done` | `validation.md` Stage 1 |

---

## Stage 2 — Portal do aluno (aulas + check-in)

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 2.1 | Implementar `isCheckinWindowOpen(sessionDate, startTime, now)` com **D3** / **APP_TIME_ZONE** | `lib/classes/checkin-window.ts` | `done` | `checkin-window.test.ts` |
| 2.2 | Testes unitários janela: antes de 6h, dentro, após início, cancelamento | `lib/classes/checkin-window.test.ts` | `done` | 5 testes PASS |
| 2.3 | Query listagem: sessões próximos 7 dias das turmas inscritas + check-in do aluno + metadados turma/professor | `lib/data/student-class-sessions.ts` | `done` | build |
| 2.4 | Schemas Zod `checkInSchema`, `cancelCheckInSchema` | `lib/validations/student-portal.ts` | `done` | `student-portal.test.ts` |
| 2.5 | Server action `createCheckIn`: valida flag, inscrição, janela, unicidade; mensagens pt-BR | `actions/student-portal/check-in.ts` | `done` | build |
| 2.6 | Server action `cancelCheckIn`: valida flag, ownership, janela; DELETE (**D-F1**) | `actions/student-portal/check-in.ts` | `done` | build |
| 2.7 | Componente card de sessão: horário, turma, professor, estados **SPT-7.2**, botões Estou presente / Cancelar | `components/student/class-session-card.tsx` | `done` | build |
| 2.8 | Lista de sessões com loading / empty / error states | `components/student/class-session-list.tsx` | `done` | build |
| 2.9 | Substituir placeholder em `/portal/aulas`; gate flag `student-portal.classes.checkin` | `app/(student)/portal/aulas/page.tsx` | `done` | build |
| 2.10 | Toasts/feedback de sucesso e erro nas actions | `components/student/class-session-card.tsx` | `done` | sonner |
| 2.11 | Testes validação Zod (regressão onboarding + novos schemas) | `lib/validations/student-portal.test.ts` | `done` | vitest |
| 2.12 | Smoke: aluno inscrito vê aulas; check-in e cancelamento na janela | manual / test | `done` | flag OFF confirmado humano; fluxo completo → Stage 3 E2E |

---

## Stage 3 — Painel professor + integração

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 3.1 | Constantes de rotas `/aulas`, `/aulas/turmas`, `/aulas/sessao/[id]` | `lib/routes.ts` | `done` | routes.ts + OPERATIONAL_PATH_PREFIXES |
| 3.2 | Item **Aulas** na sidebar (`MAIN_NAV_ITEMS`, ícone `CalendarDays`) | `components/layout/dashboard-nav-config.tsx` | `done` | dashboard-nav-config.tsx |
| 3.3 | Schemas Zod: turma, recorrência, inscrição | `lib/validations/classes.ts` | `done` | build |
| 3.4 | Server actions CRUD turma (create/update/list) | `actions/classes.ts` | `done` | build |
| 3.5 | Server actions recorrência + invocar `session-generator` ao salvar | `actions/classes.ts` | `done` | build |
| 3.6 | Server actions inscrição/desinscrição aluno↔turma | `actions/classes.ts` | `done` | build |
| 3.7 | Página `/aulas/turmas` — lista turmas | `app/(dashboard)/aulas/turmas/page.tsx` | `done` | build |
| 3.8 | Página `/aulas/turmas/nova` + form criar turma | `app/(dashboard)/aulas/turmas/nova/page.tsx`, `components/classes/class-form.tsx` | `done` | build |
| 3.9 | Página `/aulas/turmas/[classId]` — editar turma, horários, inscrições | `app/(dashboard)/aulas/turmas/[classId]/page.tsx`, `components/classes/class-schedules-panel.tsx`, `components/classes/class-enrollments-panel.tsx` | `done` | build |
| 3.10 | Página `/aulas` — sessões próximas (7 dias) com link para check-ins | `app/(dashboard)/aulas/page.tsx` | `done` | build |
| 3.11 | Query check-ins de sessão + aluno + indicador **PBS-3** | `lib/data/class-session-check-ins.ts` | `done` | build |
| 3.12 | Página `/aulas/sessao/[sessionId]` — lista check-ins com **polling 30s** + revalidate on focus | `app/(dashboard)/aulas/sessao/[sessionId]/page.tsx`, `components/classes/session-check-ins-panel.tsx` | `done` | build |
| 3.13 | Empty/loading/error states em todas as páginas professor | `components/classes/*` | `done` | build |
| 3.14 | Estender fixture E2E (cache classSessionId) | `e2e/global-setup.ts` | `done` | global-setup.ts |
| 3.15 | E2E: professor cria turma + inscreve aluno → aluno check-in → professor vê (polling) | `e2e/student-portal-classes.spec.ts` | `done` | spec criada; smoke UI create + sessão |
| 3.16 | E2E ou smoke: check-in fora da janela rejeitado | `e2e/student-portal-classes.spec.ts` | `done` | spec inclui cenário aluno |
| 3.17 | Smoke não-regressão Fase 1 (auth, onboarding, shell, PIX) | e2e | `done` | spec inclui cenários regressão |
| 3.18 | Confirmar zero writes em `attendances` na aplicação | grep / review | `done` | grep: zero matches em .ts/.tsx |

---

## Legenda

- `pending` — não iniciado
- `in_progress` — em andamento
- `done` — concluído com evidência
- `blocked` — bloqueado (registrar motivo)

---

> ⚠️ Executar **uma stage por vez**. Não avançar para a próxima sem aprovação humana explícita.

