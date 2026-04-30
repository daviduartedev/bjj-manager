# Billing UI

## Context
A lógica de pagamentos e status já existe. Agora o professor precisa
de duas telas: uma **lista geral** do financeiro do mês (com filtros
por status) e a **aba financeira por aluno** (já parcialmente coberta
no perfil do aluno, expandida aqui). É a tela que ele abre todo dia
1 do mês.

## Intent
- Rotas:
  - `app/(dashboard)/billing/page.tsx` — lista geral do mês corrente.
  - `app/(dashboard)/billing/[studentId]/page.tsx` — financeiro
    detalhado de um aluno.
- Lista geral:
  - linha por aluno: nome, plano, valor efetivo, dia de vencimento,
    status (badge), botão "Registrar pagamento".
  - filtros: status (Pago/Pendente/Atrasado/Todos), busca por nome.
  - seletor de mês (default = mês corrente).
- Detalhe por aluno:
  - histórico de pagamentos (lista cronológica reversa),
  - resumo: plano atual, valor, dia de vencimento, status do mês.
  - botão "Registrar pagamento" abrindo dialog.
- Dialog de "Registrar pagamento":
  - mês de referência (default = mês corrente),
  - valor (default = preço efetivo),
  - data do pagamento (default = hoje),
  - método (texto livre opcional),
  - observações (opcional).

## Taste / Constraints
- Badges semânticos já existem (`badge-paid`, `badge-pending`,
  `badge-overdue`).
- Mobile: lista vira cards verticais; dialog ocupa quase tela cheia.
- Não construir gráfico nesta tela.
- Toasts ao registrar pagamento; otimistic update opcional.
- Server Actions sempre revalidam paths afetados.

## References
- `cycles/Q22026/0430-payments-billing-status/request.md`
- `cycles/Q22026/0430-app-shell/request.md`
- `cycles/Q22026/0430-design-system/request.md`

## Attachments
- (nenhum)
