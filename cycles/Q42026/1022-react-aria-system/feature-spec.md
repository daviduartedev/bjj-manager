## Problem Statement

As telas do Casca apresentam diferenças entre campos, botões, abas e listas: altura, foco, hover, navegação por teclado e alinhamento de ações dependem da página. No cadastro `/register`, Cidade aparece antes de Estado, é texto livre e menus podem se abrir cortados ou em posição pouco útil. A senha é aceita com apenas oito caracteres e a interface não orienta uma escolha forte.

## Solution

Adotar React Aria Components como base dos controles compartilhados, mantendo a identidade visual e os tokens existentes do Casca. Unificar tamanhos e estados de interação, semântica acessível, comportamento de popovers e padrão de ações. Migrar o produto em tickets verticais por área, mantendo cada lote verificável.

No `/register`, apresentar Estado antes de Cidade. A seleção de UF habilita um campo Cidade pesquisável, limitado aos municípios dessa UF, com estados de carregamento, erro e ausência de resultados. A senha deve aceitar uma frase-senha longa, ter no mínimo 15 caracteres e não impor mistura de classes. A mesma regra precisa ser aplicada no servidor e no Supabase Auth. Quando o plano do Supabase permitir, habilitar também a proteção contra senhas vazadas; não alegar esse bloqueio na UI antes de confirmar a configuração.

## User Stories

1. As a professor creating an academy, I want to see a consistent field height and spacing, so that forms feel like parts of the same product.
2. As a keyboard user, I want a clear and consistent focus indicator, so that I can tell where I am in every flow.
3. As a screen-reader user, I want labels, descriptions, errors, and required states connected to their controls, so that I can complete forms independently.
4. As a user in the light or dark theme, I want control colors to come from Casca tokens, so that contrast and brand identity remain coherent.
5. As a mobile user, I want primary controls to have comfortable touch targets, so that I can use forms without precision taps.
6. As a user opening a dropdown near the bottom of the screen, I want its options to remain visible and navigable, so that the menu is not clipped.
7. As a keyboard user, I want to navigate and select dropdown and autocomplete options with standard keys, so that pointer input is not required.
8. As a user scanning actions, I want primary and secondary actions grouped consistently with the primary CTA at the end when appropriate, so that the next step is predictable.
9. As a user, I want links and actions to retain their correct semantics, so that keyboard and assistive technology communicate their purpose accurately.
10. As a user of tabbed screens, I want tabs to share focus, selected, and hover behavior, so that navigation works consistently throughout the application.
11. As an academy owner registering in Casca, I want to select my state before my city, so that the city choices are relevant.
12. As an academy owner registering in Casca, I want to search municipalities by name, so that I can find my city quickly.
13. As an academy owner changing the state, I want the previous city selection cleared, so that an invalid state/city pair cannot be submitted.
14. As an academy owner on a slow connection, I want to see when city options are loading, so that I understand the form is responding.
15. As an academy owner when the municipality service is unavailable, I want an actionable error and retry path, so that I can recover without losing other registration data.
16. As an academy owner when no municipality matches my search, I want a clear empty result, so that I can adjust the search rather than guessing.
17. As an academy owner creating an account, I want to use a long passphrase without arbitrary symbol rules, so that I can choose a memorable but hard-to-guess password.
18. As an academy owner, I want the minimum password length explained before submission, so that I can satisfy the policy without trial and error.
19. As a security-conscious user, I want known common or compromised passwords rejected when the configured authentication provider supports it, so that trivial or exposed passwords are not accepted.
20. As an operator, I want client and server password validation to agree with Supabase Auth, so that valid registrations do not fail with a late provider error.
21. As a user submitting a form, I want loading, disabled, invalid, and error states to look and behave consistently, so that I understand what is happening and what needs attention.
22. As a maintainer, I want form controls to use a small set of shared primitives, so that an accessibility or styling improvement can be applied consistently.
23. As a maintainer migrating the rest of the product, I want each area delivered as an independently testable vertical slice, so that the wide refactor does not leave the application broken between batches.
24. As a maintainer, I want the component gallery to demonstrate light/dark and interaction states, so that future changes can be checked against the design contract.

## Implementation Decisions

- Use React Aria Components for shared field, button, selection/autocomplete, popover, and tab behavior; preserve Casca semantic tokens and existing product typography.
- Prefer composable wrappers in the existing shared UI layer. During migration, retain compatibility adapters where changing the current API in one step would break many consumers.
- Prefer popover placement below the trigger, while retaining collision handling and viewport constraints so that options remain reachable on small screens.
- Keep navigation links as links and form commands as buttons; primary form actions align to the end of their action group when appropriate.
- Use the official IBGE Localidades municipalities endpoint, keyed by selected UF; do not add a third-party static municipality package or database migration. Cache/timeout/retry behavior must not allow a city from the previous UF to remain selected.
- Validate the selected state and city relationship server-side; the client-side list is not an authorization boundary.
- Use 15 characters as the minimum single-factor password length, support long passphrases (at least 64 characters if the provider permits), avoid composition rules and periodic forced resets, and compare against a compromised/common-password blocklist using Supabase Auth's supported protection when available and enabled.
- Do not claim leaked-password protection if the active Supabase plan/configuration does not provide it. Surface provider weak-password errors accessibly without logging password content.
- Do not change unrelated business rules, data models, or page layouts as part of control migration.

## Testing Decisions

- Good tests assert observable behavior, keyboard semantics, validation and recovery states, not implementation-specific class names or React Aria internals.
- Use the public registration wizard as the highest end-to-end seam for state→city selection, validation, step progression, and submission. Stub the account-creation boundary so tests never create real Supabase users.
- Use the development design-system gallery as the shared primitive contract seam for focus, selected/disabled/invalid/hover states, tab behavior, popover placement, and light/dark token rendering.
- Test the municipality integration against deterministic mocked responses for loading, success, empty, timeout/error, state change, and retry behavior; separately verify the upstream IBGE response contract.
- Test password policy both at the form/schema boundary and at the server registration boundary, including under-minimum rejection before Supabase is called and acceptance of long passphrases without composition rules.
- Test migrated product areas through their existing module/action tests and route-level smoke checks, grouped into independently releasable tickets.
- Prior art includes the academy registration schema and auth service tests, shared UI primitives and `/design-system` gallery, and the repository's Playwright E2E suite.
- Final validation includes type-check, lint, affected tests, full unit suite, production build where supported, responsive browser smoke, and an accessibility-focused review.

## Out of Scope

- A wholesale redesign of page layouts or marketing/authentication art direction.
- MFA, passwordless sign-in, recovery-flow redesign, or replacing Supabase Auth.
- A custom breach-password database or external breach-check integration beyond the provider's supported capability.
- Database persistence or import of the national municipality list.
- Refactoring unrelated business logic or changing permissions/RLS.
- Promoting this proposal to canonical `spec/` before implementation is validated and approved.

## Further Notes

- The project currently uses Next 15 and React 19 RC; compatibility must be confirmed in the actual build and browser before adopting the dependency broadly.
- Current Supabase documentation describes leaked-password protection as available on Pro and above. Verify the test and production project's plan/settings before stating it is active.
- References: React Aria Components documentation; IBGE Localidades API documentation; NIST SP 800-63B-4; Supabase Auth password security documentation.
