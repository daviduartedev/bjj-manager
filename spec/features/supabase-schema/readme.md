# Feature: schema Supabase (domínio)

Rastreio do **modelo relacional** canônico em Postgres (Supabase), alinhado a **ENT-**, **GR-** e **BR-**.

## Escopo deste ciclo

- DDL idempotente em [`db/schema.sql`](../../../db/schema.sql): enums, tabelas, FKs, índices, constraints de negócio acordadas.
- Seed em [`db/seed.sql`](../../../db/seed.sql): catálogo global de faixas (**GR-1** / **GR-2**), conta e planos **Kids 1 | Kids 2 | Adulto** para ambiente de desenvolvimento com **price_cents** alinhados a **BR-1.4** / **BLM-2**; em runtime, a app também provê os três planos por conta ao entrar no **(dashboard)** , ver [`spec/features/plans-billing-model/readme.md`](../plans-billing-model/readme.md).
- Migrações incrementais em [`db/migrations/`](../../../db/migrations/) (`.sql` ordenadas por nome); **`pnpm db:apply`** executa **schema → seed → migrations → policies** para ambientes com `DATABASE_URL`.
- **RLS** canónico em [`db/policies.sql`](../../../db/policies.sql), documentado em [`spec/features/rls-security/readme.md`](../rls-security/readme.md) e [`docs/security/rls.md`](../../../docs/security/rls.md); fluxo de sessão na app em [`spec/features/authentication/readme.md`](../authentication/readme.md).

## Aplicar em dev (Supabase)

1. Defina `DATABASE_URL` (URI Postgres do projeto) em `.env.local` , ver [`.env.example`](../../../.env.example).
2. Rode **`pnpm db:apply`** na raiz do repositório (executa `db/schema.sql`, `db/seed.sql` e `db/policies.sql` e imprime contagens de sanity check).

Alternativa: colar o conteúdo dos mesmos ficheiros no **SQL Editor** do dashboard Supabase, na ordem schema → seed.

Stub do job **BR-4.5**: [`db/jobs/br-45-auto-unpaid.sql`](../../../db/jobs/br-45-auto-unpaid.sql). RLS apontado historicamente em [`db/rls-next-cycle.sql`](../../../db/rls-next-cycle.sql) foi **substituído** por [`db/policies.sql`](../../../db/policies.sql).

## Convenções

| Camada | Convenção |
|--------|-----------|
| Chaves primárias | `uuid`, default `gen_random_uuid()` onde aplicável |
| Dinheiro | Centavos (`bigint`) |
| `reference_month` | `date` no **dia 1** do mês (**BR-3.1**) |
| Enums no Postgres | Slugs em **inglês**; rótulos **pt-BR** na UI (**BR-7.3**) |
| `payment_status` | `pending`, `paid`, `unpaid`, `scholarship`, `other` ↔ Pendente, Pago, Não pago, Bolsista, Outro |
| `payments.payment_method` | Texto opcional (ex.: PIX, dinheiro); nullable (**BUI-4.2**, **ENT-8**) |
| `plan_kind` | `kids_1`, `kids_2`, `adult` ↔ Kids 1, Kids 2, Adulto. **Reaproveitado** como categoria pedagógica em `lesson_plans.category` (**PED-2**) , **não** existe enum `lesson_plan_category`. |
| `student_status` | `active`, `inactive`, `trial`, `paused` |
| Ciclo‑vida extra (`students`) | `archived_at`, `removed_at` (timestamptz nullable); opcional `lifecycle_updated_by` → `profiles` (**STU-10**, **STU-11**, **BR-9**). |
| `lesson_plan_status` | `draft`, `published`, `archived` (**PED-4**) |
| `document_type` | `payment_receipt`, `enrollment_proof`, `certificate`, `liability_term`, `lesson_plan` (**DOC-1**) |
| `generated_document_status` | `pending`, `generating`, `generated`, `failed`, `archived` (**DOC-3.1**) |
| `delivery_channel` | `whatsapp_web`, `whatsapp_api`, `download`, `email` (**E16**) |
| `delivery_status` | `pending`, `opened`, `sent`, `failed`, `canceled` (**E16**) |

## Regras delegadas à aplicação

- Indicador de cobrança do mês, validação de **`recordPayment`** e leitura em lote: ver **PBS-** em [`spec/features/payments-billing-status/readme.md`](../payments-billing-status/readme.md).
- **Recorte da lista `/mensalidades`** (alunos activos sem arquivo nem removido soft): **BR-9** em [`spec/product/billing-rules.md`](../../product/billing-rules.md); colunas `students.archived_at` / `students.removed_at` quando o DDL do ciclo existir.
- **Geração automática de recibo** ao executar **`recordPayment`** com `status='paid'`: ver **REC-** em [`spec/features/payment-receipts/readme.md`](../payment-receipts/readme.md) e **BR-8** em [`spec/product/billing-rules.md`](../../product/billing-rules.md). O DDL apenas garante o vínculo `generated_documents.payment_id` e a unicidade do recibo activo por `payment_id`; a renderização e numeração ficam na app (**DOC-7**, **DOC-4**).
- Ordem de faixas, **pulo de faixa** com justificativa, **um grau por operação** na mesma faixa, e rejeição de **demotion** / **no-op**: ver **GR-4.5** e **GRD-3** em [`spec/features/graduation-engine/readme.md`](../graduation-engine/readme.md).
- Limite fino de **grau por faixa** (preta **1–6**, demais **0–4** por **GR-1** / **GR-2**): o banco garante faixa **0–6** em `students.current_degree`; validação por faixa no app ou trigger futuro.
- Job **Pendente → Não pago** após vencimento (**BR-4.5**): não faz parte deste DDL; documentado em [`spec/product/billing-rules.md`](../../product/billing-rules.md).
- **Numeração documental** (`{PREFIX}-{YYYY}-{seq4}`): sequência por (`account_id`, `type`, ano) gerida pela app (**DOC-4.3**); o DDL fornece tabela auxiliar `document_sequences` com `SELECT … FOR UPDATE` para evitar contenção, mas a lógica de retry e formatação do número é da camada de domínio.

## Domínios novos (ciclo `25-0510-pedagogical-documents-finance`)

| Tabela | Finalidade |
|--------|------------|
| `lesson_plans` | Plano mensal por categoria (**ENT-11**, **PED-**) , `category` reaproveita `plan_kind` (**PED-2**) |
| `lesson_plan_revisions` | Histórico imutável do conteúdo (**ENT-12**, **PED-6**) |
| `lesson_plan_attachments` | Materiais de apoio do plano (**ENT-13**, **PED-8.6**) |
| `document_templates` | Override futuro de templates por conta (**ENT-14**, **DOC-5**) , linhas opcionais no MVP |
| `generated_documents` | Cada emissão imutável (**ENT-15**, **DOC-3**, **REC-3**) |
| `generated_document_deliveries` | Tentativas de compartilhamento por canal (**ENT-16**, **DOC-8**) |
| `document_sequences` | Sequência por (`account_id`, `type`, ano) para numeração (**DOC-4.3**) |

Buckets Supabase Storage privados associados:

- `documents-{env}` , PDFs gerados (chave `accounts/{accountId}/{type}/{YYYY}/{MM}/{documentNumber}-v{version}.pdf` , **DOC-6.2**).
- `lesson-plans-attachments-{env}` , anexos de planos.
- `branding-{env}` , logotipo e assinatura institucional da conta (**CFG-6.3**).

## Manutenção

Alterações de schema devem atualizar **este readme**, [`db/schema.sql`](../../../db/schema.sql), [`db/seed.sql`](../../../db/seed.sql), [`db/policies.sql`](../../../db/policies.sql) quando o isolamento por conta mudar, e os contratos em **`spec/product/`** + **`docs/product/`** no mesmo raciocínio de commit descrito no hub [`spec/README.md`](../../README.md); políticas em prosa também em [`docs/security/rls.md`](../../../docs/security/rls.md) e [`spec/features/rls-security/readme.md`](../rls-security/readme.md).
