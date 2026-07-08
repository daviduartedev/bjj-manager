# scenarios.feature — Matrícula e Termo de Responsabilidade (WhatsApp + assinatura digital)
# Cycle: 0708-enrollment-liability-whatsapp-signing

Feature: Matrícula e Termo de Responsabilidade ASLAM
  Como professor da academia
  Quero gerir, enviar e receber assinados os formulários de matrícula e termo
  Para substituir o fluxo manual em papel entregue de mão em mão

  # ============================
  # Stage 1 — CRUD e geração PDF
  # ============================

  Scenario Outline: Professor cria matrícula/termo e gera PDF conforme idade do aluno
    Given existe um aluno "<tipo_aluno>" com vínculo de plano aberto
    And o professor preenche os campos complementares do formulário ASLAM
    When o professor confirma a geração do documento
    Then o sistema produz um PDF no layout ASLAM "<variante>"
    And o documento recebe numeração no formato "ELF-<ano>-<sequencia>"
    And o professor consegue pré-visualizar e baixar o PDF gerado

    Examples:
      | tipo_aluno        | variante |
      | adulto (≥ 18 anos) | adulto   |
      | menor (< 18 anos)  | menor    |

  Scenario: Professor lista e abre detalhe de matrículas/termos
    Given existem registos de matrícula/termo para alunos da conta
    When o professor acede ao hub de matrículas e termos
    Then vê a listagem com aluno, status, data e número do documento
    And consegue abrir o detalhe de cada registo

  Scenario: Geração bloqueada sem vínculo de plano aberto
    Given um aluno sem plano activo
    When o professor tenta gerar matrícula/termo para esse aluno
    Then o sistema impede a geração com mensagem clara em português

  # ============================
  # Stage 2 — Assinatura digital e WhatsApp
  # ============================

  Scenario Outline: Envio por WhatsApp para destinatário correcto
    Given um documento gerado para aluno "<tipo_aluno>"
    And o telefone de destino está válido
    When o professor envia pelo WhatsApp
    Then abre conversa wa.me com mensagem curta e link de assinatura
    And o status do documento passa a aguardar assinatura

    Examples:
      | tipo_aluno |
      | adulto     |
      | menor      |

  Scenario: WhatsApp desactivado sem telefone válido
    Given um documento gerado para aluno sem telefone válido para WhatsApp
    When o professor vê as acções disponíveis
    Then o botão WhatsApp está desactivado com explicação

  Scenario: Responsável assina digitalmente pelo link recebido
    Given um documento aguardando assinatura com link válido
    When o destinatário abre o link no telemóvel
    And completa os campos em falta se necessário
    And desenha a assinatura e confirma
    Then o documento fica marcado como assinado
    And o professor consegue baixar o PDF com assinatura embutida

  Scenario: Link de assinatura expirado ou já utilizado
    Given um link de assinatura expirado ou já consumido
    When alguém tenta aceder ou submeter assinatura
    Then vê mensagem clara de indisponibilidade
    And nenhum PDF assinado adicional é criado

  # ============================
  # Stage 3 — Fallback e acompanhamento
  # ============================

  Scenario: Professor regista documento assinado recebido manualmente
    Given um documento aguardando assinatura
    When o professor faz upload de ficheiro assinado em PDF JPEG ou PNG até 10 MB
    Then o documento fica marcado como assinado
    And o ficheiro fica disponível para download no histórico do aluno

  Scenario: Professor reenvia link de assinatura
    Given um documento aguardando assinatura há vários dias
    When o professor escolhe reenviar pelo WhatsApp
    Then um novo link válido é gerado
    And o link anterior deixa de ser utilizável

  Scenario: Histórico do aluno mostra matrícula/termo assinado
    Given um aluno com matrícula/termo assinado
    When o professor abre a aba Documentos do aluno
    Then vê o registo com status assinado e atalhos para baixar

  Scenario: Reemissão exige motivo e invalida assinatura anterior
    Given um documento já assinado
    When o professor solicita reemissão sem motivo
    Then o sistema rejeita
    When informa motivo válido
    Then nasce nova versão numerada
    And a versão anterior fica arquivada
