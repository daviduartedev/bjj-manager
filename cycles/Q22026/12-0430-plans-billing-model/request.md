# Plans and Billing Model

## Context
A academia precisa de planos. No MVP existem **três** tipos por conta:
**Kids 1**, **Kids 2** e **Adulto**. O professor configura o valor de cada plano da sua conta;
cada aluno pode ter um preço personalizado e seu próprio dia de
vencimento. Este ciclo entrega o modelo (planos, vínculos) sem ainda
mexer em pagamentos.

## Intent
- No primeiro acesso à área autenticada **(dashboard)**, criar automaticamente
  os três planos default da conta (**Kids 1**, **Kids 2**, **Adulto**).
- Telas de admin de planos viverão dentro do ciclo Settings , aqui
  só entregamos o **modelo de dados** e Server Actions:
  - `actions/billing.ts → updatePlanPrice`,
  - `actions/billing.ts → setStudentPlan({ studentId, planId,
    customPriceCents?, dueDay })`.
- Regra do `dueDay`: inteiro 1..28 (evita 29/30/31 inexistentes).
- Vínculo aluno↔plano fica em `student_plans`. Trocar plano cria nova
  linha com `started_at`; encerra a anterior com `ended_at`.
- Helper `getEffectivePrice(student)` em `lib/billing/`:
  - retorna `custom_price_cents` se existir, senão `plans.price_cents`.

## Taste / Constraints
- Valores **sempre** em centavos no banco; conversão pra reais só no
  formatador (`formatBRL`).
- Nunca permitir `dueDay` fora de 1..28 (validar no Zod e no banco).
- Mantém histórico de planos do aluno (não sobrescreve).
- Server Actions usam o cliente server-side com RLS aplicado.
- Nada de UI nova de Settings aqui; só o modelo + actions.

## References
- `cycles/Q22026/04-0430-supabase-schema/request.md` (`plans`,
  `student_plans`).
- `cycles/Q22026/08-0430-students-crud/request.md` (formulário já pede
  plano e `due_day`).
- `cycles/Q22026/13-0430-payments-billing-status/request.md` (próximo).

## Attachments
- (nenhum)

---

## Refino (2026-05-01)

Decisões consolidadas em [`plan.md`](./plan.md): três planos (**Kids 1**, **Kids 2**, **Adulto**); preços por defeito **10000 / 12000 / 12000** centavos; provisão idempotente no layout **`(dashboard)`**; histórico **sempre** com nova linha em `student_plans` (**ENT-7.3**); datas de transição em **America/São_Paulo**; erros das actions em **`actions/billing.ts`** com mensagens **específicas** (**BLM-3**); `updatePlanPrice` só altera **`price_cents`**. Cenários: [`scenarios.feature`](./scenarios.feature).
