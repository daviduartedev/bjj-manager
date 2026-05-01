# language: pt
# Ciclo: Q22026/05-0430-rls-and-security
# Cenários de negócio (o que o utilizador observa). Detalhe de políticas e DDL em spec/features/rls-security e docs/security/rls.md.

Funcionalidade: Isolamento de dados entre academias
  Como professor autenticado na minha academia
  Quero que apenas os dados da minha conta apareçam e possam ser alterados
  Para que outra academia nunca aceda aos meus alunos, planos ou financeiro

  Esquema do cenário: Professor só vê a própria academia
    Dado que existem pelo menos duas academias com dados distintos no sistema
    E que o professor A está autenticado como utilizador da academia A
    Quando o professor A consulta alunos, planos, graduações ou mensalidades
    Então só vê registos pertencentes à academia A
    E não vê nem consegue inferir pelo sistema os dados da academia B

  Esquema do cenário: Visitante anónimo não acede ao domínio nem ao catálogo de faixas
    Dado que existem academias com dados no sistema
    E que o pedido ao servidor usa apenas o acesso público/anónimo (sem sessão de professor)
    Quando se consulta informação de alunos, planos ou mensalidades
    Então não é devolvida qualquer linha dessas áreas
    Quando se consulta o catálogo global de faixas
    Então também não é devolvida informação desse catálogo

  Cenário: Professor gere a operação normal dentro da própria conta
    Dado que o professor está autenticado na sua academia
    Quando gere alunos, histórico de graduação, planos, vínculos aluno-plano e mensalidades
    Então consegue criar, alterar e remover o que o produto expõe para o dia a dia
    E todas essas operações permanecem restritas à sua academia

  Cenário: Catálogo de faixas é só leitura para quem tem sessão
    Dado que o professor está autenticado
    Quando precisa de escolher ou validar faixas ao tratar alunos
    Então consegue ler o catálogo oficial de faixas
    Mas não consegue alterar esse catálogo pela aplicação
