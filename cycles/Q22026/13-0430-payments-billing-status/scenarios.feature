# language: pt
# Cenários de negócio — pagamentos e indicador do mês (ciclo 13)
# Foco: o que o professor/aluno percebe via produto; detalhes de API em spec/features/payments-billing-status/readme.md

Funcionalidade: Registrar pagamento da mensalidade do mês
  Como professor
  Quero confirmar que um aluno pagou a mensalidade de um mês de referência
  Para que o sistema reflita o estado financeiro acordado com a academia

  Cenário: Marcar mensalidade como paga com valor alinhado ao preço vigente
    Dado que existe um aluno com vínculo ativo a um plano e preço efetivo conhecido
    Quando registro o pagamento do mês de referência corrente com esse valor
    Então o sistema considera esse mês como pago para o aluno

  Cenário: Recusar pagamento sem valor coerente com o financeiro
    Dado que existe um aluno com preço efetivo definido para o vínculo atual
    Quando tento registrar o pagamento com um valor em centavos diferente desse preço
    Então a operação não é aplicada e recebo um feedback claro em português

  Cenário: Estornar um pagamento registrado
    Dado que existia um pagamento confirmado para um mês de referência
    Quando estorno esse pagamento
    Então esse mês volta a ser tratado como pendente até nova classificação

Funcionalidade: Indicador do mês para acompanhamento
  Como professor
  Quero ver se cada aluno está em dia, pendente ou atrasado para o mês
  Para priorizar cobrança e revisão mensal

  Esquema do cenário: Derivar situação conforme calendário e registro
    Dado o dia civil atual no fuso da academia
    E um mês de referência e um dia de vencimento para o aluno
    E <situação do registro de pagamento>
    Quando consulto o indicador do mês para esse aluno
    Então vejo <resultado esperado>

    Exemplos:
      | situação do registro de pagamento      | resultado esperado |
      | pagamento confirmado para aquele mês   | pago               |
      | registro como bolsista para aquele mês | bolsista           |
      | registro como outro para aquele mês    | outro              |
      | sem registro e antes do vencimento     | pendente           |
      | sem registro e após o vencimento       | atrasado           |

  Cenário: Aluno sem plano ativo não aparece como atrasado só pelo calendário
    Dado um aluno sem vínculo aberto a plano
    Quando consulto o indicador para o mês corrente
    Então não vejo situação de atraso derivada de vencimento
    E posso perceber que falta configuração de plano antes de cobrar
