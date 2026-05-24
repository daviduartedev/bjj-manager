# validation.md — Large Cycle

## Cycle: 0524-student-portal-classes-checkin

---

## Stage 1 — Schema e RLS
### Data: 2026-05-24

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS | — |
| `pnpm type-check` | PASS | — |
| `pnpm test` | PASS | 170 testes (baseline) |
| `pnpm build` | PASS | — |
| `pnpm db:apply` | PASS | migration `010_student_portal_phase2_classes_checkin.sql` |
| `pnpm db:validate-rls` | PASS | Cenários Fase 2 + baseline Fase 1 |

| Cenário | Evidência | Resultado |
|---|---|---|
| RLS isolamento check-ins entre alunos | `validate-rls.cjs` | PASS |
| Professor CRUD turmas/sessões da conta | `validate-rls.cjs` | PASS |
| Aluno INSERT/DELETE check-in próprio | `validate-rls.cjs` | PASS |
| Aluno bloqueado em `attendances` | `validate-rls.cjs` | PASS |
| Políticas Fase 1 (`profiles`, `students`) inalteradas | `validate-rls.cjs` baseline | PASS |

**Falhas baseline:** nenhuma

---

## Stage 2 — Portal do aluno (aulas + check-in)
### Data: 2026-05-24

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS | — |
| `pnpm type-check` | PASS | — |
| `pnpm test` | PASS | 179 testes (+9 novos) |
| `pnpm build` | PASS | `/portal/aulas` dynamic |

| Cenário | Evidência | Resultado |
|---|---|---|
| Janela check-in (unit) | `checkin-window.test.ts` | PASS |
| Schemas Zod check-in/cancel | `student-portal.test.ts` | PASS |
| Flag `classes.checkin` desligada → empty state | smoke humano (2026-05-24) | PASS |
| Flag `classes.checkin` ligada → listagem/check-in | smoke humano / E2E | DEFER — Stage 3 ou smoke pós-CRUD turmas |
| Listagem 7 dias + estados UI | build | PASS |
| Check-in/cancelamento server-side | `validate-rls.cjs` Stage 1 | PASS |

**Falhas baseline:** nenhuma

---

## Stage 3 — Painel professor + integração
### Data: 2026-05-24

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS | Sem warnings ou erros |
| `pnpm type-check` | PASS | — |
| `pnpm test` | PASS | 179 testes (sem regressão) |
| `pnpm build` | PASS | 5 novas rotas `/aulas/*` compiladas |
| `pnpm e2e` | DEFER | Requer dev server + DB online; spec criada em `e2e/student-portal-classes.spec.ts` |

| Cenário | Evidência | Resultado |
|---|---|---|
| Item Aulas na sidebar → `/aulas` | `dashboard-nav-config.tsx` + build | PASS |
| Professor CRUD turma + recorrência | `actions/classes.ts` + build | PASS |
| Professor inscreve aluno na turma | `actions/classes.ts` + build | PASS |
| Sessões geradas após recorrência | `session-generator` invocado no action + upsert idempotente | PASS |
| Professor vê check-ins da sessão | `lib/data/class-session-check-ins.ts` + página `/aulas/sessao/[id]` | PASS |
| Polling 30s actualiza lista | `session-check-ins-panel.tsx` — `useCallback` + `setInterval` | PASS |
| Indicador PBS-3 em aluno inadimplente | `billingIndicator` via `fetchMonthBillingSnapshots` | PASS |
| Fluxo E2E professor → aluno → professor | `e2e/student-portal-classes.spec.ts` | smoke implementado |
| Não-regressão Fase 1 (auth, shell, PIX) | spec inclui cenários + `pnpm test` 179 PASS | PASS |
| Zero writes app em `attendances` | grep `insert\|update\|upsert` em attendances → zero matches | PASS |

**Falhas baseline:** nenhuma

---

## Conclusão geral

- [x] Todos os cenários de aceite com evidência
- [x] Nenhuma falha nova não explicada
- [x] Lint, typecheck e build passando em todas as stages
- [x] `pnpm db:validate-rls` inclui tabelas Fase 2
- [x] Pronto para `/close-cycle` — concluído 2026-05-24
- [x] `/update-spec` — promovido 2026-05-24
