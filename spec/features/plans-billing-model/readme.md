# Feature: modelo de planos e vínculo aluno–plano (billing)

Contrato canónico para **SPEC** / **BR-** / **ENT-6**, **ENT-7** na camada **aplicação** (Server Actions, helpers, provisão), sem UI de Configurações nem área de pagamentos (**ciclo 13**).

## Relação com outras specs

- Regras de negócio: [`spec/product/billing-rules.md`](../../product/billing-rules.md) (**BR-1**, **BR-2**).
- Entidades: [`spec/product/entities.md`](../../product/entities.md) (**ENT-6**, **ENT-7**).
- Schema: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`plans`, `student_plans`, `plan_kind`).
- Alunos: [`spec/features/students-crud/readme.md`](../students-crud/readme.md) (**STU-4**, **STU-5**, **STU-8**, **STU-2.3**).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.3**).
- Pagamentos (seguinte): ciclo `13-0430-payments-billing-status`.

## Implementação (referência)

| Área | Artefatos típicos |
|------|-------------------|
| Provisão | `lib/billing/ensure-default-plans.ts`; chamada no layout `app/(dashboard)/layout.tsx` |
| Actions | `actions/billing.ts`: `updatePlanPrice`, `setStudentPlan` |
| Domínio | `lib/billing/get-effective-price.ts`, `lib/billing/student-plan.ts`, `lib/billing/action-errors.ts` |
| Validação | `lib/validations/billing.ts` (Zod; espelha checks em `student_plans_due_day_ck`) |

## BLM-1. Planos por conta

**BLM-1.1.** Cada conta possui exactamente **uma** linha por `plan_kind`: **Kids 1**, **Kids 2**, **Adulto** (`kids_1`, `kids_2`, `adult`), conforme **BR-1.1** e constraint `plans_account_kind_unique`.

**BLM-1.2.** Nomes por defeito na provisão: **"Kids 1"**, **"Kids 2"**, **"Adulto"** (rótulos pt-BR).

## BLM-2. Provisão e preços por defeito

**BLM-2.1.** Ao carregar o layout servidor da área **`(dashboard)`**, a app executa **`ensureDefaultPlansForCurrentAccount`**: insert idempotente dos três planos com **`ON CONFLICT DO NOTHING`** (ou equivalente sem sobrescrever preços já existentes).

**BLM-2.2.** Valores iniciais só para referência e integração futura (**sem cobrança automática neste ciclo**): **Kids 1** = **10000** centavos; **Kids 2** e **Adulto** = **12000** centavos cada.

**BLM-2.3.** O **seed** de desenvolvimento em [`db/seed.sql`](../../../db/seed.sql) usa os mesmos montantes por defeito (**BR-1.4**).

## BLM-3. Erros e UX servida à UI

**BLM-3.1.** As Server Actions em **`actions/billing.ts`** devolvem `{ ok: false; error: string }` com mensagem **específica** em português do Brasil, adequada a **toast**, para cada falha de domínio ou validação (ex.: plano inativo, `due_day` inválido, incompatibilidade tipo de aluno / plano).

**BLM-3.2.** Não usar como única informação frases meramente genéricas (“ocorreu um erro”) sem contexto de produto **nestas actions**.

**BLM-3.3.** **Segurança:** não expor stack traces, nomes de tabelas/colunas internas, nem permitir **enumeração** de recursos de outras contas; para IDs inválidos ou fora do âmbito RLS, mensagens **uniformes** do tipo *não encontrado ou sem permissão* são aceitáveis (**SEC-3.3**).

## BLM-4. Preço padrão do plano

**BLM-4.1.** `updatePlanPrice({ planId, priceCents })` altera só **`price_cents`** (inteiro ≥ 0). O `planId` é resolvido com cliente servidor e **RLS** (só planos da conta da sessão).

**BLM-4.2.** Alterar **`active`** do plano fica para ciclo de Configurações; até lá, **BR-1.3** é aplicado em **`setStudentPlan`**: recusar vínculo novo se o plano estiver **inativo**.

## BLM-5. Vínculo e histórico

**BLM-5.1.** `setStudentPlan({ studentId, planId, customPriceCents?, dueDay })` valida **Zod** (`due_day` **1–28**), coerência **`student_kind`** ↔ **`plan_kind`** (**STU-4**), plano **ativo**, aluno da conta (via RLS).

**BLM-5.2.** Se existe vínculo aberto (`ended_at` nulo), **sempre** se faz **`UPDATE ended_at`** nessa linha e **`INSERT`** de nova linha — **incluindo** quando `plan_id` é **igual** ao anterior (**ENT-7.3**).

**BLM-5.3.** **`started_at`** da nova linha = **`ended_at`** da linha encerrada = **data civil corrente** em **America/São_Paulo** (string `YYYY-MM-DD` consistente com o tipo `date` do Postgres).

**BLM-5.4.** Semântica de **`customPriceCents`:** omitido → mantém o valor já gravado no vínculo aberto (quando aplicável); **`null`** explícito → remove personalização (passa a usar só preço do plano na função efetiva).

## BLM-6. Preço efetivo

**BLM-6.1.** `getEffectivePrice(...)` devolve **`custom_price_cents`** do vínculo aberto se não for nulo; caso contrário **`plans.price_cents`** (**BR-2.2**). Implementação em **`lib/billing/`**; apenas dados já filtrados por **RLS**.

## UI — preço personalizado

Os formulários **STU-5** / **STU-8** ainda **não** expõem campo de **preço personalizado**; `custom_price_cents` pode ser definido via **`setStudentPlan`** (API interna / ciclo futuro). Quando a UI ganhar o campo, validar com **`setStudentPlanSchema`** e mostrar toast com **`error`** devolvido (**STU-2.3**).

## Manutenção

Alterações em `plans` / `student_plans`, actions de billing ou provisão devem actualizar **este readme**, **`spec/product/billing-rules.md`** + **`docs/product/billing-rules.md`**, **`spec/product/entities.md`** + **`docs/product/entities.md`**, **`spec/features/students-crud/readme.md`**, **`spec/features/supabase-schema/readme.md`**, e cenários em `cycles/.../12-0430-plans-billing-model/scenarios.feature`.
