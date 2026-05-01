# Tarefas , Configurações e perfil (16-0430-settings)

## Spec / documentação

- [x] Actualizar **`spec/features/settings/readme.md`** (novo) com **CFG-** e relações (**SHELL-**, **BLM-**, **ENT-**).
- [x] Actualizar **`spec/README.md`** (matriz + convenção **CFG-**).
- [x] Actualizar **`spec/features/plans-billing-model/readme.md`**, **`spec/product/billing-rules.md`**, **`docs/product/billing-rules.md`**, **`spec/product/entities.md`**, **`docs/product/entities.md`** conforme `plan.md`.
- [x] Actualizar **`spec/features/app-shell/readme.md`**, **`spec/features/dashboard/readme.md`**, **`spec/features/student-profile/readme.md`**, **`spec/features/billing-ui/readme.md`** (referências / terminologia).
- [x] Manter **`cycles/Q22026/16-0430-settings/scenarios.feature`** alinhado à UX acordada.

## Schema e dados

- [x] Migração **`profiles.phone`**: `db/schema.sql` + script **`db/add-profiles-phone.sql`** para bases antigas; rever políticas RLS se **UPDATE** em `profiles` não estiver coberto (**SEC-**).
- [x] Actualizar **`db/seed.sql`** com nomes de plano **Kid 1 / Juvenil / Adulto** (mantendo `plan_kind`).
- [x] Actualizar **`lib/billing/constants.ts`** (`DEFAULT_PLAN_ROWS`) e **`lib/i18n/domain-enums.ts`** (`planKindLabels`).
- [x] Garantir que **`ensureDefaultPlansForCurrentAccount`** usa os novos nomes por defeito para linhas novas (via **DEFAULT_PLAN_ROWS**).

## Validação e actions

- [x] Criar **`lib/validations/settings.ts`** (conta + perfil).
- [x] Criar **`actions/settings.ts`**: `updateAccount`, `updateProfile`.
- [x] Estender **`lib/validations/billing.ts`** + **`actions/billing.ts`** com **`updatePlan`** (`name`, `active`, `price_cents`) + **revalidatePath** (`/configuracoes`, etc.).
- [x] Toasts Sonner em sucesso/erro em todas as mutações (`configuracoes-client.tsx`, `perfil-client.tsx`).

## UI

- [x] Substituir placeholder de **`app/(dashboard)/configuracoes/page.tsx`** por UI final: secções **Academia** e **Planos** (mobile-first, coluna única).
- [x] Componente cliente **`components/settings/configuracoes-client.tsx`** para formulário da academia e lista de planos.
- [x] **`app/(dashboard)/perfil/page.tsx`** + **`components/settings/perfil-client.tsx`**: formulário editável (nome, telefone) + iniciais; e-mail só leitura.
- [x] **Painel** (`components/painel/painel-dashboard.tsx`): **Ações rápidas**, **ativos**, **registrada**; barras da distribuição com cores por faixa (`lib/students/belt-chart-colors.ts`).
- [x] **`components/billing/mensalidades-detail-client.tsx`**: cabeçalho **Ações**; textos **ativo**.
- [x] Outros ficheiros com **activo(s)** em cópia de utilizador (ex.: **`record-payment-dialog.tsx`**) → **ativo(s)** / pt-BR.

## Verificação

- [x] `pnpm build` sem erros novos.
- [x] Revisão manual: fluxos cobertos por build + lint; QA em browser recomendado (`/configuracoes`, `/perfil`, `/painel`).
