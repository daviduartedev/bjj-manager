# Tasks — Design system unificado com React Aria

## Cycle: 1022-react-aria-system

---

## Stage 1 — Fundação compartilhada e cadastro público

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 1.1 | Validar compatibilidade e fixar `react-aria-components` adequado à stack atual | `package.json`, `pnpm-lock.yaml` | `done` | React 19 peer deps, type-check e browser em Next 15 aprovados. |
| 1.2 | Definir primitives React Aria tokenizados para campos, botões, Select/ComboBox, Tabs e popover | `components/ui/`, `app/globals.css` | `done` | `components/ui/react-aria-controls.tsx`; galeria `/design-system`. |
| 1.3 | Aplicar alinhamento consistente de ações primária/secundária com CTA principal no fim do grupo | `components/ui/`, formulário de cadastro | `done` | Footer do wizard: voltar à esquerda e CTA à direita; estados disabled/loading. |
| 1.4 | Reordenar campos no `/register`: UF primeiro, municípios filtrados por UF; estados loading/error/empty/disabled e teclado | `app/(auth)/register/`, `lib/` | `done` | Endpoint IBGE; browser test validou seleção, busca, teclado e troca de UF. |
| 1.5 | Definir política de senha robusta segundo NIST atual, alinhar schema server-side/Supabase e oferecer orientação/medidor acessível | `lib/validations/academy-registration.ts`, `actions/register-academy.ts`, auth config | `done` | Mín. 15 chars, máximo 72 bytes, sem composição artificial; schema server-side e mensagem no form. |
| 1.6 | Testar fluxos e acessibilidade do cadastro em teclado e larguras mobile/desktop; atualizar evidências da stage | testes/e2e/cycle docs | `in_progress` | Smoke desktop local concluído; checklist humano e viewport mobile pendentes. |

---

## Stage 2 — Autenticação e configurações

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 2.1 | Migrar login, confirmação de e-mail e reenvio para os campos e ações canônicos | `app/(auth)/` | `pending` | — |
| 2.2 | Migrar formulários de configuração/perfil para os primitives comuns | `app/(dashboard)/configuracoes/`, componentes afetados | `pending` | — |
| 2.3 | Padronizar barras de ações, hovers, foco, estados ocupados e abas nos fluxos desta stage | mesmos arquivos | `pending` | — |
| 2.4 | Rodar regressão de auth/configuração e revisão a11y dos consumidores migrados | testes/cycle docs | `pending` | — |

---

## Stage 3 — Migração operacional e auditoria sistêmica

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 3.1 | Migrar controles e formulários de alunos/documentos/matrículas | `components/`, `app/(dashboard)/` | `pending` | — |
| 3.2 | Migrar controles e formulários de aulas/planos/financeiro | `components/`, `app/(dashboard)/` | `pending` | — |
| 3.3 | Migrar abas e menus residuais; registrar exceções justificadas | `components/ui/`, `components/`, `app/(dashboard)/` | `pending` | — |
| 3.4 | Auditar consumidores restantes e eliminar estilos duplicados de foco/tamanho quando estiverem em escopo | `app/`, `components/` | `pending` | — |
| 3.5 | Atualizar guia/spec-delta e galeria; lint, type-check, testes, build e auditoria responsiva/acessível | docs/spec-delta/testes | `pending` | — |

## Legenda

- `pending` — não iniciado
- `in_progress` — em andamento
- `done` — concluído com evidência
- `blocked` — bloqueado (registrar motivo)

---

> ⚠️ Executar uma stage por vez. Não avançar para a próxima sem aprovação humana explícita.
