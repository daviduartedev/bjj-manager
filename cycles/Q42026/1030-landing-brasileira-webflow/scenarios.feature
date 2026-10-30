Feature: Landing brasileira do Casca
  Scenario: Visitante conhece a proposta e o produto
    Given que não tenho sessão
    When abro a landing
    Then reconheço organização e crescimento da minha academia
    And encontro as quatro modalidades e a demonstração do Casca

  Scenario: Visitante entende a rotina e os primeiros passos
    When percorro a landing por rolagem nativa
    Then encontro cenas de alunos, aulas, mensalidades e painel
    And entendo como cadastrar alunos, organizar a rotina e acompanhar o dia

  Scenario: Movimento reduzido e celular
    Given que prefiro movimento reduzido
    When abro a página em uma tela pequena
    Then consigo ler todas as seções e alcançar todos os botões
    And o soquinho e a marca ficam disponíveis em seus estados finais

  Scenario: Contratação e mensalidades são explicadas com clareza
    When consulto planos e perguntas frequentes
    Then vejo os preços e limites do catálogo atual
    And entendo a cobrança da assinatura na adesão
    And entendo que a academia recebe as mensalidades dos alunos
    And não recebo uma promessa de trial nem faixa obrigatória no Boxe

  Scenario: Navegação e escolha de plano
    When uso links internos, teclado e botões de planos
    Then chego às seções existentes e ao cadastro com o plano escolhido
    And não preciso realizar cadastro ou pagamento para conhecer o produto
