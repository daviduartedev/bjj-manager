# SPEC: Refatoração Juvenil Faixa Laranja e Área de Produtos

## Contexto

O sistema Casca ja possui area autenticada com alunos, planos, mensalidades, configuracoes, historico de graduacao e dashboard operacional. A arquitetura atual usa Next.js App Router, Supabase/Postgres, RLS por conta, server actions, validacoes com Zod e componentes visuais compartilhados para a area autenticada.

No ciclo anterior, as categorias comerciais ficaram consolidadas em tres planos por conta: `Kids 1`, `Kids 2` e `Adulto`. O sistema nao deve recriar a categoria `Juvenil`. A necessidade atual e permitir que juvenis da familia da faixa laranja treinem e paguem como Adulto, com controle manual do professor e sem alteracao retroativa do historico financeiro.

Tambem sera adicionada uma area de Produtos para controle interno de estoque da academia. Esta area deve seguir o mesmo padrao visual do restante do sistema e nao deve incluir venda, checkout, pagamento ou baixa automatica nesta etapa.

## Objetivo

1. Tornar explicita a regra de negocio que permite aluno `kids` da familia laranja no plano `Adulto`, bloqueando aluno `kids` fora dessa familia de ser vinculado ao plano Adulto.
2. Garantir que mensalidades futuras usem o valor efetivo do plano Adulto quando o professor mover um aluno elegivel para Adulto.
3. Criar a area autenticada `Produtos` para cadastro interno simples de produtos, tamanhos/variacoes e quantidades em estoque.
4. Preservar historico financeiro anterior, arquitetura atual, padroes visuais e nomes comerciais `Kids 1`, `Kids 2` e `Adulto`.

## Escopo

### Ajuste 1: juvenis faixa laranja no Adulto

- Manter `students.kind` como `kids` para alunos juvenis, mesmo quando vinculados ao plano Adulto.
- Considerar como "familia laranja" as faixas kids:
  - `orange_white`
  - `orange`
  - `orange_black`
- Permitir plano Adulto para aluno `kids` somente quando a faixa atual for uma das faixas acima.
- Bloquear plano Adulto para aluno `kids` fora da familia laranja.
- Manter plano Adulto permitido para aluno `adult`.
- Manter `Kids 1` e `Kids 2` permitidos para aluno `kids`.
- Garantir a regra no servidor e na validacao compartilhada, nao apenas no select da UI.
- Atualizar formularios de aluno e edicao rapida para mostrar o plano Adulto apenas quando o aluno kids estiver elegivel.
- Manter fechamento/criacao de vinculo em `student_plans` conforme comportamento atual.
- Nao reprocessar pagamentos antigos.

### Ajuste 2: area de Produtos

- Criar rota autenticada `/produtos`.
- Adicionar item `Produtos` na navegacao principal.
- Criar tabelas de produtos e variacoes/tamanhos por conta.
- Criar produtos iniciais:
  - Camisetas da academia, tamanhos `P`, `M`, `G`, `GG`
  - Rash Guards femininas, tamanhos editaveis
  - Rash Guards masculinas, tamanhos editaveis
  - Quimonos KMNO, tamanhos editaveis
  - Quimonos Zenshins, tamanhos editaveis
- Permitir que o professor:
  - visualize produtos cadastrados;
  - crie novos produtos;
  - edite nome do produto;
  - ative/inative produto;
  - adicione tamanhos/variacoes;
  - edite rotulo do tamanho;
  - edite quantidade por tamanho;
  - remova tamanhos/variacoes com confirmacao quando houver estoque;
  - atualize estoque manualmente.
- Persistir dados por conta/academia com RLS.
- Usar componentes e padroes visuais existentes da area autenticada.

## Fora de Escopo

- Criar categoria ou tipo `Juvenil`.
- Mudar os nomes comerciais principais `Kids 1`, `Kids 2` e `Adulto`.
- Alterar pagamentos ou historico financeiro anterior.
- Automatizar movimentacao de aluno kids para Adulto.
- Permitir aluno kids fora da familia laranja no plano Adulto.
- Criar venda, checkout, carrinho, pagamento, recibo, cliente/comprador ou baixa automatica de estoque.
- Criar relatorios financeiros de produtos.
- Criar movimentacoes/auditoria detalhada de estoque nesta etapa.
- Fazer refactor amplo em alunos, mensalidades, layout ou banco fora do necessario.

## Requisitos Funcionais

### RF-A1: compatibilidade aluno/faixa/plano

O sistema deve calcular compatibilidade de plano considerando `student.kind`, `plan.kind` e a faixa atual do aluno.

Regras:

- `student.kind = adult` aceita apenas `plan.kind = adult`.
- `student.kind = kids` aceita `plan.kind = kids_1`.
- `student.kind = kids` aceita `plan.kind = kids_2`.
- `student.kind = kids` aceita `plan.kind = adult` apenas se a faixa atual for `orange_white`, `orange` ou `orange_black`.

### RF-A2: formularios de aluno

No cadastro, edicao completa e edicao rapida:

- o select de plano deve listar apenas planos compativeis com o tipo e faixa atual;
- ao trocar a faixa de um aluno kids para fora da familia laranja, se o plano selecionado for Adulto, a UI deve limpar ou substituir o plano por um plano kids padrao disponivel;
- ao trocar a faixa de um aluno kids para familia laranja, o plano Adulto pode aparecer como opcao manual;
- o sistema nao deve selecionar Adulto automaticamente para kids laranja sem acao do professor.

### RF-A3: validacao de servidor

As server actions de criacao, edicao completa e edicao rapida devem rejeitar payloads que tentem vincular aluno kids nao-laranja ao plano Adulto, mesmo que a UI seja burlada.

### RF-A4: mensalidade futura

Quando um aluno kids elegivel for vinculado ao plano Adulto, mensalidades futuras e telas financeiras devem usar o valor efetivo do plano Adulto, incluindo preco personalizado quando ja existir regra vigente para `student_plans`.

### RF-A5: historico financeiro

Pagamentos e vinculos encerrados no passado nao devem ser alterados retroativamente. O comportamento de alteracao deve seguir a regra existente: fechar vinculo aberto e criar novo vinculo vigente a partir da data atual.

### RF-P1: acesso a Produtos

O professor autenticado deve acessar `Produtos` pela navegacao principal em desktop, menu lateral mobile e barra inferior mobile quando aplicavel.

### RF-P2: listagem de produtos

A tela Produtos deve exibir os produtos da conta, seus status e seus tamanhos/variacoes com quantidade em estoque.

### RF-P3: cadastro e edicao de produto

O professor deve poder criar novo produto, editar nome e alterar status ativo/inativo.

### RF-P4: variacoes/tamanhos

O professor deve poder adicionar, editar e remover tamanhos/variacoes de um produto.

### RF-P5: estoque manual

O professor deve poder editar manualmente a quantidade de cada tamanho/variacao. A quantidade deve ser inteiro maior ou igual a zero.

### RF-P6: produtos iniciais

Para cada conta, o sistema deve provisionar de forma idempotente os cinco produtos iniciais. O termo correto na UI e `Rash Guard`; nao deve aparecer `hash guard`.

## Requisitos Nao Funcionais

- Preservar padroes visuais, espacamento, componentes e UX existentes.
- Preservar RLS e isolamento por conta.
- Validacoes devem ser compartilhadas quando fizer sentido, com Zod nos fluxos de UI/server actions.
- Migracoes devem ser idempotentes e seguras para ambientes ja existentes.
- A tela deve funcionar bem em desktop e mobile.
- A implementacao deve evitar dependencias novas sem necessidade.
- Consultas devem carregar apenas dados da conta atual e ordenar produtos/variacoes de forma estavel.
- Mensagens de erro devem ser em portugues do Brasil e nao expor detalhes internos.

## Regras de Negocio

### Alunos e planos

- Kids 1, Kids 2 e Adulto continuam sendo os unicos planos comerciais padrao.
- Aluno kids fora da familia laranja nao pode ser vinculado ao plano Adulto.
- Aluno kids da familia laranja pode ser vinculado ao plano Adulto somente por acao manual do professor.
- Aluno kids da familia laranja vinculado ao plano Adulto paga como Adulto.
- A faixa usada para elegibilidade e a faixa atual do cadastro do aluno no momento da alteracao.
- Se uma edicao simultanea mudar a faixa ou o plano, a validacao de servidor e a fonte final da verdade.

### Produtos

- Produto pertence a uma conta/academia.
- Produto inativo permanece visivel na tela de Produtos, mas deve ser identificado como inativo.
- Produto inativo nao e removido fisicamente nesta etapa.
- Tamanho/variacao pertence a um produto.
- Quantidade de estoque nao pode ser negativa.
- Remover tamanho com quantidade maior que zero deve exigir confirmacao na UI.
- Produtos iniciais sao dados de partida, mas o professor pode editar seus nomes, tamanhos e quantidades.
- O codigo interno dos produtos iniciais deve ser estavel para evitar duplicacao se seed/migracao rodar novamente apos edicao de nome.

## Impactos em UX/UI

### Alunos

- O campo Plano passa a depender tambem da faixa atual, nao apenas do tipo do aluno.
- Para kids nao-laranja, Adulto nao aparece como opcao.
- Para kids da familia laranja, Adulto aparece como opcao manual.
- Se uma combinacao ficar invalida ao trocar faixa/tipo, a UI deve escolher um plano kids padrao disponivel ou pedir nova selecao de plano.

### Produtos

- A area Produtos deve seguir o padrao das paginas atuais:
  - `DashboardPageHero` para cabecalho;
  - `DashboardPanel` para areas principais;
  - cards/tabelas semelhantes a Alunos e Configuracoes;
  - inputs, selects, badges e botoes do design system local.
- A tela deve priorizar leitura rapida: nome do produto, status, tamanhos e estoque.
- Acoes de criacao/edicao podem usar dialog ou edicao inline, desde que mantenham consistencia com a experiencia atual.
- Estados vazios e erros devem usar linguagem simples.

## Impactos em Dados e Persistencia

### Modelo existente

- `students`, `plans`, `student_plans`, `payments` e `belts` permanecem como fontes de verdade para alunos, planos, mensalidades e faixas.
- Nao ha nova categoria juvenil.
- Pode haver alteracao em helpers de compatibilidade de plano para considerar faixa.

### Novas tabelas

Proposta de tabelas:

- `products`
  - `id uuid primary key`
  - `account_id uuid not null references accounts(id)`
  - `code text not null`
  - `name text not null`
  - `active boolean not null default true`
  - `sort_order integer not null default 0`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
  - unique por `(account_id, code)`

- `product_variants`
  - `id uuid primary key`
  - `product_id uuid not null references products(id) on delete cascade`
  - `size_label text not null`
  - `stock_quantity integer not null default 0`
  - `sort_order integer not null default 0`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
  - unique por `(product_id, size_label)`
  - check `stock_quantity >= 0`

RLS:

- `products`: acesso total apenas quando `account_id = current_account_id()`.
- `product_variants`: acesso total apenas quando o produto pai pertence a `current_account_id()`.

Seeds/migracao:

- Atualizar `db/schema.sql` para novos bancos.
- Atualizar `db/seed.sql` com produtos iniciais para a conta dev.
- Criar migracao idempotente em `db/migrations/` para ambientes existentes.
- Atualizar `db/policies.sql` para habilitar RLS nas novas tabelas.

## Criterios de Aceitacao

### Juvenil faixa laranja no Adulto

- Dado um aluno `kids` com faixa `orange_white`, quando o professor selecionar o plano Adulto e salvar, entao o sistema deve permitir a alteracao.
- Dado um aluno `kids` com faixa `orange`, quando o professor selecionar o plano Adulto e salvar, entao o sistema deve permitir a alteracao.
- Dado um aluno `kids` com faixa `orange_black`, quando o professor selecionar o plano Adulto e salvar, entao o sistema deve permitir a alteracao.
- Dado um aluno `kids` fora da familia laranja, quando o professor abrir o campo Plano, entao o plano Adulto nao deve aparecer como opcao.
- Dado um aluno `kids` fora da familia laranja, quando uma requisicao tentar salvar `plan.kind = adult`, entao o servidor deve rejeitar a alteracao.
- Dado um aluno `kids` da familia laranja no plano Adulto, quando o sistema calcular mensalidade futura, entao deve aplicar o valor efetivo do plano Adulto.
- Dado um historico financeiro anterior, quando a categoria/plano atual do aluno for alterado, entao registros antigos nao devem ser modificados retroativamente.
- Dado um aluno `kids` nao-laranja, quando ele for editado sem acao do professor para Adulto, entao o sistema nao deve aplicar Adulto automaticamente.

### Produtos

- Dado que o professor acessa a area autenticada, quando abrir a navegacao principal, entao deve ver acesso a Produtos.
- Dado que o professor acessa Produtos, quando a tela carregar, entao deve visualizar os produtos cadastrados da sua conta.
- Dado uma conta nova/provisionada, quando os dados iniciais forem aplicados, entao devem existir os cinco produtos iniciais.
- Dado um produto, quando o professor editar o nome e salvar, entao a alteracao deve persistir.
- Dado um produto, quando o professor alterar status ativo/inativo, entao a alteracao deve persistir.
- Dado um produto com variacoes, quando o professor editar a quantidade de um tamanho, entao o estoque deve ser atualizado corretamente.
- Dado um produto, quando o professor adicionar um tamanho, entao o novo tamanho deve aparecer e persistir.
- Dado um produto, quando o professor remover um tamanho, entao a variacao deve deixar de aparecer apos confirmacao quando houver estoque.
- Dado uma tentativa de estoque negativo, quando salvar, entao o sistema deve rejeitar com mensagem amigavel.
- Dado que nao existe venda nesta etapa, quando o professor editar estoque, entao a alteracao deve ser manual e nao deve criar pagamento, venda ou checkout.

## Casos de Borda

- Plano Adulto desativado: nao deve aparecer para novo vinculo, mesmo para kids laranja.
- Kids laranja com plano Adulto troca para faixa nao-laranja: a UI deve invalidar o plano Adulto e exigir/selecionar um plano kids compativel antes de salvar.
- Kids nao-laranja envia plano Adulto via requisicao manual: servidor rejeita.
- Faixa inexistente ou sem slug esperado: servidor rejeita como faixa invalida.
- Conta sem planos ativos: mensagem existente deve continuar clara.
- Produto sem variacoes: tela deve permitir adicionar primeira variacao.
- Produto inativo com variacoes: deve permanecer editavel para controle interno.
- Tamanho duplicado no mesmo produto: sistema rejeita.
- Quantidade vazia, decimal ou negativa: sistema rejeita.
- Remocao de tamanho com estoque positivo: UI exige confirmacao para evitar perda acidental.
- Execucao repetida de seed/migracao: nao duplica produtos iniciais.

## Riscos Tecnicos

- A regra atual `planKindMatchesStudentKind` permite `kids` no Adulto de forma ampla; mudar sua assinatura ou introduzir novo helper pode afetar formularios, validacoes e testes existentes.
- O select de plano depende de estado de tipo/faixa; mudancas de faixa precisam sincronizar o plano selecionado sem comportamento confuso.
- A criacao de novas tabelas exige alinhamento entre `schema.sql`, migracao, seed e policies.
- A navegacao principal tem espaco limitado no mobile; adicionar Produtos pode exigir cuidado visual na barra inferior.
- Sem tabela de movimentacoes, nao havera auditoria detalhada de estoque nesta etapa. Isso e aceito pelo escopo, mas deve ser registrado para ciclos futuros se necessario.

## Estrategia de Validacao

- Testes unitarios de compatibilidade plano/faixa:
  - adult aceita Adulto;
  - kids aceita Kids 1/Kids 2;
  - kids orange family aceita Adulto;
  - kids nao-laranja rejeita Adulto.
- Testes de validacao Zod para formularios de aluno.
- Testes de server action ou helper para impedir payload burlado.
- Testes de dados/produtos para validacoes de quantidade, tamanho duplicado e escopo por conta quando viavel.
- Validacao manual:
  - editar aluno kids laranja para Adulto;
  - tentar editar kids nao-laranja para Adulto;
  - confirmar mensalidade futura com valor Adulto;
  - abrir Produtos pela navegacao;
  - criar produto;
  - editar nome/status;
  - adicionar/editar/remover tamanhos;
  - validar layout desktop e mobile.
- Comandos esperados:
  - `pnpm test`
  - `pnpm type-check`
  - `pnpm lint`
  - `pnpm build`

## Fatos Confirmados

- Nao deve existir categoria `Juvenil`.
- As categorias comerciais continuam `Kids 1`, `Kids 2` e `Adulto`.
- Familia laranja significa `orange_white`, `orange` e `orange_black`.
- Aluno kids fora da familia laranja deve ser bloqueado de usar Adulto.
- Kids laranja no Adulto deve pagar como Adulto.
- O professor faz a mudanca manualmente.
- Historico financeiro anterior nao deve ser alterado.
- Produtos deve ser controle interno do professor.
- Produtos nao inclui venda, checkout, pagamento ou baixa automatica.
- Produtos deve permitir cadastro completo simples, com novos produtos, status, tamanhos e quantidades.
- A SPEC e o PLAN devem ficar em `cycles/Q22026/24-0430-refactor-juvenil`.

## Suposicoes Necessarias

- A faixa atual do aluno e suficiente para decidir elegibilidade ao plano Adulto.
- Os slugs existentes do catalogo kids sao os mesmos de `db/seed.sql`.
- Produtos iniciais devem existir por conta e podem ser editados pelo professor depois do provisionamento.
- Um produto inativo deve permanecer visivel/editavel, pois o modulo e interno.
- Sem movimentacoes de estoque nesta etapa significa que apenas a quantidade final sera armazenada.
- Novos produtos criados pela UI receberao `code` interno estavel no servidor, independente do nome editavel.

## Duvidas Pendentes

- Nao ha duvidas bloqueantes para especificacao e planejamento.
- Um ciclo futuro pode decidir se precisa de auditoria de movimentacoes de estoque, venda ou relatorios, mas estes itens estao fora do escopo atual.
