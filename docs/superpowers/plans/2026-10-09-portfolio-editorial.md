# Portfólio Editorial — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One-pager editorial em Astro 5, zero JS de framework, PT-BR, dark mode automático, exibindo os 5 projetos reais do Rayson.

**Architecture:** Site estático de página única (`index.astro`) com 5 seções. Tokens de design em CSS variables (`@layer`), scroll-driven animations nativas, fontes self-hosted. Dados dos projetos num array tipado (`src/data/projects.ts`). Screenshot real do DailyRoutine; os outros 4 usam picsum-seed até o Rayson mandar os reais.

**Tech Stack:** Astro 5, CSS nativo (sem Tailwind), woff2 self-hosted (Newsreader, Archivo, IBM Plex Mono).

**Spec:** `docs/superpowers/specs/2026-10-09-portfolio-design.md`

---

## File Structure

```
portfolio/
├── package.json
├── astro.config.mjs
├── public/
│   ├── favicon.svg
│   ├── fonts/                # woff2 self-hosted
│   └── shots/
│       ├── dailyroutine-dash.png   # REAL (copiado de ~/Documents/DailyRoutine/docs/shot_t6_dash.png)
│       ├── cryptobotz.jpg          # picsum seed=cryptobotz-terminal 1200x750
│       ├── tameru.jpg              # picsum seed=tameru-particles 1200x750
│       ├── tomawatchi.jpg          # picsum seed=tomawatchi-evolution 1200x750
│       └── leadforge.jpg           # picsum seed=leadforge-agents 1200x750
└── src/
    ├── data/projects.ts
    ├── styles/global.css
    ├── layouts/Layout.astro
    └── sections/
        ├── Hero.astro
        ├── Work.astro
        ├── Story.astro
        ├── Stack.astro
        └── Contact.astro
```

## Decisões travadas (do spec + brainstorm)

- Dials: VARIANCE 6 · MOTION 5 · DENSITY 3
- Página clara como padrão; dark automático via `prefers-color-scheme`
- Acento único: verde dessaturado. Um sistema de canto: `--radius: 2px`
- Serif display: Newsreader (400/500 + itálico). Corpo: Archivo (400/500). Mono: IBM Plex Mono (400)
- Zero em-dash em copy visível. Zero emoji. Zero gradientes. Zero scroll cues. Zero kicker de localização.
- Hero: headline serif, sub ≤ 20 palavras, 1 CTA. Sem eyebrow.
- Índice de trabalhos = linhas com hover que revela screenshot flutuante. Não cards.
- Reveals: `animation-timeline: view()` com gate duplo `@media (prefers-reduced-motion: no-preference)` + `@supports (animation-timeline: view())`
- **Sem** View Transitions (one-pager, YAGNI). **Sem** Tailwind. **Sem** framework de componentes.
- CSS entra via `import "../styles/global.css"` no frontmatter do Layout (não via `<link>` para `src/`, que quebra no build de produção)
- Scaffold manual (package.json + config escritos à mão) — determinístico, sem prompt interativo do create-astro numa pasta já ocupada por docs/ e .git

## Copy — fonte da verdade

Descrições de projeto saem dos READMEs reais (já lidos). Copy da história é esboço honesto baseado na transição real do Rayson, marcada para revisão dele. Contato (email, GitHub, LinkedIn) precisa ser confirmado com o Rayson na Task 8.

---

### Task 1: Scaffold + tokens CSS

**Files:**
- Create: `package.json`, `astro.config.mjs`, `src/styles/global.css`, `src/layouts/Layout.astro`, `src/pages/index.astro`

- [ ] **Step 1: Escrever `package.json`**

```json
{
  "name": "portfolio",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

- [ ] **Step 2: Escrever `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";

export default defineConfig({});
```

- [ ] **Step 3: Rodar `npm install`**

Run: `npm install`
Expected: node_modules criado, astro 5.x instalado, zero erros.

- [ ] **Step 4: Escrever `src/styles/global.css`**

```css
@layer reset, tokens, base, components;

@layer tokens {
  :root {
    --paper: oklch(0.977 0.005 95);
    --ink: oklch(0.21 0.01 260);
    --ink-soft: oklch(0.45 0.012 260);
    --line: oklch(0.87 0.008 260);
    --accent: oklch(0.55 0.12 150);
    --accent-ink: oklch(0.98 0.005 95);
    --font-display: "Newsreader", Georgia, "Times New Roman", serif;
    --font-body: "Archivo", system-ui, sans-serif;
    --font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", monospace;
    --measure: 65ch;
    --space-2xs: 0.5rem;
    --space-xs: 1rem;
    --space-s: 1.5rem;
    --space-m: 2.5rem;
    --space-l: 4rem;
    --space-xl: 7rem;
    --radius: 2px;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --paper: oklch(0.17 0.01 260);
      --ink: oklch(0.93 0.008 95);
      --ink-soft: oklch(0.70 0.012 260);
      --line: oklch(0.30 0.01 260);
      --accent: oklch(0.72 0.13 150);
      --accent-ink: oklch(0.16 0.03 150);
    }
  }
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }

  body {
    margin: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-body);
    font-size: 1.0625rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background: var(--accent);
    color: var(--accent-ink);
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  a {
    color: inherit;
  }
}

@layer components {
  .wrap {
    max-width: 72rem;
    margin-inline: auto;
    padding-inline: var(--space-s);
  }

  .section-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.1;
    margin: 0 0 var(--space-l);
  }

  .cta {
    display: inline-block;
    background: var(--ink);
    color: var(--paper);
    font-family: var(--font-mono);
    font-weight: 400;
    font-size: 1rem;
    padding: 0.9rem 1.75rem;
    border-radius: var(--radius);
    text-decoration: none;
    transition: background 0.2s ease;
  }

  .cta:hover {
    background: var(--accent);
    color: var(--accent-ink);
  }

  .cta:active {
    translate: 0 1px;
  }
}

/* Reveals: scroll-driven animations nativas.
   Keyframes fora dos layers. Uso protegido duas vezes:
   reduced-motion + @supports. Browsers sem suporte = conteúdo estático. */
@keyframes rise {
  from {
    opacity: 0;
    translate: 0 1.75rem;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: rise linear both;
      animation-timeline: view();
      animation-range: entry 5% cover 30%;
    }
  }
}
```

- [ ] **Step 5: Escrever `src/layouts/Layout.astro`**

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="color-scheme" content="light dark" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <slot />
</html>
```

- [ ] **Step 6: Escrever `src/pages/index.astro` (esqueleto)**

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout
  title="Rayson Rodrigues"
  description="Personal trainer virando dev. Construo bots, apps e sistemas."
>
  <main class="wrap">
    <p>Esqueleto no ar. Seções chegam nas próximas tasks.</p>
  </main>
</Layout>
```

- [ ] **Step 7: Verificar build**

Run: `npm run build`
Expected: sucesso; `dist/index.html` existe; CSS embutido no bundle.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold astro 5 + tokens editoriais"
```

---

### Task 2: Fontes self-hosted + favicon

**Files:**
- Create: `public/fonts/*.woff2`, `public/favicon.svg`
- Modify: `src/styles/global.css` (adicionar `@font-face` no topo), `src/layouts/Layout.astro` (preload da fonte do LCP)

- [ ] **Step 1: Baixar woff2 (subset latin) via google-webfonts-helper**

```bash
mkdir -p public/fonts && cd public/fonts
curl -sL "https://gwfh.mranftl.com/api/fonts/newsreader?download=zip&subsets=latin&variants=regular,500,italic&formats=woff2" -o newsreader.zip
curl -sL "https://gwfh.mranftl.com/api/fonts/archivo?download=zip&subsets=latin&variants=regular,500&formats=woff2" -o archivo.zip
curl -sL "https://gwfh.mranftl.com/api/fonts/ibm-plex-mono?download=zip&subsets=latin&variants=regular&formats=woff2" -o plex.zip
unzip -o newsreader.zip && unzip -o archivo.zip && unzip -o plex.zip
rm -f newsreader.zip archivo.zip plex.zip
ls *.woff2
```

Expected: woff2 de Newsreader (regular/500/italic), Archivo (regular/500), IBM Plex Mono (regular).
Fallback se a API falhar: baixar manualmente de fonts.google.com e converter, ou usar `npx fontsource` — o importante é terminar com os 6 arquivos woff2.
**Conferir os nomes reais dos arquivos** (o helper nomeia `newsreader-vXX-latin-regular.woff2` etc.) e usar esses nomes exatos nos `@font-face`.

- [ ] **Step 2: Declarar `@font-face` no topo de `src/styles/global.css` (antes de `@layer`)**

Usando os nomes reais do Step 1 (os abaixo são o padrão esperado do helper; ajustar se diferirem):

```css
@font-face {
  font-family: "Newsreader";
  src: url("/fonts/newsreader-v16-latin-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Newsreader";
  src: url("/fonts/newsreader-v16-latin-500.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Newsreader";
  src: url("/fonts/newsreader-v16-latin-italic.woff2") format("woff2");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: "Archivo";
  src: url("/fonts/archivo-v19-latin-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Archivo";
  src: url("/fonts/archivo-v19-latin-500.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Mono";
  src: url("/fonts/ibm-plex-mono-v19-latin-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 3: Escrever `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#f6f5ef"/>
  <text x="32" y="45" font-family="Georgia, serif" font-style="italic" font-size="38" text-anchor="middle" fill="#2e7d4f">R</text>
</svg>
```

- [ ] **Step 4: Preload da fonte do LCP no `Layout.astro`**

Adicionar dentro do `<head>`, após o favicon (nome do arquivo = o real do Step 1):

```astro
<link rel="preload" href="/fonts/newsreader-v16-latin-500.woff2" as="font" type="font/woff2" crossorigin />
```

O h1 usa Newsreader 500 — é o LCP, então o preload é dele.

- [ ] **Step 5: Build + verificar fontes no dist**

```bash
npm run build && ls dist/fonts/
```

Expected: os 6 woff2 em `dist/fonts/`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: fontes self-hosted newsreader/archivo/plex-mono + favicon"
```

---

### Task 3: Dados dos projetos + screenshots

**Files:**
- Create: `src/data/projects.ts`, `public/shots/*`

- [ ] **Step 1: Copiar screenshot real do DailyRoutine**

```bash
mkdir -p public/shots
cp ~/Documents/DailyRoutine/docs/shot_t6_dash.png public/shots/dailyroutine-dash.png
```

- [ ] **Step 2: Baixar 4 placeholders picsum (jpg de verdade, extensão correta)**

```bash
cd public/shots
curl -sL "https://picsum.photos/seed/cryptobotz-terminal/1200/750" -o cryptobotz.jpg
curl -sL "https://picsum.photos/seed/tameru-particles/1200/750" -o tameru.jpg
curl -sL "https://picsum.photos/seed/tomawatchi-evolution/1200/750" -o tomawatchi.jpg
curl -sL "https://picsum.photos/seed/leadforge-agents/1200/750" -o leadforge.jpg
```

- [ ] **Step 3: Escrever `src/data/projects.ts` (descrições saem dos READMEs reais)**

```ts
export interface Project {
  name: string;
  year: string;
  stack: string;
  description: string;
  shot: string;
  href: string;
}

// hrefs genéricos: o Rayson confirma as URLs reais na revisão de conteúdo
export const projects: Project[] = [
  {
    name: "cryptobotz",
    year: "2026",
    stack: "Python · ccxt · pandas · pytest",
    description:
      "Bot de trading algorítmico multi-exchange em paper trading, com circuit breakers, telemetria de risco e 122 testes.",
    shot: "/shots/cryptobotz.jpg",
    href: "https://github.com/rayson",
  },
  {
    name: "DailyRoutine",
    year: "2026",
    stack: "SwiftUI · HealthKit · WidgetKit",
    description:
      "App iOS de rotina, hábitos e tarefas com visual de terminal, dashboard de pontuação e relatórios semanais.",
    shot: "/shots/dailyroutine-dash.png",
    href: "https://github.com/rayson",
  },
  {
    name: "tameru",
    year: "2026",
    stack: "Swift · SwiftUI · watchOS · SwiftData",
    description:
      "App iOS e watchOS com engine de contexto própria, arquitetura hexagonal e canvas de partículas no relógio.",
    shot: "/shots/tameru.jpg",
    href: "https://github.com/rayson",
  },
  {
    name: "tomawatchi",
    year: "2026",
    stack: "Swift · SwiftUI · watchOS",
    description:
      "Tamagotchi para o Apple Watch, com árvore de evolução ramificada e criaturas desenhadas do zero.",
    shot: "/shots/tomawatchi.jpg",
    href: "https://github.com/rayson",
  },
  {
    name: "leadforge",
    year: "2026",
    stack: "Python · Streamlit · Groq · SQLAlchemy",
    description:
      "Sistema de prospecção B2B com agentes de IA modulares: fontes plugáveis, qualificação por LLM e exportação CSV.",
    shot: "/shots/leadforge.jpg",
    href: "https://github.com/rayson",
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: dados reais dos projetos + screenshots"
```

---

### Task 4: Hero editorial

**Files:**
- Create: `src/sections/Hero.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Escrever `src/sections/Hero.astro`**

```astro
---
---
<section class="hero" id="top">
  <h1>Rayson <em>Rodrigues</em></h1>
  <p class="hero-sub">
    Personal trainer virando dev. Construo bots, apps e sistemas.
  </p>
  <div class="hero-cta">
    <a class="cta" href="#trabalhos">Ver projetos</a>
  </div>
</section>

<style>
  .hero {
    min-height: 88dvh;
    display: grid;
    align-content: center;
    padding-block: var(--space-xl);
  }

  h1 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(3rem, 9vw, 7.5rem);
    line-height: 1.1;
    letter-spacing: -0.015em;
    margin: 0;
    text-wrap: balance;
  }

  h1 em {
    font-style: italic;
    font-weight: 400;
  }

  .hero-sub {
    font-size: clamp(1.1rem, 2.4vw, 1.5rem);
    color: var(--ink-soft);
    max-width: 34ch;
    margin: var(--space-s) 0 0;
    line-height: 1.4;
  }

  .hero-cta {
    margin-top: var(--space-l);
  }
</style>
```

Notas de design (intenção):
- Itálico na segunda palavra = ênfase de MESMA família (permitido). `line-height: 1.1` dá clearance pro descendente do "g" em itálico.
- Sem kicker/eyebrow/locale strip. 3 elementos de texto + 1 CTA (dentro do limite de 4).
- `.cta` vem do global.css (corpo em mono, hover verde).

- [ ] **Step 2: Montar no `index.astro`**

```astro
---
import Layout from "../layouts/Layout.astro";
import Hero from "../sections/Hero.astro";
---

<Layout
  title="Rayson Rodrigues"
  description="Personal trainer virando dev. Construo bots, apps e sistemas."
>
  <main class="wrap">
    <Hero />
  </main>
</Layout>
```

- [ ] **Step 3: Build + inspeção**

Run: `npm run build && npm run preview`
Expected: build limpo; hero cabe na viewport; headline serif com Newsreader; hover do CTA fica verde nos dois modos.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: hero editorial"
```

---

### Task 5: Trabalhos — índice editorial com hover screenshot

**Files:**
- Create: `src/sections/Work.astro`
- Modify: `src/pages/index.astro` (import + tag)

- [ ] **Step 1: Escrever `src/sections/Work.astro`**

```astro
---
import { projects } from "../data/projects";
---
<section class="work reveal" id="trabalhos">
  <h2 class="section-title">Trabalhos</h2>
  <ol class="index">
    {projects.map((p) => (
      <li>
        <a href={p.href} class="row">
          <span class="top">
            <span class="name">{p.name}</span>
            <span class="year">{p.year}</span>
          </span>
          <span class="stack">{p.stack}</span>
          <span class="desc">{p.description}</span>
          <img
            src={p.shot}
            alt={`Screenshot do projeto ${p.name}`}
            width="1200"
            height="750"
            loading="lazy"
          />
        </a>
      </li>
    ))}
  </ol>
</section>

<style>
  .work {
    padding-block: var(--space-xl);
  }

  .index {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    border-bottom: 1px solid var(--line);
  }

  li:first-child {
    border-top: 1px solid var(--line);
  }

  .row {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    padding-block: var(--space-m);
    text-decoration: none;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-s);
  }

  .name {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    font-weight: 500;
    line-height: 1.1;
    transition: color 0.2s ease;
  }

  .year {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--ink-soft);
    white-space: nowrap;
  }

  .stack {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--ink-soft);
  }

  .desc {
    color: var(--ink-soft);
    max-width: 60ch;
  }

  .row:hover .name,
  .row:focus-within .name {
    font-style: italic;
    color: var(--accent);
  }

  img {
    position: absolute;
    right: 0;
    top: 50%;
    translate: 0 -50%;
    width: 280px;
    height: auto;
    border: 1px solid var(--line);
    background: var(--paper);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }

  .row:hover img,
  .row:focus-within img {
    opacity: 1;
  }

  @media (hover: none) {
    img {
      display: none;
    }
  }
</style>
```

Notas de design (intenção):
- Layout de linha de índice: name + year na linha 1, stack na linha 2, desc na linha 3. Sem grid-areas exóticas.
- Screenshot flutua centrado na própria row no hover/focus (teclado também revela). `pointer-events: none` evita clique acidental; `background: var(--paper)` garante legibilidade sobre o texto por baixo.
- Touch (`hover: none`): sem screenshot flutuante, a descrição já conta a história.
- Única fileira de hairlines: `border-bottom` por linha + `border-top` só na primeira. Não é spec-table.

- [ ] **Step 2: Montar no `index.astro`**

Adicionar `import Work from "../sections/Work.astro";` e `<Work />` logo após `<Hero />`.

- [ ] **Step 3: Build + inspeção**

Run: `npm run build && npm run preview`
Expected: 5 linhas; hover no desktop mostra screenshot flutuante com fade; hover no name fica itálico verde; âncora `#trabalhos` do CTA do hero funciona.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: indice editorial de trabalhos com hover"
```

---

### Task 6: História

**Files:**
- Create: `src/sections/Story.astro`
- Modify: `src/pages/index.astro` (import + tag após `<Work />`)

- [ ] **Step 1: Escrever `src/sections/Story.astro`**

```astro
---
---
<section class="story reveal" id="historia">
  <h2 class="section-title">A história</h2>
  <div class="cols">
    <p>
      Sou personal trainer. Passei anos desenhando treino e rotina para dezenas
      de alunos, e a parte que eu mais gostava nunca foi a parte física: era
      montar sistemas de hábito, medir progresso e ajustar variáveis até a
      rotina engrenar.
    </p>
    <p>
      Agora estou em transição para TI. O primeiro bot de trading virou um
      sistema com testes, telemetria e circuit breakers. O app de rotina que eu
      desenhava no papel virou um app iOS com HealthKit e relatórios.
    </p>
    <p>
      Construo bots, apps e automações. A mentalidade é a mesma do treino:
      consistência, carga progressiva e teste antes de confiança.
    </p>
  </div>
</section>

<style>
  .story {
    padding-block: var(--space-xl);
  }

  .cols {
    max-width: var(--measure);
    display: grid;
    gap: var(--space-s);
  }

  @media (min-width: 769px) {
    .cols {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-l);
    }

    .cols p:first-child {
      margin-top: var(--space-l);
    }
  }
</style>
```

Notas: copy é esboço honesto da transição real; marcado para o Rayson revisar palavra por palavra na revisão de conteúdo. Assimetria editorial (offset da primeira coluna) proposital.

- [ ] **Step 2: Build + inspeção**

Run: `npm run build && npm run preview`
Expected: 2 colunas no desktop com offset, 1 coluna mobile.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: secao historia"
```

---

### Task 7: Stack

**Files:**
- Create: `src/sections/Stack.astro`
- Modify: `src/pages/index.astro` (import + tag após `<Story />`)

- [ ] **Step 1: Escrever `src/sections/Stack.astro`**

```astro
---
const groups = [
  { title: "linguagens", items: ["Python", "Swift"] },
  {
    title: "mobile",
    items: ["SwiftUI", "watchOS", "HealthKit", "WidgetKit", "XcodeGen"],
  },
  {
    title: "dados e bots",
    items: ["pandas", "ccxt", "Streamlit", "pytest", "SQLAlchemy", "SQLite"],
  },
];
---
<section class="stack reveal" id="ferramentas">
  <h2 class="section-title">Ferramentas</h2>
  <div class="groups">
    {groups.map((g) => (
      <div>
        <h3>{g.title}</h3>
        <ul>
          {g.items.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</section>

<style>
  .stack {
    padding-block: var(--space-xl);
  }

  .groups {
    display: grid;
    gap: var(--space-m);
  }

  @media (min-width: 769px) {
    .groups {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  h3 {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 400;
    color: var(--ink-soft);
    margin: 0 0 var(--space-s);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2xs) var(--space-s);
  }
</style>
```

Notas: h3 em mono lowercase (nome real do grupo, não eyebrow decorativo). Sem badges, sem pills. Itens = só o que existe de verdade nos repositórios.

- [ ] **Step 2: Build + inspeção**

Run: `npm run build && npm run preview`
Expected: 3 grupos em 3 colunas desktop, empilhados mobile.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: secao stack"
```

---

### Task 8: Contato

**Files:**
- Create: `src/sections/Contact.astro`
- Modify: `src/pages/index.astro` (import + tag após `<Stack />`)

- [ ] **Step 0: Confirmar com o Rayson** (antes de commitar): email real, URL do GitHub, URL do LinkedIn. Sem isso, o rodapé fica com placeholders de link.

- [ ] **Step 1: Escrever `src/sections/Contact.astro`**

```astro
---
// Confirmado com o Rayson no Step 0 (trocar os valores abaixo)
const email = "rayson@example.com";
const github = "https://github.com/rayson";
const linkedin = "https://www.linkedin.com/in/rayson";
---
<footer class="contact reveal" id="contato">
  <h2 class="section-title">Fale comigo</h2>
  <p class="hint">Aberto pra falar de projetos, colaborações e oportunidades em TI.</p>
  <a class="cta" href={`mailto:${email}`}>{email}</a>
  <ul class="links">
    <li>
      <a href={github} rel="me noopener" target="_blank">GitHub</a>
    </li>
    <li>
      <a href={linkedin} rel="me noopener" target="_blank">LinkedIn</a>
    </li>
  </ul>
</footer>

<style>
  .contact {
    border-top: 1px solid var(--line);
    padding-block: var(--space-xl) var(--space-l);
  }

  .hint {
    color: var(--ink-soft);
    margin: 0 0 var(--space-s);
  }

  .links {
    list-style: none;
    display: flex;
    gap: var(--space-s);
    margin: var(--space-m) 0 0;
    padding: 0;
    font-family: var(--font-mono);
    font-size: 0.875rem;
  }

  .links a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
```

Notas: um CTA de contato só (mailto). Os links GitHub/LinkedIn são navegação, não CTA duplicado.

- [ ] **Step 2: Build + inspeção**

Run: `npm run build && npm run preview`
Expected: rodapé com hairline superior, CTA mailto funcional, links externos com `rel="me noopener"`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: rodape de contato"
```

---

### Task 9: Polimento, reveals e verificação final

**Files:**
- Modify: o que a verificação mandar

- [ ] **Step 1: Conferir os reveals**

- `npm run preview`; rolar a página: seções Work/Story/Stack/Contact sobem com fade ao entrar na viewport
- DevTools emulação `prefers-reduced-motion: reduce`: nenhuma animação, conteúdo 100% estático
- Chrome sem suporte a SDA seria estático (gate `@supports` já cobre)

- [ ] **Step 2: Conferir dark mode**

- Emular `prefers-color-scheme: dark`: fundo escuro, tinta clara, verde mais claro, sem seção invertida no meio da página
- Contraste: hover do CTA verde com `--accent-ink` legível nos dois modos

- [ ] **Step 3: Conferir mobile**

- Viewport 375px: tudo empilha, sem overflow horizontal, `88dvh` do hero sem salto de address bar

- [ ] **Step 4: Lighthouse no build**

```bash
npm run build
npx lighthouse http://localhost:4321 --output=stdout --preset=full
# (com npm run preview rodando em outro terminal)
```

Expected: Performance/Acessibilidade/Boas práticas/SEO ≥ 99. Se Performance < 99: conferir preload da Newsreader, `font-display: swap`, tamanho dos shots (picsum 1200x750 já é ok).

- [ ] **Step 5: Corrigir o que a verificação apontar e commit final**

```bash
git add -A && git commit -m "feat: polimento final, reveals verificados, a11y"
```

---

## Pós-implementação (fora do plano, lembrar o Rayson)

- Deploy: Cloudflare Pages (recomendação do spec) — repo no GitHub + build command `npm run build`, output `dist`
- Substituir os 4 screenshots picsum pelos reais
- Revisar copy da história e confirmar links de contato
- Domínio: decidir (raysonrodrigues.dev etc.)

## Self-Review

1. **Spec coverage:** hero (T4), índice de 5 projetos reais com hover (T3+T5), história (T6), stack (T7), contato (T8), motion com reduced-motion (T1 gates, T9), fontes self-hosted (T2), zero-JS + Lighthouse (T9), a11y (T1 base + T9), dark mode (T1 tokens + T9). Sem lacunas contra o spec.
2. **Placeholder scan:** os "TODO-Rayson" que restam (email/links no T8, screenshots reais, copy da história) são itens de conteúdo que só o Rayson pode fornecer, sinalizados nos steps, não buracos técnicos. Código das tasks está completo.
3. **Type consistency:** `Project` (T3) consumido pelo Work (T5); tokens de T1 usados em T4-T8; classes globais `.wrap`/`.section-title`/`.cta`/`.reveal` consistentes; paths de shots batem entre T3 e T5.
4. **Testes:** site estático sem lógica testável; a verificação por task é build real + preview + inspeção visual + Lighthouse no fim. Justificado no plano.
