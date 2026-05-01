# language: pt
# Os cenários descrevem o comportamento observável acordado no refinamento do ciclo 06-0430-authentication.
# convenções: destino pós-login canónico = /painel (SHELL-2); sem autocadastro nem recuperação de senha na aplicação no MVP.

Funcionalidade: Acesso do professor por login
  Para utilizar a área operacional da minha academia
  Como professor com credenciais já provisionadas
  Quero entrar com e-mail e senha
  E ser levado ao painel principal após autenticação bem-sucedida

  Cenário: Login bem-sucedido abre o painel principal
    Dado que tenho credenciais válidas já criadas no sistema de autenticação
    Quando envio o formulário de entrada com e-mail e senha corretos
    Então sou levado ao painel principal da operação
    E tenho feedback claro de que a sessão foi iniciada

  Cenário: Senha incorreta mantém na entrada e informa o problema
    Quando envio o formulário de entrada com uma senha incorreta
    Então permaneço na página de entrada
    E vejo uma mensagem clara em português sobre o insucesso da autenticação

  Esquema do cenário: Formato de credenciais inválido bloqueia o envio ou mostra erro adequado
    Quando tento enviar o formulário com <email> e <senha>
    Então não concluo o acesso ao painel da operação
    E vejo indicação de validação ou mensagem compreensível em português

    Exemplos:
      | email           | senha   |
      | invalido        | segredo |
      | bom@exemplo.com |         |

  Cenário: Visitante sem sessão não acede à área operacional diretamente
    Dado que não tenho sessão ativa na aplicação
    Quando abro diretamente o endereço do painel principal
    Então sou encaminhado para a página de entrada

  Cenário: Utilizador já autenticado que abre a página de entrada vai ao painel
    Dado que já tenho uma sessão ativa na aplicação
    Quando abro a página de entrada
    Então sou encaminhado para o painel principal
