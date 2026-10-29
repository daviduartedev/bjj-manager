# Mapa de execucao das stages

Todas as stages foram autorizadas na solicitacao de implementacao integral, com refinamento de seis tickets aprovado explicitamente. A conclusao respeita a fronteira das dependencias; preparacao independente nao equivale a conclusao de ticket bloqueado.

| Stage | Ticket | Responsavel inicial | Areas principais | Bloqueios |
|---|---|---|---|---|
| 1 | #81 | payment_contracts | Assinatura, provedor, webhook, persistencia e tela comercial | Nenhum |
| 2 | #82 | subscription_facts | Acesso, limites, protecoes banco/servidor e banner | #81 |
| 3 | #83 | payment_contracts | Cancelamento, cobranca avulsa proporcional e mudanca recorrente | #81, #82 |
| 4 | #84 | ui_architecture | Admin da plataforma, testes, isencoes e metricas | #81, #82 |
| 5 | #85 | A atribuir apos #82 | E-mail comercial, outbox, lembrete e configuracao SMTP | #81, #83 |
| 6 | #86 | ui_architecture | LP, cadastro, plano confiavel e destinos de autenticacao | #81 |

Root integra contratos compartilhados, prepara roteiro de ativacao externa, revisa diffs e serializa commits. Subagents nao fazem git add/commit. Nao ha operacoes reais em producao.

## Contratos compartilhados

- Catalogo universal: `SUBSCRIPTION_PLANS` com id, name, priceCents e activeStudentLimit; `getSubscriptionPlan`.
- Plano identificado por `essencial`, `academia` ou `evolucao`.
- SubscriptionRecord com campos snake_case e separacao kind/status.
- Kind: commercial, internal_test ou exempt. Role de usuario continua professor/student; admin e autorizacao independente pelo servidor.
- Persistencia: casca_subscriptions e singleton casca_billing_settings.enforcement_enabled, inicialmente falso.
- getCurrentSubscription resolve academia da sessao e devolve subscription, activeStudentCount e enforcementEnabled.
- Limite/acesso central em getSubscriptionAccess; SQL garante invariantes para mutacoes concorrentes e acesso direto.
- Migrations reservadas: 048 T1, 049 T2, 050 T4, 051 T6, 052 T5; numeros confirmados antes de criar.
- Registro comercial via /conta/assinatura, admin /admin/casca. /assinatura/[token] continua reservado a documentos.

## Fechamento de stage

Produzir resumo por ticket apenas apos evidencia de implementacao/testes. A ativacao externa continua pendente ate configuracao e migracao autorizadas pelo humano. Nao promover spec como validada em producao.
