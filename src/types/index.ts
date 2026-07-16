export type {
  ApiErrorPayload,
  GeneratedTicket,
  HistoryEntry,
  HistoryEnvelope,
  HistoryStatus,
  ProfileInput as DeveloperProfile,
  ReviewContent,
  ReviewInput,
  SeniorReview,
  SubmissionType,
  TicketContent,
  TicketSubmission,
  WorkTicket,
} from "@/schemas";

export type DeveloperRole = "Front-End" | "Back-End" | "Full-Stack" | "Mobile";
export type ExperienceLevel =
  | "Just starting"
  | "Less than 6 months"
  | "6–12 months"
  | "1–2 years"
  | "Junior with internship experience";
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketDifficulty = "Beginner" | "Easy" | "Intermediate" | "Advanced";