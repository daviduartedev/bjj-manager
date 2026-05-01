# Feature: UI de mensalidades e cobrança (lista + detalhe)

Contrato canónico para as **telas de fecho mensal** usadas pelo professor na área autenticada: lista em **`/mensalidades`**, detalhe financeiro por aluno em **`/mensalidades/[studentId]`**, diálogos de registo e marcação em lote, alinhados a **PBS-**, **BR-** e **BLM-**.

## Relação com outras specs

- Rotas e navegação: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2**, **SHELL-3**).
- Pagamentos e indicadores: [`spec/features/payments-billing-status/readme.md`](../payments-billing-status/readme.md) (**PBS-**).
- Planos e preço efetivo: [`spec/features/plans-billing-model/readme.md`](../plans-billing-model/readme.md) (**BLM-6**).
- Regras de produto: [`spec/product/billing-rules.md`](../../product/billing-rules.md) (**BR-4**, **BR-5**).
- Perfil do aluno: [`spec/features/student-profile/readme.md`](../student-profile/readme.md) (**SPR-8**, **SPR-9**).
- Tokens e chrome: [`spec/features/design-system/readme.md`](../design-system/readme.md) (**DS-1.11**, **DS-1.12**).
- Schema: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`payments.payment_method`).
- Painel: [`spec/features/dashboard/readme.md`](../dashboard/readme.md) (**PNL-** — atalhos com **BUI-2.6**).

## Implementação (referência)

| Área | Artefactos típicos |
|------|---------------------|
| Lista | `app/(dashboard)/mensalidades/page.tsx` |
| Detalhe | `app/(dashboard)/mensalidades/[studentId]/page.tsx` |
| Ações | `actions/billing.ts` — `recordPayment`, `voidPayment`, marcação em lote |
| Rotas | `lib/routes.ts` — `mensalidades` (sem segmento `/billing` na URL) |

---

## BUI-1. Rotas e papel da lista

**BUI-1.1.** A **lista geral** vive em **`/mensalidades`** e é o destino principal para o professor **organizar o relatório mensal** (quem pagou, quem falta, totais implícitos por filtros).

**BUI-1.2.** O **detalhe financeiro** em **`/mensalidades/[studentId]`** complementa a lista com **histórico** e **estorno** pontual; não substitui a lista para o fecho global.

**BUI-1.3.** Ficheiros sob `app/(dashboard)/` podem usar pasta interna `billing/` apenas como organização de código; **URLs públicas** permanecem **`/mensalidades`** (**SHELL-2**).

---

## BUI-2. Lista mensal

**BUI-2.1.** Selector de **mês de referência** com defeito = **mês civil actual** em **America/São_Paulo** (**BR-3**, **PBS-1**).

**BUI-2.2.** Cada linha mostra: **nome**, **plano** (rótulo compreensível), **valor efectivo** esperado (**BLM-6**), **dia de vencimento**, **estado** (badge semântico **DS** / classes `badge-paid`, `badge-pending`, `badge-overdue` onde aplicável).

**BUI-2.3.** **Filtros:** **Todos**, **Pago**, **Pendente**, **Atrasado**, **Bolsista**, **Outro**. Busca por **nome** (substring, pt-BR case-insensitive razoável).

**BUI-2.4.** **«Atrasado»** no filtro corresponde apenas ao indicador derivado **`overdue`** (**PBS-3**), não a linhas **Pago**, **Bolsista** ou **Outro**.

**BUI-2.5.** **Desktop:** tabela densa legível; **mobile:** mesmos dados em **cartões** empilhados; **sem gráficos** neste âmbito.

**BUI-2.6.** Parâmetro opcional de query **`filtro`** na URL da lista **`/mensalidades`**: valores admitidos (pt-BR, case-insensitive) **`todos`**, **`pago`**, **`pendente`**, **`atrasado`**, **`bolsista`**, **`outro`** — mapeados aos indicadores internos (**`paid`**, **`pending`**, **`overdue`**, **`scholarship`**, **`other`**) e ao modo «todos». Parâmetro ausente, desconhecido ou vazio equivale a **`todos`**. A página deve **inicializar** o selector de filtro em coerência com o servidor (props derivadas de `searchParams`), para que atalhos do **painel** (**PNL-3.3**, **PNL-7.2**) abram a lista já filtrada.

---

## BUI-3. Mês histórico vs mês actual

**BUI-3.1.** Quando o **mês seleccionado** é **anterior** ao mês civil actual (SP), os indicadores **Pendente** / **Atrasado** derivados devem usar como «hoje» de comparação o **último instante civil desse mês de referência** (fim do mês), para que o professor veja o estado **tal como no fecho daquele período**, e não misture com o calendário actual.

**BUI-3.2.** Para o **mês civil actual**, mantém-se **PBS-1.2** / **DATE-1** com a data **actual** em São Paulo.

---

## BUI-4. Registar pagamento (diálogo)

**BUI-4.1.** Campos: **mês de referência** (default coerente com a página); **valor** igual ao **preço efectivo** — sem edição para outro montante (**PBS-4.2**); **data do pagamento** (default hoje); **método** opcional (texto livre); **observações** opcionais.

**BUI-4.2.** **Persistência** do método: coluna **`payments.payment_method`** (texto nullable), não obrigatória para negócio.

**BUI-4.3.** **Toasts** em sucesso ou erro (**BLM-3**); **Server Actions** revalidam todos os caminhos afectados (**lista**, **painel**, **alunos**, **perfil do aluno**, **detalhe mensalidades**).

**BUI-4.4.** **Mobile:** diálogo em modo próximo de **ecrã cheio** (sheet ou dialog alto).

---

## BUI-5. Marcação em lote

**BUI-5.1.** Cada linha tem **checkbox**; existe **«Seleccionar todos os visíveis»** (após filtros e busca).

**BUI-5.2.** O professor pode **desmarcar** excepções antes de confirmar (**BR-5.1**).

**BUI-5.3.** Acção **«Marcar seleccionados como pagos»** abre **confirmação** (**BR-5.2**): número de alunos, **soma dos valores** efectivos, **data do pagamento** partilhada pelos registos.

**BUI-5.4.** Alunos **sem vínculo aberto** (**PBS-4.1**): **não** incluir no lote ou falhar com mensagem **por aluno** no resultado agregado; não bloquear silenciosamente.

**BUI-5.5.** Cada registo satisfaz **PBS-4**; reutilizar a mesma validação que **`recordPayment`** único.

---

## BUI-6. Detalhe por aluno

**BUI-6.1.** Mostrar **resumo** (plano actual, valor efectivo, vencimento, estado do mês visível).

**BUI-6.2.** **Histórico** em ordem **cronológica inversa**.

**BUI-6.3.** **Estorno** disponível por linha de histórico quando aplicável (**PBS-5**), com segunda confirmação.

---

## BUI-7. Perfil do aluno (`/alunos/[id]`)

**BUI-7.1.** O botão **Registrar pagamento** usa o **mesmo fluxo** que na lista (sem placeholder).

**BUI-7.2.** Após registo, dados coherentes entre **perfil** e **`/mensalidades`** (revalidação).

---

## BUI-8. Chrome premium (dashboard)

**BUI-8.1.** **Sidebar** da área autenticada com fundo **preto de marca** (token **`--secondary`** / **#050505**), texto e ícones com contraste adequado (**WCAG** razoável).

**BUI-8.2.** **Área de conteúdo:** mais uso da **paleta BJJ** (vermelho, verde, azul, amarelo de estado) em **acentos**, **gradientes subtis** e **cartões**, sempre via **tokens** (**DS-1.11**, **DS-1.12**).

**BUI-8.3.** Não alterar requisitos de **toque ≥ 44px** nem foco visível (**DS-1.3**, **DS-1.4**).

---

## Manutenção

Alterações nestas telas ou no fluxo de registo devem actualizar **este readme**, **`spec/features/app-shell/readme.md`** se mudarem paths, **`spec/features/dashboard/readme.md`** se mudarem **BUI-2.6** ou atalhos do painel, **`spec/features/student-profile/readme.md`** se afectarem **SPR-8/9**, **`spec/features/payments-billing-status/readme.md`** se mudarem contratos **PBS-**, e cenários em `cycles/.../14-0430-billing-ui/scenarios.feature`.
