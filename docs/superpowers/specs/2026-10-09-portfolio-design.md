# Design Spec — Portfólio pessoal (editorial)

**Data:** 2026-10-09
**Status:** aguardando revisão do Rayson

## Contexto

Rayson é personal trainer em transição para TI, em Fortaleza. Este portfólio é sua presença pessoal na web: um cartão de visita que mostra quem ele é e o que constrói. Não é um site de vendas nem um currículo otimizado para ATS.

**Projetos a exibir** (todos reais, no disco):
- **cryptobotz** — bot de trading cripto (Python), modo paper trading, 122 testes
- **DailyRoutine** — app iOS SwiftUI com HealthKit, dashboard de hábitos
- **tameru** — projeto pessoal
- **tomawatchi** — projeto pessoal
- **leadforge** — projeto pessoal

## Design read

Portfólio pessoal editorial para audiência geral, tipografia expressiva, layout assimétrico, respiro de galeria. Não é "dev portfolio dark tech" — é revista impressa que acontece falar de código.

**Dials:** VARIANCE 6 · MOTION 5 · DENSITY 3

## Stack

- **Astro 5** — zero JS por padrão, ilhas só se necessário
- **CSS nativo** — scroll-driven animations (`animation-timeline: view()`), View Transitions, `@layer` para tokens. Sem Tailwind (editorial pede CSS autoral, e o site é pequeno)
- Fontes self-hosted, `font-display: swap`, subset latin
- Deploy alvo: estático (Vercel/Cloudflare Pages/Netlify — decidir no momento do deploy)

## Tipografia

- **Display:** serif editorial — Newsreader (ou Playfair Display como fallback de preferência)
- **Corpo:** grotesk neutra — Archivo (ou Inter Tight)
- **Metadados/labels:** IBM Plex Mono — o toque "dev" dentro do frame revista
- Escala tipográfica fluida via `clamp()`. Headlines: serif, tracking apertado, itálico só para ênfase na mesma fonte
- Descendentes em itálico: `line-height` mínimo 1.1 com reserva

## Paleta

Uma cor de acento na página inteira, travada: **verde profit** (herança cryptobotz).

- Modo claro: papel off-white frio (`#fafaf7`-family), tinta quase-preta, verde dessaturado para links/hover
- Modo escuro: automático via `prefers-color-scheme`, CSS variables trocam os tokens
- Contraste: AA no corpo (alvo AAA no hero), sem preto `#000` nem branco `#fff` puros
- Zero gradientes decorativos

## Estrutura — one-pager, 5 seções

1. **Hero editorial** — nome grande em serif alinhado à esquerda; uma linha de posicionamento (máx 20 palavras); CTA único "Ver projetos". Sem foto obrigatória.
2. **Trabalhos** — índice editorial, um projeto por linha: nome grande + ano + stack em mono. Hover revela screenshot (placeholder picsum com seed descritivo por enquanto; substituir pelos reais depois). 5 projetos = 5 linhas, layout de índice, não cards.
3. **História** — a transição treino→código, 2–3 parágrafos curtos e pessoais. Diferencial de narrativa.
4. **Stack** — agrupada por contexto (Linguagens / Mobile / Dados & bots), duas colunas no desktop, texto simples sem badges.
5. **Contato** — rodapé: email, GitHub, LinkedIn. Um CTA só ("Fale comigo" OU email direto, não ambos com mesmo intent).

## Motion

- Reveals de seção: **CSS scroll-driven animations** nativo (`animation-timeline: view()`), zero JS
- Hover no item do índice: imagem aparece com micro fade/slide
- `prefers-reduced-motion`: tudo estático (gate `@media (prefers-reduced-motion: no-preference)`)
- Sem scroll-hijack, sem marquee, sem parallax

## Performance (alvo)

- **JS total: 0KB** (meta; Astro islands só se algo interativo se provar necessário)
- Fontes: 3 famílias, subset, woff2, self-hosted
- Lighthouse 100 / 100 / 100 / 100; LCP < 2.5s
- Imagens: AVIF/WebP via `astro:assets`, lazy abaixo da dobra

## Acessibilidade

- HTML semântico, navegação por teclado, focus states visíveis
- Contraste AA em ambos os modos
- `lang="pt-BR"`

## Idioma

Português (BR). Assumido por contexto — confirmado informalmente; trocar depois exige rewrite de copy.

## Conteúdo — fonte da verdade

Textos (hero, história, descrições de projeto) serão escritos na implementação a partir de conversa com o Rayson. Nada de copy inventada com números fake; descrições de projeto saem dos READMEs reais dos repositórios.

## Fora de escopo (v1)

- Blog/seções de posts
- Bilíngue PT/EN
- CMS
- Analytics

## Decisões registradas

| Decisão | Valor | Motivo |
|---|---|---|
| Framework | Astro 5 | leveza + novas APIs nativas |
| Estética | Editorial, claro-escuro auto | escolha explícita do Rayson |
| Acento | Verde | identidade cryptobotz (default; não confirmado) |
| Screenshots | Placeholders picsum | layout primeiro, reais depois |
| Idioma | PT-BR | audiência natural (assumido por silêncio) |

## Decisões pós-spec (durante implementação, verificadas)

- **Tokens oklch → hex equivalentes**: axe-core (auditor do Lighthouse) não parseia `oklch()` e reportava falhas de contraste falsas no dark mode. Hex equivalentes dos mesmos tons, contraste AA confirmado matematicamente nos dois modos.
- **CSS inline no build** (`inlineStylesheets: "always"`): eliminou 400ms de render-blocking; Lighthouse perf 82 → 100.
- **Reveal slide-only (sem fade)**: keyframe com `opacity` deixava texto abaixo da dobra invisível no estado de repouso; axe media contraste no texto apagado. O keyframe agora anima só `translate`.
- **Preload das duas faces do LCP** (Newsreader 500 + italic) e remoção das faces não usadas (Newsreader 400, Archivo 500; arquivos woff2 correspondentes removidos do repo).
- **Screenshots via `public/` + `loading="lazy"`** em vez de `astro:assets` AVIF/WebP: 5 shots hover-only (280px), ganho marginal não justifica o pipeline; única divergência consciente do spec de performance.
- **PNG do DailyRoutine redimensionado** 196KB → 42KB (`sips -Z 600`); `aspect-ratio` + `object-fit: cover` no hover resolve o retrato 276×600 na caixa 1200/750.

## Aberto / risco

- Copy precisa de sessão curta com o Rayson para não virar texto genérico
- Conteúdo de tameru/tomawatchi/leadforge: preciso ler os READMEs para descrever direito
- Deploy: escolher plataforma (Cloudflare Pages recomendado — grátis, rápido, sem vendor lock)
