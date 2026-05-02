# language: pt
# Cenários de aceitação (nível negócio) — ciclo cibersegurança E2E/API
# Detalhe técnico (Playwright, env, listas de padrões) fica em spec/features/security-e2e/readme.md

Funcionalidade: Acesso à área operacional apenas com sessão válida
  Como visitante sem conta ou com sessão inválida
  Quero ser impedido de ver dados da academia
  Para que informações operacionais não sejam expostas

  Esquema do cenário: Rotas operacionais exigem autenticação
    Dado que não tenho sessão válida na aplicação
    Quando acedo diretamente ao caminho "<caminho>"
    Então sou encaminhado para o login
    E não vejo conteúdo operacional da academia nem dados sensíveis na página

    Exemplos:
      | caminho           |
      | /painel           |
      | /alunos           |
      | /mensalidades     |
      | /configuracoes    |
      | /perfil           |

  Cenário: Utilizador autenticado não permanece na página de entrada
    Dado que tenho sessão válida na aplicação
    Quando abro a página de login
    Então sou levado à área operacional principal

  Cenário: Legado do painel redireciona para o destino canónico
    Dado que tenho sessão válida na aplicação
    Quando acedo ao caminho legado do painel antigo
    Então passo a estar no painel canónico da aplicação

  Cenário: Registo público não expõe fluxo de autocadastro no MVP
    Dado que não tenho sessão válida na aplicação
    Quando tento aceder ao registo público
    Então sou tratado de forma coerente com a política do produto (redirecionamento ou resposta adequada)
    E não obtenho uma página de cadastro utilizável fora do MVP


Funcionalidade: Isolamento de dados entre academias (IDOR)
  Como professor da minha academia
  Quero que apenas os meus alunos e registos apareçam nas minhas telas e acções
  Para que outra academia não aceda aos meus dados nem eu aos dela

  Cenário: Não consigo abrir ficha de aluno de outra academia pela URL
    Dado que existem dois professores em academias distintas na base de testes
    E o professor "A" está autenticado
    Quando tenta abrir na aplicação o perfil de um aluno que pertence apenas ao professor "B"
    Então não vê os dados desse aluno como se fossem seus
    E o resultado é seguro (acesso negado, vazio ou erro adequado, sem vazamento)

  Cenário: Não consigo alterar dados financeiros de aluno de outra academia
    Dado que existem dois professores em academias distintas na base de testes
    E o professor "A" está autenticado
    Quando tenta registar ou alterar cobrança relativamente a um aluno do professor "B"
    Então a operação não é aplicada aos dados do professor "B"
    E não recebo dados sensíveis da outra academia na resposta


Funcionalidade: Integridade das acções sensíveis e das entradas
  Como utilizador mal-intencionado ou cliente defeituoso
  Quero submeter payloads inválidos ou campos extra não previstos
  Para tentar contornar validações ou escalar privilégios

  Esquema do cenário: Entradas inválidas não derrubam o sistema nem vazam detalhes internos
    Dado um utilizador no papel adequado ao teste
    Quando submete dados "<tipo>" inválidos ou maliciosos num fluxo suportado pela aplicação
    Então a aplicação responde de forma controlada
    E não revela segredos, tokens ou erros técnicos brutos ao utilizador

    Exemplos:
      | tipo              |
      | formulário vazio  |
      | tipo errado       |
      | campo proibido    |
      | script em texto   |


Funcionalidade: Defesa em profundidade no canal HTTP
  Como responsável pela segurança do produto
  Quero que respostas e cabeçalhos reduzam superfície de ataque
  Para proteger utilizadores e dados mesmo quando há bugs pontuais

  Cenário: APIs HTTP destinadas a máquinas não substituem falhas de auth por páginas HTML genéricas
    Dado um endpoint HTTP de API privado exposto pela aplicação
    Quando um cliente sem sessão o invoca
    Então o resultado indica claramente falta de autenticação com código HTTP adequado
    E não é uma página HTML de aplicação substituindo esse significado, salvo excepção documentada no produto

  Cenário: Respostas não devem expor material que permita roubo de sessão ou segredos
    Quando ocorre um erro ou fluxo de falha num cenário de teste de segurança
    Então o corpo da resposta e a página não contêm padrões críticos de vazamento definidos pelo produto


Funcionalidade: Confiança operacional e auditoria
  Como equipa do produto
  Quero evidência automatizada e uma revisão humana complementar
  Para saber o que está coberto e o que permanece em risco residual

  Cenário: Pipeline de integração contínua valida regras críticas antes do merge
    Dado que o código foi proposto num pedido de integração
    Quando o pipeline de segurança automatizado executa
    Então os testes bloqueantes de autenticação, IDOR e vazamento passam
    E a validação de políticas no base de dados definida pelo produto é executada quando disponível

  Cenário: Relatório e checklist cobrem lacunas da automação
    Dado que a suíte automatizada foi executada
    Quando a equipa conclui o ciclo
    Então existe relatório curto com riscos, lacunas e recomendações
    E existe checklist manual dos controlos não automatizados
