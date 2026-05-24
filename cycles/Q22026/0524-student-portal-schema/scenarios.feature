# scenarios.feature — Medium Cycle
# Cycle: 0524-student-portal-schema
# Formato: Gherkin (Given/When/Then)
# Cada cenário deve ser verificável e mapeado para validation.md

Feature: Schema e RLS Fase 1 do Portal do Aluno
  Como operador da plataforma
  Quero colunas de role/vínculo/onboarding e políticas RLS mínimas
  Para desbloquear auth e onboarding do portal sem regressão do painel professor

  # --- DDL / defaults ---

  Scenario: Migration adiciona profiles.role com default professor
    Given uma base com utilizadores existentes sem coluna role explícita
    When a migration 009 é aplicada
    Then todos os profiles existentes têm role "professor"
    And novos profiles recebem default "professor" se role omitido

  Scenario: Migration adiciona students.user_id nullable com unicidade por conta
    Given uma conta com dois alunos sem vínculo Auth
    When o professor associa user_id ao aluno A
    Then o vínculo persiste
    And tentativa de associar o mesmo user_id ao aluno B na mesma conta é rejeitada
    And alunos existentes mantêm user_id NULL até provisionamento

  Scenario: Campos de onboarding Fase 1 existem em students
    Given um aluno com user_id ligado
    When o aluno completa onboarding na app (fora deste cycle)
    Then portal_terms_accepted_at pode ser persistido
    And guardian_email pode ser persistido para kind kids

  # --- RLS professor (regressão SEC-3.3 / SEC-4.1) ---

  Scenario: Professor continua a ver todos os alunos da própria conta
    Given um utilizador com profiles.role "professor"
    And alunos RLS-V-A na conta A
    When consulta students via cliente autenticado
    Then vê apenas alunos com account_id da conta A
    And não vê alunos da conta B

  Scenario: Professor continua a rejeitar INSERT com account_id alheio
    Given um utilizador professor autenticado na conta A
    When tenta INSERT em students com account_id da conta B
    Then a operação é rejeitada pelo Postgres/PostgREST

  # --- RLS student (SEC-3.7 parcial) ---

  Scenario: Aluno lê apenas a própria linha em students
    Given um utilizador com profiles.role "student"
    And students.user_id igual a auth.uid() na conta A
    And existem outros alunos na mesma conta A
    When consulta students via cliente autenticado
    Then devolve exactamente uma linha (a própria)
    And não devolve alunos de colegas na mesma academia

  Scenario: Aluno não lê students de outra conta
    Given aluno autenticado na conta A
    When consulta students
    Then nenhuma linha tem account_id diferente da conta do aluno

  Scenario: Aluno actualiza campos de onboarding na própria linha
    Given aluno autenticado com vínculo user_id
    When actualiza portal_terms_accepted_at e guardian_email na própria linha
    Then a operação é permitida
    And os valores persistem

  Scenario: Aluno não actualiza linha de outro aluno
    Given aluno autenticado na conta A
    When tenta UPDATE em students de outro student_id da mesma conta
    Then a operação é rejeitada ou não afecta linhas

  Scenario: Aluno lê e actualiza apenas o próprio profile
    Given utilizador com role "student"
    When consulta profiles
    Then vê apenas a linha com user_id = auth.uid()
    And pode UPDATE display_name ou phone na própria linha
    And não pode alterar profiles.role para "professor"

  # --- Anon (regressão) ---

  Scenario: Anon continua sem acesso a students e belts
    Given cliente anon
    When consulta students ou belts
    Then devolve zero linhas
