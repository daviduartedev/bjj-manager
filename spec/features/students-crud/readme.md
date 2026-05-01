# Feature: Alunos — cadastro, lista e edição

Contrato canónico para **SPEC-2.2** e **SPEC-5.2** (gestão de aluno no MVP): CRUD essencial, lista operacional e **edição rápida**, alinhado a **ENT-4**, **ENT-7**, **GR-**, **SHELL-2** e **SEC-3.3**.

## Relação com outras specs

- Shell e URLs: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2**, **SHELL-3.3**).
- Autenticação e área protegida: [`spec/features/authentication/readme.md`](../authentication/readme.md).
- Schema e enums: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`student_status`, `student_kind`, `plan_kind`).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.3**).
- Entidades: [`spec/product/entities.md`](../../product/entities.md) (**ENT-4**, **ENT-7**).
- Datas e durações (idade na lista, formatos pt-BR): [`spec/features/date-duration-utilities/readme.md`](../date-duration-utilities/readme.md) (**DATE-**, **SPEC-2.4**).
- Perfil só leitura: [`spec/features/student-profile/readme.md`](../student-profile/readme.md) (**SPR-**).
- Planos e vínculo aluno–plano (Server Actions partilhadas): [`spec/features/plans-billing-model/readme.md`](../plans-billing-model/readme.md) (**BLM-**).

## Implementação (referência)

| Área | Artefatos típicos |
|------|-------------------|
| Rotas | `app/(dashboard)/alunos/page.tsx`, `…/alunos/novo/page.tsx`, `…/alunos/[id]/page.tsx`, `…/alunos/[id]/editar/page.tsx` |
| Actions | `actions/students.ts` (Server Actions + cliente Supabase **só servidor**) |
| Validação | `lib/validations/students.ts` (Zod); formulários com React Hook Form |
| Rotas canónicas | Constantes partilhadas com **SHELL-** (ex. `lib/routes.ts`) |

## STU-1. Rotas e navegação

**STU-1.1.** URLs públicas (primeiro segmento da área autenticada): **`/alunos`** (lista), **`/alunos/novo`** (cadastro), **`/alunos/[id]`** (perfil só leitura — **SPR-**), **`/alunos/[id]/editar`** (ficha completa).

**STU-1.2.** **Sem** componente de breadcrumb obrigatório no MVP: em **`/alunos/novo`**, **`/alunos/[id]`** e **`/alunos/[id]/editar`**, o professor deve ver **título** da página e **ligação clara** para voltar à lista (ex. texto “Alunos” ou “← Alunos”).

**STU-1.3.** O **perfil só leitura** em **`/alunos/[id]`** está definido em [**SPR-**](../student-profile/readme.md); este documento regula a **lista**, **cadastro**, **ficha completa** e **edição rápida**.

## STU-2. Segurança e tenant

**STU-2.1.** Server Actions e loaders usam o **cliente Supabase no servidor** com a sessão do utilizador; **`account_id` não é aceite do cliente** — o isolamento é garantido por **RLS** e por **`public.current_account_id()`** nas políticas (**SEC-3.3**).

**STU-2.2.** Mensagens de erro por falha de **rede**, **permissão/RLS** ou **servidor** são **genéricas** em linguagem de produto; erros de **validação de campo** permanecem **inline** no formulário.

**STU-2.3.** As Server Actions em **`actions/billing.ts`** (`updatePlanPrice`, `setStudentPlan`) seguem **BLM-3**: devolvem mensagens **específicas** para **toast**, sem usar apenas texto vazio de significado; mantêm **segurança** (sem dados sensíveis nem enumeração entre contas). Os call sites devem exibir o `error` retornado em toast.

## STU-3. Status do aluno na UI

**STU-3.1.** Filtros e selects de situação incluem **Ativo**, **Inativo** e **Pausado** (`active`, `inactive`, `paused`).

**STU-3.2.** **Trial** (`trial`) **não** é exposto neste ciclo (nem filtro nem select); o valor pode existir no enum por compatibilidade com dados/evo futura.

**STU-3.3.** Ação de **“remover” / desligar da operação ativa** na UI corresponde a **`inactive`** — **sem** `DELETE` físico de `students` neste ciclo.

## STU-4. Planos e tipo de aluno

**STU-4.1.** **`student_kind`** `adult` só pode associar-se a planos com **`plan_kind = adult`** da mesma conta.

**STU-4.2.** **`student_kind`** `kids` só pode associar-se a planos com **`plan_kind`** em `{ kids_1, kids_2 }` da mesma conta.

**STU-4.3.** A UI **não deve permitir** selecionar combinação incoerente (filtrar opções de plano por tipo de aluno e validar no servidor).

## STU-5. Cadastro e graduação

**STU-5.1.** No **create**, **não** é obrigatório (nem esperado neste ciclo) criar linha em **`student_graduations`**; basta preencher **`current_belt_id`** e **`current_degree`** em `students`.

**STU-5.2.** Campos obrigatórios na ficha alinhados ao pedido de ciclo: nome, data de nascimento, data de entrada na academia, tipo, faixa inicial, grau inicial, plano, dia de vencimento (vínculo **`student_plans`**); opcionais: documento (CPF), telefone, e-mail, observações.

**STU-5.3.** Limites finos de grau por faixa seguem **GR-** (validação na app).

## STU-6. Máscaras e formato

**STU-6.1.** Quando preenchidos, **CPF**, **telefone** e **e-mail** usam **máscaras** na UI e validação **forte** onde aplicável (ex. dígitos verificadores do CPF).

## STU-7. Lista

**STU-7.1.** Busca por **nome** com **debounce** no cliente.

**STU-7.2.** **Paginação** por páginas (não scroll infinito). O tamanho da página é definido por **constante** partilhada no código (ex. `lib/constants/students.ts`), valor por defeito escolhido pela implementação (ex. 20) e citável em revisões.

**STU-7.3.** Controlo de **ordenação** com três modos: **nome (A–Z)**, **data de entrada** (`academy_start_date`), **última alteração** (`students.updated_at`). Registos com `academy_start_date` nulo ordenam **depois** dos com data, mantendo ordem estável por nome ou `updated_at` como desempate.

**STU-7.4.** Cada linha ou card mostra: **nome**, **faixa e grau** atuais, **idade** (ou equivalente claro quando não houver data de nascimento — **"—"**; cálculo via **DATE-4**), **status**. Em viewports estreitas, apresentação em **cartões** empilhados.

**STU-7.5.** Lista vazia (sem resultados para filtros atuais): mensagem adequada; se a conta **não tem alunos**, **empty state** com CTA **“Cadastrar primeiro aluno”** → **`/alunos/novo`**.

**STU-7.6.** **Clique principal** na linha ou cartão **abre o perfil** do aluno (**`/alunos/[id]`** — **SPR-10.1**). Uma **acção secundária** explícita na mesma linha/card **abre a edição rápida** (**STU-8**) **sem** navegar para o perfil (**SPR-10.2**). O acesso à **ficha completa** mantém-se conforme **STU-8.2** / links dedicados (**SPR-10.3**).

## STU-8. Edição rápida

**STU-8.1.** A partir da lista, o professor abre **edição rápida** ( **Dialog** ou **Sheet** — Radix/shadcn alinhado ao DS) para alterar sem ir à ficha completa: **status** (ativo / inativo / pausado), **plano** (compatível), **dia de vencimento** do vínculo aberto, **faixa atual**, **grau atual**. Alterações que passem pelo núcleo de **`setStudentPlan`** geram **nova linha** de histórico em `student_plans` (**ENT-7.3**, **BLM-5**), inclusive quando o plano escolhido é o mesmo.

**STU-8.2.** **Nome**, **datas** (nascimento, entrada), **documento**, **contactos** e **observações** são tratados na **ficha completa** (`/alunos/[id]/editar`).

**STU-8.3.** Após sucesso (criação, ficha completa ou edição rápida), mostrar **toast** de confirmação; erros de campo **inline** onde aplicável.

## STU-9. API das Server Actions (nomes)

**STU-9.1.** O ciclo prevê as ações: `createStudent`, `updateStudent`, `setStudentStatus`, `deleteStudent`. **`deleteStudent`** tem semântica de **desativação** (**`inactive`**), não remoção física da linha. A lógica canónica de vínculo aluno–plano está alinhada a **`actions/billing.ts`** / **`lib/billing/`** (**BLM-5**); o CRUD de alunos reutiliza o mesmo comportamento.

## Manutenção

Alterações em rotas sob **`/alunos`**, regras de plano/tipo, ou políticas em `students` / `student_plans` devem actualizar **este readme**, **`spec/features/plans-billing-model/readme.md`**, **`spec/features/app-shell/readme.md`** e **`spec/features/student-profile/readme.md`** se afectarem navegação perfil/lista, e os cenários em `cycles/.../08-0430-students-crud/scenarios.feature` e `cycles/.../10-0430-student-profile/scenarios.feature` quando aplicável.
