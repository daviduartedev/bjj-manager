# language: pt
# Cenários de negócio , Billing UI (nível utilizador)
# Rotas canónicas: /mensalidades, /mensalidades/[studentId]

Funcionalidade: Fecho mensal na lista de mensalidades
  Como professor
  Quero ver todos os alunos do mês seleccionado com estado de cobrança e valores
  Para fechar o mês e saber quem falta pagar

  Cenário: Lista abre no mês civil actual
    Dado que estou autenticado na área operacional
    Quando abro a página de mensalidades
    Então vejo a lista referente ao mês civil actual em São Paulo por defeito
    E posso alterar para outro mês de referência
    E vejo cada aluno com nome, plano, valor esperado, vencimento e estado compreensível

Funcionalidade: Filtrar e encontrar alunos na lista
  Como professor
  Quero filtrar por estado e procurar por nome
  Para trabalhar mais rápido em listas grandes

  Esquema do cenário: Filtrar por estado de cobrança
    Dado que estou na lista de mensalidades de um mês com vários estados
    Quando escolho o filtro de estado "<filtro>"
    Então a lista mostra apenas os alunos que correspondem a esse filtro

    Exemplos:
      | filtro    |
      | Todos     |
      | Pago      |
      | Pendente  |
      | Atrasado  |
      | Bolsista  |
      | Outro     |

  Cenário: Busca por nome reduz a lista
    Dado que estou na lista de mensalidades
    Quando digito um termo na busca por nome
    Então só permanecem alunos cujo nome corresponde ao termo

Funcionalidade: Registar um pagamento
  Como professor
  Quero registar que um aluno pagou a mensalidade de um mês
  Para o sistema reflectir o pagamento sem erro manual repetido

  Cenário: Registar pagamento de um aluno na lista
    Dado que estou na lista de mensalidades
    E selecciono um aluno elegível com plano activo
    Quando escolho registar pagamento e confirmo com os valores pré-preenchidos correctos
    Então vejo confirmação de sucesso
    E o estado desse aluno para aquele mês passa a reflectir que está pago

Funcionalidade: Marcar vários alunos como pagos de uma vez
  Como professor
  Quero seleccionar muitos alunos e confirmar o pagamento em lote
  Para poupar tempo no dia de fecho

  Cenário: Lote com excepções
    Dado que estou na lista de mensalidades filtrada
    Quando selecciono todos os visíveis e desmarco alguns alunos que não devem ser incluídos
    E confirmo marcar os seleccionados como pagos
    Então apenas os alunos ainda seleccionados ficam registados como pagos para aquele mês
    E sou alertado se algum seleccionado não puder ser registado

Funcionalidade: Consultar histórico financeiro de um aluno
  Como professor
  Quero abrir o detalhe financeiro de um aluno
  Para rever pagamentos anteriores e corrigir erros

  Cenário: Ver histórico e estornar quando necessário
    Dado que estou no detalhe financeiro do aluno na área de mensalidades
    Quando consulto o histórico de pagamentos
    Então os registos aparecem do mais recente para o mais antigo

  Cenário: Estornar um pagamento
    Dado que estou no detalhe financeiro do aluno na área de mensalidades
    Quando escolho estornar um pagamento e confirmo
    Então esse registo deixa de contar como pago para aquele mês conforme as regras do produto

Funcionalidade: Coerência com o perfil do aluno
  Como professor
  Quero registar pagamento também a partir do perfil do aluno
  Para não ter de saltar entre páginas quando já estou na ficha

  Cenário: Registar pagamento a partir do perfil
    Dado que estou no perfil de um aluno com plano activo
    Quando uso a acção para registar pagamento e confirmo
    Então o resultado é o mesmo que registar a partir da lista de mensalidades para aquele aluno e mês

Funcionalidade: Área autenticada mais premium
  Como professor
  Quero uma interface mais cuidada na área logada
  Para sentir confiança e legibilidade ao usar o sistema todos os dias

  Cenário: Navegação lateral escura e conteúdo com identidade da marca
    Dado que estou autenticado no dashboard
    Quando olho para o menu lateral
    Então o menu tem aparência escura coerente com a identidade
    E o conteúdo principal usa cores e hierarquia que reforçam a marca sem prejudicar leitura
