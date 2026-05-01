# Plano , Plans & Billing Model (delta)

## Contexto

Ciclo **modelo + Server Actions** para planos por conta e vínculo aluno↔plano, sem UI de Configurações nem fluxo de pagamento (**pagamentos = ciclo 13**). Valores só em centavos no Postgres; UI usa `formatBRL` quando existir.

## Respostas do refino (consolidado)

| # | Tema | Decisão |
|---|------|---------|
| 1 | Tipos de plano | **Três** por conta: **Kids 1**, **Kids 2**, **Adulto** (`kids_1`, `kids_2`, `adult`) , alinhado a **BR-1.1**, schema `plans_account_kind_unique` e **STU-4**. |
| 2 | `updatePlanPrice` | Só **`price_cents`** (inteiro ≥ 0). Estado **ativo/inativo** do plano fica para UI de Configurações futura; **BR-1.3** é aplicado em **`setStudentPlan`** (recusar plano **inativo** para novo vínculo). |
| 3 | Provisão automática | **`ensureDefaultPlansForCurrentAccount`** idempotente (INSERT dos três `kind` com **`ON CONFLICT DO NOTHING`**), invocada no **layout servidor** de `app/(dashboard)/layout.tsx`, para que qualquer página do painel assuma planos existentes. Remover duplicação com seed “lazy” em `getPlansCatalog` (**este catálogo só lista** `active = true`; não cria linhas). |
| 4 | Preços por defeito | **Kids 1** = **10000** centavos (R$ 100); **Kids 2** e **Adulto** = **12000** centavos (R$ 120) , apenas para integração/validação futura; professor pode alterar via `updatePlanPrice`. |
| 5 | `ended_at` / `started_at` | Na troca de vínculo: **`started_at`** do novo registo = **data civil corrente** em **America/São_Paulo**; **`ended_at`** da linha anterior = **a mesma data** (transição instantânea nesse dia). |
| 6 | Mesmo plano | **Sempre** encerrar vínculo aberto e **inserir nova linha**, mesmo que `plan_id` seja igual , mantém histórico (**ENT-7.3**). |
| 7 | `custom_price_cents` | Omissão no payload **mantém** o valor atual do vínculo aberto; **`null` explícito** **remove** personalização (volta ao preço do plano na lógica efetiva). |
| 8 | UX de erro | Actions em **`actions/billing.ts`** seguem **BLM-3**: mensagens **específicas** em pt-BR (toast), **sem** texto exclusivamente genérico; **sem** vazar stack, schemas internos ou permitir enumeração entre contas. |
| 9 | API pública | Manter **`actions/billing.ts`**: `updatePlanPrice`, `setStudentPlan`; **`lib/billing/`**: `getEffectivePrice` + helper interno partilhado com **`actions/students.ts`** (evitar dependência circular actions→actions). |

## Delta em relação ao estado canônico anterior

- **Antes:** `request.md` do ciclo falava em dois planos “Kids” / “Adulto”; **BR-1.4** dizia “onboarding ou manual” sem detalhar app; **ENT-7.2** não explicitava histórico para mesmo plano; provisão lazy só em `getPlansCatalog` com `price_cents = 0`; `upsertOpenStudentPlan` em `students.ts` fazia **update in-place** quando plano não mudava.
- **Depois:** três planos fixos por conta; provisão explícita no layout dashboard + valores seed/dev alinhados (**BLM-2**, **BR-1.4**); histórico sempre com nova linha (**ENT-7.3**, **BLM-5**); contrato de erro **BLM-3** e **STU-2.3**; núcleo de vínculo extraído para **`lib/billing/`** consumido por **`setStudentPlan`** e CRUD de alunos.

## Implementação (referência)

| Área | Artefatos típicos |
|------|-------------------|
| Provisão | `lib/billing/ensure-default-plans.ts`; chamada em `app/(dashboard)/layout.tsx` |
| Actions | `actions/billing.ts`: `updatePlanPrice`, `setStudentPlan` |
| Domínio | `lib/billing/get-effective-price.ts`, `lib/billing/student-plan.ts` (fechar+abrir vínculo, datas SP), `lib/validations/billing.ts` (Zod) |
| Catálogo | `lib/data/students-catalog.ts`: retirar criação de planos; só leitura |
| Seed | `db/seed.sql`: preços 10000 / 12000 / 12000 |

## Alinhamento com outros ciclos

- **08-0430-students-crud**: `createStudent` / `updateStudent` / `quickUpdateStudent` devem usar o mesmo núcleo que **`setStudentPlan`** (**BLM-5**, **ENT-7.3**).
- **13-0430-payments-billing-status**: consome `getEffectivePrice` e `due_day` do vínculo aberto.

## Fora de escopo

- UI de Configurações para planos; gateway ou registos em `payments`; job **BR-4.5**; alterar `active` do plano via action neste ciclo.

## Riscos / notas

- **Mesmo plano + só `due_day`**: com regra de nova linha sempre, uma mudança só de dia de vencimento também gera histórico , aceite pelo refino.
- Chamadas repetidas ao layout executam `ensureDefaultPlans` , deve ser **barato** (no-op após primeira vez).

## Referências

- `cycles/Q22026/12-0430-plans-billing-model/request.md`
- `spec/features/plans-billing-model/readme.md` (**BLM-**)
- `spec/product/billing-rules.md` (**BR-1.4**)
- `spec/product/entities.md` (**ENT-6**, **ENT-7**)
- `spec/features/students-crud/readme.md` (**STU-2.3**, **STU-8**)
- `spec/features/supabase-schema/readme.md`
- `db/schema.sql` (`plans`, `student_plans`)
