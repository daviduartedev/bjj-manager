# Tarefas , Billing UI (14-0430-billing-ui)

## Spec e contratos

- [x] Actualizar **`spec/features/billing-ui/readme.md`** com IDs **BUI-** completos (lista, detalhe, diálogo, lote, meses históricos, UX premium referenciada).
- [x] Actualizar **`spec/features/payments-billing-status/readme.md`** (método opcional **PBS-4**).
- [x] Actualizar **`spec/features/app-shell/readme.md`** (subrotas mensalidades, sidebar preta).
- [x] Actualizar **`spec/features/design-system/readme.md`** (**DS-1.12**).
- [x] Actualizar **`spec/features/student-profile/readme.md`** (**SPR-9.3**, integração com mensalidades).
- [x] Actualizar **`spec/features/supabase-schema/readme.md`** e **`db/schema.sql`** + migração aplicável (`payment_method`).
- [x] Actualizar **`spec/product/entities.md`** e espelho **`docs/product/entities.md`** (**ENT-8**).
- [x] Actualizar **`spec/README.md`** com link para billing-ui.

## Base de dados

- [x] Adicionar coluna **`payment_method`** (text, nullable) em `payments`; políticas RLS sem mudança de escopo.

## Domínio e actions

- [x] Estender **`recordPayment`** / schemas Zod para aceitar **`paymentMethod`** opcional e persistir na coluna.
- [x] Implementar **`recordPaymentsBulk`**: entrada com lista de `studentId`, `referenceMonth`, `paidAt` opcional partilhado; por aluno mesma regra que registo único; devolver resumo (sucesso / falhas por aluno em mensagem agregada ou toast múltiplo , definir na implementação conforme **BLM-3**).
- [x] Garantir **`revalidatePath`** para `ROUTES.mensalidades`, lista de alunos, perfil do aluno e painel após registo e estorno.

## UI , Mensalidades

- [x] Substituir placeholder de **`/mensalidades`**: selector de mês (default mês actual), filtros (Todos / Pago / Pendente / Atrasado / Bolsista / Outro), busca por nome.
- [x] Tabela desktop + cards mobile; badges semânticos existentes (**badge-paid**, etc.).
- [x] Checkbox por linha + «Seleccionar todos os visíveis» + acção em lote com modal de confirmação (**BR-5.2**).
- [x] Botão **Registrar pagamento** por linha → diálogo (mês, valor só lectura ou pré-preenchido fixo ao efetivo, data, método opcional, notas).
- [x] Toasts ao concluir registo; actualização optimista opcional.

## UI , Detalhe `/mensalidades/[studentId]`

- [x] Resumo: plano actual, valor, vencimento, estado do mês seleccionado (selector alinhado à lista ou herança de query).
- [x] Histórico cronológico reverso; **Estornar** por linha quando aplicável (**voidPayment** + confirmação).

## UI , Perfil do aluno

- [x] Remover placeholder **Registrar pagamento**; usar componente/diálogo partilhado com mensalidades.
- [x] Copiar de produto actualizada (**SPR-**).

## Chrome premium (dashboard)

- [x] Sidebar **preta** e tokens **shell** ajustados; mais uso da paleta **bjj** no fundo da área de conteúdo e cartões (**DS-1.12**).
- [x] Rever contraste e estado activo na navegação (**SHELL-3**).

## Verificação

- [x] `pnpm lint`, typecheck, testes unitários e `pnpm build` sem erros.
- [ ] Checklist manual no browser (registo único, lote com excepções, mês passado, estorno, mobile).
