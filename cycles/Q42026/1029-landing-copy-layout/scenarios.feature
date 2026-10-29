Feature: Landing pública do Casca

  Scenario: A proposta brasileira aparece sem repetição genérica
    Given que uma pessoa abre a página inicial
    Then ela entende que o Casca gere a rotina de academias brasileiras de artes marciais
    And encontra exemplos concretos de alunos, graduação, aulas e mensalidades

  Scenario: A adesão não promete teste inexistente
    Given que a pessoa consulta os planos ou o FAQ
    Then a página informa que a cobrança mensal começa na adesão
    And não promete três dias de teste

  Scenario: A página usa uma direção visual disciplinada
    Given que a pessoa percorre a landing
    Then áreas verdes usam o mesmo verde de fundo
    And a seção Como funciona aparece como card contido
    And o fechamento exibe uma única composição da marca

  Scenario: Movimento reduzido mantém o conteúdo acessível
    Given que a pessoa prefere movimento reduzido
    When ela chega ao fechamento
    Then a marca completa aparece sem depender da animação
