# CLAUDE.md — convenções do site (ranzouu.github.io)

Astro 5, design system sumi-e (tokens em `src/styles/global.css`: `--paper`, `--ink`, `--seal`, `--mincho`, `--mono`).

## Invariantes de layout

- **Todo conteúdo de página entra em `<main class="wrap">`.** O `Layout` pinta `body::before` (ruído) e `body::after` (montanhas ukiyo-e) como camadas `position: fixed`. Um `<main>` estático fora do `.wrap` (que tem `position: relative; z-index: 1`) fica **atrás** dessas camadas — o texto soma. Páginas novas: `.wrap` + `section class="... glass-block"`, sempre.
- Seções são `<section>` com `head` (kanji + título + sub), lista com `border-top: 1px solid var(--hairline)` e painéis com hover que levanta (`translate3d(0,-3px,0)`) e kanja-índice que acende em `--seal`.
- Revelação: `class="reveal"` + `style="--reveal-delay: calc(N * var(--motion-stagger))"`. Sem JS o site fica totalmente visível (o `html.js` só é adicionado por script inline).
- Toda página nova de leitura longa usa o tratamento de vidro (`glass-block`), tipografia `--mincho` nos títulos, `--mono` nos metadados, código em `pre` com fundo `--paper-tint`.

## Artigos (content collection)

- `src/content/config.ts` define a coleção `artigos` (glob em `src/content/artigos/*.md`; schema: `title`, `description`, `pubDate`, `tags`).
- Publicar artigo novo = commitar um `.md` em `src/content/artigos/` — entra sozinho no índice (`/artigos/`), na home e no sitemap. Não editar código.
- Slug do arquivo vira a URL: `metricas-que-eu-posso-defender.md` → `/artigos/metricas-que-eu-posso-defender/`.
- `/artigo/` (singular) é redirect legado — o CV aponta lá.

## Deploy e manutenção

- Push em `main` dispara o GitHub Actions que publica; o feed de commits da home é atualizado por bot (`pull --rebase` antes de push).
- Nunca commitar `portfolio-audit/` (repo git aninhado, untracked por natureza).
- Build local: `npm run build` — falha ruidosamente se uma página de collection quebrar (é o smoke test).
