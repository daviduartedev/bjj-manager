# language: pt

Funcionalidade: Painel operacional (/painel)
  Como professor autenticado com conta configurada
  Quero ver um resumo imediato da academia e atalhos para agir
  Para sentir controlo e resolver o essencial sem navegar às cegas

  Esquema do cenário: KPI principal leva ao detalhe adequado
    Dado que existe pelo menos um <tipo> mensurável na conta
    Quando abro o painel
    Então vejo um resumo numerico para "<label>"
    E ao seguir o atalho desse resumo sou levado a "<destino>"

    Exemplos:
      | tipo          | label               | destino                                      |
      | aluno activo  | Alunos activos      | a lista de alunos                            |
      | atrasado      | Mensalidades atrasadas | mensalidades com foco em atrasados      |
      | aniversario   | Aniversariantes do mes | lista ou vista onde vejo aniversariantes |
      | graduacao     | Alertas de graduacao | lista de alunos ou vista definida no produto |

  Cenario: Professor ve quem precisa de atencao hoje
    Dado que existem alunos que se enquadram em pelo menos uma das categorias de atencao do dia
    Quando abro o painel
    Entao vejo uma secção dedicada ao dia com aniversariantes do dia vencimentos neste dia e alunos em atraso prolongado conforme regra do produto

  Cenario: Distribuicao por faixa da turma
    Dado que existem alunos activos com faixas registadas
    Quando abro o painel
    Entao vejo a distribuicao por faixa separando adulto e kids de forma compacta

  Cenario: Atalhos rapidos para cadastro e cobranca
    Quando abro o painel
    Entao consigo iniciar cadastro de novo aluno a partir do painel
    E consigo ir para a revisao de mensalidades para registar pagamentos

  Cenario: Lista de alunos mostra tempo na faixa e no grau
    Dado que estou na lista de alunos
    Quando visualizo cada linha ou cartao
    Entao percebo de relance ha quanto tempo o aluno esta na faixa actual e no grau actual

  Cenario: Painel carrega sem bloquear a interface sem dados
    Quando abro o painel e os dados ainda estao a chegar
    Entao vejo um estado de espera coerente com o resto da aplicacao sem ocupar o ecra inteiro com um spinner isolado

  Cenario: Conta ainda nao ligada a academia na base de dados
    Dado que o meu utilizador nao tem conta valida na aplicacao
    Quando abro o painel
    Entao vejo orientacao para configuracao em vez dos KPIs completos
