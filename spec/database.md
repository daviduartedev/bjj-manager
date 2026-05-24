# spec/database.md — Padrões de Banco de Dados

## Princípios fundamentais

- Migrations versionadas e rastreáveis.
- Schema nunca alterado sem plan e spec-delta aprovados.
- Dados de produção nunca usados em desenvolvimento/testes.

---

## Migrations

- Toda alteração de schema gerada via migration versionada (nunca direto no banco).
- Migrations devem ter nome descritivo: `add_status_to_enrollments`, não `migration_20240523`.
- Migrations destrutivas (drop column, drop table) requerem atenção especial e rollback planejado.
- Rodar migrations somente com instrução explícita do humano.
- Documentar rollback/mitigação em `implementation-notes.md` para migrations de risco.

---

## Naming

- Tabelas: plural, snake_case (`enrollments`, `payment_attempts`).
- Colunas: snake_case descritivo (`created_at`, `owner_id`, `is_active`).
- Foreign keys: `{tabela_singular}_id` (`user_id`, `course_id`).
- Índices: `idx_{tabela}_{coluna(s)}`.
- Constraints: `{tabela}_{coluna}_unique`, `{tabela}_{coluna}_check`.

---

## Índices

- Criar índice para colunas usadas frequentemente em `WHERE`, `ORDER BY`, `JOIN`.
- Justificar cada índice criado (não criar por precaução sem análise).
- Documentar índices adicionados em `spec-delta.md`.
- Índice em foreign keys quando queries de join forem comuns.
- Monitorar índices não utilizados em produção (custo de escrita sem benefício de leitura).

---

## Foreign Keys

- Usar foreign keys para garantir integridade referencial quando o banco suportar.
- Definir comportamento de `ON DELETE` e `ON UPDATE` explicitamente.
- Não deixar registros órfãos como comportamento normal.

---

## Scoping por owner/tenant/user

- Toda tabela com dados de usuário deve ter coluna de scoping (`user_id`, `owner_id`, `tenant_id`).
- Queries sempre incluem filtro de scoping.
- Nunca retornar todos os registros sem filtro de contexto autenticado.

---

## Performance

- Evitar N+1: usar joins ou eager loading quando necessário.
- Não carregar colunas desnecessárias (`SELECT *` apenas quando justificado).
- Paginar resultados em listagens que podem crescer indefinidamente.
- Documentar queries complexas com comentário explicativo.

---

## Transações

- Usar transações para operações que envolvem múltiplas escritas relacionadas.
- Rollback explícito em caso de erro.
- Não deixar o banco em estado inconsistente em caso de falha parcial.
- Transações longas são um risco — minimizar trabalho dentro delas.

---

## Seeds e dados de teste

- Seeds separados de migrations (arquivo próprio ou fixture).
- Dados de teste realistas mas sem PII real.
- Seeds idempotentes (podem ser rodados múltiplas vezes sem erro).
- Não usar dados de produção em seeds de desenvolvimento.

---

## O que não fazer

- Não alterar schema sem plan e spec-delta aprovados.
- Não rodar migrations sem instrução explícita.
- Não fazer alterações manuais no banco de produção sem registro.
- Não criar índices sem justificativa.
- Não depender de `SELECT *` em queries de produção críticas.

---

_Harness version: 1.0.0_
