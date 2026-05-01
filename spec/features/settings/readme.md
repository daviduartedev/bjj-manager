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
| Conta | `actions/settings.ts` — `updateAccount` |
| Perfil | `actions/settings.ts` — `updateProfile`; coluna opcional `profiles.phone` |
| Planos | `actions/billing.ts` — `updatePlanPrice`, **`updatePlan`** (nome, preço, ativo) |
| Validação | `lib/validations/settings.ts`, `lib/validations/billing.ts` |
| UI | `app/(dashboard)/configuracoes/page.tsx`; `app/(dashboard)/perfil/page.tsx` |

## CFG-1. Rotas

**CFG-1.1.** URL canónica **`/configuracoes`** segmento **`configuracoes`** em **`app/(dashboard)/`**.

**CFG-1.2.** **`/perfil`** permanece o destino para **dados pessoais** do professor (nome de exibição, telefone opcional, identidade visual por **iniciais** — sem upload de imagem no MVP).

## CFG-2. Academia (conta)

**CFG-2.1.** Neste ciclo, apenas **`accounts.name`** é editável pelo professor na UI.

**CFG-2.2.** Alterações bem-sucedidas devem **atualizar** cabeçalhos ou etiquetas que mostram o nome da academia (**SHELL-4.1**) após **revalidação** (`revalidatePath`).

## CFG-3. Planos

**CFG-3.1.** Lista dos **três** planos da conta (**Kid 1** / **Juvenil** / **Adulto** por defeito — **`kids_1`**, **`kids_2`**, **`adult`**); todos os campos exibidos são obtidos de **`plans`** via RLS.

**CFG-3.2.** O professor pode editar **`name`**, **`price_cents`** e **`active`** (**BLM-4**, **`updatePlan`**).

**CFG-3.3.** Feedback com **toast** (Sonner) em sucesso e erro; mensagens em português do Brasil, sem detalhes internos (**BLM-3**, **SEC-3.3**).

## CFG-4. Perfil do utilizador

**CFG-4.1.** **`display_name`** editável; **`phone`** opcional (`profiles.phone`).

**CFG-4.2.** **E-mail** de login não é alterado nesta feature (permanece gestão Auth/admin).

**CFG-4.3.** Representação visual **iniciais** derivadas de `display_name` quando não há foto (MVP).

## CFG-5. UX

**CFG-5.1.** **Mobile-first**, uma coluna, secções **empilhadas** (cartões) com títulos claros; evitar passos desnecessários para utilizadores que preferem interfaces simples.

**CFG-5.2.** Controlo táctil alinhado a **DS-1.3** (áreas de toque ≥ 44px).

## Manutenção

Alterações em campos de `accounts`, `profiles` ou regras de `plans` na UI devem atualizar este readme (**CFG-**), [`spec/features/plans-billing-model/readme.md`](../plans-billing-model/readme.md) quando afetarem **BLM-**, e cenários em `cycles/.../16-0430-settings/scenarios.feature`.
