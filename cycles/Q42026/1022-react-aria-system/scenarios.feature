Feature: Design system acessível e cadastro padronizado

  Scenario: Seleção de estado carrega municípios compatíveis
    Given que estou na primeira etapa do cadastro
    When seleciono um estado brasileiro
    Then o campo Cidade é habilitado e oferece municípios daquele estado
    And posso pesquisar e selecionar um município usando teclado

  Scenario: Trocar o estado invalida a cidade anterior
    Given que selecionei um estado e uma cidade
    When altero o estado
    Then a cidade selecionada é limpa
    And as opções de cidade correspondem ao novo estado

  Scenario: Senha segue política segura e explicada
    Given que estou criando meu acesso
    When informo uma senha abaixo do mínimo definido
    Then vejo uma mensagem clara e acessível
    And o servidor rejeita a mesma senha se o cliente for contornado

  Scenario: Componentes comuns mantêm comportamento coerente
    Given que navego por formulários migrados usando teclado
    When foco campos, botões, abas ou abro listas
    Then o foco é visível e consistente com os tokens Casca
    And menus permanecem dentro do viewport sem ocultar escolhas
    And CTAs principais ficam alinhados ao final do grupo de ações
