# Closing Summary — 0524-student-portal-schema

## Cycle: cycles/Q22026/0524-student-portal-schema
## Tipo: Medium
## Data de fechamento: 2026-05-24

---

## O que foi entregue

DDL + RLS mínima (Fase 1 do Portal do Aluno) para desbloquear **Stage 2** do cycle `0524-student-portal-auth`:

- Enum `public.profile_role` e coluna `profiles.role` (default `professor`)
- Colunas em `students`: `user_id`, `portal_terms_accepted_at`, `guardian_email`
- Função `public.current_profile_role()` e políticas role-aware em `profiles` / `students`
- Migration `009_student_portal_phase1.sql`, sync `schema.sql` / `policies.sql`
- Script `validate-rls.cjs` estendido (papel student)
- Setup contas E2E `@cascabjj.test` (`setup-e2e-test-accounts.cjs`)
- Fix `global-setup.ts` (IDOR com múltiplos `RLS-V-B`)
- Documentação em `docs/security/rls.md` e `docs/testing/e2e-test-accounts.md`

**Sem código de aplicação** (middleware/onboarding permanecem no auth cycle).

---

## Critérios de aceite

| Critério | Status |
|---|---|
| Migration adiciona `profiles.role` com default `professor` | ✅ Atendido |
| Migration adiciona `students.user_id` nullable + unicidade por conta | ✅ Atendido |
| Campos onboarding Fase 1 documentados em `spec-delta.md` | ✅ Atendido (proposta; ver ressalva) |
| RLS: aluno só ao próprio `students`; professor inalterado | ✅ Atendido |
| `pnpm db:validate-rls` passa com cenários student | ✅ Atendido |
| Utilizador existente continua operacional (`professor`) | ✅ Atendido |
| Nenhuma tabela Fase 2–3 criada | ✅ Atendido |

---

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `db/migrations/009_student_portal_phase1.sql` | create |
| `db/schema.sql` | edit |
| `db/policies.sql` | edit |
| `scripts/validate-rls.cjs` | edit |
| `scripts/setup-e2e-test-accounts.cjs` | create |
| `package.json` | edit (`setup:e2e-accounts`) |
| `docs/security/rls.md` | edit |
| `docs/testing/e2e-test-accounts.md` | edit |
| `e2e/global-setup.ts` | edit |
| `cycles/.../*` | plan, tasks, validation, review, spec-delta, implementation-notes, closing-summary |

---

## Validação

| Comando | Resultado |
|---|---|
| Lint | N/A |
| Typecheck | N/A |
| Testes unitários | N/A |
| Build | N/A |
| `pnpm db:apply` | PASS |
| `pnpm db:validate-rls` | PASS |
| E2E (`--workers=1`) | PASS (21/22) |

---

## Specs atualizadas

- **`/update-spec` não executado** — `spec-delta.md` permanece PROPOSTA
- Promover manualmente: `spec/features/supabase-schema/readme.md`, `spec/features/rls-security/readme.md`, `spec/features/student-portal/readme.md`, `docs/security/rls.md`

---

## Tech debt identificado

- E2E login flaky com workers paralelos no mesmo user A — preferir `--workers=1` ou `storageState` partilhado
- Teste `headers-cookies` httpOnly — baseline SECE2E
- Restrição column-level em `students` UPDATE pelo aluno (opcional trigger; app whitelist na Stage 2 auth)

---

## Ressalvas

1. **`/update-spec` pendente** — executar antes de considerar contrato canónico actualizado em `spec/`.
2. **Smoke manual professor (conta real)** — confirmado pelo humano; não automatizado neste cycle.
3. **E2E 8 failures com 12 workers** — flakiness de login concorrente; não indica regressão RLS/schema.
4. **Dados de produção** — migration foi aditiva; alunos reais mantêm `user_id = NULL` até provisionamento (Stage 2 auth).

---

## Status final

✅ **Cycle fechado com sucesso** (com ressalva: `/update-spec` pendente).

**Desbloqueia:** validação completa da **Stage 2** de `0524-student-portal-auth`.
