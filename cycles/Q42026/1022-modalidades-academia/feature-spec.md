## Problem Statement

O Casca ainda presume que toda academia e todo aluno praticam Jiu-Jitsu e possuem faixa/grau. Isso impede cadastrar Boxe com fidelidade e representa inadequadamente as graduações de Judô e Muay Thai. Cadastro, planos, turmas, perfil, portal, painel e termos de matrícula precisam operar coerentemente com a modalidade da academia. As academias existentes devem continuar funcionando com seus dados, regras e documentos preservados.

## Solution

MVP 0.2 com uma modalidade por academia: Jiu-Jitsu, Boxe sem graduação, Muay Thai com catálogo completo CBMTT de 19 khan e Judô com catálogo completo CBJ. Nas três novas modalidades, este lote atende pessoas de 18 anos ou mais; os públicos e regras atuais do Jiu-Jitsu permanecem.

A modalidade é escolhida no cadastro público. Academias existentes recebem Jiu-Jitsu. Uma conta realmente vazia pode corrigir a modalidade em Configurações, mediante confirmação e verificação atômica de elegibilidade. Judô e Muay Thai registram graduação concedida pelo professor, incluindo graduação preexistente com data desconhecida. A operação completa inclui planos, turmas, presença, portal, painel e documentos adequados à modalidade.

Contrato consolidado e confirmado pelo usuário na entrevista grilling em 22/10/2026. Os pontos de teste e a divisão em tickets foram apresentados e aprovados pelo usuário antes da publicação.

## User Stories

1. As an academy owner, I want to choose Jiu-Jitsu, Boxing, Muay Thai or Judo during public registration, so that my academy starts with the correct sport.
2. As an academy owner, I want exactly one sport selected for my academy, so that its operational rules are unambiguous.
3. As an academy owner, I want the chosen sport preserved through email confirmation and account provisioning, so that I do not have to choose it again.
4. As an academy owner, I want invalid sport selections rejected before account creation, so that the account cannot start in an unsupported state.
5. As an existing Professor, I want my academy identified as Jiu-Jitsu automatically, so that the upgrade preserves my operation.
6. As an existing Professor, I want student identifiers, belts, degrees, graduation history, prices and documents preserved, so that the upgrade does not rewrite my business records.
7. As a Professor, I want to see the academy sport in settings, so that I can verify which rules apply.
8. As a Professor of an empty academy, I want to change its sport after confirming the consequences, so that I can correct its initial setup.
9. As a Professor, I want a sport change refused when any student exists, including archived or removed students, so that historical records keep their meaning.
10. As a Professor, I want a sport change refused when classes, lessons, payments or documents exist, so that existing operation is not reinterpreted.
11. As a Professor, I want settings and commercial plan setup alone to allow a sport change, so that preparation does not lock an otherwise empty academy.
12. As a Professor, I want a concurrent operational write to prevent an unsafe sport change, so that the emptiness check remains true when the change is saved.
13. As a Professor, I want Boxe, Muay Thai and Judô student registration restricted to people aged 18 or over, so that this release serves the agreed audience.
14. As a Professor, I want the eighteenth birthday calculated on the civil date in São Paulo, so that the age rule is consistent throughout the day.
15. As a Jiu-Jitsu Professor, I want existing adult, kids and baby flows preserved, so that the new sports do not change my age categories.
16. As a Boxing Professor, I want to register a student without a belt, degree or graduation date, so that I can record the sport truthfully.
17. As a Boxing Professor, I want full and quick student editing to work without graduation fields, so that routine maintenance does not invent a belt.
18. As a Boxing Professor, I want student lists and profiles without graduation badges, history, promotion actions or graduation durations, so that irrelevant information does not distract me.
19. As a Boxing Professor, I want direct graduation requests rejected by the server, so that hiding a button is not the only enforcement.
20. As a Boxing Professor, I want to assign the Adulto plan without a belt lookup, so that tuition works for an ungraded sport.
21. As a Judo Professor, I want to select a valid CBJ graduation when registering a student, so that the current rank is represented correctly.
22. As a Judo Professor, I want the complete selected CBJ catalogue, including kyū and dan, so that I can register experienced practitioners.
23. As a Judo Professor, I want a simple illustration accompanied by the graduation name, so that belts are recognizable and accessible.
24. As a Judo Professor, I want bicolour and higher-dan belts represented according to the selected reference, so that the artwork communicates the right graduation.
25. As a Judo Professor, I want Judo degrees represented independently of Jiu-Jitsu stripes, so that the system does not impose another sport's rules.
26. As a Muay Thai Professor, I want the published CBMTT catalogue of 19 khan, so that my students use an explicitly identified grading system.
27. As a Muay Thai Professor, I want the khan number, published colours and title distinguishable, so that ranks with similar colours remain distinct.
28. As a Muay Thai Professor, I want the graduation described as prajied/khan where appropriate, so that it is not presented as a Jiu-Jitsu belt.
29. As a Muay Thai Professor, I want instructor, master and honorary levels available as sporting information, so that already graduated practitioners can be registered.
30. As a Professor, I want sporting rank to leave access permissions unchanged, so that a title cannot grant staff privileges.
31. As a Judo or Muay Thai Professor, I want current graduation required in student registration, so that a graded sport has a valid current state.
32. As a Judo or Muay Thai Professor, I want an explicit beginner graduation available, so that beginners can be registered without fabricated achievements.
33. As a Professor registering a previously graduated student, I want to enter the current graduation directly, so that I do not have to reconstruct the student's previous career.
34. As a Professor, I want to leave a pre-existing graduation date unknown, so that I do not invent a date.
35. As a Professor, I want an unknown graduation date displayed as unknown, so that the system does not imply knowledge it does not have.
36. As a Professor, I want unavailable graduation duration left unavailable in the new graded sports, so that academy entry is not substituted for a missing graduation date.
37. As a Professor, I want academy entry and graduation dates kept separate, so that joining the academy does not restart or fabricate rank history.
38. As a Professor, I want current graduation selected only from the academy sport, so that a foreign catalogue cannot be submitted through a forged request.
39. As a Professor, I want to register a graduation already granted to a Judo or Muay Thai student, so that their history stays current.
40. As a Professor, I want an immediate forward graduation recorded without a jump reason, so that the ordinary operation stays short.
41. As a Professor, I want a forward jump accepted only with a recorded justification, so that exceptional updates remain traceable.
42. As a Professor, I want repeated or lower graduations rejected by the promotion operation, so that it cannot silently regress a student.
43. As a Professor, I want future graduation dates rejected using São Paulo's civil date, so that the history contains granted graduations.
44. As a Professor, I want graduation history and current state updated together, so that a failed operation cannot leave them inconsistent.
45. As a Professor, I want documented age and waiting-time guidance shown during promotion, so that I can make an informed registration.
46. As a Professor, I want an identifiable age or waiting-time exception recordable with justification, so that legitimate exceptions can be explained.
47. As a Professor, I want unknown prior dates reported as insufficient information for waiting-time assessment, so that the system does not estimate an eligibility date.
48. As a Muay Thai Professor, I want no age or waiting-time rule invented where the selected CBMTT reference provides none, so that guidance remains attributable.
49. As a Judo Professor, I want applicable CBJ exceptions considered in the guidance, so that adult basic-rank progression is not checked as a rigid children's sequence.
50. As a Professor, I want the grading reference and its limitations explained, so that a Casca record is not mistaken for federation certification.
51. As a Professor, I want one open commercial plan per student preserved, so that adding sports does not add automatic parallel tuition.
52. As a Professor, I want custom prices, Isento, Bolsista and due-day behaviour preserved, so that the operational wallet continues to mean the same thing.
53. As a Professor, I want classes associated with my academy sport, so that scheduling cannot mix incompatible sporting contexts.
54. As a Professor, I want classes, attendance and student enrolments to work for all supported sports, so that the new sport can operate beyond registration.
55. As a Professor, I want new-sport students to use the Adulto commercial context, so that kids and baby plans are not offered to them.
56. As a student, I want my own portal to show the correct sport and applicable information, so that my ficha matches my training.
57. As a student, I want my existing own-class and attendance access preserved, so that the new sport does not remove portal capabilities.
58. As a Professor, I want the dashboard student, attendance and finance information to work in every sport, so that I can run the academy daily.
59. As a Boxing Professor, I want the dashboard free of graduation indicators, so that an ungraded sport has no fictional progression.
60. As a Judo or Muay Thai Professor, I want applicable current-graduation distributions without automatic readiness alerts, so that the panel does not reuse Jiu-Jitsu heuristics.
61. As a Jiu-Jitsu Professor, I want my current readiness settings and alerts preserved, so that this release does not replace my academy policy.
62. As a Professor, I want controls and filters offered only where meaningful for the academy sport, so that the interface does not expose irrelevant categories.
63. As a Professor, I want new enrolment documents to identify the actual academy and sport, so that a Boxe, Muay Thai or Judô document does not describe another academy's Jiu-Jitsu operation.
64. As a Professor, I want sport-specific enrolment wording within the existing generation and signature flow, so that the new sports retain the current document workflow.
65. As a Professor, I want already generated and signed documents preserved, so that changing templates does not rewrite previously issued records.
66. As a Professor, I want generic receipts and certificates available in every sport, so that their issuance does not depend on a fictitious belt.
67. As a Professor, I want a generic certificate distinguished from federation recognition, so that document generation does not imply homologation.
68. As a keyboard or mobile user, I want the new selectors, illustrations and validation messages accessible, so that I can complete the same workflows.
69. As a Professor, I want field validation explained at the field and operational failures communicated clearly, so that I can recover without duplicated messages.
70. As a Professor, I want other academies' students, sport settings, graduations and documents inaccessible, so that tenant isolation survives the expansion.
71. As a student or user without a valid staff role, I want no ability to change sport, promote students or issue operational documents, so that fail-closed permissions remain intact.
72. As a maintainer, I want the exact adopted graduation references recorded with the catalogue, so that future changes can be reviewed without silently changing existing meanings.
73. As a maintainer, I want the data model to separate sport, graduation, commercial plan and class, so that future multi-sport support can be designed without conflating those concepts.
74. As a maintainer, I want partially implemented sports unavailable to ordinary production registration until their complete flows are validated, so that incremental delivery does not expose an unfinished academy.

## Implementation Decisions

### Modalidade, compatibilidade e persistência

- Uma modalidade por academia neste lote, com catálogo fechado dos quatro nomes aprovados. A modalidade e sua política de graduação são conceitos separados de tipo etário, plano comercial e turma.
- Preparar uma evolução futura para várias modalidades preservando essas separações; não implementar múltiplos vínculos de modalidade agora.
- A modalidade é obrigatória no novo cadastro público e persiste na intenção confiável de cadastro, confirmação e provisionamento. Metadata de autenticação não concede papel ou elegibilidade de criação. Preservar idempotência do provisionamento, tratamento de confirmação e demais validações do 0.1.
- Backfill de academias existentes para Jiu-Jitsu. Preservar identificadores de faixas e alunos, graus, histórico, vínculos, preços personalizados, pagamentos e documentos. Não reclassificar registros esportivos existentes em outra modalidade.
- Introduzir alterações de schema de forma aditiva e compatível antes de migrar consumidores. Preferir expandir o contrato ao lado do comportamento atual e adaptar consumidores por fluxo, mantendo Jiu-Jitsu utilizável entre entregas.
- Não representar Boxe com faixa branca, catálogo vazio fictício ou grau artificial. A ausência de graduação é um estado válido e imposto no servidor/persistência. Catálogos e referências de graduação são validados contra a modalidade da conta da sessão.
- Novas modalidades atendem adultos de 18 anos ou mais; nascimento continua obrigatório e o limite é aplicado no servidor no dia civil de America/Sao_Paulo. Exatamente no aniversário de 18 anos é elegível. Jiu-Jitsu conserva os recortes atuais.
- Definir uma política compartilhada de modalidade/graduação consumida pelos fluxos de aluno, planos, promoção, apresentação e documentos; evitar cópias divergentes da regra em cada formulário.
- Modalidades parcialmente entregues ficam restritas ao ambiente de desenvolvimento/validação até a integração do lote; isso é estratégia de entrega, não um catálogo configurável pelo usuário.

### Referências e catálogos esportivos

- Judô usa o regulamento de outorga CBJ listado como edição 2023 na fonte oficial consultada; registrar origem, edição, data de consulta e limitações. A referência consultada não equivale a uma certificação de conformidade integral com todos os comunicados posteriores.
- Catálogo Judô: iniciante branca; 11º kyū branca/cinza; 10º cinza; 9º cinza/azul; 8º azul; 7º azul/amarela; 6º amarela; 5º amarela/laranja; 4º laranja; 3º verde; 2º roxa; 1º marrom. Dan 1º–5º preta, 6º–8º vermelha/branca, 9º–10º vermelha. Identidades e ordenação distinguem níveis que compartilham a mesma cor.
- A inclusão do catálogo completo não cria público infantil no Judô. As regras aplicáveis são avaliadas no recorte adulto escolhido. Considerar as dispensas documentadas de sequência/carência das faixas básicas para maiores de 16 anos; não copiar um bloqueio linear infantil.
- Ilustrações simples das faixas de Judô nos pontos de escolha, perfil e histórico, com rótulo textual acessível, contraste e representação coerente de bicolores e dan. A descrição normativa das faixas orienta as ilustrações. Preservar os visuais atuais de Jiu-Jitsu. Não exigir ilustrações novas de Muay Thai neste lote.
- Muay Thai usa especificamente a tabela publicada pela CBMTT consultada em 22/10/2026, com 19 khan. A imagem não informa edição, carências ou idades; registrar essa ausência em vez de atribuir uma versão normativa fictícia.
- Catálogo CBMTT: 1 branco; 2 amarelo; 3 amarelo/branco; 4 verde; 5 verde/branco; 6 azul; 7 azul/branco; 8 marrom; 9 marrom/branco; 10 vermelho; 11 vermelho/branco (Instrutor / Kru Fueng Sorn); 12 vermelho/amarelo (Professor / Kru); 13 vermelho/prata (Mestrando / Kru Yai); 14 prata (Mestre / Arjarn); 15 prata/dourado (Grão Mestre / Arjarn Yai); 16–19 dourado (Grão Mestre / Arjarn Yai / honraria). Preservar o número do khan para distinguir os quatro níveis dourados.
- Usar a nomenclatura prajied/khan e cores da referência adotada, sem aplicar a estrutura de faixas/graus de Jiu-Jitsu. A tabela CBMTT de 19 khan não é declarada equivalente ao sistema IFMA de 15 khan anunciado em 2025.
- Títulos esportivos de instrutor, professor, mestre ou honraria não alteram o papel nem as capacidades de acesso do perfil.
- A referência adotada é identificável e tem sua revisão rastreável. Atualizações futuras de fontes não reordenam silenciosamente a graduação atual ou o histórico já gravado. Não criar editor genérico de graduações.

### Aluno, graduação atual, datas e promoção

- Boxe não exige nem apresenta faixa, grau, data de graduação, histórico, tempos de graduação ou ação Promover; requisições diretas de graduação são recusadas.
- Judô e Muay Thai exigem graduação atual válida inclusive no cadastro e na edição, com nível inicial explícito. A graduação preexistente pode ser cadastrada diretamente, sem reconstrução obrigatória do histórico.
- A data de uma graduação preexistente pode ficar desconhecida. Exibir Data não informada e tempo indisponível. Não substituir essa ausência por hoje, data de entrada ou uma data sentinela. Preservar a semântica existente de datas e aproximações do Jiu-Jitsu.
- Manter separados entrada na academia, graduação atual conhecida/desconhecida e novos eventos de promoção. Preservar recursos existentes como peso sem forçar a criação de uma graduação fictícia ou datada artificialmente.
- Registrar novas promoções concedidas, com data, de forma atômica junto à atualização da graduação atual. Repetição e regresso são inválidos; datas futuras são rejeitadas segundo o dia civil em São Paulo.
- Avanço imediato não exige motivo de salto. Avanço de várias posições requer justificativa persistida. Essa exigência é rastreabilidade do Casca e não é anunciada como exigência federativa.
- Idades e carências documentadas são orientação durante a promoção, sem bloqueio automático por esses critérios; exceção identificável requer justificativa. Sem data anterior conhecida, informar impossibilidade de avaliar a carência.
- Não inventar carências de Muay Thai onde a referência CBMTT adotada não as informa. Tratar particularidades e exceções CBJ documentadas, sem reutilizar regras de listras, reset ou máximo de graus do Jiu-Jitsu.
- A operação registra o que o professor concedeu; não administra exames, autorização de examinador, registro SNG, homologação, contribuição IFMA ou emissão de certificação federativa.

### Planos, turmas, portal e painel

- Preservar um único plano aberto por aluno, histórico de vínculos, preço personalizado, dia de vencimento, Isento, Bolsista e indicadores financeiros existentes.
- Novos públicos usam o contexto Adulto. A validação de plano em Boxe não depende de buscar uma faixa. Jiu-Jitsu mantém suas compatibilidades existentes, inclusive exceções já suportadas.
- Turma aponta a modalidade da academia e a valida contra a sessão; o tipo etário continua um conceito distinto. Preservar cadastro de turmas, aulas, vínculo do aluno, presença e check-in já existentes.
- Perfil, lista, edição completa/rápida, seletores, filtros e portal apresentam apenas controles pertinentes. Boxe não exibe campos/contagens fictícios de faixa. Judô e Muay Thai mostram seus próprios nomes e níveis.
- Manter as capacidades atuais de acesso próprio no portal. Um aluno não pode mudar a modalidade da academia, promover ninguém ou alterar campos operacionais de sua ficha.
- Painel financeiro, de alunos, aulas e presença funciona nas quatro modalidades. Boxe não apresenta indicadores de graduação. Judô e Muay Thai podem mostrar distribuição da graduação atual, mas não recebem alerta automático de prontidão neste lote.
- O cálculo e as configurações de prontidão atuais ficam restritos ao Jiu-Jitsu. Não reaproveitar a heurística de 120/365 dias nem a entrada como referência implícita para novas modalidades.

### Troca de modalidade em conta vazia

- Disponível em Configurações para quem já tem capacidade de gerenciar a academia; a graduação esportiva não concede essa capacidade.
- Bloqueadores: qualquer aluno, inclusive arquivado/removido, turma, aula, pagamento ou documento existente. Registro com status inativo também conta; a existência histórica não é descartada pelo filtro da UI.
- Configurações e catálogo comercial de planos, sozinhos, não bloqueiam. A confirmação informa a modalidade de destino e as adaptações concretas das configurações; cancelar não modifica nada.
- Revalidar elegibilidade e aplicar a troca atomicamente no servidor, coordenando a verificação com inserções operacionais concorrentes. Não aceitar uma troca baseada apenas em contagem prévia da UI.
- Preservar preços e nomes comerciais personalizados; adequar apenas contexto e opções aplicáveis à modalidade escolhida. Não apagar dados operacionais para tornar uma conta elegível.

### Documentos, apresentação e segurança

- Adequar os modelos de matrícula, comprovante e termo pertinentes para identificar a academia real e sua modalidade, com texto esportivo compatível. Remover referências fixas indevidas a ASLAM/Jiu-Jitsu nas novas emissões.
- Manter a estrutura e o fluxo atuais de geração, numeração, emissão e assinatura; versionar/snapshotar o conteúdo necessário para preservar integralmente documentos já emitidos ou assinados.
- Recibos e certificados genéricos permanecem disponíveis nas quatro modalidades; sua geração não exige faixa fictícia. Certificado genérico e histórico Casca não afirmam reconhecimento de CBJ, CBMTT ou IFMA.
- Textos e mensagens em português claro, erros de campo inline, falhas operacionais no padrão atual e controles acessíveis em teclado, mobile e temas existentes. Usar os componentes compartilhados disponíveis; não transformar este lote na migração ampla React Aria.
- Preservar autorização fail-closed e isolamento multi-tenant em leitura, escrita, provisionamento, troca de modalidade, catálogo aplicável, alunos, graduações, turmas e documentos. Resolver a academia no servidor; nunca confiar em academia/papel enviados pelo cliente.
- Preparar scripts/migrações e evidências em ambiente isolado; execução em produção não faz parte desta especificação de implementação.

## Testing Decisions

- Ponto principal de validação: jornadas reais do Professor pela interface e suas operações servidor/persistência, com fixtures descartáveis em ambiente isolado. Cobrir escolha da modalidade → confirmação/provisionamento → aluno → plano/turma/presença → promoção quando aplicável → documento. Não criar um cenário único longo; dividir as jornadas observáveis por fatia.
- Reutilizar a infraestrutura de navegador e autenticação já existente. Para comprovar isolamento, usar dois tenants com registros reais conhecidos e sessões de Professor/Aluno; UUID inexistente, mensagem genérica ou mock de banco não comprovam negação de acesso a registro real de outro tenant.
- Reutilizar o seam público do serviço de cadastro para entradas inválidas, persistência da modalidade na intenção e idempotência sem criar usuários reais em testes unitários; completar a prova do provisionamento real em ambiente descartável.
- Testes complementares apenas onde aumentam a precisão: tabelas de catálogo/ordem, esquema público de cadastro/edição, data civil/idade, transição de promoção e elegibilidade de troca. Usar expectativas literais independentes dos cálculos testados e testar efeitos observáveis.
- Exercitar no banco isolado a ausência de graduação em Boxe, coerência graduação/modalidade, atualização atômica da promoção, manutenção de um plano aberto e corrida entre troca de modalidade e criação operacional. Verificar dados de Jiu-Jitsu antes/depois da migração.
- Matrícula/documentos: testar conteúdo e payload pelo ponto público de geração com renderização real dos modelos; conferir academia/modalidade, ausência de textos de outra modalidade e preservação dos artefatos antigos. Separar testes de idempotência/numeração já existentes de uma validação visual de PDF/assinatura.
- Visual/teclado: seleção de modalidade e graduação, mensagens, mobile e ilustrações de Judô com nome/contraste. Não testar classes CSS, detalhes internos do componente ou snapshots que apenas espelhem a implementação.
- Prior art: testes de serviço de cadastro de academia, schemas de aluno, compatibilidade de plano, regras de graduação/data civil, referência temporal, geração/numeração/modelos de documentos e testes de navegador de autenticação, portal e isolamento.
- Casos mínimos: Boxe sem graduação com plano válido; Judô com kyū/dan do catálogo; Muay Thai distinguindo khan 15–19; aniversário de 18 hoje vs amanhã; data inicial desconhecida; promoção com salto justificado vs vazio; no-op/regresso/futuro rejeitados; prontidão JJ preservada e ausente nas novas modalidades; troca bloqueada por cada classe de registro e por concorrência; documentos novos corretos e antigos imutáveis.
- Rodar type-check, testes afetados, build e smoke integrado. Registrar separadamente o estado da suíte completa e a limitação preexistente do lint, sem declarar sucesso de um comando que não rodou ou falhou.
- Falta de ambiente/credenciais de teste é pendência de evidência, não aprovação implícita. Nenhuma conta ou dado de produção é fixture.
- Pontos de teste apresentados e aprovados pelo usuário antes da publicação da especificação.

## Out of Scope

- Várias modalidades por academia, vínculos multi-modalidade do aluno e recorrências adicionais.
- Infantil/baby em Boxe, Muay Thai e Judô neste lote; alteração dos recortes atuais do Jiu-Jitsu.
- Editor genérico de modalidades/faixas, sistemas customizados por academia ou equivalência automática CBMTT/IFMA.
- Exames, promoção automática, prontidão nova no painel, homologação ou certificação federativa.
- Migração de uma academia com operação existente entre modalidades ou exclusão de registros para liberar a troca.
- Revisão do fluxo inteiro de contratos/assinatura ou reescrita retroativa de documentos.
- Redesenho da landing, novos visuais de Jiu-Jitsu ou novas ilustrações detalhadas de Muay Thai.
- AbacatePay (MVP 0.3), papéis Dono/Gestor/Professor (V1) e migração React Aria ampla.
- Execução de migrações, seeds, deploys ou alterações em produção; instalação de dependências não solicitadas.
- Commits, push ou inclusão dos protótipos/configurações/pesquisas locais na entrega de produto.

## Further Notes

- Base técnica conferida: develop em 5e48ad370294253d774dd7d63d359a4e3002e8ff, após merge da PR #26. Checkout de trabalho continua na branch feat/cadastro-publico com alterações locais preservadas. A implementação deverá usar checkout separado a partir de develop.
- O lote aprovado foi ampliado na entrevista: além de Boxe, Muay Thai passou a ter graduação e Judô foi incluído. O título e os tickets precisam refletir esse escopo final.
- A pesquisa de concorrente previamente consolidada foi reutilizada. O Gymdesk confirma várias modalidades numa conta; isso informa uma evolução futura e não muda o limite de uma modalidade deste lote.
- Existem divergências documentais preexistentes: contrato canônico antigo ainda descreve cadastro público como fora do MVP; certificado antigo exige faixa na spec, mas o gerador atual é genérico. Registrar correções propostas no ciclo; promover para specs canônicas somente depois da validação.
- O programa React Aria #17–25 e as issues anteriores de alunos/painel/autorização continuam independentes. Reutilizar controles entregues e preservar o comportamento efetivo em develop; não fechar essas issues por consequência do 0.2.
- Esta issue registra proposta de implementação; o ciclo deve registrar pedido, plano, tarefas, cenários, delta de spec e evidências, sem anunciar comportamento ainda não implementado como validado.

Referências primárias consultadas em 22/10/2026:
- [CBJ — regulamentos esportivos e edição de outorga listada](https://cbj.com.br/pt/governanca/transparencia/regulamentos-esportivos/).
- [CBJ — regulamento de outorga de faixas 2023](https://cbj.com.br/public/uploads/regulamentos_esportivos/arquivo_cbj_180223310123.pdf).
- [CBMTT — história e graduações](https://www.cbmtt.org.br/historia-graduacoes.html).
- [CBMTT — tabela oficial publicada, 19 khan](https://www.cbmtt.org.br/images/graduacoes-cbmtt.jpg).
- [CBMTT — FAQ, reconhecimento e exames](https://www.cbmtt.org.br/faq.html).
- [IFMA — anúncio do sistema de 15 khan, 21/04/2025](https://muaythai.sport/ifma-launches-international-standard-for-muaythai-grading-system/).
- [CBJ — comunicado de 2025 sobre cadastro Zempo, publicado pela FPJ](https://fpj.com.br/wp-content/uploads/2025/07/Oficio-001-2025-CBJ-2-anos-de-zempo.pdf).
