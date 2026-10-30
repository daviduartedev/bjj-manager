# Plano — Cycle 1030

Spec aprovada: https://github.com/daviduartedev/bjj-manager/issues/90
Base de revisão: `5fd8f48`; branch: `feat/slug`.

## Direção de design

- Branco `#FFFFFF`, texto `#3A3A3A`, azul Casca `#0055A0`, verde Casca `#008037` e amarelo `#F8B800` em pequenos acentos, sempre derivados dos tokens existentes.
- Geologica na abertura, tipografia de leitura já existente nas demais seções. Títulos grandes, largura de leitura controlada e generosos intervalos.
- Abertura alinhada à esquerda com uma quebra deliberada no benefício; demonstração abaixo. Soquinho como assinatura humana de passagem para a rotina.
- Rotina: composição editorial em duas colunas, com exemplos de cadastro, aula, mensalidade e painel; texto e interface atravessam a seção juntos. Não repetir uma grade de cartões.
- Primeiros passos: trilha em três momentos, com passos conectados e progresso de scroll. No celular, sequência vertical.
- Evolução, planos e dúvidas: informação direta, superfícies brancas, contornos sutis e ritmos diferentes. Fechamento amplo com marca para fundo branco.
- Movimento concentrado em demonstrações e progressão, com scroll nativo. Leitura e CTAs estáveis. Movimento reduzido mostra estados finais.

## Sequência de entrega e commits

1. #91 — abertura, base visual e soquinho; preparar recursos de movimento seguros no próprio fluxo visível.
2. #92 — cenas de rotina (depende de #91).
3. #93 — jornada de primeiros passos (depende de #91, independente de #92).
4. #94 — evolução, oferta, FAQ, fechamento e integração (depende de #92 e #93).

Um commit dedicado por ticket, com stage explícito apenas dos arquivos desse ticket e documentos deste cycle. Nunca incluir a migration nem arquivos soltos anteriores. Sem push ou merge.

## Verificação durante implementação

Ponto aprovado: landing pública no navegador, sem sessão. Alterar o smoke existente um cenário por vez, observar falha antes da implementação e verificar a entrega. Usar uma configuração local temporária sem global setup de banco. Rodar type-check e testes pertinentes por fatia; suíte Vitest completa uma vez ao final, além de lint e build.

## Smoke / dvd-tests

- Comando documentado: `pnpm dev --port 3000`; URL: http://localhost:3000. Porta confirmada livre antes da inicialização.
- Sem login: toda esta entrega é pública. Não fornecer nem solicitar perfis de acesso.
- Drive: abertura → demonstração → cenas da rotina → primeiros passos → evolução → planos → FAQ → fechamento → cadastro por plano. Não concluir cadastro nem contratar assinatura.
- Desktop 1440 px, mobile 375 px; limites 320 e 768 px; teclado e movimento reduzido.
- Negativo: Boxe não exige graduação; FAQ esclarece que mensalidades dos alunos são recebidas pela academia; sem oferta de trial.
- Deixar servidor saudável ligado e entregar checklist humano desmarcado após os commits explicitamente pedidos pelo usuário. Não fazer novos commits após o dvd-tests sem confirmação humana.

## Revisão

### Direção da segunda revisão visual

- Hero com o título anterior, amarelo em elemento gráfico e apenas o CTA verde.
- CTAs com o mesmo verde, formato de pílula, peso e tratamento de foco; tamanhos adaptados ao contexto.
- Rotina: demonstração ampla da interface em camadas, com resumo das quatro tarefas abaixo; eliminar a longa coluna de cenas e introdução fixa.
- Primeiros passos: lista de etapas selecionáveis e demonstração lateral que responde à seleção, com descrições sempre legíveis; eliminar a trilha horizontal anterior.
- Evolução: percurso visual do aluno em composição horizontal conectada, com cadastro, presença, mensalidade e graduação quando aplicável; eliminar o antigo cartão de histórico vertical.
- Tarja amarela de altura generosa como exceção expressamente solicitada ao fundo branco das seções. Texto escuro, modalidade em verde, transição de opacidade/deslocamento em 280 ms a cada 2,8 segundos. Pausa ao sair da tela e controle explícito de pausa; em movimento reduzido, mostrar as modalidades sem troca automática.
- Animações seguem leitura nativa e estados finais acessíveis. Sem dependências novas, mudança de produto, commit ou publicação remota nesta revisão.

Usar code-review nas dimensões Standards e Spec, em paralelo, sobre a base `5fd8f48` e o trabalho deste cycle. Corrigir achados antes da conclusão. O encerramento do dvd-tests será na conversa, sem criar arquivo de validação nessa etapa.

### Terceira revisão e protótipo de cores

- CTAs: `rounded-lg`, verdes e centralizados nas seções; hero sem coluna de ação à direita.
- Rotina: quatro opções selecionáveis e detalhe com demonstração própria da tarefa, em vez do dashboard panorâmico anterior.
- Primeiros passos: três painéis de leitura que se sobrepõem suavemente durante o scroll em desktop; fluxo normal no celular e em movimento reduzido.
- Evolução: ficha de aluno em destaque à esquerda e mensagem à direita, sem a sequência de quatro cartões anterior.
- Tarja depois da evolução, antes dos planos, com logo oficial e troca contínua de modalidades, sem play/pause; respeitar movimento reduzido.
- Protótipo descartável ao lado dos componentes de marketing, na rota existente: `?variant=A` verde, `B` azul, `C` branca. Mesma composição por pedido explícito de comparação de cores. Seletor flutuante e teclas esquerda/direita apenas em desenvolvimento. Sem persistência, novas dependências, testes específicos de protótipo ou commits.
- Remover divisores de fechamento, FAQ e área de informações comerciais; usar espaço para separar seções.
