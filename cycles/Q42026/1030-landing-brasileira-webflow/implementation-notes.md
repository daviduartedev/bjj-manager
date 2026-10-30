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
