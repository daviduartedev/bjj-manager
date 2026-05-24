# /refine-request

Transforma o `request.md` de um cycle em artefatos de execução: `plan.md`, `tasks.md`, `scenarios.feature`, `spec-delta.md` e skeletons de `validation.md` / `review.md` / `implementation-notes.md`.

## Boundary obrigatório

- `refine-request` = gera artefatos de planejamento **apenas**
- `execute-cycle` / `execute-stage` = implementa código
- **Não implementar nada durante o refine.**

---

## Passos

### 1. Identificar o cycle ativo

Perguntar ao humano se não estiver claro. Ler:
- `cycles/{path}/request.md`
- Verificar o tipo do cycle (Small / Medium / Large)

### 2. Ler specs relevantes

Antes de gerar qualquer artefato, ler as specs listadas no `request.md` e as que forem claramente relevantes:
- `spec/backend.md` — se há mudança de backend
- `spec/frontend.md` — se há mudança de frontend
- `spec/database.md` — se há mudança de schema
- `spec/security.md` — sempre para Medium e Large
- `spec/features/{slug}.md` — se a feature já existe

### 3. Fazer perguntas (quando necessário)

Se o `request.md` tiver ambiguidades ou lacunas que impedem a geração de artefatos precisos, fazer perguntas antes de prosseguir. Exemplos:
- "O endpoint deve ser público ou autenticado?"
- "Existe design/mockup para esta tela?"
- "Qual é o comportamento esperado quando X está vazio?"

### 4. Gerar artefatos por tipo de cycle

#### Small
- `tasks.md` — lista de tasks executáveis
- `validation.md` — skeleton com critérios do request

#### Medium
- `plan.md` — plano delta com arquivos afetados, ordem, riscos
- `tasks.md` — tasks detalhadas com arquivo alvo
- `scenarios.feature` — cenários de aceite em Gherkin
- `spec-delta.md` — proposta de mudança nas specs (quando specs forem afetadas)
- `validation.md` — skeleton
- `review.md` — skeleton

#### Large
- `plan.md` — plano com stages, dependências, riscos globais
- `tasks.md` — tasks organizadas por stage
- `scenarios.feature` — cenários por stage
- `spec-delta.md` — proposta de mudança
- `implementation-notes.md` — skeleton com seções por stage
- `validation.md` — skeleton com seções por stage
- `review.md` — skeleton com seções por stage

### 5. Usar os templates

Copiar de `templates/cycles/{tipo}/` e preencher. Não inventar dados que não estejam no request ou nas specs.

### 6. Reportar ao humano

Ao finalizar, listar:
1. Artefatos gerados (com paths)
2. Decisões tomadas e premissas assumidas
3. Perguntas abertas que ficaram no artefato
4. Próximo passo recomendado:
   - Small/Medium: `/execute-cycle`
   - Large: `/map-stage` para a Stage 1

---

## O que NÃO fazer

- Não implementar código
- Não atualizar `spec/` final
- Não executar comandos do projeto (lint, test, build)
- Não gerar tasks para fora do escopo do request
- Não inventar requisitos não declarados
