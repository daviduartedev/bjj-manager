# Casca — gestão de academias de BJJ

Vocabulário canónico do produto. Sem detalhes de implementação.

## Aluno e graduação

**Isento**:
Aluno marcado de forma permanente como fora da cobrança de mensalidades. Não entra na lista trabalhável de mensalidades nem conta como atrasado.
_Avoid_: Bolsista, bolsa, isenção do mês

**Bolsista**:
Estado da mensalidade de um mês concreto: aquele mês não é cobrado. Não tira o aluno da cobrança dos meses seguintes.
_Avoid_: Isento, isento de mensalidade

**Ano de entrada**:
No cadastro de faixa branca, o professor informa só o ano civil em que o aluno entrou na academia. Até existir uma graduação no histórico, esse ano é o relógio de tempo na faixa e no grau.
_Avoid_: Data da graduação, data de nascimento

**Data de entrada**:
Dia civil em que o aluno entrou na academia, usado quando a faixa não é branca. Na faixa branca corresponde ao 1 de janeiro do ano de entrada.
_Avoid_: Data da graduação

**Data da graduação**:
Dia civil em que uma promoção de faixa ou grau aconteceu. Passado e hoje são válidos; futuro não é.
_Avoid_: Data de entrada, data de nascimento

**Critério de prontidão**:
Regra da academia, gravada em Configurações, que define quando um aluno activo entra no alerta de graduação. Não impede o professor de promover.
_Avoid_: Configuração de aceite, regra IBJJF, questionário de graduação

**Alerta de graduação**:
Sinal no painel de que um aluno activo atingiu o critério de prontidão. Não é, por si, uma promoção.
_Avoid_: Graduação, promoção

## Cobrança

**Previsão de receita mensal**:
Soma das mensalidades esperadas no mês civil actual (São Paulo) dos alunos activos com vínculo, excluindo isento permanente e bolsista daquele mês.
_Avoid_: Faturamento, recebido, meta

**Recebido**:
Soma do que já foi marcado como pago no mês civil actual.
_Avoid_: Previsão de receita mensal, previsto

**A receber**:
O que falta da previsão de receita mensal depois de descontar o recebido. Não é um estado de mensalidade.
_Avoid_: Pendente, atrasado, previsto
