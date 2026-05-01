# language: pt
# Comportamento observável do shell autenticado (refino 07-0430-app-shell).
# Rotas canónicas da área operacional em pt-BR (ver SHELL-2 em spec/features/app-shell/readme.md).

Funcionalidade: Shell da área operacional
  Para trabalhar no dia a dia da academia
  Como professor autenticado
  Quero uma navegação consistente entre as áreas principais
  E reconhecer onde estou dentro da aplicação

  Cenário: Após entrar, sou levado ao painel principal
    Dado que acabei de autenticar-me com sucesso
    Então sou levado ao painel principal da operação
    E vejo o cabeçalho da área autenticada com a marca da aplicação

  Cenário: Cabeçalho mostra a academia quando o contexto está válido
    Dado que estou autenticado e o meu utilizador está corretamente associado a uma academia
    Quando abro qualquer página dentro da área operacional
    Então vejo o nome da academia no cabeçalho junto da marca
    E posso abrir o menu do utilizador

  Esquema do cenário: Navegação principal entre áreas da academia
    Dado que estou autenticado como professor
    Quando escolho ir para "<área>" no menu principal de navegação
    Então passo a ver o conteúdo dessa área
    E a navegação indica claramente que "<área>" está ativa

    Exemplos:
      | área           |
      | Painel         |
      | Alunos         |
      | Mensalidades   |
      | Configurações  |

  Cenário: Em ecrã pequeno uso navegação inferior e menu lateral
    Dado que estou autenticado como professor
    E estou a usar um ecrã estreito
    Quando quero mudar de área
    Então posso usar uma barra de navegação inferior com os destinos principais
    E posso abrir um menu lateral a partir do cabeçalho

  Cenário: Perfil acessível a partir do menu do utilizador
    Dado que estou autenticado como professor
    Quando abro o menu do utilizador no cabeçalho
    E escolho a opção de perfil
    Então sou levado à página do meu perfil

  Cenário: Visitante não acede às páginas da operação pelo URL
    Dado que não tenho sessão ativa na aplicação
    Quando tento abrir diretamente uma página da área operacional
    Então sou encaminhado para a página de entrada

  Cenário: Conta ainda não configurada mantém sessão mas orienta o utilizador
    Dado que estou autenticado mas o meu utilizador não está em estado válido para dados da academia
    Quando abro o painel principal
    Então vejo uma mensagem genérica que explica o problema em termos seguros
    E posso terminar sessão a partir do cabeçalho
