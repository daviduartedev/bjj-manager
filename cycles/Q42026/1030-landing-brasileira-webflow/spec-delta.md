# Landing Casca — organização, crescimento e experiência de scroll

**Status:** aprovada para implementação; publicada como spec #90 no GitHub. Ainda não promovida a spec validada.
**Data:** 30/10/2026.

## Problem Statement

Quem dá aula e administra uma academia precisa reconhecer sua rotina ao conhecer o Casca. A landing atual apresenta funcionalidades, mas sua mensagem ainda não forma uma conversa consistente sobre organizar a academia e dar o próximo passo no negócio. A apresentação centrada em faixas também pode fazer profissionais de outras modalidades, principalmente Boxe, entenderem que o produto não fala com eles.

Visualmente, marca-textos, fundos cinza, grandes painéis verde e azul e composições repetidas quebram a direção desejada: uma página branca, minimalista, brasileira e própria do Casca. As seções “O Casca conhece o trabalho por trás de cada aula.” e “Da matrícula ao fim do mês, sem perder o fio.” precisam de uma nova composição que demonstre a rotina e a jornada, em vez de receber apenas retoques.

O visitante deve compreender o benefício, reconhecer tarefas reais da academia, conhecer o produto, entender a assinatura e encontrar um próximo passo claro. Movimento deve ajudar a contar essa história sem prejudicar leitura ou navegação.

## Solution

Refazer a landing pública com liberdade para reorganizar todas as seções, combinando uma voz brasileira próxima de quem empreende, demonstrações concretas do produto e uma experiência de scroll com acabamento de sites no estilo Webflow. A AbacatePay orienta clareza e composição; MaisMei e Portal do Empreendedor orientam proximidade, organização por necessidades e linguagem cotidiana. Textos e identidade continuam próprios do Casca.

A narrativa começa pela organização e pelo próximo passo da academia, demonstra alunos, aulas, mensalidades e evolução com situações reais, explica como começar e encerra com uma oferta compreensível. O fundo de toda a página é branco; palavras coloridas substituem o marca-texto. O soquinho permanece como elemento da marca, e animações e transições ao rolar conectam as seções.

## User Stories

1. As a dono de academia de artes marciais, I want entender na abertura como o Casca ajuda a organizar minha academia, so that eu saiba se a plataforma atende minha rotina.
2. As a professor que também administra, I want reconhecer tarefas que faço entre as aulas, so that eu sinta que a mensagem foi escrita para quem vive essa realidade.
3. As a dono de academia brasileira, I want uma conversa próxima e direta, so that eu compreenda a proposta sem precisar traduzir termos de software.
4. As a dono de academia, I want uma proposta de apoio ao crescimento baseada em organização, so that eu entenda o benefício sem receber promessas de faturamento garantido.
5. As a dono de academia de Muay Thai, I want reconhecer minha modalidade na página, so that eu não interprete o Casca como exclusivo de Jiu-Jitsu.
6. As a dono de academia de Boxe, I want ver alunos, treinos e mensalidades apresentados sem obrigação de usar faixas, so that eu reconheça uma rotina compatível com minha modalidade.
7. As a dono de academia de Jiu-Jitsu, I want reconhecer acompanhamento de alunos e histórico de graduação, so that eu entenda a aplicação do produto à minha academia.
8. As a dono de academia de Judô, I want minha modalidade incluída na comunicação, so that eu reconheça o público do produto.
9. As a visitante, I want uma mensagem coerente da abertura ao rodapé, so that eu acompanhe uma única conversa sobre minha academia.
10. As a visitante, I want ver o produto e exemplos concretos junto dos benefícios, so that eu entenda o que o Casca organiza.
11. As a professor, I want entender como o cadastro acompanha o aluno, so that eu veja utilidade além de uma lista de nomes.
12. As a professor, I want entender a organização de turmas, aulas e presença, so that eu associe a plataforma ao trabalho entre os treinos.
13. As a responsável financeiro, I want entender o acompanhamento de mensalidades e a confirmação do recebimento pela academia, so that eu não espere uma cobrança automática que a página não deve prometer.
14. As a professor, I want entender a diferença entre acompanhar o histórico do aluno e registrar uma graduação, so that eu reconheça os recursos aplicáveis à minha modalidade.
15. As a visitante, I want a antiga seção de funcionalidades substituída por cenas de rotina com composição própria, so that eu consiga relacionar cada benefício a uma tarefa real.
16. As a visitante, I want a antiga seção de processo refeita como uma sequência clara de primeiros passos, so that eu entenda como começar a organizar a academia.
17. As a visitante, I want essas duas seções terem papéis visuais e narrativos diferentes, so that a página avance sem repetir a mesma grade de cartões.
18. As a visitante, I want fundo branco em todas as seções e no rodapé, so that a página tenha continuidade visual.
19. As a visitante, I want palavras importantes destacadas por cor e legíveis, so that eu identifique a mensagem sem faixas de marca-texto atrás das palavras.
20. As a visitante, I want reconhecer logo, cores e soquinho do Casca, so that o novo layout mantenha a identidade do produto.
21. As a visitante, I want animações de entrada e transições ligadas ao scroll que acompanhem a narrativa, so that a experiência seja fluida e interessante.
22. As a visitante, I want controlar livremente a rolagem, so that eu consiga avançar, voltar ou pular diretamente para uma seção.
23. As a pessoa que prefere movimento reduzido, I want ler todo o conteúdo e ver o estado final das ilustrações sem animação necessária, so that eu use a página com conforto.
24. As a visitante pelo celular, I want a mesma narrativa em uma composição empilhada e legível, so that eu não dependa de efeitos de desktop para entender o produto.
25. As a visitante que usa teclado, I want foco visível e acesso ao menu, botões e perguntas, so that eu consiga navegar e decidir sem mouse.
26. As a visitante que usa leitor de tela, I want títulos organizados e conteúdo com ordem de leitura coerente, so that a narrativa faça sentido sem sua apresentação visual.
27. As a dono de academia, I want comparar planos pelo preço e pela capacidade de alunos ativos, so that eu escolha com informações consistentes.
28. As a dono de academia, I want entender quando a assinatura começa a ser cobrada, so that eu tome a decisão sem supor um período gratuito.
29. As a visitante, I want distinguir a assinatura do Casca das mensalidades dos meus alunos, so that eu entenda o papel da plataforma e da academia em cada pagamento.
30. As a visitante, I want respostas claras sobre modalidades, acesso, mensalidades e assinatura, so that eu resolva dúvidas antes de me cadastrar.
31. As a visitante, I want os botões principais levarem ao cadastro existente e os botões dos planos preservarem minha escolha, so that eu consiga continuar a contratação.
32. As a visitante, I want o menu e o rodapé apontarem para seções existentes e rotas corretas, so that a reorganização não interrompa minha navegação.
33. As a visitante, I want demonstrações identificáveis como exemplos e apenas afirmações sustentadas pelo produto, so that eu possa confiar no que a página apresenta.
34. As a visitante, I want texto e ações estáveis enquanto mídias carregam, so that eu consiga ler e interagir sem saltos de layout.
35. As a responsável pelo Casca, I want validar a experiência completa no navegador antes de concluir, so that a nova copy, composição e animação funcionem juntas.

## Implementation Decisions

- Escopo restrito à landing pública e aos componentes de marketing necessários para compô-la. Não mudar contratos de cadastro, autenticação, assinatura ou operação da academia.
- Trabalhar na branch `feat/slug`, preparada a partir da `develop` local no commit `5fd8f48`. Não fazer commit, push ou merge sem novo pedido explícito.
- Manter a academia como protagonista e o Casca como apoio à organização e ao crescimento. Crescimento é a direção da proposta, não uma garantia de novos alunos ou receita.
- Abertura aprovada: “Sua academia organizada para dar o próximo passo.” Apoio: “Você dá aula, acompanha os alunos e ainda cuida do negócio. O Casca reúne cadastros, treinos e mensalidades em uma plataforma brasileira para ajudar sua academia a crescer.”
- Identificação aprovada das quatro modalidades: “Muay Thai, Boxe, Jiu-Jítsu e Judô. Cada modalidade com sua história. Sua academia com tudo organizado.” Na UI ligada ao catálogo, respeitar os rótulos canônicos do produto, incluindo “Jiu-Jitsu”. Não ampliar isso para promessa de operação simultânea de várias modalidades em uma única conta.
- Ação principal de abertura: “Organizar minha academia”; ação secundária: “Conhecer o Casca”, levando a uma demonstração da própria página. CTAs contextuais podem variar conforme o trecho, mantendo o cadastro existente como destino de adesão.
- Reescrever a copy de todas as seções, navegação, planos, FAQ e rodapé para a mesma voz. Falar de quem chegou, quem treinou, mensalidades e próximos passos; evitar jargão de software e gírias forçadas de uma modalidade específica.
- Usar as referências como orientação de tom, hierarquia, demonstração e ritmo. Não importar identidade, slogans, depoimentos ou números das referências. GOV é referência de linguagem acessível, sem sugerir vínculo institucional.
- Composição livre dentro da identidade Casca: tipografia forte, respiro, alinhamentos consistentes, contraste claro entre títulos e corpo, demonstrações de produto e transições bem acabadas. “Estilo Webflow” descreve a experiência visual, sem migração de plataforma.
- Fundo branco integral: abertura, seções, cartões de planos, FAQ e rodapé. Remover painéis extensos verdes/azuis e superfícies cinza usadas como fundo de seção. Conteúdo real das demonstrações pode preservar as cores da interface representada; botões, logo e pequenos elementos semânticos podem usar a paleta.
- Substituir todo marca-texto por palavras coloridas com contraste suficiente sobre branco, usando principalmente azul e verde da marca. Amarelo pode ser acento gráfico, sem comprometer a leitura de texto. A hierarquia também deve ser compreensível sem distinguir cores.
- Reaproveitar tokens, tipografia e recursos existentes no produto, sem redefinir o tema global das áreas autenticadas. Primitivos compartilhados devem poder ser adotados por trecho, sem exigir uma migração quebrada da página inteira.
- Refazer a antiga seção de funcionalidades como uma sequência de cenas operacionais: aluno chegando/cadastro, turma ou treino, mensalidade acompanhada e visão do dia. Cada cena combina benefício curto, explicação concreta e uma representação fiel do produto. Evitar repetir uma grade uniforme de quatro cartões como solução principal.
- Em desktop, a demonstração pode acompanhar a progressão das cenas numa composição em duas áreas; em telas menores, texto e demonstração seguem juntos em sequência vertical. Não exigir clique ou efeito de scroll para acessar informação essencial.
- Refazer a antiga seção de processo como uma jornada própria em três passos: cadastrar os alunos, organizar a rotina e acompanhar o que pede atenção. Conectar os passos visualmente e por entradas progressivas, sem reaproveitar o grande card verde atual nem duplicar a demonstração anterior.
- Preservar o soquinho e incorporá-lo ao novo ritmo da página. Não restaurar a seção de saudações que o usuário já removeu. Reutilizar a demonstração de produto existente quando ela servir à nova narrativa, sem reconstruir toda a produção de vídeo neste escopo.
- A seção de evolução deve falar a todas as modalidades: acompanhamento do aluno para todos; graduação somente quando aplicável. Não apresentar faixa ou grau como obrigatório no Boxe.
- A última instrução do usuário substitui a preferência anterior por pouco movimento: ficam autorizadas animações e transições de scroll mais elaboradas, com propósito narrativo e leitura estável. Usar as ferramentas de animação já instaladas, sem novas dependências.
- Rolagem nativa: não capturar roda do mouse, não bloquear o usuário em etapas, não criar páginas artificialmente longas para completar uma animação. Reservar efeitos a demonstrações e entradas; texto e CTAs devem permanecer fáceis de ler e alcançar.
- Movimento reduzido deve apresentar os estados finais de texto, soquinho, marca e demonstrações, sem depender de progresso de scroll ou de vídeo em reprodução. No celular, simplificar composições e efeitos que prejudiquem espaço ou fluidez.
- Preservar as rotas existentes de entrada, cadastro e páginas legais. Âncoras antigas devem continuar funcionando quando possível, ou ser substituídas de forma consistente em todos os links internos da landing.
- Os preços e limites continuam vindos do catálogo comercial: Essencial R$ 99/mês até 50 alunos ativos; Academia R$ 179/mês até 150; Evolução R$ 299/mês até 300. Todos incluem os recursos atuais. Não alterar o catálogo ou regras comerciais.
- Comunicar cobrança mensal iniciada na adesão conforme direção comercial já aprovada. Não anunciar teste grátis, gratuidade, garantia de resultado ou cobrança automática das mensalidades dos alunos.
- A academia recebe e confirma as mensalidades dos alunos. A assinatura do Casca é outra relação comercial. Não confundir os dois fluxos na demonstração nem no FAQ.
- Não criar prova social. Retirar ou substituir afirmações como “O mais escolhido” quando não houver evidência fornecida; uma recomendação editorial deve ser apresentada explicitamente como recomendação.

## Testing Decisions

- Ponto principal de teste proposto: a landing pública completa no navegador, sem sessão. É o nível mais alto que comprova a narrativa e os destinos das ações sem testar contratos internos dos componentes.
- Validar comportamento observável: acesso público, título e proposta, quatro modalidades, navegação por âncoras, CTAs para cadastro, escolha de plano preservada, FAQ utilizável, mídia/demonstrações legíveis e rodapé acessível.
- Reutilizar os testes de rotas públicas e o smoke de interface já existentes, atualizando as expectativas da copy antiga que foi substituída. Não manter uma expectativa obsoleta apenas para conservar o teste verde.
- Ampliar o teste público com verificações úteis de teclado, leitura em telas pequenas e movimento reduzido. Não testar nomes de componentes, classes, estrutura de arquivos ou detalhes de implementação da animação.
- Validar visualmente no navegador em 375 px e 1440 px; conferir também o limite de 320 px e a transição de layout em 768 px. Verificar ausência de corte de título, transbordamento horizontal e grandes saltos quando a mídia carrega.
- Registrar capturas das duas seções prioritárias, abertura e fechamento em celular e desktop. Capturas são evidência para avaliar composição e conteúdo, não substituem verificar links e teclado.
- Conferir em movimento normal e reduzido que texto, ações e soquinho ficam disponíveis, que o scroll continua nativo e que nenhuma informação depende de uma animação terminar. A avaliação de acabamento de movimento é feita por observação no navegador.
- Usar os testes existentes de marketing, mídia e identidade como regressão pertinente. Se um teste de fonte acoplar a antiga composição, revisar somente a expectativa invalidada por este escopo, preservando sua intenção útil. Não criar nova coleção de snapshots de código-fonte.
- Rodar type-check, lint, build e testes pertinentes conforme os scripts reais do projeto. Só marcar resultado como aprovado após executar e guardar evidência; distinguir falhas novas de baseline.
- O navegador deve testar a página pública sem depender de criar usuários, gravar pagamentos ou alterar banco. Não executar preparações de dados ou migrações para validar esta landing.
- Não acrescentar testes de backend, schema, cobrança ou graduação, pois seus comportamentos não são alterados. Não comparar cores de pixels de um vídeo com a exigência de fundo branco da superfície da página.

## Out of Scope

- Implementar mudanças no produto autenticado, portal, cadastro, login, confirmação de e-mail ou recuperação de senha.
- Alterar preços, limites, trials, cancelamento, enforcement, gateway, webhooks, chaves ou ambiente de pagamentos.
- Alterar ou executar migrações, modificar banco, APIs, contratos de servidor ou regras de graduação e mensalidade.
- Prometer multi-modalidade simultânea por conta, faixas no Boxe, novos recursos de captação de alunos ou automações não implementadas.
- Inventar depoimentos, logos de clientes, números de academias, economia mensurável ou resultados comerciais.
- Criar seção de saudações, refazer o vídeo promocional por completo ou produzir novas fotos sem necessidade demonstrada.
- Migrar para Webflow, instalar bibliotecas ou redefinir o design system global do aplicativo.
- Alterar issues antigas de landing/assinaturas, marcar trabalho anterior como concluído ou corrigir documentação legada fora do escopo.
- Fazer commit, push, merge, deploy, descartar mudanças locais ou incluir arquivos soltos e a migration protegida em commits.

## Further Notes

- O grill foi explicitamente encerrado pelo usuário. Esta spec sintetiza o alinhamento existente, sem reabrir entrevista de produto.
- Esta é uma proposta de mudança, não documentação de comportamento já implementado e validado. As specs antigas têm trechos de tema escuro/MVP inicial que não descrevem integralmente a landing atual. Não restaurar esse desenho nem promover esta proposta como verdade final antes da validação.
- O pedido final autoriza refatoração integral das seções e movimentos de scroll, priorizando as duas seções identificadas no problema. Os demais limites e a aprovação da copy de abertura continuam vigentes.
- O usuário aprovou o ponto de teste e o tamanho/dependências dos tickets, autorizando a implementação e um commit dedicado por ticket. Spec #90 e tickets #91–#94 foram publicados no GitHub com `ready-for-agent`.
- Referências consultadas: [Portal do Empreendedor](https://www.gov.br/empresas-e-negocios/pt-br/empreendedor), [MaisMei](https://www.maismei.com.br/), [AbacatePay](https://www.abacatepay.com/) e [guia de design AbacatePay](https://www.abacatepay.com/design).
