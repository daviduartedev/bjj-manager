# Feature: Configurações e perfil do professor

Contrato canónico para **`/configuracoes`** (academia + planos) e **`/perfil`** (dados pessoais do utilizador autenticado), alinhado a **SHELL-2**, **BLM-**, **BR-**, **ENT-** e **AUTH-**.

## Relação com outras specs

- Shell e URLs: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-2**).
- Planos e actions: [`spec/features/plans-billing-model/readme.md`](../plans-billing-model/readme.md) (**BLM-4**, `updatePlan`).
- Autenticação e estado inválido: [`spec/features/authentication/readme.md`](../authentication/readme.md) (**AUTH-6.1**).
- Entidades: [`spec/product/entities.md`](../../product/entities.md) (**E1**, **E2**, **E6**).
- Schema: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md) (`accounts`, `profiles`, `plans`).

## Implementação (referência)

| Área | Artefactos típicos |
|------|---------------------|
| Conta | `actions/settings.ts` , `updateAccount` |
| Perfil | `actions/settings.ts` , `updateProfile`; coluna opcional `profiles.phone` |
| Planos | `actions/billing.ts` , `updatePlanPrice`, **`updatePlan`** (nome, preço, ativo) |
| Validação | `lib/validations/settings.ts`, `lib/validations/billing.ts` |
| UI | `app/(dashboard)/configuracoes/page.tsx`; `app/(dashboard)/perfil/page.tsx` |

## CFG-1. Rotas

**CFG-1.1.** URL canónica **`/configuracoes`** segmento **`configuracoes`** em **`app/(dashboard)/`**.

**CFG-1.2.** **`/perfil`** permanece o destino para **dados pessoais** do professor (nome de exibição, telefone opcional, identidade visual por **iniciais** , sem upload de imagem no MVP).

## CFG-2. Academia (conta)

**CFG-2.1.** Editáveis pelo professor na UI: **`accounts.name`** (nome operacional / fantasia , **CFG-2**) e os **dados de recebedor** definidos em **CFG-6** (necessários para emissão de documentos formais e recibos , **DOC-**, **REC-**).

**CFG-2.2.** Alterações bem-sucedidas devem **atualizar** cabeçalhos ou etiquetas que mostram o nome da academia (**SHELL-4.1**) após **revalidação** (`revalidatePath`). Alterações em CFG-6 revalidam **`/configuracoes`**, **`/documentos`** e **`/mensalidades`** (recibos futuros usam os novos valores; recibos já gerados mantêm `payload_snapshot` original , **DOC-3.2**).

## CFG-3. Planos

**CFG-3.1.** Lista dos **três** planos da conta (**Kids 1** / **Kids 2** / **Adulto** por defeito , **`kids_1`**, **`kids_2`**, **`adult`**); todos os campos exibidos são obtidos de **`plans`** via RLS.

**CFG-3.2.** O professor pode editar **`name`**, **`price_cents`** e **`active`** (**BLM-4**, **`updatePlan`**).

**CFG-3.3.** Feedback com **toast** (Sonner) em sucesso e erro; mensagens em português do Brasil, sem detalhes internos (**BLM-3**, **SEC-3.3**).

## CFG-4. Perfil do utilizador

**CFG-4.1.** **`display_name`** editável; **`phone`** opcional (`profiles.phone`).

**CFG-4.2.** **E-mail** de login não é alterado nesta feature (permanece gestão Auth/admin).

**CFG-4.3.** Representação visual **iniciais** derivadas de `display_name` quando não há foto (MVP).

## CFG-5. UX

**CFG-5.1.** **Mobile-first**, uma coluna, secções **empilhadas** (cartões) com títulos claros; evitar passos desnecessários para utilizadores que preferem interfaces simples.

**CFG-5.2.** Controlo táctil alinhado a **DS-1.3** (áreas de toque ≥ 44px).

## CFG-6. Recebedor (academia) , campos para documentos formais

**CFG-6.1.** A secção **Recebedor** em **`/configuracoes`** alimenta os recibos automáticos (**REC-**) e os documentos formais (**DOC-**) emitidos pela academia. Sem estes valores, a geração **continua a ocorrer** mas alguns campos do PDF aparecem vazios e a UI sinaliza configuração incompleta (**REC-9 tabela**, **CFG-6.4**).

**CFG-6.2.** Campos editáveis na conta:

| Campo | Coluna sugerida | Tipo | Notas |
|-------|------------------|------|-------|
| Razão social | `accounts.legal_name` | `text` | Texto livre, 0 a 200 caracteres; default copia `accounts.name` na primeira gravação se vazio |
| CNPJ | `accounts.cnpj` | `text` | Validar máscara `00.000.000/0000-00` (algoritmo de dígitos verificadores opcional no MVP); persistir **com pontuação** para reproduzir o formato do recibo |
| Imagem de assinatura | `accounts.signature_url` | `text` (URL interna) | Upload de **PNG** ou **SVG**, fundo transparente preferencial; armazenado em bucket privado `branding-{env}`; tamanho máximo **256 KB**; dimensões máximas 1000×400 px |
| Logotipo da academia | `accounts.logo_url` | `text` (URL interna) | Opcional; quando presente, vai no cabeçalho dos PDFs; mesmo bucket de branding |

**CFG-6.3.** A imagem de assinatura é resolvida pelo servidor para **`data:` URL** ao montar o PDF (**REC-3.4**), evitando fetch público durante o render. O bucket `branding-{env}` é privado; URLs assinadas internas só são geradas server-side.

**CFG-6.4.** Quando a conta não tem `cnpj` ou `signature_url`, a página **`/configuracoes`** mostra um **banner de aviso** discreto com link para preencher; o `Pagar` continua a funcionar e a gerar recibos com lacunas (**REC-9**).

**CFG-6.5.** Alterações em CFG-6 **não regeram** documentos já emitidos (`payload_snapshot` é imutável , **DOC-3.2**); apenas afectam **futuras** emissões.

## CFG-7. Pré-condição para recibo automático

**CFG-7.1.** O fluxo `Pagar` (**BR-8**, **REC-1**) **não exige** preenchimento total de **CFG-6** para funcionar; campos vazios geram recibo com lacunas e banner de aviso. Esta decisão preserva onboarding rápido.

**CFG-7.2.** Para academias que querem recibos completos desde o primeiro pagamento, recomenda-se preencher **CFG-6.2** logo no onboarding; a UI pode oferecer atalho `Configurar dados do recebedor` no painel quando ausentes.

## Manutenção

Alterações em campos de `accounts`, `profiles` ou regras de `plans` na UI devem atualizar este readme (**CFG-**), [`spec/features/plans-billing-model/readme.md`](../plans-billing-model/readme.md) quando afetarem **BLM-**, [`spec/features/payment-receipts/readme.md`](../payment-receipts/readme.md) quando afectarem o payload do recibo (**REC-4**), [`spec/features/student-documents/readme.md`](../student-documents/readme.md) quando afectarem **DOC-**, e cenários em `cycles/.../16-0430-settings/scenarios.feature` e `cycles/.../25-0510-pedagogical-documents-finance/scenarios.feature`.
