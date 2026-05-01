# Tarefas — Students CRUD (08-0430)

Checklist executável; citar **STU-**, **ENT-**, **SHELL-**, **SEC-** nos commits quando aplicável.

## Spec e documentação (obrigatório)

- [x] Garantir que `spec/features/students-crud/readme.md` reflete o estado acordado (**STU-**).
- [x] Atualizar `spec/README.md` (entrada da feature students-crud e convenção **STU-**).
- [x] Alinhar `spec/product/entities.md` e `docs/product/entities.md` (nota de UI: trial fora do ciclo 08; ver **ENT-4.1**).
- [x] Atualizar `cycles/Q22026/08-0430-students-crud/request.md` se ainda listar paths em inglês — referir **STU-** e rotas pt-BR.

## Rotas e constantes

- [x] Acrescentar em `lib/routes.ts` (ou módulo dedicado) paths **`/alunos/novo`**, **`/alunos/[id]/editar`** como constantes reutilizáveis por links e redirects.
- [x] Implementar páginas: lista `app/(dashboard)/alunos/page.tsx`, novo `…/alunos/novo/page.tsx`, editar `…/alunos/[id]/editar/page.tsx` (substituir stub atual da lista conforme **STU-**).

## Validação e actions

- [x] Criar `lib/validations/students.ts` (Zod): campos do pedido original + compatibilidade plano/tipo + graus por faixa (**GR-**); CPF/telefone/e-mail com regras pós-máscara.
- [x] Criar `actions/students.ts` com Server Actions: `createStudent`, `updateStudent`, `setStudentStatus`, `deleteStudent` (**desativar** → `inactive` apenas), leituras paginadas para a lista; cliente Supabase **só servidor**; nunca confiar em `account_id` do cliente.

## Lista

- [x] Busca por nome com **debounce** no cliente; filtros tipo (adulto / kids / todos), status (**ativo / inativo / pausado / todos** — sem trial).
- [x] **Paginação** server-driven com tamanho de página da constante documentada em **STU-7.2** (`lib/constants/students.ts`).
- [x] Controlo de **ordenação**: nome A–Z, data de entrada, última alteração (`updated_at`).
- [x] Card/linha: nome, faixa+grau, idade (ou “—” se sem data), status; layout responsivo (**lista em cards** em mobile).

## Formulários

- [x] Cadastro e ficha completa: React Hook Form + Zod; erros **inline**; **toast** de sucesso ao salvar.
- [x] Máscaras de input para **CPF**, **telefone**, **e-mail** (formato brasileiro razoável).
- [x] Selects de faixa filtrados por `kind` coerente com tipo de aluno; select de plano filtrado por **STU-4.3**.
- [x] **Empty state** com CTA “Cadastrar primeiro aluno” → `/alunos/novo`.

## Edição rápida

- [x] Na lista, ação que abre **Dialog ou Sheet** (“Edição rápida”) para: status, plano, dia de vencimento, faixa atual, grau atual — validação alinhada à ficha completa.
- [x] Ligação clara para **“Editar ficha completa”** no mesmo fluxo ou na linha.

## UX de erro e navegação

- [x] Mensagens **genéricas** para erro de rede, falha de permissão/RLS e erro de servidor; sem vazar detalhes internos.
- [x] Subpáginas: **voltar à lista** via link “Alunos” + título (**STU-1.2**).

## Qualidade

- [x] `pnpm lint` e `pnpm type-check` sem erros.
- [x] Teste manual: checklist em [`manual-test-checklist.md`](./manual-test-checklist.md); verificação automatizada (`pnpm lint`, `pnpm type-check`, `pnpm test`) executada; itens que exigem browser e segunda conta seguem no checklist para o operador.
