# scenarios.feature — Large Cycle
# Cycle: 0524-student-portal-classes-checkin
# Formato: Gherkin (Given/When/Then)
# Escopo: Fase 2 — aulas, check-in, visão professor (sem conversão presença)

Feature: Portal do Aluno — aulas e check-in (Fase 2)
  Como aluno e professor
  Quero gerir intenção de presença antes da aula
  Para operar a academia no portal sem confundir check-in com presença oficial

  # ============================
  # Stage 1 — Schema e RLS
  # ============================

  Scenario: Políticas RLS isolam check-ins entre alunos da mesma conta
    Given dois alunos autenticados A e B na mesma academia
    And o aluno A fez check-in numa sessão
    When o aluno B consulta check_ins via cliente autenticado
    Then não vê o check-in do aluno A
    And tentativa de DELETE do check-in do aluno A pelo aluno B é rejeitada

  Scenario: Professor da conta gere turmas e vê check-ins
    Given um professor autenticado na conta da academia
    When insere turma, recorrência, sessão e inscrição de aluno
    Then consegue SELECT em check_ins das sessões da conta
    And não consegue SELECT em check_ins de outra account_id

  Scenario: Aluno só escreve check-in na própria linha
    Given um aluno autenticado inscrito numa turma com sessão aberta
    When insere check_in com student_id de outro aluno
    Then a operação é rejeitada pelo Postgres

  Scenario: Tabela attendances existe mas aluno não escreve
    Given um aluno autenticado
    When tenta INSERT em attendances
    Then a operação é rejeitada pela policy RLS

  # ============================
  # Stage 2 — Portal do aluno
  # ============================

  Scenario: Aluno vê aulas das turmas inscritas na próxima semana
    Given um aluno autenticado inscrito em "Turma Adulto Noite"
    And existem instâncias class_sessions nos próximos 7 dias dessa turma
    And a feature flag "student-portal.classes.checkin" está ativa
    When o aluno abre "/portal/aulas"
    Then vê horário, turma e professor de cada sessão elegível
    And não vê sessões de turmas em que não está inscrito

  Scenario: Aluno faz check-in dentro da janela
    Given um aluno autenticado inscrito na turma da sessão
    And existe sessão com início em 4 horas
    And a janela de check-in está aberta (6 horas antes até horário de início)
    When o aluno clica "Estou presente"
    Then um registro check_in é criado para o par (sessão, aluno)
    And o aluno vê confirmação visual do check-in

  Scenario: Aluno cancela check-in antes do fechamento da janela
    Given um aluno autenticado com check-in activo numa sessão
    And a janela de check-in ainda não fechou
    When o aluno cancela o check-in
    Then o registro check_in é removido
    And o aluno pode voltar a fazer check-in na mesma janela

  Scenario: Check-in rejeitado fora da janela — antes de abrir
    Given um aluno autenticado inscrito na turma
    And a sessão começa em 8 horas (janela ainda não abriu)
    When o aluno tenta fazer check-in
    Then a ação é rejeitada com mensagem em português
    And nenhum check_in é criado

  Scenario: Check-in rejeitado fora da janela — após início
    Given um aluno autenticado inscrito na turma
    And a sessão já iniciou
    When o aluno tenta fazer check-in
    Then a ação é rejeitada com mensagem em português
    And nenhum check_in é criado

  Scenario: Cancelamento rejeitado após fechamento da janela
    Given um aluno autenticado com check-in numa sessão que já iniciou
    When o aluno tenta cancelar o check-in
    Then a ação é rejeitada com mensagem em português

  Scenario: Flag classes.checkin desligada bloqueia fluxo no portal
    Given um aluno autenticado
    And a feature flag "student-portal.classes.checkin" está desligada
    When o aluno abre "/portal/aulas"
    Then vê indisponibilidade ou empty state documentado
    And não consegue executar check-in

  Scenario: Check-in não cria presença oficial
    Given um aluno com check-in confirmado numa sessão
    When consulto a tabela attendances
    Then não existe attendance criado automaticamente pelo check-in

  Scenario: Planos pedagógicos não aparecem como aulas agendadas
    Given existem lesson_plans pedagógicos no módulo PED-
    When o aluno abre "/portal/aulas"
    Then vê apenas class_sessions de turmas inscritas
    And não vê conteúdo de planos pedagógicos

  # ============================
  # Stage 3 — Painel professor + integração
  # ============================

  Scenario: Professor cria turma e define horário recorrente
    Given um professor autenticado
    When cria turma "Turma Adulto Noite" com modalidade adult
    And adiciona recorrência semanal segunda-feira 19:00–20:30
    Then a turma aparece em "/aulas/turmas"
    And instâncias class_sessions são geradas para os próximos 14 dias

  Scenario: Professor inscreve aluno na turma
    Given um professor autenticado com turma existente
    And um aluno activo na mesma conta
    When inscreve o aluno na turma
    Then o aluno passa a ver sessões dessa turma em "/portal/aulas"

  Scenario: Professor visualiza check-ins confirmados antes do início
    Given um professor autenticado na mesma conta da sessão
    And existem 2 check-ins confirmados para a sessão
    When o professor abre "/aulas/sessao/{sessionId}"
    Then vê os 2 alunos listados com horário do check-in

  Scenario: Lista de check-ins actualiza por polling
    Given um professor autenticado na página de check-ins de uma sessão
    And a janela de check-in está aberta
    When um aluno faz check-in noutro browser
    Then o professor vê o novo aluno na lista dentro de 30 segundos

  Scenario: Item Aulas visível na sidebar do professor
    Given um professor autenticado no painel
    When visualiza a navegação principal
    Then vê item "Aulas" que leva a "/aulas"

  Scenario: Professor vê indicador financeiro PBS-3 em aluno inadimplente
    Given um aluno inadimplente no mês corrente fez check-in
    And um professor autenticado visualiza check-ins da sessão
    Then o aluno aparece na lista com indicador de atraso financeiro
    And o check-in não foi bloqueado por inadimplência

  Scenario: Fluxo ponta a ponta professor configura turma e aluno faz check-in
    Given um professor autenticado cria turma com recorrência e inscreve aluno
    And a janela de check-in está aberta para uma sessão gerada
    When o aluno faz check-in em "/portal/aulas"
    And o professor abre "/aulas/sessao/{sessionId}"
    Then o aluno aparece na lista de check-ins

  Scenario: Não-regressão Fase 1 — auth e shell do portal
    Given um aluno autenticado com onboarding completo
    When navega entre "/portal", "/portal/financeiro" e "/portal/aulas"
    Then o shell e navegação pt-BR funcionam
    And o placeholder PIX em financeiro permanece com aviso "Em breve"

  Scenario: Aluno inadimplente ainda consegue check-in na v1
    Given um aluno autenticado inadimplente inscrito na turma
    And a janela de check-in está aberta
    When o aluno faz check-in
    Then o check_in é criado com sucesso
