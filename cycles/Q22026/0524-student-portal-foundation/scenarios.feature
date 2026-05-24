# scenarios.feature — Medium Cycle
# Cycle: student-portal-foundation
# Formato: Gherkin (Given/When/Then)
# Nota: cenários descrevem comportamento CONTRATUAL do portal — validação deste cycle é revisão documental;
#       implementação e E2E ficam para cycles Large futuros.

Feature: Portal do Aluno — fundação e contrato de comportamento
  Como product owner
  Quero cenários observáveis documentados
  Para validar o escopo antes da implementação

  # --- Check-in: caminho feliz ---

  Scenario: Aluno faz check-in dentro da janela
    Given um aluno autenticado com role "student"
    And o aluno está inscrito na turma da aula
    And existe uma instância de aula "class_session" com início em 4 horas
    And a janela de check-in está aberta (6h antes até horário de início)
    And a feature flag "student-portal.classes.checkin" está ativa
    When o aluno clica "Estou presente" na aula
    Then um registro "check_in" é criado para o par (aula, aluno)
    And o aluno vê confirmação visual do check-in
    And o professor consegue ver o aluno na lista de check-ins da aula

  Scenario: Aluno cancela check-in antes do fechamento da janela
    Given um aluno autenticado com check-in ativo numa aula
    And a janela de check-in ainda não fechou
    When o aluno cancela o check-in
    Then o registro "check_in" é removido ou marcado como cancelado
    And o aluno deixa de aparecer na lista de check-ins do professor

  # --- Check-in: regras de negócio ---

  Scenario: Check-in rejeitado fora da janela
    Given um aluno autenticado inscrito na turma
    And a aula começa em 8 horas (janela ainda não abriu)
    When o aluno tenta fazer check-in
    Then a ação é rejeitada com mensagem em português
    And nenhum "check_in" é criado

  Scenario: Check-in rejeitado após horário de início
    Given um aluno autenticado inscrito na turma
    And a aula já iniciou
    When o aluno tenta fazer check-in
    Then a ação é rejeitada com mensagem em português
    And nenhum "check_in" é criado

  Scenario: Check-in não equivale a presença oficial
    Given um aluno com check-in confirmado numa aula
    And a aula ainda não teve chamada encerrada pelo professor
    When consulto o registro oficial de presença
    Then não existe "attendance" derivado automaticamente só pelo check-in

  # --- Presença: professor ---

  Scenario: Professor converte check-ins em presença em lote
    Given um professor autenticado na mesma conta da aula
    And existem 3 check-ins confirmados para a aula
    When o professor encerra a chamada confirmando os check-ins
    Then 3 registros "attendance" são criados com origem "checkin_student"
    And os check-ins permanecem no histórico

  Scenario: Professor adiciona presença manual sem check-in
    Given um professor autenticado na mesma conta da aula
    And um aluno inscrito que não fez check-in
    When o professor marca presença manual do aluno
    Then um registro "attendance" é criado com origem "manual_instructor"
    And o aluno aparece na lista final de presença

  Scenario: Professor remove aluno que fez check-in mas faltou
    Given um professor autenticado encerrando a chamada
    And um aluno fez check-in mas não compareceu
    When o professor exclui o aluno da lista final de presença
    Then nenhum "attendance" é criado para esse aluno
    And o check-in permanece registrado para métricas

  # --- Aulas: listagem ---

  Scenario: Aluno vê aulas das suas turmas na próxima semana
    Given um aluno autenticado inscrito em "Turma Adulto Noite"
    And existem instâncias de aula geradas para os próximos 7 dias dessa turma
    When o aluno abre "/portal/aulas"
    Then vê horário, turma e professor de cada aula elegível
    And não vê aulas de turmas em que não está inscrito

  # --- Loja: reserva ---

  Scenario: Aluno reserva produto com estoque disponível
    Given um aluno autenticado
    And existe produto "Kimono" com estoque 2 e ativo
    And a feature flag "student-portal.shop" está ativa
    When o aluno reserva o produto
    Then o estoque do produto passa a 1 atomicamente
    And uma "reservation" é criada com status "pending_payment"
    And o aluno vê confirmação da reserva

  Scenario: Reserva rejeitada sem estoque
    Given um aluno autenticado
    And existe produto "Faixa" com estoque 0
    When o aluno tenta reservar o produto
    Then a ação é rejeitada com mensagem em português
    And o estoque permanece 0

  Scenario: Reserva expirada devolve estoque
    Given uma reserva "pending_payment" criada há mais tempo que o TTL configurado
    When o job de expiração executa
    Then a reserva passa a status "expired"
    And o estoque do produto é incrementado de volta

  Scenario: Professor confirma pagamento presencial da reserva
    Given uma reserva "pending_payment" de um aluno da conta
    When o professor confirma pagamento presencial
    Then a reserva passa a status "paid"
    And o estoque não é alterado novamente

  # --- PIX placeholder ---

  Scenario: Aluno vê layout PIX com aviso Em breve
    Given um aluno autenticado
    And a feature flag "student-portal.enabled" está ativa
    And a feature flag "student-portal.payments.pix" está desligada
    When o aluno abre a área financeira do portal
    Then vê secção com placeholder de QR code e chave PIX
    And vê aviso visível "Em breve" ou equivalente
    And não consegue concluir pagamento online
    And nenhuma transação financeira é processada

  # --- Segurança / RLS ---

  Scenario: Aluno não acede a dados de outro aluno
    Given dois alunos autenticados A e B na mesma academia
    When o aluno A tenta consultar check-ins ou reservas do aluno B
    Then recebe lista vazia ou erro genérico de permissão
    And nenhum dado do aluno B é exposto

  Scenario: Professor não acede ao portal do aluno como destino pós-login
    Given um professor autenticado com role "professor"
    When faz login com sucesso
    Then é redirecionado para "/painel"
    And não para "/portal"

  Scenario: Aluno não acede ao painel do professor
    Given um aluno autenticado com role "student"
    When tenta aceder "/painel" ou "/alunos"
    Then é redirecionado para "/portal" ou recebe erro de permissão

  # --- Feature flags ---

  Scenario: Portal desligado por feature flag
    Given a feature flag "student-portal.enabled" está desligada
    When um aluno autenticado tenta aceder "/portal"
    Then vê mensagem de indisponibilidade ou redirect documentado
    And capacidades de check-in e loja não são acessíveis

  # --- Domínio distinto ---

  Scenario: Planos pedagógicos não aparecem como aulas agendadas
    Given existem "lesson_plans" pedagógicos no módulo PED-
    When o aluno abre "/portal/aulas"
    Then vê apenas instâncias "class_sessions" geradas de turmas
    And não vê conteúdo de planos pedagógicos mensais
