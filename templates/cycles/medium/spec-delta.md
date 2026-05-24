# spec-delta.md — Medium Cycle

## Cycle: {slug}
## Status: PROPOSTA (não promovida)

> ⚠️ Este arquivo é uma PROPOSTA. Só é promovido para `spec/` via `/update-spec` após validação.

---

## Specs afetadas

### `spec/{arquivo}.md`

**Seção:** {nome da seção}

**Mudança proposta:**

```diff
- {texto atual da spec, se existir}
+ {novo texto proposto}
```

**Motivo:** {por que essa mudança é necessária}

---

### `spec/features/{slug}.md` _(novo arquivo, se aplicável)_

> Criar nova spec de feature documentando o comportamento implementado.

**Conteúdo proposto:**

```markdown
# spec/features/{slug}.md

## Comportamento

{descrever o comportamento implementado e validado}

## Contratos

{endpoints, tipos, campos relevantes}

## Regras de negócio

{regras relevantes}
```

---

## Checklist antes de promover

- [ ] Validação concluída (`validation.md` atualizado)
- [ ] Comportamento implementado (não intenção)
- [ ] Revisão humana confirmada
- [ ] Pronto para `/update-spec`
