# Padronizar as áreas logadas no padrão da home

Status: ready-for-agent

## Problem Statement

A home da área do professor já é um dashboard de SaaS: fundo cinza, cards brancos, cabeçalho com título e contexto à esquerda e ações à direita. As outras telas da área do professor e todo o portal do aluno ainda usam o hero antigo (selo, título, texto e traço) e, no portal, uma barra fixa de marca e conta. Quem opera a academia atravessa telas que não parecem o mesmo produto.

## Solution

Mapear todas as telas logadas e vestir cada uma, exceto a home já aprovada, com três modelos estruturais do mesmo padrão visual. A pessoa troca o modelo por `?variant=` e por uma barra flutuante, e aprova no fim. A home do professor permanece a referência e não entra na troca. O portal do aluno perde a barra de cima no desktop, no mesmo espírito da área do professor.

## User Stories

1. As a professor, I want every logged-in screen except the home to share the home's canvas, type, and buttons, so that the product feels like one SaaS.
2. As a professor, I want the page header to sit where "Bem-vindo de volta" sits on the home, so that the title and the actions are always in the same place.
3. As a professor, I want at most one primary and one secondary action in that header, so that a screen does not grow a row of competing buttons.
4. As a professor, I want a screen with no real action to show only the title and one context line, so that perfil and configurações do not invent a button.
5. As a professor, I want to flip three structural layouts of the same screen with a control that is obviously not part of the product, so that I can approve one model later.
6. As a professor, I want the choice of model to survive a reload, so that I can compare Alunos and Mensalidades in the same model.
7. As a professor, I want Alunos to show its real list, filters, and "Cadastrar aluno" inside each model, so that I judge density with real data.
8. As a professor, I want Mensalidades to keep its real billing list and the action that records a payment, so that the header does not replace the work.
9. As a professor, I want Aulas to keep today's sessions, classes, and the path into a session, so that the schedule stays operable.
10. As a professor, I want Pedagógico to keep plans and the action that creates a plan, so that the curriculum screens stay reachable.
11. As a professor, I want Documentos to keep the document list and the open action, so that a file is still one click away.
12. As a professor, I want Matrículas to keep terms and the action that starts a new enrollment, so that the legal flow is unchanged.
13. As a professor, I want Produtos to keep the product list and the action that records a movement, so that the shop notebook stays intact.
14. As a professor, I want Configurações and Perfil to keep their forms and drop the old hero, so that quiet screens still match the canvas.
15. As a professor, I want a create or edit screen to keep its fields and its save action in the header, so that a form is readable and the primary action is obvious.
16. As a professor, I want a student profile, a class, a session, a plan, a document, and an enrollment detail to keep their real content under the new header, so that drill-in screens match the index.
17. As a student, I want the portal home, classes, attendance, shop, and billing to use the same three models, so that the portal feels like the same product.
18. As a student, I want onboarding, blocked, and unavailable states to use the same canvas and header, so that an edge screen is not a leftover layout.
19. As a student, I want the desktop portal to open without the old top bar of logo and account, so that the page header is the "Bem-vindo" block.
20. As a student, I want my account control at the bottom of the sidebar on desktop, and a short icon row with menu and account on mobile, so that I can still leave and navigate.
21. As a professor, I want the approved home to stay as it is when I open Painel, so that the reference design is not replaced by a prototype.
22. As a visitor, I want login, the landing page, terms, privacy, and a public signature link to stay as they are, so that this pass only touches an área logada.
23. As a professor, I want arrow keys to cycle the models only when I am not typing in a field, so that a search box still moves the caret.
24. As a professor, I want the model switcher to disappear in a production build, so that a stray prototype cannot ship to academies.

## Implementation Decisions

- Área logada means the professor area and the student portal. The home of the professor area is the visual reference and is not wrapped in the prototype.
- The page header is the block in the "Bem-vindo" position: title and one context line on the left; actions on the right.
- Actions: at most one primary and one secondary. They use the home button size (tall, rounded). A screen with no real action renders no button. Do not invent metrics, time series, or labels.
- Three structural models, switchable with `?variant=A|B|C`, default A. They share the home tokens (gray canvas, white rounded cards, display type, primary and outline buttons) and disagree about structure:
  - A Faixa: header row like the home, then the existing work stacked on the gray canvas in white cards.
  - B Mesa: a compact toolbar with the title and the actions on one line and the context beneath; the work is one surface under that toolbar, not a second hero.
  - C Ficha: a side column with the title, the context, and the actions stacked; the work sits in the other column. On a narrow viewport the identity column stacks above the work.
- A floating switcher sits at the bottom center, above the mobile nav: previous, label (`A · Faixa`), next. It writes `?variant=` with a replace navigation. Hidden when `NODE_ENV` is production. Keyboard arrows cycle unless focus is in an input, textarea, or contenteditable.
- The question this prototype answers: which page frame should carry the home's visual system across the other logged-in screens?
- Existing data, routes, empty copy, and links stay. The prototype replaces the old page hero and the outer page wrapper only. It does not restyle tables, forms, or dialogs field by field.
- The professor content column is full-bleed on every professor route, matching the home. A page that has not moved to the frame yet may keep its own max width so the intermediate tree does not stretch uncontrolled.
- The student portal keeps its own destinations. Desktop drops the sticky brand-and-account bar. Account sits at the end of the sidebar. Mobile keeps a short row with the menu and the account control. The page header lives in the content.
- No new dependencies. Charts and KPIs that already exist on a screen stay real. Do not add a dashboard library.
- The single seam under test is the page-frame decision: which variant key is selected, and which actions are allowed on the header. Visual approval of the three models is human, when the person returns.

## Testing Decisions

- A good test asserts the header decision from the outside: a known variant key selects that model name; a missing key selects Faixa; more than one primary is reduced to the first; a screen with no action yields no button.
- Test that pure decision, not the markup of each screen.
- Follow the existing unit-test style next to other painel helpers. Do not add browser tests for the prototype.

## Out of Scope

- Choosing a winning model. All three stay until a person picks.
- Redesigning the approved home.
- Login, landing, terms, privacy, public signature, and the design-system page.
- WhatsApp payment reminders on the home.
- New metrics, new copy, new routes, or a new component library.
- Rewriting the internals of lists, forms, and dialogs.

## Further Notes

The person will be away and will validate visually on return. The branch should leave every logged-in screen, except the home, flippable across the three models with real data still in place.
