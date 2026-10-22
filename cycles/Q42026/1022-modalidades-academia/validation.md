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
