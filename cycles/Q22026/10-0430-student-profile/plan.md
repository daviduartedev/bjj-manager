# Plano , Perfil do aluno (delta)

## Contexto

Depois do CRUD e da lista, o professor precisa de uma **vista de leitura** densa e hierárquica com dados pessoais, graduação, financeiro do mês e histórico , a página mais visitada. Este ciclo introduz **`/alunos/[id]`**, alinha a lista à navegação (perfil vs edição rápida) e deixa **Promover** / **Registrar pagamento** como **modais placeholder** até aos ciclos 11 e 13.

## Respostas do refino (consolidado)

| # | Tema | Decisão |
|---|------|---------|
| 1 | Rota do perfil | **`/alunos/[id]`** (pt-BR, alinhado a **SHELL-2** e **STU-1**). O pedido original em inglês (`students`) serve só como analogia de estrutura Next. |
| 2 | Lista → ações | **Clique principal** na linha/card abre o **perfil** (`/alunos/[id]`). **Controlo secundário explícito** (ex.: ícone “lápis” ou botão “Edição rápida”) abre o **mesmo fluxo de edição rápida** já definido em **STU-8** (Dialog/Sheet), **sem** saltar para a ficha completa. Opcional: na linha, link textual **“Ficha completa”** → `/alunos/[id]/editar` (coerente com **STU-8.2**). |
| 3 | Voltar | **Igual à ficha completa** (**STU-1.2**): título da página + ligação clara **“← Alunos”** → `/alunos`. |
| 4 | Promover / Pagamento | **Dialog cliente** só com copy de produto: funcionalidade completa virá nos ciclos **11** (graduação) e **13** (pagamentos); **sem** escritas em base nem rotas fictícias que pareçam concluídas. Botão primário **“Fechar”** (ou equivalente). |
| 5 | Histórico de graduações vazio | Mostrar **faixa e grau atuais** a partir de `students` (resumo no topo do separador). Lista cronológica: **empty state** (“Ainda não há graduações registadas”) , **sem** linha sintética na lista como se fosse evento persistido. |
| 6 | Observações | **Um único bloco**, no separador **Dados pessoais** , **sem** separador duplicado só para observações. |
| 7 | Financeiro do mês | Mostrar o **estado efectivo** do mês corrente com rótulos **pt-BR** para todos os valores persistidos ou derivados por **BR-4.4**: **Pago**, **Não pago**, **Pendente**, **Bolsista**, **Outro**. **Indicador “Atrasado”** como **complemento** quando **BR-4.3** se aplica (ex.: vencimento já passou no mês de referência **e** o estado não é **Pago** nem **Bolsista**); **Outro** pode seguir regra do ciclo 13 para exclusão da automação , até lá, não contradizer **BR-4.3** na UI. |
| 8 | Últimos pagamentos | Até **12** meses de referência **com linha** em `payments` (mais recentes primeiro). Colunas: **mês de referência** (formato **DATE-**), **status**, **valor efectivo** quando existir, **data do pagamento** quando **Pago**. Meses sem linha **não** aparecem nesta lista resumida (o cartão do mês corrente trata **BR-4.4**). |
| 9 | Avatar | **Placeholder** estático neste ciclo (sem upload nem URL). |
| 10 | Tempo na faixa / no grau | **Com histórico:** `started_at` = data da **última** linha em `student_graduations` (ordenada por data da graduação) onde o par **(faixa, grau)** passou a coincidir com o estado **actual** do aluno após essa linha (transição que estabelece o estado actual). Implementação pode usar diff com estado “antes” da linha ou campos armazenados , desde que o resultado seja o mesmo para o utilizador. **Sem histórico:** usar **`academy_start_date`** como `from` para **ambos** os textos (**DATE-5**), e nota curta na UI: baseado na data de entrada; registar graduações para maior precisão. |
| 11 | Transição kids → adulto | **Banner** informativo quando **`student_kind`** é kids **e** a idade calculada (**DATE-4**) é **≥ 16 anos**, alinhado a **GR-3.1** (decisão de faixa adulta continua manual). |
| 12 | Id inexistente / outro tenant | **`notFound()`** (Next) , experiência **404** genérica da app, sem mensagens que revelem existência de IDs alheios (**STU-2.2**). |
| 13 | Testes | **Vitest** só se surgirem helpers puros novos; **sem** obrigatoriedade de E2E neste repo hoje. **Checklist manual** obrigatório no fecho do ciclo (perfil, lista, RLS). |

## Delta em relação ao estado canônico actual

- **Antes:** **STU-1.3** afastava página de perfil só leitura para ciclo futuro; lista não obrigava destino de clique principal.
- **Depois:** perfil canónico **SPR-** em [`spec/features/student-profile/readme.md`](../../../spec/features/student-profile/readme.md); **STU-1** e **STU-7** actualizados para navegação lista ↔ perfil ↔ edição rápida; **SHELL-2** exemplifica **`/alunos/[id]`**.

## Implementação (referência para o ciclo)

| Área | Artefatos típicos |
|------|-------------------|
| Página | `app/(dashboard)/alunos/[id]/page.tsx` (RSC; dados via Supabase servidor + sessão) |
| UI | `Section` + `Card`; tabs com scroll horizontal em mobile; componentes cliente só para tabs/modais |
| Dados | Queries/joins: `students`, `belts`, `student_plans`/`plans`, `student_graduations`, `payments` (conforme schema) |
| Modais | `PromoteStudentPlaceholderDialog`, `RecordPaymentPlaceholderDialog` (ou nomes equivalentes) |
| Lista | Ajustar handlers: row → `href` perfil; botão secundário → abrir Sheet/Dialog **STU-8** |

## Alinhamento com outros ciclos

- **09-0430-date-duration-utilities** (**DATE-**): formatos e durações no perfil.
- **11-0430-graduation-engine**: substitui placeholder **Promover**.
- **13-0430-payments-billing-status**: substitui placeholder **Registrar pagamento** e pode refinar lista/hint **Outro**/atraso.

## Fora de escopo

- Gráficos; upload de foto; implementação real de promoção ou lançamento de pagamento; breadcrumb novo além de **STU-1.2**.

## Riscos / notas

- N+1 em históricos: preferir query agregada ou limites claros (**12** meses em pagamentos).
- Consistência **Atrasado** com job **BR-4.5**: a UI pode derivar antes da persistência de **Não pago** , o texto deve reflectir “vencimento ultrapassado” sem assumir estado já gravado se o produto quiser mostrar **Pendente** até ao job; acordo: mostrar **estado tratado** (incl. ausência = Pendente) **e** chip **Atrasado** quando calendário + **BR-4.3**.

## Referências

- `cycles/Q22026/10-0430-student-profile/request.md`
- `spec/features/student-profile/readme.md` (**SPR-**)
- `spec/features/students-crud/readme.md` (**STU-**)
- `spec/product/billing-rules.md` (**BR-4**)
- `spec/product/graduation-rules.md` (**GR-3**)
