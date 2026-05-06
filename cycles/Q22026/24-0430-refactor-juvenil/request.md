Preciso especificar e planejar a implementação de dois ajustes no sistema atual, seguindo nosso fluxo Spec Driven.

Contexto geral:
O sistema já possui lógica de alunos, turmas/categorias, mensalidades e organização da academia. A implementação deve preservar o estilo visual, padrões de código e arquitetura já existentes. Não quero uma solução genérica ou uma tela desconectada do restante do sistema.

## Ajuste 1 — Permitir juvenis faixa laranja no Adulto

Hoje alguns alunos juvenis estão no Kids 1, mas na prática treinam no Adulto porque são faixa laranja. Esses alunos também pagam como Adulto.

O sistema precisa permitir que alunos juvenis possam ser alocados no Adulto quando forem faixa laranja.

Regras esperadas:

- Juvenis faixa laranja podem ir para o Adulto.
- Esses alunos devem treinar no Adulto.
- Esses alunos devem pagar como Adulto.
- O sistema não deve forçar esses juvenis faixa laranja a permanecerem no Kids 1.
- A alteração deve respeitar a estrutura atual de turmas/categorias.
- Não deve criar uma categoria “Juvenil”.
- As categorias continuam sendo:
  - Kids 1
  - Kids 2
  - Adulto
- O professor deve conseguir ajustar manualmente o aluno para a categoria correta.
- Mudanças feitas pelo professor devem refletir imediatamente no valor, turma e informações relacionadas, seguindo o comportamento atual do sistema.
- O histórico anterior não deve ser alterado retroativamente.
- A partir do mês atual em diante, alterações de turma/categoria/valor devem refletir nos registros futuros conforme a regra existente do sistema.

Critérios de aceitação:

- Dado um aluno juvenil faixa laranja, quando o professor mover esse aluno para Adulto, então o sistema deve permitir a alteração.
- Dado um aluno juvenil faixa laranja no Adulto, quando o sistema calcular mensalidade/valor, então deve aplicar o valor de Adulto.
- Dado um aluno juvenil que não seja faixa laranja, quando tentar aplicar a regra de Adulto automaticamente, então o sistema não deve fazer isso sem ação do professor.
- Dado um histórico financeiro anterior, quando a categoria atual do aluno for alterada, então registros antigos não devem ser modificados retroativamente.
- Dado que o professor alterou turma, categoria ou valor do aluno, quando visualizar os dados atuais e futuros, então as alterações devem estar refletidas corretamente.

## Ajuste 2 — Criar área de Produtos

Preciso adicionar ao sistema uma parte voltada para Produtos, seguindo exatamente o mesmo estilo visual, padrões de interface e experiência do sistema já existente.

Essa área será usada pelo professor para controlar produtos da academia.

Produtos iniciais:

- Camisetas da academia
  - Tamanhos: P, M, G e GG
- Rash guards femininas
  - Tamanhos editáveis pelo professor
- Rash guards masculinas
  - Tamanhos editáveis pelo professor
- Quimonos KMNO
  - Tamanhos editáveis pelo professor
- Quimonos Zenshins
  - Tamanhos editáveis pelo professor

Observação: “rash guard” pode aparecer no sistema como “Rash Guard”. Evitar o termo escrito incorretamente como “hash guard”.

Regras esperadas:

- Deve existir uma área/tela/seção chamada “Produtos”.
- O professor deve conseguir visualizar os produtos cadastrados.
- O professor deve conseguir editar tamanhos disponíveis.
- O professor deve conseguir editar quantidades por tamanho.
- O professor deve conseguir atualizar o estoque de cada produto.
- Os produtos devem seguir o mesmo padrão visual do restante do sistema.
- A estrutura deve ser pensada para permitir novos produtos no futuro.
- Não é necessário implementar venda, checkout, pagamento ou baixa automática por venda nesta etapa, salvo se já existir algo assim no sistema.
- O foco deste ajuste é cadastro e controle de estoque simples.

Critérios de aceitação:

- Dado que o professor acessa o sistema, quando abrir a navegação principal, então deve conseguir acessar a área de Produtos.
- Dado que o professor acessa Produtos, quando a tela carregar, então deve visualizar os produtos cadastrados.
- Dado um produto com variações de tamanho, quando o professor editar a quantidade de um tamanho, então o estoque deve ser atualizado corretamente.
- Dado um produto, quando o professor adicionar, remover ou editar tamanhos, então essas alterações devem ser persistidas.
- Dado que o sistema possui um estilo visual já definido, quando a tela de Produtos for implementada, então ela deve seguir os mesmos componentes, espaçamentos, cores, botões, inputs, cards e padrões de UX existentes.
- Dado que não existe venda nesta etapa, quando o professor editar estoque, então a alteração deve ser manual.

## O que preciso que você faça

Primeiro, gere uma SPEC completa para esses dois ajustes.

A spec deve conter:

- Contexto
- Objetivo
- Escopo
- Fora de escopo
- Requisitos funcionais
- Requisitos não funcionais
- Regras de negócio
- Impactos em UX/UI
- Impactos em dados e persistência
- Critérios de aceitação em formato Dado / Quando / Então
- Casos de borda
- Riscos técnicos
- Estratégia de validação

Separe claramente:

- Fatos confirmados
- Suposições necessárias
- Dúvidas pendentes

Depois da spec, gere um PLANO DE IMPLEMENTAÇÃO incremental.

O plano deve ser dividido em ciclos pequenos e seguros.

Para cada ciclo, inclua:

- Objetivo do ciclo
- Arquivos prováveis
- Passos de implementação
- Cuidados
- Validação
- Critérios de conclusão

Regras importantes:

- Não criar categoria Juvenil.
- Não alterar histórico financeiro anterior.
- Não quebrar o comportamento atual de Kids 1, Kids 2 e Adulto.
- Não implementar checkout, venda ou pagamento de produtos nesta etapa.
- Não criar uma UI diferente do restante do sistema.
- Não fazer refactor amplo sem necessidade.
- Preservar arquitetura, padrões e convenções já existentes no projeto.