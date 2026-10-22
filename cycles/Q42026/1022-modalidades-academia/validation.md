# Evidências — MVP 0.2

Planejamento aprovado; implementação iniciada. Evidências por ticket abaixo; validação humana permanece pendente.

## Fronteiras
- Testes direcionados: T1 aprovado; próximos tickets pendentes.
- Type-check: T1 aprovado; repetir conforme avanço.
- Banco descartável: T1 aprovado no Postgres local; demais migrações pendentes.
- Suíte integral: pendente, executar uma vez ao final.
- Build: pendente.
- Revisões: pendentes.
- dvd-tests e validação humana: pendentes.

## T1 / #28 — 22/10/2026

### TDD e contratos
- Red: teste do serviço com `modality: jiu_jitsu` falhou porque o schema anterior recusava o campo. Green: modalidade validada gravada na intenção e ausente do payload de metadata; testes anteriores mantidos.
- Red: seam de política de graduação não existia. Green: adaptador de JJ delega à transição existente (um grau por vez), sem aplicar listras a outras modalidades.
- Cadastro continua recusando Boxe, Judô, Muay Thai e valores ilegíveis antes de chamar Auth, até a integração #38.
- Contexto público `getCurrentAccount` retorna modalidade persistida, ignora metadata e recusa modalidade/papel ilegíveis ou sessão ausente.

### Comandos efetivamente executados
- `pnpm exec vitest run lib/auth.test.ts lib/auth/register-academy.test.ts lib/auth/academy-callback.test.ts lib/auth/provision-destination.test.ts lib/auth/roles.test.ts lib/validations/academy-registration.test.ts lib/validations/students.test.ts lib/validations/settings.test.ts lib/modalities/graduation-policy.test.ts lib/graduation/belt-order.test.ts lib/students/plan-kind.test.ts lib/students/baby-age.test.ts`: **104 testes aprovados, 12 arquivos**. Esta é uma seleção direcionada, não a suíte completa.
- `pnpm type-check`: **aprovado**, após corrigir a tipagem do fake externo de Supabase no teste de contexto.
- `git diff --check`: aprovado antes do commit (avisos de normalização LF/CRLF não são erros).
- `node scripts/validate-academy-modality.cjs` sem aplicação de 031: **falhou como esperado** no baseline por ausência da coluna `modality`.
- `node scripts/validate-academy-modality.cjs --apply-migration` com `CASCA_TEST_DATABASE_URL` explicitamente local: **aprovado** em `casca_test`, loopback:5549; a transação aplica/reaplica 031 e termina em **ROLLBACK**. Não lê `.env` nem modifica bancos remotos.

### Prova de banco real e limites
- Baseline 5e48ad3 com schema/seed/policies e migrações até 030; Postgres descartável local, roles de API e `auth.uid()` de teste.
- Fixtures conhecidas de duas academias e alunos adulto/kids/baby, faixa/grau, datas, histórico, plano com nome/preço personalizado, vínculo, pagamento e documento anterior. Comparação JSON de todos os campos anteriores dessas tabelas demonstrou preservação integral após aplicação e reaplicação de 031.
- Registro legado de intenção (RPC de três argumentos) continuou provisionável como JJ. Nova intenção JJ preservou escolha/nome frente a tentativa de sobrescrita; metadata conflitante não alterou a academia. Confirmação e repetição da provisão mantiveram um único perfil/conta e quatro planos.
- RPC de intenção recusada a authenticated; tabela de intenção inacessível; UPDATE direto de modalidade recusado. Metadata sem intenção não criou academia. RLS isolou leitura e escrita entre duas academias reais conhecidas e seus alunos.
- Condição corrigida no harness, separada do produto: o bootstrap havia aplicado GRANT genérico a todas as tabelas depois das policies, reabrindo ACL de intents. Restaurado REVOKE de PUBLIC/anon/authenticated no banco local para reproduzir a 030 antes de executar a prova final. Não foi necessário mudar o produto por esse desvio de fixture.
- Stub de Auth no banco comprova SQL/RLS/provisão, mas não envio real de e-mail ou troca PKCE. Interface autenticada e confirmação ponta a ponta ficam para integração/dvd-tests. Migração de produção não executada; suíte integral, build e revisão final reservados ao coordenador após todos os tickets.


## T2 / #29 — 22/10/2026

### TDD/contratos e comandos executados
- Red → green: cadastro adulto sem campos de graduação falhou no schema legado; após adaptação aceita null/omissão e plano Adulto com zero faixas consultadas. Segundo red → green: aniversário 18 amanhã na virada UTC/SP era aceito e passou a ser recusado. Terceiro red → green: Isento com plano em branco falhou e passou a salvar sem vínculo obrigatório.
- Complementos: schema recusa grau zero/faixa forjada/kids, exige plano/vencimento para não Isento, aceita edição rápida sem graduação e peso. Actions de promoção/inclusão/edição/peso em histórico recusam Boxe sem consultar IDs de qualquer tenant. O teste de action usa fake só da sessão/cliente e não é evidência de RLS.
- pnpm exec vitest run lib/validations/boxing-students.test.ts lib/modalities/boxing-graduation-actions.test.ts lib/validations/students.test.ts lib/validations/graduations.test.ts lib/modalities/graduation-policy.test.ts lib/students/plan-kind.test.ts lib/students/monthly-operational-wallet.test.ts lib/students/payment-ui.test.ts lib/students/graduation-reference.test.ts lib/students/graduation-current-since.test.ts lib/dates/dates.test.ts lib/billing/get-effective-price.test.ts: **92 testes aprovados em 12 arquivos**, seleção direcionada.
- pnpm type-check: **aprovado** regularmente após schemas, actions, UI e leitores.
- node scripts/validate-boxing-students.cjs sem 032: **red esperado**, NOT NULL legada impediu ausência de graduação.
- node scripts/validate-boxing-students.cjs --apply-migration com variável explícita apontando a casca_test local em loopback:5549: **aprovado**. Aplica/reaplica032 na transação e termina em ROLLBACK; não lê .env nem acessa remoto.

### Persistência real e limites da prova
- Snapshot de todas as colunas anteriores de accounts/belts/students/student_graduations/plans/student_plans/payments/generated_documents antes/depois de 032 foi idêntico. Fixture JJ anterior à migração inclui faixa/grau, data e peso de graduação, plano/preço personalizado, vínculo/pagamento e documento emitido. A nova coluna weight_kg da ficha é excluída apenas da comparação dos campos antigos de students.
- Dois tenants reais conhecidos com professores e perfil de aluno; roles authenticated e RLS reais. Boxe adulto no aniversário 18 aceitou null/null, edição de nome/peso sem evento; amanhã, birth_date ausente, kids, grau zero/faixa e INSERT direto no histórico foram recusados no banco.
- Vínculo Adulto sem faixa: plano kids recusado, índice impediu segundo vínculo aberto, histórico de dois vínculos preservado, preço personalizado 18765/vencimento 20 corretos, pagamento pago e Bolsista aceitos, Isento preservado e pausado fora do recorte ativo. Prova da carteira nesta fatia é consulta SQL real com o recorte operacional, **não** uma execução do loader Next.js nem prova de interface.
- Professor B não leu/editou aluno, plano ou pagamentos existentes de A; não inseriu graduação para aluno real de A. Aluno não alterou peso operacional próprio. JJ graduado permaneceu intacto e JJ sem graduação continuou recusado.
- Lista/perfil/fichas e carteira real pela interface autenticada, teclado/mobile/temas, emissão de documentos e ponta a ponta permanecem para integração/dvd-tests do coordenador.032 não foi persistida pelo agente, banco remoto não foi usado; suíte integral, build e revisão final não executados nesta fatia.
