# Tasks — Ciclo 05: RLS e segurança

Checklist executável. **Ao concluir a implementação, atualizar features em `spec/features/`** e manter `spec/product/` + `docs/product/` alinhados quando o contrato de produto mudar.

## Spec e rastreabilidade

- [x] Consolidar decisões do refino em [`plan.md`](./plan.md).
- [x] Registrar cenários de negócio em [`scenarios.feature`](./scenarios.feature).
- [x] Atualizar hub [`spec/features/rls-security/readme.md`](../../../spec/features/rls-security/readme.md) e entrada em [`spec/README.md`](../../../spec/README.md).
- [x] Atualizar [`spec/features/supabase-schema/readme.md`](../../../spec/features/supabase-schema/readme.md) (RLS já não é “próximo ciclo”).
- [x] Incluir **SPEC-11.x** em [`spec/product/spec.md`](../../../spec/product/spec.md) e espelhar em [`docs/product/spec.md`](../../../docs/product/spec.md).
- [x] Redigir [`docs/security/rls.md`](../../../docs/security/rls.md) (políticas em prosa, bootstrap `maikon@aslam.com.br`, validação dois utilizadores, **sem passwords** no git).

## SQL e tooling

- [x] Implementar [`db/policies.sql`](../../../db/policies.sql): `public.current_account_id()`, `ENABLE ROW LEVEL SECURITY`, políticas por tabela conforme plano (incl. `student_plans` com plano e aluno na mesma conta).
- [x] Estender [`scripts/apply-db.cjs`](../../../scripts/apply-db.cjs) para aplicar `policies.sql` após `seed.sql` e mensagem de sucesso clara.
- [x] Atualizar [`db/rls-next-cycle.sql`](../../../db/rls-next-cycle.sql) para referir que o template foi **substituído** por `policies.sql` (evitar duplicar verdade).

## Validação (produção Supabase)

- [x] Criar utilizador Auth `maikon@aslam.com.br` no dashboard (password forte definida aí; **rodar** após primeiro login).
- [x] Executar SQL de bootstrap de `accounts` + `profiles` (ver `docs/security/rls.md`) como role **postgres**, ligando `auth.users.id` à conta certa.
- [x] Criar segundo utilizador **B** + conta + perfil; confirmar **A não vê dados de B** em consultas via anon key / cliente com JWT de A (Table Editor ou SQL como cada utilizador).
- [x] Confirmar **`anon`** zero linhas em tabelas com `account_id` e em `belts`.
- [x] Tentativa de `INSERT` com `account_id` alheio (como `authenticated`) **falha** no Postgres.

**Automatização:** `pnpm db:validate-rls` — requer `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; **`VALIDATION_TEST_PASSWORD`** para criar utilizadores em falta e para testes JWT (script alinha a senha dos dois emails via Admin API quando definida).
