# spec/ — Índice de Especificações

Este diretório contém a **verdade canônica** do projeto: comportamento implementado, validado e aprovado.

> ⚠️ Não edite `spec/` diretamente durante um cycle. Use `spec-delta.md` no cycle e promova via `/update-spec` após validação.

---

## Índice

| Arquivo | Conteúdo |
|---|---|
| [`harness.md`](harness.md) | Conceito do Harness, tipos de cycle, políticas |
| [`development-workflow.md`](development-workflow.md) | Fluxo oficial de desenvolvimento SDD |
| [`security.md`](security.md) | Checklist e padrões de segurança |
| [`backend.md`](backend.md) | Padrões de backend |
| [`frontend.md`](frontend.md) | Padrões de frontend |
| [`database.md`](database.md) | Padrões de banco de dados |
| [`testing.md`](testing.md) | Política de testes |
| [`code-style.md`](code-style.md) | Política de estilo e formatação |
| [`features/`](features/) | Specs de features específicas (uma por feature) |

### Features (índice parcial)

| Slug | Spec |
|------|------|
| `student-portal` | [`features/student-portal/readme.md`](features/student-portal/readme.md) — Portal do aluno (**SPT-**) |

---

## Como usar

- **Antes de implementar:** leia as specs relevantes ao seu ciclo.
- **Durante o ciclo:** proponha mudanças via `spec-delta.md`.
- **Após validação:** promova via `/update-spec`.
- **Specs de features:** crie `spec/features/{slug}.md` via `/update-spec` após o primeiro ciclo que implementa a feature.

---

_Harness version: 1.0.0_
