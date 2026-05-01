# Plano , Students CRUD (delta)

## Contexto

Primeira feature de domínio: o professor **cadastra**, **lista** e **ajusta** alunos com baixa fricção. Rotas alinhadas a **SHELL-2** (`/alunos/…`). Dados isolados por conta via RLS (**SEC-3.3**); a app **não** envia `account_id` do cliente , contexto no servidor (Supabase + sessão).

## Respostas do refino (consolidado)

| # | Tema | Decisão |
|---|------|---------|
| 1 | URLs | **pt-BR**: lista `/alunos`, cadastro `/alunos/novo`, edição completa `/alunos/[id]/editar`. Grupo Next.js pode permanecer `app/(dashboard)/…`. |
| 2 | Navegação secundária | **Sem breadcrumb dedicado no MVP**: em subpáginas, **link “Alunos”** (ou equivalente claro) para voltar à lista + **título** da página; lista só com **H1** “Alunos”. |
| 3 | Status na UI | **Trial** fora deste ciclo (sem filtro nem select). **Pausado** incluído com **Ativo** e **Inativo**. |
| 4 | “Remover” | **Sem DELETE físico** na UI deste ciclo: ação de saída operacional = **inativo** (`student_status = inactive`). |
| 5 | Primeira graduação | **Não** criar linha em `student_graduations` no cadastro , só campos atuais do aluno. |
| 6 | Plano vs tipo | **Impossível** escolher combinação inválida: planos filtrados por **`plan_kind`** coerente com **`student_kind`** (adulto ↔ `adult`; kids ↔ `kids_1` \| `kids_2`). |
| 7 | CPF / telefone / e-mail | **Máscaras** na UI quando preenchidos; validação **forte** onde aplicável (ex. CPF com dígitos verificadores). |
| 8 | Lista | **Paginação** (não scroll infinito); tamanho de página por **constante** partilhada (ex. `lib/constants/students.ts`), documentada em **STU-**. |
| 9 | Ordenação | Controlo na lista: **nome (A–Z)**, **data de entrada** (`academy_start_date`, nulos por último ou política explícita em **STU-**), **última alteração** (`updated_at`). |
| 10 | Edição rápida | A partir da lista, **diálogo ou sheet compacto** (“Edição rápida”) para campos **operacionais**: status (ativo / inativo / pausado), plano, dia de vencimento, faixa e grau atuais , mesmas regras de domínio que na ficha completa. **Nome, datas de vida/academia, documento, contactos e observações** ficam na **ficha completa** (`/alunos/[id]/editar`). |
| 11 | Erros | Mensagens **genéricas** para falhas de rede / permissão / servidor; detalhe de campo continua **inline** no formulário. |

## Delta em relação ao estado canônico atual

- **Antes:** `request.md` citava paths em inglês (`/students`); stub em `/alunos` sem CRUD; **ENT-4.1** não detalhava escopo de UI por ciclo.
- **Depois:** contrato **STU-** em `spec/features/students-crud/readme.md`; rotas canónicas `/alunos/novo`, `/alunos/[id]/editar`; lista com filtros, ordenação, paginação, edição rápida e máscaras; “eliminar” = **inativo**; sem trial na UI; sem seed de `student_graduations` no create.

## Implementação (referência para o ciclo)

| Área | Artefatos típicos |
|------|-------------------|
| Páginas | `app/(dashboard)/alunos/page.tsx`, `…/novo/page.tsx`, `…/[id]/editar/page.tsx` |
| Actions | `actions/students.ts`: `createStudent`, `updateStudent`, `setStudentStatus`, `deleteStudent` (semântica **desativar** → `inactive`), mais actions auxiliares para edição rápida se necessário |
| Validação | `lib/validations/students.ts` (Zod); graus por faixa conforme **GR-** (app; banco só bounds 0–6) |
| Rotas | Reutilizar / estender `lib/routes.ts` com helpers para `/alunos/novo` e edição |
| Supabase | Cliente servidor apenas; `account_id` implícito via RLS |

## Alinhamento com outros ciclos

- **07-0430-app-shell**: navegação já aponta para `/alunos`; subrotas devem manter item **Alunos** ativo (**SHELL-3.3**).
- **09-0430-date-duration-utilities**: idade na linha/card deve seguir **DATE-** (`calculateAge` + `today` injetável); não usar `parseISO`/`Date.now()` soltos para `birth_date`.
- **Perfil do aluno** (ciclo futuro): **sem** página de detalhe só leitura aqui.

## Fora de escopo

- Trial na UI; DELETE físico de `students`.
- Histórico de graduação no cadastro inicial.
- Exportação, portal do aluno.

## Riscos / notas

- **Ordenação por data de entrada** com valores `NULL`: definir ordem estável em **STU-** (evitar comportamento confuso).
- Edição rápida que altera faixa/grau **sem** linha em `student_graduations` pode divergir do ciclo de graduação até lá implementado , aceite para MVP com nota em **STU-**.

## Referências

- `cycles/Q22026/08-0430-students-crud/request.md`
- `spec/features/students-crud/readme.md` (**STU-**)
- `spec/features/app-shell/readme.md` (**SHELL-2**)
- `spec/features/rls-security/readme.md` (**SEC-3.3**)
- `spec/product/entities.md` (**ENT-4**, **ENT-7**)
- `db/schema.sql` (`students`, `student_plans`, `plans`, `belts`)
