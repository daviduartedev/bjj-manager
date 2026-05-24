# implementation-notes.md — Medium Cycle

## Cycle: 0524-student-portal-schema

---

## Garantia: SQL do cycle não altera dados de produção

Os ficheiros **`db/migrations/009_student_portal_phase1.sql`**, **`db/schema.sql`** (definições) e **`db/policies.sql`** contêm **apenas DDL e políticas**:

- `CREATE TYPE`, `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`
- `CREATE OR REPLACE FUNCTION`, `DROP/CREATE POLICY`
- **Sem** `UPDATE`, `INSERT`, `DELETE`, `TRUNCATE` ou backfill em linhas existentes

`profiles.role` recebe default `professor` via metadado de coluna (comportamento existente preservado). `students.user_id` permanece `NULL` até provisionamento explícito (app ou SQL manual).

**Atenção separada:** `pnpm db:apply` também executa `db/seed.sql` (conta dev fixa) e `scripts/validate-rls.cjs` pode criar fixture **só** com marcadores `RLS-V-*` quando `E2E_STUDENT_EMAIL` está definido — não correr validate contra produção com emails reais.

---

## Ordem de deploy recomendada

1. Aplicar migration + policies (`pnpm db:apply` **ou** colar `009_*.sql` + `policies.sql` no SQL Editor — **pedido explícito**).
2. Confirmar `pnpm db:validate-rls` verde (contas E2E dedicadas).
3. Retomar validação Stage 2 do cycle `0524-student-portal-auth`.
4. Activar `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED=true` em produção **apenas** após schema + auth validados.

---

## Rollback (forward-only)

Este cycle **não** inclui migration `down`. Mitigação manual se necessário:

1. Restaurar snapshot Supabase (recomendado em produção).
2. Reverter `db/policies.sql` para versão anterior e recriar políticas legadas.
3. Colunas nullable podem permanecer; remover só se rollback completo:
   - `ALTER TABLE students DROP COLUMN IF EXISTS user_id, portal_terms_accepted_at, guardian_email;`
   - `ALTER TABLE profiles DROP COLUMN IF EXISTS role;`
   - `DROP TYPE IF EXISTS public.profile_role;`

---

## Bootstrap aluno (provisionamento manual)

Ver `docs/security/rls.md` — secção **Bootstrap aluno**. Usar UUIDs reais da academia; nunca scripts genéricos em produção sem filtrar por `id`/`account_id`.

---

## Notas de execução (2026-05-24)

- Migration `009_student_portal_phase1.sql` criada com cabeçalho explícito anti-DML.
- `current_profile_role()` devolve `professor` quando perfil ausente (fail-safe).
- `validate-rls.cjs`: testes student **opcionais** via `E2E_STUDENT_EMAIL`; skip se perfil existir noutra conta ou `display_name` não for prefixo `RLS-`.
- **`pnpm db:apply` e `pnpm db:validate-rls` não executados** nesta sessão (aguardam pedido explícito / ambiente E2E).
- **Fix apply (2026-05-24):** índices `students.user_id` removidos da secção de indexes em `schema.sql` — em bases existentes `CREATE TABLE IF NOT EXISTS` não adiciona colunas novas; índices ficam só em `009_*.sql` (mesmo padrão que `008_student_lifecycle.sql`). `pnpm db:apply` concluiu com sucesso após o fix.
