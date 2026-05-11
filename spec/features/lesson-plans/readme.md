# Feature: Planos de aula (módulo pedagógico)

Contrato canónico para o **módulo pedagógico**: cadastro, manutenção, histórico, exportação em PDF e organização mensal de planos de aula por **tipo de plano** (`adult`, `kids_1`, `kids_2`), reaproveitando o enum **`plan_kind`** (**ENT-6.1**, **BR-1.1**) , **não** se cria enum próprio.

## Relação com outras specs

- Visão e MVP: [`spec/product/spec.md`](../../product/spec.md) (**SPEC-2.8** , módulo pedagógico no MVP).
- Entidades: [`spec/product/entities.md`](../../product/entities.md) (**E11**, **E12**, **E13**).
- Shell e rotas: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2** , rota **`/pedagogico/planos`**).
- Geração de PDF: [`spec/features/payment-receipts/readme.md`](../payment-receipts/readme.md) (**REC-3** , motor partilhado HTML → PDF) e [`spec/features/student-documents/readme.md`](../student-documents/readme.md) (**DOC-3** , storage e numeração).
- Schema: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`lesson_plans`, `lesson_plan_revisions`, `lesson_plan_attachments`).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.x** , isolamento por `account_id`).
- Datas: [`spec/features/date-duration-utilities/readme.md`](../date-duration-utilities/readme.md) (**DATE-1**, mês de referência em **America/Sao_Paulo**).

## Implementação (referência)

| Área | Artefactos típicos |
|------|---------------------|
| Rotas | `app/(dashboard)/pedagogico/planos/{page.tsx, novo, [id], [id]/editar}` |
| Domínio | `lib/lesson-plans/{service.ts,repository.ts,validators.ts}` |
| Validação | `lib/validations/lesson-plans.ts` |
| Server Actions | `actions/lesson-plans.ts` , criar, atualizar, publicar, arquivar, duplicar, anexar |
| PDF | `lib/lesson-plans/pdf.ts` (delega ao motor partilhado **REC-3**) |
| UI | `components/lesson-plans/{plans-client,plan-editor,plan-preview,plan-list}.tsx` |

---

## PED-1. Rota e papel da feature

**PED-1.1.** O módulo pedagógico vive sob **`/pedagogico/planos`**, em **pt-BR**, na área autenticada (**SHELL-2**). Subrotas:

| Rota | Função |
|------|--------|
| `/pedagogico/planos` | Listagem mensal, filtros e CTA principal `Novo plano` |
| `/pedagogico/planos/novo` | Editor para criação manual |
| `/pedagogico/planos/[id]` | Visualização detalhada (read-only) |
| `/pedagogico/planos/[id]/editar` | Editor para edição em rascunho |

**PED-1.2.** O destino canónico do utilizador para **fechar o planeamento mensal** é **`/pedagogico/planos`**; a navegação principal (**SHELL-3.1**) ganha o item **Pedagógico** apontando para esta rota.

**PED-1.3.** A feature é independente de cobrança e graduação; relaciona-se com elas apenas pela **categoria** (reaproveitamento de `plan_kind`) e pela **identidade da academia** (`account_id`).

---

## PED-2. Categoria do plano

**PED-2.1.** O campo `category` do plano de aula reaproveita a enum **`plan_kind`** (**ENT-6.1**, valores `adult`, `kids_1`, `kids_2`). **Não** existe enum `LessonPlanCategory`. Rótulos pt-BR seguem **BR-1.1** (Adulto, Kids 1, Kids 2).

**PED-2.2.** Mudar o nome de exibição comercial dos planos em **`/configuracoes`** **não** altera a categoria pedagógica , a categoria liga-se ao **tipo técnico** (`plan_kind`), não ao rótulo editável (`plans.name`).

---

## PED-3. Mês de referência

**PED-3.1.** Cada plano tem **`reference_month`** no formato `YYYY-MM-01` (mesmo padrão de `payments.reference_month` , **BR-3.1**, **PBS-1.1**), persistido como `date`.

**PED-3.2.** Pode haver mais de um plano por par (`reference_month`, `category`), mas **apenas um** pode estar **`PUBLISHED`** simultaneamente para esse par. Garantia via **índice único parcial** (`WHERE status = 'published'`).

**PED-3.3.** A regra acima é **reforçada no banco** e na Server Action; tentar publicar um segundo plano para o mesmo par exibe diálogo de confirmação que **arquiva** o plano publicado anteriormente antes de promover o novo.

---

## PED-4. Status do plano

**PED-4.1.** Estados permitidos:

| Estado | Significado |
|--------|-------------|
| `draft` | Rascunho editável; validação parcial |
| `published` | Plano vigente para o par (`reference_month`, `category`) |
| `archived` | Histórico imutável; consultável mas não editável |

**PED-4.2.** Transições:

- `draft` → `published`: requer mínimos de **PED-7** preenchidos.
- `draft` → `archived`: permitido (descarte de rascunho preservando histórico).
- `published` → `archived`: permitido (encerra vigência sem apagar).
- `archived` → `draft`: bloqueado; criar um novo plano (eventualmente por **duplicação**).
- `published` → `draft`: bloqueado; alterações pós-publicação geram **nova revisão** (**PED-6**).

---

## PED-5. Campos persistidos (entidade `LessonPlan`)

Ver **E11** em [`spec/product/entities.md`](../../product/entities.md). Resumo da camada de produto:

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| `account_id` | Sim | Multi-tenant (**SEC-**) |
| `teacher_id` | Sim | Professor responsável (FK para `profiles.id`) |
| `title` | Sim | 5 a 150 caracteres |
| `reference_month` | Sim | `date` no dia 1 do mês |
| `category` | Sim | `plan_kind` |
| `status` | Sim | `draft` / `published` / `archived` |
| `current_revision_id` | Não | FK para a revisão actual (**PED-6**) |
| `archived_at` | Não | `timestamptz` |
| `created_at`, `updated_at` | Sim | `timestamptz` |

---

## PED-6. Revisões (`LessonPlanRevision`)

**PED-6.1.** O **conteúdo** do plano (descrição rica, tópicos, técnicas, observações) **não** vive em `lesson_plans`; vive em **`lesson_plan_revisions`** numerada (**E12**), apontada pelo `current_revision_id` do plano.

**PED-6.2.** Toda **edição** de um plano cria **nova revisão** (incrementa `revision_number`); a anterior fica histórica e consultável (**RB-PLN-004**). Edição **não** sobrescreve linha existente.

**PED-6.3.** Conteúdo persistido em revisão:

| Campo | Tipo | Notas |
|-------|------|-------|
| `rich_description` | `jsonb` | Modelo **PED-9** (TipTap mínimo serializado) |
| `topics` | `jsonb` | Lista ordenada de objectos `{ id, title, items[] }` |
| `techniques` | `jsonb` | Opcional; mesmo formato de `topics` |
| `observations` | `jsonb` | Opcional; **PED-9** mesmo serializador |
| `created_by_user_id` | `uuid` | FK para `profiles.id` |

**PED-6.4.** Para **publicação**, o plano aponta para a revisão actual; quando o utilizador descarta uma edição em rascunho, o `current_revision_id` permanece na revisão anterior , a revisão descartada é apagada.

---

## PED-7. Validação para publicação

**PED-7.1.** Para transitar para **`published`**, o plano precisa de:

- `title` válido;
- `reference_month` válido (mês 01 a 12 de qualquer ano permitido pela UI);
- `category` válida;
- `topics` com **pelo menos um tópico não vazio**;
- `teacher_id` válido (professor pertencente à conta).

**PED-7.2.** **Rascunho** (`draft`) não exige conteúdo mínimo, exceto `title`, `reference_month`, `category` e `teacher_id`.

---

## PED-8. Operações suportadas

**PED-8.1. Criar plano** (`POST /api/lesson-plans` ou Server Action `createLessonPlan`):

- preenche `account_id` no servidor (sem aceitar do cliente, **SEC-3.x**);
- cria `LessonPlan` com `status = draft`;
- cria revisão #1 vazia (estrutura zero) e aponta `current_revision_id`.

**PED-8.2. Atualizar plano** (`updateLessonPlan`):

- altera **metadados** (`title`, `teacher_id`) directamente em `lesson_plans`;
- altera **conteúdo** criando **nova revisão** (**PED-6**), nunca mutando a anterior.

**PED-8.3. Publicar plano** (`publishLessonPlan`):

- valida **PED-7.1**;
- se já existe `published` para o mesmo par (`reference_month`, `category`), exigir confirmação que **arquiva** o publicado actual (**PED-3.3**);
- transita o plano alvo para `published`.

**PED-8.4. Arquivar plano** (`archiveLessonPlan`): coloca `status = archived` e `archived_at = now()`.

**PED-8.5. Duplicar plano** (`duplicateLessonPlan`):

- cria novo `LessonPlan` com `status = draft`, copiando `category`, `topics`, `techniques`, `rich_description`, `observations` da revisão actual da origem para uma **nova revisão #1** do destino;
- pede ao utilizador o **novo `reference_month`** e o **`title`** (default `"<title-original> , <novo mês>"`);
- **não** copia o status `published` (**RB-PLN-003**);
- **não** copia anexos por defeito; opção secundária para incluir.

**PED-8.6. Anexar materiais** (`addLessonPlanAttachment`): persiste linha em `lesson_plan_attachments` (**E13**) e faz upload do binário no Supabase Storage seguindo o padrão **DOC-7** (mesma convenção de prefixo, mas bucket próprio).

---

## PED-9. Editor pedagógico

**PED-9.1.** O editor combina:

- **listas estruturadas** próprias (componente `SortableTopicList`) para `topics` e `techniques` , drag-and-drop, item com `title` e `items[]`;
- **rich text mínimo** baseado em **TipTap** para `rich_description` e `observations` , extensões: `Heading` (h2/h3), `Bold`, `Italic`, `BulletList`, `OrderedList`, `Paragraph`. **Sem** menus complexos, embeds, mídias inline ou collaboration.

**PED-9.2.** A serialização persiste o **JSON do TipTap** em `rich_description` / `observations`. O renderer para PDF e visualização recebe o mesmo JSON; o motor de PDF (**REC-3.2**) trata o HTML resultante.

**PED-9.3.** O conteúdo de referência canónica de **Maio/2026** descrito em **§7.4 do request** deve caber na estrutura **PED-6.3** (listas hierárquicas em `topics`; observações livres em `rich_description` / `observations`).

---

## PED-10. Listagem (`/pedagogico/planos`)

**PED-10.1.** Filtros: **mês** (selector `month`), **categoria** (Adulto/Kids 1/Kids 2/Todas), **status** (Rascunho/Publicado/Arquivado/Todos), **professor** (quando houver mais que um na conta , quando há um único, o filtro é omitido).

**PED-10.2.** Filtros persistem em **querystring** (`?mes=YYYY-MM&categoria=adult&status=published&professor=…`) para que o painel/atalhos do **PNL-** possam abrir a lista pré-filtrada (paralelo a **BUI-2.6**).

**PED-10.3.** Ordenação default: `reference_month DESC`, depois `category ASC`, depois `updated_at DESC`.

**PED-10.4.** Cada linha/cartão exibe: **título**, **categoria** (badge), **mês** (**DATE-6**), **professor**, **status**, **última atualização**, e um menu com **Editar / Duplicar / Exportar PDF / Arquivar**.

**PED-10.5.** **Mobile:** cartões empilhados; **desktop:** tabela densa.

---

## PED-11. Visualização (`/pedagogico/planos/[id]`)

**PED-11.1.** Cabeçalho com **breadcrumbs** (`Pedagógico → Planos → <título>`), nome da categoria, mês, status, professor.

**PED-11.2.** Secções: **Visão geral** (descrição rica), **Tópicos**, **Técnicas**, **Observações**, **Anexos**, **Histórico de revisões**.

**PED-11.3.** Acções na toolbar: **Editar**, **Duplicar**, **Exportar PDF**, **Imprimir**, **Arquivar** (quando aplicável).

---

## PED-12. Exportação em PDF

**PED-12.1.** O endpoint/Server Action `getLessonPlanPdfUrl(planId)` chama o motor partilhado descrito em **REC-3** com template **`lesson-plan/v1`**.

**PED-12.2.** O PDF inclui: cabeçalho da academia (logo + `account.name`), título do plano, mês, categoria, professor, e o conteúdo da revisão actual em ordem hierárquica (tópicos com sub-itens, técnicas, observações). Anexos **não** são embutidos no PDF principal.

**PED-12.3.** O resultado é **persistido** como `GeneratedDocument` (tipo `lesson_plan`) com `payload_snapshot` (revisão usada) e `template_version` (**RB-DOC-002**, **DOC-5**); chamadas subsequentes ao mesmo plano sem nova revisão devolvem o documento já gerado pela URL assinada (**DOC-6**).

---

## PED-13. Permissões (MVP)

**PED-13.1.** Neste ciclo o produto mantém **um único papel operacional** (professor/dono da conta , **SPEC-3.6**). Todas as acções **PED-** estão disponíveis para esse papel, sujeitas a RLS por `account_id`.

**PED-13.2.** A matriz **§17.2** do request (OWNER/ADMIN/INSTRUCTOR/FINANCE/SECRETARY/VIEWER) **não** é implementada agora; fica como evolução futura sem mudar contrato **PED-**.

---

## PED-14. Segurança e isolamento

**PED-14.1.** Toda query passa por RLS (**SEC-3.x**); `account_id` **não** é aceite do cliente em nenhuma Server Action (**SEC-3.3**).

**PED-14.2.** Acesso a anexos faz-se sempre por **URL assinada temporária** (default 15 min, **DOC-6.2**).

**PED-14.3.** Tentativa cross-tenant retorna **404** genérico (**SPR-2.2**); nunca expor existência de planos de outras contas.

---

## PED-15. Auditoria e observabilidade

**PED-15.1.** Eventos de domínio emitidos: `lesson_plan.created`, `lesson_plan.updated`, `lesson_plan.published`, `lesson_plan.archived`, `lesson_plan.duplicated`, `lesson_plan.pdf_generated`.

**PED-15.2.** Logs estruturados seguem **DOC-10**: `event_name`, `account_id`, `user_id`, `lesson_plan_id`, `revision_id` (quando aplicável), `template_version`, `status`, `duration_ms`.

---

## PED-16. Fora do escopo (deste ciclo)

- Planeamento semanal derivado do mensal.
- Associação de plano a calendário/aulas executadas.
- Comentários colaborativos em tempo real.
- Aprovação por coordenador.
- Sugestão por IA.
- Editor rico colaborativo (multi-cursor).

---

## Manutenção

Alterações em `lesson_plans`, no editor pedagógico ou nas regras de revisão devem actualizar **este readme**, [`spec/product/entities.md`](../../product/entities.md) (**E11**, **E12**, **E13**) + [`docs/product/entities.md`](../../../docs/product/entities.md), [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md), [`spec/features/payment-receipts/readme.md`](../payment-receipts/readme.md) quando o motor de PDF mudar, e os cenários do ciclo em `cycles/Q22026/25-0510-pedagogical-documents-finance/scenarios.feature`.
