# language: pt
# Motor de graduação (refino 11-0430-graduation-engine).
# Regras numeradas: **GRD-** em spec/features/graduation-engine/readme.md; **GR-** em spec/product/graduation-rules.md.

Funcionalidade: Registar graduações e histórico do aluno
  Para acompanhar a progressão oficial com rastreio e alertas humanos
  Como professor autenticado
  Quero promover alunos respeitando a ordem das faixas e graus
  E consultar o histórico completo quando precisar de contexto

  Cenário: Promover um grau ou a faixa seguinte sem pulo
    Dado que estou a registar uma promoção que segue a ordem oficial para aquele aluno
    Quando confirmo a graduação com data válida
    Então o estado actual do aluno reflecte a nova faixa e grau
    E o evento aparece no histórico sem indicação de pulo de ordem

  Cenário: Pular faixa exige justificativa antes de concluir
    Dado que escolho uma faixa que não é a sucessora imediata na sequência aplicável ao aluno
    Quando tento concluir sem preencher o motivo do pulo
    Então não consigo finalizar o registo de forma útil
    E quando preencho uma justificativa clara e confirmo
    Então o histórico guarda o evento como pulo com esse motivo visível para consulta futura

  Cenário: Saltar mais de um grau na mesma faixa não é permitido
    Dado que mantenho o aluno na mesma faixa
    Quando escolho um grau que não corresponde a avançar exactamente um grau válido para essa faixa
    Então o sistema recusa a operação com orientação compreensível
    E não sou forçado a um fluxo de justificativa de pulo de faixa só por esse motivo

  Cenário: Não registar graduação futura nem repetir o estado actual
    Dado que estou no formulário de promoção
    Quando escolho uma data futura ou um resultado igual ao estado actual do aluno
    Então a aplicação impede a conclusão da operação

  Cenário: Consultar histórico completo além do resumo do perfil
    Dado que estou no perfil do aluno e já existem várias graduações
    Quando quero ver toda a cronologia
    Então consigo abrir a página dedicada ao histórico completo
    E lá sigo a sequência de eventos de forma contínua

  Cenário: Promover a partir do histórico ou do perfil
    Dado que estou no perfil ou na página de histórico do mesmo aluno
    Quando abro a acção de promover
    Então uso o mesmo fluxo coerente de promoção
    E após sucesso permaneço no contexto onde estava com dados actualizados

  Cenário: Lembrete de transição para faixa adulta quando aplicável
    Dado um aluno classificado como criança que atingiu a idade adulta prevista pelo produto
    Quando estou no fluxo de promoção
    Então sou informado de que a faixa adulta inicial é decisão do professor
