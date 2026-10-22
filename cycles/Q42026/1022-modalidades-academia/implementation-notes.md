# Notas de implementação

## T1 / #28 — expansão compatível

`031_academy_modality.sql` adiciona apenas a modalidade em academia/intenção e expande funções; o default preenche academias e intenções anteriores como Jiu-Jitsu sem UPDATE nas tabelas operacionais ou em timestamps. Schema/policies espelhados foram atualizados. Banco existente deve receber 031 antes de executar a versão nova da aplicação; o leitor autenticado não inventa fallback se a coluna/valor estiver ausente.

A RPC de três argumentos permanece e delega à assinatura de quatro argumentos com JJ. A nova assinatura é exclusiva de service_role, mantém validação de usuário realmente novo e ON CONFLICT DO NOTHING: tentativas repetidas não reescrevem a escolha. Provisão usa intenção confiável e preserva locks/consumo/transação existentes. A API pública continua limitada a JJ até #38.

`protect_account_modality` é SECURITY INVOKER e recusa alteração direta por authenticated/anon, preservando mudanças legítimas de nome/branding. A futura RPC de troca (#37) deve executar sob papel privilegiado com autorização explícita, checagem atômica de bloqueadores e coordenação das escritas concorrentes; não basta remover o guard.

Contratos compartilhados usam slugs `jiu_jitsu`, `boxing`, `muay_thai`, `judo`. Política de JJ delega às regras existentes; novos estados distinguem graduação ausente e catálogo por referência com data desconhecida legítima. Não houve migração dos consumidores legados ou dos IDs de faixas. Dados esportivos não determinam papel de acesso.

Mitigação/rollback: a migração é transacional e aditiva. Para recuar a aplicação, manter colunas/default e RPC legada; não apagar modalidades/intenção após novos dados terem sido cadastrados. O validador local aplica a migração dentro de sua transação e reverte tudo; aplicação persistente em ambiente de teste deve ser feita explicitamente pelo coordenador, sem usar configuração de produção.

Semântica conhecida preexistente observada no seed: `white` adulto e kids compartilham slug único e o seed preserva somente a primeira ocorrência. A prova usa `gray_white` kids existente, preservando esse baseline; não é correção autorizada nesta fatia.


## T2 / #29 — Boxe sem graduação

A ficha de Boxe persiste current_belt_id/current_degree realmente nulos. O schema público usa a modalidade resolvida pela sessão e aceita omissão/null, recusando qualquer faixa ou grau inclusive zero, tipo kids/baby e menor de 18 na data civil de São Paulo. Nome/nascimento/entrada/plano/vencimento seguem os contratos existentes; Isento aceita plano em branco. As actions exigem professor, usam conta da sessão e validam o tipo persistido na edição rápida. Promoção/inclusão/edição/peso em graduação recusam Boxe antes de resolver IDs, com resposta uniforme inclusive para IDs de outro tenant.

Cadastro, ficha completa, edição rápida, lista desktop/mobile e perfil removem campos, badge, colunas/opções, histórico, tempos e promoção de Boxe. Peso permanece disponível e passa a students.weight_kg sem criar evento ou data. Os leitores de aluno representam null e não calculam duração de graduação ausente. A carteira mensal e seus resumos/detalhe já consultavam aluno/plano sem join de faixa: inspeção confirmou que não eliminam Boxe; não foi necessário alterá-los. O serviço de vínculo não consulta faixa para Adulto, preserva preço personalizado e o histórico/índice de um vínculo aberto.

032_boxing_students_without_graduation.sql expande a nulabilidade dos campos legados e adiciona peso na ficha. Triggers SECURITY INVOKER garantem graduação obrigatória em esportes graduados, ausência em Boxe, idade 18+/Adulto e plano Adulto; inserção/edição de histórico em Boxe é recusada. Os guards continuam sujeitos à RLS e retornam erro uniforme para referências invisíveis. Schema/policies foram espelhados. Não há UPDATE/backfill esportivo ou financeiro. O guard de self-update já existente impede aluno de alterar o novo peso operacional.

Mitigação: aplicar 032 antes de usar estes leitores/formulários. O validador aplica/reaplica somente em transação no banco local descartável e faz rollback. Não reverter as colunas para NOT NULL depois de existirem alunos de Boxe; para recuar a aplicação, manter schema expandido e bloquear temporariamente o fluxo Boxe. O coordenador controla a aplicação persistente em teste. Troca atômica/locks da academia permanecem para #37; painel/turmas/portal/documentos completos para seus tickets. Nenhuma modalidade nova foi liberada no cadastro público.
