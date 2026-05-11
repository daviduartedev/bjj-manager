# Plano (delta) , Ciclo 25-0510-pedagogical-documents-finance

> **Para agentes executores:** RECOMENDADO usar `superpowers:subagent-driven-development` ou `superpowers:executing-plans` para implementar este plano sub-ciclo a sub-ciclo. Cada passo usa checkbox (`- [ ]`).

**Goal:** entregar, no mesmo ciclo, três módulos novos , **planos de aula** (`/pedagogico/planos`), **documentos do aluno** (`/documentos`) e **recibo automático** ao registrar pagamento , reaproveitando a infraestrutura existente (Supabase, Server Actions, RLS, design system) e introduzindo um motor server-side compartilhado de **HTML → PDF** baseado em **Playwright headless**.

**Decisões tomadas no refinamento (Q1–Q13 do `/refine-request`):**

| Eixo | Decisão |
|------|---------|
| Faseamento | Tudo num único ciclo (Q1) |
| Categoria pedagógica | Reaproveita `plan_kind` (Q2, **PED-2**) |
| Storage | Supabase Storage (Q3, **DOC-6**) |
| Motor de PDF | Playwright server-side (Q4, **REC-3.2**) |
| RBAC | Manter papel único do professor (Q5, **PED-13**, **DOC-13**, **REC-10**) |
| Recibo | Síncrono blocking dentro de `recordPayment` (Q6, **REC-1**) |
| Reemissão | Disponível no MVP, com motivo obrigatório (Q7, **DOC-11**) |
| Template do recibo | Imagem `public/777df8c0-d6e4-44d7-8bbe-78a5090a5b76.jpg` é referência canónica (Q8, **REC-6**) |
| Dados do recebedor | Estende `accounts` (`legal_name`, `cnpj`, `signature_url`, `logo_url`) (Q9, **CFG-6**) |
| Multi-mês | 1 recibo por `payment` no MVP (Q10, **REC-5**) |
| Tipos documentais | Todos os 5 (recibo automático, recibo manual, comprovante, certificado, termo) (Q11, **DOC-1**) |
| Editor pedagógico | Listas estruturadas próprias para `topics`/`techniques` + TipTap mínimo nos campos rich text (Q12, **PED-9**) |
| WhatsApp | `wa.me` com telefone do aluno e link assinado curto (Q13, **DOC-8**, **SPEC-3.1** revisto) |

**Stack:** Next.js App Router + React + TypeScript, Supabase (Auth, Postgres, Storage), Server Actions, Zod, React Hook Form, **TipTap** (editor mínimo), **Playwright** (renderer), **dnd-kit** ou similar para listas ordenáveis.

**Specs canónicas alteradas neste ciclo:**

- `spec/README.md` , registar PED-, DOC-, REC-.
- `spec/product/spec.md` + `docs/product/spec.md` , adicionados SPEC-2.8/2.9/2.10, SPEC-5.6/5.7/5.8, ajustado SPEC-3.1.
- `spec/product/entities.md` + `docs/product/entities.md` , adicionados E11–E17.
- `spec/product/billing-rules.md` + `docs/product/billing-rules.md` , adicionado BR-8.
- `spec/features/settings/readme.md` , CFG-6 e CFG-7.
- `spec/features/payments-billing-status/readme.md` , PBS-9.
- `spec/features/billing-ui/readme.md` , BUI-9.
- `spec/features/student-profile/readme.md` , SPR-11.
- `spec/features/app-shell/readme.md` , rotas `/pedagogico` e `/documentos` em SHELL-2; SHELL-3.1 actualizado.
- `spec/features/supabase-schema/readme.md` , novas tabelas e enums.
- Criados: `spec/features/lesson-plans/readme.md` (PED-), `spec/features/student-documents/readme.md` (DOC-), `spec/features/payment-receipts/readme.md` (REC-).

---

## Estrutura de ficheiros

### Novos , banco de dados

- `db/migrations/003_documents_core.sql` , enums (`document_type`, `generated_document_status`, `delivery_channel`, `delivery_status`), tabelas `document_templates`, `generated_documents`, `generated_document_deliveries`, `document_sequences`. Idempotente.
- `db/migrations/004_lesson_plans.sql` , enum `lesson_plan_status`, tabelas `lesson_plans`, `lesson_plan_revisions`, `lesson_plan_attachments`. Idempotente.
- `db/migrations/005_account_receiver_fields.sql` , `accounts.legal_name`, `accounts.cnpj`, `accounts.signature_url`, `accounts.logo_url`. `ALTER TABLE … ADD COLUMN IF NOT EXISTS`.
- Modificar `db/schema.sql` (estado final) e `db/policies.sql` (RLS para as novas tabelas).
- Modificar `db/seed.sql` para criar templates iniciais (em código, mas com linha em `document_templates` de referência se desejado) e plano de aula de demo (Maio/2026 Adulto) , opcional.

### Novos , configurações da conta (CFG-6)

- Modificar `lib/validations/settings.ts` , validar `legal_name` (0–200), `cnpj` (regex e/ou DV), upload size constraints.
- Modificar `actions/settings.ts` , `updateAccount` aceita os novos campos; nova action `uploadAccountSignature(input)`.
- Modificar `app/(dashboard)/configuracoes/page.tsx` e os components da página , nova secção **Recebedor**.
- Criar `components/settings/signature-uploader.tsx` (drag-drop, preview, remoção).
- Criar `components/settings/cnpj-input.tsx` (mask `00.000.000/0000-00`).

### Novos , motor documental partilhado (DOC-)

- `lib/documents/types.ts` , tipos públicos do domínio (`DocumentType`, `GeneratedDocumentStatus`, etc.).
- `lib/documents/numbering.ts` , `nextDocumentNumber({ accountId, type, year })`, com lock por linha.
- `lib/documents/storage.ts` , wrapper sobre `supabase.storage.from(bucket).upload(...)` e `createSignedUrl(...)`.
- `lib/documents/renderer.ts` , API `renderHtmlToPdf({ html, css, options })`; singleton de Playwright.
- `lib/documents/template-resolver.ts` , resolve template activo por `(account?, type)`.
- `lib/documents/templates/payment-receipt/v1/{template.html,styles.css,builder.ts,schema.ts}`.
- `lib/documents/templates/enrollment-proof/v1/...`.
- `lib/documents/templates/certificate/v1/...`.
- `lib/documents/templates/liability-term/v1/...`.
- `lib/documents/templates/lesson-plan/v1/...`.
- `lib/documents/service.ts` , `DocumentGenerationService` (orquestra build → render → upload → DB).
- `lib/documents/whatsapp.ts` , normalização E.164 e composição da mensagem (**DOC-8**).
- `lib/documents/audit.ts` , logging estruturado.
- `lib/validations/documents.ts` , Zod schemas para `generateDocument`, `reissueDocument`, `getDownloadUrl`, `getWhatsAppLink`, `listDocuments`.

### Novos , Server Actions

- `actions/documents.ts` , `generateDocument`, `reissueDocument`, `getDownloadUrl`, `getWhatsAppLink`, `listDocuments`, `retryReceiptGeneration`.
- Modificar `actions/billing.ts` , `recordPayment` ganha geração inline de recibo (**REC-1**), e nova action `retryReceiptGeneration({ paymentId })`.

### Novos , UI de documentos

- `app/(dashboard)/documentos/page.tsx` , hub central com listagem.
- `app/(dashboard)/documentos/[documentId]/page.tsx` , detalhe.
- `components/documents/document-list.tsx` , filtros (tipo, aluno, mês, status).
- `components/documents/document-card.tsx`.
- `components/documents/document-generate-dialog.tsx` , preview HTML + campos opcionais + confirmar.
- `components/documents/reissue-dialog.tsx` , campo motivo (5–500 chars).
- `components/documents/whatsapp-share-button.tsx`.
- `components/students/student-documents-tab.tsx` , aba **Documentos** no perfil (**SPR-11**).

### Novos , planos de aula (PED-)

- `app/(dashboard)/pedagogico/planos/page.tsx` (lista).
- `app/(dashboard)/pedagogico/planos/novo/page.tsx`.
- `app/(dashboard)/pedagogico/planos/[id]/page.tsx` (visualização).
- `app/(dashboard)/pedagogico/planos/[id]/editar/page.tsx`.
- `lib/lesson-plans/{service.ts,repository.ts}` , persistência e regras (criar/duplicar/publicar/arquivar).
- `lib/lesson-plans/pdf.ts` , delega ao motor partilhado.
- `lib/validations/lesson-plans.ts`.
- `actions/lesson-plans.ts` , `createLessonPlan`, `updateLessonPlan`, `publishLessonPlan`, `archiveLessonPlan`, `duplicateLessonPlan`, `addLessonPlanAttachment`, `getLessonPlanPdfUrl`.
- `components/lesson-plans/plans-client.tsx` (lista e filtros).
- `components/lesson-plans/plan-editor.tsx` (form principal).
- `components/lesson-plans/sortable-topic-list.tsx` (drag-drop para `topics` e `techniques`).
- `components/lesson-plans/rich-text-editor.tsx` (TipTap minimal: `Heading`, `Bold`, `Italic`, `BulletList`, `OrderedList`, `Paragraph`).
- `components/lesson-plans/plan-preview-drawer.tsx`.
- `components/lesson-plans/attachment-uploader.tsx`.

### Modificados , navegação e atalhos

- `lib/routes.ts` , `pedagogicoPlanos`, `documentos`, `documentoDetalhe`.
- `components/layout/dashboard-nav-config.tsx` , itens **Pedagógico** e **Documentos**.
- `components/billing/record-payment-dialog.tsx` , consumo do novo retorno `{ ok, paymentId, receipt }` e exibição dos atalhos pós-pagamento (**BUI-9**).
- `components/billing/post-payment-summary.tsx` , novo componente reutilizável com os 4 atalhos.
- `components/billing/mensalidades-detail-client.tsx` , indicador visual do status do recibo no histórico (**BUI-9.3**).

### Tests

- `lib/documents/numbering.test.ts`.
- `lib/documents/whatsapp.test.ts` , normalização E.164.
- `lib/documents/templates/payment-receipt/v1/builder.test.ts`.
- `lib/lesson-plans/service.test.ts`.
- `lib/validations/lesson-plans.test.ts`.
- `lib/validations/documents.test.ts`.
- `actions/billing.test.ts` (extensão) , `recordPayment` retorna recibo idempotente; falha do recibo não invalida pagamento.
- `e2e/document-flow.spec.ts` (Playwright) , gerar comprovante, baixar, reemitir.
- `e2e/receipt-on-pay.spec.ts` , registrar pagamento, verificar recibo, falhar e retry.

---

## Sub-ciclo 1 , Fundações de banco (schema, RLS e Storage)

### Objetivo

Criar todas as tabelas, enums, índices e políticas necessárias para os módulos novos, sem tocar UI nem código de domínio.

### Passos

- [ ] **1.1** Criar `db/migrations/003_documents_core.sql` com:
  - enums `document_type`, `generated_document_status`, `delivery_channel`, `delivery_status`;
  - `document_templates` (`account_id` nullable, `type`, `version`, `is_active`, …);
  - `generated_documents` com FKs para `accounts`, `students` (nullable), `payments` (nullable), `supersedes_id` (self-FK);
  - índice único parcial em (`payment_id`, `version`) onde `type='payment_receipt'` para garantir unicidade do recibo activo;
  - `generated_document_deliveries`;
  - `document_sequences` (`account_id`, `type`, `year`, `last_seq`).
- [ ] **1.2** Criar `db/migrations/004_lesson_plans.sql` com:
  - enum `lesson_plan_status`;
  - `lesson_plans` (`category` referencia `plan_kind`);
  - `lesson_plan_revisions` (`unique(lesson_plan_id, revision_number)`);
  - `lesson_plan_attachments`;
  - índice único parcial em (`account_id`, `category`, `reference_month`) onde `status='published'`.
- [ ] **1.3** Criar `db/migrations/005_account_receiver_fields.sql` com `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS …` para `legal_name`, `cnpj`, `signature_url`, `logo_url`.
- [ ] **1.4** Replicar tudo em `db/schema.sql` (estado final ordenado) seguindo o padrão da feature `supabase-schema` (**SEC-** / **PED-** / **DOC-** / **REC-**).
- [ ] **1.5** Adicionar policies em `db/policies.sql` , RLS por `account_id` directo nas tabelas com `account_id`; para `lesson_plan_revisions`, `lesson_plan_attachments` e `generated_document_deliveries`, política `EXISTS` joinando à tabela pai.
- [ ] **1.6** Criar buckets no Supabase Storage (manual via CLI ou painel; documentar em `docs/security/rls.md`):
  - `documents-{env}` (privado);
  - `lesson-plans-attachments-{env}` (privado);
  - `branding-{env}` (privado, leitura via URL assinada gerada server-side).
- [ ] **1.7** Rodar `pnpm db:apply` ; verificar contagens de sanity.
- [ ] **1.8** Atualizar `spec/features/rls-security/readme.md` (se necessário) com nota de quão as policies novas seguem o mesmo padrão.

### Validação

- `pnpm db:apply` aplica idempotente.
- Listar políticas: cada nova tabela tem `… USING (account_id = current_account_id())` ou equivalente.
- Buckets visíveis no painel Supabase, todos privados.

---

## Sub-ciclo 2 , Configurações: dados do recebedor (CFG-6)

### Objetivo

Permitir cadastrar `legal_name`, `cnpj`, `signature_url`, `logo_url` antes de qualquer fluxo de geração documental usar esses dados.

### Passos

- [ ] **2.1** Estender `lib/validations/settings.ts` , adicionar `updateReceiverSchema` (`legalName?`, `cnpj?`); validador de CNPJ (mask + 14 dígitos numéricos). Sem DV obrigatório no MVP.
- [ ] **2.2** Estender `actions/settings.ts` , `updateAccount` aceita novos campos; criar `uploadAccountSignature(formData)` (max 256 KB; mime `image/png` ou `image/svg+xml`).
- [ ] **2.3** Criar `components/settings/signature-uploader.tsx` , preview, drag-drop, remover.
- [ ] **2.4** Criar `components/settings/cnpj-input.tsx` , mask em tempo real.
- [ ] **2.5** Modificar `app/(dashboard)/configuracoes/page.tsx` , nova secção **Recebedor** entre Academia e Planos. Banner de aviso quando `cnpj` ou `signature_url` vazios (**CFG-6.4**).
- [ ] **2.6** Testes unitários de validação (CNPJ inválido, tamanho excedido, mime errado).
- [ ] **2.7** Type-check + lint.

### Validação

- Formulário guarda dados; `revalidatePath('/configuracoes')` propaga.
- Upload de PNG e SVG funciona; `>256 KB` é rejeitado.

---

## Sub-ciclo 3 , Motor documental partilhado (DOC-3 a DOC-7)

### Objetivo

Construir a engine HTML → PDF → Storage → DB sem disparar nada ainda. Esta é a fundação reutilizada por **REC-** e por **PED-12**.

### Passos

- [ ] **3.1** Adicionar dependências:
  - `playwright` (e `playwright-chromium` se aplicável) ;
  - `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-heading`, `@tiptap/extension-bullet-list`, `@tiptap/extension-ordered-list` ;
  - `dnd-kit/core` + `dnd-kit/sortable` (ou alternativa equivalente).
  - Garantir que Playwright instala browsers em CI (`pnpm exec playwright install --with-deps chromium`).
- [ ] **3.2** Implementar `lib/documents/renderer.ts` , singleton `getBrowser()`, função `renderHtmlToPdf({ html, css, options })` retornando `{ pdfBuffer, checksumSha256 }` (calcular SHA-256 do buffer antes de retornar).
- [ ] **3.3** Implementar `lib/documents/storage.ts` , `uploadDocument({ bucket, key, buffer, contentType })`, `getSignedUrl({ bucket, key, ttlSeconds })`. TTL default 900 (15 min); TTL share 86400 (24h).
- [ ] **3.4** Implementar `lib/documents/numbering.ts`. Em transação:

  ```sql
  INSERT INTO document_sequences (account_id, type, year, last_seq)
  VALUES ($1, $2, $3, 1)
  ON CONFLICT (account_id, type, year)
  DO UPDATE SET last_seq = document_sequences.last_seq + 1
  RETURNING last_seq;
  ```

  Formatar `{PREFIX}-{YYYY}-{seq.toString().padStart(4, '0')}`.
- [ ] **3.5** Implementar `lib/documents/template-resolver.ts` , devolve `{ html, css, schema, version, builder }` por tipo. No MVP, lookup em `lib/documents/templates/<type>/v1/index.ts`. Tabela `document_templates` apenas registada.
- [ ] **3.6** Implementar templates HTML+CSS+builder+schema para os 5 tipos. **Recibo** segue **REC-6** (texto narrativo da imagem). **Comprovante de matrícula**, **Certificado** e **Termo** seguem layouts SaaS-genéricos coerentes com o design system. **Plano de aula** renderiza tópicos hierárquicos (**PED-12.2**).
- [ ] **3.7** Implementar `lib/documents/service.ts` , `DocumentGenerationService.generate(input)` orquestrando o pipeline **DOC-7.1** (validar → resolver template → build payload → insert `generating` → render → upload → update `generated` → emit event).
- [ ] **3.8** Implementar `lib/documents/audit.ts` , logger estruturado com mascaramento de PII (`maskCpf`, `maskPhone`).
- [ ] **3.9** Testes unitários:
  - `numbering.test.ts` (sequência por (account, type, year), reset por ano);
  - `template-resolver.test.ts`;
  - `templates/payment-receipt/v1/builder.test.ts` (payload mínimo, omissões de CPF/CNPJ).
- [ ] **3.10** Suíte e2e mínima: criar `generated_document` com `status='generated'` e binário no bucket via mocks; verificar checksum.

### Validação

- `pnpm test lib/documents/...`
- Smoke manual: chamar `DocumentGenerationService.generate({ type: 'enrollment_proof', studentId })` numa rotina de teste; ver linha em `generated_documents` com `status='generated'` e binário no bucket.

---

## Sub-ciclo 4 , Server Actions e endpoints documentais (DOC-9)

### Objetivo

Expor as operações ao cliente, com validações Zod e RLS.

### Passos

- [ ] **4.1** Criar `lib/validations/documents.ts` (Zod) cobrindo `generateDocument`, `reissueDocument`, `getDownloadUrl`, `getWhatsAppLink`, `listDocuments`, `retryReceiptGeneration`.
- [ ] **4.2** Criar `actions/documents.ts` mapeando para `DocumentGenerationService` e helpers de storage; mensagens de erro em pt-BR (`mapDocumentActionError`).
- [ ] **4.3** Implementar `lib/documents/whatsapp.ts` , normalização para E.164 (com prefixo BR `+55` quando ausente), composição da mensagem (template **DOC-8.4**).
- [ ] **4.4** Reemissão (**DOC-11**): cria nova linha com `version+1`, marca anterior como `archived`, regista motivo em coluna dedicada (`reissue_reason text` na migração 003).
- [ ] **4.5** Testes:
  - `actions/documents.test.ts` (mocks de Supabase) , happy path e cross-tenant 404.
  - `whatsapp.test.ts` , normalização (telefone com 8/9 dígitos, com/sem código de país, formatos com pontuação).

### Validação

- Type-check + tests verdes.
- Smoke: gerar comprovante, baixar URL assinada, reemitir, ver versões na DB.

---

## Sub-ciclo 5 , UI de documentos (DOC-2)

### Objetivo

Hub central `/documentos` + aba **Documentos** no perfil do aluno.

### Passos

- [ ] **5.1** Adicionar rota em `lib/routes.ts` (`documentos`, `documentoDetalhe(id)`).
- [ ] **5.2** Adicionar item **Documentos** em `dashboard-nav-config.tsx` (entre Mensalidades e Configurações).
- [ ] **5.3** Criar `app/(dashboard)/documentos/page.tsx` (server) , carrega lista paginada com filtros via `searchParams`.
- [ ] **5.4** Criar `app/(dashboard)/documentos/[documentId]/page.tsx` , metadados, preview embutido, acções.
- [ ] **5.5** Criar `components/documents/document-generate-dialog.tsx` , preview HTML server-rendered (sem Playwright; renderizado via mesmo template HTML mas dentro da página) + campos opcionais por tipo + botão `Confirmar geração`.
- [ ] **5.6** Criar `components/documents/reissue-dialog.tsx` (motivo obrigatório).
- [ ] **5.7** Criar `components/students/student-documents-tab.tsx` (**SPR-11**) e plug no `app/(dashboard)/alunos/[id]/page.tsx`.
- [ ] **5.8** `components/documents/whatsapp-share-button.tsx` , chama `getWhatsAppLink` e `window.open(url, '_blank')`. Desactivado quando aluno sem telefone (**DOC-8.2**).
- [ ] **5.9** Mobile-first: cartões, sheet alto. Type-check.

### Validação

- Gerar cada um dos 4 tipos manuais a partir do perfil; download abre PDF com layout esperado; WhatsApp abre `wa.me` com texto correcto; reemissão produz nova linha; histórico mostra ambas.

---

## Sub-ciclo 6 , Recibo automático no `Pagar` (REC-1, BR-8, PBS-9, BUI-9)

### Objetivo

Disparar a geração de recibo dentro de `recordPayment` e expor os atalhos pós-pagamento.

### Passos

- [ ] **6.1** Estender `actions/billing.ts:recordPayment`:
  - depois do `upsert` em `payments`, **se** `recordingKind='paid'`:
    - obter `paymentId` (devolver `id` do upsert , adicionar `.select('id').single()`);
    - chamar `DocumentGenerationService.generate({ type: 'payment_receipt', paymentId, idempotencyKey: paymentId })`;
    - capturar resultado `{ documentId, status, downloadUrl? }`.
  - retorno passa a incluir `paymentId` e `receipt` (apenas para `paid`).
- [ ] **6.2** `idempotencyKey=paymentId`: `DocumentGenerationService.generate` consulta `generated_documents` com `payment_id=$1 AND type='payment_receipt' AND status='generated' AND version=1`; se existir, retorna sem regerar (**REC-2**).
- [ ] **6.3** Em falha, **não** propagar excepção que reverteria `payments` (porque o upsert já foi commitado por outra round-trip Supabase ou por serialização local). A action devolve `{ ok: true, paymentId, receipt: { documentId, status: 'failed' } }`.
- [ ] **6.4** Modificar `components/billing/record-payment-dialog.tsx` para consumir o novo retorno e accionar `PostPaymentSummary` (componente novo) com os 4 atalhos.
- [ ] **6.5** Criar `components/billing/post-payment-summary.tsx` , renderiza atalhos baixar/abrir/WhatsApp/reemitir, ou CTA `Tentar gerar novamente` quando `status='failed'`.
- [ ] **6.6** Modificar `components/billing/mensalidades-detail-client.tsx` para mostrar o indicador visual do recibo no histórico (**BUI-9.3**).
- [ ] **6.7** Criar `actions/billing.ts:retryReceiptGeneration({ paymentId })` que delega ao `DocumentGenerationService` com a mesma `idempotencyKey`. Em sucesso, marca a linha falhada anterior como `archived` ou simplesmente actualiza para `generated`.
- [ ] **6.8** **Estorno (`voidPayment`)**: após `DELETE` da linha em `payments`, marcar recibos com esse `payment_id` e `status IN ('generated','generating')` como `archived` (**BR-8.6**). Auditar.
- [ ] **6.9** **Bolsista** e **Outro**: nem chamar a geração (**BR-8.4**, **REC-1.4/5**).
- [ ] **6.10** Tests:
  - `actions/billing.test.ts` , happy path (paid + recibo gerado), idempotência (segundo pagar do mesmo mês com mesmo amount não gera novo recibo), falha (recibo failed não reverte pagamento), bolsista (sem recibo).
  - `e2e/receipt-on-pay.spec.ts` (Playwright) , clicar em Pagar, ver toast, baixar PDF, abrir WhatsApp.

### Validação

- Pagar → toast `Pagamento registrado e recibo emitido` → botão Baixar abre PDF coerente com a referência da imagem.
- Pagar duas vezes (re-upsert) → mesmo recibo (não duplica).
- Forçar falha (mock do storage) → `PostPaymentSummary` mostra `Tentar gerar novamente`; pagamento permanece em `payments`.
- `voidPayment` → recibo passa a `archived`.

---

## Sub-ciclo 7 , Módulo pedagógico (PED-)

### Objetivo

Listar/criar/editar/duplicar/publicar/arquivar/exportar planos de aula com revisões.

### Passos

- [ ] **7.1** `lib/validations/lesson-plans.ts` , Zod para `createLessonPlan`, `updateLessonPlan`, `publishLessonPlan`, `archiveLessonPlan`, `duplicateLessonPlan`, `addLessonPlanAttachment`. Validar `reference_month` formato `YYYY-MM-01`; `category ∈ {adult, kids_1, kids_2}`; `title` 5–150.
- [ ] **7.2** `lib/lesson-plans/repository.ts` , queries por `account_id`, com revisão actual joined.
- [ ] **7.3** `lib/lesson-plans/service.ts` , regras (criar revisão #1 vazia ao criar plano; criar nova revisão ao editar conteúdo; gerar `revision_number`; publicação com check-and-archive do par anterior , **PED-3.3**).
- [ ] **7.4** `actions/lesson-plans.ts` , wrappers seguros com Zod, mensagens pt-BR. `getLessonPlanPdfUrl(planId)` chama `DocumentGenerationService` com `type='lesson_plan'`, `payload` derivado da revisão actual.
- [ ] **7.5** Testes unitários do `service.ts` (criação, duplicação, transições, revisões).
- [ ] **7.6** UI lista (`/pedagogico/planos`):
  - filtros (`mês`, `categoria`, `status`, `professor`) persistidos em `searchParams`;
  - cards densos / tabela com **PED-10.4**;
  - empty state e CTA `Novo plano`;
  - acção secundária `Duplicar mês anterior` no header (atalho que chama `duplicateLessonPlan` para o último mês com plano publicado por categoria).
- [ ] **7.7** Editor (`/pedagogico/planos/novo` e `/pedagogico/planos/[id]/editar`):
  - layout 2 colunas no desktop (conteúdo + sidebar de metadados);
  - mobile empilhado;
  - `SortableTopicList` para `topics` e `techniques`;
  - `RichTextEditor` (TipTap mínimo) para `richDescription` e `observations`;
  - `AttachmentUploader` para anexos (Supabase Storage, bucket `lesson-plans-attachments-{env}`).
- [ ] **7.8** Visualização (`/pedagogico/planos/[id]`):
  - secções **Visão geral**, **Tópicos**, **Técnicas**, **Observações**, **Anexos**, **Histórico de revisões**;
  - acções: `Editar`, `Duplicar`, `Exportar PDF`, `Imprimir`, `Arquivar`.
- [ ] **7.9** Adicionar item **Pedagógico** em `dashboard-nav-config.tsx`.
- [ ] **7.10** Tests E2E mínimos: criar plano Adulto Maio/2026 com tópicos da §7.4 do request, publicar, duplicar para Junho.

### Validação

- O exemplo de Maio/2026 (Adulto / Kids 1 / Kids 2) cabe inteiro na estrutura, com listas hierárquicas (incluindo o sub-bloco «generalidades» do Kids 1).
- Publicação respeita unicidade por par.
- Duplicação cria rascunho com conteúdo idêntico mas status `draft`.
- PDF reflecte hierarquia.

---

## Sub-ciclo 8 , Hardening, observabilidade, regressão e aceite

### Objetivo

Garantir que o produto antigo não quebrou e que os critérios de aceite (CA-PLN-, CA-DOC-, CA-REC-, CFG-6, BUI-9, SPR-11, REC-, PED-) estão satisfeitos.

### Passos

- [ ] **8.1** Auditoria & logs: garantir mascaramento de PII em `lib/documents/audit.ts`; eventos definidos em **DOC-10**, **PED-15** emitidos.
- [ ] **8.2** Estendê suíte SECE2E: rotas `/pedagogico/planos/*`, `/documentos/*` e endpoints `/api/documents` (se existirem) entram no inventário (**SECE2E-4**); IDOR em `documentId` e `lessonPlanId`.
- [ ] **8.3** Cenários BDD do ciclo: `cycles/Q22026/25-0510-pedagogical-documents-finance/scenarios.feature` (já criados no refinamento) , garantir cobertura por testes automatizados ou marcação clara como verificação manual.
- [ ] **8.4** Smoke check da régua de regressão:
  - `recordPayment` continua a funcionar para Bolsista/Outro sem regressão (sem recibo);
  - `voidPayment` continua a apagar a linha e agora também `archive` o recibo;
  - mensalidades, painel, perfil do aluno e settings continuam a funcionar visualmente em desktop e mobile.
- [ ] **8.5** Performance: medir tempo médio de `recordPayment` com geração de recibo (alvo P95 ≤ 3 s em produção; ≤ 5 s em frio com cold start do Playwright).
- [ ] **8.6** Comandos de validação:
  - `pnpm test`
  - `pnpm type-check`
  - `pnpm lint`
  - `pnpm test:e2e` (incluir os novos specs)
  - `pnpm build`
- [ ] **8.7** Checklist manual final (vide tasks.md).

### Critérios de conclusão

- Todos os critérios CA-PLN-001..006, CA-DOC-001..004, CA-REC-001..005 do request verificados.
- Pagamento existente (Pago/Bolsista/Outro/Estorno) preserva semântica anterior.
- Documentos gerados são imutáveis; reemissão cria nova versão; histórico não desaparece.
- WhatsApp abre `wa.me` correctamente para alunos com telefone válido.
- Plano de aula com o conteúdo canónico de Maio/2026 pode ser criado e publicado.

---

## Ordem recomendada de execução

1. Sub-ciclo 1 , banco.
2. Sub-ciclo 2 , configurações (CFG-6).
3. Sub-ciclo 3 , motor documental (sem UI).
4. Sub-ciclo 4 , Server Actions documentais.
5. Sub-ciclo 5 , UI de documentos.
6. Sub-ciclo 6 , recibo automático no `Pagar`.
7. Sub-ciclo 7 , módulo pedagógico.
8. Sub-ciclo 8 , hardening e aceite.

Sub-ciclos 5 e 7 podem rodar em paralelo se houver mais de um agente, depois de 4 estar pronto.

---

## Auto-revisão do plano

- **Cobertura da spec:** SPEC-2.8/2.9/2.10, SPEC-5.6/5.7/5.8, BR-8, ENT-11..16, CFG-6/7, PBS-9, BUI-9, SPR-11, PED-1..16, DOC-1..15, REC-1..13, todos com sub-ciclo correspondente.
- **Decisões pendentes ao iniciar:** nenhuma; todas as 13 perguntas do `/refine-request` foram respondidas (ver tabela do topo).
- **Risco principal:** Playwright em ambiente serverless (REC-3.3). Mitigação: feature de host com Playwright instalável ou switch via `PDF_RENDERER_DRIVER` se Vercel for o destino.
- **Fora do escopo:** matriz RBAC §17.2 do request, recibo agregado multi-mês, API oficial WhatsApp, assinatura digital ICP-Brasil, editor visual de templates.
- **Compatibilidade com ciclos anteriores:** `recordPayment` mantém retorno `{ ok, error?: }` mas agora **estende** com `paymentId` e `receipt`; consumidores antigos que só liam `ok` continuam funcionando (extensão aditiva). `voidPayment` ganha efeito colateral em `generated_documents` mas mantém a assinatura.
