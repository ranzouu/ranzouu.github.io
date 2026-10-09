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
