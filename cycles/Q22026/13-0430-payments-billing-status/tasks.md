# Tarefas — ciclo 13-0430-payments-billing-status

## Spec canónica (obrigatório)

- [x] Revisar e manter alinhados **`spec/product/billing-rules.md`** e **`docs/product/billing-rules.md`** (delta BR-4.6 / derivação).
- [x] Manter **`spec/product/entities.md`** / **`docs/product/entities.md`** se **ENT-8** precisar de nota sobre estorno (`voidPayment`).
- [x] Completar **`spec/features/payments-billing-status/readme.md`** (regras **PBS-**).
- [x] Atualizar **`spec/README.md`** (entrada da nova feature).
- [x] Referência cruzada em **`spec/features/plans-billing-model/readme.md`** e **`spec/features/supabase-schema/readme.md`** se necessário.

## Domínio (`lib/billing/`)

- [x] Implementar cálculo de **dia de vencimento civil** do mês de referência (respeitar **BR-2.3**: último dia válido em meses curtos).
- [x] Implementar **`getMonthBillingIndicator(...)`** (ou nome final do readme **PBS-**) com **`today`** injetável (**DATE-1.3**), comparação em datas **locais São Paulo**.
- [x] Implementar helper de **lote** (query única ou RPC documentada) para lista de alunos + indicador + preço efetivo esperado.

## Server Actions (`actions/billing.ts`)

- [x] **`recordPayment({ studentId, referenceMonth, amountCents, paidAt?, notes? })`** — validação Zod, checagem RLS, igualdade com **`getEffectivePrice`**, upsert idempotente conforme **PBS-**.
- [x] **`voidPayment({ paymentId })`** opcional MVP — DELETE da linha, ownership via join aluno/conta.
- [x] Erros **`{ ok: false; error: string }`** em pt-BR (**BLM-3**), sem vazamento (**SEC-3.3**).

## Qualidade

- [x] Testes Vitest para o núcleo de datas/indicador (casos: antes/no/após vencimento, mês curto, bolsista/outro, sem vínculo).
- [x] Testes para validação de valor = preço efetivo (mock de dados de plano).

## Verificação antes de encerrar

- [x] `pnpm` test / lint do projeto passando nos arquivos tocados.
- [x] Cenários Gherkin do ciclo revisitados após implementação (`scenarios.feature`).
