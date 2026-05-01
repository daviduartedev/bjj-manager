# Students CRUD

## Context
A primeira feature de domínio: cadastrar e listar alunos. Tudo que vem
depois (perfil, graduação, financeiro) depende desta base. O professor
precisa adicionar alunos em poucos cliques e encontrar rapidamente um
aluno na lista.

## Intent
- Rotas canónicas (**SHELL-2**, **STU-1**):
  - `app/(dashboard)/alunos/page.tsx` — lista.
  - `app/(dashboard)/alunos/novo/page.tsx` — formulário de cadastro.
  - `app/(dashboard)/alunos/[id]/editar/page.tsx` — ficha completa.
- Server Actions em `actions/students.ts`:
  `createStudent`, `updateStudent`, `setStudentStatus`,
  `deleteStudent`.
- Validações Zod em `lib/validations/students.ts`.
- Lista com:
  - busca por nome (debounced),
  - filtro por tipo (Adulto / Kids / Todos),
  - filtro por status (Ativo / Inativo / Pausado / Todos; **sem trial** na UI — **STU-3**),
  - ordenação (nome A–Z, data de entrada, última alteração),
  - paginação com tamanho de página por constante (**STU-7**),
  - edição rápida (dialog/sheet) para campos operacionais (**STU-8**).
- Card/linha de aluno com nome, faixa+grau, idade, status.
- Formulário com campos:
  - obrigatórios: nome, data de nascimento, data de entrada, tipo,
    faixa inicial, grau inicial, plano, dia de vencimento;
  - opcionais: CPF, telefone, e-mail, observações.
- Selects de faixa filtrados pelo `kind` (adulto/kids).

## Taste / Constraints
- React Hook Form + Zod no formulário.
- Erros inline; toast de sucesso ao salvar.
- Empty state amigável quando lista vazia, com CTA "Cadastrar primeiro
  aluno".
- Não criar tela de "ver detalhes" aqui — isso é o ciclo de Profile.
- Server Actions usam o `supabase server client`; nunca passar
  `account_id` do cliente — RLS com `public.current_account_id()` (**STU-2**).
- `deleteStudent` **desativa** o aluno (`inactive`), sem DELETE físico (**STU-3.3**, **STU-9**).
- Plano só pode combinar com tipo de aluno conforme **STU-4**; CPF/telefone/e-mail com máscaras (**STU-6**).
- Mobile: lista vira card vertical; formulário em colunas únicas.

## References
- `cycles/Q22026/08-0430-students-crud/plan.md` — delta após refino.
- `spec/features/students-crud/readme.md` — **STU-** (fonte canónica pós-refino).
- `cycles/Q22026/04-0430-supabase-schema/request.md`
- `cycles/Q22026/05-0430-rls-and-security/request.md`
- `cycles/Q22026/07-0430-app-shell/request.md`
- `lib/validations/` (pasta já existe).

## Attachments
- (nenhum)
