## Parent

Part of #6

## What to build

Na área autenticada, formulários com largura máxima (inputs continuam altura 10), CTAs no fim à direita com a mesma altura e largura mínima, checkbox de formulário com quadrado `sm` e alvo de toque no conjunto (rótulo + quadrado) ≥ 44px, mensalidades inalteradas no `dense`. Modais: overlay com blur; três larguras (confirmação, formulário curto, formulário largo em duas colunas no desktop). Erro de preenchimento aparece uma vez, debaixo do campo; toast só para sucesso e falha sem campo. Landing e marketing ficam de fora.

## Acceptance criteria

- [ ] Formulários autenticados não esticam a viewport; CTAs alinhados à direita, mesma altura e min-width.
- [ ] Checkbox de formulário e diálogos usa `sm`; a linha inteira continua tocável; grelha de mensalidades permanece `dense`.
- [ ] Overlay dos diálogos escurece e desfoca; edição rápida e promover usam largura larga em duas colunas no desktop; confirmações usam largura estreita.
- [ ] Cadastro e edição completa continuam página, não modal.
- [ ] Quando a action devolve erros de campo, a UI mostra-os só nos campos e não repete a frase num toast.

## Blocked by

- None (can start immediately).
