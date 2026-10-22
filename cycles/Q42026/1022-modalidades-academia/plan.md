# Plan — MVP 0.2

## Stage 1 — Execução sequencial das fatias aprovadas
1. #28 — Introduzir modalidade e preservar Jiu-Jitsu. Bloqueios: nenhum.
2. #29 — Boxe sem graduação e com mensalidade. Bloqueios: #28.
3. #30 — Judô com catálogo CBJ e ilustrações. Bloqueios: #28.
4. #31 — Muay Thai com 19 khan CBMTT. Bloqueios: #28.
5. #32 — Promoções e orientação Judô. Bloqueios: #30.
6. #33 — Promoções e histórico Muay Thai. Bloqueios: #31.
7. #34 — Turmas, presença e portal. Bloqueios: #29, #30, #31.
8. #35 — Painel e configurações. Bloqueios: #29, #30, #31.
9. #36 — Matrícula e documentos. Bloqueios: #28.
10. #37 — Troca segura em conta vazia. Bloqueios: #29, #30, #31.
11. #38 — Cadastro público completo e integração. Bloqueios: #32, #33, #34, #35, #36, #37.

A sequência numérica respeita o grafo. T1 expande modalidade e contrato de graduação sem quebrar JJ; modalidades ficam restritas à validação até #38. Cada fatia inclui camadas necessárias e testes, sem reestruturação alheia. Não instalar dependências novas. Reutilizar runtime e controles existentes.

## Leituras antes do código
- feature-spec.md (cópia da issue #27) e ticket correspondente em issues/.
- Specs de autenticação, alunos, graduação, planos, turmas/portal, painel e documentos conforme a fatia.
- A base contém contratos canônicos antigos; divergências conhecidas entram em spec-delta, não autorizam reverter cadastro público entregue no 0.1.
- CLAUDE.md e regras de segurança/tenant continuam aplicáveis.

## Controle
Um único subagent de implementação ativo por vez; cada agente trabalha neste worktree/branch e apenas no ticket atribuído, atualiza evidências e faz exatamente um commit. Sem push ou fechamento automático das issues. Coordenador confere diff, commit e resultados antes do próximo.
TDD nos pontos previamente acordados; type-check regularmente. Executar suíte integral só na integração final, distinguir falhas preexistentes com evidência.
Scripts SQL ficam versionados; execução exclusivamente em banco descartável de validação, sem credenciais de produção.

## Smoke
Iniciar aplicação na porta livre desta branch, preferir localhost:3102. Cadastro público: quatro opções no fim do lote; validação 18+, Boxe sem campos de graduação, graduação desconhecida sem datas fabricadas, Judô ilustrado, khan distinguíveis, promoção/salto/futuro, troca bloqueada, painel e documentos. Login somente com perfil documentado ou sessão fornecida; não inventar credenciais. Navegador e checklist final pelo dvd-tests.
