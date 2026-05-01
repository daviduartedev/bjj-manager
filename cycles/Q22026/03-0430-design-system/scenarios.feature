# language: pt

Funcionalidade: Design system e guia visual (ambiente de desenvolvimento)
  Como membro da equipe de desenvolvimento
  Quero consultar tokens, componentes e padrões de UI em um só lugar
  Para implementar telas consistentes nas próximas entregas do MVP

  Cenário: Visualizar a galeria de design system em desenvolvimento
    Dado que a aplicação está rodando em ambiente de desenvolvimento
    Quando acesso a rota de design system
    Então vejo uma visão organizada com tipografia, cores e componentes de referência
    E consigo distinguir exemplos em tema claro e em tema escuro

  Esquema do Cenário: Reconhecer estados de cobrança nos exemplos visuais
    Dado que estou na página de design system em desenvolvimento
    Quando localizo a seção de badges ou etiquetas de status
    Então identifico claramente os significados visuais para "<rotulo_financeiro>"

    Exemplos:
      | rotulo_financeiro |
      | pago              |
      | pendente          |
      | em atraso         |
      | informativo       |

  Cenário: Galeria indisponível em produção
    Dado que a aplicação está em ambiente de produção
    Quando tento acessar a rota de design system
    Então não obtenho a página de galeria de componentes

  Cenário: Orientação para implementação consistente
    Dado que preciso implementar uma nova tela do MVP
    Quando consulto o guia de estilo do projeto
    Então encontro regras sobre paleta, hierarquia visual e acessibilidade alinhadas aos tokens do produto
