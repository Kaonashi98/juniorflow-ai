import { z } from "zod";

const boundedText = (label: string, min: number, max: number) =>
  z.string().trim().min(min, `${label} is required.`).max(max, `${label} is too long.`);

export const developerRoleSchema = z.enum([
  "Front-End",
  "Back-End",
  "Full-Stack",
  "Mobile",
]);

export const experienceLevelSchema = z.enum([
  "Just starting",
  "Less than 6 months",
  "6–12 months",
  "1–2 years",
]);

export const ticketLanguageSchema = z.enum([
  "English",
  "Italian",
  "Spanish",
  "French",
]);

export const profileInputSchema = z
  .object({
    role: developerRoleSchema,
    experience: experienceLevelSchema,
    technologies: z.array(boundedText("Technology", 1, 40)).min(1).max(5),
    availableTime: z.enum(["30 minutes", "1 hour", "2 hours", "Half a day"]),
    language: ticketLanguageSchema,
    projectDescription: boundedText("Project description", 20, 800),
  })
  .strict();

const outputText = (max: number) => z.string().trim().min(1).max(max);
const outputList = (itemMax: number, maxItems = 8) =>
  z.array(outputText(itemMax)).min(1).max(maxItems);

export const generatedTicketSchema = z
  .object({
    ticketId: outputText(32),
    title: outputText(140),
    companyContext: outputText(700),
    problem: outputText(900),
    objective: outputText(500),
    requirements: outputList(320, 8),
    acceptanceCriteria: outputList(320, 8),
    priority: z.enum(["Low", "Medium", "High", "Critical"]),
    difficulty: z.enum(["Beginner", "Easy", "Intermediate", "Advanced"]),
    estimatedTime: outputText(60),
    technologies: z.array(outputText(40)).min(1).max(8),
    likelyFiles: z.array(outputText(180)).min(1).max(10),
    initialHint: outputText(500),
    commonMistakes: outputList(260, 6),
  })
  .strict();

export const workTicketSchema = generatedTicketSchema.extend({
  createdAt: z.string().datetime(),
  isDemo: z.boolean().optional(),
});

export const ticketSubmissionSchema = z
  .object({
    approach: boundedText("Approach", 20, 2000),
    code: boundedText("Code or pseudocode", 10, 8000),
    difficulties: z.string().trim().max(1200),
    seniorQuestion: z.string().trim().max(1200),
  })
  .strict();

export const reviewInputSchema = z
  .object({
    ticket: generatedTicketSchema,
    approach: ticketSubmissionSchema.shape.approach,
    code: ticketSubmissionSchema.shape.code,
    difficulties: ticketSubmissionSchema.shape.difficulties,
    seniorQuestion: ticketSubmissionSchema.shape.seniorQuestion,
  })
  .strict();

export const seniorReviewSchema = z
  .object({
    overallScore: z.number().int().min(0).max(100),
    approachAssessment: outputText(1000),
    strengths: outputList(350, 8),
    problems: z.array(outputText(350)).max(8),
    possibleBugs: z.array(outputText(350)).max(8),
    securityConcerns: z.array(outputText(350)).max(8),
    readabilityAssessment: outputText(800),
    acceptanceCriteriaAssessment: outputList(400, 10),
    improvements: outputList(400, 8),
    educationalExplanation: outputText(1800),
    conciseIdealSolution: outputText(1400),
    recommendedNextTicket: outputText(500),
    skillsToStudy: z.array(outputText(100)).min(1).max(8),
  })
  .strict();

export const historyStatusSchema = z.enum([
  "ticket-generated",
  "solution-draft",
  "reviewed",
]);

export const historyEntrySchema = z
  .object({
    id: z.string().uuid(),
    profile: profileInputSchema,
    ticket: workTicketSchema,
    status: historyStatusSchema,
    submission: ticketSubmissionSchema.optional(),
    review: seniorReviewSchema.optional(),
    savedAt: z.string().datetime(),
  })
  .strict();

export const historyEnvelopeSchema = z
  .object({
    version: z.literal(1),
    entries: z.array(historyEntrySchema).max(100),
  })
  .strict();

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean(),
  }),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type GeneratedTicket = z.infer<typeof generatedTicketSchema>;
export type WorkTicket = z.infer<typeof workTicketSchema>;
export type TicketSubmission = z.infer<typeof ticketSubmissionSchema>;
export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type SeniorReview = z.infer<typeof seniorReviewSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export type HistoryEnvelope = z.infer<typeof historyEnvelopeSchema>;
export type HistoryStatus = z.infer<typeof historyStatusSchema>;
export type ApiErrorPayload = z.infer<typeof apiErrorSchema>;
