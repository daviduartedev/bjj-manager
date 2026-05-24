# scenarios.feature — Large Cycle
# Cycle: {slug}
# Formato: Gherkin (Given/When/Then)
# Organizado por stage ou por domínio funcional

Feature: {nome da feature / módulo}
  Como {ator}
  Quero {ação}
  Para {objetivo/valor}

  # ============================
  # Stage 1 — {nome}
  # ============================

  Scenario: {cenário principal da stage 1}
    Given {pré-condição}
    When {ação}
    Then {resultado esperado observável}

  Scenario: {acesso negado — stage 1}
    Given {usuário sem permissão}
    When {tenta realizar ação da stage 1}
    Then {recebe 401 ou 403}

  # ============================
  # Stage 2 — {nome}
  # ============================

  Scenario: {cenário principal da stage 2}
    Given {pré-condição}
    When {ação}
    Then {resultado esperado}

  Scenario: {validação de input — stage 2}
    Given {pré-condição}
    When {envia dados inválidos}
    Then {erro de validação claro}

  # ============================
  # Stage 3 — {nome}
  # ============================

  Scenario: {cenário de integração ponta a ponta}
    Given {pré-condição que depende das stages anteriores}
    When {ação final do fluxo}
    Then {resultado final esperado}

  Scenario: {edge case crítico}
    Given {condição de edge case}
    When {ação}
    Then {resultado esperado}
