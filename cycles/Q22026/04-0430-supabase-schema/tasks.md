# Tasks , Ciclo 04: schema Supabase

Checklist executável. **Ao concluir a implementação, atualizar features em `spec/features/`** (e produto em `spec/product/` + `docs/product/` se o comportamento mudar).

## Spec e rastreabilidade

- [x] Consolidar decisões do refino em [`plan.md`](./plan.md).
- [x] Registrar cenários de negócio em [`scenarios.feature`](./scenarios.feature).
- [x] Atualizar **`spec/product/`** (`entities.md`, `billing-rules.md`, `spec.md`, `graduation-rules.md` **GR-6.3**) e espelhar em **`docs/product/`**.
- [x] Criar/atualizar hub [`spec/features/supabase-schema/readme.md`](../../../spec/features/supabase-schema/readme.md) e entrada em [`spec/README.md`](../../../spec/README.md).

## DDL e seed

- [x] Implementar [`db/schema.sql`](../../../db/schema.sql): enums (`belt_kind`, `student_kind`, `student_status`, `plan_kind`, `payment_status`), tabelas, FKs, índices pedidos, UNIQUE (`student_id`, `reference_month`), índice único parcial em `student_plans`, CHECK em `student_graduations` (**GR-6.3**), CHECK dia 1 em `reference_month`, limites grosseiros de grau.
- [x] Implementar [`db/seed.sql`](../../../db/seed.sql): todas as faixas adulto + kids (**GR-6.1**); conta + três planos de dev (**BR-1.4**).
- [x] **Aplicar no projeto Supabase de dev** , validado no dashboard (Table Editor: `accounts`, `profiles`, `belts`, `students`, `student_graduations`, `plans`, `student_plans`, `payments`; **UNRESTRICTED** = sem RLS, conforme ciclo).

## Pós-schema (outros ciclos , não bloquear este PR)

- [x] **BR-4.5:** stub versionado em [`db/jobs/br-45-auto-unpaid.sql`](../../../db/jobs/br-45-auto-unpaid.sql) (`br45_mark_overdue_unpaid`) , lógica de datas/pg_cron no ciclo dedicado.
- [x] **RLS:** checklist em [`db/rls-next-cycle.sql`](../../../db/rls-next-cycle.sql) , políticas no ciclo seguinte.
- [x] **App enum labels:** [`lib/i18n/domain-enums.ts`](../../../lib/i18n/domain-enums.ts) (**BR-7.3**, inclusive **Bolsista** ↔ `scholarship`).
