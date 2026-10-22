# Notas de implementação

## T1 / #28 — expansão compatível

`031_academy_modality.sql` adiciona apenas a modalidade em academia/intenção e expande funções; o default preenche academias e intenções anteriores como Jiu-Jitsu sem UPDATE nas tabelas operacionais ou em timestamps. Schema/policies espelhados foram atualizados. Banco existente deve receber 031 antes de executar a versão nova da aplicação; o leitor autenticado não inventa fallback se a coluna/valor estiver ausente.

A RPC de três argumentos permanece e delega à assinatura de quatro argumentos com JJ. A nova assinatura é exclusiva de service_role, mantém validação de usuário realmente novo e ON CONFLICT DO NOTHING: tentativas repetidas não reescrevem a escolha. Provisão usa intenção confiável e preserva locks/consumo/transação existentes. A API pública continua limitada a JJ até #38.

`protect_account_modality` é SECURITY INVOKER e recusa alteração direta por authenticated/anon, preservando mudanças legítimas de nome/branding. A futura RPC de troca (#37) deve executar sob papel privilegiado com autorização explícita, checagem atômica de bloqueadores e coordenação das escritas concorrentes; não basta remover o guard.

Contratos compartilhados usam slugs `jiu_jitsu`, `boxing`, `muay_thai`, `judo`. Política de JJ delega às regras existentes; novos estados distinguem graduação ausente e catálogo por referência com data desconhecida legítima. Não houve migração dos consumidores legados ou dos IDs de faixas. Dados esportivos não determinam papel de acesso.

Mitigação/rollback: a migração é transacional e aditiva. Para recuar a aplicação, manter colunas/default e RPC legada; não apagar modalidades/intenção após novos dados terem sido cadastrados. O validador local aplica a migração dentro de sua transação e reverte tudo; aplicação persistente em ambiente de teste deve ser feita explicitamente pelo coordenador, sem usar configuração de produção.

Semântica conhecida preexistente observada no seed: `white` adulto e kids compartilham slug único e o seed preserva somente a primeira ocorrência. A prova usa `gray_white` kids existente, preservando esse baseline; não é correção autorizada nesta fatia.
