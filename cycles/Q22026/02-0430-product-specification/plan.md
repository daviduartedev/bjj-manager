# Plano , Ciclo 02: Product specification (delta)

## Estado atual

- Projeto bootstrapado com README de alto nível.
- Pedido do ciclo: documentação-only em markdown, regras numeradas, linguagem objetiva.
- Decisões do refino: hub **duplo** (`spec/product/` canônico + `docs/product/` espelho); MVP persona **professor**; graduação baseada em referência **IBJJF**, **4 graus** por faixa (kids e adulto colorido; preta com graus 1–6); pulo **bloqueado** até justificativa; cobrança **manual** com estados **Pago / Não pago / Pendente / Outro** e lote **todos pagos**; **BRL** / **pt-BR**.

## Delta a entregar

1. Criar hub `spec/README.md` e feature `spec/features/product-specification/readme.md` apontando para os artefatos e convenção **SPEC-/ENT-/GR-/BR-**.
2. Autorar quatro documentos canônicos em `spec/product/`:
   - `spec.md` , visão, MVP, fora do MVP, personas, jornadas, métricas, LGPD em alto nível, referência IBJJF.
   - `entities.md` , entidades e relações alinhadas conceitualmente ao ciclo Supabase (04).
   - `graduation-rules.md` , ordens adulto/kids, graus, pulos, fora do MVP explícito.
   - `billing-rules.md` , planos, vínculo, vencimento, mês de referência, status manual, lote, exclusões.
3. Espelhar os mesmos quatro arquivos em `docs/product/` (manter sincronizados).
4. Atualizar `README.md` raiz: MVP resumido + links para `spec/product/` (fonte da verdade).
5. Registrar cenários Gherkin de negócio em `scenarios.feature` e checklist em `tasks.md`.

## Fora deste ciclo

- Código, migrations, RLS, UI.
- Alterações ao schema SQL além do que já está previsto no request do ciclo 04 (apenas alinhamento conceitual aqui).

## Riscos / notas

- **Preta**: graus 1–6 divergem do “4 graus por faixa”; documentado para evitar conflito com **GR-1.4**.
- Semântica **Pendente** vs linha ausente em `payments`: detalhar na implementação (**BR-7.2** / ciclo 13).
