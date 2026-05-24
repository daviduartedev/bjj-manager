# /scope-cycle

Transforma um rascunho bruto de task, bug ou feature em um escopo limpo, classificado e pronto para entrar em `/create-cycle`.

> **Review-only.** Não cria arquivos, não cria cycle, não gera `request.md`, não roda `/create-cycle`, não roda `/refine-request`, não implementa nada.

---

## Quando usar

Antes de `/create-cycle`, sempre que o escopo estiver:
- Descrito informalmente ("preciso arrumar o botão de salvar")
- Misturado com outros itens ("e também queria melhorar a tela de listagem")
- Sem critérios de aceite claros
- Com risco de crescer durante a execução

---

## Passos

### 1. Receber o rascunho bruto

Ler o que o humano forneceu: pode ser texto livre, mensagem de Slack, print de bug report, link de issue, lista de bullets — qualquer coisa.

### 2. Ler apenas o necessário

Se o escopo mencionar uma área específica do projeto, ler **no máximo**:
- A spec relevante em `spec/` (ex: `spec/security.md` para bug de segurança)
- `spec/features/{slug}.md` se a feature já existir

Não ler o código. Não explorar o repositório.

### 3. Classificar o cycle

| Tipo | Critério |
|---|---|
| **Hotfix** | Bug crítico em produção, escopo cirúrgico, sem refactor, sem novos testes além do smoke |
| **Small** | Mudança simples e bem entendida, baixo risco, 1–2 arquivos, < 50 linhas |
| **Medium** | Complexidade moderada, 3–10 arquivos, requer plan e cenários, pode afetar specs |
| **Large** | Alto impacto, > 10 arquivos, múltiplas stages, risco de regressão elevado |

Se o rascunho misturar itens de tipos diferentes, separar e classificar cada um individualmente.

### 4. Gerar o output estruturado

Produzir o seguinte documento no chat (não criar arquivo):

---

```markdown
## /scope-cycle — Output

### Recommended type
{Hotfix | Small | Medium | Large}

### Suggested title
{Título curto e descritivo em linguagem natural, máx. 8 palavras}

### Suggested slug
{kebab-case, sem acentos, máx. 5 palavras — ex: fix-login-redirect, add-payment-receipt-export}

### Why this classification
{2–4 frases explicando por que este tipo foi escolhido: número de arquivos estimados,
risco, complexidade, necessidade de stages, etc.}

---

### Clean scope
{Descrição limpa e objetiva do que deve ser feito.
Uma coisa por vez. Sem "e também", sem escopo oculto.
Se o rascunho misturava itens, separar em blocos numerados.}

### Intent
{Por que isso precisa ser feito? Qual problema resolve ou qual valor entrega?
1–3 frases.}

### Constraints
{O que limita este trabalho? Exemplos:
- Não pode quebrar fluxo X
- Deve funcionar com o schema atual (sem migration)
- Deve usar componentes existentes do design system
- Não pode alterar contratos de API existentes}

### Suggested references
{Links, issues, tickets, specs, designs ou arquivos relevantes.
Se não houver, escrever "Nenhuma referência fornecida — perguntar ao humano se houver."}

### Validation expectations
{O que deve ser verdade para considerar este cycle concluído?
Escrever como critérios observáveis, não como intenções.
- Cenário 1: {ação} → {resultado esperado}
- Cenário 2: {ação} → {resultado esperado}
- Cenário negativo: {ação sem permissão} → {erro esperado}}

### Out of scope
{O que explicitamente NÃO deve ser feito neste cycle.
Itens que surgiram no rascunho mas devem ser cycles separados.}

### Risks
{O que pode dar errado?
- {risco} — {probabilidade: Alta/Média/Baixa} — {mitigação sugerida}}

### Open questions
{Dúvidas que precisam de resposta antes de abrir o cycle.
Se não houver, escrever "Nenhuma — escopo suficientemente claro."}

---

### Approved scope draft
> Cole o trecho abaixo diretamente no `/create-cycle` quando estiver pronto.

---
**Type:** {Hotfix | Small | Medium | Large}
**Title:** {título sugerido}
**Slug:** {slug sugerido}

**Scope:**
{versão final e limpa do clean scope acima}

**Intent:**
{intent acima}

**Acceptance criteria:**
- {critério 1}
- {critério 2}

**Out of scope:**
- {item}

**References:**
- {referência}
---
```

---

### 5. Aguardar validação humana

Após apresentar o output, **não prosseguir automaticamente**. Perguntar:

> "O escopo está correto? Posso ajustar qualquer seção antes de você rodar `/create-cycle`."

---

## O que NÃO fazer

- Não criar nenhum arquivo
- Não criar a pasta do cycle
- Não gerar `request.md`
- Não rodar `/create-cycle`
- Não rodar `/refine-request`
- Não implementar nenhum código
- Não ler o repositório inteiro
- Não misturar múltiplos itens em um único escopo sem separar explicitamente
- Não classificar como Small algo que claramente é Medium ou Large para "facilitar"
- Não omitir riscos ou open questions para parecer mais simples
