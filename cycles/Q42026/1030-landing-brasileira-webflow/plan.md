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

Usar code-review nas dimensões Standards e Spec, em paralelo, sobre a base `5fd8f48` e o trabalho deste cycle. Corrigir achados antes da conclusão. O encerramento do dvd-tests será na conversa, sem criar arquivo de validação nessa etapa.
