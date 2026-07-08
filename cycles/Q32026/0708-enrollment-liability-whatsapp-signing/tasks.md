# tasks.md — Matrícula e Termo de Responsabilidade (WhatsApp + assinatura digital)

## Cycle: 0708-enrollment-liability-whatsapp-signing

---

## Stage 1 — Schema, templates ASLAM e CRUD base

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 1.1 | Migração: `students.guardian_phone` (text nullable) + validação E.164 no app | `supabase/migrations/*`, `lib/validations/students.ts` | `done` | `db/migrations/015_*.sql`, validação telefone responsável |
| 1.2 | Migração: colunas de assinatura em `generated_documents` | `supabase/migrations/*` | `done` | `db/migrations/015_*.sql` |
| 1.3 | RLS/policies para novas colunas e rotas | `supabase/migrations/*` | `done` | Colunas sob RLS existente `generated_documents`; token público Stage 2 |
| 1.4 | Tipo `enrollment_liability_form` em `lib/documents/types.ts` | `lib/documents/types.ts` | `done` | prefixo ELF |
| 1.5 | Template v1 adulto | `lib/documents/templates/enrollment-liability-form/v1/` | `done` | cláusulas literais ASLAM |
| 1.6 | Template v1 menor | `lib/documents/templates/enrollment-liability-form/v1/` | `done` | — |
| 1.7 | Schema Zod + builder | `schema.ts`, `payload-builder.ts` | `done` | `schema.test.ts` |
| 1.8 | Template resolver + numeração ELF | `template-resolver.ts`, `numbering.ts` | `done` | testes |
| 1.9 | Server Actions CRUD | `actions/enrollment-liability-forms.ts` | `done` | — |
| 1.10 | Hub `/matriculas-termos` | `app/(dashboard)/matriculas-termos/page.tsx` | `done` | — |
| 1.11 | Detalhe `/matriculas-termos/[id]` | `app/(dashboard)/matriculas-termos/[id]/page.tsx` | `done` | — |
| 1.12 | Formulário create/edit | `components/enrollment-liability-forms/` | `done` | — |
| 1.13 | Menu/shell | `dashboard-nav-config.tsx`, `lib/routes.ts` | `done` | — |
| 1.14 | Card aba Documentos aluno | `student-documents-tab.tsx` | `done` | — |
| 1.15 | Testes unitários | `lib/documents/**/*.test.ts` | `done` | 5 passed |
| 1.16 | Validação Stage 1 | — | `done` | `validation.md` |

---

## Stage 2 — Assinatura digital + WhatsApp

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 2.1 | Serviço de token de assinatura (gerar, validar, expirar 7d, uso único) | `lib/documents/signing/token.ts` | `done` | `token.test.ts` |
| 2.2 | Página pública `/assinatura/[token]` — revisão dos dados + campos editáveis restantes + canvas assinatura | `app/assinatura/[token]/page.tsx`, `components/signing/signature-pad.tsx` | `done` | build |
| 2.3 | Server Action `submitSignature` — validar token, receber PNG da assinatura, merge com `pdf-lib`, upload PDF assinado | `lib/documents/signing/merge-signed-pdf.ts`, `actions/signing.ts` | `done` | re-render HTML→PDF; `merge-signed-pdf.test.ts` |
| 2.4 | Actualizar `signature_status`: `null` → `awaiting_signature` (após envio) → `signed` (após submit) | `actions/enrollment-liability-forms.ts` | `done` | — |
| 2.5 | `composeEnrollmentLiabilityWhatsAppMessage` — mensagem curta + link `/assinatura/{token}` | `lib/documents/whatsapp.ts` | `done` | `whatsapp.test.ts` |
| 2.6 | `getWhatsAppLink` / action de envio — destinatário: `guardian_phone` se menor, senão `phone`; registar em `generated_document_deliveries` | `actions/enrollment-liability-forms.ts` | `done` | — |
| 2.7 | CTA WhatsApp desactivado sem telefone válido (**DOC-8.2** adaptado) | UI detalhe + form | `done` | tooltip disabled |
| 2.8 | Eventos auditoria: `document.signing_link.generated`, `document.signed` | `lib/documents/audit.ts` | `done` | — |
| 2.9 | Testes: token expirado, token já usado, merge PDF contém imagem assinatura | `lib/documents/signing/*.test.ts` | `done` | 11 passed |
| 2.10 | Validação Stage 2: smoke manual assinatura mobile + lint/build | — | `done` | `validation.md` |

---

## Stage 3 — Fallback upload, UX completa e auditoria

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 3.1 | Server Action `uploadSignedDocument` — PDF/JPEG/PNG ≤ 10 MB, storage `...-signed.{ext}` | `actions/enrollment-liability-forms.ts`, `lib/documents/storage.ts` | `done` | — |
| 3.2 | UI «Registar assinatura recebida» no detalhe (fallback manual pós-WhatsApp) | `components/enrollment-liability-forms/` | `done` | — |
| 3.3 | Badges de status: Rascunho / Aguardando assinatura / Assinado / Falhou | `components/enrollment-liability-forms/status-badge.tsx` | `done` | `signature-status-badge.tsx` |
| 3.4 | Botão «Reenviar WhatsApp» — novo token + nova entrega | `actions/enrollment-liability-forms.ts` | `done` | — |
| 3.5 | Chip «Pendente há X dias» quando `awaiting_signature` &gt; 3 dias | UI listagem | `done` | — |
| 3.6 | Integrar histórico em `/documentos` (filtro tipo `enrollment_liability_form`) | `app/(dashboard)/documentos/` | `done` | — |
| 3.7 | Reemissão conforme **DOC-11** (motivo obrigatório, invalida token anterior) | `actions/documents.ts` | `done` | `reissueEnrollmentLiabilityForm` |
| 3.8 | Campo `guardian_phone` na ficha do aluno (STU-5/6) | formulário aluno | `done` | — |
| 3.9 | Cenários Gherkin validados manualmente | `scenarios.feature`, `validation.md` | `pending` | smoke manual |
| 3.10 | Revisão `/review-implementation` | `review.md` | `done` | — |
| 3.11 | Promover `spec-delta.md` via `/update-spec` | `spec/` | `pending` | aguarda comando |

---

## Legenda

- `pending` — não iniciado
- `in_progress` — em andamento
- `done` — concluído com evidência
- `blocked` — bloqueado (registrar motivo)

---

> ⚠️ Executar **uma stage por vez**. Não avançar para a próxima sem aprovação humana explícita.
