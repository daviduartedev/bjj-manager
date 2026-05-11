# Feature: Recibo automático ao registrar pagamento

Contrato canónico para o **recibo formal emitido automaticamente** quando o professor confirma um pagamento (`Pagar`). O motor partilhado de geração documental está em [`spec/features/student-documents/readme.md`](../student-documents/readme.md) (**DOC-**); este documento define o que é específico do **recibo** , gatilho, payload, template, fluxo de UX pós-pagamento e reemissão.

## Relação com outras specs

- Visão e MVP: [`spec/product/spec.md`](../../product/spec.md) (**SPEC-2.10**).
- Regras de cobrança: [`spec/product/billing-rules.md`](../../product/billing-rules.md) (**BR-8** , recibo automático).
- Pagamentos: [`spec/features/payments-billing-status/readme.md`](../payments-billing-status/readme.md) (**PBS-4**, **PBS-9**).
- UI de mensalidades: [`spec/features/billing-ui/readme.md`](../billing-ui/readme.md) (**BUI-9** , atalhos pós-pagamento).
- Documentos do aluno: [`spec/features/student-documents/readme.md`](../student-documents/readme.md) (**DOC-3**, **DOC-7**, **DOC-8**, **DOC-11**).
- Configurações: [`spec/features/settings/readme.md`](../settings/readme.md) (**CFG-6** , recebedor).
- Schema: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`generated_documents` ligado a `payments`).

## Implementação (referência)

| Área | Artefactos típicos |
|------|---------------------|
| Acção | `actions/billing.ts` , `recordPayment` (já existe; ganha geração inline do recibo) |
| Domínio | `lib/documents/templates/payment-receipt/v1/{template.html,styles.css,builder.ts}`; `lib/documents/service.ts` |
| Render | `lib/documents/renderer.ts` (Playwright headless) , partilhado com **DOC-7** e **PED-12** |
| UI | `components/billing/record-payment-dialog.tsx` (já existe); `components/billing/post-payment-summary.tsx` (novo) |

---

## REC-1. Gatilho

**REC-1.1.** A geração do recibo é **disparada inline** dentro da Server Action **`recordPayment`** (existente em `actions/billing.ts`), **após** o `upsert` na tabela `payments` ter sido confirmado pela base.

**REC-1.2.** O fluxo é **síncrono blocking**: a Server Action **só responde** ao cliente quando:

- (a) o pagamento foi gravado em `payments` **e**
- (b) o documento `generated_documents` está em `status='generated'` com `storage_key` válido **ou** em `status='failed'` (com pagamento intacto).

**REC-1.3.** O cliente recebe `{ ok: true, paymentId, receipt: { documentId, status, downloadUrl? } }`. Quando `receipt.status === 'failed'`, a UI exibe **toast de sucesso do pagamento** + **toast de erro do recibo** + **CTA `Tentar gerar novamente`** (**REC-7**).

**REC-1.4.** **Bolsista** (`status='scholarship'`, `amountCents=0`) **não** dispara recibo automático (não há valor recebido a comprovar). A UI omite os atalhos de recibo no resumo pós-pagamento. Recibo manual via módulo documental (**DOC-1.1**) continua possível mas é uso atípico.

**REC-1.5.** Pagamento marcado como **`other`** **não** dispara recibo automático (semântica explicitamente atípica, **PBS-3.1**).

---

## REC-2. Idempotência

**REC-2.1.** A geração é **idempotente por `payment_id`**: se o pagamento for re-registado (overwrite explícito, **PBS-4.4**) com o **mesmo `amount_cents`**, e já existir `generated_documents` com `status='generated'` apontando para esse `payment_id`, a Server Action **retorna o documento existente** sem regerar. A regra evita duplicação por duplo clique no botão Pagar.

**REC-2.2.** O `payment_id` figura na chave de unicidade lógica (`generated_documents.payment_id` é único quando `version=1` e `type='payment_receipt'`); reemissões (**DOC-11**) criam linhas adicionais com `version > 1` apontando para o mesmo `payment_id` e com `supersedes_id` definido.

**REC-2.3.** Se o documento existente estiver em `status='failed'`, a Server Action **regenera** (cria nova tentativa em `generated`, mantendo o registo `failed` para auditoria).

---

## REC-3. Motor de PDF compartilhado

**REC-3.1.** O motor de renderização HTML → PDF é **compartilhado** entre:

- recibos automáticos e manuais (**REC-**);
- demais documentos do aluno (**DOC-7**);
- planos de aula (**PED-12**).

**REC-3.2.** Tecnologia: **Playwright headless** server-side, instância **singleton** por processo Node.js (lazy-init). API interna `lib/documents/renderer.ts`:

```ts
renderHtmlToPdf({ html, css, format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } }): Promise<{ pdfBuffer: Buffer; checksumSha256: string }>
```

**REC-3.3.** Em ambientes serverless (Vercel/Lambda) onde Playwright não cabe sem ajuste, o adaptador `lib/documents/renderer.ts` aceita override por env var `PDF_RENDERER_DRIVER` (`playwright` default, `puppeteer-chromium` futuro), sem quebrar o contrato. **No MVP** assume-se host com Playwright instalável (Docker, Fly.io, container customizado, etc.).

**REC-3.4.** **Fontes embarcadas** (Inter ou similar com pesos 400/500/700) servidas localmente, **sem** fetch a CDN público durante o render (**§23.3** do request). Logo da academia e assinatura entram como **`data:`-URL** ou via path interno do servidor; nunca como URL pública.

---

## REC-4. Payload do recibo (`payment_receipt/v1`)

O `payload_snapshot` persistido em `generated_documents` para o tipo `payment_receipt` segue este shape (validado por Zod):

| Campo | Tipo | Origem | Notas |
|-------|------|--------|-------|
| `documentNumber` | `string` | gerado | `REC-{YYYY}-{seq4}` (**DOC-4**) |
| `version` | `int` | gerado | 1 na primeira emissão; incrementa em reemissão |
| `issueDate` | `string` (ISO date) | servidor | Data de emissão; **default = `paid_at` do pagamento em SP** |
| `payer.name` | `string` | aluno | Nome do aluno (futuro: pagador externo se diferente) |
| `payer.cpf` | `string \| null` | aluno | CPF do aluno; mascarado em logs |
| `receiver.legalName` | `string` | `accounts.legal_name` | **CFG-6.2** |
| `receiver.tradeName` | `string` | `accounts.name` | nome operacional |
| `receiver.cnpj` | `string \| null` | `accounts.cnpj` | **CFG-6.2** |
| `receiver.signatureImageDataUrl` | `string \| null` | `accounts.signature_url` | resolvido para `data:` URL no servidor |
| `receiver.signerDisplayName` | `string` | `profiles.display_name` do utilizador que disparou `recordPayment` | linha sob a assinatura quando não houver imagem |
| `amount.cents` | `int` | pagamento | `payments.amount_cents` |
| `amount.formatted` | `string` | derivado | `R$ 220,00` em pt-BR (**DATE-** para datas; helper monetário em `lib/billing`) |
| `amount.inWords` | `string` | derivado | «duzentos e vinte reais» , extenso para conferir com o exemplo da referência |
| `referenceMonths` | `array<{ year: int, month: int, label: string }>` | derivado | **REC-5** |
| `description` | `string` | derivado | «mensalidade do plano <plano>» |
| `paymentMethod` | `string \| null` | pagamento | `payments.payment_method` quando preenchido |
| `notes` | `string \| null` | pagamento | `payments.notes` |
| `reissue.isReissue` | `boolean` | derivado | `version > 1` |
| `reissue.reason` | `string \| null` | reemissão | quando aplicável |

**REC-4.1.** Todos os campos PII (`payer.cpf`, telefone) são **mascarados em logs** (**DOC-10.3**); o `payload_snapshot` em DB é considerado dado sensível e o acesso depende de RLS.

---

## REC-5. Multi-mês

**REC-5.1.** **MVP: um recibo por `payment`.** Cada `payments` corresponde a um único `reference_month`, portanto `referenceMonths` no payload tem **exactamente 1 elemento** no recibo automático.

**REC-5.2.** O exemplo da imagem de referência (`public/777df8c0-d6e4-44d7-8bbe-78a5090a5b76.jpg`) menciona «mensalidades dos meses de fevereiro e março» , esse caso fica para evolução futura via **recibo manual agregado** (fora do MVP). O **template visual** suporta lista de meses (com ou sem múltiplos), mas o **builder automático** sempre passa um array de tamanho 1.

**REC-5.3.** Quando a evolução de **recibo agregado manual** for introduzida, o contrato `payload_snapshot` permanece o mesmo (já comporta array). Apenas o builder e a UI mudam.

---

## REC-6. Template visual

**REC-6.1.** A imagem **`public/777df8c0-d6e4-44d7-8bbe-78a5090a5b76.jpg`** é a **referência canónica** do conteúdo textual. Estrutura do PDF:

```
RECIBO DE PAGAMENTO

Recebi de {payer.name}, CPF: {payer.cpf}, a importância
total de {amount.formatted} ({amount.inWords}), referente ao pagamento
{description}, no valor de {amount.formatted}.

Pagador:
{payer.name}    CPF: {payer.cpf}

Recebedor:
{receiver.legalName}    CNPJ: {receiver.cnpj}
Declaro que o valor foi recebido na data combinada.

Data: {issueDate em pt-BR (DD/MM/AAAA)}

Assinatura ___________________________
{receiver.signatureImageDataUrl OR receiver.signerDisplayName}
```

**REC-6.2.** O cabeçalho do PDF inclui:

- número documental (`{documentNumber}` , canto superior direito);
- selo `2ª via` ou `Reemissão (versão N)` quando `version > 1` (**DOC-11.3**);
- logo da academia (`accounts.logo_url`, opcional , se ausente, omite);
- nome operacional (`receiver.tradeName`).

**REC-6.3.** Tipografia neutra (Inter), tamanho A4, margens **20mm** topo/base e **15mm** laterais (**REC-3.2**), sem cor de fundo. Foco em legibilidade dos valores e nomes.

**REC-6.4.** Quando `receiver.signatureImageDataUrl` está disponível, a imagem aparece sobre a linha de assinatura, com altura máxima de **24mm** e proporção preservada. Caso contrário, a linha fica vazia e abaixo dela aparece o texto `{receiver.signerDisplayName}`.

**REC-6.5.** Quando `payer.cpf` é `null`, a UI omite a parcela `, CPF: …` no texto narrativo e na linha do pagador, sem deixar campo vazio visível.

---

## REC-7. UX pós-pagamento

**REC-7.1.** Após `recordPayment` retornar com sucesso (e `receipt.status='generated'`), a UI exibe **toast de sucesso** com mensagem `Pagamento registrado e recibo emitido.` e o **detalhe da mensalidade / perfil do aluno** mostra os atalhos definidos em **BUI-9**:

- **Baixar PDF** (URL assinada 15 min, **DOC-6.3**);
- **Abrir no navegador** (mesma URL);
- **Compartilhar via WhatsApp** (TTL 24h, **DOC-8.3**);
- **Reemitir** (abre diálogo de reemissão, **DOC-11**).

**REC-7.2.** Quando `receipt.status='failed'`, a UI mostra:

- toast de sucesso do pagamento;
- toast de erro do recibo com mensagem em pt-BR sem detalhes internos (**SEC-3.3**);
- **CTA inline `Tentar gerar novamente`** que invoca a Server Action `retryReceiptGeneration({ paymentId })` (chamada equivalente a `generateDocument` com `idempotencyKey=payment_id`).

**REC-7.3.** O perfil do aluno (**SPR-8**) e a lista de mensalidades (**BUI-2**) ganham **indicador visual** quando um pagamento tem recibo em `failed`: ícone discreto e tooltip `Recibo pendente de geração; clique para tentar novamente`.

---

## REC-8. Reemissão

**REC-8.1.** Disponível para qualquer recibo `generated` , inclui o automático e o manual. Reemissão segue **DOC-11**:

- motivo obrigatório (5 a 500 chars);
- nova `version`, mesmo `document_number`;
- `supersedes_id` aponta para a versão anterior;
- versão anterior fica `archived` (consultável; não apagada do storage).

**REC-8.2.** A reemissão **não** altera `payments` , o pagamento permanece intacto.

**REC-8.3.** O selo **`2ª via`** aparece a partir de `version=2`. A linguagem operacional preferida em UI é `2ª via` (e não «duplicado»).

**REC-8.4.** Apenas **um recibo activo** por (`payment_id`, `type='payment_receipt'`) , recibos `archived` continuam acessíveis pelo histórico mas não são considerados o «corrente».

---

## REC-9. Falhas e recuperação

| Falha | Comportamento |
|-------|---------------|
| Render Playwright | `status='failed'`, `failure_reason='render_error'`. Pagamento não é estornado. CTA retry visível. |
| Upload Supabase Storage | `status='failed'`, `failure_reason='storage_error'`. Idem. |
| Inserção em `generated_documents` (DB) | A Server Action devolve erro genérico; pagamento é mantido (já commitado). Auditar com `error_code` interno. |
| Numeração (sequência) sob contenção | Lock de linha em `document_sequences`; em deadlock, retry interno até **3** tentativas antes de marcar `failed`. |
| Aluno sem CPF | Geração ocorre normalmente; texto narrativo omite `CPF: …` (**REC-6.5**). Não bloquear. |
| Recebedor sem CNPJ ou assinatura | Geração ocorre; campos respectivos exibem `, ` ou linha vazia. Aviso na UI de `/configuracoes` quando `accounts.cnpj` ou `accounts.signature_url` estão vazios. |

**REC-9.1.** A linha em `payments` é **fonte da verdade** financeira; a inexistência ou estado falho do recibo **nunca** invalida o pagamento (**BR-8.3**, **CA-REC-004**).

---

## REC-10. Permissões

**REC-10.1.** No MVP, qualquer utilizador autenticado da conta pode disparar `Pagar` (e portanto gerar recibos) e **reemitir**. A matriz da §17.2 do request fica como evolução futura sem mudança de contrato **REC-**.

---

## REC-11. Observabilidade

**REC-11.1.** Métricas operacionais a expor (futuro, fora do hard MVP mas convenção do contrato):

- tempo médio de geração do recibo (P50/P95/P99);
- taxa de `failed` por janela móvel;
- número de reemissões por mês;
- percentual de pagamentos com recibo `generated` no primeiro try.

**REC-11.2.** Logs estruturados seguem **DOC-10.2** + campos `payment_id`, `amount_cents`.

---

## REC-12. Casos extremos específicos do recibo

| Cenário | Comportamento |
|---------|---------------|
| `accounts.cnpj` vazio | Geração permitida; CNPJ omitido no texto. UI de Configurações alerta. |
| `accounts.signature_url` vazio | Linha de assinatura com nome do utilizador autor (`profiles.display_name`). |
| Pagamento estornado (`voidPayment`) | Recibo activo é marcado como `archived` (não apagado). UI mostra a transição na timeline. |
| Pagamento alterado (overwrite) com **mesmo** `amount_cents` | Idempotente: devolve o mesmo recibo (**REC-2.1**). |
| Pagamento alterado com `amount_cents` diferente | Bloqueado em `recordPayment` (**PBS-4.4**); nunca chega à geração de recibo. |
| Falha repetida (3+ tentativas) | UI mostra `Recibo indisponível. Contacte suporte ou reemita manualmente.`; **não** bloqueia o utilizador. |

---

## REC-13. Fora do escopo (deste ciclo)

- Recibo agregado multi-mês (**REC-5.2**).
- Notificação automática ao aluno por canais não-WhatsApp.
- Assinatura digital ICP-Brasil.
- Conciliação contábil (export para sistemas terceiros).
- Geração proativa para pagamentos antigos sem recibo (backfill em massa).
- Configuração de templates de recibo por conta (override).

---

## Manutenção

Alterações ao gatilho do `recordPayment`, ao payload do recibo, ao template visual ou à idempotência devem actualizar **este readme**, [`spec/product/billing-rules.md`](../../product/billing-rules.md) (**BR-8**) + [`docs/product/billing-rules.md`](../../../docs/product/billing-rules.md), [`spec/features/payments-billing-status/readme.md`](../payments-billing-status/readme.md) (**PBS-9**), [`spec/features/billing-ui/readme.md`](../billing-ui/readme.md) (**BUI-9**), [`spec/features/student-documents/readme.md`](../student-documents/readme.md) quando o motor mudar, e os cenários do ciclo em `cycles/Q22026/25-0510-pedagogical-documents-finance/scenarios.feature`.
