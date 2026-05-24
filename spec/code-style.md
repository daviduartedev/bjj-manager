# spec/code-style.md — Política de Estilo e Formatação

## Princípios fundamentais

- Lint = qualidade e correção (regras que importam).
- Formatter/Prettier = formatação (aspas, indentação, vírgulas).
- Não misturar mudança de formatação com mudança funcional.
- Estilo serve à legibilidade, não ao ego.

---

## Lint

- Erros de lint devem ser resolvidos, não suprimidos sem justificativa.
- Supressões de lint (`eslint-disable`, `// @ts-ignore`) requerem comentário explicando o motivo.
- Não adicionar regras de lint novas junto com feature — cycle separado.
- CI deve bloquear merge com erros de lint.

---

## Formatação

- Se o projeto usa Prettier (ou equivalente), a formatação é determinística — não debater.
- Commits de formatação são **sempre separados** de commits de mudança funcional.
- Não formatar arquivos inteiros apenas porque abriu o editor.
- Formatação não é revisão de código — não comentar sobre ela em review.

---

## Código morto

- Não deixar código comentado sem explicação (`// TODO: remover` com data e contexto é aceitável).
- Remover imports não utilizados.
- Remover variáveis não utilizadas.
- Remover funções não utilizadas (verificar se não são exports públicos).

---

## Abstração

- Não abstrair antes de ter dois casos de uso reais (regra de três).
- Preferir código direto e legível a código "elegante" e obscuro.
- Funções utilitárias compartilhadas documentadas com JSDoc quando não óbvias.
- Não criar abstração nova junto com feature — refactor é cycle separado.

---

## Imports

- Imports organizados: externos → internos → relativos (seguindo config do projeto).
- Não usar imports relativos longos (`../../../../components`) quando há alias configurado.
- Barrel exports (`index.ts`) usados com parcimônia — podem esconder dependências circulares.

---

## Naming

- Nomes descrevem intenção, não implementação.
- Funções: verbos (`getUserById`, `calculateTotal`, `sendConfirmationEmail`).
- Variáveis booleanas: `is`, `has`, `can`, `should` (`isActive`, `hasPermission`).
- Constantes: `UPPER_SNAKE_CASE` para valores literais, camelCase para objetos/arrays constantes.
- Evitar abreviações não óbvias (`usr`, `cfg`, `tmp` — usar `user`, `config`, `temp`).

---

## Comentários

- Comentários explicam **por quê**, não **o quê** (o código já diz o quê).
- Comentários de TODO incluem contexto: `// TODO: remover após migração de dados (cycle Q2/2026)`.
- Não comentar código morto — excluir e usar git para recuperar se necessário.
- JSDoc em funções de API pública ou utilitários compartilhados.

---

## Separação de mudanças

| Tipo de mudança | Como commitar |
|---|---|
| Feature | Commit próprio, no cycle da feature |
| Bugfix | Commit próprio, no cycle do fix |
| Formatação | Commit separado, nunca misturado |
| Refactor | Commit próprio, cycle separado |
| Cleanup de código morto | Commit separado, cycle próprio |

---

_Harness version: 1.0.0_
