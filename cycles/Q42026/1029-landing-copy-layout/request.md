# Cycle 1029 — Copy e layout da landing do Casca

**Tamanho:** Medium
**Origem:** pedido direto do usuário (29/10/2026)

## Pedido

Reorganizar exclusivamente a landing pública do Casca para criar uma voz própria e coerente com a ideia
de produto: a plataforma brasileira para gestão de academias de artes marciais. A direção usa como
referências a especificidade de categoria do BJJLINK, a clareza operacional da AbacatePay e a brasilidade
cotidiana da MaisMei, sem copiar textos ou identidades.

## Decisões aprovadas

- Branch criada da `main` (`8e8dbe9`): `codex/landing-copy-layout`.
- Reorganização ampla, mas com uma página mais curta que a atual.
- Copy conversacional controlada, específica da rotina de academias brasileiras e sem slogans genéricos.
- CTAs contextuais: começar, ver como funciona, organizar a academia, escolher plano e criar academia.
- Paleta brasileira e disciplinada: um único verde forte para fundos verdes, azul institucional, amarelo
  como acento e superfícies brancas/neutras.
- A seção “Como funciona” vira um card contido, centralizado e com respiro lateral.
- O fechamento troca os dois emblemas decorativos por uma única composição da marca que se forma no
  scroll: emblema primeiro, assinatura depois.
- Remover a promessa de três dias de teste. A mensalidade é cobrada na adesão e pode ser cancelada.

## Fora de escopo

- Assinatura, AbacatePay, webhooks, migrations e regras de cobrança.
- Cadastro, confirmação de e-mail, login e recuperação.
- Alterações no produto autenticado.
- Novas dependências, commit, push ou arquivos em `.scratch/`.

## Validação obrigatória

- Type-check e testes relevantes da landing.
- Verificação visual local em desktop e mobile antes de encerrar.
- `prefers-reduced-motion` deixa a marca final visível, sem exigir animação.
