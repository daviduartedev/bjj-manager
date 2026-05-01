# Graduation Engine

## Context
A graduação é o coração esportivo do app. Cada aluno tem uma faixa
atual, um grau atual e um histórico. O professor decide; o sistema
**alerta** quando o professor pula a ordem oficial e exige
justificativa. Este ciclo entrega toda a lógica e UI de promoção.

## Intent
- Rota `app/(dashboard)/students/[id]/graduations/page.tsx` com
  histórico completo (cards/timeline).
- Modal/dialog **Promover aluno** acionado pelo perfil do aluno e
  pela tela de histórico.
- Server Actions em `actions/graduations.ts`:
  - `promoteStudent({ studentId, beltId, degree, isSkip,
    skipReason?, graduatedAt })`.
- Helper em `lib/graduation/` com:
  - `getBeltOrder(kind)` , ordem oficial por kind.
  - `isOrderRespected(currentBeltId, currentDegree, newBeltId,
    newDegree, kind)` , booleano.
  - `nextBelt(currentBeltId, kind)`.
- Regra de promoção:
  1. Se respeita a ordem (próxima faixa ou +1 grau na mesma faixa) →
     promover sem alerta.
  2. Se pula a ordem → bloquear submit até preencher justificativa,
     marcar `was_skip = true` e salvar `skip_reason`.
  3. Sempre criar registro em `student_graduations` e atualizar
     `students.current_belt_id` / `students.current_degree`.
- Faixas adultas: Branca, Azul, Roxa, Marrom, Preta.
- Faixas kids: Branca, Cinza/Branca, Cinza, Cinza/Preta,
  Amarela/Branca, Amarela, Amarela/Preta, Laranja/Branca, Laranja,
  Laranja/Preta, Verde/Branca, Verde, Verde/Preta.

## Taste / Constraints
- Mostrar visualmente a cor da faixa (chip/badge com `belts.color_hex`).
- Mensagem de alerta clara e amigável quando há pulo: "Você está
  pulando da [X] para a [Y]. Justifique:".
- Histórico nunca apaga registros , só adiciona.
- Considerar grau 0..4 (faixa inicial geralmente vem com 0 graus).
- Server Action transacional: ou tudo, ou nada.
- Nunca permitir alterar `account_id`.

## References
- `cycles/Q22026/02-0430-product-specification/request.md` (regras de
  graduação).
- `cycles/Q22026/04-0430-supabase-schema/request.md`
  (`student_graduations`, `belts`).
- `cycles/Q22026/10-0430-student-profile/request.md`.

## Attachments
- (nenhum)
