# Tasks — Cycle 1008

- [x] T1 Atualizar `main`/`develop` locais com o remoto (`git fetch --prune`; `main` = `origin/main`; sem `develop` local)
- [x] T2 Primitivas puras de timeline (cursor com arco, câmera, digitação, contadores) — `promo/timeline.ts`
- [x] T3 Kit visual do sistema em escala de vídeo (sidebar, cards, modal, campos, toasts) — `promo/ui.tsx`
- [x] T4 Cena Alunos: clique em "Novo aluno", digitação, select, chip, salvar, linha nova + contador
- [x] T5 Cena Graduação: modal, tipo/faixa, data e justificativa digitadas, wipe de faixa azul→roxa, evento no histórico
- [x] T6 Cena Mensalidades: seleção de linhas, baixa em lote, "Pagar" individual, contadores em cascata
- [x] T7 Cena Painel: contadores, barra de progresso, chip "Faixa ou grau", barras de faixas
- [x] T8 Cena Documentos: modelo, aluno digitado, certificado, envio por WhatsApp com ticks
- [x] T9 Abertura e encerramento (título animado, janela em perspectiva, CTA)
- [x] T10 Composição global (roteiros em `promo/scripts.ts`, câmera contínua, cursor, legendas)
- [x] T11 Landing: aspect 16:9, itens navegam o vídeo, destaque da cena ativa, barra de progresso/seek, play/pause, autoplay só ao entrar em vista, poster para reduced-motion
- [x] T12 Testes: `lib/marketing/promo-timeline.test.ts` (novo) e `landing-photos.test.ts` (atualizado)
- [ ] T13 Smoke humano no navegador (porta 3100) — aguardando o usuário

## Ajustes da rodada 2 (landing)

- [x] A1 Card do vídeo sem header/footer: só moldura leve (barra de navegador e controles removidos; cenas continuam navegáveis pela lista)
- [x] A2 Footer robusto (lp-footer.tsx): marca, descrição, 4 colunas de links, marca d'água, barra legal; usado também nas páginas legais
- [x] A3 Vídeo logo após a hero (id="sistema", segunda view)
- [x] A4 Transições entre seções em meio-tom com perspectiva 3D e paralaxe (lp-edge.tsx, lp-tone.ts)
- [x] A5 Numerais removidos dos cards (funcionalidades e legenda do vídeo)
- [x] A6 Novas seções: Como funciona, Faixas e graus, Para quem, Segurança e escopo; FAQ escuro e CTA vermelho
- [ ] A7 Smoke humano da rodada 2 (aguardando o usuário)
