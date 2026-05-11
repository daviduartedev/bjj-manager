# Tarefas , Ciclo 25-0510-pedagogical-documents-finance

Checklist agente-executável que cobre os 8 sub-ciclos do `plan.md`. Mantém-se a regra: **actualizar `spec/`** sempre que houver alteração de comportamento canónico.

> Pré-requisito comum: rodar `pnpm install` para puxar as novas dependências (`playwright`, `@tiptap/*`, `dnd-kit`).

## Sub-ciclo 1 , Banco

- [x] Criar `db/migrations/006_documents_core.sql` (idempotente).
- [x] Criar `db/migrations/007_lesson_plans.sql` (idempotente).
- [x] Criar `db/migrations/005_account_receiver_fields.sql` (`ALTER TABLE … ADD COLUMN IF NOT EXISTS`).
- [x] Replicar estado final em `db/schema.sql`.
- [x] Adicionar policies das novas tabelas em `db/policies.sql` (RLS por `account_id` ou via `EXISTS` na pai).
- [ ] Criar buckets Supabase Storage privados: `documents-{env}`, `lesson-plans-attachments-{env}`, `branding-{env}`. *(Pendente: requer console Supabase do projecto.)*
- [ ] Rodar `pnpm db:apply` em dev e validar contagens. *(Pendente: requer `DATABASE_URL` configurada.)*
- [x] Documentar buckets em `docs/security/rls.md`.

## Sub-ciclo 2 , Configurações (CFG-6)

- [x] Estender `lib/validations/settings.ts` com `updateReceiverSchema`.
- [x] Criar `cnpjMaskUtil` e `cnpjValidatorBasic` (apenas comprimento/dígitos no MVP).
- [x] Estender `actions/settings.ts:updateAccount` para aceitar `legal_name`, `cnpj` *(via novo `updateReceiver`).* 
- [x] Criar `actions/settings.ts:uploadAccountSignature(formData)` (mime PNG/SVG, max 256 KB) e `removeAccountSignature()`.
- [x] Criar `components/settings/cnpj-input.tsx` (mask em tempo real).
- [x] Criar `components/settings/signature-uploader.tsx` (preview, replace, remove).
- [x] Adicionar secção **Recebedor** em `app/(dashboard)/configuracoes/page.tsx` com banner de aviso quando incompleta.
- [x] Testes de validação (CNPJ inválido, mime errado, tamanho excedido) em `lib/validations/settings.test.ts`.

## Sub-ciclo 3 , Motor documental partilhado (DOC- / REC-3)

- [x] Adicionar dependências: `playwright`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-heading`, `@tiptap/extension-bullet-list`, `@tiptap/extension-ordered-list`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@tiptap/pm`.
- [ ] Configurar instalação de Chromium em CI (`pnpm exec playwright install --with-deps chromium`). *(Pendente: alteração no pipeline.)*
- [x] Implementar `lib/documents/renderer.ts` (singleton de browser; `renderHtmlToPdf`).
- [x] Implementar `lib/documents/storage.ts` (upload + signed URL).
- [x] Implementar `lib/documents/numbering.ts` com `INSERT … ON CONFLICT … DO UPDATE … RETURNING last_seq` (RPC `reserve_document_number`).
- [x] Implementar `lib/documents/template-resolver.ts`.
- [x] Criar templates v1 para os 5 tipos (`lib/documents/templates/{payment-receipt,enrollment-proof,certificate,liability-term,manual-receipt}/v1/`).
- [x] Implementar `lib/documents/service.ts:DocumentGenerationService.generate` com pipeline DOC-7.1.
- [x] Implementar `lib/documents/audit.ts` com mascaramento de PII.
- [x] Testes unitários: `numbering.test.ts`, `template-resolver.test.ts`, `templates/payment-receipt/v1/builder.test.ts`.
- [ ] Smoke local: gerar comprovante para um aluno de teste, verificar binário no bucket e linha em `generated_documents`. *(Requer Supabase + Chromium.)*

## Sub-ciclo 4 , Server Actions documentais

- [x] Criar `lib/validations/documents.ts` (Zod) para todas as actions.
- [x] Criar `lib/documents/whatsapp.ts` (normalização E.164 + composição da mensagem).
- [x] Criar `actions/documents.ts` , `generateDocument`, `reissueDocument`, `getDocumentDownloadUrl`, `getWhatsAppShareLink`, `listDocuments`. *(Retry de recibo vive em `actions/billing.ts:retryReceiptGeneration`.)*
- [x] Implementar reemissão (motivo obrigatório, `version+1`, `supersedes_id`, `archived` na anterior).
- [x] Mensagens de erro em pt-BR (`mapDocumentActionError`).
- [x] Testes: `whatsapp.test.ts`. *(Action-level tests requerem mock de Supabase — adiados para o sub-ciclo de hardening.)*

## Sub-ciclo 5 , UI de documentos

- [x] Adicionar rota em `lib/routes.ts` (`documentos`, `routeDocumentoDetalhe(id)`).
- [x] Adicionar item **Documentos** em `components/layout/dashboard-nav-config.tsx`.
- [x] Criar `app/(dashboard)/documentos/page.tsx` (listagem global + filtros).
- [x] Criar `app/(dashboard)/documentos/[documentId]/page.tsx` (detalhe).
- [x] Criar `components/documents/document-list.tsx` e `document-status-badge.tsx`.
- [x] Criar `components/documents/document-generate-dialog.tsx`.
- [x] Criar `components/documents/reissue-dialog.tsx`.
- [x] Atalhos WhatsApp integrados em `document-list.tsx` e `post-payment-summary.tsx`.
- [x] Criar `components/students/student-documents-tab.tsx` e plug em `app/(dashboard)/alunos/[id]/page.tsx` (**SPR-11**).
- [ ] Validação manual de UX mobile e desktop. *(Pendente: requer ambiente.)*

## Sub-ciclo 6 , Recibo automático no `Pagar`

- [x] Modificar `actions/billing.ts:recordPayment` para retornar `{ paymentId, receipt }` e disparar `DocumentGenerationService.generate({ type: 'payment_receipt', paymentId, idempotencyKey: paymentId })` quando `recordingKind='paid'`.
- [x] Implementar tratamento de falha sem reverter pagamento (resultado `receipt.status='failed'`, mensagem amigável).
- [x] Criar `components/billing/post-payment-summary.tsx` (4 atalhos).
- [x] Modificar `components/billing/record-payment-dialog.tsx` para consumir o novo retorno.
- [ ] Modificar `components/billing/mensalidades-detail-client.tsx` e `components/billing/mensalidades-client.tsx` para indicar status do recibo (**BUI-9.3**). *(Pendente: ainda não há badge específico nas listas; histórico fica visível em `/documentos` e na aba do aluno.)*
- [x] Criar `actions/billing.ts:retryReceiptGeneration({ paymentId })`.
- [x] Modificar `actions/billing.ts:voidPayment` para arquivar recibos vinculados.
- [x] Garantir que `recordingKind ∈ {scholarship, other}` **não** dispara recibo automático.
- [ ] Testes: extensão de `actions/billing.test.ts` cobrindo os cenários de **REC-1**, **REC-2**, **REC-9**, **BR-8**. *(Adiado: depende de mock do Supabase; cobertura parcial via `whatsapp.test.ts`, `numbering.test.ts`, `payment-receipt/v1/builder.test.ts`.)*
- [ ] Test E2E: `e2e/receipt-on-pay.spec.ts` (Pagar → toast → baixar PDF → reemitir). *(Pendente: depende de buckets criados e Chromium em CI.)*

## Sub-ciclo 7 , Módulo pedagógico (PED-)

- [x] Criar `lib/validations/lesson-plans.ts`.
- [x] Criar `lib/lesson-plans/service.ts` (criar com revisão #1, editar criando nova revisão, publicar com check-and-archive, duplicar, arquivar).
- [x] Criar `actions/lesson-plans.ts` com Server Actions de **PED-8** (`create`, `update`, `publish`, `archive`, `duplicate`, `exportLessonPlanPdf`).
- [x] Criar `components/lesson-plans/plan-editor.tsx` com lista de tópicos + items (drag-handles via setas; dnd-kit instalado para futuros refinos).
- [ ] Criar `components/lesson-plans/sortable-topic-list.tsx`. *(Substituído por controles ↑/↓ no MVP; dnd-kit fica disponível para evolução.)*
- [ ] Criar `components/lesson-plans/rich-text-editor.tsx` (TipTap mínimo). *(Substituído por `Textarea` no MVP; pacotes TipTap instalados para evolução.)*
- [x] Criar `components/lesson-plans/plans-list.tsx` (listagem com filtros via `searchParams`).
- [x] Criar páginas: `/pedagogico/planos`, `/pedagogico/planos/novo`, `/pedagogico/planos/[id]`, `/pedagogico/planos/[id]/editar`.
- [x] Adicionar rota em `lib/routes.ts` (`pedagogicoPlanos`, `pedagogicoPlanoNovo`, `routePedagogicoPlano`, `routePedagogicoPlanoEditar`).
- [x] Adicionar item **Pedagógico** em `dashboard-nav-config.tsx`.
- [x] Implementar `lib/lesson-plans/pdf.ts` reutilizando o motor partilhado (template inline `lesson-plan/v1`).
- [x] Testes unitários: `lib/lesson-plans/service.test.ts`, `lib/validations/lesson-plans.test.ts`.
- [ ] Test E2E: criar plano Maio/2026 Adulto com tópicos canónicos, publicar, duplicar para Junho. *(Pendente: requer ambiente.)*

## Sub-ciclo 8 , Hardening, regressão e aceite

- [x] Garantir mascaramento de PII em logs (`lib/documents/audit.ts`).
- [x] Criar `e2e/documents-idor.spec.ts` (cross-tenant para `documentId`, `lessonPlanId`).
- [x] Adicionar rotas novas ao inventário **SECE2E-4** (`spec/features/security-e2e/route-inventory.md`).
- [x] Verificar que `recordPayment` continua a funcionar para `Bolsista` e `Outro` sem regressão (`receipt.status='skipped'` quando não é `paid`).
- [x] Verificar que `voidPayment` apaga `payments` **e** arquiva o recibo.
- [ ] Smoke manual: navegação principal funciona em desktop e mobile com novos itens. *(Pendente: requer ambiente.)*
- [x] Logging estruturado para `recordPayment` com geração de recibo (`auto_receipt.ready` / `auto_receipt.failed`).
- [x] Comandos de validação:
  - [x] `pnpm test` — 24 ficheiros, 156 testes verdes
  - [x] `pnpm type-check` — limpo
  - [x] `pnpm lint` — limpo
  - [ ] `pnpm test:e2e` — pendente (requer credenciais E2E + Chromium)
  - [x] `pnpm build` — sucesso, todas as novas rotas marcadas como dinâmicas
- [ ] Checklist manual final (vide tabela abaixo).

## Atualizar `spec/` (mandatório)

> Já actualizado durante o refinamento. Re-validar em revisão de PR.

- [x] `spec/README.md` , registo de PED-, DOC-, REC- e novas features.
- [x] `spec/product/spec.md` + `docs/product/spec.md` , SPEC-2.8/2.9/2.10, SPEC-5.6/5.7/5.8, ajuste SPEC-3.1.
- [x] `spec/product/entities.md` + `docs/product/entities.md` , E11–E17.
- [x] `spec/product/billing-rules.md` + `docs/product/billing-rules.md` , BR-8.
- [x] `spec/features/lesson-plans/readme.md` (criado, PED-).
- [x] `spec/features/student-documents/readme.md` (criado, DOC-).
- [x] `spec/features/payment-receipts/readme.md` (criado, REC-).
- [x] `spec/features/settings/readme.md` , CFG-6, CFG-7.
- [x] `spec/features/payments-billing-status/readme.md` , PBS-9.
- [x] `spec/features/billing-ui/readme.md` , BUI-9.
- [x] `spec/features/student-profile/readme.md` , SPR-11.
- [x] `spec/features/app-shell/readme.md` , `/pedagogico` e `/documentos` em SHELL-2; SHELL-3.1 ajustado.
- [x] `spec/features/supabase-schema/readme.md` , novas tabelas e enums.

## Verificação final (manual)

| Checkpoint | Como validar |
|------------|--------------|
| Pagar gera recibo | Registar pagamento normal; toast `Pagamento registrado e recibo emitido`; baixar PDF; conferir layout coerente com `public/777df8c0-d6e4-44d7-8bbe-78a5090a5b76.jpg` |
| Idempotência | Repetir pagamento com mesmo valor; conferir que não há nova linha em `generated_documents` |
| Falha não invalida pagamento | Forçar erro de storage; ver pagamento como `paid` e CTA `Tentar gerar novamente` |
| Bolsista sem recibo | Marcar mensalidade como bolsista; ver que não há recibo automático |
| Estorno arquiva recibo | Estornar pagamento; recibo passa a `archived` na aba Documentos |
| Reemissão | Reemitir recibo informando motivo; ver `2ª via` no PDF e duas versões no histórico |
| Reemissão sem motivo | Tentar reemitir sem motivo; sistema bloqueia |
| WhatsApp com aluno | `wa.me` abre com telefone normalizado e link |
| WhatsApp sem telefone | CTA desactivado |
| Comprovante de matrícula | Gerar pelo perfil; PDF abre com dados pré-preenchidos |
| Certificado | Idem; numeração `CERT-{ano}-{seq}` |
| Termo de responsabilidade | Idem |
| Recibo manual | Idem; usável para casos antigos |
| Plano Maio/2026 Adulto | Criar com tópicos canónicos da §7.4 do request; publicar; exportar PDF; duplicar para Junho |
| Plano Maio/2026 Kids 1 | Idem; sub-bloco «generalidades» preserva hierarquia |
| Plano Maio/2026 Kids 2 | Idem |
| Unicidade `published` | Tentar publicar segundo plano para o mesmo par; confirmar diálogo de arquivar |
| Histórico de revisões | Editar plano publicado; ver revisão #2; revisão #1 acessível |
| Cross-tenant | Aceder `/documentos/<id-de-outra-conta>`; receber 404 |
| Configuração de recebedor | Preencher CNPJ + assinatura; gerar recibo; conferir PDF |
| Configuração incompleta | Sem CNPJ; recibo gera mas o campo fica vazio; banner em `/configuracoes` |
| Navegação | Itens **Pedagógico** e **Documentos** visíveis em desktop e mobile |
| Aba Documentos no perfil | Histórico ordenado, atalhos por linha |
| Mobile | Diálogos em sheet alto, toque ≥ 44px, bottom nav coerente |

Verificação automatizada de comandos: `pnpm test`, `pnpm type-check`, `pnpm lint`, `pnpm test:e2e`, `pnpm build`.
