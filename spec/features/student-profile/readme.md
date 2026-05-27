# Feature: Perfil do aluno (leitura)

Contrato canónico para a **vista de detalhe só leitura** do aluno (**SPEC-2.2**, **SPEC-5.2**): resumo operacional, separadores por domínio, integração com lista e com ciclos futuros de graduação e cobrança.

## Relação com outras specs

- Lista, edição rápida e ficha completa: [`spec/features/students-crud/readme.md`](../students-crud/readme.md) (**STU-1**, **STU-7**, **STU-8**).
- Shell e URLs: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2**, **SHELL-3.3**).
- Datas e durações: [`spec/features/date-duration-utilities/readme.md`](../date-duration-utilities/readme.md) (**DATE-**).
- Cobrança: [`spec/product/billing-rules.md`](../../product/billing-rules.md) (**BR-4**).
- Graduação e transição kids/adulto: [`spec/product/graduation-rules.md`](../../product/graduation-rules.md) (**GR-3**); fluxo de promoção e histórico completo: [`spec/features/graduation-engine/readme.md`](../graduation-engine/readme.md) (**GRD-**).
- Entidades: [`spec/product/entities.md`](../../product/entities.md) (**ENT-4**, **ENT-5**, **ENT-7**, **ENT-8**).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.3**).

## Implementação (referência)

| Área | Artefatos típicos |
|------|-------------------|
| Rota | `app/(dashboard)/alunos/[id]/page.tsx` (RSC) |
| Constantes | `lib/routes.ts` , helper para `/alunos/[id]` |
| UI | `Section`, `Card`, tabs (Radix/shadcn); client apenas onde há estado local (tabs, modais) |
| Modais | **Promover** , fluxo real **GRD-**; **Registrar pagamento** , placeholder até ao ciclo de cobrança |

---

## SPR-1. Rota e papel da página

**SPR-1.1.** O perfil do aluno situa-se em **`/alunos/[id]`**, em **pt-BR**, dentro da área autenticada (**SHELL-2**).

**SPR-1.2.** A página é **predominantemente só leitura**; alterações estruturadas fazem-se pela **ficha completa** (`/alunos/[id]/editar` , **STU-1.1**) ou pela **edição rápida** na lista (**STU-8**).

**SPR-1.3.** O cabeçalho da página inclui **ligação clara para voltar à lista**, no mesmo espírito de **STU-1.2** (ex.: **“← Alunos”** + título com nome do aluno).

---

## SPR-2. Segurança e erro

**SPR-2.1.** Os dados carregam **no servidor** com cliente Supabase e sessão; **`account_id` não é aceite do cliente** (**STU-2.1**, **SEC-3.3**).

**SPR-2.2.** Se não existir aluno visível para o tenant (inexistente ou bloqueado por RLS), usar **`notFound()`** , **404** genérica da aplicação, **sem** mensagens que confirmem ou neguem existência de recursos de outras contas (**STU-2.2**).

---

## SPR-3. Resumo no topo

**SPR-3.1.** O resumo mostra: **nome**, **avatar** como **placeholder** estático (sem upload neste ciclo), **faixa e grau actuais** (badge ou equivalente), **tipo** (Adulto / Kids), **status** com os mesmos rótulos de UI que **STU-3.1** (`active` → Ativo, etc.; **trial** não exposto), **idade** com **DATE-4** e placeholder **","** se não houver data de nascimento.

**SPR-3.2.** **Sem gráficos** nesta página.

---

## SPR-4. Alerta kids → adulto

**SPR-4.1.** Quando **`student_kind`** indica **kids** e **`calculateAge`** (**DATE-4**) devolve **≥ 16** anos, mostrar **banner** informativo alinhado a **GR-3.1**: a primeira faixa adulta aplicável é decisão do professor; o sistema não força alteração automática de faixa ou tipo neste ciclo.

---

## SPR-5. Organização em separadores

**SPR-5.1.** O conteúdo organiza-se em **separadores** (tabs): **Dados pessoais**, **Graduação**, **Financeiro**, **Presença** (**SPR-12**), **Documentos** (**SPR-11**).

**SPR-5.2.** **Observações** do aluno aparecem **apenas** em **Dados pessoais** , **não** há separador dedicado só para observações (evitar duplicação de texto).

**SPR-5.3.** **Mobile:** separadores em **linha horizontal com scroll**; conteúdo em **cards empilhados** onde fizer sentido (**SPEC-10.1**, mobile-first).

**SPR-5.4.** Hierarquia visual: combinação de **`Section`** + **`Card`** (ou equivalentes do DS), **densa mas legível**.

---

## SPR-6. Dados pessoais

**SPR-6.1.** Campos esperados na área de leitura (quando existirem na base): data de nascimento, data de entrada na academia, contactos (telefone, e-mail), documento se aplicável, **observações** , formatos e máscaras de apresentação coerentes com **STU-6** / ficha completa.

**SPR-6.2.** Datas de apresentação: **DATE-6** onde for data única; durações relativas (**DATE-7**) onde o produto pedir “há N meses”.

---

## SPR-7. Graduação

**SPR-7.1.** Mostrar **faixa** e **grau actuais** a partir de `students` (sempre visíveis no separador, mesmo sem histórico).

**SPR-7.2.** **Tempo na faixa** e **tempo no grau** usam **DATE-5** com **`today`** injectado pelo servidor:

- **Com** linhas em **`student_graduations`:** `from` é a **data da graduação** da **última** entrada no histórico que, em conjunto com as anteriores, **estabelece** o par actual **(faixa, grau)** como estado vigente após esse evento (ou seja, o ponto a partir do qual o aluno está na faixa e no grau actuais).

- **Sem** histórico: usar **`academy_start_date`** como `from` para **ambos** os textos; acrescentar **nota curta** na UI de que o cálculo usa a data de entrada até haver registos de graduação.

**SPR-7.3.** **Histórico no separador:** mostrar até **5** eventos mais recentes de **`student_graduations`**, da mais recente para a mais antiga; cada evento com **data**, **faixa** e **grau resultantes**; se **`was_skip`**, mostrar **justificativa** (**ENT-5**, **GR-4**). **CTA** explícito **“Ver histórico completo”** → **`/alunos/[id]/graduacoes`** (**GRD-1.1**).

**SPR-7.4.** Se não houver linhas em **`student_graduations`**, mostrar **empty state** explícito (“Ainda não há graduações registadas” ou equivalente) , **sem** criar linhas fictícias na lista; o CTA **GRD** pode coexistir com o empty state (abre página dedicada igualmente vazia até primeira promoção).

**SPR-7.5.** A página **`/alunos/[id]/graduacoes`** (histórico **completo**) está especificada em **GRD-**; o perfil não duplica a timeline inteira.

---

## SPR-8. Financeiro

**SPR-8.1.** **Plano actual** (via vínculo aberto **ENT-7**): nome/tipo do plano, **preço efectivo** (personalizado **custom_price_cents** se definido, senão preço do plano , **BR-2.2**), **dia de vencimento** (**BR-2.3**).

**SPR-8.2.** **Mês corrente** (referência no dia **1** do mês civil em **America/Sao_Paulo**, **BR-3**): mostrar o estado tratado por **BR-4.4** (ausência de linha ⇒ **Pendente** na UI até persistência). Rótulos **pt-BR** para **Pago**, **Não pago**, **Pendente**, **Bolsista**, **Outro**.

**SPR-8.3.** **Indicador “Atrasado”:** mostrar quando **BR-4.3** se aplica (vencimento daquele mês já ultrapassado **e** o estado não é **Pago** nem **Bolsista**). Pode coexistir com **Pendente** ou **Não pago** conforme o momento do job **BR-4.5** , a UI deve ser inteligível (“mensalidade em atraso” / chip **Atrasado**).

**SPR-8.4.** **Últimos pagamentos:** até **12** registos em `payments` com **mês de referência** mais recente primeiro; para cada linha: mês (**DATE-6**), **status**, **valor efectivo** quando existir, **data/hora do pagamento** quando **Pago** (**ENT-8**). Meses **sem** linha **não** entram nesta lista , apenas no cartão do **mês corrente** (**SPR-8.2**).

---

## SPR-9. Ações (toolbar ou equivalente)

**SPR-9.1.** **Editar** navega para **`/alunos/[id]/editar`**.

**SPR-9.2.** **Promover** abre o **modal cliente** de promoção conforme **GRD-5** (substitui o placeholder do ciclo **10**): escrita na base via Server Action **promoteStudent**; disponível também na página de histórico completo (**GRD-1.1**).

**SPR-9.3.** **Registrar pagamento** abre o **mesmo modal / fluxo** que na lista de mensalidades (**BUI-7**) **apenas quando o aluno está no mesmo recorte de cobrança em curso** (**BR-9**/ **STU-3**/ **BUI-2`): **`recordPayment`** com valor igual ao preço efetivo, opcionalmente método e notas; toast com resultado (**BLM-3**).

**SPR-9.4.** Para **`inactive`**, **`paused`**, arquivo (`archived_at` preenchido) ou «**remover cadastro**» (`removed_at` preenchido), conforme **STU-10**/**STU-11**, **omitir** o botão «**Registrar pagamento**» (**não** apenas desabilitar sem explicação); mensagem breve indica regressar primeiro à carteira do quadro corrente.

---

## SPR-10. Integração com a lista (**STU-7**)

**SPR-10.1.** O **clique principal** na linha ou cartão na lista **abre o perfil** (`/alunos/[id]`).

**SPR-10.2.** Uma **acção secundária** explícita (botão/ícone) **abre a edição rápida** (**STU-8**) **sem** navegar para o perfil.

**SPR-10.3.** Mantém-se o acesso à **ficha completa** onde já existir na lista (ex.: link “Editar ficha” / botão dedicado , **STU-8.2**).

---

## SPR-11. Aba **Documentos**

**SPR-11.1.** O perfil ganha um separador adicional **Documentos** que coexiste com **Dados pessoais**, **Graduação** e **Financeiro** (**SPR-5.1**). A aba mostra:

- **Cards por tipo documental** (Comprovante de matrícula, Certificado, Termo de responsabilidade, Recibo manual) com descrição curta e CTA `Gerar` que abre o diálogo descrito em **DOC-2.4**.
- **Histórico de documentos** abaixo, ordem cronológica inversa, com colunas/linhas: tipo, número (`{PREFIX}-{YYYY}-{seq4}`), versão, emissor, data, status, atalhos (**Baixar / Abrir / WhatsApp / Reemitir**).

**SPR-11.2.** Documentos com `status='archived'` aparecem marcados como **versão substituída** (chip discreto), mantendo download disponível (**DOC-11.4**).

**SPR-11.3.** Documentos com `status='failed'` mostram o motivo (`failure_reason`) e CTA `Tentar gerar novamente` (delegado a **DOC-** / **REC-7** conforme tipo).

**SPR-11.4.** **Recibos automáticos** aparecem nesta aba **e** no separador **Financeiro** (**SPR-8.4**) com indicador visual referindo o recibo associado a cada `paid` (**BUI-9.3**).

**SPR-11.5.** Quando o aluno **não tem telefone** ou o telefone falha na normalização E.164, o atalho **WhatsApp** fica desactivado com tooltip explicativo (**DOC-8.2**).

**SPR-11.6.** A aba **Documentos** existe mesmo quando ainda não há documentos emitidos , empty state explícito com os cards `Gerar` activos.

---

## SPR-12. Presença (histórico professor)

**SPR-12.1.** Separador **Presença** em **`/alunos/[id]`** (**SPR-5.1**): mostra **total de aulas frequentadas** (count de **`attendances`** oficiais) e **listagem paginada** cronológica (**mais recente primeiro**).

**SPR-12.2.** Campos por registo (quando disponíveis): **data da sessão**, **horário** (início–fim), **turma**, **professor**, **origem** (check-in do aluno / manual do professor), **registado por** (nome do perfil `recorded_by`), **data/hora do registo** (`recorded_at`).

**SPR-12.3.** Paginação: **20** registos por página; controlos «Anterior» / «Próxima»; **mobile-first** (cartões empilhados, tabs com scroll horizontal — **SPR-5.3**).

**SPR-12.4.** **Empty state** quando não existem `attendances` («Ainda não há presenças registadas» ou equivalente); total **zero**.

**SPR-12.5.** **Check-ins** não convertidos **não** entram no total nem na listagem (**SPT-10.2**). Histórico do aluno no portal: **SPT-13**.

**SPR-12.6.** Dados carregados no **servidor**; **`account_id` não aceite do cliente** (**SPR-2.1**).

> **Implementado** no cycle `0524-visual-mobile-attendance-onboarding` Stage 3 — aba **Presença** em `/alunos/[id]`, query `lib/data/student-attendances.ts`.

---

## Manutenção

Alterações em **`/alunos/[id]`**, regras de resumo ou de integração lista/perfil devem actualizar **este readme**, **`spec/features/billing-ui/readme.md`** quando afectarem **SPR-8** / **SPR-9** / fluxo de pagamento ou atalhos pós-pagamento (**BUI-9**), **`spec/features/student-documents/readme.md`** quando afectarem **DOC-** / **SPR-11**, **`spec/features/payment-receipts/readme.md`** quando afectarem **REC-** ou indicadores de recibo, **`spec/features/graduation-engine/readme.md`** quando afectarem **GRD-** / **SPR-7** / **SPR-9**, **`spec/features/students-crud/readme.md`** quando afectarem **STU-7**/ **STU-10**/ **STU-11**/ ciclo de vida, **`spec/product/billing-rules.md`** (**BR-9** quando aplicável), **`spec/features/app-shell/readme.md`** se os paths mudarem, e cenários em `cycles/Q22026/10-0430-student-profile/scenarios.feature` e `cycles/Q22026/25-0510-pedagogical-documents-finance/scenarios.feature` quando comportamento observable mudar.
