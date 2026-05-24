# /update-spec

Promove o `spec-delta.md` do cycle para `spec/`, documentando comportamento implementado e validado.

> Rodar **somente** após `/validate-cycle` concluído com sucesso.

---

## Pré-condições obrigatórias

Antes de promover, verificar:
- [ ] `validation.md` está preenchido com evidências reais
- [ ] Todos os cenários de aceite têm evidência (PASS)
- [ ] `review.md` sem blockers abertos
- [ ] Para Large cycles: todas as stages concluídas e fechadas

Se qualquer condição não for atendida, **não promover**. Reportar ao humano.

---

## Passos

### 1. Ler spec-delta.md

Ler `cycles/{path}/spec-delta.md` completamente.

Verificar:
- O delta descreve comportamento **implementado**, não intenção
- Não há seções marcadas como "proposta não entregue"
- Cada mudança tem justificativa clara

### 2. Ler os arquivos de spec afetados

Para cada spec listada no delta, ler o arquivo atual em `spec/`.

### 3. Aplicar as mudanças

Para cada mudança no `spec-delta.md`:

**Editar spec existente:**
- Localizar a seção correta
- Aplicar apenas as mudanças do delta
- Não reescrever seções não afetadas
- Não adicionar intenção não entregue

**Criar nova spec de feature:**
- Criar `spec/features/{slug}.md` com o conteúdo do delta
- Usar linguagem de fato consumado: "O sistema faz X", não "O sistema deve fazer X"

### 4. Verificar consistência

Após aplicar:
- [ ] Nenhuma spec descreve comportamento não implementado
- [ ] Linguagem em presente/passado, não futuro ("implementa", não "deve implementar")
- [ ] `spec/README.md` referencia a nova spec de feature (se criada)

### 5. Atualizar spec/README.md (quando aplicável)

Se uma nova `spec/features/{slug}.md` foi criada, adicionar entrada na tabela do `spec/README.md`.

### 6. Reportar ao humano

1. Specs atualizadas (lista de arquivos e seções)
2. Novas specs criadas (se houver)
3. O que foi promovido
4. Próximo passo: `/close-cycle`

---

## O que NÃO fazer

- Não promover antes da validação
- Não documentar intenção não entregue como fato
- Não reescrever spec inteira quando apenas uma seção muda
- Não alterar specs não relacionadas ao cycle atual
- Não fazer push
