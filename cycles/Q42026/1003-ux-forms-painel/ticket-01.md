## Parent

Part of #6

## What to build

«Hoje» e os defaults de data usam o dia civil em São Paulo. No cadastro/edição, faixa branca pede só o ano de entrada, grava 1 de janeiro desse ano, e rejeita ano futuro **nesse campo**. Salvar peso não cria uma data da graduação futura; se a entrada estiver no futuro, o erro fica no campo de entrada, sem toast duplicado. O print «A data da graduação não pode ser no futuro» deixa de aparecer num salvar válido à noite.

## Acceptance criteria

- [ ] Defaults de nascimento e data de entrada no cadastro novo usam o dia civil em America/Sao_Paulo, nunca o dia UTC.
- [ ] Faixa branca: o campo mostra e edita só o ano; o valor persistido é sempre `YYYY-01-01` desse ano.
- [ ] Ano posterior ao ano civil actual é inválido no campo de ano de entrada; não há toast com a mesma frase.
- [ ] Salvar peso não insere graduação com data futura; o erro, se existir, mapeia ao campo de entrada.
- [ ] Testes TDD no seam de data civil + ano de entrada, com literais (1 de janeiro, ano futuro rejeitado), sem mockar a base.

## Blocked by

- None (can start immediately).
