# Plano de implementacao

## Fronteiras de validacao propostas

Interface publica do servico de assinatura e contratos externos; browser valida experiencia real. Fronteiras e seis tickets aprovados explicitamente pelo usuario via pergunta assincrona em 2026-10-29.

## Tickets verticais propostos

1. **Contratar e iniciar a avaliacao da academia.** Sem bloqueios. Catalogo, persistencia da assinatura, checkout/cartao/trial, webhook confiavel e tela da assinatura com status real. Provar inicio somente por evento confirmado e deduplicacao.
2. **Operar com acesso e capacidade do plano.** Bloqueado por 1. Somente leitura preservando consulta; limites de alunos ativos sob concorrencia, sinalizacao visual e preservacao dos clientes atuais.
3. **Gerenciar renovacao, cancelamento e troca de plano.** Bloqueado por 1 e 2. Cancelamento sem perder periodo pago, upgrade proporcional apos pagamento, downgrade seguro no proximo ciclo e feedback no painel.
4. **Administrar academias, testes e isencoes no Casca.** Bloqueado por 1 e 2. Autorizacao exclusiva do dono, dashboard comercial, academias internas, historico e metricas sem fichas de alunos.
5. **Receber e-mails da conta e da assinatura.** Bloqueado por 1 e 3. Resend/Supabase SMTP preparado, notificacoes persistentes, lembrete antes da primeira cobranca e reexecucao segura.
6. **Escolher o plano pela LP e concluir a contratacao.** Bloqueado por 1. Precos/limites reais, selecao preservada com seguranca no cadastro e confirmacao; copy explicita do trial/cartao, navegacao mobile/desktop e contato acima de 300.

## Execucao

- Uma branch a partir da main atualizada. Subagents com skill implement trabalham apenas nas areas atribuidas; root integra e serializa commits por ticket.
- Dependencias funcionais sao respeitadas; tarefas preparatorias ou UI com contratos firmados podem ocorrer em paralelo, sem declarar ticket concluido antes dos seus bloqueios.
- Nenhum subagent faz git add/commit autonomamente; root confere diff e faz commits por caminhos explicitos.
- Sem bibliotecas novas. Sem aplicacao de migration e sem mutacao de dados ou servicos de producao.
- Spec publicada como issue independente; tickets como sub-issues dela, com bloqueios nativos quando disponiveis. Nao modificar/fechar #69 nem outro pai existente.

## Publicacao

- Spec: https://github.com/daviduartedev/bjj-manager/issues/80
- T1: https://github.com/daviduartedev/bjj-manager/issues/81
- T2: https://github.com/daviduartedev/bjj-manager/issues/82 (bloqueado por #81)
- T3: https://github.com/daviduartedev/bjj-manager/issues/83 (bloqueado por #81 e #82)
- T4: https://github.com/daviduartedev/bjj-manager/issues/84 (bloqueado por #81 e #82)
- T5: https://github.com/daviduartedev/bjj-manager/issues/85 (bloqueado por #81 e #83)
- T6: https://github.com/daviduartedev/bjj-manager/issues/86 (bloqueado por #81)
- Todas publicadas com ready-for-agent, sub-issues e dependencias nativas.

## Smoke local

- URL http://localhost:3011, pnpm dev --port 3011; reutilizar se saudavel na branch correta.
- LP em 1440x900 e 390x844, sem overflow; comparacao de tres planos, trial/cartao e links corretos.
- Cadastro preserva escolha e mensagens nao enumeram usuarios.
- Rotas /conta/assinatura e /admin/casca protegem usuarios nao autenticados; usuario comum nao acessa admin.
- Assinatura nao ganha acesso por retorno do checkout, payload forjado ou evento repetido.
- Testes de negocio demonstram trial, somente leitura, limites, upgrade/downgrade e isencoes com dependencias externas simuladas.
- Drive de fluxos externos/autenticados que dependam de migration/chaves fica blocked com causa explicita. Nao usar o Supabase de producao para criar dados de demonstracao.
- Deixar servidor saudavel em execucao; entregar checklist humano observavel e pendencias externas concretas.

## Revisao e commits

- Base fixa: f1047a18957ce3ef008a5677c8da698238f79588.
- Rever Standards e Spec em subagents paralelos e corrigir problemas antes do dvd-tests.
- Typecheck recorrente, testes focados, suite completa final e smoke da LP existente.
- Commits por ticket em portugues sem acentos com corpo curto, Refs #69 e referencia da issue do ticket. Nenhum push.
