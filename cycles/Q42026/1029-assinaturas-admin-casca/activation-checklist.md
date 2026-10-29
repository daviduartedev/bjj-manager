# Ativacao externa da assinatura Casca

Roteiro para o dono da plataforma. Implementacao de codigo e configuracao externa sao etapas diferentes. Nenhuma chave, migration, cobranca, deploy ou conta real foi alterada por esta execucao.

## 1. Banco e preservacao dos clientes atuais

- [ ] Escolher primeiro um projeto Supabase de homologacao separado de producao e conferir que o app e os logins de teste apontam para ele.
- [ ] Fazer backup antes de qualquer migration de producao.
- [ ] Aplicar apenas as novas migrations deste ciclo na ordem numerica, revisando os nomes na entrega final. Nao usar indiscriminadamente `pnpm db:apply` em producao: o comando tambem executa schema, seeds e migrations anteriores.
- [ ] Manter `casca_billing_settings.enforcement_enabled` desligado durante a preparacao.
- [ ] Identificar explicitamente os IDs das duas academias reais que devem permanecer isentas. Registrar a isencao de cada uma com motivo no painel Casca; nao isentar todas as academias automaticamente.
- [ ] Conferir acesso, consultas e ausencia de cobranca nas duas academias isentas antes de ativar qualquer restricao.
- [ ] Somente depois dos testes e das isencoes, ativar a aplicacao das regras comerciais no ambiente escolhido.

## 2. Identidade administrativa

- [ ] Localizar no Supabase Auth o UUID da sua conta de dono. Nao usar somente nome, papel de professor ou metadata editavel pelo cliente como autorizacao global.
- [ ] Configurar a variavel de identidade de administrador indicada na entrega final somente no servidor, nos ambientes corretos da Vercel.
- [ ] Abrir `/admin/casca` com sua conta e conferir que outra conta de professor/aluno recebe acesso negado.
- [ ] Criar uma academia interna de teste pelo painel e confirmar sua classificacao sem prazo/cobranca, sem usar dados reais de alunos.

## 3. AbacatePay da plataforma

- [ ] Confirmar que a conta/CNPJ do Casca esta aprovada e com cartao e assinaturas habilitados. Ter uma conta criada nao garante a liberacao do cartao.
- [ ] Criar os produtos mensais: Essencial R$ 99, Academia R$ 179, Evolucao R$ 299.
- [ ] Criar uma variante de cada produto com tres dias de trial e outra sem trial, para recontratacao/troca nao repetirem a avaliacao.
- [ ] Configurar a chave de API e os seis IDs de produto nas variaveis server-side da Vercel. Usar credenciais de teste na homologacao e de producao somente na ativacao final.
- [ ] Conferir permissoes da chave para clientes, produtos avulsos, checkouts, consulta de assinaturas, troca de plano e cancelamento, conforme a implementacao entregue.
- [ ] Conferir a URL publica canonica do app para retornos do checkout, links de cancelamento e e-mails.
- [ ] Registrar webhook HTTPS no caminho indicado na entrega final, com segredo privado forte e eventos de assinatura/pagamento consumidos pelo codigo.
- [ ] Usar o mesmo ambiente no webhook e na chave: eventos de teste nao podem conceder acesso em producao.
- [ ] Garantir que protecao de preview/deployment da Vercel nao bloqueia a entrega do webhook, sem expor rotas internas.
- [ ] Em sandbox, concluir adesao com cartao, testar repeticao de webhook, falha, cancelamento e upgrade proporcional, mantendo uma unica assinatura recorrente.

## 4. Resend e Supabase Auth

- [ ] Adicionar e verificar o dominio remetente no Resend, com os registros DNS exigidos e autenticacao de dominio.
- [ ] Criar API key de envio e configurar remetente verificado nas variaveis server-side indicadas na entrega final.
- [ ] No Supabase Auth, habilitar SMTP personalizado: host `smtp.resend.com`, porta `465`, usuario `resend` e senha igual a API key de envio. Preencher remetente/nome do Casca.
- [ ] Conferir Site URL e URLs de redirecionamento de autenticacao para o dominio publico correto e o callback do app.
- [ ] Testar confirmacao de conta e recuperacao de senha com uma conta sintetica em homologacao.
- [ ] Validar e-mails comerciais de inicio do teste, aviso antes da primeira cobranca, pagamento, falha, troca e cancelamento.
- [ ] Configurar o processamento/reexecucao de notificacoes no agendamento indicado na entrega final. O lembrete precisa chegar antes de tres dias; uma fila nunca processada nao entrega o aviso.
- [ ] Se o agendamento exigir execucao mais frequente que diaria, conferir o plano Vercel ou usar um agendador externo autorizado: Vercel Hobby limita cron a uma vez ao dia.
- [ ] Conferir cotas e falhas de envio sem reenviar indefinidamente ou duplicar mensagem por evento repetido.

## 5. Publicacao e smoke humano

- [ ] Definir o canal comercial verdadeiro para academias acima de 300 alunos; a LP nao inventa e-mail ou WhatsApp.
- [ ] Fazer deploy da branch somente quando autorizado, depois das migrations/configuracoes do ambiente.
- [ ] Conferir os tres planos na LP, selecao preservada no cadastro e o valor/data do primeiro pagamento antes de autorizar o cartao.
- [ ] Confirmar que o retorno do checkout sozinho nao ativa acesso; somente confirmacao confiavel do provedor.
- [ ] Testar uma academia sintetica vencida em modo leitura, preservando consultas e negando novas escritas.
- [ ] Testar limite de alunos, upgrade proporcional, downgrade e cancelamento sem perder periodo ja pago.
- [ ] Conferir metricas com dados sinteticos e confirmar que testes/isentos nao contam como receita recorrente pagante.
- [ ] Somente apos os testes de sandbox e a revisao dos valores, autorizar a primeira cobranca real.

## Fontes primarias

- [Assinaturas AbacatePay](https://docs.abacatepay.com/pages/subscriptions/reference)
- [Mudanca de plano no proximo ciclo](https://docs.abacatepay.com/pages/subscriptions/change-plan)
- [Seguranca de webhook](https://docs.abacatepay.com/pages/webhooks/security)
- [SMTP Resend no Supabase](https://resend.com/docs/send-with-supabase-smtp)
- [Idempotencia de e-mail com janela de 24 horas](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [Limites do cron da Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing)

## Referencia de configuracao da implementacao

| Configuracao | Valor esperado / finalidade |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Origem canonica HTTPS de producao; localhost:3011 em desenvolvimento |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave server-side do mesmo projeto Supabase da aplicacao |
| `CASCA_ABACATEPAY_API_KEY` | Chave da conta do Casca no ambiente correto |
| `CASCA_ABACATEPAY_ENV` | `sandbox` ou `production` |
| `CASCA_ABACATEPAY_WEBHOOK_SECRET` | Segredo privado forte, igual ao configurado no webhook |
| `CASCA_ABACATEPAY_PRODUCT_ESSENCIAL` | Produto mensal R$ 99 sem trial |
| `CASCA_ABACATEPAY_PRODUCT_ESSENCIAL_TRIAL` | Produto mensal R$ 99 com trialDays 3 |
| `CASCA_ABACATEPAY_PRODUCT_ACADEMIA` | Produto mensal R$ 179 sem trial |
| `CASCA_ABACATEPAY_PRODUCT_ACADEMIA_TRIAL` | Produto mensal R$ 179 com trialDays 3 |
| `CASCA_ABACATEPAY_PRODUCT_EVOLUCAO` | Produto mensal R$ 299 sem trial |
| `CASCA_ABACATEPAY_PRODUCT_EVOLUCAO_TRIAL` | Produto mensal R$ 299 com trialDays 3 |
| `CASCA_PLATFORM_ADMIN_USER_ID` | UUID Auth do dono, unico admin global |
| `CASCA_CONTACT_URL` | Canal comercial verdadeiro HTTPS/mailto para capacidade sob consulta |
| `RESEND_API_KEY` | Chave de envio do Resend, somente servidor |
| `RESEND_FROM_EMAIL` | Remetente em dominio verificado |
| `CRON_SECRET` | Bearer forte para executar o job de notificacoes |

- Webhook da plataforma: `POST /api/webhooks/casca-abacatepay?webhookSecret=<segredo privado>`. O segredo deve ser cadastrado no provedor; nao compartilhar links com o valor preenchido em chats/logs.
- Eventos: `subscription.trial_started`, `subscription.completed`, `subscription.renewed`, `subscription.payment_failed`, `subscription.cancelled`, `subscription.plan_changed`, `checkout.completed`, `checkout.refunded`, `checkout.disputed`, `checkout.lost`.
- Job comercial: `GET` ou `POST /api/internal/subscriptions/notifications`, header `Authorization: Bearer <CRON_SECRET>`, recomendado a cada 15 minutos. Usar agendador externo ou plano Vercel compativel; nenhum cron mais frequente que diario foi adicionado automaticamente ao projeto.
- Areas: `/conta/assinatura` para a academia; `/admin/casca` para o dono. `/assinatura/[token]` continua a assinatura de documentos.
- Recuperacao de conta: `/recuperar-senha`, callback fixo `/auth/recovery`, formulario `/redefinir-senha`. Incluir o callback nas URLs autorizadas do Supabase.

Nenhum item foi marcado como realizado sem validacao real. Os nomes finais de migrations e evidencias locais aparecem no resumo da implementacao.
