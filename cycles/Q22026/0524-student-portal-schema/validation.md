# validation.md — Medium Cycle

## Cycle: 0524-student-portal-schema
## Data de validação: 2026-05-24

---

## Resultado dos comandos

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | N/A | Cycle DDL-only; sem alterações TS de app |
| `pnpm typecheck` | N/A | — |
| `pnpm test` | N/A | — |
| `pnpm build` | N/A | — |
| `pnpm db:apply` | PASS | 2026-05-24; migration `009_student_portal_phase1.sql` aplicada |
| `pnpm db:validate-rls` | PASS | Cenários professor A/B, student, anon, INSERT cross-account |
| `pnpm test:e2e --workers=1` | PASS* | 21/22; 1 falha baseline (`headers-cookies` httpOnly) |
| `pnpm test:e2e` (12 workers) | FAIL* | 8 timeouts login — flakiness paralela no mesmo user E2E |

---

## Mapeamento scenarios.feature → evidência

| Cenário | Tipo de evidência | Resultado |
|---|---|---|
| Migration adiciona profiles.role com default professor | `db:apply` + migration review | PASS |
| Migration adiciona students.user_id nullable com unicidade por conta | `validate-rls` + migration 009 | PASS |
| Campos de onboarding Fase 1 existem em students | `validate-rls` UPDATE onboarding | PASS |
| Professor continua a ver todos os alunos da própria conta | `validate-rls` | PASS |
| Professor continua a rejeitar INSERT com account_id alheio | `validate-rls` | PASS |
| Aluno lê apenas a própria linha em students | `validate-rls` + `E2E_STUDENT_EMAIL` | PASS |
| Aluno não lê students de outra conta | `validate-rls` | PASS |
| Aluno actualiza campos de onboarding na própria linha | `validate-rls` | PASS |
| Aluno não actualiza linha de outro aluno | `validate-rls` (RLS + 0 rows) | PASS |
| Aluno lê e actualiza apenas o próprio profile | `validate-rls` | PASS |
| Anon continua sem acesso a students e belts | `validate-rls` | PASS |

---

## Revisão estática

| Verificação | Resultado |
|---|---|
| Migration 009 sem UPDATE/INSERT/DELETE | PASS |
| policies.sql sem DML em tabelas de domínio | PASS |
| schema.sql — definições espelham migration 009 | PASS |
| Índices `user_id` só em migration (fix apply bases existentes) | PASS |
| validate-rls — fixture student só marcadores `RLS-V-*` | PASS |

---

## Smoke manual

| Passo | Ação | Resultado esperado | Resultado observado |
|---|---|---|---|
| 1 | Conta professor real — `/alunos` | Lista intacta | PASS (confirmado pelo humano) |
| 2 | E2E prof A — login → `/painel` | Redirect OK | PASS (`test:e2e --workers=1`) |
| 3 | IDOR A vs aluno B | Sem leak `RLS-V-B` | PASS (`idor.spec.ts`) |

---

## Falhas baseline (pré-existentes)

- **`headers-cookies.spec.ts`:** cookies `sb-*` sem flag `httpOnly` visível no Playwright (dev + browser client). Fora do escopo schema; cycle SECE2E/cookie-hardening.

---

## Conclusão

- [x] Todos os cenários de aceite com evidência runtime
- [x] `pnpm db:validate-rls` verde com cenários student incluídos
- [ ] `/update-spec` — **pendente** (promover `spec-delta.md`)
- [x] Pronto para `/close-cycle`
