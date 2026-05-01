# Casca - Gestão de Academias de BJJ — Workflow Spec-Driven (Cycles)

Cada feature do Casca - Gestão de Academias de BJJ nasce como **um ciclo**. Um ciclo é uma pasta
contendo um `request.md` cru — descrição da feature, sem plano, sem tarefas.
Plano e implementação vêm depois, em arquivos separados.

## Convenção de pastas

```
cycles/Q{trimestre}{ano}/{MMDD}-<slug>/request.md
```

Exemplo:

```
cycles/Q22026/01-0430-project-bootstrap/request.md
cycles/Q22026/08-0430-students-crud/request.md
```

- `Q{trimestre}{ano}` agrupa os ciclos por trimestre fiscal.
- `MMDD` é a data em que o ciclo foi **escrito** (não a data em que será
  executado). Sirva-se à vontade para mover o ciclo para uma pasta com data
  futura quando for de fato executá-lo.
- `<slug>` é kebab-case curto e descritivo da feature.

## O que vai dentro do `request.md`

Apenas a descrição crua da feature. **Não** escrevemos plano nem tarefas
aqui. O arquivo tem essas seções:

- **Context** — por que a feature existe e para quem.
- **Intent** — o que precisa ser entregue (lista concreta de capacidades).
- **Taste / Constraints** — restrições técnicas, de UX ou produto
  (ex.: sem iframe, seguir padrão de auth do módulo, etc.).
- **References** — ponteiros para docs do módulo (`spec/architecture.md`,
  `spec/features/<feature>/`, etc.).
- **Attachments** — prints, designs, qualquer material visual relevante.

Quando for hora de executar, criamos no mesmo diretório do ciclo arquivos
adicionais (ex.: `plan.md`, `notes.md`, `review.md`). O `request.md` em si
permanece imutável — é o briefing original.

## Branch única

Tudo acontece na branch `develop` (ou `main` se preferir). **Não** criamos
branches por feature. Cada ciclo é uma sequência de commits coerentes na
mesma branch.

## Independência e ordem sugerida

Os ciclos não dependem rigidamente um do outro para **existir**. Você pode
escrever todos antes de implementar qualquer um. Mas **a execução tem
ordem natural** — em geral 1 → 2 → 3, com algumas paralelizações
possíveis (ex.: `design-system` pode rodar enquanto o `supabase-schema`
está em andamento).

## Ciclos do Q2 2026

Lista crua, na ordem em que recomendamos executar:

| Ordem | Ciclo |
|------:|-------|
| 1     | `Q22026/01-0430-project-bootstrap` |
| 2     | `Q22026/02-0430-product-specification` |
| 3     | `Q22026/03-0430-design-system` |
| 4     | `Q22026/04-0430-supabase-schema` |
| 5     | `Q22026/05-0430-rls-and-security` |
| 6     | `Q22026/06-0430-authentication` |
| 7     | `Q22026/07-0430-app-shell` |
| 8     | `Q22026/08-0430-students-crud` |
| 9     | `Q22026/09-0430-date-duration-utilities` |
| 10    | `Q22026/10-0430-student-profile` |
| 11    | `Q22026/11-0430-graduation-engine` |
| 12    | `Q22026/12-0430-plans-billing-model` |
| 13    | `Q22026/13-0430-payments-billing-status` |
| 14    | `Q22026/14-0430-billing-ui` |
| 15    | `Q22026/15-0430-dashboard` |
| 16    | `Q22026/16-0430-settings` |
| 17    | `Q22026/17-0430-empty-loading-errors` |
| 18    | `Q22026/18-0430-responsiveness-mobile-polish` |
| 19    | `Q22026/19-0430-qa-hardening` |
| 20    | `Q22026/20-0430-deployment` |
| 21    | `Q22026/21-0430-future-roadmap` |

## Como rodar um ciclo

1. Abra `cycles/Q22026/{MMDD}-<slug>/request.md`.
2. Leia inteiro. Esse é o briefing.
3. Escreva (se quiser) um `plan.md` no mesmo diretório com o passo-a-passo.
4. Implemente.
5. Faça commits direto na branch (`develop`).
6. Anote no `notes.md` (opcional) decisões tomadas durante a execução.
7. Vá para o próximo ciclo.
