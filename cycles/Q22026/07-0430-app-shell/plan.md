# Plano — App shell (delta)

## Contexto

Com autenticação ativa, o professor precisa de um **chrome persistente** (sidebar desktop, drawer + **bottom navigation** em mobile, cabeçalho com marca e dados da academia, menu do utilizador), **rotas em pt-BR**, estado ativo de navegação e **proteção coerente** com **AUTH-**. O grupo de rotas Next.js continua a ser `app/(dashboard)/…`; os **URL paths** passam a refletir vocabulário em português.

## Respostas do refino (consolidado)

| # | Tema | Decisão |
|---|------|---------|
| 1 | URLs | Primeiro segmento em **pt-BR**: `/painel`, `/alunos`, `/mensalidades`, `/configuracoes`, `/perfil`. |
| 2 | Mobile | **Bottom navigation obrigatória** em `< lg`, além da top bar + drawer. |
| 3 | Perfil | Entrada **Perfil** no menu do utilizador → **`/perfil`**. |
| 4 | Cabeçalho | Manter **marca** “BJJ Manager” **e** exibir o **nome da academia** (`account.name`) quando o contexto multi-tenant estiver válido. |
| 5 | Estado inválido (**AUTH-6.1**) | **Não** redirecionar para `/login` (há sessão Auth válida). Manter **shell navegável**, mensagem **genérica** na área de conteúdo com orientação + contacto operacional, **sem** dados de negócio; **Sair** sempre acessível no cabeçalho. |
| 6 | Proteção | **Middleware** como **fonte única** de bloqueio para anónimos (lista de prefixos **SHELL-2**); o layout **não** duplica redirect para “não autenticado”. O layout obtém dados para o chrome via servidor quando aplicável. |
| 7 | Skeleton | **Sim**: skeleton cobre o **shell completo** (header + navegação + área principal) até hidratação do cliente onde necessário. |
| 8 | Tema | No **modo claro**, sidebar/header/hamburger usam **superfície suavizada** (tokens, não preto puro em todo o chrome); **modo escuro** e **layout responsivo** mantêm legibilidade e alvos de toque **≥ 44px** (**DS-1.3**, **SHELL-7.2**). |

## Delta em relação ao estado canônico atual

- **Antes:** destino e proteção centrados em **`/dashboard`**; layout mínimo sem sidebar/drawer/bottom-nav; **AUTH-2.x** e **SPEC-2.1** / **SPEC-5.1** falavam em `/dashboard`.
- **Depois:** entrada operacional em **`/painel`**; conjunto de prefixos autenticados em **SHELL-2**; redirecionamento legado **`/dashboard` → `/painel`** (**SHELL-5.3**); regras **SHELL-** em `spec/features/app-shell/readme.md`; **AUTH-2.1–2.3** alinhados; UI shell conforme identidade (preto/vermelho no tema escuro; suavização no claro).

## Implementação (referência para o ciclo)

| Área | Artefatos típicos |
|------|-------------------|
| Layout | `app/(dashboard)/layout.tsx` + componentes de shell em `components/layout/` (ou equivalente já existente) |
| Navegação cliente | Drawer/bottom-nav/lista desktop; estado do drawer **só no cliente**; **NavLink** ativo por `pathname` |
| Rotas | `app/(dashboard)/painel/page.tsx` (conteúdo atual do painel); stubs mínimos para `/alunos`, `/mensalidades`, `/configuracoes`, `/perfil` até ciclos de domínio |
| Auth HTTP | `lib/supabase/middleware.ts`: prefixos protegidos, redirects pós-login para `/painel`, `/dashboard` → `/painel` |
| Constantes | Um módulo partilhado (ex. `lib/routes.ts`) com paths canónicos para middleware e menus — **uma fonte de verdade** |

## Alinhamento com outros ciclos

- **08-0430-students-crud** e demais features devem usar **`/alunos/…`**, **`/mensalidades/…`**, **`/configuracoes/…`** conforme **SHELL-2** (atualizar requests/planos desses ciclos quando forem executados, se ainda listarem paths em inglês).
- **06-0430-authentication**: fluxos de login e `scenarios.feature` devem referir **`/painel`** como destino canónico (atualização de documentação/cenários neste commit ou no mesmo PR do shell).

## Fora de escopo

- Bibliotecas de navegação terceiras além de **Radix + Tailwind** (shadcn).
- Funcionalidade completa de alunos, mensalidades ou configurações (apenas shell + stubs se necessário).
- E2E obrigatório (opcional no ciclo; mínimo continua **lint + type-check** salvo decisão contrária no `tasks.md`).

## Riscos / notas

- Qualquer bookmark ou link externo a **`/dashboard`** deve continuar a funcionar via redirect (**SHELL-5.3**).
- Bottom-nav com quatro itens exige atenção a **overflow** e **rótulos** em viewports muito estreitos; manter **mobile-first** e testes manuais.

## Referências

- `cycles/Q22026/07-0430-app-shell/request.md`
- `spec/features/app-shell/readme.md`
- `spec/features/authentication/readme.md` (**AUTH-**)
- `spec/features/design-system/readme.md` (**DS-**)
