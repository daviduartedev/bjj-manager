# Product Specification

## Context
O BJJ Manager precisa de uma fonte da verdade textual antes de
implementar qualquer feature. Sem uma spec consolidada, os ciclos
seguintes ficam ambíguos e mudam de escopo no meio do caminho. Este
ciclo é só documentação: visão, escopo, regras, entidades e jornadas.

## Intent
- Documento `docs/product/spec.md` com visão, MVP, fora-do-MVP,
  personas, jornadas principais, métricas de sucesso.
- Documento `docs/product/entities.md` listando cada entidade do
  domínio com campos obrigatórios, opcionais e relações.
- Documento `docs/product/graduation-rules.md` com:
  - faixas adultas (Branca, Azul, Roxa, Marrom, Preta);
  - faixas kids (Branca → Cinza/Branca → Cinza → Cinza/Preta →
    Amarela/Branca → Amarela → Amarela/Preta → Laranja/Branca →
    Laranja → Laranja/Preta → Verde/Branca → Verde → Verde/Preta);
  - regra de alerta ao pular ordem;
  - obrigatoriedade de justificativa em pulo.
- Documento `docs/product/billing-rules.md` com:
  - planos Kids e Adulto, valor configurável por professor;
  - preço personalizado por aluno;
  - dia de vencimento por aluno;
  - status: Pago, Pendente, Atrasado.

## Taste / Constraints
- Apenas markdown; sem código.
- Cada regra **numerada** para virar referência rastreável nos próximos
  ciclos.
- Linguagem objetiva: listas curtas, frases declarativas.
- Fora do MVP fica **explicitamente** listado (presença, turmas, QR,
  WhatsApp, documentos, certificados, exportação, app do aluno).

## References
- Briefing original.
- `cycles/Q22026/04-0430-supabase-schema/request.md` (consumidor desta
  spec).

## Attachments
- (nenhum)
