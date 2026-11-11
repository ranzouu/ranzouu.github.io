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
    name: "nutriscanai",
    year: "2026",
    stack: "Swift · SwiftUI · Vision (OCR)",
    description:
      "App iOS que lê rótulos de alimentos por OCR no próprio aparelho, soma calorias e macros da refeição e funciona 100% offline.",
    href: "https://github.com/ranzouu/nutriscanai",
  },
  {
    name: "tameru",
    year: "2026",
    stack: "Swift · SwiftUI · HealthKit · WatchConnectivity",
    description:
      "Companheiro digital para iPhone e Watch com motor de comportamento em pacote Swift puro (arquitetura hexagonal) e 49 testes, incluindo adversariais, stress e concorrência.",
    href: "https://github.com/ranzouu/tameru",
  },
  {
    name: "tomawatchi",
    year: "2026",
    stack: "Swift · SwiftUI · HealthKit · Multipeer",
    description:
      "Bichinho de pulso para watchOS: passos reais do HealthKit cuidam do pet, 93 espécies na árvore de evolução e batalha P2P por Bluetooth/Bonjour.",
    href: "https://github.com/ranzouu/tomawatchi",
  },
  {
    name: "leitorwatch",
    year: "2026",
    stack: "Swift · SwiftUI · TTS · iCloud",
    description:
      "Leitor para Apple Watch com RSVP (uma palavra por vez), leitura por voz e importação de livros do iCloud Drive. Revisado tela por tela: seis bugs encontrados e corrigidos.",
    href: "https://github.com/ranzouu/leitorwatch",
  },
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
