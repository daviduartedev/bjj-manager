# Notas de implementacao — 1029

Base `f1047a1`. Branch `codex/assinaturas-admin-casca`. Nenhuma migration foi aplicada. Nenhum push.

## Evidencia local (2026-10-29)

- `pnpm exec tsc --noEmit` passou.
- `pnpm exec vitest run` — 97 arquivos, 633 testes, todos passando.
- Testes focados de assinatura, e-mail, admin, cadastro e recuperacao de senha cobrem checkout, webhook, limites, cancelamento, upgrade proporcional, downgrade, admin, lembrete e callback fixo de senha.

## Pendencias externas (nao feitas nesta execucao)

- Aplicar migrations 048–052 em homologacao, nunca via `pnpm db:apply` indiscriminado em producao.
- Configurar AbacatePay, Resend/SMTP, `CASCA_PLATFORM_ADMIN_USER_ID`, webhook HTTPS e job de notificacoes. Ver `activation-checklist.md`.
- Isentar explicitamente as duas academias reais antes de ligar `enforcement_enabled`.

## Observacao de agrupamento

Cancelamento e troca de plano vivem no mesmo modulo de `lib/subscriptions` que a contratacao. O commit de T1 inclui esses fluxos porque compartilham servico, repositorio e painel.
