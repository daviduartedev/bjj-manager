# Empty States, Loading and Errors

## Context
As features principais existem, mas a UX em estados degradados
(carregando, sem dados, erro) ainda é pobre. Este ciclo eleva a
qualidade percebida do app: skeletons, mensagens vazias amigáveis,
toasts consistentes, confirmações destrutivas.

## Intent
- Skeletons em todas as listas (students, billing, dashboard).
- Empty states com:
  - ilustração simples (ícone lucide grande),
  - título curto,
  - mensagem 1 linha,
  - CTA primário (ex.: "Cadastrar primeiro aluno").
- Tratamento de erro:
  - `error.tsx` por rota onde fizer sentido,
  - mensagens em pt-BR claras,
  - botão "Tentar de novo".
- Toasts unificados via shadcn `<Toaster>`:
  - sucesso (verde), erro (vermelho), info (azul).
- Confirmações em ações destrutivas (excluir aluno, estornar
  pagamento) com `<AlertDialog>`.

## Taste / Constraints
- Mensagens curtas, em pt-BR, sem jargão técnico.
- Não vazar stack traces para o usuário.
- Loading nunca passa de 2s sem feedback visual.
- Cores semânticas dos tokens (`status-paid`, etc.) para toasts.

## References
- `cycles/Q22026/03-0430-design-system/request.md`
- Todos os ciclos de feature anteriores (06–15).

## Attachments
- (nenhum)
