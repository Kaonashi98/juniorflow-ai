import type { Locale } from "@/lib/i18n";

type LandingCopy = {
  logoAlt: string; badge: string; titleStart: string; titleAccent: string; titleEnd: string; intro: string;
  start: string; demo: string; benefits: string[]; how: string; gap: string;
  steps: { title: string; description: string }[];
  practice: string; around: string; skills: string[];
  ready: string; readyBody: string; create: string;
  sampleTitle: string; sampleBody: string; stack: string; estimated: string; senior: string; seniorReady: string; accessNote: string;
};

export const LANDING_COPY: Record<Locale, LandingCopy> = {
  en: {
    logoAlt: "Official JuniorFlow AI logo", badge: "Your AI work simulator", titleStart: "Your first job,", titleAccent: "before", titleEnd: "the first job.",
    intro: "Practice realistic developer tickets, think like a teammate, and get the kind of feedback a thoughtful senior would give you.",
    start: "Start your first ticket", demo: "View demo ticket", benefits: ["No account", "No setup", "Built for juniors"],
    how: "How it works", gap: "Close the gap between tutorials and teamwork.",
    steps: [
      { title: "Set your level", description: "Tell us your role, experience, stack, and the time you have today." },
      { title: "Work a real ticket", description: "Get a scoped task with context, constraints, and acceptance criteria." },
      { title: "Learn from review", description: "Submit your approach and get practical feedback from an AI senior." },
    ],
    practice: "Practice that feels useful", around: "Learn the work around the code.",
    skills: ["Read real acceptance criteria", "Explain your technical choices", "Spot bugs and security risks", "Build a study plan from feedback"],
    ready: "Ready to clock in?", readyBody: "Pick your stack and get a focused ticket sized for the time you have.", create: "Create my simulation",
    sampleTitle: "Add an empty state to the project dashboard", sampleBody: "New users see a blank dashboard. Create a helpful empty state that guides them to their first project.", stack: "Stack", estimated: "Estimated", senior: "Senior review", seniorReady: "Ready when you are", accessNote: "No account is required. Live GPT-5.6 requests use a temporary code provided to authorized testers.",
  },
  it: {
    logoAlt: "Logo ufficiale JuniorFlow AI", badge: "Il tuo simulatore di lavoro con AI", titleStart: "Il tuo primo lavoro,", titleAccent: "prima", titleEnd: "del primo lavoro.",
    intro: "Affronta ticket realistici, ragiona come un membro del team e ricevi il feedback che ti darebbe un senior attento.",
    start: "Inizia il primo ticket", demo: "Vedi il ticket demo", benefits: ["Nessun account", "Nessuna configurazione", "Pensato per junior"],
    how: "Come funziona", gap: "Colma la distanza tra tutorial e lavoro di squadra.",
    steps: [
      { title: "Imposta il tuo livello", description: "Indica ruolo, esperienza, stack e tempo disponibile oggi." },
      { title: "Lavora su un vero ticket", description: "Ricevi un’attività mirata con contesto, vincoli e criteri di accettazione." },
      { title: "Impara dalla review", description: "Invia il tuo approccio e ricevi feedback pratico da un senior AI." },
    ],
    practice: "Esercitazione davvero utile", around: "Impara anche il lavoro intorno al codice.",
    skills: ["Leggi criteri di accettazione realistici", "Spiega le tue scelte tecniche", "Individua bug e rischi di sicurezza", "Crea un piano di studio dal feedback"],
    ready: "Pronto a iniziare?", readyBody: "Scegli il tuo stack e ricevi un ticket adatto al tempo che hai.", create: "Crea la mia simulazione",
    sampleTitle: "Aggiungi uno stato vuoto alla dashboard dei progetti", sampleBody: "I nuovi utenti vedono una dashboard vuota. Crea uno stato utile che li guidi verso il primo progetto.", stack: "Stack", estimated: "Stima", senior: "Review del senior", seniorReady: "Pronta quando vuoi", accessNote: "Non serve un account. Le richieste GPT-5.6 reali usano un codice temporaneo fornito ai tester autorizzati.",
  },
};

