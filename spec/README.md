# Hub de especificação (BJJ Manager)

Documentação canônica de produto e domínio. Implementação e ciclos devem referenciar **regras numeradas** nos documentos abaixo.

## Produto e domínio

| Área | Caminho canônico | Cópia legível |
|------|------------------|---------------|
| Visão, MVP, personas, jornadas, métricas | [`spec/product/spec.md`](product/spec.md) | [`docs/product/spec.md`](../docs/product/spec.md) |
| Entidades e relações | [`spec/product/entities.md`](product/entities.md) | [`docs/product/entities.md`](../docs/product/entities.md) |
| Graduações (faixas, graus, pulos) | [`spec/product/graduation-rules.md`](product/graduation-rules.md) | [`docs/product/graduation-rules.md`](../docs/product/graduation-rules.md) |
| Planos e cobrança (manual) | [`spec/product/billing-rules.md`](product/billing-rules.md) | [`docs/product/billing-rules.md`](../docs/product/billing-rules.md) |

## Features rastreadas

- [`spec/features/product-specification/readme.md`](features/product-specification/readme.md) — ciclo de consolidação da documentação de produto (Q2 2026).

## Convenção de IDs de regra

- **SPEC-** — visão, escopo, métricas (`spec.md`).
- **ENT-** — entidades (`entities.md`).
- **GR-** — graduação (`graduation-rules.md`).
- **BR-** — cobrança (`billing-rules.md`).

## Manutenção e rastreabilidade

1. **`spec/product/` e `docs/product/`** — altere sempre **os dois** no mesmo commit; confira com hash ou diff antes de finalizar.
2. **Ciclos de implementação** — em `plan.md`, `tasks.md`, mensagens de commit ou revisões, cite IDs **SPEC-**, **ENT-**, **GR-**, **BR-** quando a mudança decorrer de uma regra canônica.
