# Tarefas — App shell (07-0430)

Checklist executável; citar **SHELL-** / **AUTH-** / **DS-** nos commits quando aplicável.

## Spec e documentação (obrigatório)

- [x] Garantir que `spec/features/app-shell/readme.md` reflete o estado acordado (**SHELL-**).
- [x] Atualizar `spec/README.md` (entrada da feature app-shell).
- [x] Atualizar `spec/features/authentication/readme.md` (**AUTH-2.x**, tabela de artefatos) para **`/painel`** e prefixos **SHELL-2**.
- [x] Atualizar `spec/product/spec.md` e **`docs/product/spec.md`** (**SPEC-2.1**, **SPEC-5.1**: entrada **`/painel`**; manter vocabulário “dashboard” no produto onde for conceito, não URL).
- [x] Atualizar `docs/security/rls.md` (fluxo manual pós-login → **`/painel`**).
- [x] Atualizar `cycles/Q22026/06-0430-authentication/scenarios.feature` (comentário + passos que citam URL do dashboard → **`/painel`**).
- [x] Rever `README.md` na raiz (estrutura / exemplos de paths) se ainda listarem **`/dashboard`** como URL principal.
- [x] Rever `middleware.ts` comentário de topo (prefixos protegidos, não só `/dashboard`).

## Rotas e middleware

- [x] Introduzir paths canónicos **pt-BR** (`/painel`, `/alunos`, `/mensalidades`, `/configuracoes`, `/perfil`) com fonte única (ex. `lib/routes.ts`).
- [x] Ajustar `lib/supabase/middleware.ts`: proteger todos os prefixos **SHELL-2**; pós-login e sessão em `/login` → **`/painel`**; redirect **`/dashboard` → `/painel`** (preservar cookies da sessão ao redirecionar).
- [x] Mover o conteúdo atual da home operacional de `app/(dashboard)/dashboard/` para **`app/(dashboard)/painel/`** (e metadata/título em pt-BR coerente com “Painel”).
- [x] Atualizar `app/(auth)/login/login-form.tsx` (e qualquer outro `router.push` / redirect) para **`/painel`**.
- [x] Criar páginas stub mínimas (ou placeholders alinhados ao DS) para rotas sem ciclo de domínio ainda, para **NavLink** e bottom-nav não apontarem para 404.

## Shell de UI

- [x] Implementar `app/(dashboard)/layout.tsx` com: sidebar **≥ lg**; **< lg**: header com botão que abre **drawer** + **bottom navigation** obrigatória com os mesmos destinos principais (Painel, Alunos, Mensalidades, Configurações).
- [x] Cabeçalho: marca **Casca - Gestão de Academias de BJJ** + nome da academia quando `getCurrentAccount()` resolver; fallback discreto quando não houver nome (sem quebrar **AUTH-6.1**).
- [x] Menu do utilizador: **Perfil** → `/perfil`, **Sair** (reutilizar padrão já existente do projeto).
- [x] Componente **NavLink** (ou equivalente) com estado ativo por **`pathname`** (incluindo subrotas, ex. `/alunos/novo`).
- [x] Estilo: ícones claros no chrome escuro; item ativo em **vermelho**; no **tema claro**, sidebar/header/hamburger **suavizados** via tokens (**SHELL-7.1**, **SHELL-7.2**, **DS-1.x**).
- [x] Alvos de toque **≥ 44px** nos controlos do shell (**DS-1.3**).
- [x] Skeleton de **shell completo** durante hidratação onde o layout depender de cliente para navegação.

## Qualidade

- [x] `pnpm lint` e `pnpm type-check` sem erros.
- [ ] Teste manual: anónimo não abre prefixos **SHELL-2**; **`/dashboard`** vai para **`/painel`** (**SHELL-5.3**); login válido chega ao **`/painel`**; drawer abre sem round-trip ao servidor; bottom-nav visível em mobile; tema claro com chrome suavizado.
