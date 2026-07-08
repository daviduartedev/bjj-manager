# review.md — Matrícula e Termo de Responsabilidade (WhatsApp + assinatura digital)

## Cycle: 0708-enrollment-liability-whatsapp-signing

**Data:** 2026-07-08

---

## Resumo

Implementação completa das 3 stages: CRUD de matrícula/termo ASLAM (ELF), assinatura digital via link público e WhatsApp, e fallback de upload manual.

---

## Pontos fortes

- Templates ASLAM adulto/menor com cláusulas literais e numeração ELF
- Fluxo de assinatura sem dependência de ICP-Brasil; token SHA-256 com TTL configurável
- Destinatário WhatsApp correto (responsável para menores, aluno para adultos)
- Auditoria consistente com eventos existentes do módulo de documentos
- Fallback manual para academias que recebem assinatura em papel

---

## Riscos / limitações

| Item | Severidade | Nota |
|---|---|---|
| Assinatura via re-render HTML→PDF | Baixa | Alternativa a `pdf-lib`; PDF assinado é novo render, não overlay no original |
| Token público sem rate-limit | Média | Mitigado por TTL 7d, uso único e hash em BD |
| Smoke mobile não executado nesta sessão | Baixa | Recomendado antes de produção |
| `spec-delta` não promovido | — | Aguarda `/update-spec` explícito |

---

## Conformidade com spec-delta

| Requisito | Status |
|---|---|
| Tipo `enrollment_liability_form` / ELF | OK |
| `guardian_phone` no aluno | OK |
| Link `/assinatura/{token}` | OK |
| Mensagem WhatsApp curta | OK |
| Upload manual ≤ 10 MB | OK |
| Badges e chip pendente | OK |
| Filtro em `/documentos` | OK |

---

## Recomendações pós-merge

1. Smoke test em mobile: abrir link WhatsApp, assinar, verificar PDF na academia
2. Validar cenários em `scenarios.feature` manualmente
3. Executar `/update-spec` para promover `spec-delta.md`
