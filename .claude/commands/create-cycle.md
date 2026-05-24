# /create-cycle

Cria a pasta do cycle e o arquivo `request.md` a partir de um escopo bruto fornecido pelo humano.

## Boundary obrigatório

- `create-cycle` = cria pasta + `request.md` **apenas**
- `refine-request` = gera plan / tasks / scenarios / spec-delta
- **Não confundir os dois. Não fazer refine dentro do create-cycle.**

---

## Passos

### 1. Classificar o cycle

Com base no escopo fornecido, classificar como **Small**, **Medium** ou **Large**:

| Critério | Small | Medium | Large |
|---|---|---|---|
| Linhas estimadas | < 50 | 50–300 | > 300 |
| Arquivos afetados | 1–2 | 3–10 | > 10 |
| Risco de regressão | Baixo | Médio | Alto |
| Afeta specs canônicas | Não | Possível | Sim |
| Stages necessárias | Não | Não | Sim |

Se houver dúvida, perguntar ao humano antes de prosseguir.

### 2. Definir o path canônico

Formato obrigatório:
```
cycles/Q{quarter}{year}/{MMDD}-{slug}/
```

Exemplos:
- `cycles/Q22026/0524-fix-label-matricula/`
- `cycles/Q22026/0524-portal-aluno-dashboard/`

Regras:
- `{quarter}` = trimestre atual (1, 2, 3 ou 4)
- `{year}` = ano com 4 dígitos
- `{MMDD}` = mês e dia atuais (zero-padded)
- `{slug}` = kebab-case descritivo, sem acentos, máximo 5 palavras
- **Nunca criar `cycles/cycles/`**
- **Nunca usar espaços ou caracteres especiais**

### 3. Criar a estrutura de pastas

Para **Small:**
```
cycles/Q{Q}{YYYY}/{MMDD}-{slug}/
```

Para **Medium:**
```
cycles/Q{Q}{YYYY}/{MMDD}-{slug}/
```

Para **Large:**
```
cycles/Q{Q}{YYYY}/{MMDD}-{slug}/
cycles/Q{Q}{YYYY}/{MMDD}-{slug}/stage-summaries/
```

### 4. Copiar e preencher o template de `request.md`

- Copiar de `templates/cycles/{tipo}/request.md`
- Preencher com as informações fornecidas pelo humano:
  - Path do cycle
  - Tipo (Small / Medium / Large)
  - Data atual
  - Contexto
  - O que precisa ser feito
  - Critérios de aceite (esboço inicial)
  - Fora de escopo (o que for óbvio)
- Deixar `{placeholder}` onde a informação não foi fornecida
- **Não inventar requisitos**
- **Não gerar plan, tasks, scenarios ou spec-delta**

### 5. Reportar ao humano

Ao finalizar, reportar:
1. Path do cycle criado
2. Tipo classificado (Small / Medium / Large)
3. Arquivo criado: `request.md`
4. Próximo passo recomendado:
   - Small: revisar `request.md` e prosseguir diretamente para implementação ou pedir `tasks.md` manual
   - Medium / Large: rodar `/refine-request`

---

## O que NÃO fazer

- Não gerar `plan.md`, `tasks.md`, `scenarios.feature` ou `spec-delta.md`
- Não implementar nenhum código
- Não ler o repositório inteiro
- Não refinar o request além de estruturá-lo
- Não criar cycle fora do path canônico
- Não criar `cycles/cycles/`

---

## Exemplo de output esperado

```
✅ Cycle criado: cycles/Q22026/0524-fix-label-matricula/

Tipo: Small
Arquivo criado: cycles/Q22026/0524-fix-label-matricula/request.md

Próximo passo: revisar o request.md e iniciar implementação diretamente,
ou rodar /refine-request se quiser gerar tasks.md formal.
```
