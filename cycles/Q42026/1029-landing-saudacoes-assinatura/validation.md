# Validação

Data: 29/10/2026, servidor local `next dev`.

## Automática

- `npx tsc --noEmit`: sem erros.
- `npx next lint` nos arquivos alterados: sem avisos.
- `npx vitest run`: 636 de 637. A falha é `lib/brand/brand-guard.test.ts`, que lê os arquivos rastreados pelo
  git e não encontra `components/marketing/lp-trust.tsx`, apagado e ainda não commitado. Passa depois do
  commit da exclusão. Os arquivos novos não têm vermelho de marca.

## Navegador

- Landing 1440px: o título do soquinho ocupa até 723px de 984px; antes, a última linha passava 47px da caixa de
  728px e era cortada pelo recorte da animação.
- Landing 375px: sem rolagem horizontal; saudações em 2×2.
- Saudações: poses conferidas quadro a quadro (início, contato, reverência). Com as animações desligadas, que é
  o efeito da regra `prefers-reduced-motion` presente no CSS, aparece a pose pronta com o impacto e a palavra.
- Nenhum texto acima dos títulos; a seção `#seguranca` saiu; quatro figuras em `#cumprimentos`.
- `/login` e `/register`: nenhum campo com `null` como valor, placeholder ou nome.
- Assinatura: contratação, retorno pendente, retorno confirmado e troca de plano conferidos em rota temporária
  com dados de exemplo (apagada depois). Sem login, `quoteSubscriptionPlanChange` responde com erro e a tela
  mostra o texto padrão da troca. O valor proporcional real só aparece com uma conta autenticada.

## Não verificado

- Telas de assinatura com uma conta real e a AbacatePay sandbox.
- Páginas autenticadas do app com dados reais para os campos corrigidos (correção verificada no código).
