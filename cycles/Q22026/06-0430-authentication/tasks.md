# Tarefas — 06-0430-authentication

Checklist para execução do ciclo. Ordem sugerida de cima para baixo.

## Especificação (obrigatório)

- [x] Confirmar que `spec/features/authentication/readme.md`, `spec/README.md`, `spec/product/spec.md`, `docs/product/spec.md` e `spec/product/entities.md` refletem o escopo **login-only** e o destino **`/dashboard`** (este refinamento já deve estar aplicado; rever antes de merge).

## App — rotas e proteção

- [x] Introduzir área **`/dashboard`** (ex.: `app/(dashboard)/…` com `page.tsx` em `/dashboard`) com conteúdo mínimo coerente com **SPEC-2.7** até o ciclo de shell/UI rico.
- [x] Atualizar **`middleware.ts`** (e/ou `lib/supabase/middleware.ts`): proteger prefixo `/dashboard` (e preparar matcher para futuras rotas autenticadas); redirecionar anónimos para `/login`; redirecionar autenticados de `/login` para `/dashboard`.
- [x] Remover fluxo de **registo** do MVP: tirar links “Criar conta” / `/register` da landing e do login; definir comportamento único para `/register` (**redirect 307 → `/login`** ou **404** — igual ao documentado em **AUTH-1.2** no readme da feature).
- [x] Garantir que o login, após sucesso, faz **`router.push('/dashboard')`** (ou equivalente server-side) e **não** apenas `/`.

## Auth helpers e validação

- [x] Adicionar **`lib/auth.ts`**: `getCurrentUser()`, `getCurrentAccount()` usando cliente Supabase servidor + consultas a `profiles` / `accounts` com RLS.
- [x] Adicionar **`lib/validations/auth.ts`** (Zod) para credenciais de login; usar no formulário (react-hook-form + resolver ou validação antes do submit).
- [x] Implementar **`signOut`** (Server Action ou fluxo server-safe) e ponto de UI para sair no dashboard quando o shell existir (se ainda não houver shell, tarefa pode ser “botão mínimo” no stub).

## UX e erros

- [x] Mensagens de erro: mapear códigos/mensagens Supabase para **pt-BR**; exibir com **Sonner** (`toast`) de forma consistente.
- [x] Login **mobile-first**, botão com estado de loading (já parcialmente presente — alinhar com validação Zod).

## Documentação operacional

- [x] Verificar que [`docs/security/rls.md`](../../../docs/security/rls.md) continua a ser a fonte do bootstrap manual; se o caminho do dashboard mudar na doc de utilizador, atualizar referências.

## Verificação

- [x] `pnpm lint` e `pnpm type-check`.
- [ ] Teste manual: anónimo não abre `/dashboard`; login válido chega ao dashboard; credenciais inválidas mostram toast em português; sessão autenticada em `/login` redireciona para `/dashboard`.
