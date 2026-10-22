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

## T3 / #30 — 22/10/2026

### TDD e contratos
- Red → green de catálogo: módulo ausente; passou com tabela literal independente de22 posições/cores e ordens0–21. Identidades `dan-1`–`dan-10` distintas mesmo nas cores repetidas.
- Red → green de schema: chaves referenciadas recusadas/faixa obrigatória; passou com cadastro e edição rápida CBJ sem campos JJ, null de data e plano Adulto. Complementos recusam referência estrangeira, rank inexistente/ausente, data omitida/inválida/futura, grauJJ, menor de 18 amanhã e plano infantil; iniciante e graduação já concedida com data conhecida aceitos.
- Red → green de actions públicas createStudent/updateStudent/quickUpdateStudent: cadastro falhava por faixa JJ; passou preservando referência/código/null e peso na ficha, sem evento anterior obrigatório. Edição rápida resolve tipo persistido, ignorando tipo forjado do cliente. Papel aluno e referência CBMTT recusados. O adapter de banco/sessão deste teste não comprova RLS.
- Red → green de apresentação de datas: módulo ausente; passou para Data não informada/Tempo indisponível e data conhecida. Ajustada expectativa de formatação para o contrato já existente do produto (`22 out 2025`).
- Red → green final defaults→schema: os defaults ainda enviavam grau 0 oculto para Judô; corrigido para null. O teste usa os valores que o formulário realmente envia e preserva iniciante/data null.

### Comandos e banco real
- Seleção direcionada final: `pnpm exec vitest run lib/modalities/referenced-ranks.test.ts lib/modalities/referenced-graduation-summary.test.ts lib/modalities/judo-student-actions.test.ts lib/validations/judo-students.test.ts lib/validations/students.test.ts lib/validations/boxing-students.test.ts lib/modalities/boxing-graduation-actions.test.ts lib/modalities/graduation-policy.test.ts lib/students/graduation-current-since.test.ts lib/students/graduation-reference.test.ts lib/students/plan-kind.test.ts lib/dates/dates.test.ts` — **84 testes aprovados em 12 arquivos**, após a correção final dos defaults.
- `pnpm type-check`: aprovado regularmente; após remoção da fixture de UI houve falha apenas por referência gerada obsoleta em .next/types da rota temporária; removida essa referência específica e o type-check voltou a passar.
- `node scripts/validate-judo-students.cjs` antes da033: red esperado, tabela de catálogo inexistente.
- `node scripts/validate-judo-students.cjs --apply-migration`, CASCA_TEST_DATABASE_URL explícita local loopback:5549/casca_test: aprovado. Sem leitura de .env e com guard de loopback/_test, aplica/reaplica033 dentro da transação e faz ROLLBACK.
- Prova SQL: catálogo de 22 posições/ordem literal; adulto18 hoje aceito, amanhã/kids recusados; 10º dan direto sem histórico; edições kyū/iniciante; data nula preservada e data real/futura; referência de Muay existente real em fixture recusada; tentativaJJ recusada; plano Adulto/vencimento/preço personalizado, índice de um vínculo aberto e Isento; papéis inalterados. Professor B não lê/edita aluno real de A; aluno não altera própria graduação. INSERT/UPDATE/DELETE nos dois catálogos negados a authenticated. Snapshot das colunas anteriores de accounts/belts/students/student_graduations/plans/student_plans/payments/generated_documents idêntico antes/depois, incluindo fichasJJ/Boxe; nenhuma faixaJJ reescrita.

### UI local e limites
- Usada skill playwright-best-practices para verificações por nome/role e espera por estado. Rota de fixture temporária em localhost:3102, sem sessão/submissão nem acesso a banco remoto, removida ao terminar. Renderizou os componentes reais StudentForm, QuickEditDialog, StudentsList e StudentProfileClient com dados sintéticos.
- Navegador Chromium:22 opções acessíveis; Enter/End/Enter selecionou10º dan; alternância data conhecida↔desconhecida; mobile de 390 px sem overflow; perfil/aba Graduação/histórico mostram 8º dan ilustrado, Data não informada e Tempo indisponível; edição rápida mudou para 5º dan; lista mostrou nomes/data/tempo; nenhuma ação de promoçãoJJ no Judô. Nenhum pageerror. Conferidas visualmente screenshots desktop/mobile/estado atual+histórico e galeria dos 22 ranks. Corrigido nome acessível duplicado SVG+texto. Ajustada repetição visual do título no estado atual.
- Imagens de prova ficaram somente no diretório temporário do host, fora do Git. Não equivalem a jornada autenticada de UI→servidor→banco; essa validação integrada e humana segue pendente para coordenador/dvd-tests. Promoção/histórico de eventos próprio é #32. 033 não persistida pelo agente; cadastro público segue JJ até #38. Suíte integral/build/revisão final/DVD não executados nesta fatia.

## T4 / #31 — 22/10/2026

### TDD e contratos
- Red → green do catálogo público: Muay retornava lista vazia; passou com expectativa literal independente dos19 códigos/cores/títulos e ordinais0–18. Honrarias16–19 permanecem distintas; referências estrangeiras/rank20 recusados.
- Red → green dos defaults reais→schema: Muay não enviava graduação/data explícita; corrigido com primeiro rank da referência e NULL para data desconhecida. Complementos verificam18hoje/amanhã na viradaUTC/SP, catálogo CBJ recusado, grauJJ recusado, graduação inexistente/ausente, data omitida/inválida/futura, planoKids recusado, edição completa/rápida com dataNULL ou real e resumo19ºkhan/tempo indisponível.
- Actions públicas createStudent/updateStudent/quickUpdateStudent exercitam Muay com khan19/15/13 e peso sem evento/histórico fabricado ou campo de papel. Recusam aluno, referênciaCBJ e edição de aluno conhecido de outro tenant; fake apenas na fronteira Supabase/sessão, sem alegar provaRLS desse teste.
- `pnpm exec vitest run lib/modalities/muay-thai-ranks.test.ts lib/validations/muay-thai-students.test.ts lib/modalities/judo-student-actions.test.ts lib/modalities/referenced-ranks.test.ts lib/modalities/referenced-graduation-summary.test.ts lib/validations/judo-students.test.ts lib/validations/students.test.ts lib/validations/boxing-students.test.ts lib/modalities/boxing-graduation-actions.test.ts lib/modalities/graduation-policy.test.ts lib/students/plan-kind.test.ts lib/dates/dates.test.ts lib/billing/get-effective-price.test.ts`: **83 testes aprovados em13 arquivos**, seleção direcionada.
- `pnpm type-check`: aprovado regularmente e após remoção da fixture/arquivoNext gerado específico. `git diff --check`: aprovado.

### Banco local real
- Sem034, script falhou como esperado por catálogoMuay vazio. `node scripts/validate-muay-thai-students.cjs --apply-migration` com variável explícita loopback:5549/casca_test: **aprovado**. Não lê .env; guard exige loopback e nome_test; aplica/reaplica034 dentro da transação e faz ROLLBACK. Corrigidos sintaxe CASE do guard e detalhes de tipo/coluna do harness antes da prova final aprovada.
-19códigos ordenados e títulos11–19 literais, origem e consulta corretas. Cadastro direto19ºkhan com aniversário18hoje, dataNULL sem histórico; edições khan3/iniciante, data real/null e peso. Amanhã/kids/referênciaCBJ real/grauJJ/rank20/datafutura/históricoJJ recusados.
- PlanoAdulto, índice de vínculo único, preço personalizado18765/vencimento20, Isento e pagamentoBolsista preservados. Título de honraria não altera papelstudent vinculado à ficha.
- Dois tenants reais conhecidos, professorA/B e aluno; professorB não lê/edita alunoA, aluno não altera própria graduação; INSERT/UPDATE/DELETE em ambos catálogos recusados. Snapshot integral dos registros anteriores em accounts/belts/students/student_graduations/plans/student_plans/payments/generated_documents idêntico após migração/reaplicação; fixturesJJ/Boxe/Judô mantidas e referênciaMuay recusada nelas.

### UI efêmera e limites
- Componente real ReferencedGraduationFields em rota temporária localhost:3102/muay-fixture, dados sintéticos sem sessão/submissão. Usada skill playwright-best-practices:19 opções com nomes acessíveis, Enter/End/Enter seleciona19ºkhan, alternância data conhecida/desconhecida, link/limitações de referência visíveis. Chromium em390e1280px: sem pageerror ou overflow. Um recorte inicial do menu ultrapassava390px; corrigido para358px em x16, com títulos completos quebrando linha. Screenshots conferidas visualmente no diretório temporário do host; não entram noGit. Fixture e referência.next/types específicas removidas.
- Esta prova visual não equivale a jornada autenticada de cadastro/edição/lista/perfil; a integração com sessão real, temas, telas completas e validação humana segue com coordenador/DVD. Nenhuma modalidade nova liberada publicamente.034 não persistida pelo agente, remoto não usado; suíte integral/build/revisão final/DVD não executados nesta fatia.

## T5 / #32 — 22/10/2026

### TDD e verificações direcionadas
- Red → green no seam público `assessJudoPromotion`: módulo ausente; orientação passou a identificar salto Casca e dispensa de carência básica adulta. Complementos verificam data anterior desconhecida, interstício reduzido do primeiro dan acima de 20, idade por ano de nascimento no segundo dan, exceções padrão e tabela intermediária. Outro red → green cobriu graduação histórica concedida quando o aluno tinha dois anos: a orientação inicial não identificava a idade abaixo da linha básica; passou a usar a tabela 1 documentada, sem bloquear exceção justificada.
- Red → green na action pública `promoteReferencedStudent`: módulo ausente; passou com autorização fail-closed e envio de payload estrito à RPC. Recusa aluno, papel ausente e modalidade diferente; não aceita tenant forjado; datas impossíveis e dia futuro na virada UTC/SP são recusados. Fake somente na sessão/Supabase; estes testes não são prova de RLS.
- Red → green na operação SQL pública: função inexistente no baseline. Depois, teste adicional mostrou que motivo apenas com newline/tab/NBSP era indevidamente aceito pelo trim SQL simples; corrigida a normalização, com rejeição comprovada.
- `pnpm exec vitest run lib/modalities/referenced-promotion.test.ts lib/modalities/referenced-promotion-actions.test.ts lib/modalities/referenced-ranks.test.ts lib/modalities/referenced-graduation-summary.test.ts lib/modalities/boxing-graduation-actions.test.ts lib/modalities/graduation-policy.test.ts lib/validations/graduations.test.ts lib/validations/judo-students.test.ts lib/validations/muay-thai-students.test.ts lib/graduation/belt-order.test.ts lib/dates/dates.test.ts`: **48 testes aprovados em 11 arquivos**, seleção direcionada final.
- `pnpm type-check`: aprovado regularmente e na seleção final após remover a rota temporária e sua referência específica gerada em `.next/types`. `git diff --check`: aprovado.

### Banco local real
- `node scripts/validate-judo-promotions.cjs --apply-migration` com variável explícita `CASCA_TEST_DATABASE_URL` em loopback:5549/casca_test: **aprovado**. Guard recusa alvo fora de loopback ou nome sem `_test`; não lê `.env`. Aplica/reaplica 035 numa transação e termina em ROLLBACK. Snapshot JSON de accounts/students/student_graduations/plans/student_plans/payments/generated_documents permaneceu idêntico após a migração, preservando dados esportivos/financeiros/documentos anteriores.
- RPC executada sob papel authenticated com professores de dois tenants, aluno vinculado e usuário sem perfil. Avanço imediato atualiza ficha e evento; origem `beginner` com data NULL conservada; salto com motivo persistido; repetição/regresso/catálogo estrangeiro/rank inválido/futuro/data anterior conhecida recusados. Casos de idade+carência abaixo do padrão CBJ exigiram motivo e foram aceitos, sem homologação. Data anterior desconhecida no primeiro dan não criou carência nem exigiu motivo inventado; evento informa indeterminável. Registro histórico usa idade/carência da linha básica documentada.
- Professor B não promove nem lê eventos de A; aluno não promove e lê apenas seus eventos, sem ler os de outro aluno da mesma academia; usuário sem perfil e anon não promovem. INSERT/UPDATE/DELETE diretos de eventos por authenticated negados. Professor/papel esportivo não é inferido do destino.
- Falha injetada em trigger BEFORE INSERT de evento, depois da atualização da ficha: RPC falhou e graduação atual permaneceu no dan anterior, sem evento parcial. Trigger/fixtures revertidos pelo rollback.
- `node scripts/validate-judo-promotion-concurrency.cjs`: **aprovado**, duas conexões/transações reais e observação de `pg_blocking_pids`. A segunda RPC aguardou o lock da primeira; após commit, reavaliou a ficha e recusou no-op (`23514`). Exatamente um evento e graduação atual coerente. Fixtures próprias da corrida removidas explicitamente.
- Para essa corrida, 035 final foi **persistida exclusivamente no banco descartável local**, conforme autorização do coordenador, mantendo 031–034 existentes. Não houve aplicação remota. Coordenador deve aplicar 035 em TEST antes da jornada autenticada; não precisa reaplicá-la localmente para disponibilizar os objetos.

### UI efêmera e limites
- Usada skill playwright-best-practices para seletores por papel/label, esperas por estado e verificação de teclado. Rota temporária `/judo-promotion-fixture`, componentes reais do diálogo e histórico com dados sintéticos, em `http://localhost:3102`; navegador separado sem usar a sessão autenticada do coordenador, sem submissão nem escrita remota.
- Chromium em 1280 e 390 px: graduação atual e destino ilustrados/textuais, dez dan disponíveis desde 1º kyū, End/Tab seleciona 10º dan, salto exige motivo, carência indeterminável visível, histórico conserva iniciante com data desconhecida depois de dois eventos. Sem pageerror ou overflow do diálogo; cancelamento acessível e rolagem alcança os controles inferiores. Screenshots finais após animação conferidas visualmente.
- Rota temporária removida, referência Next gerada retirada e fontes/imagens movidas para fora do Git. Screenshots de prova: diretório temporário do host `casca-issue32-20261022`. Esta prova não equivale à jornada autenticada UI → action → TEST nem substitui reload real/perfil/portal e confirmação humana: esses passos continuam com o coordenador/DVD. Suíte integral, build e revisão final reservados ao coordenador, sem avanço para #33 ou #38 nesta fatia.

## T6 / #33 — 22/10/2026

### TDD e verificações direcionadas
- Red → green na action pública `promoteReferencedStudent`: professor Muay com khan17 era recusado; passou com payload estrito e referência coerente com modalidade. Recusa catálogoCBJ/rank20/tenant forjado/aluno/papel esportivo inválido. Teste da virada UTC/SP executado para Judô e Muay: amanhã civil e data impossível recusados, hoje aceito. Fake só na fronteira sessão/Supabase; não representa prova RLS.
- Red → green em `assessReferencedPromotion`: função ausente; passou com16→17→18→19 como avanços imediatos,15→19 como salto, nenhuma exceção CBJ em Muay e limites CBMTT explícitos. A avaliação Judô continua com suas próprias exceções documentadas.
- Red → green na RPC pública: Muay inicialmente falhava com `invalid promotion rank`;036 passou. Prova adicional de motivo apenasU+2007/U+202F produziu `Missing expected rejection`; normalização SQL completada e prova passou, além de espaço/tab/newline/NBSP/BOM.
- `pnpm exec vitest run lib/modalities/referenced-promotion.test.ts lib/modalities/referenced-promotion-actions.test.ts lib/modalities/referenced-ranks.test.ts lib/modalities/muay-thai-ranks.test.ts lib/modalities/referenced-graduation-summary.test.ts lib/modalities/boxing-graduation-actions.test.ts lib/modalities/graduation-policy.test.ts lib/validations/graduations.test.ts lib/validations/judo-students.test.ts lib/validations/muay-thai-students.test.ts lib/graduation/belt-order.test.ts lib/dates/dates.test.ts`: **52 testes aprovados em12 arquivos**, seleção direcionada.
- `pnpm type-check`: aprovado antes e depois de remover a fixture/sua referência Next gerada. Nenhum build ou suíte integral executado nesta fatia.

### Banco local real
- `node scripts/validate-muay-thai-promotions.cjs --apply-migration`, variável explícita `CASCA_TEST_DATABASE_URL` local loopback:5549/casca_test: **aprovado**. Sem leitura de.env; guard exige loopback/_test; aplica/reaplica036 em transação com ROLLBACK. Snapshot JSON das linhas preexistentes em accounts/students/student_graduations/student_rank_promotions/plans/student_plans/payments/generated_documents idêntico antes/depois: sem reescrita de histórico/fichas/dados financeiros/documentos.
- Avanços imediatos16→17→18→19 no mesmo dia gravam três eventos distintos em ordem de identidade, sem ordenar por cor. Primeiro evento conserva16/dataNULL; eventos seguintes conservam a data real; ficha termina19/data informada, faixa/grauJJNULL. Destinos superiores/títulos não concedem papel/capacidade.
- Salto15→18 com justificativa aparada persistida; somente whitespace, no-op/regresso/rank20/catálogoCBJ/futuro/data anterior ao nascimento ou data atual conhecida recusados. OrigemNULL permaneceNULL no evento e não é substituída por matrícula. `guidance_exceptions=[]` em Muay, fonte/ausência de idades/carências persistidas, sem critérios CBJ.
- ProfessorB não promove nem lê eventos deA; aluno com honraria não promove, lê seus três eventos e não lê os de outro aluno do mesmo tenant. Usuário sem perfil/anon recusados. Enum recusa título `mestre` como papel; action também recusa papel inválido. INSERT/UPDATE/DELETE diretos de eventos negados a authenticated. Falha injetada em BEFORE INSERT do evento reverte atualização da ficha, mantendo18/data anterior e um único evento do salto. Fixtures/trigger revertidos.
- `node scripts/validate-judo-promotion-concurrency.cjs --muay-thai`: **aprovado**, duas conexões reais; `pg_blocking_pids` comprova espera da segunda RPC. Após commit da primeira, segunda relê ficha e recusa no-op; exatamente um evento16→17. Fixtures próprias removidas. O mesmo script sem argumento também passou paraJudô.
-036 final foi **persistida somente no descartável local** para a corrida, conforme autorização; coordenador precisa aplicá-la explicitamente em TEST antes da jornada autenticada. Nenhum remoto acessado pelo agente.
- Regressões SQL sobre036 final, sem reaplicar035: `validate-judo-promotions.cjs`, `validate-muay-thai-students.cjs`, `validate-judo-students.cjs`, `validate-boxing-students.cjs`: **aprovadas**, todas com rollback. Preservam contrato CBJ, cadastros/edições/datas/planos/financeiro e isolamento; JJ permanece coberto pelas fixtures e verificações desses scripts.

### UI efêmera e limites
- Skills playwright-cli/playwright-best-practices; sessão separada `casca-issue33`, componentes reais em `/muay-promotion-fixture` de localhost:3102, dados sintéticos sem sessão/submissão/acesso remoto. Diálogo exibe16atual e opções17/18/19 com khan/título distintos;17sem motivo obrigatório, End/Tab escolhe19e exige justificativa. FonteCBMTT/limites/exame/SNG/homologação/certificação visíveis; sem campoJJ/orientaçãoCBJ.
- Histórico mostra18e17como eventos distintos, salto/motivo e origem15com data desconhecida; reload sintético conserva a apresentação. Chromium390e1280px sem overflow; diálogo mobile x12/largura366, rolagem alcança Registrar promoção/Cancelar; nenhum erro de console observado. Screenshots desktop/mobile inspecionadas visualmente emTemp.
- Fixture e arquivo gerado específico `.next/types/app/muay-promotion-fixture/page.ts` removidos. Logs/snapshots próprios movidos para `Temp/casca-issue33-browser-20261022`; screenshots `Temp/casca-issue33-mobile.png`/`casca-issue33-desktop.png`, fora doGit. Esta prova não equivale à jornada autenticada UI→action→TEST e reload de dados reais; coordenador fará com Marcos Muay DVD. Suíte integral/build/revisão/DVD e confirmação humana continuam pendentes. Sem implementação #34+ ou liberação pública antes de #38.
