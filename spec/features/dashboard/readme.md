# Feature: Painel operacional (`/painel`)

Contrato canónico para a **página inicial autenticada**: KPIs, «Atenção hoje», distribuição por faixa e atalhos, alinhado a **SPEC-2.7**, **SHELL-2**, **PBS-**, **BUI-**, **STU-**, **DATE-** e **GR-**.

## Relação com outras specs

- Shell e URLs: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2**, **SHELL-5.3** redirect `/dashboard` → `/painel`).
- Cobrança e indicadores: [`spec/features/payments-billing-status/readme.md`](../payments-billing-status/readme.md) (**PBS-6**).
- Regras de quadro mensal: [`spec/product/billing-rules.md`](../../product/billing-rules.md) (**BR-9**).
- Lista mensalidades: [`spec/features/billing-ui/readme.md`](../billing-ui/readme.md) (**BUI-2.6**, **BUI-2.7**, **BUI-2.8**, query `filtro`).
- Lista alunos: [`spec/features/students-crud/readme.md`](../students-crud/readme.md) (**STU-7.4** , durações alinhadas a **PNL-4.3** / **PNL-4.4**).
- Graduação e ordem de faixas: [`spec/product/graduation-rules.md`](../../product/graduation-rules.md) (**GR-**).
- Datas: [`spec/features/date-duration-utilities/readme.md`](../date-duration-utilities/readme.md) (**DATE-**).

## Implementação (referência)

| Área | Artefactos típicos |
|------|---------------------|
| Página | `app/(dashboard)/painel/page.tsx` (Server Component; fetch em paralelo) |
| Loading | `app/(dashboard)/painel/loading.tsx` (skeletons) |
| Domínio | `lib/data/painel.ts` ou módulos dedicados + helpers puros testáveis |
| Rotas | `lib/routes.ts` , construir query strings alinhadas a **BUI-2.6** |

---

## PNL-1. Rota e audiência

**PNL-1.1.** O dashboard de produto reside em **`/painel`** (**SHELL-2**), não em `/dashboard` (**SHELL-5.3**).

**PNL-1.2.** O conteúdo completo dos KPIs e listas assume **conta válida** (`getCurrentAccount`); se o utilizador estiver autenticado mas **sem vínculo** de domínio (**AUTH-6.1**), a experiência segue **SHELL-6.2** (mensagem genérica / orientação), **sem** expor métricas da academia.

---

## PNL-2. KPI , Alunos ativos

**PNL-2.1.** Mostrar **totais** de alunos com **`student_status = active`**, **`archived_at`** e **`removed_at`** nulos (**ENT-4**, **STU-3**).

**PNL-2.2.** O cartão liga à **lista de alunos** (`/alunos`), preferencialmente com filtro **ativo** já aplicado se a lista o suportar; caso contrário, `/alunos` só.

---

## PNL-3. KPI , Mensalidades atrasadas

**PNL-3.1.** **Mês de referência** = primeiro dia do **mês civil actual** em **America/São_Paulo** (**PBS-1**).

**PNL-3.2.** **Contagem** = número de **alunos distintos**, **dentro do mesmo recorte que a lista trabalhável de `/mensalidades`** (**BR-9.1**, **BUI-2.7**), para os quais o **`MonthBillingIndicator`** é **`overdue`** nesse mês (**PBS-3**).

**PNL-3.3.** O cartão liga a **`/mensalidades?filtro=atrasado`** (**BUI-2.6**). Opcionalmente acrescentar **`mes=`** se o painel algum dia permitir mudar o mês de contexto; no MVP o parâmetro pode omitir-se (lista usa default do mês actual).

---

## PNL-4. KPI , Aniversariantes e alertas de graduação

**PNL-4.1.** **Aniversariantes do mês**: contagem de alunos contados segundo **PNL-2.1**, com **data de nascimento** cujo dia/mês cai no **mês civil atual** (SP). O cartão liga a **`/alunos`** (lista), com prioridade de implementação para **filtro ou âncora** que destaque aniversariantes quando existir; até lá, lista geral aceitável desde que o cenário de ciclo exija visibilidade dos nomes na secção «Atenção hoje» (**PNL-5.1**).

**PNL-4.2.** **Alertas de graduação** (heurística MVP, configurável mais tarde): considerar apenas alunos contados segundo **PNL-2.1**; incluir o aluno se **`daysOnCurrentDegree`** ≥ **120** dias civis SP **ou** **`daysOnCurrentBelt`** ≥ **365** dias civis SP.

**PNL-4.3.** **Cálculo , tempo no grau:** data de referência = **`graduated_at`** da **última** linha em **`student_graduations`** cujo par **(faixa resultante, grau resultante)** coincide com **`students.current_belt_id`** / **`current_degree`**; se não existir, usar **`academy_start_date`** como referência única e tratá-la como aproximação na UX quando relevante.

**PNL-4.4.** **Cálculo , tempo na faixa:** data de referência = **`graduated_at`** da **última** linha em **`student_graduations`** onde a faixa resultante coincide com a faixa actual; se não existir, **`academy_start_date`**.

**PNL-4.5.** O cartão ou lista resumo liga a **`/alunos`** (prioridade: filtro «alertas» quando existir; senão lista completa).

---

## PNL-5. Secção «Atenção hoje»

**PNL-5.1.** **Aniversariantes do dia**: alunos contados segundo **PNL-2.1**, com DOB e aniversário **neste dia civil** (SP); mostrar **nome completo**; lista **sem limite artificial**.

**PNL-5.2.** **Vencimentos no dia**: alunos com **`student_status = active`**, **`archived_at`** e **`removed_at`** nulos, com **vínculo aberto** em **`student_plans`**, para os quais o **dia de vencimento civil** no **mês de referência actual** coincide com **hoje** (**PBS-2**).

**PNL-5.3.** **Atraso prolongado**: mesmo universo de **PNL-5.2** (**BR-9**), **`MonthBillingIndicator` = `overdue`** (**PBS-3**) e **pelo menos 14 dias civis SP** desde o dia de vencimento civil desse mês até **`today`**. Lista **sem limite artificial**.

**PNL-5.4.** Sem **gráficos pesados**; texto e listas compactas.

---

## PNL-6. Distribuição por faixa

**PNL-6.1.** Duas subsecções: **Adulto** e **Kids**, usando **`student_kind`** (**STU-4**); apenas entram contagens os alunos contados segundo **PNL-2.1**.

**PNL-6.2.** Em cada uma, contagens por **faixa** (rótulo + **cor da barra alinhada ao slug da faixa** na UI , paleta estável em código até existir **`belts.color_hex`** na BD), ordenadas pela **ordem oficial** (**GR-** / catálogo `belts`).

**PNL-6.3.** Apresentação **compacta** (lista densa); **barra horizontal simples** opcional por linha, proporcional ao maior valor da secção , sem gráficos complexos.

**PNL-6.4.** Clique pode navegar para **`/alunos`** com filtro futuro por faixa; MVP: **`/alunos`** ou permanecer só leitura no painel.

---

## PNL-7. Ações rápidas

**PNL-7.1.** **Cadastrar aluno** → **`/alunos/novo`**.

**PNL-7.2.** **Registrar pagamento** → **`/mensalidades?filtro=pendente`** (revisa quem está pendente ou equivalente no mês visível , **BUI-2**).

---

## PNL-8. Desempenho, loading e mobile

**PNL-8.1.** Dados obtidos no **servidor**; **parallel fetch** onde independente.

**PNL-8.2.** **`loading.tsx`** com **skeletons** coherentes com **DS-** / **SHELL-6**; evitar spinner isolado a ocupar o viewport.

**PNL-8.3.** Em **mobile**, KPIs em **grelha 2×2**; secções empilhadas.

---

## PNL-9. Estados vazios

**PNL-9.1.** Quando um bloco não tem itens, mostrar **mensagem explícita** curta em pt-BR (ex.: «Nenhum aniversariante hoje»), mantendo hierarquia visual do painel.

---

## Manutenção

Alterações em KPIs, URLs ou heurísticas devem actualizar **este readme**, **`spec/features/billing-ui/readme.md`** se mudarem o contrato de query, **`spec/features/students-crud/readme.md`** se o recorte **`BR-9`** mudar, **`spec/product/billing-rules.md`** (**BR-9**), e cenários em `cycles/Q22026/15-0430-dashboard/scenarios.feature` quando comportamento observable mudar.
