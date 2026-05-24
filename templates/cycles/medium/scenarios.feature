# scenarios.feature — Medium Cycle
# Cycle: {slug}
# Formato: Gherkin (Given/When/Then)
# Cada cenário deve ser verificável e mapeado para validation.md

Feature: {nome da feature}
  Como {ator}
  Quero {ação}
  Para {objetivo/valor}

  # --- Cenário de caminho feliz ---

  Scenario: {nome do cenário principal}
    Given {pré-condição}
    When {ação do usuário ou sistema}
    Then {resultado esperado observável}

  # --- Cenário de acesso negado ---

  Scenario: {usuário sem permissão não pode realizar ação}
    Given {usuário sem permissão adequada}
    When {tenta realizar a ação}
    Then {recebe erro 401 ou 403}
    And {recurso não é alterado}

  # --- Cenário de validação ---

  Scenario: {input inválido é rejeitado}
    Given {pré-condição}
    When {envia dados inválidos}
    Then {recebe erro de validação com mensagem clara}

  # --- Cenário de edge case (adicionar conforme necessário) ---

  Scenario: {edge case relevante}
    Given {pré-condição do edge case}
    When {ação}
    Then {resultado esperado}
