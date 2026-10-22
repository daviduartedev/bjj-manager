# Delta proposto — MVP 0.2

Após implementação e validação, propor atualizar modalidade/graduação, alunos, schema, cadastro/provisionamento, planos, turmas/portal, painel e documentos. Preservar identificadores e semântica JJ. Corrigir descrições antigas de cadastro público indisponível e de certificado genérico exigir faixa, conforme comportamento validado. Não promover automaticamente para spec/ antes da confirmação humana.

## T1 / #28 — expansão implementada, validação humana pendente
- Academia e intenção de cadastro recebem `modality` persistida, não nula; default/backfill `jiu_jitsu`. Valores previstos: `jiu_jitsu`, `boxing`, `muay_thai`, `judo`.
- Cadastro público aceita somente Jiu-Jitsu até #38; ausência do campo mantém compatibilidade. A modalidade segue pela intenção protegida, nunca por metadata de autorização.
- RPC de intenção ganha assinatura explícita com modalidade; assinatura anterior continua disponível e delega a Jiu-Jitsu. A provisão lê a modalidade da intenção, mantendo consumo permanente, transação e idempotência.
- Contexto autenticado resolve modalidade da academia vinculada pelo perfil; modalidade ou papel ilegíveis não produzem contexto. Configurações exibe o valor persistido.
- UPDATE direto da modalidade é recusado para roles de API; a futura troca controlada terá seu próprio contrato na #37.
- Política/estado de graduação passam a distinguir ausência, adaptador legado JJ e referência de catálogo. Nenhum campo ou identificador legado é removido; regras/catálogos novos entram nas suas fatias.

## T3 / #30 — proposta após implementação
- Judô usa catálogo CBJ 2023 fechado de 22 posições, com referência/código independentes de faixa/grauJJ, data preexistente opcional explicitamente nula e SVG com nome textual.
- Cadastro/edição completos e rápidos exigem graduação atual CBJ válida e Adulto 18+; entrada não substitui graduação. Datas conhecidas futuras são recusadas. Estado preexistente não fabrica histórico nem papel de acesso.
- Persistência aditiva: catálogos globais somente leitura para authenticated; ficha com referência/código/data e FK composta. Peso permanece independente. Planos adultos, Isento e um vínculo aberto preservados.
- Propor atualização das specs de alunos/perfil/schema após validação integrada e humana. Promoção própria, painel, turmas/portal e liberação pública continuam em suas fatias; não promover estas notas automaticamente para spec/.

## T4 / #31 — proposta após implementação
- Muay Thai adota referência fechada CBMTT19 (`cbmtt-19-khan`), khan1–19 com cores/títulos esportivos e honrarias16–19 distintas pelo número. Branco iniciante explícito; nomenclatura khan/prajied, sem faixa/grauJJ ou permissões por título.
- Referência/origem/consulta22/10/2026 e limitações visíveis: tabela sem edição/idades/carências documentadas; sem equivalência declarada IFMA15 ou certificação federativa.
- Cadastro e edições exigem graduação válida, Adulto18+SP e decisão explícita sobre data preexistente. DataNULL preservada sem inferência por entrada; data futura recusada. Lista/perfil exibem khan e tempo indisponível quando desconhecido.
- Seeds idempotentes e guard de persistência034 ampliam o contrato referenciado de T3 sem reescrever dadosJJ/Boxe/Judô. Plano Adulto/único, preço, Isento/Bolsista preservados. Promoção própria, integração e validação humana continuam pendentes; não promover estas notas a spec/ automaticamente.
