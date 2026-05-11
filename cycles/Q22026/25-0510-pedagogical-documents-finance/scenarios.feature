# language: pt
@casca @cycle-25-0510-pedagogical-documents-finance
Funcionalidade: Pedagógico, documentos do aluno e recibo automático ao pagar
  Como professor / dono da academia
  Quero planejar aulas mensalmente, emitir documentos formais e ter um recibo gerado automaticamente quando registro um pagamento
  Para reduzir trabalho manual, padronizar a comunicação com alunos e manter rastreabilidade

  # ──────────────────────────────────────────────────────────────────────────
  # MÓDULO PEDAGÓGICO , planos de aula mensais
  # ──────────────────────────────────────────────────────────────────────────

  Cenário: Professor cria um plano de aula mensal por categoria
    Dado que estou autenticado em uma academia
    Quando crio um novo plano com título, mês de referência, categoria e tópicos válidos
    Então o plano fica salvo como rascunho e visível na listagem do mês
    E aparece na categoria correspondente

  Cenário: Professor duplica o plano do mês anterior para acelerar o planeamento
    Dado um plano publicado no mês anterior em uma categoria
    Quando duplico esse plano para o mês corrente
    Então um novo plano é criado em rascunho com a mesma estrutura de tópicos e técnicas
    E o plano original do mês anterior permanece inalterado

  Cenário: Apenas um plano publicado por mês e categoria fica vigente
    Dado que existe um plano publicado para o mesmo mês e categoria
    Quando publico um segundo plano para esse mesmo mês e categoria
    Então o sistema confirma que o plano publicado anterior será arquivado
    E após confirmar, apenas o novo plano fica como vigente
    E o plano anterior continua acessível pelo histórico

  Cenário: Histórico de planos arquivados permanece consultável
    Dado um plano publicado anteriormente em uma categoria
    Quando esse plano é arquivado
    Então ele desaparece da listagem por defeito mas continua visível ao filtrar por arquivados
    E todas as suas revisões anteriores continuam consultáveis

  Cenário: Edição de plano publicado preserva o histórico de revisões
    Dado um plano publicado com conteúdo inicial
    Quando edito tópicos, técnicas ou observações desse plano
    Então uma nova revisão é criada com o conteúdo actualizado
    E a revisão anterior continua consultável no histórico

  Cenário: Exportação em PDF preserva a hierarquia pedagógica
    Dado um plano publicado com tópicos, sub-itens e técnicas
    Quando exporto esse plano em PDF
    Então o ficheiro descarregado contém a estrutura hierárquica preservada
    E inclui o cabeçalho da academia com o nome operacional

  Esquema do Cenário: Estrutura suporta o conteúdo pedagógico canónico de referência
    Dado que crio um plano para a categoria "<categoria>" no mês de Maio/2026
    Quando registo os tópicos descritos no exemplo "<exemplo>"
    Então o plano salva todos os tópicos sem truncar conteúdo
    E o PDF exportado mostra cada tópico na ordem registada

    Exemplos:
      | categoria | exemplo                                                                         |
      | Adulto    | finalizar controle, estabilização 100kg, montada, finalizações, quedas, drills  |
      | Kids 1    | brincadeiras semanais, 100kg, joelho na barriga, montada, armlock, generalidades |
      | Kids 2    | aquecimento, drills de passagem, pontinho 2x, meia guarda, raspagens, finalizações |

  # ──────────────────────────────────────────────────────────────────────────
  # MÓDULO DOCUMENTAL , geração manual
  # ──────────────────────────────────────────────────────────────────────────

  Esquema do Cenário: Documentos formais são gerados com dados do aluno preenchidos
    Dado um aluno cadastrado com dados básicos completos
    Quando gero um documento do tipo "<tipo>" pelo perfil do aluno
    Então o documento gerado contém os dados do aluno preenchidos automaticamente
    E o ficheiro PDF fica disponível para download por URL assinada
    E o documento aparece no histórico documental do aluno com tipo, número e data

    Exemplos:
      | tipo                       |
      | Comprovante de matrícula   |
      | Certificado                |
      | Termo de responsabilidade  |
      | Recibo manual              |

  Cenário: Cada emissão recebe um número documental único e visível
    Dado a academia ainda não emitiu nenhum certificado neste ano
    Quando emito o primeiro certificado do ano para um aluno
    Então o número documental segue o formato "CERT-{ano}-0001"
    E uma segunda emissão de certificado neste mesmo ano usa "CERT-{ano}-0002"

  Cenário: Reemissão cria nova versão sem apagar a original
    Dado um documento já emitido para um aluno
    Quando reemito esse documento informando o motivo "Correção de dados"
    Então uma nova versão é gerada com o mesmo número documental
    E o PDF reemitido apresenta selo "2ª via"
    E a versão original continua acessível no histórico marcada como substituída

  Cenário: Reemissão sem motivo é bloqueada
    Dado um documento já emitido
    Quando tento reemitir sem informar motivo válido
    Então o sistema bloqueia a operação com mensagem em português
    E nenhuma nova versão é criada

  Cenário: Compartilhamento por WhatsApp monta link com telefone do aluno
    Dado um aluno com telefone cadastrado num formato válido
    Quando aciono "Compartilhar por WhatsApp" para um documento gerado
    Então o sistema abre o WhatsApp Web com o telefone do aluno e mensagem padrão
    E a mensagem inclui o link de acesso ao documento

  Cenário: Aluno sem telefone bloqueia a partilha por WhatsApp
    Dado um aluno sem telefone cadastrado
    Quando visualizo um documento gerado para esse aluno
    Então o atalho de compartilhar por WhatsApp aparece desactivado
    E uma indicação clara explica que falta telefone válido

  Cenário: Documentos antigos preservam o snapshot de dados originais
    Dado um documento emitido para um aluno em uma data anterior
    Quando o nome ou endereço do aluno é alterado depois da emissão
    Então o documento já emitido continua a mostrar os dados originais ao ser baixado novamente
    E nenhuma reemissão automática é disparada

  Cenário: Tentativa de aceder documento de outra academia retorna 404 genérico
    Dado um documento que pertence a outra academia
    Quando tento aceder ao seu detalhe ou descarregar o PDF
    Então recebo erro 404 sem qualquer pista sobre a existência do recurso

  # ──────────────────────────────────────────────────────────────────────────
  # CONFIGURAÇÕES , dados do recebedor
  # ──────────────────────────────────────────────────────────────────────────

  Cenário: Professor configura dados do recebedor para enriquecer recibos
    Dado que estou em "/configuracoes"
    Quando preencho razão social, CNPJ e envio uma imagem de assinatura
    Então as configurações são guardadas com sucesso
    E recibos gerados a seguir incluem CNPJ e a assinatura no PDF

  Cenário: Recibo é gerado mesmo com configuração de recebedor incompleta
    Dado que a academia ainda não cadastrou CNPJ nem imagem de assinatura
    Quando registo um pagamento e o recibo é gerado
    Então o PDF é gerado normalmente com os campos disponíveis preenchidos
    E o sistema sinaliza em "/configuracoes" que a configuração do recebedor está incompleta

  # ──────────────────────────────────────────────────────────────────────────
  # RECIBO AUTOMÁTICO AO REGISTRAR PAGAMENTO
  # ──────────────────────────────────────────────────────────────────────────

  Cenário: Registar pagamento gera recibo automaticamente e exibe atalhos
    Dado um aluno com plano activo e dados completos
    Quando registo um pagamento normal pelo botão "Pagar"
    Então o pagamento fica gravado no mês de referência correspondente
    E um recibo formal é gerado e vinculado a esse pagamento
    E os atalhos "Baixar PDF", "Abrir no navegador", "Compartilhar por WhatsApp" e "Reemitir" ficam disponíveis no resumo pós-pagamento

  Cenário: Recibo emitido contém os campos formais esperados
    Dado um pagamento normal acabado de registar
    Quando abro o PDF do recibo
    Então o documento contém nome do pagador, valor por extenso, descrição, mês de competência, recebedor, CNPJ, data e assinatura
    E o número documental segue o padrão "REC-{ano}-{sequencial}"

  Cenário: Falha ao gerar o recibo não invalida o pagamento
    Dado um pagamento que foi gravado com sucesso mas a renderização do recibo falhou
    Quando observo a mensalidade desse aluno
    Então o pagamento permanece marcado como pago no mês de referência
    E aparece um indicador discreto avisando que o recibo está pendente de geração
    E posso accionar "Tentar gerar novamente" sem repetir o pagamento

  Cenário: Repetir o pagamento do mesmo mês com mesmo valor não duplica o recibo
    Dado um pagamento já registado para o mês de referência com recibo emitido
    Quando registo novamente o pagamento desse mesmo mês com o mesmo valor
    Então nenhum recibo adicional é criado
    E o resumo pós-pagamento devolve o recibo já emitido

  Cenário: Reemissão de recibo mantém o pagamento intacto
    Dado um pagamento com recibo emitido na primeira versão
    Quando reemito o recibo informando o motivo "Correção do nome do pagador"
    Então uma nova versão do recibo é criada com selo "2ª via"
    E o pagamento e o seu valor não são alterados
    E ambas as versões aparecem no histórico documental do aluno

  Esquema do Cenário: Pagamentos sem semântica de recibo automático não disparam emissão
    Dado um aluno com plano activo
    Quando registo um pagamento do tipo "<tipo>"
    Então nenhum recibo automático é emitido para esse pagamento
    E a UI oferece "Emitir recibo manual" como acção secundária quando aplicável

    Exemplos:
      | tipo                  |
      | Bolsista (isento)     |
      | Outro                 |

  Cenário: Estorno de pagamento arquiva o recibo correspondente
    Dado um pagamento com recibo emitido
    Quando o pagamento é estornado pelo professor
    Então o recibo passa a estado arquivado e deixa de figurar como activo
    E o documento permanece consultável no histórico documental do aluno

  Cenário: Indicador visual de status do recibo na lista financeira
    Dado um aluno com pagamento marcado como pago e recibo emitido
    Quando visualizo a lista de mensalidades ou o detalhe financeiro do aluno
    Então um indicador discreto sinaliza o estado do recibo (emitido ou pendente de geração)
    E o atalho de baixar/compartilhar fica acessível directamente da lista

  # ──────────────────────────────────────────────────────────────────────────
  # NAVEGAÇÃO E RASTREABILIDADE
  # ──────────────────────────────────────────────────────────────────────────

  Cenário: Navegação principal exibe os novos módulos
    Dado que estou autenticado na área operacional
    Quando observo a navegação principal
    Então existem itens claros para "Pedagógico" e "Documentos"
    E o estado activo destaca o módulo aberto sem perder coerência com os itens existentes

  Cenário: Aba Documentos do perfil mostra histórico do aluno
    Dado um aluno com pelo menos um recibo emitido e um comprovante de matrícula gerado
    Quando abro a aba "Documentos" no perfil desse aluno
    Então vejo o histórico ordenado do mais recente para o mais antigo
    E para cada documento posso baixar, abrir, compartilhar por WhatsApp ou reemitir
