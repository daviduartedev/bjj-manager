# Feature: Documentos do aluno (módulo documental)

Contrato canónico para **geração, persistência, recuperação e compartilhamento** de documentos formais do aluno: certificados, termos de responsabilidade, comprovantes de matrícula e recibos manuais. O **recibo automático** disparado pelo `Pagar` está em [`spec/features/payment-receipts/readme.md`](../payment-receipts/readme.md) (**REC-**) e usa o mesmo motor descrito aqui.

## Relação com outras specs

- Visão e MVP: [`spec/product/spec.md`](../../product/spec.md) (**SPEC-2.9**).
- Entidades: [`spec/product/entities.md`](../../product/entities.md) (**E14**, **E15**, **E16**).
- Recibos automáticos: [`spec/features/payment-receipts/readme.md`](../payment-receipts/readme.md) (**REC-**).
- Planos de aula: [`spec/features/lesson-plans/readme.md`](../lesson-plans/readme.md) (**PED-12** , reusa o motor).
- Shell e rotas: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2** , `/documentos`).
- Perfil do aluno: [`spec/features/student-profile/readme.md`](../student-profile/readme.md) (**SPR-11** , aba Documentos).
- Configurações: [`spec/features/settings/readme.md`](../settings/readme.md) (**CFG-6** , recebedor / CNPJ / assinatura).
- Schema: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`document_templates`, `generated_documents`, `generated_document_deliveries`).
- RLS: [`spec/features/rls-security/readme.md`](../rls-security/readme.md) (**SEC-3.x**).

## Implementação (referência)

| Área | Artefactos típicos |
|------|---------------------|
| Rotas | `app/(dashboard)/documentos/{page.tsx,[documentId]/page.tsx}`; aba **Documentos** dentro de `/alunos/[id]` |
| Domínio | `lib/documents/{service.ts,template-resolver.ts,renderer.ts,storage.ts,numbering.ts,whatsapp.ts,audit.ts}` |
| Templates | `lib/documents/templates/{certificate,liability-term,enrollment-proof,payment-receipt,lesson-plan}/` |
| Validação | `lib/validations/documents.ts` |
| Server Actions | `actions/documents.ts` , `generateDocument`, `reissueDocument`, `getDownloadUrl`, `getWhatsAppLink` |
| UI | `components/documents/{document-list,document-generate-dialog,document-card}.tsx` |

---

## DOC-1. Tipos documentais (MVP)

| Tipo (slug) | Rótulo pt-BR | Origem típica |
|-------------|--------------|----------------|
| `enrollment_proof` | Comprovante de matrícula | Manual, por aluno |
| `certificate` | Certificado | Manual, por aluno |
| `liability_term` | Termo de responsabilidade | Manual, por aluno |
| `payment_receipt` | Recibo de pagamento | Automático no `Pagar` (**REC-**) ou manual |

**DOC-1.1.** O **recibo manual** existe para emitir recibos referentes a pagamentos antigos ou para casos em que o `Pagar` não dispara o automático (ex.: pagamento histórico migrado). Reutiliza o template e numeração descritos em **REC-**.

**DOC-1.2.** Outros tipos (laudos, atestados, declarações específicas) **ficam fora** do MVP.

---

## DOC-2. Rotas e UX

**DOC-2.1.** **Hub central:** `/documentos` , listagem global de documentos da conta com filtros (tipo, aluno, mês de emissão, status).

**DOC-2.2.** **Detalhe:** `/documentos/[documentId]` , metadados, preview embutido, acções (download, abrir, WhatsApp, reemitir, ver histórico de versões).

**DOC-2.3.** **Por aluno:** **`/alunos/[id]`** ganha **aba Documentos** (**SPR-11**) com:

- cards por tipo documental com descrição curta e CTA `Gerar`;
- histórico abaixo, ordem cronológica inversa, com tipo, número, versão, emissor, data, e atalhos (download / WhatsApp / reemitir).

**DOC-2.4.** O CTA `Gerar` abre **diálogo modal** com:

- preview HTML dos dados que serão preenchidos automaticamente;
- campos complementares quando o tipo exigir (ex.: `notes`, `issue_date` editável dentro de janela razoável);
- botões **Cancelar** e **Confirmar geração**.

**DOC-2.5.** **Mobile-first**: lista em cartões, diálogo em sheet alto.

---

## DOC-3. Persistência e versionamento

**DOC-3.1.** Cada emissão **persiste** uma linha em **`generated_documents`** (**E15**) com:

| Campo | Notas |
|-------|-------|
| `id` | UUID |
| `account_id` | Multi-tenant |
| `student_id` | Pode ser null para documentos não-aluno (não usado no MVP) |
| `payment_id` | Apenas para `payment_receipt` |
| `type` | Slug do tipo (`enrollment_proof`, etc.) |
| `status` | `pending`, `generating`, `generated`, `failed`, `archived` |
| `document_number` | Numeração visível (**DOC-4**) |
| `version` | Inteiro; reemissões incrementam |
| `template_version` | Inteiro; corresponde à versão do template usada |
| `payload_snapshot` | `jsonb` com os dados exactos usados na renderização |
| `storage_key`, `bucket`, `mime_type`, `file_size_bytes`, `checksum_sha256` | Metadados do binário |
| `generated_by_user_id` | FK para `profiles.id` |
| `generated_at` | `timestamptz`; null enquanto `pending`/`generating` |
| `failure_reason` | Texto null-able |
| `supersedes_id` | FK para a versão anterior numa série |
| `created_at`, `updated_at` | `timestamptz` |

**DOC-3.2.** Documento gerado é **imutável em conteúdo** (**RB-DOC-002**); reemissão cria nova linha com `version` incrementado e `supersedes_id` apontando para a versão anterior. O documento original **não** é apagado nem sobrescrito.

**DOC-3.3.** O `payload_snapshot` é canónico para reprocessamento determinístico (**RNF-002**): mesmo payload + mesma versão de template → mesmo PDF.

---

## DOC-4. Numeração

**DOC-4.1.** Formato: **`{PREFIX}-{YYYY}-{seq}`** com `seq` zero-padded a 4 dígitos (ex.: `REC-2026-0042`, `CERT-2026-0007`).

**DOC-4.2.** Prefixos por tipo:

| Tipo | Prefixo |
|------|---------|
| `payment_receipt` | `REC` |
| `enrollment_proof` | `MAT` |
| `certificate` | `CERT` |
| `liability_term` | `TERM` |

**DOC-4.3.** A sequência **`seq`** é **monotónica por (`account_id`, `type`, `YYYY`)**. A geração da sequência usa um helper SQL (função ou tabela auxiliar `document_sequences`) com lock por linha para garantir unicidade sem condição de corrida.

**DOC-4.4.** **Reemissão** mantém o **mesmo `document_number`** mas incrementa `version`; o PDF deve incluir selo visual **`2ª via`** (ou `Reemissão` quando `version > 1`).

---

## DOC-5. Templates

**DOC-5.1.** Cada tipo tem um template HTML+CSS versionado em **`document_templates`** (**E14**) ou em código (resolução por **DocumentTemplateResolver**, com versão activa por (`account_id?`, `type`)).

**DOC-5.2.** No MVP, os templates vivem em código (`lib/documents/templates/<type>/v1/{template.html,styles.css,schema.ts}`); a tabela `document_templates` existe para suportar override por conta no futuro mas é apenas referenciada por `template_version` no MVP (linhas opcionais).

**DOC-5.3.** Cada template define um **schema Zod** para o `payload_snapshot`; o renderer **não** aceita payload sem validação.

---

## DOC-6. Storage e download

**DOC-6.1.** **Bucket privado por ambiente** no Supabase Storage (`documents-prod`, `documents-staging`, `documents-dev`). Bucket isolado dos `lesson-plans-attachments` (anexos pedagógicos).

**DOC-6.2.** Convenção de chave: **`accounts/{accountId}/{type}/{YYYY}/{MM}/{documentNumber}-v{version}.pdf`**.

**DOC-6.3.** **Download** via Server Action `getDownloadUrl(documentId)` que devolve **URL assinada temporária** (TTL default **15 minutos**); o `bucket`+`storage_key` **não** são expostos directamente ao cliente.

**DOC-6.4.** A URL assinada é também o destino apontado em `wa.me` para compartilhamento (**DOC-8**).

---

## DOC-7. Geração server-side

**DOC-7.1.** Pipeline canónico (`DocumentGenerationService.generate(input)`):

1. validar input (Zod); resolver `student`, `payment`, `account`;
2. resolver template activo (versão);
3. construir `payload_snapshot` chamando o **builder** específico do tipo;
4. validar `payload_snapshot` contra o schema do template;
5. inserir `generated_documents` com `status='generating'`, sem `storage_key`;
6. renderizar HTML (server-side, sem browser do utilizador);
7. converter HTML → PDF com **Playwright headless** (singleton compartilhado, ver **REC-3.2**);
8. fazer upload do binário no bucket privado (`documents-{env}`) com `Content-Type: application/pdf`;
9. atualizar a linha para `status='generated'` com `storage_key`, `bucket`, `mime_type`, `file_size_bytes`, `checksum_sha256`, `generated_at`;
10. emitir evento `document.generated` (**DOC-10**).

**DOC-7.2.** Em falha (rendering, upload, hash) o pipeline coloca `status='failed'`, persiste `failure_reason` e propaga o erro para o chamador. Pagamento já gravado **não é estornado** (**BR-8.3**).

**DOC-7.3.** Idempotência: o serviço aceita uma `idempotency_key` opcional (no MVP: `payment_id` para `payment_receipt`); chamadas com mesma chave já em `generated` retornam o documento existente sem regerar.

---

## DOC-8. Compartilhamento por WhatsApp

**DOC-8.1.** O MVP usa **`wa.me`** (Fase 1 do request §24.1):

1. validar telefone do aluno: normalizar para **E.164** (com código de país BR `+55` quando ausente);
2. obter URL assinada do documento (TTL = **24 horas** para compartilhamento, vs **15 min** para download privado , **DOC-8.3**);
3. compor mensagem padrão (**DOC-8.4**);
4. abrir `https://wa.me/{telefoneE164SemMais}?text={encodeURIComponent(mensagem)}` em **nova aba**;
5. registar tentativa em `generated_document_deliveries` (**E16**) com `channel='whatsapp_web'`, `status='opened'` (a app não consegue confirmar entrega real).

**DOC-8.2.** Se o aluno **não tem telefone** ou o telefone falha na normalização, o CTA WhatsApp fica **desactivado** com tooltip explicativo. **Não** abrir `wa.me` sem destinatário.

**DOC-8.3.** O TTL de **24h** para o link de compartilhamento é configurável no domínio (`DOC_SHARE_TTL_SECONDS`, default 86400). O link **expira**; se o aluno tentar abrir depois, vê página de expirado do Supabase. A app **não regenera link automaticamente** sem nova acção do utilizador.

**DOC-8.4.** Mensagem padrão (template substituível por conta no futuro):

```
Olá! Segue o seu documento emitido por {accountName}: {documentTypeLabel}.
Referência: {documentNumber}
Acesse aqui: {signedUrl}
```

**DOC-8.5.** **API oficial WhatsApp Business** permanece **fora** do MVP; o contrato em `generated_document_deliveries` (`channel`, `external_message_id`, `provider_response`) já prevê a evolução sem mudança de UX.

---

## DOC-9. Server Actions e endpoints

| Acção | Resultado |
|-------|-----------|
| `generateDocument(input)` | Cria `generated_documents` e retorna `{ ok: true, documentId, downloadUrl }` ou `{ ok: false, error }` |
| `reissueDocument({ documentId, reason })` | Cria nova versão; `reason` obrigatório (texto entre 5 e 500 chars), guarda em `audit_log` |
| `getDownloadUrl({ documentId })` | URL assinada 15 min para download privado |
| `getWhatsAppLink({ documentId })` | Devolve `{ url, recipientPhoneE164 }` , a UI abre em nova aba |
| `listDocuments({ filters })` | Listagem com filtros (tipo, studentId, mês, status) |

**DOC-9.1.** Mensagens de erro em pt-BR, sem expor caminhos internos (**SEC-3.3**).

**DOC-9.2.** Todas as Server Actions revalidam `ROUTES.documentos`, `ROUTES.alunos + '/' + studentId`, e , para recibos , `ROUTES.mensalidades + '/' + studentId`.

---

## DOC-10. Auditoria, logs e observabilidade

**DOC-10.1.** Eventos emitidos:

- `document.generation.requested`
- `document.generated`
- `document.generation.failed`
- `document.reissued`
- `document.whatsapp_link.generated`
- `document.downloaded` (opcional, controlado por flag, para política de retenção)

**DOC-10.2.** Logs estruturados (campos mínimos): `event_name`, `account_id`, `user_id`, `student_id`, `payment_id`, `document_id`, `document_type`, `template_version`, `status`, `duration_ms`, `error_code`, `error_message`.

**DOC-10.3.** **Mascaramento de PII** em logs: CPF e telefone do aluno **não** aparecem em texto claro , apenas hash (`sha256`) ou últimos 2 dígitos para diagnóstico (**SPEC-7.1**).

---

## DOC-11. Reemissão

**DOC-11.1.** Disponível para todos os tipos no MVP; **motivo obrigatório** (entre 5 e 500 caracteres), persistido em `audit_log` ou na linha nova de `generated_documents` (`failure_reason` é null para reemissão; usar coluna dedicada `reissue_reason` ou registo em `audit_log`).

**DOC-11.2.** Reemissão **incrementa `version`**, mantém `document_number`, aponta `supersedes_id` para a versão anterior, marca o anterior com `status='archived'` (mantendo arquivo no storage para histórico).

**DOC-11.3.** O selo visual **`2ª via`** (ou `Reemissão , versão N`) aparece no PDF reemitido.

**DOC-11.4.** Documentos archived continuam acessíveis por download (URL assinada) e aparecem no histórico do aluno marcados como **versão substituída**.

---

## DOC-12. Validações de input

**DOC-12.1.** `student_id` deve pertencer ao tenant (**SEC-3.3**).

**DOC-12.2.** Para `payment_receipt`: `payment_id` deve pertencer ao tenant e ter `status` ∈ {`paid`, `scholarship`, `other`} (**REC-2.2**).

**DOC-12.3.** Para `enrollment_proof`: aluno deve ter **vínculo aberto** em `student_plans` (**ENT-7.2**).

**DOC-12.4.** Para `certificate`: requer `student.current_belt_id` válido; opcionalmente `event_date` (default = hoje em SP).

**DOC-12.5.** Para `liability_term`: aceita campo opcional `responsible_name` + `responsible_doc` quando o aluno é menor; quando aluno é adulto, usa dados do próprio aluno.

---

## DOC-13. Permissões (MVP)

**DOC-13.1.** Único papel é o professor/dono (**SPEC-3.6**); todas as acções **DOC-** estão disponíveis para esse papel sob RLS por `account_id`.

**DOC-13.2.** A matriz **§17.2** do request fica como evolução futura; o contrato **DOC-** não muda quando RBAC for introduzido.

---

## DOC-14. Casos extremos

| Cenário | Comportamento |
|---------|---------------|
| Aluno sem telefone | CTA WhatsApp desactivado com tooltip; geração e download funcionam |
| Aluno com telefone inválido | Idem; UX mostra «telefone inválido para WhatsApp» |
| Template ausente / desactivado | `status='failed'` + `failure_reason='template_unavailable'` |
| Storage indisponível | `status='failed'` + retry permitido; nada perdido |
| Rendering falha (HTML inválido) | `status='failed'`; payload preservado para diagnóstico |
| Tentativa cross-tenant | 404 genérico; auditado |
| Reemissão sem motivo | Server Action rejeita com mensagem em pt-BR |
| Download de documento `archived` | Permitido, marcado como **versão substituída** na UI |
| Aluno apagado depois de geração | Documentos existentes permanecem (snapshot imutável) , listagem mostra «aluno removido» |

---

## DOC-15. Fora do escopo (deste ciclo)

- Assinatura digital ICP-Brasil.
- Upload de assinatura manuscrita pelo aluno em tempo real.
- Integração com WhatsApp Business API.
- Editor visual de templates pelo professor.
- Portal do aluno para autoatendimento.
- Notificação automática (e-mail/SMS) quando documento for emitido.
- Retenção/descarte automático após N dias (governança da conta).

---

## Manutenção

Alterações em tipos documentais, no pipeline de geração, na numeração, no storage ou no compartilhamento devem actualizar **este readme**, [`spec/product/entities.md`](../../product/entities.md) (**E14**, **E15**, **E16**) + [`docs/product/entities.md`](../../../docs/product/entities.md), [`spec/features/payment-receipts/readme.md`](../payment-receipts/readme.md) sempre que o motor compartilhado mudar, [`spec/features/lesson-plans/readme.md`](../lesson-plans/readme.md) se **PED-12** divergir, [`spec/features/settings/readme.md`](../settings/readme.md) (**CFG-6**) se mudarem campos do recebedor, e os cenários do ciclo em `cycles/Q22026/25-0510-pedagogical-documents-finance/scenarios.feature`.
