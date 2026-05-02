# Hub de especificação (Casca - Gestão de Academias de BJJ)

Documentação canônica de produto e domínio. Implementação e ciclos devem referenciar **regras numeradas** nos documentos abaixo.

## Produto e domínio

| Área | Caminho canônico | Cópia legível |
|------|------------------|---------------|
| Visão, MVP, personas, jornadas, métricas | [`spec/product/spec.md`](product/spec.md) | [`docs/product/spec.md`](../docs/product/spec.md) |
| Entidades e relações | [`spec/product/entities.md`](product/entities.md) | [`docs/product/entities.md`](../docs/product/entities.md) |
| Graduações (faixas, graus, pulos) | [`spec/product/graduation-rules.md`](product/graduation-rules.md) | [`docs/product/graduation-rules.md`](../docs/product/graduation-rules.md) |
| Planos e cobrança (manual) | [`spec/product/billing-rules.md`](product/billing-rules.md) | [`docs/product/billing-rules.md`](../docs/product/billing-rules.md) |

## Features rastreadas

- [`spec/features/product-specification/readme.md`](features/product-specification/readme.md) , ciclo de consolidação da documentação de produto (Q2 2026).
- [`spec/features/design-system/readme.md`](features/design-system/readme.md) , tokens, componentes de UI, layout e guia visual (Q2 2026).
- [`spec/features/marketing-landing/readme.md`](features/marketing-landing/readme.md) , landing pública e marketing (**ML-**, Q2 2026).
- [`spec/features/supabase-schema/readme.md`](features/supabase-schema/readme.md) , enums, tabelas multi-tenant, índices e seed de faixas/planos (Q2 2026).
- [`spec/features/rls-security/readme.md`](features/rls-security/readme.md) , RLS multi-tenant, função `public.current_account_id()`, políticas e validação (Q2 2026).
- [`spec/features/authentication/readme.md`](features/authentication/readme.md) , login, sessão SSR, rotas protegidas e destino `/painel` (Q2 2026).
- [`spec/features/app-shell/readme.md`](features/app-shell/readme.md) , layout autenticado, navegação, rotas pt-BR e chrome (**SHELL-**, Q2 2026).
- [`spec/features/students-crud/readme.md`](features/students-crud/readme.md) , lista, cadastro, ficha completa e edição rápida de alunos (**STU-**, Q2 2026).
- [`spec/features/student-profile/readme.md`](features/student-profile/readme.md) , perfil só leitura do aluno (**SPR-**, Q2 2026).
- [`spec/features/graduation-engine/readme.md`](features/graduation-engine/readme.md) , promoções, validação de ordem, histórico imutável (**GRD-**, Q2 2026).
- [`spec/features/date-duration-utilities/readme.md`](features/date-duration-utilities/readme.md) , idade, durações e formatos de data em pt-BR com fuso São Paulo (**DATE-**, Q2 2026).
- [`spec/features/plans-billing-model/readme.md`](features/plans-billing-model/readme.md) , provisão de planos, vínculo aluno–plano, preço efetivo e Server Actions de billing (**BLM-**, Q2 2026).
- [`spec/features/payments-billing-status/readme.md`](features/payments-billing-status/readme.md) , registo de pagamento, estorno simples, indicador derivado do mês e leitura em lote (**PBS-**, Q2 2026).
- [`spec/features/billing-ui/readme.md`](features/billing-ui/readme.md) , UI de mensalidades (`/mensalidades`), detalhe financeiro, lote e chrome premium (**BUI-**, Q2 2026).
- [`spec/features/dashboard/readme.md`](features/dashboard/readme.md) , painel operacional (`/painel`), KPIs e atenção do dia (**PNL-**, Q2 2026).
- [`spec/features/settings/readme.md`](features/settings/readme.md) , configurações da academia e perfil do professor (**CFG-**, Q2 2026).
- [`spec/features/security-e2e/readme.md`](features/security-e2e/readme.md) , verificação automatizada de segurança E2E/API e CI (**SECE2E-**, Q2 2026).

## Convenção de IDs de regra

- **SPEC-** , visão, escopo, métricas e identidade visual de alto nível (`spec.md`; **SPEC-10.x** = UI/tokens).
- **ENT-** , entidades (`entities.md`).
- **GR-** , graduação (`graduation-rules.md`).
- **BR-** , cobrança (`billing-rules.md`).
- **DS-** , design system, tokens e padrões de UI (`spec/features/design-system/readme.md`).
- **ML-** , landing pública e marketing (`spec/features/marketing-landing/readme.md`).
- **SEC-** , RLS e segurança no Postgres (`spec/features/rls-security/readme.md`).
- **AUTH-** , autenticação na aplicação e navegação autenticada (`spec/features/authentication/readme.md`).
- **SHELL-** , shell da área operacional, paths pt-BR e UX de navegação (`spec/features/app-shell/readme.md`).
- **STU-** , CRUD e lista de alunos (`spec/features/students-crud/readme.md`).
- **SPR-** , perfil só leitura do aluno (`spec/features/student-profile/readme.md`).
- **GRD-** , motor de graduação na app (`spec/features/graduation-engine/readme.md`).
- **DATE-** , utilitários de data/duração (`spec/features/date-duration-utilities/readme.md`).
- **BLM-** , modelo de planos e vínculo aluno–plano na app (`spec/features/plans-billing-model/readme.md`).
- **PBS-** , pagamentos e indicador de cobrança do mês (`spec/features/payments-billing-status/readme.md`).
- **BUI-** , telas de mensalidades e fluxo de registo em lote (`spec/features/billing-ui/readme.md`).
- **PNL-** , painel operacional (`spec/features/dashboard/readme.md`).
- **CFG-** , configurações (`/configuracoes`) e perfil (`/perfil`) (`spec/features/settings/readme.md`).
- **SECE2E-** , suíte Playwright, contratos HTTP de Route Handlers, anti-IDOR, anti-vazamento e integração CI com validação RLS quando disponível (`spec/features/security-e2e/readme.md`).

## Manutenção e rastreabilidade

1. **`spec/product/` e `docs/product/`** , altere sempre **os dois** no mesmo commit; confira com hash ou diff antes de finalizar.
2. **Ciclos de implementação** , em `plan.md`, `tasks.md`, mensagens de commit ou revisões, cite IDs **SPEC-**, **ENT-**, **GR-**, **BR-**, **DS-** quando a mudança decorrer de uma regra canônica.
