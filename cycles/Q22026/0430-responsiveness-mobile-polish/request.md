# Responsiveness and Mobile Polish

## Context
O professor abre o app no celular dentro da academia, com tatame ali
do lado. Toda a navegação e os fluxos críticos (cadastrar aluno,
promover, registrar pagamento) precisam funcionar confortavelmente em
mobile. Este ciclo é a varredura final de UX mobile.

## Intent
- Revisar cada rota `(dashboard)/*` em viewports 360, 390, 414 e 768.
- Ajustar:
  - tamanhos de toque (≥ 44px),
  - paddings/margens horizontais (mínimo 16px nas laterais),
  - tipografia legível (≥ 14px no body).
- Drawer mobile com gestos adequados (fechar ao tocar fora).
- Lista de alunos como cards verticais em < 768px.
- Dialogs ocupam quase tela cheia em mobile.
- Inputs com `inputMode` correto:
  - `numeric` para `dueDay`, valores;
  - `tel` para telefone;
  - `email` para e-mail.
- Tabela de billing vira cards em mobile.

## Taste / Constraints
- Sem horizontal scroll inesperado.
- Sem texto truncado essencial.
- Sem hover-only para informação crítica.
- Performance: nenhum bundle pesado novo. Reaproveitar shadcn.

## References
- Todos os ciclos de UI anteriores.
- `cycles/Q22026/0430-design-system/request.md`.

## Attachments
- (nenhum)
