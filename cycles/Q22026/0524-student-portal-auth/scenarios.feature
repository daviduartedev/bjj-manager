# scenarios.feature — Large Cycle
# Cycle: student-portal-auth
# Formato: Gherkin (Given/When/Then)
# Escopo: Fase 1 — auth, onboarding, shell, PIX placeholder
# Nota: cenários que dependem de profiles.role / students.user_id requerem cycle de schema

Feature: Portal do Aluno — auth, onboarding e shell (Fase 1)
  Como aluno ou professor
  Quero autenticação por role e shell inicial do portal
  Para aceder à área do aluno com segurança antes das fases de aulas e loja

  # ============================
  # Stage 1 — Infra de rotas e middleware
  # ============================

  Scenario: Anónimo não acede ao portal
    Given um visitante sem sessão
    When tenta aceder "/portal"
    Then é redirecionado para "/login"

  Scenario: Anónimo não acede a subrotas do portal
    Given um visitante sem sessão
    When tenta aceder "/portal/financeiro"
    Then é redirecionado para "/login"

  Scenario: Professor autenticado não acede ao portal
    Given um utilizador autenticado com role "professor"
    When tenta aceder "/portal"
    Then é redirecionado para "/painel"

  Scenario: Professor autenticado não acede a subrotas do portal
    Given um utilizador autenticado com role "professor"
    When tenta aceder "/portal/aulas"
    Then é redirecionado para "/painel"

  Scenario: Aluno autenticado não acede ao painel operacional
    Given um aluno autenticado com role "student"
    When tenta aceder "/painel"
    Then é redirecionado para "/portal"

  Scenario: Aluno autenticado não acede à gestão de alunos
    Given um aluno autenticado com role "student"
    When tenta aceder "/alunos"
    Then é redirecionado para "/portal"

  Scenario: Portal desligado por feature flag master
    Given a feature flag "student-portal.enabled" está desligada
    And um aluno autenticado com role "student"
    When tenta aceder "/portal"
    Then vê mensagem de indisponibilidade do portal
    And não acede ao conteúdo das subrotas

  # ============================
  # Stage 2 — Auth, vínculo e onboarding
  # ============================

  Scenario: Aluno faz login e é redirecionado para o portal
    Given um aluno com conta Auth e profiles.role "student"
    And students.user_id ligado ao auth user
    And a feature flag "student-portal.enabled" está ativa
    When faz login em "/login" com credenciais válidas
    Then é redirecionado para "/portal"
    And não para "/painel"

  Scenario: Professor faz login e continua a ir para o painel
    Given um professor autenticado com role "professor"
    When faz login em "/login" com credenciais válidas
    Then é redirecionado para "/painel"

  Scenario: Utilizador com sessão abre login e vai para destino do papel
    Given um aluno autenticado com role "student"
    When abre "/login"
    Then é redirecionado para "/portal"

  Scenario: Professor provisiona acesso ao portal para aluno
    Given um professor autenticado na conta da academia
    And um aluno "João" sem user_id associado
    When associa o e-mail "joao@example.com" de uma conta Auth existente ao aluno
    Then students.user_id fica ligado ao auth user correspondente
    And o perfil Auth recebe role "student" ou equivalente documentado

  Scenario: Provisionamento rejeita segundo aluno no mesmo auth user
    Given um auth user já ligado ao aluno A na mesma conta
    When o professor tenta ligar o mesmo auth user ao aluno B
    Then a acção é rejeitada com mensagem em português
    And students.user_id do aluno B permanece null

  Scenario: Aluno completa onboarding com aceite de termo
    Given um aluno autenticado com onboarding pendente
    And a feature flag "student-portal.enabled" está ativa
    When acede "/portal"
    Then é orientado para completar onboarding
    When aceita o termo de uso e submete
    Then pode aceder à home do portal

  Scenario: Menor deve informar e-mail do responsável no onboarding
    Given um aluno autenticado do tipo "kids" ou menor de idade
    And onboarding pendente
    When tenta concluir onboarding sem e-mail do responsável
    Then recebe erro de validação em português
    And o onboarding não é concluído

  Scenario: Aluno arquivado não acede ao portal
    Given um aluno autenticado com students.archived_at preenchido
    When tenta aceder "/portal"
    Then vê mensagem de acesso bloqueado
    And não vê conteúdo do portal

  Scenario: Aluno removido não acede ao portal
    Given um aluno autenticado com students.removed_at preenchido
    When tenta aceder "/portal"
    Then vê mensagem de acesso bloqueado

  # ============================
  # Stage 3 — Shell e placeholder PIX
  # ============================

  Scenario: Aluno vê shell com navegação principal
    Given um aluno autenticado com onboarding concluído
    And a feature flag "student-portal.enabled" está ativa
    When abre "/portal"
    Then vê navegação com destinos Início, Aulas, Loja e Financeiro
    And vê saudação com o nome do aluno

  Scenario: Aluno navega para placeholder de aulas
    Given um aluno autenticado no portal
    When abre "/portal/aulas"
    Then vê estado vazio ou mensagem indicando disponibilidade futura
    And não vê listagem funcional de class_sessions

  Scenario: Aluno navega para placeholder de loja
    Given um aluno autenticado no portal
    When abre "/portal/loja"
    Then vê estado vazio ou mensagem indicando disponibilidade futura
    And não vê vitrine funcional de produtos

  Scenario: Aluno vê layout PIX com aviso Em breve
    Given um aluno autenticado no portal
    And a feature flag "student-portal.payments.pix" está desligada
    When abre "/portal/financeiro"
    Then vê secção com placeholder de QR code
    And vê campo de chave PIX desabilitado ou fictício
    And vê aviso visível "Em breve" ou equivalente
    And não consegue concluir pagamento online
    And nenhuma transação financeira é processada

  Scenario: Planos pedagógicos não aparecem no portal
    Given existem lesson_plans no módulo pedagógico
    When o aluno navega nas rotas "/portal/aulas" ou "/portal"
    Then não vê conteúdo de planos pedagógicos mensais
