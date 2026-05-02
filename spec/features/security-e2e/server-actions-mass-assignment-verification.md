# Verificação final — mass assignment e Server Actions

Documento de revisão (**SECE2E-3.5**). Data do snapshot do código: ver histórico git do repositório.

## 1. Inventário de Server Actions (`"use server"`)

| Ficheiro | Função exportada | Payload do cliente | Validação no servidor |
|----------|------------------|-------------------|------------------------|
| [`actions/students.ts`](../../../actions/students.ts) | `createStudent` | `unknown` | `buildStudentFullFormSchema(...).strict()` → `safeParse` |
| [`actions/students.ts`](../../../actions/students.ts) | `updateStudent` | `unknown` | Idem |
| [`actions/students.ts`](../../../actions/students.ts) | `quickUpdateStudent` | `unknown` | `buildQuickEditFormSchema(...).strict()` → `safeParse` |
| [`actions/students.ts`](../../../actions/students.ts) | `setStudentStatus` | `unknown` (valor escalar) | `studentUiStatusSchema.safeParse` (**enum**, não objecto livre) |
| [`actions/students.ts`](../../../actions/students.ts) | `deleteStudent` | só `studentId` (argumento) | Delega em `setStudentStatus` |
| [`actions/billing.ts`](../../../actions/billing.ts) | `updatePlanPrice` | `unknown` | `updatePlanPriceSchema` (`.strict()`) |
| [`actions/billing.ts`](../../../actions/billing.ts) | `updatePlan` | `unknown` | `updatePlanSchema` (`.strict()`) |
| [`actions/billing.ts`](../../../actions/billing.ts) | `setStudentPlan` | `unknown` | `setStudentPlanSchema` (`.strict()`) |
| [`actions/billing.ts`](../../../actions/billing.ts) | `recordPayment` | `unknown` | `recordPaymentSchema` (`.strict()`) |
| [`actions/billing.ts`](../../../actions/billing.ts) | `recordPaymentsBulk` | `unknown` | `recordPaymentsBulkSchema` (`.strict()`) |
| [`actions/billing.ts`](../../../actions/billing.ts) | `voidPayment` | `unknown` | `voidPaymentSchema` (`.strict()`) |
| [`actions/settings.ts`](../../../actions/settings.ts) | `updateAccount` | `unknown` | `updateAccountSchema` (`.strict()`) |
| [`actions/settings.ts`](../../../actions/settings.ts) | `updateProfile` | `unknown` | `updateProfileSchema` (`.strict()`) |
| [`app/(dashboard)/actions.ts`](../../../app/(dashboard)/actions.ts) | `signOut` | *nenhum* | — |
| [`actions/graduations.ts`](../../../actions/graduations.ts) | *(nenhuma mutação)* | — | Placeholder |

## 2. Formulários → Actions (call sites)

| UI | Action |
|----|--------|
| [`components/students/student-form.tsx`](../../../components/students/student-form.tsx) | `createStudent`, `updateStudent` |
| [`components/students/quick-edit-dialog.tsx`](../../../components/students/quick-edit-dialog.tsx) | `quickUpdateStudent` |
| [`components/students/students-list.tsx`](../../../components/students/students-list.tsx) | `deleteStudent` |
| [`components/settings/configuracoes-client.tsx`](../../../components/settings/configuracoes-client.tsx) | `updateAccount`, `updatePlan` (literal construído: `planId` vem de props, não do schema de linha) |
| [`components/settings/perfil-client.tsx`](../../../components/settings/perfil-client.tsx) | `updateProfile` (literal `{ displayName, phone }`) |
| [`components/billing/record-payment-dialog.tsx`](../../../components/billing/record-payment-dialog.tsx) | `recordPayment` |
| [`components/billing/bulk-pay-dialog.tsx`](../../../components/billing/bulk-pay-dialog.tsx) | `recordPaymentsBulk` |
| [`components/billing/mensalidades-detail-client.tsx`](../../../components/billing/mensalidades-detail-client.tsx) | `voidPayment` |
| Chrome [`components/layout/dashboard-shell.tsx`](../../../components/layout/dashboard-shell.tsx) | `signOut` |

**Nota:** `updatePlanPrice` e `setStudentPlan` **não** têm import em `components/` neste snapshot; continuam expostas como Server Actions (pedidos HTTP craftados). Ambas usam schemas `.strict()` e RLS.

## 3. `z.object` em mutação — `.strict()` ou justificativa

| Schema | Local | Usado em Server Action? | `.strict()`? | Justificativa se não aplicável |
|--------|-------|---------------------------|--------------|--------------------------------|
| `buildStudentFullFormSchema` | `lib/validations/students.ts` | Sim | Sim | — |
| `buildQuickEditFormSchema` | idem | Sim | Sim | — |
| `studentUiStatusSchema` | idem | Sim (valor único) | N/A | **Enum**; não é objecto com chaves arbitrárias |
| `updatePlanPriceSchema` … `voidPaymentSchema` | `lib/validations/billing.ts` | Sim | Sim | — |
| `updateAccountSchema`, `updateProfileSchema` | `lib/validations/settings.ts` | Sim | Sim | — |
| `loginSchema` | `lib/validations/auth.ts` | **Não** | Sim | Apenas formulário cliente → `signInWithPassword` no browser |
| `updateProfileFormSchema` | `lib/validations/settings.ts` | **Não** | Sim | Espelho cliente; servidor só vê `updateProfileSchema` |
| `planRowFormSchema` | `lib/validations/settings.ts` | **Não** | Sim | Só cliente; servidor recebe `updatePlan(...)` montado explicitamente |

## 4. Campos sensíveis — lista de pedido vs implementação

Legenda: **Proibido** = não pode vir do cliente neste fluxo; **Controlado** = permitido só como enum/campo de domínio explícito e restrito; **Servidor** = definido só no código servidor / DB.

| Campo | Política neste projeto |
|-------|-------------------------|
| `id` | Não há chave genérica `id` nos payloads strict; existem `studentId`, `planId`, `paymentId` como **referências** ao recurso alvo. **RLS** restringe à conta da sessão. |
| `user_id` | **Proibido** nos payloads. `updateProfile` usa `eq("user_id", user.id)` a partir da sessão. |
| `account_id` | **Proibido** nos schemas. `createStudent` define `account_id: ctx.account.id`. |
| `owner_id`, `teacher_id`, `tenant_id`, `organization_id` | **Proibido** — não existem nos schemas nem nos `.insert`/`.update` das actions mapeadas. |
| `role`, `is_admin` | **Proibido** — não existem nos schemas (MVP sem RBAC). |
| `status` | **Controlado:** apenas **`studentUiStatusSchema`** (lista / desactivar) e **`quickEditStatusSchema`** (`active` / `inactive` / `paused` / `trial`). Não é papel RBAC nem `accounts.status`. |
| `amount_cents` | **Servidor** para pagamentos: `recordPayment` calcula via `fetchEffectivePriceCents`; schema **não** inclui `amount_cents`. `customPriceCents` em `setStudentPlanSchema` é preço personalizado de domínio (**BLM-**), não montante de pagamento registado. |
| `created_at`, `updated_at`, `deleted_at` | **Servidor** — definidos nas queries (`new Date().toISOString()` ou omitidos); **não** nos schemas de entrada. |

## 5. Conclusão

- Todas as Server Actions mutativas passam por **Zod** com **`.strict()`** nos objectos raiz **ou** por **enum** único (`setStudentStatus`).
- **Não** há caminho documentado que aceite `account_id`, `user_id`, `amount_cents` em pagamentos, timestamps de auditoria ou campos de tenant/RBAC a partir do JSON da action.
- Excepções semânticas (`status` operacional do aluno, `studentId` / `planId`) estão alinhadas ao produto e à **SEC-**/RLS.

Para alterações futuras: actualizar esta tabela e a **SECE2E-3.5** em [`readme.md`](./readme.md).
