# Dados de teste E2E / RLS

Guia de contas e rotas: [`docs/testing/e2e-test-accounts.md`](../docs/testing/e2e-test-accounts.md).

O script **`pnpm db:validate-rls`** (ver `scripts/validate-rls.cjs`) garante, via Postgres + Admin API:

- utilizadores **A** e **B** (**obrigatório** definir `E2E_USER_A_EMAIL` e `E2E_USER_B_EMAIL`; não usar emails pessoais em repositório);
- contas `accounts`, linhas `profiles` e alunos marcadores **`RLS-V-A`** e **`RLS-V-B`** por tenant.

A suíte Playwright resolve o UUID do aluno **`RLS-V-B`** em `e2e/global-setup.ts` para cenários **IDOR** e REST.

**Ordem recomendada no CI:** `pnpm db:validate-rls` → `pnpm test:e2e`.

Não aplicar seeds contra bases de produção ou dados reais.
