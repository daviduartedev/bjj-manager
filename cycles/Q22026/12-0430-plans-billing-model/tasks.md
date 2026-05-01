# Tarefas — Plans & Billing Model (12-0430)

Checklist executável; citar **BLM-**, **BR-**, **ENT-**, **SEC-**, **STU-** nos commits quando aplicável.

## Spec e documentação (obrigatório)

- [x] Garantir que `spec/features/plans-billing-model/readme.md` reflecte **BLM-**.
- [x] Atualizar `spec/README.md` (entrada da feature plans-billing-model e ID **BLM-**).
- [x] Alinhar `spec/product/billing-rules.md` e `docs/product/billing-rules.md` (**BR-1.4**, valores por defeito).
- [x] Alinhar `spec/product/entities.md` e `docs/product/entities.md` (**ENT-7.3**, **ENT-6.2**).
- [x] Actualizar `spec/features/students-crud/readme.md` (**STU-2.3**, **STU-8** / vínculo histórico).
- [x] Actualizar `spec/features/supabase-schema/readme.md` (seed / provisão app vs BR-1.4).
- [x] Actualizar `cycles/Q22026/12-0430-plans-billing-model/request.md` com secção **Refino** → `plan.md`.

## Dados e seed

- [x] Ajustar `db/seed.sql`: `price_cents` **10000** (Kids 1), **12000** (Kids 2), **12000** (Adulto).

## Provisão de planos

- [x] Implementar `lib/billing/ensure-default-plans.ts` (INSERT triplo idempotente, nomes **Kids 1**, **Kids 2**, **Adulto**, preços **BLM-2**).
- [x] Invocar `ensureDefaultPlansForCurrentAccount` em `app/(dashboard)/layout.tsx` (servidor, após resolver conta/sessão).
- [x] Refactor `lib/data/students-catalog.ts`: remover `seedDefaultPlansForCurrentAccount`; `getPlansCatalog` apenas lista planos **ativos** (RLS).

## Validação e biblioteca

- [x] Criar `lib/validations/billing.ts` (Zod): `due_day` 1..28, `price_cents` ≥ 0, `plan_id` / `student_id` UUID, `custom_priceCents` opcional/nullable.
- [x] Implementar `lib/billing/get-effective-price.ts` — `getEffectivePrice` (**BLM-9**).
- [x] Implementar `lib/billing/student-plan.ts`: fechar vínculo aberto + inserir novo com **mesma data** SP (**BLM-5**); validar plano **ativo** e **plan_kind** vs **student_kind**; **sempre** nova linha, inclusive mesmo `plan_id`.
- [x] Implementar `actions/billing.ts`: `updatePlanPrice`, `setStudentPlan`, retorno `{ ok: true } \| { ok: false; error: string }`; mensagens **BLM-3** + `lib/billing/action-errors.ts` (sem genérico vazio, sem vazamento).

## Integração alunos

- [x] Substituir `upsertOpenStudentPlan` em `actions/students.ts` pelo núcleo em `lib/billing/student-plan.ts` (ou por chamada a helper partilhado alinhado a **`setStudentPlan`**).
- [x] Garantir que `custom_price_cents` é suportado onde o produto já prevê preço personalizado (formulários **STU-5** / **STU-8**), se já existir campo; caso ainda não exista na UI, documentar follow-up no readme da feature sem bloquear este ciclo.

## Segurança

- [x] Confirmar apenas cliente Supabase **servidor** + sessão; **nunca** `account_id` do cliente; RLS como barreira primária (**SEC-3.3**).
- [x] Mensagens de “não encontrado” / permissão formuladas para **não enumerar** recursos de outras contas (**BLM-3**).

## Qualidade

- [x] `pnpm lint` e `pnpm type-check` sem erros.
- [x] Testes unitários mínimos: `getEffectivePrice`, validação Zod de billing, função de data SP (se isolável).
- [ ] Teste manual: primeiro login em conta sem seed de planos → três planos com valores esperados; `updatePlanPrice`; troca de plano e mesma troca repetida → múltiplas linhas em `student_plans`; plano inativo rejeitado em `setStudentPlan`. → ver [`manual-test-checklist.md`](./manual-test-checklist.md).
