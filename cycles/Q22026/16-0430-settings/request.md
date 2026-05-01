# Settings

## Context
O professor precisa de um lugar para configurar a conta e os planos.
É enxuto no MVP: dados da academia, dados pessoais do professor e os
valores dos planos Kids/Adulto.

## Intent
- Rota canónica **`/configuracoes`** → `app/(dashboard)/configuracoes/page.tsx` (**SHELL-2**).
- Seções (tabs ou cards):
  - **Academia**: nome da academia (editar `account.name`).
  - **Perfil**: nome do professor, telefone, foto (avatar) , em
    `profiles`.
  - **Planos**: lista dos dois planos da conta (Kids/Adulto) com:
    nome, valor (`price_cents`), `active` toggle.
- Server Actions em `actions/settings.ts`:
  `updateAccount`, `updateProfile`, `updatePlanPrice`, `togglePlan`.
- Validações Zod em `lib/validations/settings.ts`.

## Taste / Constraints
- Mudança de senha **fica fora deste ciclo** , vai por
  recovery/auth flow padrão Supabase.
- Sem upload real de avatar no MVP , placeholder com iniciais é
  suficiente; upload pode entrar depois.
- Toasts em sucesso/erro.
- Mobile-first com formulários em coluna única.

## References
- `cycles/Q22026/06-0430-authentication/request.md`
- `cycles/Q22026/12-0430-plans-billing-model/request.md`

## Attachments
- (nenhum)
