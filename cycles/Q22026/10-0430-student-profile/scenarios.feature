# language: pt
# Perfil do aluno na área operacional (refino 10-0430-student-profile).
# Regras numeradas: **SPR-** em spec/features/student-profile/readme.md; lista **STU-** em students-crud.

Funcionalidade: Perfil do aluno
  Para tomar decisões no dia a dia sem abrir sempre a ficha completa
  Como professor autenticado
  Quero ver num só sítio o resumo do aluno, dados pessoais, graduação e situação financeira do mês
  E saber quando há alertas relevantes de idade ou transição de categoria

  Cenário: Abrir o perfil a partir da lista
    Dado que estou na lista de alunos
    Quando escolho um aluno pelo fluxo principal de abertura (linha ou cartão)
    Então sou levado ao perfil desse aluno
    E vejo um resumo no topo com identificação, faixa e grau actuais, tipo e situação operacional

  Cenário: Voltar à lista a partir do perfil
    Dado que estou no perfil de um aluno
    Quando quero regressar à visão geral de alunos
    Então consigo fazê-lo por uma ligação clara para a lista
    E reconheço em que página estou pelo título

  Cenário: Edição rápida sem sair da lista
    Dado que estou na lista de alunos
    Quando uso a acção secundária de edição rápida desse aluno
    Então posso ajustar dados frequentes no mesmo tipo de fluxo já previsto para a lista
    E o fluxo principal do cartão continua a levar ao perfil quando assim o pretendo

  Cenário: Consultar dados pessoais e observações sem duplicação
    Dado que estou no perfil de um aluno
    Quando relevo dados pessoais e notas relevantes
    Então encontro observações num único sítio coerente com essa área
    E não preciso de repetir a mesma informação noutro separador só para isso

  Cenário: Perceber graduação actual e histórico
    Dado que estou no perfil de um aluno
    Quando abro a área de graduação
    Então entendo a faixa e o grau actuais e há quanto tempo se mantêm
    E vejo o histórico de promoções quando existe
    E quando ainda não há histórico registado vejo uma explicação clara em vez de lista vazia confusa

  Cenário: Perceber plano, valor e mês corrente
    Dado que estou no perfil de um aluno com vínculo de plano
    Quando consulto a área financeira
    Então identifico o plano actual e o dia de vencimento acordado
    E entendo o estado da mensalidade do mês corrente em linguagem de operação da academia
    E quando aplicável percebo que o vencimento já passou sem quitação confirmada

  Cenário: Revisar pagamentos recentes
    Dado que existem registos de pagamento por mês para o aluno
    Quando consulto a lista resumida de pagamentos no perfil
    Então vejo os meses mais recentes com informação útil de estado e valores
    E consigo relacionar com o que espero na operação real

  Cenário: Registar pagamento ainda em construção
    Dado que estou no perfil de um aluno
    Quando escolho registar pagamento antes da área de cobrança estar concluída no produto
    Então sou informado de forma clara que o fluxo completo virá noutra entrega
    E posso fechar essa informação sem alterações indevidas nos dados

  Cenário: Promover graduação a partir do perfil
    Dado que estou no perfil de um aluno
    Quando escolho promover graduação
    Então obtenho o fluxo de promoção descrito no motor de graduação do produto
    E posso concluir uma promoção válida ou ver bloqueios compreensíveis quando a operação não é permitida

  Cenário: Alerta de transição kids para faixa adulta
    Dado um aluno classificado como criança na aplicação
    Quando a idade calculada atinge o limiar adulto previsto pelo produto
    Então vejo um aviso contextual no perfil a orientar revisão da faixa adulta aplicável
    E continuo a conseguir editar detalhes na ficha quando precisar

  Cenário: Aluno inexistente ou inacessível
    Dado que solicito o perfil com um identificador que não corresponde a um aluno da minha conta
    Quando a aplicação resolve o pedido
    Então obtenho uma resposta de “não encontrado” genérica
    E não recebo indícios que permitam adivinhar dados de outras contas
