# Design System

## Context
A paleta e os primitives mínimos do shadcn/ui já foram aplicados no
ciclo de bootstrap. Para os ciclos de UI seguintes (auth, app shell,
students, dashboard, billing) temos que padronizar tipografia,
componentes restantes do shadcn, padrões de layout e estados (loading,
vazio, erro). Este é o material que evita inconsistência visual nas
próximas features.

## Intent
- Componentes shadcn adicionais em `components/ui/`:
  `dialog`, `dropdown-menu`, `select`, `tabs`, `toast`, `separator`,
  `skeleton`, `textarea`, `checkbox`, `form` (RHF + Zod), `table`,
  `avatar`, `tooltip`.
- Componentes de layout em `components/layout/`:
  `PageHeader`, `Section`, `EmptyState`.
- Página `/design-system` (rota dev) demonstrando tokens, tipografia,
  cores, badges (paid/pending/overdue/info) e todos os componentes.
- Documento `docs/design/style-guide.md` com regras de uso da paleta
  (preto = identidade, vermelho = ação primária, off-white = fundo,
  verde/azul/amarelo = detalhes).

## Taste / Constraints
- Mobile-first; touch targets ≥ 44px.
- Estados de foco visíveis (acessibilidade).
- Sem cores fora dos tokens em CSS hardcoded.
- Visual: limpo, profissional, marcial. Nunca colorido demais.
- Tipografia base Inter; títulos com `tracking-tight`.
- Não adicionar componentes que nenhum ciclo do MVP vá consumir.

## References
- `app/globals.css` (tokens já aplicados).
- `tailwind.config.ts` (paleta `bjj.*`).
- Briefing , seção "Identidade visual" e "Diretrizes visuais".

## Attachments
- (nenhum)
