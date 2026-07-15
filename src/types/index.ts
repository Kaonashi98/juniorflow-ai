export type DeveloperRole =
  | "Front-End"
  | "Back-End"
  | "Full-Stack"
  | "Mobile";

export type ExperienceLevel =
  | "Just starting"
  | "Less than 6 months"
  | "6–12 months"
  | "1–2 years";

export type TicketLanguage = "English" | "Italian" | "Spanish" | "French";
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketDifficulty = "Beginner" | "Easy" | "Intermediate" | "Advanced";

export interface DeveloperProfile {
  role: DeveloperRole;
  experience: ExperienceLevel;
  technologies: string[];
  availableTime: string;
  ticketLanguage: TicketLanguage;
  projectDescription: string;
}

export interface WorkTicket {
  id: string;
  title: string;
  companyContext: string;
  problem: string;
  objective: string;
  requirements: string[];
  acceptanceCriteria: string[];
  priority: TicketPriority;
  difficulty: TicketDifficulty;
  estimatedTime: string;
  technologies: string[];
  possibleFiles: string[];
  initialHint: string;
  commonMistakes: string[];
  createdAt: string;
  isDemo?: boolean;
}

export interface TicketSubmission {
  approach: string;
  code: string;
  difficulties: string;
  seniorQuestion: string;
}

export interface SeniorReview {
  score: number;
  doneWell: string[];
  problems: string[];
  possibleBugs: string[];
  securityIssues: string[];
  criteriaAssessment: string[];
  improvements: string[];
  educationalExplanation: string;
  idealSolution: string;
  skillsToStudy: string[];
}

export interface HistoryEntry {
  id: string;
  profile: DeveloperProfile;
  ticket: WorkTicket;
  submission?: TicketSubmission;
  review?: SeniorReview;
  savedAt: string;
}
