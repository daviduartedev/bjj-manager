# 02: Três modelos de cabeçalho, provados em Alunos

**What to build:** Alunos opens in the home's canvas with three structural frames. Faixa is the default: title and context on the left, at most two actions on the right, then the real student list. Mesa puts the title and actions in one toolbar and the list on a single surface. Ficha puts the title, context, and actions in a side column and the list in the other. A floating switcher and `?variant=A|B|C` change only the frame. The professor content column is full-bleed, like the home. The home itself does not change.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] `?variant=A` shows Faixa, `B` shows Mesa, `C` shows Ficha, and a missing key shows Faixa
- [x] The header shows at most one primary and one secondary action
- [x] Alunos still lists real students and still links to cadastrar aluno
- [x] The switcher is hidden in production and does not steal arrow keys from a focused field
- [x] The home at Painel is unchanged
- [x] A unit test locks the variant key and the action cap, and fails before the decision exists
