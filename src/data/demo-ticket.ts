import type { HistoryEntry, WorkTicket } from "@/types";

export const DEMO_TICKET: WorkTicket = {
  ticketId: "JF-2048",
  priority: "Medium",
  difficulty: "Easy",
  technologies: ["React", "TypeScript", "Tailwind CSS"],
  likelyFiles: [
    "src/app/dashboard/page.tsx",
    "src/components/projects/empty-state.tsx",
    "src/components/projects/project-grid.test.tsx",
  ],
  content: {
    en: {
      title: "Add an empty state to the project dashboard",
      companyContext: "Flowdesk is a small project-management SaaS used by distributed product teams. New users currently land on a blank dashboard before creating their first project.",
      problem: "The dashboard renders an empty white panel when the projects array has no items. Support reports that trial users assume the product is broken and leave before creating a project.",
      objective: "Create a clear, accessible empty state that explains the next step and helps first-time users create their first project.",
      requirements: [
        "Show the empty state only when the projects request succeeds with zero items.",
        "Include a heading, short description, and primary “Create project” action.",
        "Keep the existing project grid unchanged when one or more projects exist.",
        "Use the design system components already available in the codebase.",
      ],
      acceptanceCriteria: [
        "Given an empty projects array, the empty state is visible.",
        "Given at least one project, the existing project grid is visible instead.",
        "The primary action navigates to /projects/new.",
        "The state is keyboard accessible and works at 320px viewport width.",
      ],
      estimatedTime: "60–90 minutes",
      initialHint: "Start by locating where loading, error, and successful project states branch. The empty state belongs in the successful branch.",
      commonMistakes: [
        "Showing the empty state briefly while the request is still loading.",
        "Using array truthiness instead of checking its length.",
        "Adding a clickable div instead of a semantic link or button.",
      ],
    },
    it: {
      title: "Aggiungi uno stato vuoto alla dashboard dei progetti",
      companyContext: "Flowdesk è un piccolo SaaS di gestione progetti usato da team di prodotto distribuiti. Al primo accesso, i nuovi utenti vedono una dashboard vuota prima di creare il loro primo progetto.",
      problem: "Quando l’array dei progetti non contiene elementi, la dashboard mostra un pannello bianco. Il supporto segnala che gli utenti in prova pensano che il prodotto non funzioni e abbandonano prima di creare un progetto.",
      objective: "Crea uno stato vuoto chiaro e accessibile che spieghi il passaggio successivo e aiuti gli utenti a creare il primo progetto.",
      requirements: [
        "Mostra lo stato vuoto solo quando la richiesta dei progetti termina correttamente senza risultati.",
        "Includi un titolo, una breve descrizione e l’azione principale “Crea progetto”.",
        "Mantieni invariata la griglia esistente quando è presente almeno un progetto.",
        "Usa i componenti del design system già disponibili nel codice.",
      ],
      acceptanceCriteria: [
        "Dato un array di progetti vuoto, lo stato vuoto è visibile.",
        "Dato almeno un progetto, viene mostrata la griglia esistente.",
        "L’azione principale porta a /projects/new.",
        "Lo stato è accessibile da tastiera e funziona con una viewport larga 320 px.",
      ],
      estimatedTime: "60–90 minuti",
      initialHint: "Individua il punto in cui vengono distinti caricamento, errore e successo della richiesta. Lo stato vuoto appartiene al ramo di successo.",
      commonMistakes: [
        "Mostrare brevemente lo stato vuoto mentre la richiesta è ancora in corso.",
        "Controllare il valore dell’array invece della sua lunghezza.",
        "Usare un div cliccabile al posto di un link o pulsante semantico.",
      ],
    },
  },
  createdAt: "2026-07-15T08:30:00.000Z",
  isDemo: true,
};

export const DEMO_HISTORY: HistoryEntry[] = [{
  id: "00000000-0000-4000-8000-000000000001",
  submissionRevision: 0,
  profile: {
    role: "Front-End",
    experience: "6–12 months",
    technologies: ["React", "TypeScript"],
    availableTime: "2 hours",
    projectDescription: "A project-management dashboard for small teams.",
  },
  ticket: DEMO_TICKET,
  status: "ticket-generated",
  savedAt: "2026-07-15T08:30:00.000Z",
}];