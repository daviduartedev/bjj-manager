# Feature: landing pública (marketing)

Contrato canónico para a **landing pública** não autenticada do Casca, alinhado a **SPEC-10.x** (identidade, tokens) e ao ciclo [`cycles/Q22026/23-0430-ajustes-finos`](../../../cycles/Q22026/23-0430-ajustes-finos).

## Relação com outras specs

- Identidade visual e tokens: [`spec/product/spec.md`](../../product/spec.md) (**SPEC-10.**), [`spec/features/design-system/readme.md`](../design-system/readme.md) (**DS-**).
- Área autenticada e rotas do produto: [`spec/features/app-shell/readme.md`](../app-shell/readme.md) (**SHELL-**).

## Implementação (referência)

| Área        | Artefactos típicos                                      |
|-------------|---------------------------------------------------------|
| Página/marketing | `components/marketing/landing-page.tsx`; entrada em `app/page.tsx` ou rota pública equivalente |
| Marca       | `public/logo_sem_fundo_preto__1_-removebg-preview.png` (logo oficial para substituir ícones decorativos acordados no ciclo) |

## ML-1. Secções visuais cobertas pelo ciclo 23-0430

**ML-1.1.** Secção com título **“O que você faz dentro do Casca”** (grelha de funcionalidades): cartões devem usar superfícies e tipografia **coerentes** com o tema escuro da página (**SPEC-10.2**, **SPEC-10.3**), sem blocos brancos destoantes; responsividade **mobile-first**.

**ML-1.2.** Secção com título **“Feito para quem ensina e para quem administra a escola”**: elemento visual principal da marca deve ser a **logo** acima referida no lugar de ícones decorativos genéricos, sem distorção de proporção.

## Manutenção

Alterações de copy ou estrutura da landing que afectem mensagens de produto devem rever **SPEC-2.** / **SPEC-5.** quando descreverem capacidades (ex.: nomes de planos).
