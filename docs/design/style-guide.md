# Guia de estilo , Casca - Gestão de Academias de BJJ

Referência para implementação de UI. Regras numeradas canônicas: **DS-** em [`spec/features/design-system/readme.md`](../../spec/features/design-system/readme.md).

## Identidade e paleta

- **Preto (`bjj.black` / `--secondary`)** , identidade, superfícies fortes, contraste com texto claro.
- **Vermelho (`bjj.red` / `--primary`)** , ação primária e destaque; uso disciplinado para não poluir a tela.
- **Off-white (`bjj.off` / `--background`)** , fundo principal no tema claro; sensação de papel/canvas de academia.
- **Verde / azul / amarelo** , **detalhes e status** (pagamento, alertas informativos, pendências), não como decoração de grandes áreas.

Princípio: interface **sóbria e marcial**, com **acentos cromáticos** mais expressivos na área autenticada quando derivados de **tokens** , ver **DS-1.11** e **SPEC-10.4** (gradientes subtis, hierarquia de cartões, navegação activa legível); evitar **hex soltas** e composições sem contraste.

## Tokens

- Preferir variáveis CSS (`--background`, `--foreground`, `--primary`, `--status-*`, etc.) e classes Tailwind mapeadas nelas.
- A paleta literal `bjj.*` no `tailwind.config.ts` existe para referência e casos pontuais; novas telas devem **preferir** o sistema semântico (`bg-background`, `text-foreground`, `bg-primary`, …).

## Tipografia

- Família única: **IBM Plex Sans** (via `next/font` em `app/layout.tsx`, variável `--font-sans`); fallbacks em `tailwind.config.ts`. Adequada a **painéis / CRM**, boa legibilidade em **pt-BR** (`latin-ext`).
- Corpo: **15px** por defeito (`text-crm-base` no `body` em `globals.css`); escala auxiliar `crm-xs` … `crm-lg` no Tailwind.
- Títulos: peso hierárquico; **tracking fechado** (`tracking-tight`); preferir utilitários **`.type-page-title`**, **`.type-section-title`**, **`.type-card-heading`** em vez de repetir classes em cada rota.
- Rótulos de formulário e filtros: **`.type-field-label`**; metadados em maiúsculas: **`.type-meta-label`**; parágrafos descritivos: **`.type-lead`**.

## Tema claro e escuro

- O produto mantém **dois temas** com tokens em `:root` e `.dark`.
- Ao construir telas, validar contraste em **ambos** (texto sobre fundo, cartões, bordas).
- Estados financeiros (badges Pago / Pendente / Atraso / Info) devem permanecer **legíveis** nos dois temas.

## Componentes e layout

- **shadcn/ui** em `components/ui/`: ponto único para primitivos (botões, campos, diálogos, menus, tabelas, etc.).
- **Layout** em `components/layout/`: `DashboardPageHero`, `DashboardPanel`, `DashboardBackLink`, `DashboardStatTile` nas rotas autenticadas (hero + painéis como `/alunos`); `PageHeader`, `Section`, `EmptyState` onde ainda fizer sentido (ex.: galeria).

## Estados de interface

- **Carregamento:** `skeleton` ou equivalente; evitar páginas totalmente vazias sem feedback.
- **Vazio:** `EmptyState` com mensagem clara e ação sugerida quando fizer sentido.
- **Erro:** mensagem compreensível ao professor; ação de recuperação quando aplicável.

## Toasts (Sonner)

- Stack moderna com **Sonner**.
- **Cantos retos** (sem `border-radius`) nos toasts, alinhado à decisão visual deste projeto.
- Mensagens curtas, pt-BR.

## Acessibilidade e toque

- **Foco visível** em teclado (anel consistente com o tema).
- Alvos de toque **≥ 44px** em controles principais em layouts mobile-first.

## Onde validar

- Em **desenvolvimento**, rota `/design-system` agrega exemplos de tokens, badges e componentes. Em **produção**, o middleware responde **404** nesse caminho.
