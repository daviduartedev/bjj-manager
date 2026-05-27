# scenarios.feature — Large Cycle
# Cycle: 0524-visual-mobile-attendance-onboarding
# Formato: Gherkin (Given/When/Then)
# Escopo: visual mobile, presença oficial, histórico, provisionamento login

Feature: Experiência operacional moderna, mobile e presença
  Como professor e aluno
  Quero interface viva no telemóvel, presença oficial e histórico claro
  Para operar a academia com confiança no canal principal

  # ============================
  # Stage 1 — Visual UX/UI
  # ============================

  Scenario: Núcleo operacional usa acentos BJJ em vez de excesso de branco
    Given um professor autenticado
    When abre "/painel", "/alunos", "/mensalidades", "/aulas" ou "/login"
    Then vê lavagens ou cartões com tokens da paleta BJJ
    And não vê grandes áreas brancas sem hierarquia visual
    And as cores derivam de tokens do design system

  Scenario: Portal do aluno mantém coerência visual com o painel
    Given um aluno autenticado com portal activo
    When abre "/portal" ou "/portal/aulas"
    Then a interface usa a mesma linguagem cromática tokenizada
    And permanece legível no tema claro e no tema escuro

  # ============================
  # Stage 2 — Mobile + presença
  # ============================

  Scenario Outline: Fluxos prioritários são legíveis em viewports mobile
    Given um utilizador autenticado no papel adequado
    When abre "<rota>" com largura de viewport <largura> px
    Then consegue ler títulos, listas e botões principais sem scroll horizontal
    And os controlos críticos têm área de toque adequada

    Examples:
      | rota                         | largura |
      | /portal/aulas                | 320     |
      | /portal/aulas                | 375     |
      | /portal/aulas                | 414     |
      | /aulas/sessao/<sessionId>    | 320     |
      | /aulas/sessao/<sessionId>    | 768     |

  Scenario: Professor converte check-ins em presença oficial
    Given um professor numa sessão com alunos que fizeram check-in
    When confirma a presença dos check-ins seleccionados
    Then são criados registos em attendances com origem de check-in do aluno
    And os check-ins originais permanecem para métricas
    And o professor vê confirmação por toast

  Scenario: Professor regista presença manual de aluno inscrito
    Given um professor numa sessão
    And um aluno inscrito na turma sem check-in
    When regista presença manual desse aluno
    Then existe attendance com origem manual do professor
    And não é necessário check-in prévio

  Scenario: Professor exclui faltoso da lista final mantendo check-in
    Given um aluno com check-in numa sessão
    And presença já convertida para esse aluno
    When o professor remove o aluno da lista final de presença
    Then o registo attendance dessa sessão deixa de existir
    And o check-in do aluno permanece

  Scenario: Check-in do aluno não cria presença automaticamente
    Given um aluno que acabou de fazer check-in
    When o professor ainda não confirmou presença
    Then não existe attendance para esse par sessão-aluno

  Scenario: Acções principais de check-in e presença dão feedback por toast
    Given um fluxo de check-in ou presença concluído com sucesso ou erro
    When a acção termina
    Then o utilizador vê toast em português com cantos rectos

  # ============================
  # Stage 3 — Histórico professor
  # ============================

  Scenario: Professor vê total e histórico de presenças no perfil do aluno
    Given um professor no perfil "/alunos/<id>"
    When abre o separador "Presença"
    Then vê o total de aulas frequentadas contando só presenças oficiais
    And vê listagem cronológica com data, horário, turma, professor, origem e quem registou
    And cada página mostra até 20 registos

  Scenario: Perfil do aluno mostra empty state sem presenças oficiais
    Given um aluno sem registos em attendances
    When o professor abre o separador "Presença"
    Then vê mensagem clara de que ainda não há presenças registadas
    And o total exibido é zero

  Scenario: Paginação do histórico funciona no telemóvel
    Given um aluno com mais de 20 presenças oficiais
    When o professor navega para a página seguinte no separador "Presença"
    Then vê os registos mais antigos
    And consegue voltar à página anterior

  # ============================
  # Stage 3 — Histórico portal aluno
  # ============================

  Scenario: Aluno consulta o próprio histórico de presenças
    Given um aluno autenticado com presenças oficiais registadas
    When abre "/portal/presenca"
    Then vê apenas as próprias aulas frequentadas
    And vê total e listagem equivalentes ao que o professor consolidou
    And não vê presenças de outros alunos

  Scenario: Aluno sem presenças vê empty state no portal
    Given um aluno autenticado sem attendances
    When abre "/portal/presenca"
    Then vê mensagem de que ainda não há aulas frequentadas registadas

  # ============================
  # Stage 4 — Provisionamento login
  # ============================

  Scenario: Professor cria acesso ao portal para aluno activo
    Given um professor no perfil de um aluno activo sem user_id
    When provisiona acesso criando utilizador ou associando e-mail existente
    Then o aluno fica ligado ao portal
    And o professor vê toast de sucesso

  Scenario: Professor recebe senha temporária ou confirmação de convite
    Given um professor a provisionar acesso com opção de criar utilizador
    When o provisionamento conclui com sucesso
    Then vê senha temporária copiável uma única vez ou confirmação de convite por e-mail
    And a senha temporária não reaparece após fechar o aviso

  Scenario: Aluno provisionado autentica e acede ao portal
    Given um aluno com credenciais provisionadas
    When faz login em "/login"
    Then é redireccionado para "/portal"
    And consegue usar o portal conforme flags activas

  Scenario: Aluno arquivado ou removido não recebe provisionamento
    Given um aluno com archived_at ou removed_at preenchido
    When o professor tenta provisionar acesso ao portal
    Then a acção é rejeitada com mensagem clara
    And nenhum utilizador Auth novo é ligado a esse cadastro

  Scenario Outline: Erros de provisionamento comunicados ao professor
    Given um professor a provisionar acesso ao portal
    When ocorre "<situação>"
    Then vê toast ou mensagem inline em português
    And o aluno permanece sem acesso ligado

    Examples:
      | situação                                      |
      | e-mail Auth já ligado a outro aluno na conta  |
      | e-mail pertence a utilizador operacional      |
      | aluno já tem user_id                          |
      | falha de rede ou permissão no servidor        |
