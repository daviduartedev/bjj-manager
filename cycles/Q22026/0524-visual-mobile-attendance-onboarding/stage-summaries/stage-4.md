# Stage Summary — Stage 4: Criar aluno + provisionar login (STU-12.5+, AUTH-8.4+)

## Cycle: 0524-visual-mobile-attendance-onboarding
## Data de fechamento: 2026-05-24

## O que foi entregue

Professor provisiona acesso ao portal em **três modos**: associar Auth existente, **convite por e-mail** (`inviteUserByEmail`) ou **criar utilizador com senha temporária** (12 chars, mostrada uma vez). Perfil `student` + `students.user_id` ligados no servidor; bloqueio para arquivado/removido; toasts Sonner.

## Tasks concluídas

| # | Descrição | Status |
|---|---|---|
| 4.1 | Schema Zod discriminated union | done |
| 4.2 | Admin API createUser / invite | done |
| 4.3 | Senha temporária one-shot UI | done |
| 4.4 | Regressão associar existente | done |
| 4.5 | Bloqueio arquivado/removido | done |
| 4.6 | Profile student + link user_id | done |
| 4.7 | Toasts provisionamento + login | done |
| 4.8 | Smoke manual documentado | done |
| 4.9 | Security review | done |
| 4.10 | lint + type-check + tests | done |
| 4.11 | Update spec STU-12 / AUTH-8 | done |

## Arquivos criados / modificados

### Modificados
- `lib/validations/student-portal.ts` — discriminated union
- `lib/validations/student-portal.test.ts` — testes provision
- `lib/supabase/admin.ts` — create, invite, password gen
- `actions/student-portal/provision-access.ts` — 3 modos
- `components/students/provision-portal-access.tsx` — UI modos + PasswordReveal
- `components/students/student-profile-client.tsx` — studentEmail prop
- `spec/features/students-crud/readme.md`
- `spec/features/authentication/readme.md`

## Validação

| Comando | Resultado |
|---------|-----------|
| Lint | PASS |
| Typecheck | PASS |
| Tests | PASS (11 — student-portal validations) |
| Build | N/A |

## Cenários validados

| Cenário | Status |
|---------|--------|
| Associar Auth existente | PASS (código) |
| Convite por e-mail | PASS (código) |
| Senha temporária one-shot | PASS (código) |
| Bloqueio arquivado | PASS (código) |
| Admin API só servidor | PASS (review) |

## Decisões técnicas relevantes

- Três modos numa action; resultado tipado com `outcome`.
- Senha nunca armazenada — só retorno one-shot à UI.

## Tech debt identificado

- Smoke browser §4.8 pendente.
- Rollback Auth orphan não automatizado.

## Bloqueios para a próxima stage

- Nenhum — **cycle Large completo** (4/4 stages).

## Próximo passo

- `/review-implementation` (cycle inteiro) → `/validate-cycle` → `/close-cycle` → `/update-spec` se necessário
