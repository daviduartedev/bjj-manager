# Feature: Alunos , cadastro, lista e edição

Contrato canónico para **SPEC-2.2** e **SPEC-5.2** (gestão de aluno no MVP): CRUD essencial, lista operacional e **edição rápida**, alinhado a **ENT-4**, **ENT-7**, **GR-**, **SHELL-2** e **SEC-3.3**.

## Relação com outras specs

- Shell e URLs: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2**, **SHELL-3.3**).
- Autenticação e área protegida: [`spec/features/authentication/readme.md`](../authentication/readme.md).
- Schema e enums: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`student_status`, `student_kind`, `plan_kind`).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.3**).
- Entidades: [`spec/product/entities.md`](../../product/entities.md) (**ENT-4**, **ENT-7**).
- Datas e durações (idade na lista, formatos pt-BR): [`spec/features/date-duration-utilities/readme.md`](../date-duration-utilities/readme.md) (**DATE-**, **SPEC-2.4**).
- Perfil só leitura: [`spec/features/student-profile/readme.md`](../student-profile/readme.md) (**SPR-**).
- Painel: [`spec/features/dashboard/readme.md`](../dashboard/readme.md) (**PNL-4** , mesmas durações na lista que no alerta de graduação).
- Planos e vínculo aluno–plano (Server Actions partilhadas): [`spec/features/plans-billing-model/readme.md`](../plans-billing-model/readme.md) (**BLM-**).

## Implementação (referência)

| Área | Artefatos típicos |
|------|-------------------|
| Rotas | `app/(dashboard)/alunos/page.tsx`, `…/alunos/novo/page.tsx`, `…/alunos/[id]/page.tsx`, `…/alunos/[id]/editar/page.tsx` , vista **Arquivados** / **Removidos** (sub-rota ou aba **STU-10**/ **STU-11**) |
| Actions | `actions/students.ts` (Server Actions + cliente Supabase **só servidor**) |
| Validação | `lib/validations/students.ts` (Zod); formulários com React Hook Form |
| Rotas canónicas | Constantes partilhadas com **SHELL-** (ex. `lib/routes.ts`) |

## STU-1. Rotas e navegação

**STU-1.1.** URLs públicas (primeiro segmento da área autenticada): **`/alunos`** (lista), **`/alunos/novo`** (cadastro), **`/alunos/[id]`** (perfil só leitura , **SPR-**), **`/alunos/[id]/editar`** (ficha completa).

**STU-1.2.** **Sem** componente de breadcrumb obrigatório no MVP: em **`/alunos/novo`**, **`/alunos/[id]`** e **`/alunos/[id]/editar`**, o professor deve ver **título** da página e **ligação clara** para voltar à lista (ex. texto “Alunos” ou “← Alunos”).

**STU-1.3.** O **perfil só leitura** em **`/alunos/[id]`** está definido em [**SPR-**](../student-profile/readme.md); este documento regula a **lista**, **cadastro**, **ficha completa** e **edição rápida**.

## STU-2. Segurança e tenant

**STU-2.1.** Server Actions e loaders usam o **cliente Supabase no servidor** com a sessão do utilizador; **`account_id` não é aceite do cliente** , o isolamento é garantido por **RLS** e por **`public.current_account_id()`** nas políticas (**SEC-3.3**).

**STU-2.2.** Mensagens de erro por falha de **rede**, **permissão/RLS** ou **servidor** são **genéricas** em linguagem de produto; erros de **validação de campo** permanecem **inline** no formulário.

**STU-2.3.** As Server Actions em **`actions/billing.ts`** (`updatePlanPrice`, `setStudentPlan`) seguem **BLM-3**: devolvem mensagens **específicas** para **toast**, sem usar apenas texto vazio de significado; mantêm **segurança** (sem dados sensíveis nem enumeração entre contas). Os call sites devem exibir o `error` retornado em toast.

## STU-3. Status do aluno na UI

**STU-3.1.** Filtros e selects de situação incluem **Ativo**, **Inativo** e **Pausado** (`active`, `inactive`, `paused`).

**STU-3.2.** **Trial** (`trial`) **não** é exposto neste ciclo (nem filtro nem select); o valor pode existir no enum por compatibilidade com dados/evo futura.

**STU-3.3.** **`inactive`** e **`paused`** significam que o aluno **não faz parte da carteira de cobrança mensal em curso**: continuam registados e podem ser achados através de filtros adequados (**STU-7**) mas **não entram na lista trabalhável de `/mensalidades`** nem nas contagens de KPI mensais ligadas ao mesmo universo que essa lista (**BR-9**, **BUI-**, e secções pertinentes do **PNL-** onde o indicador partilhar o mesmo recorte).

**STU-3.4.** **Arquivar** (camada **`archived_at`**, ver **ENT-4**) e **Remover cadastro** (**`removed_at`**) são acções **distintas entre si** e **distinta** de apenas `inactive`/`paused`; em todos os casos **não** há eliminação física de **`payments`** ou **`generated_documents`** ligados.

**STU-3.5.** Enquanto **`archived_at`** ou **`removed_at`** estão preenchidos, o aluno sai do **valor por defeito** da vista operativa diária de alunos até operação reversible prevista (**STU-10**, **STU-11**).

## STU-4. Planos e tipo de aluno

**STU-4.1.** **`student_kind`** `adult` só pode associar-se a planos com **`plan_kind = adult`** da mesma conta.

**STU-4.2.** **`student_kind`** `kids` pode associar-se a planos **`kids_1`**, **`kids_2`** ou **`adult`** da mesma conta (professor coloca manualmente juvenil na turma/preço de adulto quando aplicável).

**STU-4.3.** A UI **não deve permitir** combinações incoerentes (ex.: adulto em plano kids); listas de plano seguem **STU-4.1**/**STU-4.2** e o servidor valida com as mesmas regras.

## STU-5. Cadastro e graduação

**STU-5.1.** No **create**, **não** é obrigatório (nem esperado neste ciclo) criar linha em **`student_graduations`**; basta preencher **`current_belt_id`** e **`current_degree`** em `students`.

**STU-5.2.** Campos obrigatórios na ficha alinhados ao pedido de ciclo: nome, data de nascimento, data de entrada na academia, tipo, faixa inicial, grau inicial, plano, dia de vencimento (vínculo **`student_plans`**); opcionais: documento (CPF), telefone, e-mail, observações.

**STU-5.3.** Limites finos de grau por faixa seguem **GR-** (validação na app).

## STU-6. Máscaras e formato

**STU-6.1.** Quando preenchidos, **CPF**, **telefone** e **e-mail** usam **máscaras** na UI e validação **forte** onde aplicável (ex. dígitos verificadores do CPF).

## STU-7. Lista

**STU-7.1.** Busca por **nome** com **debounce** no cliente.

**STU-7.2.** **Paginação** por páginas (não scroll infinito). O tamanho da página é definido por **constante** partilhada no código (ex. `lib/constants/students.ts`), valor por defeito escolhido pela implementação (ex. 20) e citável em revisões.

**STU-7.2.1.** Filtro opcional por **plano comercial** do vínculo aberto (**`plan_kind`** em `plans`, com `student_plans.ended_at` nulo): **Todos**, **Adulto**, **Kids 1**, **Kids 2**; parâmetro de URL **`plan`** (`lib/students/alunos-url.ts`). Com um plano específico seleccionado, alunos **sem** vínculo aberto não entram no resultado.

**STU-7.3.** Controlo de **ordenação** com três modos: **nome (A–Z)**, **data de entrada** (`academy_start_date`), **última alteração** (`students.updated_at`). Registos com `academy_start_date` nulo ordenam **depois** dos com data, mantendo ordem estável por nome ou `updated_at` como desempate.

**STU-7.4.** Cada linha ou card mostra: **nome**, **faixa e grau** atuais, **idade** (ou equivalente claro quando não houver data de nascimento, ex. **"–"**; cálculo via **DATE-4**), **status**. **Em complemento**, deve ser **evidente** (segunda linha ou texto auxiliar) o **tempo na faixa actual** e o **tempo no grau actual**, em pt-BR breve (ex. «Na faixa: 8 meses · No grau: 3 meses»), usando **DATE-** em **America/São_Paulo**: referência preferencial à **última** entrada em **`student_graduations`** que reflecte a faixa actual (para «na faixa») e o par (faixa, grau) actual (para «no grau»); se não houver histórico suficiente, usar **`academy_start_date`** como referência para ambos e sinalizar na UX como **aproximado** quando aplicável. Em viewports estreitas, apresentação em **cartões** empilhados.

**STU-7.5.** Lista vazia (sem resultados para filtros atuais): mensagem adequada; se a conta **não tem alunos**, **empty state** com CTA **“Cadastrar primeiro aluno”** → **`/alunos/novo`**.

**STU-7.6.** **Clique principal** na linha ou cartão **abre o perfil** do aluno (**`/alunos/[id]`** , **SPR-10.1**). Uma **acção secundária** explícita na mesma linha/card **abre a edição rápida** (**STU-8**) **sem** navegar para o perfil (**SPR-10.2**). O acesso à **ficha completa** mantém-se conforme **STU-8.2** / links dedicados (**SPR-10.3**).

## STU-8. Edição rápida

**STU-8.1.** A partir da lista, o professor abre **edição rápida** ( **Dialog** ou **Sheet** , Radix/shadcn alinhado ao DS) para alterar sem ir à ficha completa: **status** (ativo / inativo / pausado), **plano** (compatível), **dia de vencimento** do vínculo aberto, **faixa atual**, **grau atual**. Alterações que passem pelo núcleo de **`setStudentPlan`** geram **nova linha** de histórico em `student_plans` (**ENT-7.3**, **BLM-5**), inclusive quando o plano escolhido é o mesmo.

**STU-8.2.** **Nome**, **datas** (nascimento, entrada), **documento**, **contactos** e **observações** são tratados na **ficha completa** (`/alunos/[id]/editar`).

**STU-8.3.** Após sucesso (criação, ficha completa ou edição rápida), mostrar **toast** de confirmação; erros de campo **inline** onde aplicável.

## STU-9. API das Server Actions (nomes)

**STU-9.1.** **Base:** `createStudent`, `updateStudent`, `setStudentStatus` (**apenas** mudanças do enum **`student_status`**). Mudar para **`inactive`** ou **`paused`** **não** equivale por si só a **Arquivar** ou a **Remover cadastro**.

**STU-9.2.** Nomes legacy tipo **`deleteStudent`** só são admissíveis se estiverem **documentados como alias** inequívoco de **`inactive`** (**sem DELETE físico**) ; **rótulos de produto «Remover»** que impliquem **STU-11** **não** podem apenas chamar esse alias (**STU-3.4**).

**STU-9.3.** **Arquivo:** `archiveStudent`, `unarchiveStudent` (**STU-10**). **Remoção soft:** acção típica `removeStudentFromDirectory`/`undoRemoveStudentFromDirectory` ou nomenclatura equivalente documentada (**STU-11**). Todas com **servidor** + tenant.

**STU-9.4.** A lógica de vínculo aluno-plano (**ENT-7**, **BLM-5**) mantém‑se sempre que alterações tocando em plano passarem pela camada já existente de **`actions/billing.ts`** / **`lib/billing/`**.

## STU-10. Arquivar / desarquivar

**STU-10.1.** **Arquivar** preenche **`archived_at`** (instante servidor) sobre `students`; **desarquivar** limpa **`archived_at`**. Preferir registar opcionalmente **quem** executou (**`lifecycle_updated_by` → profiles**) quando já existir coluna (**ENT-4**, schema).

**STU-10.2.** **Confirmação obrigatória** com texto explícindo **exclusão do quadro de mensalidades** e **dos KPIs mensais ligados ao mesmo recorte**, e onde consultar arquivo.

**STU-10.3.** **Vistas dedicadas:** professor encontra arquivo via **lista**, **abas** ou **rota próprias** («Arquivados») sem confundir com aluno apenas **inactive**/`paused`.

**STU-10.4.** **Invariante servidor:** **`archived_at` e `removed_at` não ficam simultaneamente preenchidos**. Nova acção arquivo exige **`removed_at` IS NULL**; nova remoção exige **`archived_at` IS NULL**.

**STU-10.5.** **Histórico financeiro** (**SPR-8** onde aplicável): permite **consulta** de pagamentos já existentes; **novos `recordPayment`** só quando o ciclo assim o permitir após regressar aos critérios de elegibilidade (**BR-9**, **SPR-9**).

## STU-11. Remover cadastro (soft directory removal)

**STU-11.1.** **Remover cadastro** preenche **`removed_at`** **sem DELETE** físico das linhas de **`students`**, **`payments`** ou **`generated_documents`**.

**STU-11.2.** **Confirmação obrigatória** destacando semântica **distinta do arquivo**: caso típico **cadastro erróneo / duplicado** onde o professor já **não** quer o registro no dia a dia.

**STU-11.3.** **Vistas dedicadas** (**«Removidos»** ou secção dentro do módulo) permitem encontrar esse recorte até **reverse** onde o ciclo permite.

**STU-11.4.** Ao **reverter**, limpar **`removed_at`** conforme servidor e regressar aos fluxos activos combinando **`student_status`** e campos de ciclo vida (**STU-3**, **STU-10**).

## Manutenção

Alterações em rotas sob **`/alunos`**, regras de plano/tipo, ou políticas em `students` / `student_plans` devem actualizar **este readme**, **`spec/features/dashboard/readme.md`** quando afectarem métricas do painel, **`spec/features/billing-ui/readme.md`** e **`spec/features/payments-billing-status/readme.md`** quando a carteira **`/mensalidades`** mudar (**BR-9**), **`spec/product/billing-rules.md`** + **`docs/product/billing-rules.md`**, **`spec/features/plans-billing-model/readme.md`**, **`spec/features/app-shell/readme.md`**, **`spec/features/student-profile/readme.md`** e **`spec/features/supabase-schema/readme.md`** quando o DDL mudar, e cenários em `cycles/Q22026/08-0430-students-crud/scenarios.feature`, `cycles/Q22026/10-0430-student-profile/scenarios.feature`, `cycles/Q22026/14-0430-billing-ui/scenarios.feature` e `cycles/Q22026/15-0430-dashboard/scenarios.feature` quando o comportamento observável ao professor mudar.
