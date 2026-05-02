# language: pt
@casca @cycle-23-0430-ajustes-finos
Funcionalidade: Ajustes finos da landing e planos Kids / Adulto
  Como visitante ou professor
  Quero ver a landing alinhada à marca e usar três planos com valores correctos
  Para confiar na comunicação visual e na cobrança consistente

  Cenário: Cards da área de funcionalidades não destoam como superfície branca solta
    Dado que estou na landing pública do Casca
    Quando visualizo a secção "O que você faz dentro do Casca"
    Então os cartões dessa grelha devem harmonizar com o tema escuro da página
    E o texto dos cartões deve permanecer legível em desktop e em telemóvel

  Cenário: Destaque final da landing usa a marca Casca
    Dado que estou na landing pública do Casca
    Quando visualizo a secção "Feito para quem ensina e para quem administra a escola"
    Então devo ver a marca Casca no lugar do ícone decorativo anterior
    E a marca deve estar proporcionada e legível sobre o fundo apresentado

  Esquema do Cenário: Três planos por conta com valores por defeito acordados
    Dado uma conta com os planos por defeito provisionados
    Então deve existir um plano "<nome_a>" com valor base <valor_a> reais
    E deve existir um plano "<nome_b>" com valor base <valor_b> reais
    E deve existir um plano "<nome_c>" com valor base <valor_c> reais

    Exemplos:
      | nome_a | valor_a | nome_b | valor_b | nome_c | valor_c |
      | Adulto |     120 | Kids 1 |     100 | Kids 2 |     100 |

  Cenário: Professor redistribui alunos entre Kids 1 e Kids 2
    Dado um aluno do tipo kids associado a Kids 1
    Quando o professor altera o plano do aluno para Kids 2
    Então o vínculo actual do aluno deve reflectir Kids 2
    E as mensalidades futuras devem usar o preço efectivo correcto para essa vigência

  Cenário: Professor associa aluno kids ao plano Adulto
    Dado um aluno do tipo kids em Kids 1
    Quando o professor altera o plano do aluno para Adulto
    Então o vínculo actual do aluno deve reflectir Adulto
    E o valor esperado da mensalidade deve seguir o preço efectivo desse plano

  Cenário: Alunos migrados do antigo Juvenil passam a pagar o valor base de Kids 1
    Dado alunos com vínculo aberto migrados de kids_2 para kids_1 pela migração
    Então o preço personalizado desse vínculo novo deve estar vazio onde a migração limpa customização
    E o valor efectivo deve corresponder ao Kids 1 à data vigente

  Cenário: Alunos que estavam no antigo plano Juvenil aparecem em Kids 1 após a migração
    Dado alunos kids com vínculo aberto ao plano que era o antigo Juvenil
    Quando a migração idempotente do ciclo é aplicada
    Então esses alunos devem ficar com vínculo aberto a Kids 1
    E o professor deve poder mover cada um manualmente para Kids 2 quando desejar

  Cenário: Histórico de vínculos antigos permanece consultável
    Dado que existem vínculos aluno-plano já encerrados no passado
    Quando a migração do ciclo é aplicada
    Então esses registos históricos não devem ser apagados nem alterados de forma silenciosa
