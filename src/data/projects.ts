export interface Project {
  name: string;
  year: string;
  stack: string;
  description: string;
  href: string;
}

// Projetos finalizados e públicos no GitHub
export const projects: Project[] = [
  {
    name: "dashboard-vendas-financeiro",
    year: "2026",
    stack: "Python · Pandas · AWS",
    description:
      "Dashboard de vendas e indicadores financeiros com relatórios para AWS. Projeto final concluído e entregue.",
    href: "https://github.com/ranzouu/dashboard-vendas-financeiro",
  },
  {
    name: "pokemon-team-analyzer",
    year: "2026",
    stack: "Python · APIs · Data Viz",
    description:
      "Analisador de times Pokémon competitivos: fraquezas, coberturas de tipo e sugestões de troca via API.",
    href: "https://github.com/ranzouu/pokemon-team-analyzer",
  },
  {
    name: "pokevgc-cli",
    year: "2026",
    stack: "Python · CLI · Click",
    description:
      "Ferramenta de linha de comando para o cenário VGC: lookup de movesets, formatos e stats direto no terminal.",
    href: "https://github.com/ranzouu/pokevgc-cli",
  },
];
