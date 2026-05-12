# Feature: pagamentos e indicador de cobrança do mês

Contrato canónico para **ações de pagamento**, **derivados de status por mês** e **consulta em lote**. A **UI de mensalidades** está em **BUI-** ([`spec/features/billing-ui/readme.md`](../billing-ui/readme.md)).

## Relação com outras specs

- Regras de produto: [`spec/product/billing-rules.md`](../../product/billing-rules.md) (**BR-3**, **BR-4**, **BR-7**, **BR-9**).
- Entidades: [`spec/product/entities.md`](../../product/entities.md) (**ENT-7**, **ENT-8**).
- Schema: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`payments`, `payment_status`).
- Planos e preço efetivo: [`spec/features/plans-billing-model/readme.md`](../plans-billing-model/readme.md) (**BLM-6**).
- Datas: [`spec/features/date-duration-utilities/readme.md`](../date-duration-utilities/readme.md) (**DATE-1**, **DATE-1.3**).
- Segurança: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.3**).

## Implementação (referência)

| Área        | Artefactos típicos                                              |
| ----------- | --------------------------------------------------------------- |
| Actions     | `actions/billing.ts`: `recordPayment`, `voidPayment` |
| Domínio     | `lib/billing/reference-month.ts`, `month-billing-indicator.ts`, `month-billing-snapshots.ts` |
| Validação   | `lib/validations/billing.ts` (`recordPaymentSchema`, `voidPaymentSchema`) |

---

## PBS-1. Normalização e fuso

**PBS-1.1.** `reference_month` é sempre o **dia 1** do mês (**BR-3.1**); entradas inválidas são rejeitadas na action.

**PBS-1.2.** “Hoje” e comparações de **calendário** para vencimento/atraso usam **America/São_Paulo** como dia civil local (**DATE-1.1**), nunca heurística só em UTC.

**PBS-1.3.** Funções puras que dependem da data atual recebem **`today`** explícito (**DATE-1.3**) para testes.

---

## PBS-2. Dia de vencimento no mês de referência

**PBS-2.1.** Para um **`due_day`** (**1–28**) e um **`reference_month`** (primeiro dia \(M\)), o **vencimento civil** é o dia **`min(due_day, último dia de \(M\))`** (**BR-2.3**).

**PBS-2.2.** “Antes do vencimento” / “em ou após o vencimento” comparam **`today`** (string ou data civil SP) com esse dia **no mesmo mês civil que \(M\)**.

---

## PBS-3. Indicador derivado (`MonthBillingIndicator`)

Valores canónicos (slug inglês, UI pt-BR à parte): **`paid`**, **`pending`**, **`overdue`**, **`scholarship`**, **`other`**.

**PBS-3.1.** Se existir linha em `payments` para o par (**aluno**, **reference_month**):

- `status = paid` → indicador **`paid`**.
- `status = scholarship` → **`scholarship`**.
- `status = other` → **`other`** (não classificar como **overdue** mesmo após o vencimento; é decisão manual explícita).
- `status = pending` ou `unpaid` → aplicar **PBS-3.3**.

**PBS-3.2.** Se **não** existir linha (**BR-4.4** semântica pendente): seja **`due`** a data civil de vencimento (**PBS-2.1**) no calendário de São Paulo. Se **`today` ≤ `due`** → **`pending`**; se **`today` > `due`** → **`overdue`** (no mesmo mês de referência).

**PBS-3.3.** Para linha **`pending`** ou **`unpaid`** (ainda não **paid** / **scholarship** / **other**): aplicar a mesma comparação **`today`** vs **`due`** que **PBS-3.2**.

**PBS-3.4.** Aluno **sem vínculo aberto** em `student_plans`: não há **`due_day`** , indicador **`pending`**; **não** derivar **`overdue`** só pelo calendário (**PBS-4**).

---

## PBS-4. `recordPayment`

**PBS-4.1.** Pré-condição: existe **`student_plans`** aberto para o aluno ( **`ended_at` nulo** ); caso contrário a action falha com mensagem de domínio em pt-BR.

**PBS-4.2.** **`amountCents`** é **obrigatório** e deve ser **igual** ao **`getEffectivePrice`** do vínculo aberto (**BLM-6**, **BR-2.2**). Desalinhamento → erro (sem tolerância de arredondamento além do inteiro em centavos).

**PBS-4.3.** Persistência: **upsert** na chave natural (**student_id**, **reference_month**) com **`status = paid`**, **`amount_cents`**, **`paid_at`** (opcional na entrada; default instante corrente tratado no servidor), **`notes`** opcional, **`payment_method`** opcional (texto livre; coluna nullable em `payments` , **BUI-4.2**).

**PBS-4.4.** Idempotência: se já existe linha **paid** para o par com o **mesmo** **`amount_cents`**, a operação pode concluir como sucesso (**opcional**: atualizar **`paid_at`**/**`notes`** se a action aceitar overwrite explícito documentado). Se **`amount_cents`** difere do registado → erro.

---

## PBS-5. `voidPayment`

**PBS-5.1.** Remove a linha (**DELETE**) por **`payment_id`**, com escopo RLS (pagamento só de aluno da conta).

**PBS-5.2.** Após remoção, a semântica segue **BR-4.4** (ausência de linha ≈ pendente na experiência até novo registo).

---

## PBS-6. Consulta em lote

**PBS-6.1.** Uma operação de leitura (query ou função SQL estável) recebe conjunto de **`student_id`** (e opcionalmente **`reference_month`**, default primeiro dia do mês civil de **`today`** em SP) e devolve, por aluno, pelo menos: **`reference_month`**, **`due_day`** do vínculo aberto (se houver), **`payment_status`** persistido ou ausência, **`MonthBillingIndicator`**, **`amount_cents_expected`** (= preço efetivo atual).

**PBS-6.2.** Consumido pelo **painel** (**PNL-** em [`spec/features/dashboard/readme.md`](../dashboard/readme.md)), pela lista **`/mensalidades`** e pelo detalhe **`/mensalidades/[studentId]`** (**BUI-**).

**PBS-6.3.** A lista **`BUI`** primeiro restringe **`student_id`** ao recorte **BR-9** / **BUI-2** / **ENT-4** / **STU-3** antes de usar **`MonthBillingIndicator`**. O contrato **`PBS-6.1`** também serve quando só existe um par válido já autorizado (ex.: **detalhe**). Ver **SPR-9.4** para CTAs quando o aluno ficou extra-carteira.

---

## PBS-7. Erros e segurança

**PBS-7.1.** Mesmo contrato de erro que **BLM-3** para actions de billing: **`{ ok: false; error: string }`** em pt-BR.

**PBS-7.2.** **SEC-3.3:** IDs inválidos ou fora do tenant → mensagem uniforme; não expor detalhes internos.

---

## PBS-8. Relação com BR-4.5

**PBS-8.1.** Até existir job que persista **Pendente → Não pago**, o indicador **`overdue`** cobre a necessidade de “atrasado” na experiência (**BR-4.3**). Quando o job existir, linhas **`unpaid`** continuam compatíveis com **PBS-3.3**.

---

## PBS-9. Geração automática de recibo

**PBS-9.1.** Após o `upsert` em `payments` resultar em `status='paid'`, a Server Action **`recordPayment`** dispara, no **mesmo request**, a emissão do recibo formal (**REC-1**, **BR-8**). O contrato `recordPayment` retorna `{ ok: true, paymentId, receipt: { documentId, status, downloadUrl? } }`; quando `receipt.status='failed'`, o pagamento permanece intacto e o cliente recebe a indicação para `Tentar gerar novamente` (**REC-7**).

**PBS-9.2.** Para `status ∈ {scholarship, other}`, **PBS-9** **não** se aplica , `recordPayment` continua a responder `{ ok: true, paymentId }` sem campo `receipt` (**REC-1.4**, **REC-1.5**). Recibos manuais ficam disponíveis via módulo documental (**DOC-1.1**).

**PBS-9.3.** Idempotência casa com **PBS-4.4**: chamadas com mesmo `(student_id, reference_month, amount_cents)` devolvem o **mesmo recibo** já gerado (**REC-2.1**), sem nova renderização.

**PBS-9.4.** **`voidPayment`** (**PBS-5**) deve marcar o recibo activo correspondente como `archived` (**REC-12**, **BR-8.6**); o documento permanece consultável no histórico do aluno.

---

## Manutenção

Alterações em `payments`, actions ou helpers devem actualizar **este readme**, **`spec/features/billing-ui/readme.md`** quando afectarem UX, **`spec/features/dashboard/readme.md`** quando afectarem **PBS-6** no painel, **`spec/features/payment-receipts/readme.md`** quando afectarem **REC-** ou **PBS-9**, **`spec/product/billing-rules.md`** + **`docs/product/billing-rules.md`**, e cenários em `cycles/Q22026/13-0430-payments-billing-status/scenarios.feature`, `cycles/Q22026/14-0430-billing-ui/scenarios.feature` e `cycles/Q22026/25-0510-pedagogical-documents-finance/scenarios.feature` quando comportamento observable mudar.
