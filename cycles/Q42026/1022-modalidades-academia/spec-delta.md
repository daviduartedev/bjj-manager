# Delta proposto — MVP 0.2

Após implementação e validação, propor atualizar modalidade/graduação, alunos, schema, cadastro/provisionamento, planos, turmas/portal, painel e documentos. Preservar identificadores e semântica JJ. Corrigir descrições antigas de cadastro público indisponível e de certificado genérico exigir faixa, conforme comportamento validado. Não promover automaticamente para spec/ antes da confirmação humana.

## T1 / #28 — expansão implementada, validação humana pendente
- Academia e intenção de cadastro recebem `modality` persistida, não nula; default/backfill `jiu_jitsu`. Valores previstos: `jiu_jitsu`, `boxing`, `muay_thai`, `judo`.
- Cadastro público aceita somente Jiu-Jitsu até #38; ausência do campo mantém compatibilidade. A modalidade segue pela intenção protegida, nunca por metadata de autorização.
- RPC de intenção ganha assinatura explícita com modalidade; assinatura anterior continua disponível e delega a Jiu-Jitsu. A provisão lê a modalidade da intenção, mantendo consumo permanente, transação e idempotência.
- Contexto autenticado resolve modalidade da academia vinculada pelo perfil; modalidade ou papel ilegíveis não produzem contexto. Configurações exibe o valor persistido.
- UPDATE direto da modalidade é recusado para roles de API; a futura troca controlada terá seu próprio contrato na #37.
- Política/estado de graduação passam a distinguir ausência, adaptador legado JJ e referência de catálogo. Nenhum campo ou identificador legado é removido; regras/catálogos novos entram nas suas fatias.
