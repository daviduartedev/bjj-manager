# Stage Summary — Stage 1: Schema e RLS

## Cycle: 0524-student-portal-classes-checkin
## Data de fechamento: 2026-05-24

## O que foi entregue

Fundação de dados **Fase 2** do portal: migration `010_*` com turmas, recorrência, sessões, inscrições, check-ins e `attendances` (preparatória); políticas **SEC-3.7** com helper `current_student_id()`; utilitários `lib/classes/constants.ts` e `session-generator.ts`; fixture e asserts RLS para isolamento aluno/professor; documentação operacional em `docs/security/rls.md`.

Sem UI, actions ou rotas novas — apenas schema, RLS e domínio mínimo.

## Tasks concluídas

| # | Descrição | Status |
|---|---|---|
| 1.1 | Migration `010_student_portal_phase2_classes_checkin.sql` | done |
| 1.2 | Espelho em `db/schema.sql` | done |
| 1.3 | Índices e constraints | done |
| 1.4 | RLS professor (CRUD por conta) | done |
| 1.5 | RLS aluno (check-in próprio; sem `attendances`) | done |
| 1.6 | `lib/classes/session-generator.ts` | done |
| 1.7 | `lib/classes/constants.ts` | done |
| 1.8 | Extensão `validate-rls.cjs` | done |
| 1.9 | `docs/security/rls.md` | done |
| 1.10 | `pnpm db:apply` | done |
| 1.11 | `pnpm db:validate-rls` | done |

## Arquivos criados / modificados

- `db/migrations/010_student_portal_phase2_classes_checkin.sql` — create
- `db/schema.sql` — edit
- `db/policies.sql` — edit (`current_student_id()` + políticas Fase 2)
- `lib/classes/constants.ts` — create
- `lib/classes/session-generator.ts` — create
- `scripts/validate-rls.cjs` — edit
- `docs/security/rls.md` — edit
- `cycles/.../tasks.md`, `validation.md`, `review.md`, `implementation-notes.md` — edit

## Validação

- Lint: PASS
- Typecheck: PASS
- Testes: PASS (170)
- Build: PASS
- `pnpm db:apply`: PASS
- `pnpm db:validate-rls`: PASS

## Cenários validados

- RLS isolamento check-ins entre alunos: PASS
- Professor CRUD/leitura turmas da conta: PASS
- Aluno INSERT check-in próprio: PASS
- Aluno bloqueado em `attendances`: PASS
- Baseline Fase 1 (`profiles`, `students`): PASS
- Anon zero linhas em `classes`: PASS

## Decisões técnicas relevantes

- Helper `current_student_id()` para políticas de aluno
- Check-in cancelável via DELETE (sem `cancelled_at`)
- `attendances` DDL-only neste cycle — zero writes na app
- `day_of_week` ISO 8601 (1=seg … 7=dom)
- Gerador de sessões como função pura; persistência nas Stages 2–3

## Tech debt identificado

- Testes unitários para `session-generator.ts` (opcional, não bloqueante)
- Testes RLS student omitidos se `E2E_STUDENT_EMAIL` ausente — documentar no env de CI

## Bloqueios para a próxima stage

- Nenhum — DDL e RLS prontos para Stage 2 (portal aluno)

## Próxima stage

- **Stage 2:** Portal do aluno (aulas + check-in) — aguardando aprovação humana → `/map-stage`
