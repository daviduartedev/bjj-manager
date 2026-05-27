# Stage Summary — Stage 3: Histórico de presença (SPR-12, SPT-13)

## Cycle: 0524-visual-mobile-attendance-onboarding
## Data de fechamento: 2026-05-24

## O que foi entregue

Histórico paginado de **presenças oficiais** (`attendances` only): aba **Presença** no perfil do aluno (**SPR-12**) e rota **`/portal/presenca`** para o aluno (**SPT-13**); paginação 20/página; RLS SELECT para aluno; nav **Presença** no portal.

## Tasks concluídas

| # | Descrição | Status |
|---|---|---|
| 3.1 | Query paginada attendances | done |
| 3.2 | `STUDENT_ATTENDANCE_PAGE_SIZE = 20` | done |
| 3.3 | Aba Presença no perfil | done |
| 3.4 | Paginação mobile-first | done |
| 3.5 | Rota `/portal/presenca` | done |
| 3.6 | Nav + `ROUTES.portalPresenca` | done |
| 3.7 | RLS aluno SELECT | done |
| 3.8 | Empty states pt-BR | done |
| 3.9 | lint + type-check | done |
| 3.10 | Validação manual documentada | done |
| 3.11 | Update spec SPR-12, SPT-13, SHELL | done |

## Arquivos criados / modificados

### Criados
- `lib/constants/classes.ts`
- `lib/data/student-attendances.ts`
- `components/attendance/attendance-history-panel.tsx`
- `components/students/student-attendance-tab.tsx`
- `components/student/student-attendance-list.tsx`
- `app/(student)/portal/presenca/page.tsx`
- `app/(student)/portal/presenca/loading.tsx`
- `db/migrations/011_attendances_student_select.sql`

### Modificados
- `app/(dashboard)/alunos/[id]/page.tsx`
- `components/students/student-profile-client.tsx`
- `components/student/student-nav.tsx`
- `lib/routes.ts`
- `db/policies.sql`
- `spec/features/student-profile/readme.md`
- `spec/features/student-portal/readme.md`
- `spec/features/app-shell/readme.md`

## Validação

| Comando | Resultado |
|---------|-----------|
| Lint | PASS |
| Typecheck | PASS |
| Testes | N/A |
| Build | N/A |

## Cenários validados

| Cenário | Status |
|---------|--------|
| Professor vê total + histórico no perfil | PASS (código) |
| Empty state sem presenças | PASS (código) |
| Paginação Anterior/Próxima | PASS (código) |
| Aluno vê `/portal/presenca` próprio | PASS (código + RLS) |
| Check-ins não entram no total | PASS (query só attendances) |

## Decisões técnicas relevantes

- Componente partilhado `AttendanceHistoryPanel` para professor e portal.
- Ordenação por `session_date` / `start_time` via `foreignTable` Supabase.
- Migration `011` para política `attendances_student_select`.

## Tech debt identificado

- Checklist browser §3.10 pendente de sign-off humano.
- Migration `011` não aplicada em ambiente remoto (DDL criado; aplicar quando aprovado).

## Bloqueios para a próxima stage

- Nenhum — Stage 4 (provisionamento login) é independente.

## Próxima stage

- **Stage 4:** Criar aluno + provisionar login (STU-12.5+, AUTH-8.4+) — aguardando aprovação humana
