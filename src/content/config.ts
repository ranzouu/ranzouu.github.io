import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

// Coleção de artigos: qualquer .md em src/content/artigos/ entra no site
// automaticamente. Frontmatter obrigatório: title, description, pubDate.
const artigos = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/artigos" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

// Coleção do blog: cotidiano e pensamentos, sem protocolo de artigo técnico.
// Frontmatter obrigatório: title, description, pubDate. Tags simples: cotidiano, estudo, pensamento.
const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { artigos, blog };
