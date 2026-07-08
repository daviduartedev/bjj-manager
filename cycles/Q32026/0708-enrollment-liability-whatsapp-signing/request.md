# request.md — Matrícula e Termo de Responsabilidade — WhatsApp (envio, assinatura, retorno)

## Cycle
- **Path:** `cycles/Q32026/0708-enrollment-liability-whatsapp-signing/`
- **Tipo:** Large
- **Data:** 2026-07-08
- **Autor:** {nome}

---

## Contexto

A ASLAM usa dois formulários legais em PDF (adulto e menor) que combinam matrícula e termo de responsabilidade. Hoje o sistema tem módulo documental (**DOC-**) com tipos genéricos `enrollment_proof` e `liability_term` e compartilhamento via `wa.me` (link do PDF), mas **não** cobre o conteúdo/campos dos formulários ASLAM nem o fluxo de assinatura e devolução pelo WhatsApp.

Documentos de referência (conteúdo legal):
1. **Adultos:** «MATRÍCULA E TERMO DE RESPONSABILIDADE DE ATLETA DE JIU JITSU»
2. **Menores:** «MATRÍCULA E TERMO DE RESPONSABILIDADE – AUTORIZAÇÃO PARA PARTICIPAÇÃO DE ATLETA (MENOR DE 18 ANOS)»

---

## O que precisa ser feito

Módulo operacional para o professor emitir, enviar e acompanhar a **Matrícula e Termo de Responsabilidade** da ASLAM, usando o WhatsApp cadastrado do aluno (ou do responsável, quando menor), até receber o documento assinado de volta.

### 1. Templates legais ASLAM

- Novo template (ou v2) espelhando fielmente os PDFs fornecidos:
  - Variante **adulto**: dados do praticante, saúde, cláusulas, assinatura + CPF.
  - Variante **menor**: dados do responsável + menor, autorização, cláusulas, assinatura do responsável + CPF.
- Pré-preenchimento a partir do cadastro do aluno + campos complementares no fluxo de geração.
- PDF gerado server-side (pipeline **DOC-7** existente).

### 2. Envio via WhatsApp

- Reutilizar padrão **DOC-8** (`getWhatsAppLink` / `wa.me`).
- Mensagem customizada para matrícula/termo: instruções de assinatura e devolução ao professor.
- Destinatário: telefone E.164 do aluno; para menores, preferir telefone do responsável (**decisão a confirmar no refine**).
- Registrar entrega em `generated_document_deliveries`.

### 3. Fluxo de assinatura e retorno (MVP manual)

- Status do documento além de `generated`: ex. `sent`, `signed_received`, `pending_signature` (nomes finais no refine).
- Após envio, professor pode marcar «aguardando assinatura».
- Quando aluno/responsável devolve pelo WhatsApp (fora do sistema), professor **faz upload** do arquivo assinado (PDF/imagem) vinculado ao documento original.
- Histórico auditável: quem enviou, quando, quem registrou recebimento, arquivo assinado armazenado.

### 4. UX

- Entrada principal: aba **Documentos** no perfil do aluno (`/alunos/[id]`) e/ou hub `/documentos`.
- Card/diálogo «Matrícula e Termo de Responsabilidade» (substitui ou complementa cards genéricos actuais).
- Indicadores visuais de status (pendente assinatura / assinado).
- Mobile-first.

### 5. Dados e schema (se necessário)

- Campos complementares para payload: endereço completo, RG, dados de saúde, responsável legal (menores).
- **Decisão a confirmar no refine:** persistir no aluno vs só no `payload_snapshot` do documento.

---

## Motivação / valor

- Digitalizar o processo papel da ASLAM: matrícula + termo de responsabilidade com envio e retorno pelo WhatsApp já usado na operação.
- Garantir versão correcta do documento (adulto vs menor) com campos legais completos.
- Dar visibilidade ao professor sobre quem recebeu, assinou e devolveu o termo.
- Reutilizar telefone E.164 do aluno e padrões existentes de documentos/WhatsApp (**DOC-8**, `lib/documents/whatsapp.ts`).

---

## Critérios de aceite (alto nível)

- [ ] PDF adulto e menor gerados conforme modelos ASLAM.
- [ ] Envio WhatsApp funcional com telefone cadastrado; CTA desactivado sem telefone válido (**DOC-8.2**).
- [ ] Mensagem de envio instrui assinatura e devolução ao professor.
- [ ] Fluxo de registro de documento assinado recebido (upload pelo professor).
- [ ] Histórico e auditoria no perfil do aluno (emitido → enviado → assinado).
- [ ] RLS multi-tenant; lint, type-check, build documentados em `validation.md`.

---

## Stages previstas (estimativa — refine confirma)

1. **Stage 1 — Templates + geração:** variantes adulto/menor, campos complementares, PDF ASLAM.
2. **Stage 2 — Envio WhatsApp + status:** integração **DOC-8**, mensagem customizada, tracking de envio.
3. **Stage 3 — Retorno assinado:** upload, status final, UI de acompanhamento, auditoria.

---

## Restrições e riscos conhecidos

- MVP continua com `wa.me` (WhatsApp Web); sem WhatsApp Business API neste cycle, salvo decisão explícita contrária no refine.
- Sem assinatura digital ICP-Brasil (**SPEC-3.1**, **DOC-15**).
- «Devolver pelo WhatsApp» sem API = fluxo manual (aluno responde no chat pessoal do professor); sistema não detecta retorno automaticamente.
- Campos de saúde (medicamentos, deficiência, exame físico) podem não existir no schema de alunos — migração + sensibilidade LGPD.
- Gap entre templates actuais (`enrollment_proof`, `liability_term` genéricos) e formulários legais ASLAM.
- Telefone do aluno vs telefone do responsável em menores (**SPT-2.4**).

---

## Fora de escopo

- WhatsApp Business API / webhook automático de mensagens recebidas.
- Assinatura digital ICP-Brasil ou DocuSign/ClickSign.
- Portal do aluno para assinar online dentro do app.
- Editor visual de templates pelo professor.
- Outros documentos formais (atestados, laudos, contratos externos).
- Loja/PIX/cobrança (cycle `0527-portal-shop-pix-whatsapp`).
- Notificação automática por e-mail/SMS.

---

## Perguntas abertas (resolver no refine)

- [ ] Assinatura: foto/scan do PDF impresso? Assinatura desenhada na tela? Só «aceite» tipado no WhatsApp?
- [ ] Documento único combinado (como nos PDFs) ou manter `enrollment_proof` + `liability_term` separados?
- [ ] Quais campos entram no cadastro permanente do aluno vs só no `payload_snapshot`?
- [ ] Destino WhatsApp para menores: telefone do responsável (campo separado?) ou telefone do aluno?
- [ ] PDF pré-preenchido para assinar ou PDF em branco para preenchimento manual?
- [ ] Prazo/expiração do envio? Lembrete automático?
- [ ] Nome legal «ASLAM» fixo ou configurável por conta (multi-tenant)?

---

## Specs relevantes

- `spec/features/student-documents/readme.md` — DOC-1 a DOC-15
- `spec/features/student-profile/readme.md` — SPR-11
- `spec/features/students-crud/readme.md` — STU-6
- `spec/features/student-portal/readme.md` — SPT-2.4 (responsável de menores)
- `spec/features/settings/readme.md` — CFG-6
- `spec/product/entities.md` — E14, E15, E16
- `spec/product/spec.md` — SPEC-2.9, SPEC-3.1, SPEC-5.7

---

## Referências

- PDFs: `ASLAM - MATRICULA E TERMO DE RESPONSABILIDADE DE MENORES.pdf`
- PDFs: `MATRÍCULA E TERMO DE RESPONSABILIDADE _ ASLAM.pdf`
- Templates actuais: `lib/documents/templates/liability-term/`, `lib/documents/templates/enrollment-proof/`
- WhatsApp: `lib/documents/whatsapp.ts`
- Hub documental: `/documentos`, aba Documentos em `/alunos/[id]`
