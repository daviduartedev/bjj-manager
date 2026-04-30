# Student Profile

## Context
Depois de listar e cadastrar, o professor precisa abrir um aluno e ver
**tudo** sobre ele em uma tela: dados pessoais, graduação atual,
histórico de graduações, situação financeira do mês, observações. Esta
é a tela mais visitada do app.

## Intent
- Rota `app/(dashboard)/students/[id]/page.tsx`.
- Resumo no topo:
  - nome, foto/avatar (placeholder), faixa+grau (badge),
  - tipo (Adulto/Kids), status, idade.
- Tabs ou seções:
  - **Dados pessoais** — DOB, entrada, contatos, observações.
  - **Graduação** — faixa atual, grau, tempo na faixa, tempo no grau,
    histórico (cards/linhas com data, faixa, grau, justificativa se
    houve pulo).
  - **Financeiro** — plano atual, valor (com `custom_price_cents` se
    houver), dia de vencimento, status do mês corrente
    (Pago/Pendente/Atrasado), últimos pagamentos.
  - **Observações** (se preferir separar do Dados pessoais).
- Botões: "Editar", "Promover", "Registrar pagamento".
  Os dois últimos podem abrir Dialog (modal) que dispara os ciclos
  específicos.

## Taste / Constraints
- Tela densa, mas com hierarquia clara — usar `Section` + `Card`.
- Sem gráfico nesta tela.
- Mobile: tabs horizontais com scroll; cards empilhados.
- Server Component buscando dados; partes interativas
  (modais) em Client Components.
- Datas formatadas em pt-BR ("12 abr 2024", "há 6 meses").

## References
- `cycles/Q22026/08-0430-students-crud/request.md`
- `cycles/Q22026/11-0430-graduation-engine/request.md`
- `cycles/Q22026/13-0430-payments-billing-status/request.md`
- `cycles/Q22026/09-0430-date-duration-utilities/request.md`

## Attachments
- (nenhum)
