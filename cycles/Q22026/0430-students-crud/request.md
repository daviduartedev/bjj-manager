# Students CRUD

## Context
A primeira feature de domínio: cadastrar e listar alunos. Tudo que vem
depois (perfil, graduação, financeiro) depende desta base. O professor
precisa adicionar alunos em poucos cliques e encontrar rapidamente um
aluno na lista.

## Intent
- Rotas:
  - `app/(dashboard)/students/page.tsx` — lista.
  - `app/(dashboard)/students/new/page.tsx` — formulário de cadastro.
  - `app/(dashboard)/students/[id]/edit/page.tsx` — edição.
- Server Actions em `actions/students.ts`:
  `createStudent`, `updateStudent`, `setStudentStatus`,
  `deleteStudent`.
- Validações Zod em `lib/validations/students.ts`.
- Lista com:
  - busca por nome (debounced),
  - filtro por tipo (Adulto / Kids / Todos),
  - filtro por status (Ativo / Inativo / Todos),
  - paginação ou scroll com `limit` configurável.
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
  `account_id` do cliente — tirar do `auth.account_id()`.
- Mobile: lista vira card vertical; formulário em colunas únicas.

## References
- `cycles/Q22026/0430-supabase-schema/request.md`
- `cycles/Q22026/0430-rls-and-security/request.md`
- `cycles/Q22026/0430-app-shell/request.md`
- `lib/validations/` (pasta já existe).

## Attachments
- (nenhum)
