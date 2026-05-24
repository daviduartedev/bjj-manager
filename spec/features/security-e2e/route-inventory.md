# Inventário de rotas (baseline — ciclo SECE2E)

Gerado a partir da estrutura `app/**` e `lib/routes.ts`. Actualizar quando entrarem novas páginas ou Route Handlers.

| Caminho | Classificação | Notas |
|---------|----------------|-------|
| `/` | Pública | Landing (`LandingPage`). |
| `/login` | Pública | Entrada (**AUTH-**). |
| `/register` | Pública → redirect | Middleware redirecciona anónimos para `/login` (**AUTH-1.2**). Autenticado → `/painel`. |
| `/painel` | Privada | **SHELL-2**, **PNL-**. |
| `/alunos` | Privada | Lista (**STU-**). |
| `/alunos/novo` | Privada | Criação. |
| `/alunos/[id]` | Privada dinâmica | Perfil só leitura (**SPR-**). |
| `/alunos/[id]/editar` | Privada dinâmica | Edição. |
| `/mensalidades` | Privada | **BUI-**. |
| `/mensalidades/[studentId]` | Privada dinâmica | Detalhe financeiro (**BUI-**). |
| `/configuracoes` | Privada | **CFG-**. |
| `/perfil` | Privada | **CFG-** / utilizador. |
| `/documentos` | Privada | **DOC-** lista global. |
| `/documentos/[documentId]` | Privada dinâmica | **DOC-** detalhe (signed URL via Server Action). |
| `/pedagogico/planos` | Privada | **PED-** lista. |
| `/pedagogico/planos/novo` | Privada | **PED-** criação. |
| `/pedagogico/planos/[id]` | Privada dinâmica | **PED-** detalhe (read-only + acções). |
| `/pedagogico/planos/[id]/editar` | Privada dinâmica | **PED-** editor (cria nova revisão). |
| `/dashboard` | Legado → redirect | `/painel` (**SHELL-5.3**). |
| `/aulas` | Privada (operacional) | Hub sessões próximas (**SPT-6.1**, Fase 2). |
| `/aulas/turmas` | Privada (operacional) | CRUD turmas. |
| `/aulas/turmas/nova` | Privada (operacional) | Criar turma. |
| `/aulas/turmas/[classId]` | Privada dinâmica | Editar turma, recorrência, inscrições. |
| `/aulas/sessao/[sessionId]` | Privada dinâmica | Check-ins da sessão (polling). |
| `/portal` | Privada (student) | Home aluno (**SPT-**, **AUTH-8**). |
| `/portal/aulas` | Privada (student) | Listagem e check-in (**SPT-5**, **SPT-7**). |
| `/portal/loja` | Privada (student) | Placeholder Fase 3. |
| `/portal/financeiro` | Privada (student) | PIX placeholder (**SPT-9**). |
| `/portal/onboarding` | Privada (student) | Onboarding Fase 1. |
| `/design-system` | Pública (dev) / 404 (prod) | `middleware.ts` bloqueia em produção. |
| `app/api/**` | — | **Nenhum Route Handler** presente no repositório; superfície HTTP de escrita/leitura dominada por **Server Actions** e cliente Supabase com RLS. |

### Discrepâncias vs documentação

- **SHELL-2** menciona subrotas como graduações em `/alunos/[id]/graduacoes`; neste snapshot **não** existe `page.tsx` correspondente — inventário reflecte apenas rotas existentes.
