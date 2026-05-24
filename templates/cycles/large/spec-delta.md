# spec-delta.md — Large Cycle

## Cycle: {slug}
## Status: PROPOSTA (não promovida)

> ⚠️ Este arquivo é uma PROPOSTA. Só é promovido para `spec/` via `/update-spec` após todas as stages validadas.

---

## Specs afetadas

### `spec/{arquivo}.md`

**Seção:** {nome da seção}

**Mudança proposta:**

```diff
- {texto atual}
+ {novo texto}
```

**Motivo:** {justificativa}

---

### `spec/features/{slug}.md` _(novo arquivo)_

**Conteúdo proposto:**

```markdown
# spec/features/{slug}.md

## Visão geral

{descrição do módulo/feature}

## Comportamento por stage

### Stage 1 — {nome}
{comportamento implementado e validado}

### Stage 2 — {nome}
{comportamento implementado e validado}

### Stage 3 — {nome}
{comportamento implementado e validado}

## Contratos de API

{endpoints, tipos, campos relevantes}

## Regras de negócio

{regras validadas}

## Restrições conhecidas

{limitações documentadas}
```

---

## Checklist antes de promover

- [ ] Todas as stages concluídas e validadas
- [ ] Comportamento descrito é o implementado (não intenção)
- [ ] Revisão humana confirmada
- [ ] Pronto para `/update-spec`
