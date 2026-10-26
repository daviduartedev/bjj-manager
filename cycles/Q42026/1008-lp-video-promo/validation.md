# Validation — Cycle 1008

Data: 2026-10-08

## Automatizado

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit -p .` | sem erros |
| `npx vitest run` | 58 arquivos, 377 testes passando (inclui `promo-timeline.test.ts`: 17 testes de roteiro/primitivas) |
| `npx next lint --dir components/marketing --dir lib/marketing` | sem avisos |

O `promo-timeline.test.ts` garante: duração = soma das cenas; cursor e câmera cobrem a cena inteira com
frames crescentes; todo clique ocorre com o cursor parado (±3 frames) dentro da janela; zoom ≤ 1.6x;
caminhos globais sem frame duplicado na junção.

## Visual (dev server em `http://localhost:3100`)

Quadros renderizados em 1920×1080 via rota temporária (já removida) e conferidos por captura:
abertura, cadastro (modal, digitação, dropdown, chip, linha nova, contador 5→6), graduação (modal,
digitação, belt wipe, evento no histórico), mensalidades (seleção, baixa em lote, R$ 600,00),
painel (contadores, barra 80%, chip), documentos (certificado, WhatsApp) e encerramento.

Landing (`/`): vídeo só inicia ao entrar em vista e começa em 0:00; clicar em "Mensalidades" leva a
0:22 e destaca o item (`aria-current`); barra de progresso e play/pause funcionam.

## Ajustes feitos durante a validação

- Wordmark `/uf.png` tem fundo preto opaco → gerado `public/marketing/casca-wordmark-transparent.png`.
- Legenda de cena sai após ~2,6s para não cobrir campos com zoom.
- Câmera abre mais nos momentos de toast para o aviso não ser cortado.
- Poster de reduced-motion lia o estado inicial `true` e aparecia por engano → lê `matchMedia` direto.

## Pendente

- Smoke humano (T13) e promoção do `spec-delta.md` (não gerado; mudança é só da landing).

## Rodada 2 — evidência (2026-10-08)

- `npx tsc --noEmit -p .` sem erros; `npx vitest run`: 58 arquivos / 377 testes; `npx next lint --dir components/marketing --dir lib/marketing`: sem avisos.
- Navegador (`http://localhost:3100`, 1440×900), capturas ao longo da página: hero → vídeo (moldura leve, sem header/footer) → Funcionalidades → Como funciona → Faixas → Para quem → Segurança → FAQ → CTA vermelho → Footer; transições em pontos com tilt 3D assentando ao rolar; `/#sistema` leva ao vídeo.
- Corrigido na validação: `LP_TONE` exportado de módulo `"use client"` chegava indefinido ao server component (500) → movido para `lp-tone.ts`; `id="sistema"` ausente; costura de 1px entre seções; gradiente do CTA preso ao container interno.
- Não verificado: mobile (viewport estreito) e execução dos e2e Playwright.

## Rodada 3 — layout convencional (2026-10-08)

- Pontos de meio-tom (`lp-edge`) e folhas 3D (`lp-sheet`) descartados a pedido. Landing refeita no estilo de um SaaS convencional (referência: gymdesk.com): fundos alternando branco e cinza claro, cards brancos com borda e sombra leves, hero claro, vídeo em moldura escura, CTA vermelho, rodapé escuro. Sem texturas nem efeitos 3D entre seções.
- Conferido no navegador (1440×900) rolando a página inteira. tsc, vitest (377) e lint sem erros. Mobile não verificado.

## Rodada 4 (2026-10-08)

- Vídeo Remotion movido para a própria hero (`LpSystemVideo` agora é um bloco dentro de `LpHero`; seção separada removida; `#sistema` e `data-testid` preservados); cenas viram uma linha de 5 botões abaixo do player.
- Removido o título 'Se preocupe apenas em dar aula.' e o subtítulo da abertura do vídeo (`IntroTitle` agora só mostra o wordmark); o título continua na hero da página.
- Seções alternam preto/branco: hero preto, funcionalidades branco, como funciona preto, faixas branco, para quem preto, segurança branco, FAQ preto, CTA vermelho, rodapé preto.
- Rodapé usa `/marketing/casca-wordmark-transparent.png` como logo (marca d'água removida).
- Logo da cobra (`/logo.png`, 1254×1254, `unoptimized`) na seção 'Para quem' (preta), exibida a 416px (≈3× de densidade).
- Conferido no navegador (1440×900); tsc, vitest e lint sem erros. Mobile não verificado.
