# language: pt
Funcionalidade: Modalidades da academia
  Cenário: Preservar academia existente
    Dada uma academia Jiu-Jitsu com alunos, graduações e documentos
    Quando o lote de modalidades for aplicado em ambiente descartável
    Então a academia continua Jiu-Jitsu com os mesmos registros esportivos e financeiros
  Cenário: Cadastrar aluno de Boxe
    Dada uma academia de Boxe
    Quando o professor cadastra aluno de 18 anos com plano Adulto
    Então o aluno existe sem faixa ou grau e pode participar da operação
  Cenário: Data preexistente desconhecida
    Dada uma academia de Judô ou Muay Thai
    Quando o professor registra uma graduação atual sem data conhecida
    Então o perfil informa Data não informada e não calcula tempo pela entrada
  Cenário: Justificar salto
    Dado um aluno de modalidade graduada
    Quando o professor registra salto de níveis sem justificativa
    Então a promoção é recusada sem alteração parcial
  Cenário: Conta com histórico
    Dada uma academia com aluno removido
    Quando o professor tenta trocar a modalidade
    Então a troca é recusada e o histórico preservado
  Cenário: Documentos corretos
    Dada uma academia de modalidade suportada
    Quando o professor emite novo documento de matrícula
    Então o texto identifica a academia e a modalidade corretas
    E documentos anteriormente emitidos permanecem íntegros
