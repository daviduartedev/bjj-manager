# Plano — Billing UI + chrome premium (delta)

## Estado actual (spec)

- **PBS-** / **BLM-** / **BR-**: pagamentos, preço efetivo e indicadores mensais definidos; UI de cobrança explicitamente fora do ciclo 13.
- **SHELL-2**: segmento canónico **`/mensalidades`** (não `/billing`).
- **SPR-9.3**: modal «Registrar pagamento» no perfil ainda placeholder.
- **BD**: tabela `payments` sem coluna de método de pagamento.

## Decisões de produto (refino)

| Tema | Decisão |
|------|---------|
| Rotas | **`/mensalidades`** (lista) e **`/mensalidades/[studentId]`** (detalhe financeiro). Actualizar navegação, `ROUTES`, middleware e documentação; **não** introduzir `/billing` na URL. |
| Papel do professor | O fluxo principal é o **relatório/fecho mensal**: lista por mês com todos os alunos, filtros e marcação em lote. O detalhe por aluno serve **apoio** (histórico, correcções). |
| Valor no registo | Mantém-se **PBS-4.2**: valor = **preço efetivo** do vínculo aberto; UI pode pré-preencher e validar sem permitir outro montante neste ciclo. |
| Método (PIX, dinheiro, …) | Persistir em coluna opcional **`payment_method`** (`text` nullable) em `payments`, exposta no diálogo e em **`recordPayment`** — mais limpo que prefixar `notes`. |
| Filtros da lista | **Todos**, **Pago**, **Pendente**, **Atrasado**, **Bolsista**, **Outro**. **Atrasado** = indicador derivado **`overdue`** apenas (exclui Pago, Bolsista e Outro da etiqueta «atrasado»). |
| Marcação em lote | **Sim**: selecção por checkbox na lista filtrada, **«Seleccionar todos os visíveis»**, desmarcar excepções à mão, acção **«Marcar seleccionados como pagos»** com modal de confirmação (quantidade, soma em BRL, data do pagamento partilhada). Alunos sem plano activo são ignorados ou listados com aviso — ver **BUI-**. |
| Estorno | Disponível no **histórico** da vista por aluno (**voidPayment**), com confirmação — não é obrigatório na lista geral. |
| Meses passados | Para indicadores derivados quando o **mês seleccionado** é anterior ao mês civil actual em São Paulo, usar **data de corte** = **último momento civil desse mês de referência** em lugar de «hoje», para o estado Pendente/Atrasado reflectir o **fecho daquele mês** (ver **BUI-3** no readme da feature). |
| Perfil do aluno | Substituir placeholder por **mesmo diálogo / mesmas actions**; texto **SPR-** actualizado. Ligação opcional «Abrir na lista mensal» para alinhar com o fluxo principal. |
| Testes | Checklist manual + lint/typecheck; E2E opcional como stretch. |
| Rollout | Sem feature flag; disponibilização directa após validação. |

## Delta visual (área autenticada)

- **Menu lateral preto** (#050505 / tokens `--secondary`), navegação activa com **acento da marca** (vermelho).
- **Mais cor da paleta BJJ** no conteúdo: gradientes subtis no fundo da área de trabalho, cartões e estados hover conforme **DS-1.11** e novo **DS-1.12** (chrome premium).
- Escopo: layout **`(dashboard)`**, sem alterar páginas públicas de marketing salvo overlap óbvio.

## Documentação a actualizar (obrigatório)

- `spec/features/billing-ui/readme.md` (**BUI-**, novo).
- `spec/features/payments-billing-status/readme.md` — método opcional alinhado à coluna.
- `spec/features/app-shell/readme.md` — subrotas `/mensalidades`, chrome escuro na sidebar.
- `spec/features/design-system/readme.md` — **DS-1.12**.
- `spec/features/student-profile/readme.md` — **SPR-8** / **SPR-9**.
- `spec/features/supabase-schema/readme.md` — coluna `payment_method`.
- `spec/product/entities.md` — **ENT-8** (método opcional).
- Espelhos em `docs/product/` onde aplicável.
- `spec/README.md` — entrada da nova feature.

## Implementação (referência técnica)

| Área | Artefactos típicos |
|------|---------------------|
| Rotas | `app/(dashboard)/mensalidades/page.tsx`, `app/(dashboard)/mensalidades/[studentId]/page.tsx` |
| Componentes | Lista mensal (tabela desktop / cards mobile), filtros, selector de mês, diálogo registo, diálogo confirmação em lote |
| Servidor | Reutilizar `recordPayment`, `voidPayment`; nova **`recordPaymentsBulk`** (ou nome equivalente) que aplica a mesma validação por aluno e agrega erros |
| BD | Migração: `ALTER TABLE payments ADD COLUMN payment_method text NULL` |
| Design | `globals.css` tokens `--shell-*`, `dashboard-shell.tsx`, `dashboard-nav-config` |

## Relação com o request original do ciclo

O request mencionava `billing/page.tsx`; o plano **substitui** por **`mensalidades`** para consistência com **SHELL-2** e código existente (`ROUTES.mensalidades`, `revalidatePath`).
