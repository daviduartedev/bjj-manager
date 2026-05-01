# Checklist de teste manual — Plans & Billing Model (12-0430)

Use após `pnpm dev` com `.env.local` e base aplicada (`pnpm db:apply`).

## Automatizado

- `pnpm lint`
- `pnpm type-check`
- `pnpm test` — inclui `lib/billing/get-effective-price.test.ts`, `lib/validations/billing.test.ts` (fuso SP já coberto em `lib/dates/dates.test.ts` para **`toCalendarDateStringInAppTZ`**)

## Provisão de planos

- [ ] Conta **sem** linhas em `plans` (ex.: nova conta só com auth + profile): ao abrir qualquer rota sob `/painel` / `(dashboard)`, surgem **três** planos com preços **10000 / 12000 / 12000** centavos (Kids 1 / Kids 2 / Adulto).

## updatePlanPrice

- [ ] Chamar a Server Action (ex.: temporariamente a partir de um snippet ou da consola de rede) com `planId` válido e `priceCents` ≥ 0 persiste e lista de planos na UI de alunos reflecte o novo preço quando relevante.

## setStudentPlan / histórico

- [ ] Associar ou alterar plano de um aluno **duas vezes** com o **mesmo** `plan_id`: existem **duas** linhas históricas fechadas + uma aberta (ou equivalente), não apenas um `UPDATE` in-place da mesma linha.

## Plano inativo

- [ ] Com um plano `active = false` na base, `setStudentPlan` com esse `planId` devolve erro **específico** (plano inativo), não mensagem vaga.

## RLS / outra conta

- [ ] UUID de aluno ou plano de outra academia: operação falha sem revelar dados da outra conta.
