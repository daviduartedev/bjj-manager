# Assinaturas comerciais e administracao da plataforma Casca

- Data: 2026-10-29 (America/Sao_Paulo)
- Tipo: Large; entregas verticais por ticket.
- Branch unica: `codex/assinaturas-admin-casca`.
- Base: `main`, `f1047a18957ce3ef008a5677c8da698238f79588`.
- Autorizacao: conversa de 2026-10-29 aprova o escopo, implementacao por subagents, todos os tickets e commits por ticket. Nao fazer push. A autorizacao cobre a sequencia de stages descrita no plano; nao exige novas aprovacoes a cada stage.
- URL local: http://localhost:3011 (`pnpm dev --port 3011`).

## Escopo aprovado

1. Assinatura mensal por academia, com todos os recursos atuais: Essencial R$ 99/50 alunos ativos; Academia R$ 179/150; Evolucao R$ 299/300. Acima de 300, sob consulta.
2. Teste comercial de tres dias com cartao na adesao, primeira cobranca automatica ao final, valor/data claros e lembrete previo.
3. AbacatePay cobra a assinatura da academia no Casca, nao as mensalidades dos alunos.
4. Resend atende e-mails de conta e assinatura; autenticacao via SMTP do Supabase e eventos comerciais pelo servidor.
5. Pagamento nao regularizado coloca a academia em somente leitura; dados permanecem acessiveis e preservados. Cancelamento voluntario preserva acesso ate o fim do periodo pago.
6. Limite considera somente alunos ativos nao arquivados/removidos. Ao atingir o limite, bloquear cadastros/reativacoes que aumentem o total, inclusive sob concorrencia. Nunca desativar/apagar alunos automaticamente.
7. Upgrade imediato depois de confirmar pagamento da diferenca proporcional; downgrade no proximo vencimento e somente se couber no limite de destino.
8. Academias internas de teste sem cobranca/prazo; academias isentas com motivo e historico. As duas academias reais atuais permanecem isentas e sem alteracao de dados de alunos.
9. Painel admin Casca somente para o dono da plataforma: academias, planos, limites, situacao, testes, isencoes, historico e metricas comerciais. Sem fichas de alunos e sem impersonacao.
10. Contratacao pela LP e conta com gerenciamento de assinatura, sem redesenho amplo.

## Restricoes

- Preservar todos os arquivos locais nao rastreados ja existentes, inclusive o cycle antigo `1022-assinatura-casca-abacatepay`; nao adiciona-los aos commits.
- Uma branch; um commit por ticket, caminhos explicitos no git add, mensagem em portugues sem acentos, corpo curto e `Refs #69` mais a issue do ticket.
- Nao executar SQL/migrations nem modificar servicos/dados de producao. Preparar migrations versionadas e instrucoes para aplicacao posterior pelo humano. Nenhum aluno real sera criado, editado ou removido.
- O novo escopo autoriza gerar migrations de assinatura e protecao de escrita, e as alteracoes de integracao necessarias nas actions; nao autoriza aplicar migrations.
- Sem dependencias novas. Integracoes HTTP via fetch no servidor.
- Segredos ficam em variaveis de ambiente server-side. Nunca ler ou imprimir valores para registrar evidencias.
- `spec/` continua a representar comportamento validado; propostas vivem em `spec-delta.md` ate validacao e promocao autorizada.
- Nenhum push, PR, deploy, cobranca real ou envio de e-mail real nesta execucao.

## Validacao

- Fronteira proposta: comportamento publico do servico de assinatura e seus contratos de integracao, com adapters externos substituidos em testes; browser verifica comportamento observavel das paginas.
- Typecheck recorrente e testes focados por ticket; suite completa uma vez ao final.
- Revisao paralela de Standards e Spec contra a base fixa.
- dvd-tests: executar UI local, mostrar pass/fail/blocked, screenshots desktop/mobile e checklist humano nao marcado. Chamadas reais dependentes de configuracao externa ficam explicitamente bloqueadas.
- Commits por ticket autorizados nesta conversa precedem a execucao final de dvd-tests; nao fazer commits adicionais depois da entrega do checklist sem nova demanda.

## Fontes

- Conversa e decisoes Q1-Q12 aprovadas.
- `CLAUDE.md`, `GLOSSARY.md`, specs backend/frontend/database/security e features authentication, rls-security, students-crud, app-shell e marketing-landing.
- Configuracao do tracker em `docs/agents/issue-tracker.md`: GitHub Issues, label `ready-for-agent`.
- O cycle antigo fica preservado como registro historico; este pedido substitui suas decisoes de plano unico e trial indefinido.
