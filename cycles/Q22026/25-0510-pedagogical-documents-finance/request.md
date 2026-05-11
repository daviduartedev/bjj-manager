# Módulo Pedagógico, Documental e Automação de Recibos

## 1. Contexto do problema

O produto já possui base administrativa para autenticação, cadastro de alunos, perfil do aluno, planos e operações financeiras básicas. A operação diária da academia, porém, ainda depende de artefatos externos e processos manuais em três frentes críticas:

1. Planejamento pedagógico mensal por turma/professor.
2. Geração e distribuição de documentos formais do aluno.
3. Emissão de recibos no ato do pagamento.

Hoje, o professor frequentemente precisa manter planos de aula em documentos avulsos, armazenados fora da plataforma, sem versionamento histórico, sem filtros e sem rastreabilidade por turma, mês e responsável. Em paralelo, certificados, termos, comprovantes e recibos tendem a ser produzidos manualmente em editores externos, consumindo tempo operacional, gerando inconsistência visual e dificultando auditoria.

No módulo financeiro, o registro de pagamento já é um evento operacional relevante, mas ainda não se desdobra automaticamente em um documento formal persistido, versionado, auditável e compartilhável por canais de comunicação usuais da academia, especialmente WhatsApp.

Este ciclo introduz um conjunto de capacidades documentais e pedagógicas que aproximam o produto de uma operação SaaS madura para academias de Jiu-Jitsu, com foco em:

- formalização dos processos da academia;
- redução de trabalho manual;
- aumento de rastreabilidade e governança;
- preparação de base arquitetural para automações futuras;
- suporte a operação multiusuário com permissões.

---

## 2. Objetivo de negócio

### 2.1 Objetivos primários

- Centralizar o planejamento pedagógico mensal dentro do sistema.
- Transformar documentos operacionais em artefatos gerados pelo produto.
- Automatizar a emissão de recibos a partir do fluxo financeiro existente.
- Reduzir tempo administrativo por professor/secretaria.
- Aumentar consistência documental, histórico e auditabilidade.

### 2.2 Resultados esperados

- Professor consegue criar, duplicar, consultar e exportar planos de aula sem depender de ferramentas externas.
- Secretaria ou professor consegue gerar documentos do aluno em poucos cliques, com dados já preenchidos.
- Todo pagamento registrado com sucesso passa a ter recibo emitido, armazenado e recuperável.
- O sistema passa a oferecer base confiável para futura integração com WhatsApp API oficial e rotinas automatizadas de envio.

### 2.3 Métricas de sucesso

- Redução perceptível do tempo médio para gerar documentos recorrentes.
- 100% dos pagamentos registrados pela UI padrão geram um recibo associado.
- 100% dos planos mensais ficam historicamente consultáveis.
- Taxa de reemissão de documentos sem inconsistência de dados.
- Redução de uso de documentos externos paralelos para rotina pedagógica.

---

## 3. Escopo do ciclo

### 3.1 Incluído

- Módulo de plano de aula mensal por turma/categoria.
- Histórico, filtros, duplicação, edição, visualização e exportação de plano.
- Módulo documental do aluno com geração de PDFs.
- Geração automática de recibo ao acionar pagamento.
- Persistência de metadados documentais e arquivos PDF.
- Fluxo inicial de compartilhamento via WhatsApp Web/`wa.me`.
- Modelo RBAC preparado para expansão além do professor dono.

### 3.2 Fora do escopo imediato

- Assinatura eletrônica com validade jurídica ICP-Brasil.
- Upload de assinatura manuscrita pelo aluno em tempo real.
- Integração plena com WhatsApp Business API.
- Workflow de aprovação formal de plano pedagógico.
- Editor colaborativo em tempo real.
- Portal do aluno para autoatendimento documental.

---

## 4. Premissas e decisões de produto

### 4.1 Premissas

- Stack alvo: React, Next.js, TypeScript, Node.js, API REST, Prisma ORM, PostgreSQL e S3 compatível.
- PDFs serão gerados a partir de templates HTML renderizados server-side.
- O sistema é multi-tenant por academia (`account_id` ou equivalente).
- O telefone do aluno já existe ou será normalizado no cadastro.
- O sistema atual já possui fluxo de registrar pagamento manual.

### 4.2 Decisões arquiteturais

- Documentos devem ser gerados no backend para garantir consistência, segurança e reprodutibilidade.
- O frontend apenas solicita geração, consulta status e apresenta download/compartilhamento.
- PDFs serão persistidos com versionamento lógico, sem sobrescrever versões anteriores.
- O conteúdo pedagógico rico será armazenado em formato estruturado e também renderizável para PDF.
- A automação do recibo será síncrona do ponto de vista de negócio, mas com mecanismo de recuperação para falhas de renderização/storage.

### 4.3 Dependência em aberto

- O enunciado menciona que o layout do recibo deve se basear em uma imagem de referência, porém essa imagem não está presente neste contexto de trabalho. Esta spec assume um recibo simples, limpo, formal e parametrizável. Quando o artefato visual oficial estiver disponível, o template deve ser refinado sem alterar o contrato de dados.

---

## 5. Fluxo do usuário

### 5.1 Fluxo macro do professor

1. Acessa o painel autenticado.
2. Navega para `Pedagógico > Planos de Aula`.
3. Filtra por mês, categoria e status.
4. Cria um novo plano ou duplica plano do mês anterior.
5. Edita conteúdo rico organizado por tópicos, técnicas e observações.
6. Salva rascunho ou publica.
7. Visualiza, imprime ou exporta PDF do plano.

### 5.2 Fluxo macro documental

1. Acessa o perfil do aluno ou módulo documental.
2. Seleciona tipo de documento.
3. Sistema exibe preview com dados preenchidos automaticamente.
4. Usuário confirma geração.
5. Sistema gera PDF, persiste arquivo e metadados.
6. Usuário faz download ou envia por WhatsApp.

### 5.3 Fluxo macro financeiro com recibo automático

1. Usuário acessa tela financeira.
2. Clica em `Pagar`.
3. Backend registra pagamento.
4. Evento de domínio dispara emissão de recibo.
5. Recibo é salvo e vinculado ao pagamento e ao aluno.
6. Frontend exibe sucesso com atalhos:
   - baixar PDF;
   - abrir no navegador;
   - compartilhar por WhatsApp;
   - reemitir se permitido.

---

## 6. Personas e perfis operacionais

| Persona | Objetivo | Necessidade principal | Risco atual |
| --- | --- | --- | --- |
| Professor responsável | Planejar aulas e manter padrão pedagógico | Registro histórico por turma e mês | Perda de histórico e documentos dispersos |
| Secretaria | Emitir documentos e recibos | Rapidez e padronização | Retrabalho manual e erro de preenchimento |
| Financeiro | Registrar pagamento com comprovante | Rastreabilidade e auditoria | Falta de vínculo formal entre pagamento e recibo |
| Coordenador pedagógico | Revisar planejamento | Visão por categoria e período | Falta de comparação histórica |

---

## 7. Funcionalidade 1 — Módulo de plano de aula

### 7.1 Objetivo funcional

Criar um módulo para cadastro, manutenção, versionamento lógico, consulta e exportação de planos de aula mensais por categoria/turma.

### 7.2 Categorias suportadas no MVP

- Adulto
- Kids 1
- Kids 2

### 7.3 Campos obrigatórios do plano

| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `title` | string | sim | Ex.: `Plano de aula - Maio/2026 - Adulto` |
| `referenceMonth` | `YYYY-MM` | sim | Mês de referência pedagógica |
| `category` | enum | sim | `ADULTO`, `KIDS_1`, `KIDS_2` |
| `richDescription` | rich text / JSON | sim | Conteúdo longo organizado |
| `topics` | lista estruturada | sim | Itens macro do plano |
| `techniques` | lista estruturada | não | Técnicas detalhadas |
| `observations` | texto/rich text | não | Notas complementares |
| `attachments` | lista de arquivos | não | PDFs, imagens, docs, planilhas |
| `status` | enum | sim | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `teacherId` | uuid | sim | Responsável principal |

### 7.4 Conteúdo pedagógico de referência canônica

O sistema deve suportar integralmente o seguinte exemplo real de conteúdo pedagógico:

#### Maio — Adulto

- finalizar controle de adversários
- estabilização 100 kilos
- controle da montada
- finalizações
- 4 quedas
- 4 sequências de drills
- revisão de aulas anteriores

#### Maio — Kids 1

- 4 brincadeiras (1 por semana)
- aquecimento interativo e lúdico
- explorar 100 kilos
- joelho na barriga
- montada
- armlock
- Nami Juji Jime
- generalidades:
  - ano de fundação
  - cores das faixas
  - fundador
  - idade da academia
  - contar em japonês

#### Maio — Kids 2

- aquecimento médio
- drills de passagem de guarda
- pontinho 2x
- meia guarda
- 4 raspagens
- 2 finalizações
- 4 quedas

### 7.5 Requisitos funcionais

#### 7.5.1 Cadastro e manutenção

- Permitir criar plano manualmente do zero.
- Permitir duplicar plano existente para outro mês.
- Permitir editar plano em rascunho.
- Permitir arquivar plano sem apagar histórico.
- Permitir anexar materiais de apoio.
- Permitir salvar rascunho com validação parcial.
- Permitir publicar plano somente quando campos mínimos estiverem completos.

#### 7.5.2 Consulta

- Exibir listagem com paginação.
- Permitir busca textual por título, professor e conteúdo resumido.
- Permitir filtro por mês, categoria, status e professor.
- Permitir ordenação por data de criação, data de atualização e mês de referência.
- Exibir visualização detalhada com conteúdo rico formatado.

#### 7.5.3 Exportação

- Permitir impressão amigável.
- Permitir exportação em PDF com cabeçalho da academia.
- Preservar tópicos, subtópicos e seções no PDF.

### 7.6 Experiência ideal do professor

- O professor inicia pela listagem mensal, entendendo rapidamente o que já existe por categoria.
- A ação principal da tela é `Novo plano` e a secundária é `Duplicar mês anterior`.
- Ao duplicar, o sistema carrega estrutura, tópicos e técnicas, mas sinaliza que o novo plano ainda está em rascunho.
- O editor deve privilegiar produtividade, com blocos claros, subtítulos, listas e reorder simples.
- A preview do PDF deve refletir exatamente a ordem pedagógica registrada.
- O professor deve conseguir montar um plano mensal inteiro sem alternar entre múltiplas telas.

### 7.7 UX da tela

#### 7.7.1 Listagem

- Cabeçalho com título, resumo do mês e CTA de criação.
- Filtros persistidos em querystring.
- Tabela ou cards densos com:
  - título;
  - categoria;
  - mês;
  - professor;
  - status;
  - última atualização;
  - ações rápidas.

#### 7.7.2 Formulário/editor

- Layout em duas colunas no desktop:
  - coluna principal para conteúdo;
  - sidebar para metadados, status, anexos e ações.
- Mobile com seções empilhadas.
- Componentes sugeridos:
  - `PageHeader`
  - `Section`
  - `Card`
  - `RichTextEditor`
  - `TagInput`
  - `SortableTopicList`
  - `AttachmentUploader`
  - `StatusBadge`
  - `TeacherSelect`
  - `MonthPicker`
  - `PreviewDrawer`

#### 7.7.3 Visualização

- Cabeçalho com breadcrumbs.
- Blocos por seção: visão geral, tópicos, técnicas, observações, anexos, histórico.
- Botões: `Editar`, `Duplicar`, `Exportar PDF`, `Imprimir`.

### 7.8 Possíveis evoluções futuras

- Planejamento semanal derivado do mensal.
- Associação de plano a calendário/aulas executadas.
- Checklist de execução por aula.
- Comentários colaborativos entre professores.
- Aprovação por coordenador pedagógico.
- IA para sugerir estrutura baseada em meses anteriores.

---

## 8. Funcionalidade 2 — Documentos do aluno

### 8.1 Tipos documentais do MVP

- Certificados
- Termos de responsabilidade
- Comprovante de matrícula
- Recibos de pagamento

### 8.2 Objetivo funcional

Criar um módulo que permita gerar documentos padronizados com preenchimento automático a partir de dados do aluno, da academia e do contexto financeiro.

### 8.3 Requisitos funcionais

- Permitir gerar documento diretamente pelo perfil do aluno.
- Permitir gerar documento pelo módulo documental central.
- Permitir preview antes da emissão final quando aplicável.
- Persistir metadados da geração e arquivo PDF.
- Permitir download.
- Permitir compartilhamento via WhatsApp Web.
- Registrar emissor, data/hora, versão do template e origem da emissão.

### 8.4 Dados dinâmicos esperados

| Documento | Dados dinâmicos mínimos |
| --- | --- |
| Certificado | nome do aluno, categoria, faixa, data, texto padronizado, nome da academia, assinatura |
| Termo de responsabilidade | nome do aluno ou responsável, CPF se aplicável, dados da academia, cláusulas, data, assinatura institucional |
| Comprovante de matrícula | nome, CPF, data de matrícula, plano/turma, valor se aplicável, academia |
| Recibo | nome do pagador, CPF, valor, competência, meses pagos, recebedor, CNPJ, data, assinatura |

### 8.5 UX ideal

- Dentro do perfil do aluno, uma aba ou bloco `Documentos`.
- Cards para cada tipo com descrição curta.
- Ação de `Gerar documento`.
- Modal leve com preview de dados preenchidos e campos complementares, se necessários.
- Histórico abaixo com documentos já emitidos e seus status.

### 8.6 Estrutura técnica

- Templates HTML versionados no backend.
- Payload tipado por tipo documental.
- Serviço central `DocumentGenerationService`.
- Estratégia de renderização desacoplada por template.
- Persistência em duas camadas:
  - metadados no PostgreSQL;
  - binário PDF no S3.

### 8.7 Geração server-side vs client-side

#### Decisão

Priorizar geração server-side.

#### Justificativas

- evita vazamento de dados sensíveis e regras de template para o cliente;
- garante renderização consistente entre navegadores;
- simplifica trilha de auditoria;
- facilita geração por eventos de backend, jobs e integrações futuras;
- permite reemissão determinística da mesma versão.

#### Uso residual client-side

- preview simplificado em HTML no frontend;
- abertura de `wa.me` com mensagem precomposta;
- visualização do PDF gerado após upload concluído.

### 8.8 Storage ideal dos PDFs

- Bucket privado por ambiente.
- Prefixos por tenant e tipo documental.
- Nomenclatura sugerida:
  - `accounts/{accountId}/documents/{documentType}/{year}/{month}/{documentNumber}.pdf`
- Arquivos privados com URL assinada temporária para download.
- Metadados persistidos:
  - `storage_key`
  - `bucket`
  - `mime_type`
  - `file_size_bytes`
  - `checksum_sha256`
  - `template_version`

### 8.9 Versionamento dos documentos

- Cada emissão gera um registro imutável.
- Reemissão gera nova versão lógica, nunca sobrescreve o original.
- `document_number` pode permanecer por série documental, enquanto `version` incrementa.
- O documento resultante deve armazenar um snapshot do payload usado na geração.
- Template também deve possuir `template_version` para reprodutibilidade.

---

## 9. Funcionalidade 3 — Geração automática de recibo ao pagar

### 9.1 Objetivo funcional

Ao clicar em `Pagar` no sistema financeiro, a plataforma deve gerar automaticamente um recibo formal vinculado ao pagamento e ao aluno.

### 9.2 Campos obrigatórios do recibo

- nome do pagador
- CPF
- valor pago
- descrição da mensalidade
- meses pagos
- recebedor
- CNPJ
- data
- assinatura digital ou imagem

### 9.3 Fluxo transacional ideal

1. Usuário dispara ação de pagamento.
2. Backend valida permissões e consistência do pagamento.
3. Transação persiste pagamento no banco.
4. Sistema publica evento de domínio `payment.recorded`.
5. Orquestrador documental gera `receipt` com payload congelado.
6. PDF é renderizado.
7. Arquivo é salvo no storage.
8. Metadados são persistidos como documento e vinculados ao pagamento.
9. UI recebe resposta de sucesso com resumo e links acionáveis.

### 9.4 Estratégia arquitetural

#### Opção recomendada

Persistir pagamento na transação principal e disparar geração do recibo em processamento assíncrono curto, com retorno otimista controlado ao frontend.

#### Racional

- reduz acoplamento entre persistência financeira e renderização de PDF;
- evita perda total do pagamento por falha transitória no storage;
- permite retentativa idempotente;
- preserva rastreabilidade por status do recibo.

#### Contrato de UX

Após marcar pagamento:

- se o recibo for gerado imediatamente, exibir link direto;
- se estiver em processamento, exibir estado `Gerando recibo...`;
- se falhar, exibir pagamento concluído com ação `Tentar gerar novamente`.

### 9.5 Persistência e rastreabilidade

- pagamento possui vínculo opcional/obrigatório com documento do tipo recibo;
- recibo guarda snapshot do contexto financeiro;
- alterações futuras no aluno não devem modificar documentos já emitidos;
- reemissões devem apontar para o documento original ou série documental.

### 9.6 Assinatura

MVP:

- suportar assinatura institucional em imagem PNG/SVG previamente cadastrada nas configurações da conta;
- fallback para nome digitado do responsável com linha de assinatura.

Futuro:

- certificado digital;
- assinatura biométrica;
- trilha jurídica avançada.

### 9.7 Template HTML/PDF do recibo

Diretrizes:

- visual simples, limpo e formal;
- tipografia neutra;
- foco na legibilidade de valores, nomes e competência;
- bloco de identificação do recebedor;
- bloco textual de quitação;
- assinatura no rodapé;
- numeração documental visível.

### 9.8 Reemissão

- Permitida apenas para perfis com permissão específica.
- Reemissão não deve apagar ou substituir o documento original.
- Motivo da reemissão deve ser auditável.
- É recomendável selo visual `2ª via` ou `Reemissão`.

### 9.9 Numeração

Sugestão:

- série por tenant e tipo documental;
- formato: `REC-{YYYY}-{sequencial}`;
- sequencial monotônico por conta.

### 9.10 Auditoria

Registrar:

- quem marcou o pagamento;
- quando o pagamento foi registrado;
- qual template foi usado;
- quem disparou reemissão;
- número e versão do recibo;
- status de entrega por WhatsApp quando houver tentativa.

---

## 10. Requisitos funcionais consolidados

### 10.1 Pedagógico

- RF-PLN-001: criar plano mensal por categoria.
- RF-PLN-002: editar plano existente.
- RF-PLN-003: duplicar plano para novo mês.
- RF-PLN-004: listar planos com filtros.
- RF-PLN-005: visualizar plano completo.
- RF-PLN-006: anexar materiais.
- RF-PLN-007: exportar plano em PDF.
- RF-PLN-008: manter histórico imutável de registros publicados.

### 10.2 Documental

- RF-DOC-001: gerar certificado.
- RF-DOC-002: gerar termo de responsabilidade.
- RF-DOC-003: gerar comprovante de matrícula.
- RF-DOC-004: gerar recibo manualmente quando aplicável.
- RF-DOC-005: armazenar PDF no storage.
- RF-DOC-006: disponibilizar download por URL assinada.
- RF-DOC-007: compartilhar via WhatsApp.
- RF-DOC-008: versionar documentos.

### 10.3 Financeiro

- RF-REC-001: ao pagar, gerar recibo automaticamente.
- RF-REC-002: vincular recibo ao pagamento.
- RF-REC-003: permitir reemissão auditável.
- RF-REC-004: permitir reenvio por WhatsApp.
- RF-REC-005: expor histórico documental no detalhe financeiro do aluno.

---

## 11. Requisitos não funcionais

| Código | Requisito |
| --- | --- |
| RNF-001 | Toda operação deve respeitar isolamento multi-tenant. |
| RNF-002 | Geração de PDF deve ser determinística para o mesmo payload e mesma versão de template. |
| RNF-003 | URLs de download devem ser temporárias e assinadas. |
| RNF-004 | Dados sensíveis em documentos devem ter acesso controlado por RBAC. |
| RNF-005 | O sistema deve registrar logs estruturados para geração, falha, upload, reemissão e compartilhamento. |
| RNF-006 | O módulo deve ser compatível com crescimento de volume documental sem exigir redesign de storage. |
| RNF-007 | UX principal deve funcionar em desktop e mobile. |
| RNF-008 | Operações críticas devem ser idempotentes sempre que houver risco de repetição por retry. |
| RNF-009 | Campos monetários devem permanecer em centavos no backend/banco. |
| RNF-010 | O editor pedagógico deve suportar textos longos e listas extensas sem degradação severa de usabilidade. |

---

## 12. Regras de negócio

### 12.1 Planos de aula

- RB-PLN-001: Um plano pertence exatamente a uma conta e a uma categoria.
- RB-PLN-002: Pode existir mais de um plano por mês/categoria apenas se houver necessidade explícita de múltiplas versões, mas apenas uma pode estar `PUBLISHED` como versão ativa padrão.
- RB-PLN-003: Duplicação herda conteúdo e anexos referenciáveis, mas não herda status publicado.
- RB-PLN-004: Plano publicado não deve ser sobrescrito silenciosamente; alterações relevantes devem gerar nova revisão lógica ou trilha clara de auditoria.

### 12.2 Documentos

- RB-DOC-001: Todo documento emitido precisa de número documental quando o tipo exigir formalização.
- RB-DOC-002: Documento emitido é imutável em conteúdo; correções geram nova versão.
- RB-DOC-003: O payload usado para geração deve ser salvo em snapshot JSON.
- RB-DOC-004: Template version e payload version devem ser persistidos.

### 12.3 Recibos

- RB-REC-001: Pagamento concluído pela UI oficial deve disparar tentativa de geração de recibo.
- RB-REC-002: Se a geração falhar, o pagamento continua válido, mas o recibo fica com status `FAILED`.
- RB-REC-003: Reprocessamento deve ser idempotente por `payment_id`.
- RB-REC-004: Um pagamento pode ter múltiplas versões de recibo, mas apenas uma versão corrente ativa.
- RB-REC-005: CPF do pagador pode vir do aluno, responsável financeiro ou campo informado no ato do pagamento, conforme regra operacional.

---

## 13. Casos de uso

### 13.1 UC-PLN-01 — Criar plano mensal

- Ator: professor.
- Pré-condição: usuário autenticado com permissão pedagógica.
- Fluxo principal:
  1. acessar módulo pedagógico;
  2. clicar em `Novo plano`;
  3. preencher mês, categoria, título e conteúdo;
  4. salvar rascunho;
  5. publicar quando pronto.
- Pós-condição: plano salvo e consultável.

### 13.2 UC-PLN-02 — Duplicar plano do mês anterior

- Ator: professor.
- Fluxo:
  1. localizar plano anterior;
  2. clicar em `Duplicar`;
  3. escolher novo mês;
  4. revisar conteúdo;
  5. salvar como rascunho.

### 13.3 UC-DOC-01 — Gerar comprovante de matrícula

- Ator: secretaria ou professor.
- Fluxo:
  1. abrir perfil do aluno;
  2. clicar em `Gerar comprovante`;
  3. revisar preview;
  4. confirmar emissão;
  5. baixar ou compartilhar.

### 13.4 UC-REC-01 — Registrar pagamento e gerar recibo

- Ator: financeiro ou professor.
- Fluxo:
  1. abrir mensalidade;
  2. clicar em `Pagar`;
  3. informar dados necessários;
  4. confirmar;
  5. sistema salva pagamento;
  6. sistema gera recibo;
  7. usuário baixa ou compartilha.

### 13.5 UC-REC-02 — Reemitir recibo

- Ator: financeiro com permissão.
- Fluxo:
  1. abrir pagamento;
  2. consultar recibos;
  3. clicar em `Reemitir`;
  4. informar motivo;
  5. sistema gera nova versão.

---

## 14. Estrutura de entidades

### 14.1 Visão geral

As entidades abaixo assumem nomes conceituais. O ajuste fino para a base existente deve respeitar os padrões já adotados no projeto.

| Entidade | Finalidade |
| --- | --- |
| `LessonPlan` | Registro principal do plano mensal |
| `LessonPlanRevision` | Histórico/revisão do conteúdo do plano |
| `LessonPlanAttachment` | Anexos do plano |
| `DocumentTemplate` | Registro de templates versionados |
| `GeneratedDocument` | Metadados da emissão documental |
| `GeneratedDocumentDelivery` | Tentativas de compartilhamento/entrega |
| `PaymentReceiptLink` | Vínculo entre pagamento e documento recibo |

### 14.2 Sugestão de modelagem Prisma

```prisma
enum LessonPlanCategory {
  ADULTO
  KIDS_1
  KIDS_2
}

enum LessonPlanStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum DocumentType {
  CERTIFICATE
  LIABILITY_TERM
  ENROLLMENT_PROOF
  PAYMENT_RECEIPT
}

enum GeneratedDocumentStatus {
  PENDING
  GENERATING
  GENERATED
  FAILED
  ARCHIVED
}

enum DeliveryChannel {
  WHATSAPP_WEB
  WHATSAPP_API
  DOWNLOAD
  EMAIL
}

enum DeliveryStatus {
  PENDING
  OPENED
  SENT
  FAILED
  CANCELED
}

model LessonPlan {
  id                String               @id @default(cuid())
  accountId         String
  teacherId         String
  title             String
  referenceMonth    String               // YYYY-MM
  category          LessonPlanCategory
  status            LessonPlanStatus     @default(DRAFT)
  currentRevisionId String?
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
  archivedAt        DateTime?

  revisions         LessonPlanRevision[]
  attachments       LessonPlanAttachment[]
}

model LessonPlanRevision {
  id                 String   @id @default(cuid())
  lessonPlanId       String
  revisionNumber     Int
  richDescription    Json
  topics             Json
  techniques         Json?
  observations       Json?
  createdByUserId    String
  createdAt          DateTime @default(now())

  lessonPlan         LessonPlan @relation(fields: [lessonPlanId], references: [id])
}

model LessonPlanAttachment {
  id             String   @id @default(cuid())
  lessonPlanId   String
  storageKey     String
  fileName       String
  mimeType       String
  fileSizeBytes  Int
  uploadedByUserId String
  createdAt      DateTime @default(now())

  lessonPlan     LessonPlan @relation(fields: [lessonPlanId], references: [id])
}

model DocumentTemplate {
  id              String       @id @default(cuid())
  accountId       String?
  type            DocumentType
  version         Int
  name            String
  htmlSource      String
  cssSource       String?
  schemaJson      Json
  isActive        Boolean      @default(true)
  createdAt       DateTime     @default(now())
}

model GeneratedDocument {
  id                String                  @id @default(cuid())
  accountId         String
  studentId         String?
  paymentId         String?
  type              DocumentType
  status            GeneratedDocumentStatus @default(PENDING)
  documentNumber    String?
  version           Int                     @default(1)
  templateVersion   Int
  payloadSnapshot   Json
  storageKey        String?
  bucket            String?
  mimeType          String?
  fileSizeBytes     Int?
  checksumSha256    String?
  generatedByUserId String
  generatedAt       DateTime?
  failureReason     String?
  supersedesId      String?
  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt

  deliveries        GeneratedDocumentDelivery[]
}

model GeneratedDocumentDelivery {
  id                  String         @id @default(cuid())
  generatedDocumentId String
  channel             DeliveryChannel
  status              DeliveryStatus @default(PENDING)
  recipientPhone      String?
  payloadSnapshot     Json?
  createdByUserId     String
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  generatedDocument   GeneratedDocument @relation(fields: [generatedDocumentId], references: [id])
}
```

### 14.3 Observações de modelagem

- `LessonPlanRevision` separa histórico de conteúdo e reduz risco de perda de rastreabilidade.
- `GeneratedDocument.payloadSnapshot` é crucial para auditoria e reprocessamento.
- `DocumentTemplate` deve admitir template global do sistema e override por conta no futuro.
- `paymentId` em `GeneratedDocument` permite lookup direto do recibo associado.

---

## 15. Fluxos de backend

### 15.1 Fluxo de criação de plano

1. `POST /api/lesson-plans`
2. Validar autenticação e tenant.
3. Validar payload base.
4. Criar `LessonPlan`.
5. Criar `LessonPlanRevision` inicial.
6. Apontar `currentRevisionId`.
7. Emitir evento `lesson_plan.created`.

### 15.2 Fluxo de atualização de plano

1. `PUT /api/lesson-plans/:id`
2. Validar permissão.
3. Carregar plano atual.
4. Criar nova revisão, em vez de mutar conteúdo histórico.
5. Atualizar metadados do plano.
6. Emitir `lesson_plan.updated`.

### 15.3 Fluxo de geração documental

1. Receber comando de geração.
2. Resolver template ativo por tipo.
3. Coletar dados necessários do aluno, pagamento e conta.
4. Construir `payloadSnapshot`.
5. Criar registro `GeneratedDocument` com status `GENERATING`.
6. Renderizar HTML.
7. Converter HTML em PDF.
8. Fazer upload no S3.
9. Atualizar `GeneratedDocument` para `GENERATED`.
10. Emitir `document.generated`.

### 15.4 Fluxo automático de recibo

1. `payment.recorded`
2. Listener `GenerateReceiptOnPaymentHandler`
3. Verificar idempotência por `paymentId`
4. Montar payload do recibo
5. Invocar serviço documental
6. Vínculo com pagamento
7. Logs, métricas e auditoria

### 15.5 Recuperação de falhas

- falha em renderização: status `FAILED`, erro persistido;
- falha em upload: status `FAILED`, job retentável;
- falha parcial após upload e antes do commit: reconciliar por checksum/storage key;
- múltiplos cliques em `Pagar`: proteção por idempotency key ou bloqueio transacional de UI/endpoint.

---

## 16. Fluxos de frontend

### 16.1 Módulo pedagógico

- rota sugerida: `/pedagogico/planos`
- subrotas:
  - `/pedagogico/planos`
  - `/pedagogico/planos/novo`
  - `/pedagogico/planos/[id]`
  - `/pedagogico/planos/[id]/editar`

### 16.2 Módulo documental

- entrada por perfil do aluno:
  - `/alunos/[id]` com aba `Documentos`
- entrada central:
  - `/documentos`
  - `/documentos/[documentId]`

### 16.3 Financeiro com recibo

- na tela de mensalidades e no detalhe do aluno, após `Pagar`, abrir toast/summary com:
  - `Pagamento registrado`
  - status do recibo
  - atalhos de baixar/enviar

### 16.4 Estados visuais necessários

- `idle`
- `saving`
- `saved`
- `generating`
- `generated`
- `failed`
- `archived`

### 16.5 Validações de frontend

- mês obrigatório;
- categoria obrigatória;
- texto mínimo no plano publicado;
- telefone em formato normalizado antes de exibir CTA de WhatsApp;
- campos monetários formatados em BRL, transportados em centavos.

---

## 17. Permissões e RBAC

### 17.1 Papéis sugeridos

| Papel | Descrição |
| --- | --- |
| `OWNER` | dono da academia |
| `ADMIN` | gestão ampla |
| `INSTRUCTOR` | professor com foco pedagógico |
| `FINANCE` | responsável financeiro |
| `SECRETARY` | operação administrativa e documental |
| `VIEWER` | leitura restrita |

### 17.2 Matriz de permissões

| Ação | OWNER | ADMIN | INSTRUCTOR | FINANCE | SECRETARY | VIEWER |
| --- | --- | --- | --- | --- | --- | --- |
| criar plano | sim | sim | sim | não | não | não |
| editar plano | sim | sim | sim | não | não | não |
| publicar plano | sim | sim | sim | não | não | não |
| exportar plano PDF | sim | sim | sim | sim | sim | sim leitura |
| gerar certificado | sim | sim | sim | não | sim | não |
| gerar termo | sim | sim | não | não | sim | não |
| gerar comprovante | sim | sim | não | não | sim | não |
| registrar pagamento | sim | sim | não | sim | sim | não |
| reemitir recibo | sim | sim | não | sim | sim com política | não |
| enviar documento WhatsApp | sim | sim | sim quando aluno próprio | sim | sim | não |

### 17.3 Regras de autorização

- Toda query deve filtrar por tenant.
- Todo acesso a documento deve validar papel e vínculo à conta.
- Ações de reemissão exigem trilha de auditoria e motivo obrigatório.
- Download de documento deve gerar URL temporária apenas após autorização.

---

## 18. Integrações

### 18.1 Storage

- S3 ou compatível.
- Necessário suporte a upload binário, ACL privada e URL assinada.

### 18.2 HTML -> PDF

Bibliotecas/estratégias possíveis:

- Playwright headless para imprimir HTML em PDF.
- Puppeteer como alternativa.
- `@react-pdf/renderer` apenas se o time preferir DSL própria, mas não é a recomendação principal para templates formais ricos em HTML/CSS.

Recomendação:

- Playwright server-side, pela previsibilidade de CSS moderno e facilidade de pixel-tuning.

### 18.3 WhatsApp

#### Fase 1

- abertura de `wa.me` ou WhatsApp Web com mensagem pronta;
- o PDF não será anexado automaticamente de forma robusta pelo `wa.me`;
- a UX recomendada é:
  - gerar documento;
  - copiar mensagem automaticamente;
  - abrir WhatsApp em nova aba;
  - oferecer link assinado temporário para o documento.

#### Fase 2

- integração com API oficial do WhatsApp Business;
- envio programático de template message;
- possível envio de documento como media attachment;
- persistência de message id, status e callback.

### 18.4 Assinatura institucional

- usar imagem cadastrada em configurações da conta;
- asset armazenado em bucket privado ou controlado.

---

## 19. Critérios de aceitação

### 19.1 Plano de aula

- CA-PLN-001: usuário com permissão consegue criar plano em rascunho.
- CA-PLN-002: usuário consegue publicar plano com título, mês, categoria e conteúdo válidos.
- CA-PLN-003: duplicação cria novo plano para outro mês sem sobrescrever o original.
- CA-PLN-004: listagem permite filtrar por categoria, mês, status e professor.
- CA-PLN-005: exportação PDF preserva estrutura hierárquica do conteúdo.
- CA-PLN-006: histórico continua acessível após novas revisões.

### 19.2 Documentos

- CA-DOC-001: comprovante de matrícula é gerado com dados do aluno automaticamente preenchidos.
- CA-DOC-002: documento gerado fica disponível por download com URL assinada.
- CA-DOC-003: histórico exibe tipo, número, versão, emissor e data de emissão.
- CA-DOC-004: compartilhamento por WhatsApp monta mensagem com telefone do aluno e link do documento.

### 19.3 Recibo automático

- CA-REC-001: ao registrar pagamento com sucesso, o sistema cria tentativa de emissão de recibo.
- CA-REC-002: recibo gerado fica vinculado ao pagamento correto.
- CA-REC-003: recibo contém nome, CPF, valor, descrição, meses pagos, recebedor, CNPJ, data e assinatura.
- CA-REC-004: falha na geração do recibo não invalida o pagamento.
- CA-REC-005: reemissão cria nova versão auditável.

---

## 20. Casos extremos

| Cenário | Comportamento esperado |
| --- | --- |
| aluno sem telefone | ocultar CTA de WhatsApp e informar ausência de contato válido |
| aluno com telefone inválido | exigir normalização antes do envio |
| pagamento duplicado por duplo clique | impedir via idempotência/lock de UI |
| template removido | impedir geração e registrar falha de configuração |
| storage indisponível | manter metadado em `FAILED` e permitir retry |
| PDF muito grande por anexos/HTML excessivo | limitar anexos no PDF principal e manter anexos separados |
| alteração futura do nome do aluno | documentos antigos permanecem com snapshot original |
| publicação de segundo plano do mesmo mês/categoria | exigir confirmação e política explícita de versão ativa |
| tentativa de acesso cross-tenant | bloquear e auditar |
| reemissão sem justificativa | rejeitar operação |

---

## 21. Estrutura sugerida de APIs

### 21.1 Pedagógico

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/lesson-plans` | listar com filtros |
| `POST` | `/api/lesson-plans` | criar plano |
| `GET` | `/api/lesson-plans/:id` | obter detalhe |
| `PUT` | `/api/lesson-plans/:id` | atualizar metadados e criar revisão |
| `POST` | `/api/lesson-plans/:id/duplicate` | duplicar plano |
| `POST` | `/api/lesson-plans/:id/publish` | publicar plano |
| `POST` | `/api/lesson-plans/:id/archive` | arquivar |
| `GET` | `/api/lesson-plans/:id/pdf` | gerar/baixar PDF |
| `POST` | `/api/lesson-plans/:id/attachments` | anexar arquivo |

### 21.2 Documentos

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/documents` | listar documentos |
| `POST` | `/api/documents/generate` | gerar documento por tipo |
| `GET` | `/api/documents/:id` | detalhe e metadados |
| `POST` | `/api/documents/:id/reissue` | reemitir documento |
| `POST` | `/api/documents/:id/whatsapp-link` | gerar payload de compartilhamento |
| `GET` | `/api/documents/:id/download-url` | obter URL assinada |

### 21.3 Financeiro e recibo

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/api/payments` | registrar pagamento |
| `GET` | `/api/payments/:id` | detalhe do pagamento |
| `GET` | `/api/payments/:id/receipt` | recibo corrente |
| `POST` | `/api/payments/:id/receipt/retry` | regenerar recibo falho |
| `POST` | `/api/payments/:id/receipt/reissue` | reemitir recibo |

### 21.4 Contrato de payload exemplo

```json
{
  "type": "ENROLLMENT_PROOF",
  "studentId": "stu_123",
  "context": {
    "issueDate": "2026-05-10",
    "notes": "Documento emitido para fins escolares."
  }
}
```

---

## 22. Sugestão de modelagem de backend e serviços

### 22.1 Estrutura sugerida de pastas

```text
app/
  (dashboard)/
    pedagogico/
      planos/
    documentos/
lib/
  lesson-plans/
    service.ts
    repository.ts
    validators.ts
    pdf.ts
  documents/
    service.ts
    templates/
      certificate/
      liability-term/
      enrollment-proof/
      payment-receipt/
    renderer.ts
    storage.ts
    numbering.ts
    whatsapp.ts
    audit.ts
  payments/
    service.ts
    receipt-handler.ts
prisma/
  schema.prisma
```

### 22.2 Serviços sugeridos

- `LessonPlanService`
- `LessonPlanPdfService`
- `DocumentGenerationService`
- `DocumentTemplateResolver`
- `PdfRenderService`
- `DocumentStorageService`
- `WhatsAppShareService`
- `ReceiptGenerationOnPaymentService`
- `DocumentAuditService`

### 22.3 Eventos do sistema

- `lesson_plan.created`
- `lesson_plan.updated`
- `lesson_plan.published`
- `document.generation.requested`
- `document.generated`
- `document.generation.failed`
- `payment.recorded`
- `receipt.generated`
- `receipt.failed`
- `document.whatsapp_link.generated`
- `document.reissued`

---

## 23. Estratégia de geração de PDFs

### 23.1 Abordagem recomendada

- template HTML + CSS versionado;
- render em contexto server-side;
- conversão com Playwright em modo headless;
- upload do binário para S3;
- retorno de metadados e URL assinada sob demanda.

### 23.2 Por que HTML -> PDF

- maior controle visual e fidelidade para documentos formais;
- reaproveitamento de conhecimento do time em HTML/CSS;
- facilidade para evoluir templates sem redesign da engine;
- preview HTML mais próximo do resultado final.

### 23.3 Boas práticas

- usar fontes embarcadas ou controladas;
- padronizar margens e tamanho A4;
- evitar dependência de assets externos públicos;
- incorporar logo/assinatura via URLs internas resolvidas no servidor;
- registrar tempo de renderização por template.

### 23.4 Estratégia de preview

- preview HTML no frontend a partir do mesmo payload;
- PDF final sempre gerado no backend;
- impedir que preview client-side seja considerado documento oficial antes da emissão.

---

## 24. Estratégia de envio para WhatsApp

### 24.1 Fase inicial com `wa.me`

Fluxo:

1. sistema normaliza telefone do aluno;
2. gera ou recupera URL assinada curta do documento;
3. monta mensagem padrão;
4. abre `https://wa.me/{telefone}?text={mensagem}`;
5. usuário conclui envio manualmente no WhatsApp.

### 24.2 Mensagem sugerida

```text
Olá! Segue o seu documento emitido pela academia: {documentTypeLabel}.
Referência: {documentNumber}
Link para acesso: {signedUrl}
```

### 24.3 Limitações conhecidas

- `wa.me` não faz upload binário automático do PDF.
- URL assinada expira, então o TTL deve equilibrar segurança e usabilidade.
- O envio final depende da ação humana no WhatsApp Web nesta fase.

### 24.4 Compatibilidade futura com API oficial

Preparar contrato interno para que o frontend não dependa do canal:

- `channel = WHATSAPP_WEB | WHATSAPP_API`
- `delivery_status`
- `external_message_id`
- `provider_response`

Assim, quando a API oficial entrar, a troca será predominantemente na camada de delivery service.

---

## 25. Validações

### 25.1 Planos

- `referenceMonth` no formato `YYYY-MM`;
- `title` entre 5 e 150 caracteres;
- `category` obrigatória;
- publicação exige ao menos um tópico válido;
- anexos com limite configurável de tipo e tamanho.

### 25.2 Documentos

- tipo documental obrigatório;
- aluno deve pertencer ao tenant do emissor;
- para recibo, pagamento deve existir e estar quitado/registrado;
- reemissão exige motivo.

### 25.3 WhatsApp

- telefone normalizado em E.164 quando possível;
- se inválido, bloquear abertura do compartilhamento.

---

## 26. Logs, observabilidade e auditoria

### 26.1 Logs estruturados

Campos mínimos:

- `event_name`
- `account_id`
- `user_id`
- `student_id`
- `payment_id`
- `document_id`
- `document_type`
- `template_version`
- `status`
- `duration_ms`
- `error_code`
- `error_message`

### 26.2 Auditoria de negócio

Registrar em trilha auditável:

- criação/edição/publicação de plano;
- emissão e reemissão de documentos;
- falha e retry de recibo;
- geração de link de WhatsApp;
- download sensível, se política da conta exigir.

### 26.3 Métricas operacionais

- tempo médio de geração por tipo;
- taxa de falha por template;
- número de reemissões por mês;
- percentual de pagamentos com recibo gerado com sucesso;
- uso do módulo pedagógico por categoria.

---

## 27. Segurança e compliance

- isolamento por tenant em todas as entidades novas;
- URLs assinadas com expiração curta;
- não expor caminhos internos do bucket ao cliente;
- mascarar dados sensíveis em logs quando necessário;
- respeitar LGPD para documentos com CPF e dados pessoais;
- manter política de retenção e descarte sob governança da conta.

---

## 28. Estratégia de rollout

### 28.1 Ordem recomendada

1. modelagem de dados e migrations;
2. serviços de documento e storage;
3. geração manual de documentos;
4. módulo de planos pedagógicos;
5. automação de recibo no pagamento;
6. compartilhamento via WhatsApp Web;
7. observabilidade e hardening.

### 28.2 Feature flags sugeridas

- `feature_lesson_plans`
- `feature_student_documents`
- `feature_auto_receipts`
- `feature_whatsapp_share`

---

## 29. Estratégia de testes

### 29.1 Unitários

- validações Zod/DTOs;
- numeração documental;
- resolução de template ativo;
- builder de payload de recibo;
- normalização de telefone;
- regras de permissão.

### 29.2 Integração

- geração de documento com storage mockado;
- fluxo `payment -> receipt`;
- retries idempotentes;
- filtros de listagem de planos.

### 29.3 E2E

- professor cria e publica plano;
- secretaria gera comprovante;
- financeiro registra pagamento e baixa recibo;
- usuário sem permissão recebe bloqueio;
- tentativa cross-tenant falha.

---

## 30. Open questions recomendadas para refinamento posterior

- A academia deseja múltiplos professores responsáveis por um mesmo plano?
- O comprovante de matrícula precisa refletir preço/plano do aluno no instante da emissão?
- O termo de responsabilidade terá assinatura do responsável externo no MVP ou apenas emissão institucional?
- O recibo precisa aceitar pagador diferente do aluno em todos os fluxos?
- Há necessidade de série documental distinta por unidade/filial no futuro?

---

## 31. Checklist técnico final

- [ ] definir migrations para entidades pedagógicas e documentais
- [ ] adicionar enums de status e tipos documentais
- [ ] implementar políticas multi-tenant para novas tabelas
- [ ] implementar `LessonPlanService`
- [ ] implementar histórico por revisão
- [ ] implementar listagem com filtros e paginação
- [ ] implementar editor rico com suporte a tópicos longos
- [ ] implementar exportação PDF de plano
- [ ] implementar `DocumentGenerationService`
- [ ] implementar engine HTML -> PDF server-side
- [ ] implementar integração com S3 compatível
- [ ] implementar persistência de `payloadSnapshot`
- [ ] implementar URL assinada para download
- [ ] implementar histórico de documentos por aluno
- [ ] implementar estratégia de numeração documental
- [ ] implementar assinatura institucional configurável
- [ ] integrar gatilho de geração automática no pagamento
- [ ] implementar retry idempotente para recibo
- [ ] implementar reemissão com motivo obrigatório
- [ ] implementar compartilhamento inicial via `wa.me`
- [ ] implementar logs estruturados e auditoria
- [ ] cobrir com testes unitários, integração e e2e
- [ ] validar UX mobile e desktop
- [ ] alinhar template final do recibo quando a imagem oficial estiver disponível

---

## 32. Conclusão

Este ciclo amplia o produto de um sistema administrativo para uma plataforma operacional mais completa, cobrindo o eixo pedagógico, documental e financeiro com rastreabilidade. A combinação de histórico pedagógico, geração formal de documentos e automação de recibos aumenta a maturidade do SaaS, reduz dependências externas e prepara a base técnica para integrações futuras, especialmente em comunicação transacional, compliance e automações institucionais.
