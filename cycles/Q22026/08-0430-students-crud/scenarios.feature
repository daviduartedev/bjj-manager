# language: pt
# Gestão de alunos na área operacional (refino 08-0430-students-crud).
# Regras numeradas: **STU-** em spec/features/students-crud/readme.md.

Funcionalidade: Lista de alunos
  Para encontrar e atualizar alunos no dia a dia
  Como professor autenticado
  Quero filtrar, ordenar e paginar a lista
  E agir sobre um aluno sem abrir sempre a ficha completa

  Cenário: Lista vazia convida ao primeiro cadastro
    Dado que ainda não tenho alunos registados na minha academia
    Quando abro a lista de alunos
    Então vejo um estado vazio amigável
    E posso iniciar o cadastro do primeiro aluno a partir daí

  Esquema do cenário: Filtrar alunos por texto e critérios
    Dado que tenho vários alunos na minha academia
    Quando aplico filtro por "<texto ou critério>"
    Então a lista mostra apenas alunos que correspondem ao critério

    Exemplos:
      | texto ou critério        |
      | nome parcial             |
      | tipo adulto              |
      | tipo kids                |
      | status ativo             |
      | status inativo           |
      | status pausado           |

  Cenário: Mudar a ordem dos alunos na lista
    Dado que tenho vários alunos na minha academia
    Quando escolho ordenar por nome
    Então os nomes aparecem em ordem alfabética
    Quando escolho ordenar por data de entrada na academia
    Então a lista reflete essa prioridade de forma consistente
    Quando escolho ordenar por última alteração
    Então os mais recentemente atualizados aparecem de forma coerente com essa opção

  Cenário: Navegar páginas quando há muitos alunos
    Dado que o número de alunos excede o que cabe numa página
    Quando estou na lista de alunos
    Então consigo avançar e voltar entre páginas
    E o conjunto mostrado em cada página é estável para os filtros atuais

  Cenário: Abrir o perfil pelo fluxo principal da lista
    Dado que estou na lista de alunos
    Quando escolho um aluno pelo clique principal na linha ou cartão
    Então sou levado ao perfil desse aluno

  Cenário: Ajustar dados frequentes sem abrir a ficha completa
    Dado que estou na lista de alunos
    Quando escolho edição rápida num aluno
    Então posso alterar estado operacional como situação, plano, vencimento, faixa e grau atuais
    E sou informado de que a alteração foi salva com sucesso

  Cenário: Erro ao salvar não expõe detalhes internos
    Dado que estou a salvar dados de um aluno
    Quando o sistema não consegue completar o pedido por falha de rede ou permissão
    Então vejo uma mensagem genérica adequada ao tipo de problema
    E posso tentar de novo sem ver informação técnica interna

Funcionalidade: Cadastro e ficha do aluno
  Para manter dados corretos e completos
  Como professor autenticado
  Quero cadastrar um novo aluno e editar a ficha completa
  E ter ajuda de formato nos campos opcionais sensíveis

  Cenário: Cadastrar aluno com dados mínimos obrigatórios
    Dado que estou no formulário de novo aluno
    Quando preencho todos os campos obrigatórios com valores válidos
    E escolho um plano compatível com o tipo do aluno
    E confirmo o registo
    Então o aluno passa a aparecer na lista
    E sou informado de que o registo foi criado com sucesso

  Esquema do cenário: Validação impede combinações incoerentes
    Dado que estou no formulário de aluno
    Quando escolho tipo "<tipo>" e tento associar um plano que não corresponde a esse tipo
    Então não consigo concluir o registo com essa combinação

    Exemplos:
      | tipo   |
      | adulto |
      | kids   |

  Cenário: Campos opcionais respeitam formato quando preenchidos
    Dado que estou a editar a ficha completa de um aluno
    Quando preencho documento, telefone ou e-mail com formato inválido
    Então vejo indicação clara junto ao campo
    Quando corrijo para um formato válido
    Então consigo salvar com sucesso

  Cenário: Retirar aluno da operação ativa sem apagar o histórico futuro
    Dado que um aluno está registado
    Quando escolho desativá-lo
    Então deixa de ser tratado como ativo na operação corrente
    E continuo a poder encontrá-lo quando filtro por inativos
