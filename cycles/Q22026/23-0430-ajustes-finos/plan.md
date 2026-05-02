# Plano (delta) — Ciclo 23-0430-ajustes-finos

Referência: pedido **Ajustes Finais — Landing Pública e Planos Kids/Adulto** (mensagem actual + [`request.md`](./request.md) histórico).

## Estado desejado

### Landing pública

- Secção **“O que você faz dentro do Casca”**: cards sem fundo branco destoante; tokens Tailwind / marca (**ML-1.1**).
- Secção **“Feito para quem ensina…”**: logo `public/logo_sem_fundo_preto__1_-removebg-preview.png` no lugar do ícone decorativo (**ML-1.2**).

### Planos (três por conta)

| `plan_kind` | Nome por defeito | Preço por defeito |
|-------------|------------------|-------------------|
| `adult`     | Adulto           | R$ 120            |
| `kids_1`    | Kids 1           | R$ 100            |
| `kids_2`    | Kids 2           | R$ 100            |

- **Sem** plano comercial “Juvenil”. Histórico em `student_plans` encerrado **não** é reescrito.
- Vínculos **abertos** no antigo plano `kids_2` (Juvenil) → **`kids_1`** com **`custom_price_cents` nulo** (valor efectivo R$ 100 de imediato).
- Aluno **`kids`** pode ser associado ao plano **Adulto** manualmente (**STU-4.2**, **BR-1.1**).

### Dados

- Migração SQL idempotente: [`db/migrations/001_juvenil_plans_to_kids.sql`](../../../db/migrations/001_juvenil_plans_to_kids.sql).
- **`pnpm db:apply`**: schema → seed → **migrations** → policies.

### Mensalidades

- Meses **anteriores a maio/2026**: não alterar registos históricos por esta migração.
- **Maio/2026 em diante**: estado vigente segue plano / preço personalizado / regras existentes (**amountCentsExpected** derivado do vínculo aberto).

### Documentação canónica

Actualizados: **BR-1.1**, **SPEC-2.5.1**, **STU-4**, **BLM-**, seed, feature marketing-landing, supabase-schema (ordem de migrações).
