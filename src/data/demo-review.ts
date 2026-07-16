import type { SeniorReview } from "@/types";

export const DEMO_REVIEW: SeniorReview = {
  overallScore: 84,
  content: {
    en: {
      approachAssessment: "Your component split and render strategy are sound, but the request-state ordering needs one correction.",
      strengths: [
        "You separated the empty state into a focused component.",
        "The conditional rendering preserves the existing project grid.",
        "Your call to action uses a semantic link with a clear label.",
      ],
      problems: [
        "The empty state is also rendered before the projects request has completed.",
        "The illustration has empty alt text but is not marked as decorative.",
      ],
      possibleBugs: ["A failed request with no cached projects may be mistaken for a valid empty result."],
      securityConcerns: ["No direct security issue found. Keep authorization checks on the server when creating a project."],
      readabilityAssessment: "The branching is concise and the extracted component makes the intent easy to scan.",
      acceptanceCriteriaAssessment: [
        "Empty array: met",
        "Existing grid preserved: met",
        "Navigation to /projects/new: met",
        "Loading-state separation: needs improvement",
      ],
      improvements: [
        "Branch on loading and error states before checking projects.length.",
        "Add tests for loading, failure, empty, and populated responses.",
      ],
      educationalExplanation: "An empty state is a successful data state, not the absence of data while it loads. Model each request state explicitly so users never receive a misleading message.",
      conciseIdealSolution: "Handle loading and error first, then render EmptyProjects when projects.length === 0; otherwise render ProjectGrid. Cover each branch with a focused component test.",
      recommendedNextTicket: "Add an error state with retry behavior to the same projects dashboard.",
      skillsToStudy: ["Async UI states", "React Testing Library", "Accessible empty states"],
    },
    it: {
      approachAssessment: "La suddivisione dei componenti e la strategia di rendering sono valide, ma l’ordine degli stati della richiesta richiede una correzione.",
      strengths: [
        "Hai separato lo stato vuoto in un componente specifico.",
        "Il rendering condizionale mantiene invariata la griglia dei progetti.",
        "La call to action usa un link semantico con un’etichetta chiara.",
      ],
      problems: [
        "Lo stato vuoto viene mostrato anche prima del completamento della richiesta dei progetti.",
        "L’illustrazione ha un testo alternativo vuoto ma non è indicata come decorativa.",
      ],
      possibleBugs: ["Una richiesta fallita senza progetti in cache potrebbe essere scambiata per un risultato vuoto valido."],
      securityConcerns: ["Non sono emersi problemi di sicurezza diretti. Mantieni lato server i controlli di autorizzazione durante la creazione di un progetto."],
      readabilityAssessment: "La ramificazione è concisa e il componente estratto rende immediatamente comprensibile l’intento.",
      acceptanceCriteriaAssessment: [
        "Array vuoto: soddisfatto",
        "Griglia esistente preservata: soddisfatto",
        "Navigazione a /projects/new: soddisfatto",
        "Separazione dello stato di caricamento: da migliorare",
      ],
      improvements: [
        "Gestisci caricamento ed errore prima di controllare projects.length.",
        "Aggiungi test per risposte in caricamento, fallite, vuote e con risultati.",
      ],
      educationalExplanation: "Uno stato vuoto è uno stato dati completato con successo, non l’assenza di dati durante il caricamento. Modella esplicitamente ogni stato della richiesta per non mostrare messaggi fuorvianti.",
      conciseIdealSolution: "Gestisci prima caricamento ed errore, poi mostra EmptyProjects quando projects.length === 0; altrimenti mostra ProjectGrid. Copri ogni ramo con un test mirato del componente.",
      recommendedNextTicket: "Aggiungi alla stessa dashboard uno stato di errore con possibilità di riprovare.",
      skillsToStudy: ["Stati asincroni dell’interfaccia", "React Testing Library", "Stati vuoti accessibili"],
    },
  },
};