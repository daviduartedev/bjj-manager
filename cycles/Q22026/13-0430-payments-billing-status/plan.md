# Plano delta — Pagamentos e estado de cobrança do mês (ciclo 13)

## Estado das specs

- **Base:** `spec/product/billing-rules.md`, `spec/product/entities.md`, `spec/features/plans-billing-model/readme.md`, `spec/features/supabase-schema/readme.md`, `spec/features/date-duration-utilities/readme.md`.
- **Este ciclo adiciona:** contrato **`PBS-`** em `spec/features/payments-billing-status/readme.md` e ajustes pontuais em **BR-4** (derivação vs job).

## Decisões de produto (consolidadas)

1. **Sem job neste ciclo** — alinhado ao pedido e à sua confirmação (**1.2**): o rótulo **“atrasado”** é **sempre derivado** na leitura (data civil ≥ primeiro dia útil após o vencimento do mês, em **America/São_Paulo**). A persistência automática **BR-4.5** continua canónica mas **não é obrigatória** até existir job/cron; até lá a linha pode continuar **ausente** ou **`pending`** sem impedir a UI de mostrar “atrasado”.
2. **Indicador do mês para UI** — cinco categorias de apresentação, alinhadas ao enum do Postgres: **`paid` | `pending` | `overdue` | `scholarship` | `other`**. Não se “empurra” bolsista/outro para dentro de pendente/atrasado: leem-se do **`payments.status`** quando há linha; sem linha → **pendente** operacional (**BR-4.4**); **atrasado** só quando não há **pago/bolsista** (e, para **outro**, ver **PBS-3** no readme da feature).
3. **`recordPayment`** — “marcar como pago” com **valor cheio** alinhado ao financeiro: o cliente envia **`amountCents`**; o servidor **valida igualdade** com `getEffectivePrice` do vínculo aberto. **Upsert** em `(student_id, reference_month)` com **`status = paid`**, preenchendo **`paid_at`** (default “agora” em SP se omitido), **`notes`** opcional. **Sem campo `method`** neste ciclo (schema não tem coluna; evolução futura).
4. **Idempotência** — constraint **`UNIQUE (student_id, reference_month)`** já existente; em repetição **idêntica** (mesmo mês, mesmo **amount_cents** já gravado como **paid**) → **sucesso idempotente** (opcionalmente atualizar **`paid_at`**/**`notes`** conforme **PBS-**). Tentativa com **valor diferente** do vigente → **erro de domínio** em pt-BR.
5. **`voidPayment`** — **remover a linha** (**DELETE**): restaura a semântica “sem registro = pendente” (**BR-4.4**). Estorno simples, sem auditoria extra no MVP.
6. **Aluno sem vínculo aberto** — não há **`due_day`** confiável: indicador **pending** (não **overdue**); **`recordPayment`** **falha** com mensagem de domínio (aluno sem plano ativo).
7. **Lote / uma query** — função ou query agregando **`students`** (conta), **`student_plans`** (vínculo aberto: **`due_day`**), **`payments`** (mês pedido), retornando por aluno: **`referenceMonth`**, **`dueDay`**, **`persistedStatus`**, **`derivedIndicator`** (os cinco valores), **`amountCentsExpected`** (= preço efetivo atual) para consumo futuro do dashboard.

## Delta em relação ao `request.md` original

- Enum de retorno do helper: de três para **cinco** valores de indicador (**scholarship** / **other** explícitos), para coincidir com o modelo de dados e evitar ambiguidade na próxima UI.
- **`method`**: **fora** do contrato até haver migração.

## Fora de escopo (confirmado)

- UI completa de cobrança; cron/job **BR-4.5**; gateway de pagamento.

## Rastreabilidade

- **BR-3**, **BR-4**, **BR-7**, **ENT-8**, **BLM-6**, **DATE-1**, **SEC-3.3**.
