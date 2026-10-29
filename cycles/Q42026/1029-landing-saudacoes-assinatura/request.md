# Cycle 1029b — Saudações na landing, telas de assinatura e campos sem "null"

**Tamanho:** Medium
**Origem:** pedido direto do usuário (29/10/2026), continuação do handoff da PR #89
**Branch:** `codex/landing-copy-layout`

## Pedido

1. Telas do Casca para contratação, retorno do checkout e troca de plano, na paleta `#0055A0`, `#008037`,
   `#F8B800` e off-white `#F5F3F0`. Regras de `lib/subscriptions`: Essencial R$ 99 / 50, Academia R$ 179 / 150,
   Evolução R$ 299 / 300. A mensalidade começa na adesão. O pagamento continua hospedado na AbacatePay.
2. Nenhum input, select ou textarea pode mostrar `null` como valor, placeholder ou nome acessível. Cada campo
   precisa de label válida. Busca no app inteiro.
3. Remover o texto pequeno acima dos títulos das seções da landing (`LpEyebrow`, "Como funciona",
   "Confiança para operar"). Manter os títulos.
4. Substituir a seção "Informação clara para cuidar da sua academia." por quatro saudações em SVG, no traço
   do soquinho: Jiu-jitsu (OSS), Muay Thai (SAWADEE), Taekwondo e boxe. Loop suave, impacto em `#F8B800`,
   pose pronta com `prefers-reduced-motion`.
5. Corrigir o corte de "Mensalidade com status." no soquinho.

## Decisões do usuário

- Taekwondo: só o gesto (reverência com punhos ao lado do corpo), sem palavra.
- Boxe: só o gesto (toque de luvas), sem palavra.

## Fora de escopo

- Webhook, migrations, cadastro, e-mail, login.
- Ligar enforcement ou trocar a AbacatePay para chaves de produção.
- Novo preço, trial ou plano.
- Commit, push ou merge sem pedido explícito.
