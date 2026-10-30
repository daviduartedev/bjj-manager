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
