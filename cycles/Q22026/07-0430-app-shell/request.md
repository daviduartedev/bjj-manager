# App Shell

## Context
Com auth funcionando, o usuário precisa de um esqueleto visual
autenticado: sidebar (desktop), navegação inferior ou drawer (mobile),
header com nome da academia e menu do usuário, e proteção real das
rotas em `(dashboard)`. Esse shell hospeda todas as features
seguintes (students, billing, dashboard, settings).

## Intent
- Layout `app/(dashboard)/layout.tsx` autenticado.
- Sidebar desktop (≥ lg) com itens:
  - Dashboard, Alunos, Mensalidades, Configurações.
- Mobile (< lg): top-bar com botão de menu → drawer com a mesma
  navegação; opcionalmente uma bottom-nav curta.
- Header com nome da academia (do `account.name`) e dropdown do
  usuário (perfil, sair).
- Componente `<NavLink>` ativo conforme `pathname`.
- Proteção de rotas: `(dashboard)/*` redireciona para `/login` se não
  autenticado.
- Skeleton de loading para o shell durante hidratação.

## Taste / Constraints
- Sidebar/header em **preto** (identidade); ícones em branco; ativo
  marcado em **vermelho**.
- Mobile-first; drawer abre em < 250ms.
- Touch targets ≥ 44px.
- Sem bibliotecas extras de navegação , só Radix + Tailwind.
- Estado do drawer no client; nada de server roundtrip para abrir
  menu.

## References
- `cycles/Q22026/06-0430-authentication/request.md`
- `cycles/Q22026/03-0430-design-system/request.md`
- Briefing , seção "Estrutura esperada".

## Refino (produto)

Decisões registadas em `plan.md` deste ciclo: URLs pt-BR (**`/painel`**, **`/alunos`**, etc.), bottom-nav obrigatória em mobile, **`/perfil`** no menu do utilizador, marca + nome da academia no cabeçalho, tratamento **AUTH-6.1** sem redirect para login, proteção só no middleware, skeleton de shell completo, chrome suavizado no tema claro.

## Attachments
- (nenhum)
