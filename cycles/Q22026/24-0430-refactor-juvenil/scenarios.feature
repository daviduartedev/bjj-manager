# language: pt
@casca @cycle-24-0430-refactor-juvenil
Funcionalidade: Juvenis faixa laranja no Adulto e área de Produtos
  Como professor
  Quero alocar juvenis da família laranja no plano Adulto e gerir produtos internamente
  Para refletir treino, cobrança e estoque da academia

  Cenário: Kids da família laranja pode usar plano Adulto
    Dado um aluno kids com faixa da família laranja
    Quando o professor altera o plano para Adulto
    Então o vínculo atual deve refletir Adulto
    E as mensalidades futuras devem usar o valor efetivo do Adulto

  Cenário: Kids fora da família laranja não pode usar plano Adulto
    Dado um aluno kids com faixa fora da família laranja
    Quando tenta guardar o plano Adulto
    Então o sistema deve bloquear a alteração

  Cenário: Professor edita estoque manualmente em Produtos
    Dado um produto com um tamanho cadastrado
    Quando o professor altera a quantidade em estoque
    Então a quantidade deve ser persistida
    E nenhum fluxo de venda ou checkout deve ser criado
