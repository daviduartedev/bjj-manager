# language: pt
# Utilitários de data e duração (refino 09-0430-date-duration-utilities).
# Regras numeradas: **DATE-** em spec/features/date-duration-utilities/readme.md.

Funcionalidade: Idade e tempos exibidos de forma consistente
  Para confiar nos números ao acompanhar alunos
  Como professor autenticado
  Quero ver idade e tempos derivados de datas alinhados ao calendário brasileiro
  E mensagens claras quando falta data

  Cenário: Idade reflete anos completos desde a data de nascimento
    Dado que um aluno tem data de nascimento registada
    Quando vejo a idade desse aluno na aplicação
    Então a idade corresponde aos anos completos até a data de referência do sistema
    E não muda por causa de conversões incorretas de fuso para datas só com dia

  Cenário: Sem data de nascimento não inventa idade
    Dado que um aluno não tem data de nascimento registada
    Quando vejo os dados desse aluno na lista ou ficha
    Então o espaço reservado à idade deixa claro que o dado não existe
    E não aparece um número arbitrário

  Esquema do cenário: Textos de tempo em português natural
    Dado que existe um intervalo entre duas datas civis relevantes para o negócio
    Quando a aplicação descreve esse intervalo para mim
    Então a frase está em português do Brasil
    E descreve unidades até o nível de dia quando faz sentido
    E não menciona horas para esse tipo de resumo

    Exemplos:
      | situação                               |
      | tempo desde a entrada na academia      |
      | tempo na faixa atual                   |
      | tempo no grau atual                    |

  Cenário: Datas formatadas para leitura humana
    Dado que estou a ver uma data de negócio em formato amigável
    Quando essa data é apresentada por extenso curto
    Então reconheço dia, mês e ano em convenção brasileira

  Cenário: Referência temporal relativa ao passado recente
    Dado que estou a ver uma data no passado próximo
    Quando a interface usa uma forma relativa em português
    Então percebo há quanto tempo ocorreu sem precisar calcular mentalmente
