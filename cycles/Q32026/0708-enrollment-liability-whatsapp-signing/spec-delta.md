# spec-delta.md — Matrícula e Termo de Responsabilidade (WhatsApp + assinatura digital)

## Cycle: 0708-enrollment-liability-whatsapp-signing
## Status: PROPOSTA (não promovida)

> ⚠️ Este arquivo é uma PROPOSTA. Só é promovido para `spec/` via `/update-spec` após todas as stages validadas.

---

## Specs afetadas

### `spec/features/student-documents/readme.md`

**Secção:** DOC-1 (tipos documentais)

**Mudança proposta:**

```diff
 | `liability_term` | Termo de responsabilidade | Manual, por aluno |
+| `enrollment_liability_form` | Matrícula e Termo de Responsabilidade (ASLAM) | Manual, por aluno; CRUD dedicado |
 | `payment_receipt` | Recibo de pagamento | Automático no `Pagar` (**REC-**) ou manual |
```

**Secção:** DOC-4 (numeração)

```diff
 | `liability_term` | `TERM` |
+| `enrollment_liability_form` | `ELF` |
```

**Secção nova DOC-16 — Matrícula e Termo ASLAM (CRUD)**

**DOC-16.1.** Tipo `enrollment_liability_form` representa o **formulário legal único** de matrícula + termo de responsabilidade, com variantes de template:
- **adulto** — aluno com idade ≥ 18 na data de emissão;
- **menor** — aluno com idade &lt; 18; bloco de responsável legal obrigatório no payload.

**DOC-16.2.** Conteúdo legal (cláusulas, campos, rótulos) **reproduz fielmente** os PDFs de referência ASLAM fornecidos no cycle; templates versionados em `lib/documents/templates/enrollment-liability-form/v1/`.

**DOC-16.3.** **Hub CRUD** em `/matriculas-termos`:
- listagem com filtros (status assinatura, aluno, mês);
- criar / editar rascunho (campos complementares);
- detalhe com preview, download, WhatsApp, upload fallback, reenvio.

**DOC-16.4.** Os tipos genéricos P0 `enrollment_proof` e `liability_term` **permanecem** disponíveis; este tipo **não** os substitui.

**Secção nova DOC-17 — Assinatura digital simples (sem ICP-Brasil)**

**DOC-17.1.** Após geração do PDF pré-preenchido («para assinar»), o professor pode enviar link de assinatura via WhatsApp.

**DOC-17.2.** Link público tokenizado: `/assinatura/[token]`
- TTL default **7 dias** (`DOC_SIGNING_TTL_SECONDS`, default 604800);
- **uso único** — após assinatura válida, token invalidado;
- token armazenado como hash (`signing_token_hash`); nunca expor token em logs.

**DOC-17.3.** Página de assinatura:
- exibe dados pré-preenchidos (read-only onde já definidos pelo professor);
- permite completar campos ainda vazios exigidos pelo formulário;
- **canvas de assinatura** (desenho livre); confirmação gera PNG embutido no PDF final via `pdf-lib` server-side.

**DOC-17.4.** Colunas adicionais em `generated_documents` (apenas relevantes para tipos com assinatura; MVP: `enrollment_liability_form`):

| Coluna | Valores | Notas |
|--------|---------|-------|
| `signature_status` | `null`, `awaiting_signature`, `signed` | null antes do envio |
| `signing_token_hash` | text nullable | SHA-256 |
| `signing_expires_at` | timestamptz nullable | |
| `signed_at` | timestamptz nullable | |
| `signed_storage_key` | text nullable | PDF assinado ou upload manual |
| `signed_mime_type` | text nullable | |
| `signed_checksum_sha256` | text nullable | |

**DOC-17.5.** **Fallback manual:** professor pode fazer upload de documento já assinado (PDF, JPEG, PNG ≤ **10 MB**) quando a assinatura digital não ocorrer; mesmas colunas `signed_*`; `signature_status='signed'`.

**DOC-17.6.** Assinatura digital simples **não** equivale a assinatura ICP-Brasil; permanece fora de escopo certificação gov.br (**DOC-15** actualizado abaixo).

**Secção nova DOC-18 — WhatsApp para matrícula/termo**

**DOC-18.1.** Reutiliza pipeline **DOC-8** (`wa.me`), com mensagem **curta**:

```
Olá! Segue sua Matrícula e Termo de Responsabilidade ({documentNumber}) da {accountName}.
Assine aqui: {signingUrl}
```

**DOC-18.2.** Destinatário:
- aluno **adulto** → `students.phone` normalizado E.164;
- aluno **menor** → `students.guardian_phone` (obrigatório para envio); se inválido/ausente, CTA desactivado (**DOC-8.2**).

**DOC-18.3.** Registo em `generated_document_deliveries` com `channel='whatsapp_web'`, payload incluindo `signingUrl` (não o token em claro após envio).

**Secção:** DOC-12 (validações)

```diff
+**DOC-12.6.** Para `enrollment_liability_form`: aluno com vínculo aberto em `student_plans` (**ENT-7.2**); variante menor exige bloco responsável legal no payload; campos de saúde validados pelo schema Zod do template.
```

**Secção:** DOC-15 (fora de escopo — actualização)

```diff
-- Upload de assinatura manuscrita pelo aluno em tempo real.
+- Assinatura ICP-Brasil e integração Gov.br.
+(Upload manual pelo professor e canvas de assinatura simples **entram** no escopo via **DOC-17**.)
```

**Motivo:** Reflectir o novo fluxo digital acordado no refine.

---

### `spec/features/student-profile/readme.md`

**Secção:** SPR-11.1

**Mudança proposta:**

```diff
-- **Cards por tipo documental** (Comprovante de matrícula, Certificado, Termo de responsabilidade, Recibo manual)
+- **Cards por tipo documental** (Comprovante de matrícula, Certificado, Termo de responsabilidade, **Matrícula e Termo ASLAM**, Recibo manual)
```

**Secção nova SPR-11.7**

**SPR-11.7.** Card **Matrícula e Termo ASLAM** abre fluxo do hub `/matriculas-termos` pré-filtrado/criação para o aluno. Histórico mostra `signature_status` (Aguardando assinatura / Assinado) além do status documental base.

---

### `spec/features/students-crud/readme.md`

**Secção:** STU-5.2 / STU-6

**Mudança proposta:**

```diff
-opcionais: documento (CPF), telefone, e-mail, observações.
+opcionais: documento (CPF), telefone, e-mail, **telefone do responsável (`guardian_phone`)**, observações.
```

**STU-6.2.** `guardian_phone`, quando preenchido, segue normalização E.164 (**DOC-18.2**). Obrigatório para envio WhatsApp de matrícula/termo de **menores**.

---

### `spec/features/supabase-schema/readme.md`

**Mudança proposta:**

```diff
+| `students.guardian_phone` | text nullable | Telefone E.164 do responsável (**STU-6.2**, **DOC-18.2**) |
+| `generated_documents.signature_*` | várias colunas | Ciclo de assinatura (**DOC-17.4**) |
```

---

### `spec/product/entities.md`

**Secção:** E15

**Mudança proposta:** adicionar campos **DOC-17.4** à tabela ENT-15.1.

**Secção:** ENT-4 (Student)

**Mudança proposta:** campo `guardian_phone`.

---

### `spec/product/spec.md`

**Secção:** SPEC-2.9

**Mudança proposta:**

```diff
-**SPEC-2.9.** **Módulo documental** ... certificados, termos de responsabilidade, comprovantes de matrícula ...
+**SPEC-2.9.** **Módulo documental** ... certificados, termos de responsabilidade, comprovantes de matrícula, **matrícula e termo ASLAM com assinatura digital simples e envio WhatsApp** ...
```

**Secção:** SPEC-5.7 — acrescentar bullet para fluxo matrícula/termo ASLAM.

---

### `spec/features/app-shell/readme.md` _(se existir rota)_

**Mudança proposta:** entrada de navegação `/matriculas-termos` no menu professor.

---

## Checklist antes de promover

- [ ] Stage 1, 2 e 3 concluídas e validadas
- [ ] PDFs adulto/menor conferidos contra modelos ASLAM
- [ ] Assinatura digital e fallback upload testados
- [ ] RLS validado para token público e colunas novas
- [ ] Revisão humana confirmada
- [ ] Pronto para `/update-spec`
