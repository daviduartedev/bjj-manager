# Validação — Cycle 1029

## Automatizada

- `pnpm type-check` — passou.
- `pnpm lint` — passou; apenas avisos em protótipos não relacionados e já existentes.
- `pnpm test lib/marketing/landing-photos.test.ts` — 3 testes passaram.
- `pnpm exec playwright test e2e/quick-ui.spec.ts --grep "landing"` — 1 teste passou.
- `pnpm build` — passou. O build manteve o aviso existente de uso dinâmico de cookies em `/produtos`.

## Browser

- Desktop: 1440 × 1000, sem overflow horizontal, erros ou avisos de console.
- Mobile: 390 × 844, sem overflow horizontal, erros ou avisos de console.
- Nenhuma ocorrência visível de “3 dias de teste”.
- “Como funciona” validado como card verde contido, com margens externas.
- Marca final validada em três pontos do scroll: início, emblema e assinatura completa.
- A marca final aparece sem círculo decorativo nem faixa horizontal.
- O rodapé claro exibe uma única versão pequena da marca.
- A animação das mãos após a hero continua presente.
- Os rótulos `01`, `02` e `03` e o texto “Adulto, Kids 1 e Kids 2” não aparecem na página.
- `prefers-reduced-motion: reduce` validado com assinatura completa estática e demais reveals visíveis.
- Movimento validado com 42 entradas acionadas uma vez e três superfícies ligadas ao progresso do scroll.
- Desktop mantém parallax em imagens e grandes superfícies; mobile mantém as entradas e remove o parallax contínuo.
- As animações novas usam apenas `transform`, `opacity`, `filter` e `clip-path`; não há `transition: all` nem transição de propriedades de layout.
- `prefers-reduced-motion: reduce` também foi validado sem elementos ocultos, transformados ou desfocados.
- O vídeo da hero permanece na horizontal: o card não usa rotação de entrada nem de scroll. Em 1440×1000 e 390×844 o ângulo medido foi 0° e não houve overflow horizontal.

## Escopo

- Nenhuma alteração em assinatura, migrations, cadastro, e-mail ou login.
- Nenhum commit ou push.
