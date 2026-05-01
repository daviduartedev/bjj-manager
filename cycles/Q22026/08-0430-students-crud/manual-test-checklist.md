# Checklist de teste manual — Students CRUD (08-0430)

Use após `pnpm dev` com uma conta e base configuradas (`.env.local`, `pnpm db:apply`).

## Automatizado na CI / local

- `pnpm lint`
- `pnpm type-check`
- `pnpm test` (inclui **STU-4** e validação de formulário em `lib/students/plan-kind.test.ts`, `lib/validations/students.test.ts`)

## Plano / tipo (UI)

- [ ] Em **Novo aluno** ou **Editar ficha**, tipo **Adulto**: o select de plano **não** mostra planos Kids (ou submissão falha se forçado).
- [ ] Tipo **Kids**: planos **Kids 1 / Kids 2** apenas; **não** Adulto.

## Desativar aluno

- [ ] Na lista ou ficha, acção que define **Inativo** persiste e o filtro “Inativo” mostra o aluno.

## Paginação e ordenação

- [ ] Com mais alunos do que o tamanho de página (`lib/constants/students.ts`), a paginação muda de página sem perder filtros.
- [ ] Ordenação por nome / data de entrada / última alteração altera a ordem de forma coerente.

## Máscaras e CPF

- [ ] CPF, telefone e e-mail aplicam máscara ou formato esperado.
- [ ] CPF inválido mostra erro inline (mesmo comportamento coberto em teste unitário).

## RLS (outra conta)

- [ ] Com sessão da **Conta A**, copiar o UUID de um aluno da **Conta B** (se existir em ambiente de teste) e abrir `/alunos/<uuid>` ou `/alunos/<uuid>/editar`: deve resultar em **404** ou lista vazia, **sem** dados da Conta B na lista da Conta A.
