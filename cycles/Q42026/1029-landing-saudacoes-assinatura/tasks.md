# Tasks

- [x] Remover `LpEyebrow` e as linhas equivalentes acima dos títulos (`lp-belts`, `lp-faq`, `lp-pricing`,
      `lp-product-overview`, `lp-how-it-works`, e os componentes fora da página `lp-audience`,
      `lp-product-flow`, `lp-system-section`). Componente `LpEyebrow` apagado.
- [x] Alargar o contêiner do título do soquinho (`max-w-3xl` → `max-w-5xl`) para "Mensalidade com status."
      não ser cortado em telas largas.
- [x] Criar `lp-salutes.tsx`, `lp-salute-art.tsx` e `lp-salutes.module.css`; trocar `LpTrust` por `LpSalutes`
      e apagar `lp-trust.tsx`.
- [x] Selects de grau sem `String(null)` (`student-form`, `quick-edit-dialog`, `graduation-event-dialog`).
- [x] Labels acessíveis em 27 campos sem label ligada, usando o texto visível já existente.
- [x] Reescrever `subscription-panel.tsx` em três telas: contratação, retorno do checkout e troca de plano,
      com o valor da troca vindo de `quoteSubscriptionPlanChange`.
- [x] Conferir desktop e mobile no navegador.
