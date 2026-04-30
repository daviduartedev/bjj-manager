# Feature: Especificação de produto (documentação)

## Objetivo

Fonte da verdade textual antes de implementar features de negócio: visão, escopo, entidades, graduação e cobrança.

## Documentos canônicos

| Documento | Descrição |
|-----------|-----------|
| [`spec/product/spec.md`](../../product/spec.md) | Visão, MVP, fora do MVP, personas, jornadas, métricas |
| [`spec/product/entities.md`](../../product/entities.md) | Entidades, campos, relações |
| [`spec/product/graduation-rules.md`](../../product/graduation-rules.md) | Faixas adulto/kids, graus, pulos |
| [`spec/product/billing-rules.md`](../../product/billing-rules.md) | Planos, preço, vencimento, status manual |

Cópias em [`docs/product/`](../../../docs/product/) para leitura direta no repositório.

## Ciclo

- Request: `cycles/Q22026/02-0430-product-specification/request.md`
- Plano: `cycles/Q22026/02-0430-product-specification/plan.md`
- Tarefas: `cycles/Q22026/02-0430-product-specification/tasks.md`
- Cenários: `cycles/Q22026/02-0430-product-specification/scenarios.feature`

## Consumidores

- `cycles/Q22026/04-0430-supabase-schema` — modelo de dados alinhado conceitualmente a `entities.md` e regras de graduação/cobrança.

## Decisões registradas (refino)

- Hub duplo: conteúdo canônico em `spec/product/` + espelho em `docs/product/`.
- MVP: persona ativa **professor**; aluno e outros cargos — roadmap.
- Graduação: ordem de faixas alinhada à **IBJJF** (referência pública); **4 graus** por faixa (adulto pré-black e kids); pulo de ordem **bloqueado** até justificativa; exceções normativas (transferência etc.) **fora do MVP**.
- Cobrança: **sem gateway** no MVP; professor define status **manualmente**; estados **Pago**, **Não pago**, **Pendente**, **Outro**; ação em lote **marcar todos como pagos** para um recorte/mês quando existir na UI.
- Moeda **BRL**, locale **pt-BR**.
