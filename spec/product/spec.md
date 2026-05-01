# Especificação de produto — BJJ Manager

## 1. Visão

**SPEC-1.1.** O BJJ Manager é um SaaS web para **professores** de jiu-jitsu gerenciarem **alunos**, **graduações** e **mensalidades** da própria academia, com foco em clareza operacional e baixa fricção no dia a dia.

**SPEC-1.2.** O sistema prioriza **uma conta por academia** (multi-tenant no modelo de dados) para permitir evolução futura sem refatoração pesada.

**SPEC-1.3.** Moeda **BRL** e convenções de interface e dados em **pt-BR**.

---

## 2. MVP (dentro do escopo inicial)

**SPEC-2.1.** Autenticação do professor (**login** e-mail/senha) e **acesso** à conta da academia após **provisionamento manual** do utilizador e do vínculo conta/perfil (ver **AUTH-**, **SPEC-3.7**, [`docs/security/rls.md`](../../docs/security/rls.md)). A área operacional autenticada tem entrada canónica em **`/painel`** (rotas em pt-BR; ver **SHELL-2**).

**SPEC-2.2.** Cadastro, listagem, perfil e edição de alunos (adulto e kids).

**SPEC-2.3.** Gestão de **faixa**, **grau** e **histórico de graduação**, com regras de ordem e justificativa em pulos (ver [`graduation-rules.md`](graduation-rules.md)).

**SPEC-2.4.** Cálculos derivados de datas: idade, tempo de treino, tempo na faixa, tempo no grau — implementados com utilitários **puras**, **testáveis** e **pt-BR** no fuso **`America/Sao_Paulo`**, conforme regras **DATE-** em [`spec/features/date-duration-utilities/readme.md`](../features/date-duration-utilities/readme.md).

**SPEC-2.5.** Planos **Kids 1**, **Kids 2** e **Adulto** por conta (segmentação por idade/turma), valores configuráveis pelo professor; **preço personalizado** e **dia de vencimento** por aluno (ver [`billing-rules.md`](billing-rules.md)).

**SPEC-2.6.** Acompanhamento financeiro por **mês de referência**, com status **Pago**, **Não pago**, **Pendente**, **Bolsista** e **Outro**; **Pago** e **Bolsista** são sempre manuais; **Pendente** pode virar **Não pago** automaticamente após o vencimento (**BR-4.5**); sem gateway de pagamento no MVP.

**SPEC-2.7.** Dashboard com visão resumida e **alertas simples** (ex.: pendências de revisão mensal ou dados incompletos — detalhamento nos ciclos de UI).

---

## 3. Fora do MVP (explícito)

**SPEC-3.1.** Presença, turmas, QR code, WhatsApp, documentos, certificados.

**SPEC-3.2.** Exportação CSV/Excel.

**SPEC-3.3.** Login do aluno, portal do aluno, aplicativo móvel do aluno.

**SPEC-3.4.** Integração com gateways de pagamento, PIX automático, cobrança recorrente automática.

**SPEC-3.5.** Regras normativas avançadas de graduação (ex.: transferência entre academias, reconhecimento de faixa externa) — ver [`graduation-rules.md`](graduation-rules.md).

**SPEC-3.6.** Papéis organizacionais além do **professor** (secretaria, financeiro, multi-instrutor com permissões granulares).

**SPEC-3.7.** **Autocadastro** na aplicação (registro público de professor), **recuperação de senha** self-service na app e convites automáticos — fora do MVP inicial; o primeiro (ou único) utilizador operacional pode ser criado via Supabase e SQL conforme documentação de segurança.

---

## 4. Personas

**SPEC-4.1. (MVP)** **Professor / dono da academia**: cadastra alunos, registra graduações, define planos e preços, marca status de mensalidade, usa o dashboard.

**SPEC-4.2. (Futuro)** **Aluno**: acesso próprio a histórico e informações — fora do MVP (**SPEC-3.3**).

**SPEC-4.3. (Futuro)** **Colaborador** (secretaria, instrutor assistente): permissões delegadas — fora do MVP (**SPEC-3.6**).

---

## 5. Jornadas principais (MVP)

**SPEC-5.1.** **Onboarding do professor**: receber credenciais (provisionamento fora da app) → **entrar** (`/login`) → aceder ao **`/painel`** → configurar dados básicos da academia (conforme telas do ciclo de settings).

**SPEC-5.2.** **Gestão de aluno**: incluir aluno → definir tipo (adulto/kids), faixa/grau atuais → editar dados → visualizar **perfil** (`/alunos/[id]` — **SPR-**) e histórico de graduação.

**SPEC-5.3.** **Graduação**: registrar promoção de grau ou de faixa → se pulo de ordem, sistema **bloqueia** até **justificativa** obrigatória (ver **GR-** em [`graduation-rules.md`](graduation-rules.md)).

**SPEC-5.4.** **Cobrança**: definir planos Kids 1 / Kids 2 / Adulto e valores padrão → vincular aluno a plano → ajustar preço personalizado e dia de vencimento → por mês de referência, revisar status (**Pago**, **Não pago**, **Pendente**, **Bolsista**, **Outro**) — com **Pago** e **Bolsista** apenas por confirmação manual e **Pendente** evoluindo para **Não pago** conforme **BR-4.5** → opcionalmente **marcar todos como pagos** em lote para um recorte/mês (**BR-** em [`billing-rules.md`](billing-rules.md)).

**SPEC-5.5.** **Rotina mensal**: professor revisa pendências no dashboard e atualiza status de mensalidades do mês.

---

## 6. Métricas de sucesso (MVP)

**SPEC-6.1.** **Adoção interna**: professor consegue completar, sem suporte, o fluxo **SPEC-5.2** e **SPEC-5.4** para uma turma piloto (critério qualitativo de usabilidade).

**SPEC-6.2.** **Integridade de dados**: 100% das promoções que violam ordem de faixa exigem justificativa registrada (**GR-**).

**SPEC-6.3.** **Rastreabilidade**: novas features de negócio referenciam regras **SPEC-**, **ENT-**, **GR-**, **BR-**, **DS-**, **SEC-**, **AUTH-**, **SHELL-**, **DATE-** (e **STU-** onde aplicável) nos respectivos ciclos.

**SPEC-6.4.** **Tempo de operação** (meta orientadora, não SLA): cadastro completo de um novo aluno em poucos minutos, supondo dados em mãos.

---

## 7. Privacidade e compliance (alto nível)

**SPEC-7.1.** O produto armazena dados pessoais de alunos para fins de gestão da academia; operação deve respeitar a **LGPD** (bases legais, minimização, direitos do titular, segurança). Detalhamento de políticas, termos e fluxos de consentimento ficam para ciclos de **auth/settings/compliance**.

**SPEC-7.2.** Campos obrigatórios e opcionais por entidade estão em [`entities.md`](entities.md).

---

## 8. Referências externas (graduação)

**SPEC-8.1.** Ordem de faixas **adulto** e **kids** adota o arranjo amplamente difundido pela **IBJJF** (*General System of Graduation* / Artigo 1 — faixas por faixa etária). Documentação acadêmica e terceiros reproduzem a mesma sequência; o produto não substitui regulamento oficial para federações.

**SPEC-8.2.** Graus na faixa preta seguem o modelo da IBJJF (**1º ao 6º grau** na preta), não o modelo de “quatro graus” das faixas coloridas — ver [`graduation-rules.md`](graduation-rules.md).

---

## 9. Identidade visual e UI (MVP)

**SPEC-10.1.** A interface prioriza **clareza operacional**, **pt-BR** e **mobile-first**, com hierarquia tipográfica consistente e **foco visível** para acessibilidade.

**SPEC-10.2.** Cores e superfícies devem derivar dos **tokens** do produto (variáveis CSS e tema Tailwind); semântica de cor alinhada ao guia (**preto** identidade, **vermelho** ação primária, **off-white** fundo no tema claro, **verde/azul/amarelo** para status e detalhes).

**SPEC-10.3.** O produto suporta **tema claro e escuro** com paridade legível; detalhes de componentes e exemplos de referência estão em **DS-** e em [`docs/design/style-guide.md`](../../docs/design/style-guide.md).

**SPEC-10.4.** A área autenticada pode usar **acentos cromáticos mais expressivos** (gradientes subtis baseados em tokens, hierarquia de cartões, estado activo evidente na navegação) para uma sensação **viva e operacional**, desde que todas as cores derivem dos **tokens** e o contraste permaneça adequado (**WCAG** como referência). Detalhes em **DS-1.11**.

---

## 10. Fonte da verdade

**SPEC-9.1.** Este arquivo e os demais em [`spec/product/`](.) são **canônicos**; cópias em [`docs/product/`](../../docs/product/) devem permanecer alinhadas.

**SPEC-9.2.** O [`README.md`](../../README.md) na raiz resume o MVP e aponta para esta especificação como detalhamento.

---

## 11. Infraestrutura de dados (Supabase)

**SPEC-11.1.** A partir do ciclo de **RLS e segurança** (Q2 2026), o **Postgres canónico** da aplicação é o projeto **Supabase em produção**. Scripts (`pnpm db:apply`), migrações manuais e variáveis `DATABASE_URL` / chaves do projeto devem referir **esse** ambiente (ou uma cópia pontual explicitamente documentada), evitando um segundo destino de schema sem políticas alinhadas.

**SPEC-11.2.** Pedidos com **anon key** e sessões **authenticated** **não** contornam RLS; a **service_role key** só pode ser usada **server-side** (rotas controladas, jobs, webhooks), **nunca** exposta ao cliente.
