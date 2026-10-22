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

## T5 / #32 — proposta após implementação
- Judô registra graduação concedida por professor via RPC atômica, com lock/reavaliação concorrente, evento próprio e atualização da ficha. Sem repetição/regresso/futuroSP ou referência estrangeira; data anterior conhecida não pode regredir. Saltos ordinais exigem motivo por rastreabilidade Casca.
- Orientação CBJ2023 aponta tabela/linha/edição: dispensa adulta das básicas (§5), idades por ano salvo1dan16completos (§2), carências padrão e regimes especiais não aferidos (§§7–9). Exceção identificável aceita com justificativa; carência indeterminável quando data anterior desconhecida, sem inferir matrícula. Não certifica nem administra exame/homologação.
- Evento append-only pela API conserva graduação/data de origem, inclusiveNULL, destino/data, salto/motivo, exceções/fonte e autor. RLS professor do tenant/aluno próprio; escrita somente RPC autorizada. Títulos não determinam permissões.
- Perfil e histórico completo mostram estado atual e eventos ilustrados com data efetiva, motivo e orientação considerada; primeiro evento conserva o estado preexistente desconhecido. Promover estas propostas para specs de graduação/perfil/schema/segurança somente após integração e validação humana.

## T6 / #33 — proposta após implementação
- Muay Thai registra graduação concedida no catálogo CBMTT19 pelo mesmo contrato atômico professor/tenant de T5. Avanço ordinal de khan distingue16→17→18→19 dourados; repetição/regresso/futuroSP/referência estrangeira são recusados. Salto exige motivo persistido, sem aceitar espaços Unicode como justificativa.
- Evento conserva graduação e data de origem inclusiveNULL; nova data concedida atualiza ficha e histórico juntos. Falha de evento reverte a ficha; chamadas concorrentes reavaliam o estado após o lock. API de histórico permanece append-only e leitura respeita professor do tenant/aluno próprio; títulos/honrarias não alteram acesso.
- Perfil e histórico completo mostram khan/cores/títulos, datas, salto e motivo, com estado preexistente desconhecido explícito. Referência/fonte/consulta e limites ficam visíveis: sem critérios CBMTT de idade/carência inventados, sem prontidão/créditos/equivalência declarada IFMA15, sem exame/SNG/homologação/certificação CBMTT/IFMA. OrientaçãoCBJ permanece apenas noJudô.
- Propor atualização das specs de graduação/perfil/schema/segurança após integração e validação humana; não promover automaticamente estas notas para spec/ nem liberar cadastro público antes de #38.

## T7 / #34 — proposta após implementação
- Turma persiste o esporte da academia, distinto do público `kind`. Novas modalidades só aceitam público Adulto; Jiu-Jitsu conserva adulto/kids/baby, inclusive ficha kids em turma Baby.
- Servidor e triggers recusam modalidade, instrutor, aluno, aula, vínculo, check-in ou presença de outro tenant ou incompatíveis com a conta. Check-in continua separado da presença manual; remover presença não apaga o check-in.
- Portal lê somente a ficha da sessão e mostra graduação JJ, nível Judô/Muay com data desconhecida explícita, ou nenhum bloco de graduação no Boxe. Aluno não opera turma.
- Planos e mensalidades não ganham cobrança por modalidade. Propor atualização das specs de turmas/portal/schema após integração e validação humana; não promover automaticamente para spec/.

## T8 / #35 — proposta após implementação
- KPIs de alunos, carteira, recebido e aulas permanecem. O alerta de prontidão 120/365 dias e o quadro de faixas ficam só no Jiu-Jitsu.
- Boxe não mostra distribuição nem alerta de graduação. Judô e Muay Thai mostram a graduação atual por nível, com rótulos que separam níveis da mesma cor. Data desconhecida não vira duração nem elegibilidade a partir da entrada.
- Seletores de plano/público em mensalidades e planos de aula oferecem só Adulto fora do Jiu-Jitsu, sem apagar cadastros comerciais. Títulos esportivos não alteram permissão. Não promove estas notas automaticamente para spec/.

## T9 / #36 — proposta após implementação
- Novas emissões de matrícula nas modalidades novas usam o nome da academia e o esporte, sem ASLAM nem Jiu-Jitsu, e recusam termo de menor. O Jiu-Jitsu e os payloads já gravados sem modalidade continuam no texto histórico.
- Comprovante cita a modalidade quando ela está no payload. Certificado genérico continua sem faixa; nas modalidades novas declara que não há homologação federativa. Recibo e numeração não mudam.
- O PDF já armazenado é o snapshot. Reemitir ou assinar um payload antigo não reescreve o texto para outra modalidade. A spec antiga que exigia faixa no certificado não corresponde ao certificado genérico já entregue; esta nota não promove essa exigência. Não promover automaticamente para spec/.

## T10 / #37 — proposta após implementação
- A modalidade só muda por `switch_academy_modality`, chamada pelo professor da própria academia, com a conta travada e sem aluno (inclusive removido), turma, aula, pagamento ou documento.
- Plano comercial, nome e preço permanecem. A troca não cria aluno nem mensalidade. Cancelar na configuração não grava. Não promover automaticamente para spec/.
