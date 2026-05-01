# Plano — Ciclo 04: schema Supabase (delta)

## Baseline

- Contrato de produto em **`spec/product/`** (esp. **ENT-**, **GR-**, **BR-**) e cópias em **`docs/product/`**.
- Pedido original: [`request.md`](./request.md).

## Decisões incorporadas (refino)

1. **Planos por conta:** três tipos — **Kids 1**, **Kids 2**, **Adulto** — para segmentação manual por idade/turma (**BR-1.1**, **ENT-6.1**). Seed de dev inclui os três por conta seed (**BR-1.4**).
2. **Status de mensalidade:** inclusão de **Bolsista**; enums persistidos em inglês (`scholarship`, etc.) com rótulos pt-BR na UI (**BR-4.2**, **BR-7.3**).
3. **Semântica sem linha em `payments`:** equivale a **Pendente** na experiência (**BR-4.4**). Rotina futura persiste **Não pago** após vencimento quando ainda pendente (**BR-4.5**) — fora do DDL deste ciclo.
4. **`accounts`:** sem slug/timezone extra neste ciclo (resposta 2.1).
5. **`profiles`:** sem `role` no MVP (2.2).
6. **`student_status`:** inclui `trial` e `paused` (3.1); política “trial de 1 dia” é operacional/UI, não obrigatória no DDL.
7. **`students.current_degree`:** CHECK grosseiro **0–6**; limites por faixa (preta 1–6, demais conforme **GR-**) na app ou trigger futuro (**GR-1**, **GR-2**).
8. **`student_graduations`:** CHECK `was_skip` / `skip_reason` conforme **GR-6.3**.
9. **Vínculo aluno–plano:** no máximo um aberto por aluno — **índice único parcial** `ended_at IS NULL` (**ENT-7.2**); histórico com `started_at` / `ended_at` (4.2).
10. **`payments`:** **UNIQUE (`student_id`, `reference_month`)** (**BR-7.2**).
11. **Transversal:** PKs `uuid`, `created_at` / `updated_at` em tabelas de domínio (refino §6 completado assim).
12. **FKs:** exclusão de conta em cascata para dados da conta; `profiles.user_id` → `auth.users` **ON DELETE CASCADE**; faixas globais com **RESTRICT** em uso.

## Entregáveis

| Artefato | Descrição |
|----------|-----------|
| [`db/schema.sql`](../../../db/schema.sql) | DDL idempotente (enums, tabelas, FKs, índices, constraints). |
| [`db/seed.sql`](../../../db/seed.sql) | Faixas oficiais + conta/planos de desenvolvimento. |
| [`spec/features/supabase-schema/readme.md`](../../../spec/features/supabase-schema/readme.md) | Hub da feature e convenções. |
| Produto canônico | Atualizado para **Bolsista**, planos triplos, **BR-4.4**/**BR-4.5**, **ENT-7.2**, **GR-6.3**. |

## Fora deste ciclo

- **RLS** e políticas por papel.
- Implementação do **job** **BR-4.5** (Edge Function / cron / worker).
- Triggers de `updated_at` (opcional em ciclo futuro).
