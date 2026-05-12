# Entidades de domínio , Casca - Gestão de Academias de BJJ

Conceito orientador: modelo **multi-tenant** (`account_id` onde aplicável). Campos detalhados de banco podem evoluir no ciclo de schema; aqui está o **contrato de produto**.

---

## E1. Conta (Academia)

**ENT-1.1.** Representa a academia no SaaS.

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Nome da academia | Sim | |
| Identificador da conta | Sim | Impl.: UUID |
| Configurações gerais | Não | Evoluem em settings |

---

## E2. Perfil de usuário

**ENT-2.1.** Liga `auth.users` à conta (**1:1** com usuário autenticado no MVP).

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Conta | Sim | Pertencimento à academia |
| Nome de exibição | Sim | |
| E-mail | Sim | Via auth |
| Telefone | Não | Contato opcional do professor (**CFG-**) |

**ENT-2.2.** **Sessão de autenticação** é infraestrutura (Supabase), não entidade de negócio nomeada no modelo relacional do MVP.

**ENT-2.3.** Enquanto não existir **autocadastro** na aplicação (**SPEC-3.7**), o vínculo inicial entre utilizador em **Auth**, **`accounts`** e **`profiles`** é feito por **provisionamento manual** (dashboard Supabase + SQL), conforme [`docs/security/rls.md`](../../docs/security/rls.md) e **AUTH-7.1**.

---

## E3. Faixa (catálogo)

**ENT-3.1.** Catálogo **global** de faixas: tipo **adulto** ou **kids**, nome, ordem (**ordinal**).

**ENT-3.2.** Graus na faixa (**0–4** para faixas coloridas adulto; **0–4** por faixa kids; **preta** adulto usa graus **1–6** conforme [`graduation-rules.md`](graduation-rules.md)) são propriedade do **estado atual do aluno**, não linhas separadas de “faixa” no catálogo.

**ENT-3.3.** O valor persistido como nome técnico em `belts` pode usar **identificador estável** (ex.: inglês no seed SQL) desde que o **ordinal** e o **kind** reproduzam **GR-1** e **GR-2**; rótulos em **português** na UI devem seguir **GR-2.1** / **GR-1.1** (ciclo schema).

---

## E4. Aluno

**ENT-4.1.** Pessoa matriculada na academia.

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Conta | Sim | |
| Tipo | Sim | Adulto ou kids |
| Nome | Sim | |
| Faixa atual | Sim | FK para faixa |
| Grau atual | Sim | Limites por tipo/faixa , ver **GR-** |
| Status do aluno | Sim | Enum no schema: **ativo**, **inativo**, **trial**, **pausado** (trial pode designar período curto, ex. um dia, definido operacionalmente na UI , sem cron obrigatório no MVP salvo ciclo dedicado). Na UI do ciclo de alunos (**STU-3**), **trial** não é exposto; **ativo**, **inativo** e **pausado** sim. |
| Arquivo operacional (`archived_at`) | Não | Marca saída do quadro habitual + vista **Arquivados** (**STU-10**). |
| «Remover cadastro» soft (`removed_at`) | Não | Marca saída distinta do arquivo; sem `DELETE` de pagamentos/recibos (**STU-11**). |
| Audit trail opcional | Não | `lifecycle_updated_by` → **`profiles`** quando DDL existir. |
| Data de nascimento | Recomendado | Idade e transição kids/adulto |
| Data de início na academia | Recomendado | Tempo de treino |
| Documento, telefone, e-mail, observações | Não | LGPD / minimização |

**ENT-4.2.** **Recorte mensal trabalhável**: lista **`/mensalidades`**, totais (**BUI-2.8** quando existir) e KPIs **`PNL`** onde partilharem esse universo, mais leituras em lote **PBS-6** já filtradas ao mesmo conjunto (**BR-9**): **`student_status = active`** com **`archived_at`** e **`removed_at`** nulos; **inactive**/**paused**/arquivo/**remover cadastro** soft ficam **fora** até acções reversíveis (**STU-3**, **STU-10**, **STU-11**).

---

## E5. Graduação (histórico)

**ENT-5.1.** Registro imutável de cada promoção (grau ou faixa).

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Aluno | Sim | |
| Faixa resultante | Sim | |
| Grau resultante | Sim | |
| Data da graduação | Sim | |
| Foi pulo de ordem | Sim | Boolean |
| Motivo do pulo | Condicional | Obrigatório se pulo , ver **GR-** |

---

## E6. Plano

**ENT-6.1.** Plano comercial da conta: tipo técnico **`kids_1`**, **`kids_2`** ou **`adult`**, **nome editável** (`plans.name`), valor padrão em centavos, ativo/inativo. Rótulos por defeito na provisão: **Kids 1**, **Kids 2**, **Adulto**. A função principal no MVP é **organizar cobrança e segmentação** por **idade/turma**; o professor **associa manualmente** cada aluno a um desses planos (**BR-1.1**).

**ENT-6.2.** Valores por defeito na provisão automática da conta e no seed de desenvolvimento: ver **BR-1.4** e **BLM-2**.

---

## E7. Vínculo aluno–plano

**ENT-7.1.** Associa aluno a um plano.

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Aluno | Sim | |
| Plano | Sim | |
| Preço personalizado | Não | Centavos; se nulo, usa preço do plano |
| Dia de vencimento | Sim | **1–28** (recomendado produto); meses curtos ajustam ao último dia válido |

**ENT-7.2.** No MVP, há no máximo **um vínculo aberto** por aluno (`ended_at` nulo no vínculo aluno–plano); troca de plano fecha o vínculo anterior (`ended_at`) e abre outro (`started_at`). A regra é **reforçada no banco** (índice único parcial) no ciclo schema.

**ENT-7.3.** Qualquer operação de nova vigência via **`setStudentPlan`** (incluindo **mesmo** `plan_id` que o vínculo aberto) **insere** nova linha em `student_plans` e define `ended_at` na linha anterior com a **mesma data civil** que `started_at` da nova linha, em referência **America/São_Paulo** (**BLM-5**). Não se usa atualização in-place da linha aberta para esse efeito.

---

## E8. Mensalidade / referência de cobrança

**ENT-8.1.** Unidade de cobrança: **mês de referência** (data representando o dia **1** daquele mês).

**ENT-8.2.** Por par (**aluno**, **mês de referência**), o professor define:

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Status manual | Sim | **Pago**, **Não pago**, **Pendente**, **Bolsista**, **Outro** , ver **BR-** |
| Valor efetivo cobrado | Não | Útil para histórico; default do vínculo |
| Data/hora do pagamento | Não | Informação opcional quando **Pago** |
| Observação | Não | Especialmente para **Outro** |
| Método de pagamento (texto livre) | Não | Ex.: PIX, dinheiro; campo opcional na UI (**BUI-4**) |

**ENT-8.3.** Registro pode mapear para tabela `payments` no Supabase; ausência de linha é tratada como **Pendente** na experiência (**BR-4.4**), com transição automática para **Não pago** conforme **BR-4.5**. Estorno simples no MVP (**PBS-5**) remove a linha, voltando à semântica de ausência.

---

## E9. Relações (resumo)

```
Account 1 : N Profile (MVP: tipicamente 1 professor por conta)
Account 1 : N Student
Account 1 : N Plan
Belt (global) : N Student (current_belt)
Student 1 : N StudentGraduation
Student N : 1 Plan (via vínculo aluno–plano)
Student 1 : N Payment (por reference_month)
```

---

## E10. Fora do MVP

**ENT-10.1.** Turmas, chamadas, fichas médicas, contratos, ledger contábil completo, gateway de pagamento.

---

## E11. Plano de aula (`LessonPlan`)

**ENT-11.1.** Registro principal de **plano pedagógico mensal** por **categoria** (`plan_kind`: `adult`, `kids_1`, `kids_2` , reaproveita **ENT-6.1**, **não** introduz enum novo). Detalhe contratual em **PED-** ([`spec/features/lesson-plans/readme.md`](../features/lesson-plans/readme.md)).

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Conta | Sim | Multi-tenant |
| Professor responsável | Sim | FK para perfil |
| Título | Sim | 5 a 150 caracteres |
| Mês de referência | Sim | `date` no dia 1 do mês (mesma convenção de **ENT-8.1**) |
| Categoria | Sim | `plan_kind` (Adulto / Kids 1 / Kids 2) |
| Status | Sim | `draft` / `published` / `archived` (**PED-4**) |
| Revisão actual | Não | FK para **E12**; null logo após criação até a primeira revisão ser persistida |
| Arquivado em | Não | `timestamptz`; preenchido ao arquivar |

**ENT-11.2.** Pode existir mais de um `LessonPlan` por par (`reference_month`, `category`), mas **apenas um** pode estar `published` simultaneamente (índice único parcial , **PED-3.2**).

---

## E12. Revisão de plano (`LessonPlanRevision`)

**ENT-12.1.** Histórico imutável do **conteúdo** do plano. Toda edição que altera conteúdo cria nova revisão (**PED-6**).

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Plano | Sim | FK para **E11** |
| Número da revisão | Sim | Inteiro monotónico por plano (1, 2, 3, …) |
| Descrição rica | Sim | `jsonb` (modelo serializado pelo editor TipTap mínimo, **PED-9**) |
| Tópicos | Sim | `jsonb` , lista ordenada `[{ id, title, items[] }]` |
| Técnicas | Não | `jsonb`; mesmo formato dos tópicos |
| Observações | Não | `jsonb` (modelo TipTap mínimo) |
| Autor | Sim | FK para perfil que criou a revisão |
| Criado em | Sim | `timestamptz` |

---

## E13. Anexo de plano (`LessonPlanAttachment`)

**ENT-13.1.** Material de apoio (PDF, imagem, planilha) associado a um plano. **Não** é embutido no PDF principal do plano (**PED-12.2**).

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Plano | Sim | FK para **E11** |
| Storage key | Sim | Chave no bucket privado de anexos |
| Nome de ficheiro | Sim | Display |
| MIME type | Sim | Validado contra lista permitida |
| Tamanho | Sim | Bytes; limite configurável |
| Enviado por | Sim | FK para perfil |
| Criado em | Sim | `timestamptz` |

---

## E14. Template documental (`DocumentTemplate`)

**ENT-14.1.** Template HTML+CSS versionado por **tipo documental** (**DOC-1**). No MVP os templates vivem em código (`lib/documents/templates/<type>/v<n>/`); a tabela existe para suportar **override por conta** no futuro. Resolução em **DOC-5**.

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Conta | Não | Null = template global do sistema; preenchido = override por conta (futuro) |
| Tipo | Sim | `payment_receipt`, `enrollment_proof`, `certificate`, `liability_term`, `lesson_plan` |
| Versão | Sim | Inteiro monotónico por (`account?`, `type`) |
| Nome | Sim | Display |
| Fonte HTML | Sim | Texto |
| CSS | Não | Texto |
| Schema do payload | Sim | `jsonb` espelhando o Zod schema |
| Activo | Sim | Boolean |
| Criado em | Sim | `timestamptz` |

---

## E15. Documento gerado (`GeneratedDocument`)

**ENT-15.1.** Cada **emissão** de documento (manual ou automática, **DOC-1**) cria uma linha imutável (**RB-DOC-002**).

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Conta | Sim | Multi-tenant |
| Aluno | Não | Preenchido para todos os tipos do MVP |
| Pagamento | Não | Apenas para `payment_receipt` (**REC-1**) |
| Tipo | Sim | Slug (**DOC-1**) |
| Status | Sim | `pending`, `generating`, `generated`, `failed`, `archived` |
| Número documental | Não | Formato `{PREFIX}-{YYYY}-{seq4}` (**DOC-4**); preenchido ao gerar |
| Versão | Sim | 1 na primeira emissão; reemissões incrementam (**DOC-11**) |
| Versão do template | Sim | Inteiro |
| Snapshot do payload | Sim | `jsonb` , dados exactos usados na renderização (**RB-DOC-003**) |
| Storage key | Não | Preenchido após upload |
| Bucket | Não | Idem |
| MIME type | Não | `application/pdf` |
| Tamanho do ficheiro | Não | Bytes |
| Checksum SHA-256 | Não | Hex |
| Emissor | Sim | FK para perfil que disparou a geração |
| Gerado em | Não | `timestamptz`; null em `pending`/`generating` |
| Razão da falha | Não | Texto, quando `failed` |
| Substitui | Não | FK para a versão anterior na mesma série (reemissão) |
| Criado em / Atualizado em | Sim | `timestamptz` |

**ENT-15.2.** Numeração: a sequência `seq` é monotónica por (`account_id`, `type`, ano) , **DOC-4.3**.

---

## E16. Tentativa de entrega (`GeneratedDocumentDelivery`)

**ENT-16.1.** Registo das tentativas de **compartilhamento** de um documento gerado (**DOC-8**), preparada para a futura API oficial sem mudança de contrato.

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| Documento | Sim | FK para **E15** |
| Canal | Sim | `whatsapp_web`, `whatsapp_api` (futuro), `download`, `email` (futuro) |
| Status | Sim | `pending`, `opened`, `sent`, `failed`, `canceled` |
| Telefone do destinatário | Não | E.164 quando aplicável |
| Snapshot do payload de entrega | Não | `jsonb` (mensagem, link assinado usado, etc.) |
| Identificador externo | Não | `external_message_id` (preenchido com API oficial futura) |
| Resposta do provedor | Não | `jsonb` (preenchido com API oficial futura) |
| Iniciado por | Sim | FK para perfil |
| Criado em / Atualizado em | Sim | `timestamptz` |

---

## E17. Relações adicionais (resumo)

```
Account 1 : N LessonPlan
LessonPlan 1 : N LessonPlanRevision
LessonPlan 1 : N LessonPlanAttachment
Account 1 : N DocumentTemplate (futuro override)
Account 1 : N GeneratedDocument
Student 1 : N GeneratedDocument
Payment 1 : N GeneratedDocument (apenas type=payment_receipt; uma versão activa)
GeneratedDocument 1 : N GeneratedDocumentDelivery
```
