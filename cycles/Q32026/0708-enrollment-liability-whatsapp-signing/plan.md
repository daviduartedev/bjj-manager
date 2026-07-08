# plan.md — Matrícula e Termo de Responsabilidade (WhatsApp + assinatura digital)

## Cycle: 0708-enrollment-liability-whatsapp-signing
## Gerado em: 2026-07-08

---

## Resumo do plano

Introduzir um **CRUD operacional** de Matrícula e Termo de Responsabilidade ASLAM, com novo tipo documental `enrollment_liability_form`, templates PDF fiéis aos modelos fornecidos (variantes **adulto** e **menor**), fluxo de **assinatura digital simples** (sem ICP-Brasil) via página pública tokenizada, e envio por **WhatsApp Web (`wa.me`)** com link de assinatura. Os tipos genéricos actuais (`enrollment_proof`, `liability_term`) **permanecem** como referência P0 — não são removidos neste cycle.

**Decisões fechadas no refine:**

| Tema | Decisão |
|------|---------|
| Modelo documental | CRUD + tipo `enrollment_liability_form` (documento único matrícula+termo) |
| Variante menor | Idade &lt; 18 na data de emissão (`date_of_birth`) |
| Assinatura | Preenchimento digital + canvas de assinatura na página pública; `pdf-lib` embute assinatura no PDF final |
| PDF inicial | Pré-preenchido; campos em branco só onde o formulário ASLAM exige preenchimento manual |
| WhatsApp | Mensagem curta + link de assinatura (TTL 7 dias); `guardian_phone` para menores |
| Dados | Híbrido: identidade do aluno + `guardian_phone` no cadastro; saúde, endereço completo e responsável legal **só no snapshot** |
| Entidade legal no PDF | `accounts.legal_name` (**CFG-6**) |
| Numeração | Prefixo **`ELF`** (`ELF-2026-0001`) |
| Fallback | Professor pode registar upload manual (PDF/JPEG/PNG ≤ 10 MB) se assinatura digital não ocorrer |
| API WhatsApp Business | Fora de escopo |

---

## Stages

### Stage 1 — Schema, templates ASLAM e CRUD base
- **Objetivo:** Migração mínima, templates PDF exactos (adulto/menor), CRUD professor (criar/listar/ver/editar rascunho), geração do PDF pré-preenchido (versão «para assinar»).
- **Tasks:** ver `tasks.md` — Stage 1
- **Arquivos principais:** `supabase/migrations/*`, `lib/documents/templates/enrollment-liability-form/`, `lib/documents/types.ts`, `actions/enrollment-liability-forms.ts`, `app/(dashboard)/matriculas-termos/`, `components/enrollment-liability-forms/`
- **Critério de saída:** Professor cria registo, preenche campos complementares, gera PDF ASLAM correcto (adulto ou menor), lista e abre detalhe; lint/typecheck/build ok.

### Stage 2 — Assinatura digital + WhatsApp
- **Objetivo:** Página pública `/assinatura/[token]`, canvas de assinatura, submissão gera PDF assinado; envio WhatsApp com mensagem curta + link; tracking de entrega e status `awaiting_signature`.
- **Tasks:** ver `tasks.md` — Stage 2
- **Arquivos principais:** `app/(public)/assinatura/[token]/`, `lib/documents/signing/`, `lib/documents/whatsapp.ts`, `actions/documents.ts` (extensões)
- **Critério de saída:** Link WhatsApp abre conversa com mensagem + URL; destinatário assina digitalmente; PDF final persistido; status passa a `signed`.

### Stage 3 — Fallback upload, UX completa e auditoria
- **Objetivo:** Upload manual pelo professor, badges de status, integração na aba Documentos do aluno e hub `/documentos`, reenvio WhatsApp, reemissão (**DOC-11**), validação e spec-delta pronto para promoção.
- **Tasks:** ver `tasks.md` — Stage 3
- **Arquivos principais:** `components/documents/`, `app/(dashboard)/documentos/`, `app/(dashboard)/alunos/[id]/`, `validation.md`
- **Critério de saída:** Fluxo ponta a ponta documentado; fallback upload funcional; cenários Gherkin cobertos; pronto para `/update-spec`.

---

## Arquivos afetados (visão geral)

| Arquivo / área | Stage(s) | Tipo de mudança |
|---|---|---|
| `supabase/migrations/*` | 1 | create — `guardian_phone`, colunas de assinatura em `generated_documents` |
| `lib/documents/templates/enrollment-liability-form/v1/` | 1 | create — HTML/CSS/schema fiéis aos PDFs ASLAM |
| `lib/documents/types.ts`, `payload-builder.ts`, `template-resolver.ts` | 1 | edit |
| `lib/documents/signing/` | 2 | create — token, merge PDF (`pdf-lib`) |
| `app/(dashboard)/matriculas-termos/` | 1, 3 | create — CRUD hub |
| `app/(public)/assinatura/[token]/` | 2 | create — página de assinatura |
| `actions/enrollment-liability-forms.ts` | 1–3 | create |
| `components/enrollment-liability-forms/` | 1–3 | create |
| `lib/documents/whatsapp.ts` | 2 | edit — mensagem curta + link assinatura |
| `components/documents/`, SPR-11 | 3 | edit — card + histórico |
| `lib/validations/students.ts` | 1 | edit — `guardian_phone` |
| `spec/features/student-documents/readme.md` | via spec-delta | proposta DOC-16+ |

---

## Specs afetadas (proposta em `spec-delta.md`)

- `spec/features/student-documents/readme.md` — novo tipo, fluxo assinatura, WhatsApp, status
- `spec/features/student-profile/readme.md` — SPR-11 card adicional
- `spec/features/students-crud/readme.md` — `guardian_phone`
- `spec/features/supabase-schema/readme.md` — colunas novas
- `spec/product/entities.md` — E15 extensão assinatura; E17 relações
- `spec/product/spec.md` — SPEC-2.9 extensão

---

## Riscos globais

| Risco | Probabilidade | Stage | Mitigação |
|---|---|---|---|
| Layout PDF não pixel-perfect vs ASLAM | Média | 1 | Validar contra PDFs anexos; revisão humana antes de close-stage |
| Assinatura canvas ilegível em mobile | Média | 2 | Área ampla, preview antes de confirmar |
| Token de assinatura partilhado indevidamente | Baixa | 2 | Token hash SHA-256, TTL 7d, uso único, rate limit |
| Dados de saúde em snapshot (LGPD) | Média | 1 | Não listar em grids; mascarar em logs (**DOC-10.3**) |
| Link WhatsApp expira antes de assinar | Média | 2 | Botão «Reenviar WhatsApp» regenera token (Stage 3) |
| `pdf-lib` + Playwright pipeline divergem | Baixa | 2 | PDF assinado gerado server-side só após submit; versão inicial via pipeline existente |

---

## Fora de escopo (confirmado)

- WhatsApp Business API / webhook de resposta automática
- Assinatura ICP-Brasil / Gov.br
- Portal do aluno logado para assinar (usa link público tokenizado)
- Editor visual de templates
- Substituição dos tipos genéricos P0
- Lembretes automáticos por e-mail/SMS
- Migração de documentos históricos

---

## Dependências entre stages

- **Stage 2** depende de: tipo documental, templates v1, CRUD create/generate, colunas de assinatura na BD.
- **Stage 3** depende de: assinatura digital funcional + WhatsApp com link.

---

## Perguntas resolvidas no refine

- [x] Tipo: CRUD + `enrollment_liability_form` com PDF exacto ASLAM
- [x] P0: manter genéricos + novo módulo
- [x] Menor: idade &lt; 18
- [x] Assinatura: digital simples (canvas + pdf-lib)
- [x] Persistência: híbrido (ver tabela acima)
- [x] `guardian_phone` no aluno; responsável legal só snapshot
- [x] Prefixo `ELF`, status estendido, fallback upload

---

## Perguntas abertas (nenhuma blocker — defaults aplicados)

- Nenhuma blocker restante. Ajustes de copy da mensagem WhatsApp podem ser feitos na implementação sem alterar contrato.
