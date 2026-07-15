import type { Locale } from "@/lib/i18n";

export type DemoSolution = {
  approach: string;
  code: string;
  difficulties: string;
  seniorQuestion: string;
};

const code = [
  "if (isLoading) return <DashboardSkeleton />;",
  "if (error) return <ProjectsError />;",
  "if (projects.length === 0) return <EmptyProjects />;",
  "",
  "return <ProjectGrid projects={projects} />;",
].join("\n");

export const DEMO_SOLUTIONS_BY_LOCALE: Record<Locale, DemoSolution> = {
  en: {
    approach: "I would first identify the component that owns the query states. Then I would add a focused EmptyProjects component and render it only after a successful request returns zero projects.",
    code,
    difficulties: "Distinguishing an empty successful response from loading and error states.",
    seniorQuestion: "Would you test this inside the dashboard component or test EmptyProjects separately?",
  },
  it: {
    approach: "Per prima cosa individuerei il componente che gestisce gli stati della richiesta. Poi aggiungerei un componente EmptyProjects specifico e lo mostrerei solo quando una richiesta completata con successo restituisce zero progetti.",
    code,
    difficulties: "Distinguere una risposta vuota completata con successo dagli stati di caricamento ed errore.",
    seniorQuestion: "Testeresti questo comportamento nel componente della dashboard oppure EmptyProjects separatamente?",
  },
};