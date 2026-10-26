# Request — MVP 0.2: modalidades da academia

- Tipo: Large, uma stage de implementação composta pelos 11 tickets aprovados.
- Branch: feat/modalidades-academia.
- Base fixa: develop, 5e48ad370294253d774dd7d63d359a4e3002e8ff.
- Spec aprovada: https://github.com/daviduartedev/bjj-manager/issues/27.
- Tickets: #28–#38, em ordem de dependência.
- Autorização explícita do usuário em 22/10/2026: implementar todos os tickets com subagents em sequência, um commit por ticket, tudo na mesma branch; ao final executar dvd-tests para validação humana.
- Essa autorização permite os commits deste lote e prevalece sobre a exclusão de commits no texto original da spec e sobre a regra padrão de dvd-tests de parar antes de commits. O dvd-tests final não fará commits adicionais.
- Checkout original feat/cadastro-publico permanece intocado com alterações locais. Este worktree parte de develop e não inclui os protótipos ou configurações locais.
- Não fazer push, merge, deploy, nem migrar/semear dados de produção.

## Contrato fechado
Uma modalidade por academia: Jiu-Jitsu existente; Boxe sem graduação; Muay Thai com 19 khan CBMTT; Judô com catálogo CBJ completo e ilustrações simples. Novas modalidades 18+, JJ mantém públicos. Graduação atual obrigatória nas modalidades graduadas, data preexistente pode ser desconhecida. Promoção manual, no-op/regresso/futuro recusados, saltos justificados. Orientação documental de idade/carência sem inventar regras. Sem prontidão nova no painel.
Escolha no cadastro público; existentes JJ. Troca só em conta sem alunos inclusive removidos/arquivados, turmas, aulas, pagamentos ou documentos, atômica inclusive sob concorrência. Configuração/plano por si não bloqueia. Um plano aberto por aluno; Isento/Bolsista/preço preservados. Operação, portal e documentos adequados; emitidos preservados. Sem certificação federativa ou privilégios por título esportivo. React Aria amplo, AbacatePay e V1 fora.

## Pontos de teste aprovados
Jornadas de professor no limite UI/servidor/persistência; testes complementares nos contratos públicos de cadastro, schema, data/idade, catálogo/transição, troca e documentos. Testes de banco somente em ambiente descartável e local ou inequivocamente de teste; dois tenants reais conhecidos para isolamento. Fakes não comprovam RLS/atomicidade. TDD em fatias red → green. Type-check regular e testes direcionados; suíte integral uma vez ao final.

## Execução e validação humana
Cada ticket usa um subagent de implementação de cada vez, testa e gera um commit próprio com referência da issue. A revisão final Standards e Spec também será sequencial, respeitando o pedido do usuário. Corrigir achados antes de dvd-tests.
Início local: pnpm exec next dev --port 3102 (ou outra porta livre, sempre informar a URL efetiva). Usar apenas configuração de teste; não copiar configuração de produção.
Não há perfil de login declarado nesta conversa. Perfis existentes de teste só serão usados quando comprovadamente documentados e disponíveis; nenhum segredo será impresso. Se faltar sessão para Drive autenticado, informar bloqueado e solicitar o perfil necessário.
Manter servidor saudável no worktree da implementação para o usuário validar. Entregar resultados E2E e checklist humano desmarcado. Validação humana pendente até confirmação.
