# Supabase Schema

## Context
O backend do Casca - Gestão de Academias de BJJ é o Supabase. Para qualquer feature de domínio
funcionar, o schema precisa estar criado e populado com as faixas
oficiais (adulto e kids). O modelo nasce multi-tenant (`account_id` em
todas as tabelas relevantes) mesmo que o MVP atenda um professor por
conta , isso evita refactor quando virarmos SaaS vendável.

## Intent
- Tabelas:
  - `accounts` (conta da academia)
  - `profiles` (1:1 com `auth.users`, ligado a `account_id`)
  - `belts` (catálogo global: kind adult/kids, name/slug estável no seed, **ordinal** alinhado a **GR-1** / **GR-2**; rótulos PT na UI , ver **ENT-3.3**)
  - `students` (aluno; `kind` adult/kids, `current_belt_id`,
    `current_degree`, status, dados pessoais opcionais)
  - `student_graduations` (histórico; `was_skip`, `skip_reason`)
  - `plans` (Kids/Adulto por conta, `price_cents`, `active`)
  - `student_plans` (vínculo aluno↔plano, `custom_price_cents?`,
    `due_day`)
  - `payments` (`reference_month`, `amount_cents`, estado manual **Pago | Não pago | Pendente | Outro** conforme **BR-4.2**, `paid_at` opcional quando quitado)
- Enums: `belt_kind`, `student_kind`, `student_status`, `plan_kind`, `payment_status` (alinhado a **BR-4.2**).
- Índices em `students(account_id)`,
  `payments(student_id, reference_month)`,
  `student_graduations(student_id, graduated_at desc)`.
- Seed das faixas oficiais (5 adultos + 13 kids).

## Taste / Constraints
- SQL idempotente (`if not exists` quando faz sentido).
- FKs com `on delete cascade` apenas onde for seguro
  (graduações/pagamentos seguem o aluno).
- `reference_month` é uma `date` apontando ao dia 1 do mês ,
  representação simples e suficiente.
- Todos os valores monetários em **centavos** (`bigint`/`integer`).
- Sem RLS aqui , RLS é o ciclo seguinte.
- Migration aplicada via SQL editor do Supabase de dev.

## References
- `cycles/Q22026/02-0430-product-specification/request.md`
- `spec/product/entities.md`, `spec/product/graduation-rules.md`, `spec/product/billing-rules.md`
- `db/schema.sql`, `db/seed.sql` (placeholders já criados).

## Attachments
- (nenhum)
