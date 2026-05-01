# Tarefas , Perfil do aluno (10-0430)

Checklist executável; citar **SPR-**, **STU-**, **DATE-**, **BR-**, **GR-**, **SHELL-** nos commits quando aplicável.

## Spec e documentação (obrigatório)

- [x] Garantir que `spec/features/student-profile/readme.md` reflecte **SPR-** (estado actual).
- [x] Actualizar `spec/features/students-crud/readme.md` (**STU-1**, **STU-7** e tabela de implementação).
- [x] Actualizar `spec/features/app-shell/readme.md` (**SHELL-2**, exemplo de subrota do perfil).
- [x] Actualizar `spec/README.md` (entrada da feature **student-profile** e convenção **SPR-**).
- [x] Actualizar `cycles/Q22026/10-0430-student-profile/scenarios.feature` se **SPR-** mudar no decurso do ciclo (sem alterações necessárias nesta entrega).
- [x] Alinhar `spec/product/spec.md` apenas se **SPEC-5.2** ou rotas precisarem de nuance nova (mínimo , já alinhado no refino).

## Rotas e constantes

- [x] Acrescentar em `lib/routes.ts` (ou módulo existente) o path **`/alunos/[id]`** (helper `studentProfilePath(id)` ou equivalente).
- [x] Implementar `app/(dashboard)/alunos/[id]/page.tsx` como **Server Component** com carregamento de dados e **`notFound()`** quando o registo não existir para o tenant (**SPR-2**).

## Lista (integração **STU-7**)

- [x] **Clique principal** na linha/card navega para **`/alunos/[id]`** (respeitar teclado: linha focável ou link semântico).
- [x] **Acção secundária** explícita abre **edição rápida** (**STU-8**) sem navegar para o perfil.
- [x] Manter acesso à **ficha completa** conforme já previsto (ex.: link “Editar ficha” / ícone que leva a **`/alunos/[id]/editar`**).

## Perfil , UI e dados

- [x] Cabeçalho: nome, **placeholder** de avatar, badge faixa+grau, tipo (Adulto/Kids), status (rótulos **STU-3**), idade (**DATE-4**) (**SPR-3**).
- [x] Banner **GR-3** quando aluno **kids** com idade **≥ 16** anos (**SPR-4**).
- [x] Secções por tabs: **Dados pessoais** (inclui observações **uma vez**), **Graduação**, **Financeiro** , **sem** tab duplicada só para observações (**SPR-5**).
- [x] **Graduação:** resumo faixa/grau actual; tempos com **DATE-5** e regra **SPR-7.2** de `from`; histórico com datas **DATE-6**, justificativa se pulo (**ENT-5**); empty state se não houver linhas (**SPR-7**).
- [x] **Financeiro:** plano actual, preço (personalizado vs padrão **BR-2.2**), dia de vencimento; cartão do **mês corrente** com estados **BR-4** + **Atrasado** derivado **BR-4.3**; lista até **12** pagamentos recentes (**SPR-8**).
- [x] Botões: **Editar** → `/alunos/[id]/editar`; **Promover** e **Registrar pagamento** → modais placeholder (**SPR-9**).
- [x] Ligação **“← Alunos”** + título (**STU-1.2**).
- [x] Mobile: tabs horizontais com scroll; cards empilhados (**SPR-5.3**).

## Qualidade

- [x] `pnpm lint` e `pnpm type-check` sem erros.
- [x] Testes **Vitest** para funções puras novas (`graduation-current-since`, `payment-ui`).
- [ ] Teste manual: navegação lista → perfil → editar; edição rápida a partir da lista; 404 com UUID inválido; RLS (outra conta); banner kids 16+; mês sem linha em `payments` como **Pendente** na UI.
