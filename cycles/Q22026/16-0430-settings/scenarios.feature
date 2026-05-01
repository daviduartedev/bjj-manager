# language: pt

Funcionalidade: Configurações da academia e planos
  Como professor autenticado
  Quero gerir o nome da academia e os planos de mensalidade da minha conta
    Para que cobranças e identidade na app reflitam a minha operação

  Cenário: Alterar o nome da academia
    Dado que estou autenticado com uma conta válida
    Quando acedo às configurações da academia
    E altero o nome da academia para um novo valor válido
    E salvo
    Então vejo confirmação de sucesso
    E o novo nome aparece onde a academia é identificada no ambiente autenticado

  Esquema do cenário: Rever e ajustar um plano comercial
    Dado que estou autenticado com uma conta válida
    E existem os planos por defeito da conta
    Quando acedo à gestão de planos nas configurações
    E altero o <campo> do plano "<plano>" para <valor>
    E salvo
    Então vejo confirmação de sucesso ou mensagem clara se a alteração não for permitida
    E o resumo do plano reflete a alteração quando aplicável

    Exemplos:
      | campo   | plano   | valor        |
      | preço   | Juvenil | valor válido |
      | nome    | Adulto  | novo rótulo  |
      | estado  | Kid 1   | inativo      |

  Cenário: Desactivar um plano não remove alunos já associados
    Dado que estou autenticado com uma conta válida
    Quando desativo um tipo de plano nas configurações
    Então os alunos que já estavam associados a esse plano não são apagados
    E ao tentar associar um novo aluno a esse plano devo ser impedido com mensagem compreensível

Funcionalidade: Perfil do professor
  Como professor autenticado
  Quero atualizar o meu nome de exibição e contato
  Para que alunos e telas mostrem dados corretos

  Cenário: Actualizar dados pessoais no perfil
    Dado que estou autenticado com uma conta válida
    Quando acedo ao meu perfil
    E atualizo o nome de exibição e opcionalmente o telefone
    E salvo
    Então vejo confirmação de sucesso
    E as áreas que mostram o meu nome reflectem o novo nome de exibição

  Cenário: Ver identidade sem upload de fotografia
    Dado que estou autenticado com uma conta válida
    Quando acedo ao meu perfil ou às configurações
    Então vejo uma representação baseada em iniciais em vez de upload de foto
    E não sou obrigado a enviar imagem para concluir o perfil

Funcionalidade: Painel operacional — linguagem e distribuição por faixa
  Como professor autenticado
  Quero ver o painel em português do Brasil coerente e barras de faixa com cores intuitivas
  Para ler rápido e associar visualmente cada faixa

  Cenário: Rótulos em português do Brasil no painel
    Dado que estou autenticado com uma conta válida
    Quando abro o painel operacional
    Então os atalhos usam a grafia brasileira para «ações» e «ativos» onde aplicável

  Cenário: Barras da distribuição por faixa com cores alinhadas à faixa
    Dado que estou autenticado com uma conta válida
    E existem alunos ativos por faixa
    Quando visualizo a distribuição por faixa no painel
    Então cada barra de progresso usa uma cor que corresponde à faixa representada
