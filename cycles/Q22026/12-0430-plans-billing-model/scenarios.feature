# language: pt
# Ciclo: Q22026/12-0430-plans-billing-model
# Regras: **BLM-** em spec/features/plans-billing-model/readme.md; **BR-**, **ENT-7** em spec/product.

Funcionalidade: Planos e vínculo de mensalidade por aluno
  Para cobrar de forma coerente com a minha operação
  Como professor autenticado na minha academia
  Quero planos padrão na conta, preço configurável e vínculo do aluno com histórico
  Sem depender ainda de registo de pagamentos na aplicação

  Cenário: Conta ganha os três planos padrão ao entrar no painel
    Dado que a minha academia ainda não tinha os planos por tipo criados na base
    Quando acedo pela primeira vez à área autenticada do painel
    Então passam a existir os planos Kids 1, Kids 2 e Adulto na minha conta
    E cada um tem o valor por defeito acordado para o produto até eu alterar

  Esquema do cenário: Professor ajusta o preço padrão de um plano
    Dado que estou autenticado na minha academia
    E que escolho um dos meus planos (<plano>)
    Quando defino um novo preço padrão válido para esse plano
    Então o sistema guarda esse valor como referência para alunos sem preço personalizado
    E o valor continua representado de forma inteira na base (centavos)

    Exemplos:
      | plano   |
      | Kids 1  |
      | Kids 2  |
      | Adulto  |

  Cenário: Valor efetivo do aluno usa personalização quando existe
    Dado que um aluno está associado a um plano com preço padrão conhecido
    E que para esse aluno existe um preço personalizado definido
    Quando consulto o valor efetivo usado para cobrança
    Então o valor personalizado prevalece sobre o preço padrão do plano

  Cenário: Valor efetivo volta ao plano quando remove a personalização
    Dado que um aluno tinha preço personalizado no vínculo aberto
    Quando removo explicitamente essa personalização
    Então o valor efetivo passa a seguir o preço padrão do plano atual

  Cenário: Troca de plano ou de condições do vínculo preserva histórico
    Dado que um aluno já tem um vínculo aberto com um plano e dia de vencimento
    Quando altero o plano, o dia de vencimento ou renovo o mesmo plano para nova vigência
    Então o sistema encerra o vínculo anterior com data de fim coerente com o novo início
    E abre um novo vínculo em linha separada
    E consigo ver ao longo do tempo que houve mais do que um período de vínculo quando aplicável

  Esquema do cenário: Dia de vencimento inválido é recusado com mensagem clara
    Dado que estou a definir o vínculo de mensalidade de um aluno
    Quando informo um dia de vencimento fora do intervalo permitido pelo produto
    Então a operação não é concluída
    E recebo uma mensagem específica que explica o problema do dia de vencimento
    E não sou apenas informado de um erro genérico sem contexto

    Exemplos:
      | dia |
      | 0   |
      | 29  |

  Cenário: Plano inativo não entra em novo vínculo
    Dado que um dos meus planos foi marcado como inativo para novas adesões
    Quando tento associar um aluno a esse plano como novo vínculo
    Então a operação não é concluída
    E recebo uma mensagem que indica que esse plano não está disponível para nova associação

  Cenário: Falhas de permissão ou dados alheios não revelam detalhes sensíveis
    Dado que estou autenticado na minha academia
    Quando tento uma operação sobre plano ou aluno que não pertence à minha conta ou não existe para mim
    Então não obtenho dados de outras academias
    E a mensagem apresentada não expõe detalhes técnicos internos nem confirma existência além do que o produto pretende
