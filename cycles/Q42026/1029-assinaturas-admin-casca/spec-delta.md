## Problem Statement

O dono do Casca precisa vender o sistema para academias, cobrar e acompanhar as assinaturas e manter contas internas ou isentas. Hoje cadastro e operacao de academias existem, mas nao ha ciclo comercial de assinatura, painel global de plataforma ou integracao comercial com AbacatePay/Resend.

## Solution

Oferecer tres assinaturas mensais completas, diferenciadas por alunos ativos, contratadas pela LP com tres dias de avaliacao e cartao no inicio. A academia acompanha e gerencia sua assinatura, enquanto o dono do Casca administra apenas dados comerciais e operacionais agregados, preservando isolamento entre academias e os alunos existentes.

## User Stories

1. Como visitante, quero comparar os tres planos e limites para escolher conforme o porte da minha academia.
2. Como visitante, quero saber que o teste dura tres dias e exige cartao para decidir com clareza.
3. Como visitante, quero ver o valor da mensalidade e quando serei cobrado antes de autorizar a assinatura.
4. Como responsavel, quero cadastrar minha academia e confirmar meu e-mail para contratar com seguranca.
5. Como responsavel, quero iniciar o teste depois da adesao confirmada para ter tres dias reais de acesso.
6. Como responsavel, quero o mesmo conjunto de recursos em todos os planos para escolher somente pela capacidade.
7. Como responsavel, quero acompanhar o tempo restante de teste para decidir antes da primeira cobranca.
8. Como responsavel, quero receber lembrete antes da primeira cobranca para evitar surpresas.
9. Como responsavel, quero acompanhar a situacao da assinatura e o proximo vencimento.
10. Como responsavel, quero que pagamento confirmado libere o acesso sem depender de atendimento manual.
11. Como responsavel, quero regularizar um pagamento recusado para recuperar o acesso de escrita.
12. Como responsavel, quero consultar os dados mesmo sem pagamento para nao perder meu historico.
13. Como responsavel, quero cancelar futuras renovacoes pelo sistema.
14. Como responsavel, quero continuar usando o periodo que ja paguei depois do cancelamento.
15. Como responsavel, quero visualizar quantos alunos ativos utilizam o limite contratado.
16. Como responsavel, quero receber aviso antes de atingir o limite.
17. Como responsavel, quero preservar alunos inativos no historico sem consumir vagas ativas.
18. Como responsavel, quero que o sistema explique quando um cadastro ou reativacao ultrapassaria o limite.
19. Como responsavel, quero aumentar o plano imediatamente apos pagar a diferenca proporcional.
20. Como responsavel, quero ver o valor proporcional antes de autorizar o upgrade.
21. Como responsavel, quero que a troca mantenha um unico calendario de renovacao.
22. Como responsavel, quero reduzir o plano no proximo vencimento se meus alunos ativos couberem nele.
23. Como responsavel de academia maior, quero um caminho de contato para capacidade acima de 300 alunos.
24. Como dono do Casca, quero um acesso administrativo exclusivo que usuarios comuns nao possam obter.
25. Como dono do Casca, quero listar academias e suas situacoes comerciais sem acessar fichas de alunos.
26. Como dono do Casca, quero conceder ou retirar isencao com motivo e historico.
27. Como dono do Casca, quero criar academias internas de teste sem prazo nem cobranca.
28. Como dono do Casca, quero preservar a isencao das duas academias reais existentes.
29. Como dono do Casca, quero distinguir avaliacao comercial, teste interno, isencao e assinatura pagante.
30. Como dono do Casca, quero acompanhar receita recorrente dos pagantes sem contar testes e isencoes.
31. Como dono do Casca, quero acompanhar novas assinaturas e cancelamentos.
32. Como usuario, quero receber confirmacao de conta e recuperar acesso por e-mail.
33. Como responsavel, quero receber confirmacoes comerciais de adesao, pagamento, falha, troca e cancelamento.
34. Como dono do Casca, quero que notificacoes e eventos repetidos nao dupliquem cobrancas, trocas ou mensagens.
35. Como academia, quero que usuarios de outras academias nao possam ler nem alterar minha assinatura.
36. Como dono do Casca, quero configurar chaves e produtos fora do codigo para separar testes e producao.

## Implementation Decisions

- Catalogo unico no servidor: Essencial 9900 centavos/50 ativos; Academia 17900/150; Evolucao 29900/300; mesmos recursos e uma academia por assinatura.
- Assinatura comercial e isencao da academia sao dominios distintos da mensalidade/isencao do aluno ja existente no glossario.
- Um modulo de assinatura concentra operacoes publicas, acesso, regras de troca e aplicacao de eventos. HTTP, persistencia, relogio e envio de e-mail sao limites substituiveis para teste.
- A identidade da academia sempre vem da sessao; usuario nao escolhe tenant, valor, status ou privilégio global pelo payload.
- Admin da plataforma tem autorizacao separada por identidade confiavel no servidor, sem ampliar os papeis professor/student do produto.
- Rotas comerciais nao colidem com a assinatura publica de documentos existente. A assinatura SaaS usa a area Conta; o admin fica fora do shell da academia.
- Checkout de cartao e trial ficam hospedados no AbacatePay. IDs de produto por ambiente sao configuracao de servidor. Um checkout aberto nao concede acesso.
- O teste comercial começa com confirmacao confiavel do provedor e e limitado a tres dias. Nova contratacao apos avaliacao anterior nao repete o beneficio.
- Webhook autenticado, validado e deduplicado; eventos nao podem promover tenant errado nem regredir um estado novo por entrega antiga. Conciliacao usa dados confiaveis do provedor.
- Periodo de acesso comercial e estado de cobranca sao distintos: cancelamento interrompe renovacao, mas preserva o acesso ja pago.
- Limites e somente leitura sao garantidos tambem no banco para cobrir clientes diretos e concorrencia. SELECT e historicos permanecem disponiveis; operacoes publicas/privilegiadas tambem verificam permissao de escrita.
- Novas academias com assinatura ausente nao ganham acesso irrestrito. A transicao dos clientes existentes preserva explicitamente sua isencao; producao depende de aplicacao controlada posterior.
- Upgrade proporcional usa preco/datas no servidor e cobranca avulsa identificada; somente a confirmacao libera capacidade imediata e agenda o novo valor recorrente. A troca nativa do provedor so aplica no proximo ciclo. O fluxo deve ser retomavel e impedir pagamentos concorrentes/duplicados.
- Downgrade agenda proximo ciclo; validar capacidade na solicitacao e na efetivacao, sem apagar/desativar aluno. O limite pendente deve ser respeitado para nao agendar um estado impossivel.
- Eventos comerciais e lembrete previo usam caixa de saida persistente, idempotencia e reexecucao segura. E-mail de autenticacao continua sob Supabase Auth com SMTP Resend.
- UI reaproveita componentes, tokens, feedback, carregamento, vazio, erro e responsividade atuais.

## Testing Decisions

- Proposta de fronteira principal: interface publica de assinatura, observando acesso, checkout, eventos, trocas, autorizacao e efeitos comerciais por resultados externos; nao testar funcoes privadas ou detalhes do banco por espelhos do codigo.
- Prior art: casos de uso de cadastro e callback ja testados com dependencias externas substituidas e Vitest.
- Contratos HTTP sao testados com respostas representativas do provedor, sem chaves, cobrancas ou e-mails reais.
- Regras de limite devem provar que somente aumento efetivo consome capacidade, preservando mudancas validas em academias ja acima do limite.
- Revisao de protecoes de banco cobre sessao autenticada, isolamento, escritas diretas e chamadas privilegiadas, preservando SELECT. Aplicacao real de migration fica fora desta execucao.
- Browser valida LP, navegacao comercial, acesso negado, responsividade e ausencia de overflow; fluxos autenticados dependentes de ambiente nao configurado sao declarados blocked.
- Typecheck e testes focados por ticket; suite completa ao final; revisao paralela Standards/Spec antes da verificacao dvd-tests.

## Out of Scope

- Cobrar mensalidades dos alunos via AbacatePay, automacao WhatsApp, exportacao Excel, redes/multiunidade, novos recursos exclusivos por plano e redesenho global.
- Acesso do admin global a fichas de alunos, impersonacao e concessao de admin por formulario publico.
- Aplicar migrations, alterar alunos reais, enviar mensagens reais, cobrar cartoes reais, configurar contas externas, publicar deploy ou fazer push.
- Mudar a condicao comercial dos dois clientes atuais ou adicionar os arquivos locais nao rastreados preexistentes aos commits.

## Further Notes

- Escopo sintetizado da conversa aprovada; nenhuma nova entrevista de produto.
- A autorizacao de implementar todos os tickets e commitar por ticket veio do usuario em 2026-10-29.
- O roteiro de ativacao deve listar migrations, variaveis Vercel, verificacao de dominio Resend/SMTP Supabase, produtos/cartao AbacatePay, webhooks HTTPS, agendamento de notificacoes, identidade do admin e verificacao das isencoes antes de ativar cobranca.
- Fontes primarias: https://docs.abacatepay.com/pages/subscriptions/reference ; https://docs.abacatepay.com/pages/subscriptions/change-plan ; https://docs.abacatepay.com/pages/webhooks/reference ; https://resend.com/docs/send-with-supabase-smtp .
