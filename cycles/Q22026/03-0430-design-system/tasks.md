# Tarefas , Design system

## Spec e documentação (obrigatório)

- [x] Revisar `spec/features/design-system/readme.md` e manter regras **DS-** alinhadas à implementação final.
- [x] Garantir que `docs/design/style-guide.md` reflete paleta, tokens, toast sem raio e diretrizes mobile/a11y.
- [x] Confirmar **SPEC-10.x** em `spec/product/spec.md` e espelho em `docs/product/spec.md`.
- [x] Atualizar `spec/README.md` (feature rastreada + convenção **DS-**).

## Dependências

- [x] Instalar pacotes Radix ausentes necessários aos componentes shadcn escolhidos (separator, checkbox, avatar, tooltip, etc., conforme gerados).
- [x] Adicionar **`sonner`** e integrar `<Toaster />` com estilo **sem border-radius** nos toasts.

## Tokens e estilos globais

- [x] Ajustar `.badge-pending` (e correlatos se preciso) para **não** usar hex/hsl soltos fora de variáveis; introduzir token em `:root` se necessário (**DS-** / guia).
- [x] Revisar paridade **claro / escuro** para superfícies e badges de status usados na demo.

## `components/ui/`

- [x] Adicionar ou alinhar: `dialog`, `dropdown-menu`, `select`, `tabs`, `separator`, `skeleton`, `textarea`, `checkbox`, `form`, `table`, `avatar`, `tooltip` (+ dependências internas habituais do shadcn: `popover`, etc.).
- [x] Integrar **Sonner** (substituir ou conviver com `@radix-ui/react-toast` apenas se necessário , preferir uma única API documentada no guia).

## `components/layout/`

- [x] Implementar `PageHeader`, `Section`, `EmptyState` conforme **DS-** e guia.

## App

- [x] Criar rota `app/design-system/page.tsx` (e layout local se útil) com seções: tokens/tipografia/cores, badges de status (paid/pending/overdue/info), componentes listados, estados loading/vazio/erro de exemplo.
- [x] Garantir **404 em produção** para `/design-system` via **`middleware.ts`** (bloqueio em runtime; em dev a rota segue acessível).
- [x] Demonstração **tema escuro**: alternância ou blocos claro/escuro sem dependência obrigatória de `next-themes` (estado local + classe `.dark` em contêiner).

## Qualidade

- [x] Ajustar tamanhos mínimos de alvo (**≥ 44px**) nos componentes base conforme guia.
- [x] `pnpm lint` e `pnpm type-check` sem erros.

## Manual (aceite)

- [ ] Em dev, abrir `/design-system` e validar foco visível, contraste básico e consistência com **DS-**/guia.
