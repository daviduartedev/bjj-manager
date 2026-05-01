# Project Bootstrap

## Context
Estamos iniciando o Casca - Gestão de Academias de BJJ — um SaaS para professores de jiu-jitsu
gerenciarem alunos, graduações e mensalidades. Antes de qualquer feature
de negócio, precisamos do esqueleto técnico do projeto: app Next.js
moderno, dependências, tema, helpers Supabase, estrutura de pastas e a
pasta `/cycles` documentada. Este ciclo entrega base para todos os
demais.

## Intent
- Projeto Next.js (App Router) com TypeScript e ESLint.
- Tailwind CSS configurado.
- shadcn/ui configurado (`components.json`, primitives base).
- Supabase client/server/middleware helpers.
- `middleware.ts` global revalidando sessão (sem proteção ainda).
- Tema visual com a paleta BJJ aplicada em `globals.css` e
  `tailwind.config.ts`.
- Layout raiz e landing mínima de demonstração da paleta.
- Estrutura de pastas conforme briefing (`/app`, `/components`, `/lib`,
  `/actions`, `/db`, `/cycles`).
- `.env.example` documentado.
- `README.md` raiz.
- `cycles/README.md` explicando o workflow spec-driven.

## Taste / Constraints
- Stack obrigatória: Next.js App Router, TypeScript, Tailwind, shadcn/ui,
  Supabase (`@supabase/ssr`), Zod, React Hook Form, date-fns,
  lucide-react.
- Paleta:
  - preto `#050505`, branco `#FFFFFF`, off-white `#F5F3F0`,
    vermelho `#BF1E27`, verde `#1D8B32`, azul `#1E5AA8`,
    amarelo `#F4C542`, cinza texto `#3A3A3A`, cinza borda `#E5E2DC`.
- Mobile-first; visual limpo, profissional, marcial; nada poluído.
- Branch única (`develop` ou `main`). Sem feature branches.
- Nada de feature de negócio neste ciclo. Apenas base.

## References
- Briefing original do projeto.
- `cycles/README.md` (workflow spec-driven).
- `.env.example` (variáveis Supabase).

## Attachments
- (sem anexos visuais por enquanto)
