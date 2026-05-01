# language: pt
# Ciclo: Q22026/04-0430-supabase-schema
# Cenários de negócio (comportamento observável pelo professor). Detalhes de DDL ficam em spec/features/supabase-schema/readme.md.

Funcionalidade: Schema de dados e cobrança no Supabase
  Como professor da academia
  Quero que cadastros, faixas, planos e mensalidades tenham um modelo de dados estável
  Para operar alunos e financeiro sem ambiguidade entre contas

  Cenário: Plano por faixa etária / turma
    Dado uma conta de academia
    Quando o professor configura a estrutura comercial mínima
    Então existem categorias de plano equivalentes a Kids 1, Kids 2 e Adulto
    E o professor pode associar cada aluno manualmente a uma dessas categorias

  Cenário: Catálogo de faixas alinhado à graduação
    Dado o catálogo global de faixas
    Quando o professor cadastra ou mantém alunos adulto ou kids
    Então as faixas disponíveis seguem a ordem oficial de graduação acordada para adulto e para kids
    E o sistema distingue adulto de kids no tipo de faixa

  Cenário: Histórico de graduação com pulo justificado
    Dado um aluno com histórico de graduações
    Quando o professor registra uma promoção que constitui pulo de ordem de faixa
    Então o registro salva que houve pulo e uma justificativa obrigatória em texto
    Quando o professor registra uma promoção sem pulo de ordem de faixa
    Então o registro não exige motivo de pulo

  Cenário: Mensalidade por mês de referência
    Dado um aluno com vínculo de plano e dia de vencimento definidos
    Quando o professor consulta ou atualiza o financeiro de um mês de referência
    Então existe no máximo um registro financeiro daquele aluno para aquele mês
    E o professor pode marcar manualmente situações equivalentes a Pago ou Bolsista
    E situações ainda não classificadas aparecem como Pendente mesmo sem registro prévio explícito

  Cenário: Um vínculo de plano ativo por aluno
    Dado um aluno
    Quando o professor mantém o vínculo do aluno com um plano
    Então não pode haver mais de um vínculo “aberto” ao mesmo tempo para o mesmo aluno
    E trocar de plano encerra o vínculo anterior e inicia outro com datas de vigência

  Cenário: Encerramento automático de pendência após vencimento
    Dado um mês de referência em que a mensalidade ainda está pendente após o dia de vencimento do aluno
    Quando a rotina automática de fechamento executa
    Então o status persistido passa a equivaler a Não pago
    Mas se o professor já marcou como Pago ou Bolsista esse aluno e mês a rotina não reverte essas marcações
