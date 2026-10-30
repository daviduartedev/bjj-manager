# Cycle 1030 — Landing brasileira: copy, composição e movimento

**Tamanho:** Medium
**Data:** 30/10/2026
**Origem:** conversa com o usuário, encerramento de `/grill-me`, seguida de `/to-spec` e `/to-tickets`.
**Branch de trabalho:** `feat/slug`, na base `5fd8f48` da `develop` local.
**Estado:** spec #90 e tickets #91–#94 publicados após aprovação; implementação autorizada.

## Pedido

Refazer a landing pública do Casca, com liberdade para reorganizar todas as seções. A página deve conversar com donos e professores de academias de Muay Thai, Boxe, Jiu-Jitsu e Judô: organização, proximidade brasileira e apoio ao crescimento da academia.

Dar atenção especial às seções atualmente intituladas “O Casca conhece o trabalho por trás de cada aula.” e “Da matrícula ao fim do mês, sem perder o fio.”. A mudança deve refazer a composição e a maneira de demonstrar o produto, além de atualizar texto e cores.

## Direção aprovada

- Abertura: “Sua academia organizada para dar o próximo passo.”
- Apoio: “Você dá aula, acompanha os alunos e ainda cuida do negócio. O Casca reúne cadastros, treinos e mensalidades em uma plataforma brasileira para ajudar sua academia a crescer.”
- Identificação: “Muay Thai, Boxe, Jiu-Jítsu e Judô. Cada modalidade com sua história. Sua academia com tudo organizado.”
- CTA principal: “Organizar minha academia”; secundário: “Conhecer o Casca”.
- Toda a copy deve seguir a mesma voz próxima, direta e concreta.
- Fundo branco integral, inclusive nas seções, planos e rodapé; substituir marca-texto por texto colorido.
- Preservar a identidade do Casca e o soquinho.
- Usar a AbacatePay como referência de clareza/composição e GOV/MaisMei como referências de linguagem acessível e proximidade com quem empreende.
- A última instrução amplia a liberdade de movimento: linguagem visual de sites feitos no estilo Webflow, com animações e transições ao rolar. Ela substitui a restrição anterior a transições discretas, mantendo legibilidade, conforto e movimento reduzido.

## Entrega desta etapa

- Especificação proposta em `spec-delta.md`, sem promover conteúdo para `spec/` antes de implementação e validação.
- Quatro tickets em rascunho e um índice de revisão em `.scratch/landing-brasileira-webflow/`.
- Tracker configurado: GitHub Issues de `daviduartedev/bjj-manager`; etiqueta `ready-for-agent` já existente.
- O usuário aprovou o ponto de teste e a divisão e pediu implementação com um commit dedicado por ticket, seguida de dvd-tests.
- Na publicação, criar uma issue de spec e quatro tickets novos; não fechar ou modificar issues anteriores da landing.
- Criar o plano, tarefas e cenários de execução do cycle a partir da divisão aprovada antes de implementar.

## Limites

- Sem alterações no produto autenticado, cadastro, login, preços, cobrança, webhooks ou banco.
- Sem instalar dependências ou migrar o projeto para Webflow.
- Commits dedicados por ticket explicitamente autorizados nesta conversa. Sem push ou merge.
- Preservar `db/migrations/049_casca_subscription_guards.sql` e todos os arquivos locais preexistentes.
- Não reintroduzir a seção de saudações removida anteriormente.

## Referências

- https://www.gov.br/empresas-e-negocios/pt-br/empreendedor
- https://www.maismei.com.br/
- https://www.abacatepay.com/
- https://www.abacatepay.com/design
