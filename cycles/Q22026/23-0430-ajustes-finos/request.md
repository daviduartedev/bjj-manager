# Request: Ajustes de UI e Migração de Planos — Casca

Você deve atuar como engenheiro full-stack sênior, com atenção a UI, consistência visual, regras de negócio e migração segura de dados.

Este ciclo tem três objetivos:

1. Corrigir bug visual nos cards da seção **“O que você faz dentro do Casca”**.
2. Ajustar a seção **“Feito para quem ensina e para quem administra a escola”**, substituindo os ícones pela logo do Casca.
3. Atualizar a lógica de planos/categorias de alunos, criando **Kids 1** e **Kids 2**, migrando os alunos atualmente em **Juvenil** para **Kids 1** inicialmente.

---

## 1. Ajuste visual — Cards da seção “O que você faz dentro do Casca”

Na seção com o título:

```txt
O que você faz dentro do Casca

existe um bug visual: os cards estão todos com fundo branco, o que está quebrando a identidade visual da página.

Objetivo

Corrigir a cor dos cards para que eles fiquem alinhados com a identidade visual do Casca e com o restante da landing/page.

Requisitos
Identificar o componente/seção responsável pelos cards.
Ajustar background, borda, texto e hover, se aplicável.
Evitar cards totalmente brancos caso isso não combine com a paleta atual.
Manter contraste adequado e boa legibilidade.
Garantir que o ajuste funcione em desktop e mobile.
Não alterar textos ou estrutura da seção sem necessidade.
Se houver tokens de design, variáveis CSS ou Tailwind theme, usar o padrão existente em vez de hardcode aleatório.
Critério de aceite
Os cards não devem mais aparecer brancos de forma destoante.
A seção deve manter coerência visual com a marca Casca.
O texto dos cards deve continuar legível.
Não deve haver regressão visual em mobile.
2. Ajuste visual — Logo no lugar dos ícones

Na seção:

Feito para quem ensina e para quem administra a escola

atualmente existem ícones nos cards/blocos.

Objetivo

Substituir os ícones pela logo do Casca.

Requisitos
Localizar a seção correta.
Substituir os ícones pela logo do Casca.
Usar o asset oficial da logo já existente no projeto.
Se houver mais de um formato, preferir SVG ou PNG otimizado.
Ajustar tamanho, espaçamento e alinhamento para que a logo não fique desproporcional.
Garantir boa visualização em fundo claro e escuro.
Manter responsividade.
Não duplicar assets se a logo já existir no projeto.
Critério de aceite
A seção deve exibir a logo do Casca no lugar dos ícones.
A logo deve estar centralizada/alinhada corretamente.
O layout não deve quebrar em desktop ou mobile.
Não deve haver distorção da logo.
3. Ajuste de planos/categorias — Adultos, Juvenil, Kids 1 e Kids 2

Hoje o sistema conta com os planos/categorias:

Adultos
Juvenil

A nova necessidade é dividir os alunos juvenis em duas categorias:

Kids 1
Kids 2

Porém, para evitar perda ou classificação errada automática, todos os alunos atualmente classificados como Juvenil devem ser migrados inicialmente para Kids 1.

Depois disso, o professor poderá revisar manualmente e alterar quem deve ficar em Kids 1 e quem deve ir para Kids 2.

Regra de migração
Estado atual
Adultos → R$ 120
Juvenil → R$ 120
Novo estado esperado
Adultos → R$ 120
Juvenil → R$ 120
Kids 1 → R$ 100
Kids 2 → R$ 100
Migração inicial

Todos os alunos atualmente vinculados ao plano/categoria:

Juvenil

devem passar inicialmente para:

Kids 1

Isso é proposital.

Não tentar inferir automaticamente quem é Kids 1 ou Kids 2.

O professor fará essa separação manualmente depois.

Requisitos funcionais
Criar ou disponibilizar os planos/categorias:
Kids 1
Kids 2
Definir valor padrão:
Kids 1: R$ 100
Kids 2: R$ 100
Manter os valores atuais:
Adultos: R$ 120
Juvenil: R$ 120
Permitir que os valores continuem editáveis pelo professor/administrador, caso essa funcionalidade já exista.
Migrar todos os alunos atualmente associados a Juvenil para Kids 1.
Não apagar o plano/categoria Juvenil, salvo se houver confirmação explícita ou se a arquitetura do sistema exigir substituição. Neste ciclo, a orientação é manter Juvenil disponível, mas sem alunos migrados, para evitar quebra ou perda histórica.
Garantir que listagens, filtros, formulários e telas de edição reconheçam:
Adultos
Juvenil
Kids 1
Kids 2
Garantir que o professor consiga alterar um aluno de Kids 1 para Kids 2 manualmente.
Garantir que mensalidades, planos ou cobranças futuras usem o valor correto da categoria/plano após a alteração.
Cuidados importantes

Antes de alterar dados, verificar como o sistema modela essa informação:

- plano;
- categoria;
- turma;
- faixa etária;
- billing plan;
- student plan;
- mensalidade;
- algum campo equivalente.

Não assumir que “Juvenil” é apenas texto visual. Verificar se existe relação em banco, enum, tabela de planos, tabela de mensalidades ou seed SQL.

Se houver seed, migration ou dados fixos, atualizar todos os pontos necessários.

Migração de dados

Criar uma migração ou script seguro para:

garantir existência de Kids 1 com valor padrão de R$ 100;
garantir existência de Kids 2 com valor padrão de R$ 100;
localizar todos os alunos atualmente em Juvenil;
alterar esses alunos para Kids 1;
preservar histórico sempre que o sistema tiver histórico;
evitar duplicar planos se o script/migração rodar mais de uma vez.

A migração deve ser idempotente sempre que possível.

Validações esperadas

Após a alteração, validar:

aluno que era Juvenil aparece como Kids 1;
Kids 1 aparece com valor R$ 100;
Kids 2 aparece com valor R$ 100;
Adultos continua R$ 120;
Juvenil continua R$ 120;
o professor consegue editar um aluno de Kids 1 para Kids 2;
o professor consegue editar valores dos planos, se essa funcionalidade existir;
listagens e filtros não quebram;
mensalidades futuras usam o valor atualizado do plano/categoria;
não há perda de dados;
não há duplicação indevida de planos.
Testes obrigatórios

Adicionar ou atualizar testes conforme o padrão existente no projeto.

Cobrir, no mínimo:

- existência dos planos/categorias Adultos, Juvenil, Kids 1 e Kids 2;
- valores padrão corretos;
- migração de alunos Juvenil → Kids 1;
- edição manual de Kids 1 → Kids 2;
- ausência de duplicação em reexecução da migração/seed;
- renderização correta nos formulários;
- renderização correta nas listagens;
- ausência de regressão nas mensalidades.

Se já houver testes E2E/Playwright, adicionar cobertura funcional mínima.

Se o ajuste for melhor coberto por Vitest/unit/integration, usar o padrão já existente.

Critérios de aceite

Este ciclo só deve ser considerado concluído quando:

os cards da seção “O que você faz dentro do Casca” não estiverem mais brancos de forma incorreta;
a seção “Feito para quem ensina e para quem administra a escola” usar a logo do Casca no lugar dos ícones;
Kids 1 e Kids 2 existirem no sistema;
Kids 1 e Kids 2 tiverem valor padrão de R$ 100;
Adultos e Juvenil continuarem com valor de R$ 120;
todos os alunos que estavam em Juvenil forem migrados para Kids 1;
o professor puder alterar manualmente alunos de Kids 1 para Kids 2;
valores dos planos continuarem editáveis se essa funcionalidade já existir;
listagens, formulários e filtros estiverem funcionando;
testes relevantes estiverem passando;
pnpm test, pnpm type-check e pnpm lint passarem, se esses comandos existirem no projeto.
Entregáveis

Ao final, entregar:

- arquivos alterados;
- descrição objetiva das mudanças visuais;
- descrição da migração Juvenil → Kids 1;
- confirmação dos valores padrão;
- testes criados ou atualizados;
- comandos executados e resultado;
- riscos ou observações, se houver.
Resultado esperado

A landing/page deve ficar visualmente alinhada à identidade do Casca, e o sistema deve passar a suportar corretamente as categorias Kids 1 e Kids 2, com todos os alunos anteriormente em Juvenil migrados inicialmente para Kids 1, permitindo posterior ajuste manual pelo professor.