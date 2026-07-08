# validation.md — Matrícula e Termo de Responsabilidade (WhatsApp + assinatura digital)

## Cycle: 0708-enrollment-liability-whatsapp-signing

---

## Stage 1 — Schema, templates ASLAM e CRUD base
### Data: 2026-07-08

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm exec tsc --noEmit` | PASS | — |
| `pnpm test` (unitários DOC/ELF) | PASS | 5 testes (numbering, template-resolver, schema Zod) |
| `pnpm lint` | PASS | 0 erros; warnings corrigidos |
| `pnpm build` | PASS | Rotas `/matriculas-termos`, `/novo`, `/[id]` compiladas |

| Cenário | Evidência | Resultado |
|---|---|---|
| Tipo `enrollment_liability_form` + prefixo ELF | unit test | PASS |
| Schema Zod rascunho adulto/menor | unit test | PASS |
| Template resolver regista novo tipo | unit test | PASS |
| Migração `015_enrollment_liability_signing.sql` | `pnpm db:apply` (user) | PASS |
| Hub CRUD `/matriculas-termos` | build | PASS |
| Formulário create/edit + gerar PDF | implementado | smoke manual pendente pós-migração |

**Falhas baseline:** nenhuma

---

## Stage 2 — Assinatura digital + WhatsApp
### Data: 2026-07-08

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm exec tsc --noEmit` | PASS | — |
| `pnpm test lib/documents/signing lib/documents/whatsapp` | PASS | 11 testes (token, merge HTML→PDF, WhatsApp) |
| `pnpm lint` | PASS | 0 erros |
| `pnpm build` | PASS | Rota `/assinatura/[token]` compilada |

| Cenário | Evidência | Resultado |
|---|---|---|
| Token SHA-256 + TTL 7d + URL pública | `token.test.ts` | PASS |
| Página pública `/assinatura/[token]` + canvas | build + componentes | PASS |
| `submitSignature` re-renderiza PDF com assinatura | `merge-signed-pdf.test.ts` | PASS |
| `signature_status`: `awaiting_signature` → `signed` | `actions/signing.ts`, `issueSigningToken` | PASS |
| Mensagem WhatsApp curta + link assinatura | `whatsapp.test.ts` | PASS |
| Envio WhatsApp + `generated_document_deliveries` | `sendEnrollmentLiabilityWhatsApp` | PASS (código) |
| CTA WhatsApp desactivado sem telefone | `EnrollmentLiabilityDetailActions` tooltip | PASS |
| Auditoria `document.signing_link.generated`, `document.signed` | `logDocumentEvent` | PASS |

**Nota:** Assinatura embutida via re-render HTML→PDF (sem `pdf-lib`, devido a conflito pnpm store).

**Smoke manual pendente:** assinatura em dispositivo móvel real.

---

## Stage 3 — Fallback upload, UX completa e auditoria
### Data: 2026-07-08

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm exec tsc --noEmit` | PASS | — |
| `pnpm lint` | PASS | — |
| `pnpm build` | PASS | — |

| Cenário | Evidência | Resultado |
|---|---|---|
| Upload manual PDF/JPEG/PNG ≤ 10 MB | `uploadSignedEnrollmentDocument` | PASS (código) |
| UI «Registar assinado» no detalhe | `EnrollmentLiabilityDetailActions` | PASS |
| Badges Rascunho / Aguardando / Assinado | `signature-status-badge.tsx` | PASS |
| Reenviar WhatsApp (novo token) | botão no detalhe + `issueSigningToken` | PASS |
| Chip «Pendente há X dias» (>3d) | `enrollment-liability-forms-list.tsx` | PASS |
| Filtro `enrollment_liability_form` em `/documentos` | page + client + `listDocumentsSchema` | PASS |
| Reemissão DOC-11 | `reissueEnrollmentLiabilityForm` | PASS (código) |
| Campo `guardian_phone` na ficha aluno | `student-form.tsx`, `actions/students.ts` | PASS |
| Cenários Gherkin | `scenarios.feature` | smoke manual pendente |

**Falhas baseline:** nenhuma

---

## Conclusão geral

- [x] Todas as stages implementadas
- [x] Stage 1–3: lint, typecheck, build e testes unitários
- [ ] Smoke manual E2E (assinatura mobile, WhatsApp real)
- [ ] Pronto para `/update-spec` (aguarda comando explícito)
- [ ] Pronto para `/close-cycle`
