import type {
  DeveloperRole,
  ExperienceLevel,
  TicketLanguage,
} from "@/types";

export const APP_NAME = "JuniorFlow AI";
export const ROLE_OPTIONS: DeveloperRole[] = ["Front-End", "Back-End", "Full-Stack", "Mobile"];
export const EXPERIENCE_OPTIONS: ExperienceLevel[] = [
  "Just starting",
  "Less than 6 months",
  "6–12 months",
  "1–2 years",
];
export const LANGUAGE_OPTIONS: TicketLanguage[] = ["English", "Italian", "Spanish", "French"];
export const TIME_OPTIONS = ["30 minutes", "1 hour", "2 hours", "Half a day"];
export const TECHNOLOGY_OPTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "React Native",
  "Flutter",
  "SQL",
];
export const STORAGE_KEY = "juniorflow-history";
