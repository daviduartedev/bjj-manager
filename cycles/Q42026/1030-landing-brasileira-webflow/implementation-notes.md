# Notas de implementação — Cycle 1030

## Preparação

- Spec: https://github.com/daviduartedev/bjj-manager/issues/90
- Tickets: #91, #92, #93 e #94, como subissues da spec, com `ready-for-agent` e dependências nativas: #92/#93 bloqueados por #91; #94 por #92/#93.
- Branch `feat/slug`; base `5fd8f48`. Commits por ticket explicitamente autorizados pelo usuário; sem push ou merge.
- Migration protegida: SHA-256 `DB2649D0FC263D2CBEF16EC93465381ECD8E585B724C6A7F79C81E713DCD7F7C` antes do trabalho.
- Servidor iniciado em porta livre: http://localhost:3000.
- TDD na superfície pública, com configuração temporária fora do stage e sem setup de banco. Nenhuma migração executada.

## #91 — Abertura, identidade e soquinho

- RED: smoke público falhou mostrando o título antigo em vez da abertura aprovada.
- Abertura e CTAs reescritos, quatro modalidades identificadas, demonstração preservada e soquinho integrado à rotina.
- Primitivos de marketing usam ênfase cromática, títulos semânticos e suporte a movimento reduzido.
- GREEN: smoke público da abertura passou (1/1), type-check passou e testes de mídia passaram (3/3).

## #92 — Cenas da rotina

- RED: teste público não encontrou a nova região nem os exemplos de tarefas na seção antiga.
- Nova composição com introdução fixa apenas em desktop e cenas sequenciais de cadastro, presença, mensalidades e painel; no celular, fluxo vertical nativo.
- Exemplos identificados como ilustrativos; recebimento das mensalidades continua sob controle da academia.
- GREEN: 2/2 cenários públicos passaram; type-check passou.

## #93 — Jornada dos primeiros passos

- RED: cenário no celular não encontrou os três passos na seção antiga.
- Grande painel verde substituído por trilha em três passos com linha de progresso ligada à rolagem nativa; sequência vertical no celular.
- Movimento reduzido deixa a linha completa e o conteúdo disponível. Elementos de trilha são decorativos, fora da lista semântica de passos.
- GREEN: 3/3 cenários públicos passaram, incluindo celular com movimento reduzido; type-check passou.

## #94 — Narrativa completa e oferta

- RED: teste público não encontrou a oferta revisada e as respostas específicas sobre Boxe/mensalidades.
- Evolução, oferta, FAQ, marca final e rodapé refeitos sobre branco, com navegação compartilhada e menu móvel utilizável por teclado.
- Catálogo comercial preservado. Substituído “O mais escolhido” por recomendação editorial; FAQ distingue assinatura e recebimentos da academia.
- Durante inspeção visual, identificado erro de hidratação quando o navegador prefere movimento reduzido. Reproduzido com um teste público que captura erros de console e de página; corrigido com snapshot inicial consistente entre servidor e cliente, sem suprimir avisos.
- GREEN: 5/5 cenários públicos, incluindo console sem erros, escolha de plano, menu por teclado e celular; type-check passou.
- Suíte Vitest completa: 97 arquivos, 637 testes aprovados. Após corrigir movimento reduzido, regressões pertinentes de marketing/identidade: 6/6 aprovadas.
- Lint aprovado, sem erros. Avisos baseline nos protótipos locais preexistentes de cadastro (imports não usados e dependência de hook), que não foram alterados nem entram nos commits.
- Capturas de abertura, rotina, jornada, planos e fechamento em 1440/375 px; conferência de largura também em 320/768 px, sem transbordamento horizontal.
- Build de produção aprovado, incluindo geração de páginas e verificação de tipos/lint. Log de rota dinâmica de Produtos durante tentativa de pré-renderização não impediu a geração da rota dinâmica nem o build (exit 0).

## Revisão final

- Base fixa: `5fd8f48`; diff inclui apenas os quatro tickets e documentos deste cycle.
- Standards: 0 violações documentadas; 1 sugestão P3 (copy de mensalidades duplicada entre dados e JSX), corrigida com renderização uniforme e teste pela frase visível no parágrafo.
- Spec: 0 achados acionáveis, sem desvios ou expansão de escopo.
- Removidos os recortes de animação legados que não fazem mais parte das entradas novas, evitando recortar o foco dos controles.
- O dvd-tests será executado após o último commit, na ordem pedida pelo usuário, e seus resultados/checklist serão entregues na conversa. A revisão humana e o fechamento do cycle permanecem pendentes.

## Revisão visual após feedback humano

- Título anterior restaurado: “A plataforma brasileira para gestão de academias de artes marciais.”, com acento amarelo gráfico; removidos CTA secundário, frase de modalidades e legenda da hero.
- CTAs principais compartilham o mesmo estilo verde, formato de pílula, peso e foco. Conferência no navegador: oito CTAs com fundo `rgb(0, 128, 55)`.
- Rotina refeita como demonstração ampla do painel em camadas, com alunos, aula e recebimento, acompanhada de quatro descrições de tarefas visíveis.
- Primeiros passos refeitos como seleção interativa de três etapas e prévia lateral; descrições sempre legíveis e anúncio curto da prévia após seleção.
- Evolução refeita como percurso conectado em quatro momentos, com exemplo de Jiu-Jitsu e ressalva explícita sobre Boxe.
- Tarja amarela: “O Casca cresceu para ajudar sua academia de…”. Modalidades alternam a cada 2,8 s, com transição de 280 ms, controle de pausa, suspensão fora da tela e apresentação estática das quatro modalidades em movimento reduzido. Leitores de tela recebem uma frase estável com todas as modalidades.
- RED: três cenários falharam antes da implementação pela hero antiga, ausência de seleção de etapa e ausência da tarja.
- GREEN: sete testes públicos aprovados; seis testes pertinentes de mídia/identidade aprovados; type-check aprovado; lint sem erros novos, apenas avisos baseline dos protótipos preexistentes.
- Capturas em 1440/375 px; conferências também em 320/768 px sem transbordamento horizontal.
- Nenhum novo commit, push, merge ou alteração de banco nesta revisão. Migration protegida mantém o SHA-256 registrado na preparação.
- Build final aprovado (exit 0), incluindo types e lint. A modalidade na tarja usa uma variação mais escura do token verde para preservar contraste sobre amarelo.

## Terceira revisão — protótipo para escolha de cor

- CTAs verdes com raio de 8 px e ações de seção centralizadas. A hero não usa mais coluna lateral para o botão.
- Rotina passou a ter quatro tarefas selecionáveis; primeiros passos viraram três painéis com sobreposição no scroll de desktop; evolução agora destaca a ficha do aluno. Não há novos divisores horizontais nessas composições.
- Divisores removidos do FAQ, fechamento, notas comerciais, itens do menu móvel e notas do rodapé. Mantida a separação estrutural do cabeçalho e início do rodapé.
- Tarja movida para depois de evolução e antes de planos; marca oficial substitui “O Casca”; intervalo contínuo sem play/pause. Movimento reduzido continua apresentando as modalidades de forma estática.
- Protótipo descartável ao lado dos componentes, na rota existente, comparando apenas cores como solicitado: A verde, B azul, C branca. O seletor flutuante usa URL e setas, preserva a escolha ao recarregar e não usa armazenamento local. Dois gates de desenvolvimento impedem exibir o seletor em produção.
- Conferência no navegador: as três cores aparecem, os controles da tarja são inexistentes, seta e recarga preservam B e o mobile não apresenta transbordamento.
- Type-check e sete testes públicos aprovados; lint sem erros novos, apenas avisos nos protótipos preexistentes. Nenhum teste específico do protótipo de cores foi criado.
- Sem novos commits, push ou merge. A escolha do usuário ainda está pendente; o protótipo não foi consolidado nem capturado em outra branch.

## Tarja verde aprovada — alinhamento final

- Usuário escolheu verde. Removidos os parâmetros de variante e o seletor da página; arquivo descartável preservado sem importação para captura futura autorizada.
- Modalidades destacadas em dourado claro derivado do amarelo da marca. Slot mantém a largura da maior palavra, com texto alinhado à esquerda em desktop e linha própria centralizada no celular.
- Logo dimensionada em relação à tipografia e ajustada à linha da frase.
- Conferência no navegador: Judô, Jiu-Jitsu, Muay Thai e Boxe começam exatamente em x=807,484375 px na largura de 1440 px, todos com o mesmo destaque dourado; seletor ausente. Em 320/375/768 px, sem transbordamento.
- Type-check e cenário público da tarja aprovados. Servidor local reiniciado para carregar a versão atual após falha de memória do processo anterior; a conferência final usou recarga completa.
- Sem novos commits, push ou merge.

## Destaques da hero conforme referência visual

- “brasileira” e “academias de artes marciais.” usam degradê azul → verde dos tokens da marca, com fallback para cores forçadas.
- Substituído o conjunto de brilhos por uma única estrela amarela de quatro pontas, em SVG, associada à última palavra para não ficar isolada em telas pequenas.
- Cenário público da hero aprovado; conferência visual em 1440/375/320 px, sem transbordamento. Sem novos commits.

## Ajuste final de copy da tarja

- Correção posterior: removida a largura reservada para a maior modalidade. Cada nome ocupa sua largura natural; “a crescer.” permanece fora da animação. Conferência nas quatro modalidades: distância de 14 px até o fechamento em desktop, sem transbordamento em 320 px; cenário público da tarja aprovado. Sem novos commits.

- Frase atual: “O Casca nasceu para ajudar sua academia de [modalidade] a crescer.” Atualizados texto visível, nome acessível e alternativa de movimento reduzido.
- Nome da modalidade e fechamento compartilham o espaço reservado para manter o início estável e evitar um vazio depois de nomes curtos; o destaque dourado continua apenas na modalidade.
- Type-check e cenário público da tarja aprovados. Conferência em 320/375/1440 px sem transbordamento. Sem novos commits.

## Quebra de linha do título da hero

- A partir de 768 px, o título fica em duas linhas fixas: “A plataforma brasileira para gestão de” / “academias de artes marciais.”, com a expressão destacada inteira em uma linha e o degradê contínuo. Fonte reduzida para `clamp(2.25rem, 4.4vw, 4rem)`. No celular, quebra natural com `text-balance`, e a estrela continua junto de “marciais.”.
- Conferência no navegador (porta 3011): 1440/1280/1024/768 px em duas linhas; 375/320 px em cinco linhas, sem transbordamento. Cenário público da hero aprovado. Sem novos commits.

## Quarta revisão — seções no estilo Framer e manifesto

- Rotina: grade bento com as quatro tarefas visíveis ao mesmo tempo (Alunos e Painel largos; Aulas e Mensalidades estreitos), cada uma com prévia própria e entrada escalonada. Removida a seleção por botões.
- Primeiros passos: título e progresso fixos à esquerda no desktop; os três passos passam à direita e o indicador acompanha o passo em leitura. Fluxo normal no celular.
- Evolução: título centralizado e ficha da aluna com linha do tempo (matrícula, presença, mensalidade, graduação) que se completa com o scroll; horizontal a partir de 768 px, vertical no celular. Ressalva do Boxe mantida.
- Novo manifesto `lp-manifesto.tsx`, depois do soquinho: faixa escura no estilo do print, rótulo “Por que existimos” e parágrafo cujas palavras acendem com o scroll. Nomes em dourado claro: Jigoro Kano, Hélio Gracie, Rillion Gracie, Anderson Silva, Éder Jofre, Popó Freitas, Rafaela Silva, Aurélio Miguel, Natália Falavigna, Buakaw. Leitores de tela recebem a frase inteira; movimento reduzido mostra tudo aceso.
- Smoke da rotina ajustado à nova composição e novo cenário do manifesto. Type-check e lint aprovados; sete testes públicos aprovados na porta 3011. Conferência visual em 1440/375 px; 320/375 px sem transbordamento. Sem novos commits.
- Ajuste do manifesto: removido o rótulo “Por que existimos”; seção agora `#manifesto`, nome acessível “Manifesto do Casca”. Texto centralizado e mantido. Comportamento trocado: em vez de acender com o scroll, as palavras surgem uma vez, em sequência, saindo de desfoque e subindo levemente ao entrar na tela. Movimento reduzido mostra o texto completo. Type-check, lint e sete testes públicos aprovados; 320 px sem transbordamento. Sem novos commits.
