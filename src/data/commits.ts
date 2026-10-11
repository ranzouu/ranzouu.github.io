// Gerado do GitHub API no build — atualiza a cada deploy
// regen: gh api repos/ranzouu/<repo>/commits (ver skill de deploy)
export interface Commit {
  repo: string;
  sha: string;
  msg: string;
  date: string;
}

export const recentCommits: Commit[] = [
  { repo: "ranzouu.github.io", sha: "b75f335", msg: "feat: refinamento de viewport do Hero, rootMargin nas revelacoes e cadencia de espacamento", date: "2026-10-10T14:07:52Z" },
  { repo: "ranzouu.github.io", sha: "b2935b2", msg: "feat: redesign sumi-e — papel washi, arte medieval translúcida, enso, hanko, tategaki e kanjis", date: "2026-10-10T13:56:46Z" },
  { repo: "ranzouu.github.io", sha: "8ef9b6c", msg: "feat: headline criptografico hover-reveal + bento reequilibrado (tiles 140px, conteudo no topo)", date: "2026-10-10T12:10:16Z" },
  { repo: "EFI-T480-ThinkPad", sha: "3cf5e24", msg: "Graphics: Fix glitches on T480 by removing LSPCON patches and adding igfxonln=1", date: "2026-06-04T19:32:39Z" },
  { repo: "EFI-T480-ThinkPad", sha: "0e5f7a3", msg: "fix(igpu): set framebuffer-unifiedmem to 2048MB for glitch mitigation", date: "2026-06-04T18:32:09Z" },
  { repo: "EFI-T480-ThinkPad", sha: "d09e1d1", msg: "fix: restore GPRW disabled state while keeping iGPU boot-args removed", date: "2026-06-04T18:15:49Z" },
  { repo: "dashboard-vendas-financeiro", sha: "eebcdd2", msg: "docs: adicionar relatório AWS para Abstergo Industries", date: "2026-05-25T19:30:03Z" },
  { repo: "dashboard-vendas-financeiro", sha: "6951898", msg: "feat: commit inicial do dashboard de vendas", date: "2026-05-25T18:47:09Z" },
];
