# spec/frontend.md — Padrões de Frontend

## Princípios fundamentais

- Usar o design system existente do projeto quando houver.
- Não fazer redesign amplo sem cycle próprio.
- Não aplicar refactor visual global junto com feature.
- Consistência visual acima de preferência pessoal.

---

## Estados obrigatórios

Toda interface que carrega dados ou executa ações deve implementar:

- **Loading state:** indicador visual enquanto dados carregam ou ação é processada.
- **Empty state:** mensagem clara quando não há dados a exibir.
- **Error state:** mensagem de erro acionável (não "algo deu errado" sem contexto).
- **Disabled state:** botões e inputs desabilitados quando a ação não está disponível.

---

## Feedback ao usuário

- Toasts/snackbars para confirmação de ações (criação, atualização, exclusão).
- Mensagens de erro inline em formulários (campo a campo, não apenas no topo).
- Confirmação explícita para ações destrutivas (modais de confirmação).
- Não deixar o usuário sem feedback após uma ação.

---

## Responsividade

- Toda nova interface deve funcionar em mobile e desktop (mínimo).
- Usar breakpoints do design system existente.
- Não criar layouts que quebram em telas menores sem justificativa.
- Testar em ao menos dois tamanhos de tela antes de fechar o cycle.

---

## Acessibilidade básica

- Labels em todos os inputs de formulário.
- `alt` em imagens com conteúdo semântico.
- Contraste mínimo adequado (WCAG AA quando possível).
- Navegação por teclado funcional em fluxos principais.
- Não remover foco visível sem alternativa.

---

## Consistência visual

- Usar componentes do design system existente em vez de criar novos quando possível.
- Seguir paleta de cores, tipografia e espaçamento existentes.
- Ícones do mesmo conjunto já usado no projeto.
- Não introduzir nova biblioteca de UI sem cycle e aprovação.

---

## Formulários

- Validação client-side para feedback imediato (não substitui server-side).
- Desabilitar botão de submit durante o envio.
- Limpar ou resetar form após sucesso quando fizer sentido.
- Preservar dados do form em caso de erro de rede.

---

## O que não fazer

- Não fazer redesign amplo sem cycle próprio.
- Não refatorar componentes existentes globalmente junto com feature.
- Não introduzir nova biblioteca sem aprovação.
- Não ignorar estados de loading/erro por "falta de tempo".
- Não criar componente novo quando existe um equivalente no design system.

---

_Harness version: 1.0.0_
