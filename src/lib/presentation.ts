import type {
  DeveloperRole,
  ExperienceLevel,
  HistoryStatus,
  SubmissionType,
  TicketDifficulty,
  TicketLanguage,
  TicketPriority,
} from "@/types";
import type { Locale } from "@/lib/i18n";

type Localized<T extends string> = Record<T, Record<Locale, string>>;

const STATUS: Localized<HistoryStatus> = {
  "ticket-generated": { en: "Ticket generated", it: "Ticket generato" },
  "solution-draft": { en: "Solution in progress", it: "Soluzione in corso" },
  reviewed: { en: "Reviewed", it: "Revisionato" },
};
const PRIORITY: Localized<TicketPriority> = {
  Low: { en: "Low", it: "Bassa" }, Medium: { en: "Medium", it: "Media" },
  High: { en: "High", it: "Alta" }, Critical: { en: "Critical", it: "Critica" },
};
const DIFFICULTY: Localized<TicketDifficulty> = {
  Beginner: { en: "Beginner", it: "Principiante" }, Easy: { en: "Easy", it: "Facile" },
  Intermediate: { en: "Intermediate", it: "Intermedia" }, Advanced: { en: "Advanced", it: "Avanzata" },
};
const SUBMISSION: Localized<SubmissionType> = {
  "Pseudocode / technical plan": { en: "Pseudocode / technical plan", it: "Pseudocodice / piano tecnico" },
  "Working code": { en: "Working code", it: "Codice funzionante" },
};
const ROLE: Localized<DeveloperRole> = {
  "Front-End": { en: "Front-End", it: "Front-End" }, "Back-End": { en: "Back-End", it: "Back-End" },
  "Full-Stack": { en: "Full-Stack", it: "Full-Stack" }, Mobile: { en: "Mobile", it: "Mobile" },
};
const EXPERIENCE: Localized<ExperienceLevel> = {
  "Just starting": { en: "Just starting", it: "Sto iniziando" },
  "Less than 6 months": { en: "Less than 6 months", it: "Meno di 6 mesi" },
  "6–12 months": { en: "6–12 months", it: "6–12 mesi" },
  "1–2 years": { en: "1–2 years", it: "1–2 anni" },
  "Junior with internship experience": { en: "Junior with internship experience", it: "Junior con esperienza di tirocinio" },
};
const LANGUAGE: Localized<TicketLanguage> = {
  English: { en: "English", it: "Inglese" }, Italian: { en: "Italian", it: "Italiano" },
  Spanish: { en: "Spanish", it: "Spagnolo" }, French: { en: "French", it: "Francese" },
};
const TIME: Record<string, Record<Locale, string>> = {
  "30 minutes": { en: "30 minutes", it: "30 minuti" }, "1 hour": { en: "1 hour", it: "1 ora" },
  "2 hours": { en: "2 hours", it: "2 ore" }, "Half a day": { en: "Half a day", it: "Mezza giornata" },
};

export const formatHistoryStatus = (value: HistoryStatus, locale: Locale) => STATUS[value][locale];
export const formatPriority = (value: TicketPriority, locale: Locale) => PRIORITY[value][locale];
export const formatDifficulty = (value: TicketDifficulty, locale: Locale) => DIFFICULTY[value][locale];
export const formatSubmissionType = (value: SubmissionType, locale: Locale) => SUBMISSION[value][locale];
export const formatRole = (value: DeveloperRole, locale: Locale) => ROLE[value][locale];
export const formatExperience = (value: ExperienceLevel, locale: Locale) => EXPERIENCE[value][locale];
export const formatTicketLanguage = (value: TicketLanguage, locale: Locale) => LANGUAGE[value][locale];
export function formatEstimatedTime(value: string, locale: Locale) {
  if (TIME[value]) return TIME[value][locale];
  return locale === "it" ? value.replace(/minutes?/gi, "minuti").replace(/hours?/gi, "ore") : value;
}
export function formatDateTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-US", { dateStyle: "medium" }).format(new Date(value));
}
export const ticketLanguageForLocale = (locale: Locale): TicketLanguage => locale === "it" ? "Italian" : "English";
export const syncTicketLanguage = (locale: Locale, current: TicketLanguage, manuallySelected: boolean): TicketLanguage => manuallySelected ? current : ticketLanguageForLocale(locale);
