# Cycle 1008 — Vídeo-promo Remotion da landing

**Tamanho:** Medium
**Origem:** pedido direto do usuário (08/10/2026)

## Pedido

Deixar o vídeo Remotion da seção "O sistema rodando" da landing mais moderno, robusto e fiel ao estilo
do vídeo de produto do site https://www.ranklayer.app/pt. Deve haver **cliques e preenchimentos**
acontecendo; o vídeo deve funcionar como um vídeo-promoção do produto.

Antes de começar: atualizar localmente `main`/`develop` com o remoto (feito: `main` já igual a
`origin/main`; não existe `develop` local, `origin/develop` está 23 commits atrás da `main`).

## Decisões (aprovadas)

- Abordagem: **recriar as telas como UI animada em React/Remotion** (sem prints estáticos).
- ~45s, 30fps, 1920×1080, loop.
- Cenas: abertura → cadastro de aluno → graduação → mensalidades → painel → documentos/WhatsApp → encerramento.
- Cursor animado, ripple de clique, digitação com caret, modais, contadores, câmera com zoom/pan.
- Lista de capacidades à direita do player passa a navegar o vídeo (seek por cena) e destaca a cena ativa.
- `prefers-reduced-motion`: quadro estático representativo.

## Fora de escopo

- Outras seções da landing, produto autenticado, novas dependências, commits/push.

## Impacto em testes

`lib/marketing/landing-photos.test.ts` proibia legendas/labels dentro da composição Remotion
(decisão do design anterior baseado em prints). O novo design usa legendas por cena e UI recriada;
o teste é atualizado para refletir isso (mantém: sem `<h1-6>` na composição, sem fotos AI banidas,
região `lp-system-video`, textos da coluna direita).
