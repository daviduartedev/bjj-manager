# Contas de teste E2E e RLS (Casca)

Utilizadores **distintos** do professor real em produção. Os segredos ficam **só** em `.env.test` ou secrets do CI (nunca no Git).

## Papéis

| Variável | Função |
|----------|--------|
| **`E2E_USER_A_EMAIL` / `E2E_USER_A_PASSWORD`** | Conta da **academia A** (fluxo normal: `/painel`, `/alunos`, `/mensalidades`, `/configuracoes`, login, logout, XSS, inputs inválidos). |
| **`E2E_USER_B_EMAIL`** | Conta da **academia B** (tenant diferente). Usada com JWT do utilizador A em testes **IDOR** e REST; a password pode ser a mesma que A em ambientes descartáveis (`VALIDATION_TEST_PASSWORD` / `E2E_USER_A_PASSWORD` no CI). |
| **`E2E_SUPABASE_*` / `DATABASE_URL`** | Projeto Supabase e Postgres **de teste ou staging**, alinhados com as mesmas variáveis `NEXT_PUBLIC_*` que o Next usa em dev. |

## Provisionamento recomendado

1. Crie um projeto Supabase (ou schema) **só para testes**.
2. Copie [`.env.test.example`](../../.env.test.example) para **`.env.test`** na raiz (ficheiro ignorado pelo Git) e preencha emails e passwords **gerados para teste** (ex.: `casca-e2e-a+<suffix>@seudominio.test`).
3. Rode **`pnpm db:apply`** (ou schema + seed + migrations + policies) contra esse Postgres.
4. Rode **`pnpm db:validate-rls`** com `VALIDATION_TEST_PASSWORD` ou `E2E_USER_A_PASSWORD` definido: o script cria ou sincroniza os utilizadores Auth A/B, liga `profiles`/`accounts` e garante alunos marcadores **`RLS-V-A`** e **`RLS-V-B`** (ver [`db/e2e-seed-notes.md`](../../db/e2e-seed-notes.md)).
5. Rode **`pnpm test:e2e`** (Playwright usa `.env.test` via `playwright.config.ts`).

## Rotas e superfícies cobertas pela suíte

- **Público:** `/`, `/login`, redirects `/register`, cabeçalhos, cookie baseline.
- **Autenticado (A):** `/painel`, `/alunos` (filtros), `/mensalidades`, fluxos que exigem sessão quando as env estão definidas.
- **Segurança:** IDOR (perfil aluno B com sessão A), REST com anon JWT, logout, XSS em nome de aluno (quando dados de seed existem).

Testes que dependem de credenciais fazem **`test.skip`** quando `E2E_USER_A_EMAIL` / password não estão definidos.

## CI (GitHub Actions)

O workflow [`.github/workflows/e2e-security.yml`](../../.github/workflows/e2e-security.yml) espera secrets: `E2E_DATABASE_URL`, `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY`, `E2E_USER_A_EMAIL`, `E2E_USER_A_PASSWORD`, `E2E_USER_B_EMAIL`. Não armazene passwords reais de produção nestes secrets.
