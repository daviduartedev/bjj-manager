# language: pt
Funcionalidade: Especificação de produto consolidada
  Como stakeholder do BJJ Manager
  Quero documentação canônica de produto e domínio
  Para que ciclos seguintes implementem sem ambiguidade de escopo

  Cenário: Encontrar visão e limites do MVP
    Dado que abro a especificação de produto
    Quando leio o documento de visão e escopo
    Então reconheço o que está no MVP e o que está explicitamente fora do MVP
    E sei que a persona ativa no MVP é o professor

  Esquema do cenário: Localizar regra rastreável por ID
    Dado que estou em "<doc>" da especificação
    Quando procuro o identificador "<id>"
    Então encontro uma regra numerada correspondente

    Exemplos:
      | doc               | id      |
      | spec/product/spec.md | SPEC-2.1 |
      | spec/product/graduation-rules.md | GR-4.3 |
      | spec/product/billing-rules.md | BR-4.2 |

  Cenário: Entender graduação oficial e graus por faixa
    Dado que leio as regras de graduação
    Quando comparo faixas adulto e kids
    Então vejo a ordem das faixas alinhada à referência IBJJF descrita no texto
    E vejo que faixas coloridas adulto e kids usam até quatro graus antes da próxima promoção de faixa
    E vejo que a faixa preta adulta segue graus próprios conforme documentado

  Cenário: Registrar promoção com pulo de faixa exige justificativa
    Dado que um professor registra uma graduação que pula uma faixa intermediária
    Quando tenta concluir sem informar motivo
    Então a operação não pode ser concluída até haver justificativa obrigatória

  Cenário: Cobrança sem gateway e com status manual
    Dado que leio as regras de cobrança
    Entendo que não há integração de pagamento no MVP
    E que o professor define manualmente se cada aluno está Pago, Não pago, Pendente ou Outro para um mês de referência

  Cenário: Fechamento mensal em lote
    Dado que o professor revisou as mensalidades de um mês
    Quando escolhe marcar todos como pagos para o recorte disponível
    Então todos os alunos elegíveis naquele recorte ficam com status Pago para aquele mês de referência

  Cenário: Documentação espelhada para leitura
    Dado que prefiro ler em docs/product ou em spec/product
    Quando comparo os arquivos espelhados de mesmo nome
    Então o conteúdo é o mesmo para spec.md, entities.md, graduation-rules.md e billing-rules.md
