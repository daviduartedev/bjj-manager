# Payments and Billing Status

## Context
Com planos vinculados aos alunos, falta o registro de pagamento e a
máquina de status. O professor precisa marcar "pagou" e o sistema
precisa derivar **automaticamente** se o aluno está Pago, Pendente ou
Atrasado para o mês corrente.

## Intent
- Server Actions em `actions/billing.ts`:
  - `recordPayment({ studentId, referenceMonth, amountCents,
    paidAt?, method?, notes? })`.
  - `voidPayment({ paymentId })` (estorno simples; opcional MVP).
- Helper de status em `lib/billing/`:
  - `getMonthStatus(student, payments, today)` retorna
    `'paid' | 'pending' | 'overdue'`.
  - **Pago**: existe pagamento de `reference_month` igual ao mês
    corrente.
  - **Pendente**: ainda **não passou** o `due_day` deste mês e não
    há pagamento.
  - **Atrasado**: passou do `due_day` deste mês e não há pagamento.
- Hook/utility para listar status do mês corrente para muitos
  alunos numa só query (consumido pelo Dashboard e pela Billing UI).
- Considerar `due_day` 1..28 (já garantido no ciclo anterior).

## Taste / Constraints
- `reference_month` sempre normalizado para o **dia 1** do mês.
- Tratar fuso `America/Sao_Paulo` ao calcular "hoje passou do
  due_day" — comparar como datas locais, não UTC.
- Idempotência: registrar pagamento duplicado para o mesmo
  `(student_id, reference_month)` deve ser bloqueado por unique
  constraint OU upsert; decidir e documentar.
- Nada de UI completa neste ciclo — só ações e helpers. UI vem no
  próximo.
- Sem cron jobs no MVP; status é **derivado** sob demanda.

## References
- `cycles/Q22026/0430-plans-billing-model/request.md`
- `cycles/Q22026/0430-supabase-schema/request.md` (`payments`).
- `cycles/Q22026/0430-date-duration-utilities/request.md` (helpers
  de data).

## Attachments
- (nenhum)
