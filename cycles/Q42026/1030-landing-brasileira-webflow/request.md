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
- Quatro tickets publicados (#91–#94), com os rascunhos e índice de revisão preservados em `.scratch/landing-brasileira-webflow/`.
- Tracker configurado: GitHub Issues de `daviduartedev/bjj-manager`; etiqueta `ready-for-agent` já existente.
- O usuário aprovou o ponto de teste e a divisão e pediu implementação com um commit dedicado por ticket, seguida de dvd-tests.
- Na publicação, criar uma issue de spec e quatro tickets novos; não fechar ou modificar issues anteriores da landing.
- Plano, tarefas e cenários criados a partir da divisão aprovada antes da implementação.

## Limites

- Sem alterações no produto autenticado, cadastro, login, preços, cobrança, webhooks ou banco.
- Sem instalar dependências ou migrar o projeto para Webflow.
- Commits dedicados por ticket explicitamente autorizados nesta conversa. Sem push ou merge.
- Preservar `db/migrations/049_casca_subscription_guards.sql` e todos os arquivos locais preexistentes.
- Não reintroduzir a seção de saudações removida anteriormente.

## Revisão visual solicitada após o dvd-tests

Estas decisões mais recentes substituem os itens anteriores nos pontos correspondentes:

1. Restaurar o título anterior da hero: “A plataforma brasileira para gestão de academias de artes marciais.” e incluir amarelo como acento gráfico, sem retornar ao marca-texto.
2. Padronizar os CTAs principais em verde e remover “Conhecer o Casca” da hero.
3. Remover da hero a frase que lista modalidades e a legenda “Um olhar por dentro do Casca. Demonstração com dados de exemplo.”.
4. Refazer novamente as composições de rotina, primeiros passos e evolução com referência visual direta na AbacatePay, no espírito de sites Framer/Webflow.
5. Criar uma tarja de altura generosa: “O Casca cresceu para ajudar sua academia de…”, alternando Judô, Jiu-Jitsu, Muay Thai e Boxe, com pausa e movimento reduzido.
6. Manter o soquinho, os destinos de cadastro e os limites comerciais. Estes ajustes permanecem sem novos commits até revisão humana.

### Referências desta revisão

### Terceira revisão — comparação de cores da tarja

- CTAs verdes voltam ao raio anterior (`rounded-lg`), sem pílulas, centralizados nas seções.
- A tarja passa a ficar depois das três seções de produto, antes de planos; sem fundo amarelo, sem play/pause, com alternância contínua e preferência de movimento reduzido preservada.
- Usar a logo oficial no lugar de escrever “O Casca”.
- Protótipo de cores na própria landing por `?variant=A|B|C`: verde, azul e branco, com seletor flutuante apenas em desenvolvimento. Como a pergunta explícita do usuário é de cores, as variantes mantêm a mesma composição para comparação, em vez de variar a estrutura.
- Refazer novamente as três seções: rotina selecionável, passos em painéis e ficha do aluno em destaque. Reduzir divisores horizontais na página.
- Não fazer novos commits, push ou merge. O protótipo será consolidado apenas após escolha do usuário; captura em branch descartável depende de autorização de commit posterior.

### Escolha da tarja e alinhamento

- Usuário escolheu a variante verde.
- Consolidar a cor e retirar o seletor da landing; preservar o arquivo descartável para captura futura sem commit nesta etapa.
- Modalidades sempre com cor de destaque e posição estável: slot com largura da maior palavra e alinhamento à esquerda junto da frase em desktop; linha própria centralizada no celular.
- Alinhar a logo ao tamanho e à linha da frase. Usar dourado claro derivado do amarelo da marca para contraste sobre verde.
- Copy final solicitada: “O Casca nasceu para ajudar sua academia de [modalidade] a crescer.” Substitui “cresceu” por “nasceu” e adiciona o fechamento depois da modalidade.
- Somente o nome da modalidade anima. “a crescer.” fica em um elemento estático fora da transição, com posição estável durante as trocas.
- Correção do espaçamento solicitada: usar a largura natural da modalidade atual, sem reservar o tamanho de Muay Thai para Judô/Boxe. “a crescer.” continua fora da animação; a linha se ajusta naturalmente ao nome.
- Hero: aplicar o efeito de cor em degradê do print a “brasileira” e à expressão completa “academias de artes marciais.”, usando azul e verde da marca; substituir o ícone de múltiplos brilhos por uma única estrela de quatro pontas amarela, seguindo a referência fornecida.

- https://www.gov.br/empresas-e-negocios/pt-br/empreendedor
- https://www.maismei.com.br/
- https://www.abacatepay.com/
- https://www.abacatepay.com/design

### Quarta revisão — seções no estilo Framer e manifesto

- Hero: quebra de linha deliberada, com “academias de artes marciais.” inteira na segunda linha a partir do tablet; fonte reduzida.
- Refazer “A rotina da academia, no seu lugar.”, “Seu próximo passo começa por aqui.” e “Cada aluno tem uma história. Acompanhe de perto.” em composições mais modernas, no estilo de sites Framer.
- Nova seção no estilo do print de referência (rótulo pequeno à esquerda e grande parágrafo à direita, com palavras destacadas em cor), citando vários nomes de lutadores e mestres: Rillion Gracie, Anderson Silva, Jigoro Kano e nomes de Taekwondo, Judô, Boxe e demais modalidades.
- Sem novos commits, push ou merge.
