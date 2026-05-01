# Plano — Painel operacional (15-0430-dashboard)

Delta face ao estado canónico **antes** deste ciclo: `SPEC-2.7` genérico; `/painel` como placeholder; filtros de `/mensalidades` só no estado cliente; lista de alunos sem durações na linha.

## Decisões consolidadas (respostas + defaults de produto)

| Tema | Decisão |
|------|---------|
| Rota / ficheiro | **`/painel`** → `app/(dashboard)/painel/page.tsx` (sem nova rota `/dashboard`; redirect histórico mantém-se — **SHELL-5.3**). |
| Alunos activos (KPI) | Contagem de alunos com **`student_status = active`** (**STU-3.1**). |
| Mensalidades atrasadas (KPI) | Mês de referência = primeiro dia do **mês civil actual em São Paulo** (**PBS-1**); contagem = **alunos distintos** com indicador **`overdue`** nesse mês (**PBS-3**). |
| Atalho cobrança | **`/mensalidades?filtro=atrasado`** (+ **`mes=YYYY-MM-DD`** só quando o painel fixar mês não-default — por defeito omitido). Implementação alinhada a **BUI-2.6** (novo). |
| Aniversários | Só alunos com **data de nascimento**; na lista do painel usar **nome completo** (coerente com lista de alunos). |
| Alertas de graduação | Heurística MVP **PNL-4.2**: «atenção» se **`daysOnCurrentDegree`** ≥ **120** dias civis SP **ou** **`daysOnCurrentBelt`** ≥ **365** dias. Derivación: última linha em **`student_graduations`** que define o par actual (faixa, grau); se não houver, **`academy_start_date`** como referência para ambos (limitação explícita na doc). Configuração por conta **fora** deste ciclo. |
| Lista de alunos (professor) | **STU-7.4** alargado: tempo na faixa e no grau **visíveis** na lista (ver spec). |
| Atenção hoje — vencimentos | Dia de vencimento civil = **hoje** no mês de referência actual, com vínculo aberto (**PBS-2**). |
| Atenção hoje — atrasados «há mais de X dias» | Indicador **`overdue`** no mês actual **e** ≥ **14** dias civis SP desde o **vencimento civil** desse mês até hoje (**PNL-5.3**). |
| Limite de linhas em Atenção hoje | **Nenhum** — listas completas (**5.3-Não**). |
| Distribuição por faixa | Duas secções (**Adulto** / **Kids**); contagens por **faixa** (rótulo + cor); ordenação pela **ordem oficial de graduação** (**GR-**); barras horizontais finas opcionais proporcionais ao máximo da secção (sem gráficos pesados). |
| Acção Cadastrar aluno | **`/alunos/novo`** (**ROUTES.alunosNovo**). |
| Acção Registrar pagamento | **`/mensalidades?filtro=pendente`** — foco em quem ainda não regularizou no mês visível (lista já carrega mês actual). |
| Estados vazios | Mensagens explícitas por bloco («Nenhum aniversariante hoje», etc.), sem ocultar títulos de secção de forma inconsistente. |
| Conta sem vínculo (`ctx` ausente) | Manter painel de **configuração pendente** actual (**AUTH-6** / **SHELL-6.2**); KPIs só com conta válida. |
| Testes | Testes unitários para **helpers puros** de agregação/datas; QA manual do `/painel`; sem obrigação de e2e neste ciclo. |
| Rollout | Sem feature flag — activação directa após critérios do ciclo. |

## Alterações canónicas (ficheiros)

1. **`spec/features/dashboard/readme.md`** (novo) — IDs **PNL-**.
2. **`spec/README.md`** — entrada na matriz de features.
3. **`spec/product/spec.md`** e **`docs/product/spec.md`** — **SPEC-2.7** com referência ao **PNL-**.
4. **`spec/features/app-shell/readme.md`** — referência ao conteúdo do painel (**PNL-**).
5. **`spec/features/students-crud/readme.md`** — **STU-7.4** (durações na lista).
6. **`spec/features/billing-ui/readme.md`** — **BUI-2.6** (query `filtro` + espelho de valores).
7. **`spec/features/payments-billing-status/readme.md`** — referência cruzada ao painel (**PBS-6**) já existente; reforço se necessário.

## Implementação técnica (orientação)

- **Server Components**: `painel/page.tsx` orquestra **fetch em paralelo** (Promise.all ou equivalente); dados via camada existente (`lib/data/*`, Supabase servidor, **PBS-6** onde aplicável).
- **Loading**: `loading.tsx` no segmento **`painel`** com **skeletons** alinhados a **DS-** / **SHELL-6** (sem spinners grandes).
- **Mobile**: grelha KPI **2×2**; secções empilhadas.
- **Ligações**: cada KPI / cartão clicável para destino canónico (**SHELL-2**, **BUI-1**).

## Fora de scope explícito

- Persistência de limiares de graduação na BD ou em **`/configuracoes`** (previsto «depois»).
- Gráficos densos ou dashboards analíticos avançados.

## Referências

- Pedido: `cycles/Q22026/15-0430-dashboard/request.md`
- **SHELL-**, **PBS-**, **BUI-**, **STU-**, **DATE-**, **GRD-**, **GR-**
