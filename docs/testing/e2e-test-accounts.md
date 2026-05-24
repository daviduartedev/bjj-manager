# Contas de teste E2E e RLS (Casca)

Utilizadores **distintos** do professor real em produção. Os segredos ficam **só** em `.env.test` ou secrets do CI (nunca no Git).

## Papéis

| Variável | Função |
|----------|--------|
| **`E2E_USER_A_EMAIL` / `E2E_USER_A_PASSWORD`** | Conta da **academia A** (fluxo normal: `/painel`, `/alunos`, `/mensalidades`, `/configuracoes`, login, logout, XSS, inputs inválidos). |
| **`E2E_USER_B_EMAIL`** | Conta da **academia B** (tenant diferente). Usada com JWT do utilizador A em testes **IDOR** e REST; a password pode ser a mesma que A em ambientes descartáveis (`VALIDATION_TEST_PASSWORD` / `E2E_USER_A_PASSWORD` no CI). |
| **`E2E_SUPABASE_*` / `DATABASE_URL`** | Projeto Supabase e Postgres **de teste ou staging**, alinhados com as mesmas variáveis `NEXT_PUBLIC_*` que o Next usa em dev. |

## Provisionamento recomendado

1. Garanta `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `DATABASE_URL` em **`.env.local`** (projeto de teste/staging — **não** emails de produção).
2. Rode **`pnpm setup:e2e-accounts`** — cria utilizadores Auth `@cascabjj.test` (prof A, prof B, student) e grava `E2E_*` + `VALIDATION_TEST_PASSWORD` em `.env.local` e `.env.test`.
3. Rode **`pnpm db:apply`** se o schema ainda não estiver aplicado.
4. Rode **`pnpm db:validate-rls`** — liga `profiles`/`accounts` e alunos marcadores **`RLS-V-*`** (não altera alunos reais).
5. Rode **`pnpm test:e2e`** (Playwright usa `.env.test` via `playwright.config.ts`).

Emails por defeito do setup (substituíveis via env antes de correr o script):

| Variável | Email |
|----------|--------|
| `E2E_USER_A_EMAIL` | `casca-e2e-prof-a@cascabjj.test` |
| `E2E_USER_B_EMAIL` | `casca-e2e-prof-b@cascabjj.test` |
| `E2E_STUDENT_EMAIL` | `casca-e2e-student@cascabjj.test` |

## Rotas e superfícies cobertas pela suíte

- **Público:** `/`, `/login`, redirects `/register`, cabeçalhos, cookie baseline.
- **Autenticado (A):** `/painel`, `/alunos` (filtros), `/mensalidades`, fluxos que exigem sessão quando as env estão definidas.
- **Segurança:** IDOR (perfil aluno B com sessão A), REST com anon JWT, logout, XSS em nome de aluno (quando dados de seed existem).

Testes que dependem de credenciais fazem **`test.skip`** quando `E2E_USER_A_EMAIL` / password não estão definidos.

## CI (GitHub Actions)

O workflow [`.github/workflows/e2e-security.yml`](../../.github/workflows/e2e-security.yml) espera secrets: `E2E_DATABASE_URL`, `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY`, `E2E_USER_A_EMAIL`, `E2E_USER_A_PASSWORD`, `E2E_USER_B_EMAIL`. Não armazene passwords reais de produção nestes secrets.
