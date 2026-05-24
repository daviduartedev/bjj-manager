# plan.md — Medium Cycle

## Cycle: 0524-student-portal-schema
## Gerado em: 2026-05-24

---

## Resumo do plano

Entregar **DDL + RLS mínima (Fase 1)** para desbloquear validação da Stage 2 do cycle `0524-student-portal-auth`:

1. Enum `public.profile_role` (`professor` | `student`) e coluna `profiles.role` (default `professor`).
2. Colunas em `public.students`: `user_id` (FK → `auth.users`, nullable), `portal_terms_accepted_at`, `guardian_email`.
3. Função auxiliar `public.current_profile_role()` (padrão `current_account_id()`).
4. Políticas RLS role-aware em `profiles` e `students` (**SEC-3.7** parcial); professor inalterado em CRUD operacional.
5. Sincronizar `db/schema.sql`, `db/policies.sql`, migration `009_*`, `scripts/validate-rls.cjs` e `docs/security/rls.md`.

**Sem código de aplicação** neste cycle. `pnpm db:apply` só com pedido explícito durante `/execute-cycle`.

---

## Decisões tomadas no refine

| # | Tema | Decisão | Motivo |
|---|---|---|---|
| D-S1 | Campos de onboarding | **Colunas em `students`** (`portal_terms_accepted_at`, `guardian_email`) | Alinha **SPT-10.3**, decisão D2 (mesma entidade), evita JOIN extra na Fase 1; auth cycle já assume extensão de `students`. |
| D-S2 | Tipo de `profiles.role` | **Enum Postgres `public.profile_role`** | Convenção do repo (`belt_kind`, `student_kind`, `lesson_plan_status`); type-safety e documentação no schema. |
| D-S3 | UPDATE `students` pelo aluno | **Read-only na linha excepto onboarding** | RLS: aluno `SELECT`/`UPDATE` só quando `students.user_id = auth.uid()`; restrição de colunas no **app** (whitelist em `actions/student-portal/onboarding.ts` no auth cycle). Postgres não tem column-RLS nativo. |
| D-S4 | Rollback | **Forward-only** (como migrations 001–008) | Sem `down` no repo; mitigação documentada em `implementation-notes.md` (reverter `policies.sql`, drop manual se necessário). |
| D-S5 | FK `students.user_id` ON DELETE | **`SET NULL`** | Cadastro operacional do aluno sobrevive à remoção do utilizador Auth; distinto de `profiles.user_id` (CASCADE 1:1). |
| D-S6 | Unicidade `user_id` | **Índice único parcial** `(account_id, user_id) WHERE user_id IS NOT NULL` | **SPT-2.3** — um auth user por conta no máximo. |
| D-S7 | Nome do timestamp de termo | **`portal_terms_accepted_at`** | Distingue termo do portal de documentos/termos de responsabilidade (**DOC-**); request e auth cycle referem variantes — canonical neste cycle. |
| D-S8 | Detecção de papel nas policies | **`public.current_profile_role()`** STABLE SECURITY DEFINER | Mesmo padrão que `current_account_id()`; evita subqueries repetidas e facilita testes RLS. |

---

## Arquivos afetados

| Arquivo | Tipo de mudança | Motivo |
|---|---|---|
| `db/migrations/009_student_portal_phase1.sql` | create | DDL idempotente para bases existentes |
| `db/schema.sql` | edit | Greenfield: enum, colunas, índices, constraints |
| `db/policies.sql` | edit | `current_profile_role()`, políticas `profiles`/`students` role-aware |
| `scripts/validate-rls.cjs` | edit | Cenários papel `student`: isolamento, UPDATE onboarding, professor inalterado |
| `docs/security/rls.md` | edit | Resumo de políticas Fase 1 + bootstrap aluno de teste |
| `cycles/.../implementation-notes.md` | create | Rollback forward-only, ordem de deploy |
| `cycles/.../spec-delta.md` | create | Proposta para `spec/features/supabase-schema`, `rls-security`, `student-portal` |

---

## Dependências e ordem de execução

1. **Migration 009** — enum + colunas + índices/constraints (sem policies ainda, para não quebrar RLS existente mid-flight).
2. **`db/schema.sql`** — espelhar DDL para installs greenfield.
3. **`db/policies.sql`** — função `current_profile_role()`; substituir políticas monolíticas de `profiles` SELECT e `students` ALL por políticas condicionadas ao papel.
4. **`scripts/validate-rls.cjs`** — fixture aluno (role `student`, `user_id` ligado) + asserts.
5. **`docs/security/rls.md`** — documentação operacional.
6. **`pnpm db:apply`** (pedido explícito) → **`pnpm db:validate-rls`** → evidência em `validation.md`.

**Pré-requisito:** cycle `0524-student-portal-auth` Stage 1 concluída (código assume colunas; não bloqueia DDL).

**Desbloqueia:** tasks `blocked` da Stage 2 auth (`validation.md` — cenários com `profiles.role` / `students.user_id`).

---

## Specs afetadas

- `spec/features/supabase-schema/readme.md` — enum `profile_role`, colunas `students` Fase 1
- `spec/features/rls-security/readme.md` — **SEC-3.7** parcial implementada (`profiles`, `students`)
- `spec/features/student-portal/readme.md` — **SPT-10.3–10.4** DDL concretizado
- `spec/features/authentication/readme.md` — nota de que **AUTH-8** depende deste schema (referência cruzada)
- `docs/security/rls.md` — tabela resumo e bootstrap aluno

---

## Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Regressão RLS professor (**SEC-4.1**) | Média | Manter política operacional equivalente a **SEC-3.3**; `validate-rls` existente + novos cenários student |
| Aluno escala privilégios via UPDATE `profiles.role` | Média | WITH CHECK impede mudança de `role` na policy de UPDATE; provisionamento só professor (app) |
| Aluno altera campos operacionais de `students` via API | Média | RLS limita à própria linha; app whitelist onboarding; teste UPDATE campo proibido falha ou é no-op na app |
| Deploy schema antes do código auth | Baixa | Ordem documentada: migration → activar flag portal; auth cycle já preparado |
| `current_profile_role()` NULL (sem profile) | Baixa | Tratar como `professor` (default seguro = sem acesso student-only paths) ou negar student policies |

---

## Fora de escopo (confirmado)

- Tabelas Fase 2–3 (`classes`, `class_sessions`, `check_ins`, `products`, …)
- RLS completa **SEC-3.7** para tabelas ainda inexistentes
- Código app (middleware, onboarding UI, provisionamento)
- Seed de produção / convites Auth
- Alteração de `resolveAuthRole()` (auth cycle — já implementado)

---

## Perguntas abertas

- [ ] **Utilizador de teste student em CI:** reutilizar `E2E_USER_*` ou criar `E2E_STUDENT_EMAIL` dedicado? (Proposta: terceiro user ou sub-fixture na mesma conta A — ver `tasks.md` task 5.)
- [ ] **Texto do termo:** fora deste cycle (auth Stage 2).
