import { z } from "zod";

const boundedText = (label: string, min: number, max: number) =>
  z.string().trim().min(min, label + " is required.").max(max, label + " is too long.");

export const developerRoleSchema = z.enum(["Front-End", "Back-End", "Full-Stack", "Mobile"]);
export const experienceLevelSchema = z.enum([
  "Just starting",
  "Less than 6 months",
  "6–12 months",
  "1–2 years",
  "Junior with internship experience",
]);

export const PREDEFINED_TECHNOLOGY_OPTIONS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "Java",
  "React Native", "Flutter", "SQL", "Angular", "Spring Boot", "REST APIs",
  "MySQL", "PostgreSQL", "Git / GitHub", "HTML / CSS",
] as const;

const predefinedTechnologySet = new Set<string>(
  PREDEFINED_TECHNOLOGY_OPTIONS.map((item) => item.toLowerCase()),
);

function dedupeTechnologies(values: string[]) {
  const seen = new Set<string>();
  return values.map((value) => value.trim()).filter((value) => {
    const key = value.toLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeCustomTechnologies(value: string) {
  return dedupeTechnologies(value.split(","));
}

export function mergeTechnologies(predefined: string[], customInput: string) {
  return dedupeTechnologies([...predefined, ...normalizeCustomTechnologies(customInput)]);
}

export function getEffectiveCustomTechnologies(predefined: string[], customInput: string) {
  const predefinedSet = new Set(predefined.map((technology) => technology.toLowerCase()));
  return normalizeCustomTechnologies(customInput).filter(
    (technology) => !predefinedSet.has(technology.toLowerCase()),
  );
}

export const customTechnologiesSchema = z.string()
  .max(150, "Other technologies must be 150 characters or fewer.")
  .superRefine((value, context) => {
    const entries = normalizeCustomTechnologies(value);
    if (entries.some((entry) => entry.length > 40)) {
      context.addIssue({ code: "custom", message: "Each custom technology must be 40 characters or fewer." });
    }
  })
  .transform((value) => normalizeCustomTechnologies(value).join(", "));

const selectedTechnologiesSchema = z.array(boundedText("Technology", 1, 40))
  .min(1, "Choose or add at least one technology.")
  .transform(dedupeTechnologies);

const predefinedTechnologiesSchema = z.array(z.enum(PREDEFINED_TECHNOLOGY_OPTIONS))
  .transform(dedupeTechnologies)
  .pipe(z.array(z.string()).max(5, "Choose no more than five predefined technologies."));

export const profileInputSchema = z.object({
  role: developerRoleSchema,
  experience: experienceLevelSchema,
  technologies: selectedTechnologiesSchema,
  predefinedTechnologies: predefinedTechnologiesSchema.optional(),
  customTechnologies: customTechnologiesSchema.optional(),
  availableTime: z.enum(["30 minutes", "1 hour", "2 hours", "Half a day"]),
  projectDescription: boundedText("Project description", 20, 800),
}).strict().superRefine((profile, context) => {
  const customEntries = normalizeCustomTechnologies(profile.customTechnologies ?? "");
  const customSet = new Set(customEntries.map((item) => item.toLowerCase()));
  const predefinedTechnologies = profile.predefinedTechnologies ??
    profile.technologies.filter((item) => predefinedTechnologySet.has(item.toLowerCase()) && !customSet.has(item.toLowerCase()));
  const effectiveCustomTechnologies = getEffectiveCustomTechnologies(predefinedTechnologies, profile.customTechnologies ?? "");
  const expectedTechnologies = dedupeTechnologies([...predefinedTechnologies, ...effectiveCustomTechnologies]);
  const technologySet = new Set(profile.technologies.map((item) => item.toLowerCase()));
  const expectedSet = new Set(expectedTechnologies.map((item) => item.toLowerCase()));

  if (predefinedTechnologies.length > 5) {
    context.addIssue({ code: "custom", path: ["technologies"], message: "Choose no more than five predefined technologies." });
  }
  if (effectiveCustomTechnologies.length > 5) {
    context.addIssue({ code: "custom", path: ["customTechnologies"], message: "Add no more than five custom technologies." });
  }
  if (profile.technologies.length > 10) {
    context.addIssue({ code: "custom", path: ["technologies"], message: "Choose no more than ten total technologies." });
  }
  const listsMatch = expectedSet.size === technologySet.size &&
    [...expectedSet].every((technology) => technologySet.has(technology));
  if (!listsMatch) {
    context.addIssue({ code: "custom", path: ["technologies"], message: "The technology list must match the predefined and custom selections." });
  }
});

const outputText = (max: number) => z.string().trim().min(1).max(max);
const outputList = (itemMax: number, maxItems = 8) =>
  z.array(outputText(itemMax)).min(1).max(maxItems);

export const ticketContentSchema = z.object({
  title: outputText(140),
  companyContext: outputText(700),
  problem: outputText(900),
  objective: outputText(500),
  requirements: outputList(320, 8),
  acceptanceCriteria: outputList(320, 8),
  estimatedTime: outputText(60),
  initialHint: outputText(500),
  commonMistakes: outputList(260, 6),
}).strict();

export const localizedTicketContentSchema = z.object({
  en: ticketContentSchema,
  it: ticketContentSchema,
}).strict();

export const generatedTicketSchema = z.object({
  ticketId: outputText(32),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  difficulty: z.enum(["Beginner", "Easy", "Intermediate", "Advanced"]),
  technologies: z.array(outputText(40)).min(1).max(10),
  likelyFiles: z.array(outputText(180)).min(1).max(10),
  content: localizedTicketContentSchema,
}).strict();

export const workTicketSchema = generatedTicketSchema.extend({
  createdAt: z.string().datetime(),
  isDemo: z.boolean().optional(),
});

export const SUBMISSION_TYPES = ["Pseudocode / technical plan", "Working code"] as const;
export const submissionTypeSchema = z.enum(SUBMISSION_TYPES);

export const ticketSubmissionSchema = z.object({
  submissionType: submissionTypeSchema.default("Pseudocode / technical plan"),
  approach: boundedText("Approach", 20, 2000),
  code: boundedText("Code or pseudocode", 10, 8000),
  difficulties: z.string().trim().max(1200),
  seniorQuestion: z.string().trim().max(1200),
}).strict();

export const reviewInputSchema = z.object({
  sessionId: z.string().uuid(),
  submissionRevision: z.number().int().min(0).max(10_000),
  ticket: generatedTicketSchema,
  submissionType: submissionTypeSchema,
  approach: ticketSubmissionSchema.shape.approach,
  code: ticketSubmissionSchema.shape.code,
  difficulties: ticketSubmissionSchema.shape.difficulties,
  seniorQuestion: ticketSubmissionSchema.shape.seniorQuestion,
}).strict();

export const reviewContentSchema = z.object({
  approachAssessment: outputText(1000),
  strengths: z.array(outputText(350)).max(8),
  problems: z.array(outputText(350)).max(8),
  possibleBugs: z.array(outputText(350)).max(8),
  securityConcerns: z.array(outputText(350)).max(8),
  readabilityAssessment: outputText(800),
  acceptanceCriteriaAssessment: z.array(outputText(400)).max(10),
  improvements: z.array(outputText(400)).max(8),
  educationalExplanation: outputText(1800),
  conciseIdealSolution: outputText(1400),
  recommendedNextTicket: outputText(500),
  skillsToStudy: z.array(outputText(100)).max(8),
}).strict();

export const localizedReviewContentSchema = z.object({
  en: reviewContentSchema,
  it: reviewContentSchema,
}).strict();

export const seniorReviewSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  content: localizedReviewContentSchema,
}).strict();

export const historyStatusSchema = z.enum(["ticket-generated", "solution-draft", "reviewed"]);

export const historyEntrySchema = z.object({
  id: z.string().uuid(),
  submissionRevision: z.number().int().min(0).max(10_000).default(0),
  profile: profileInputSchema,
  ticket: workTicketSchema,
  status: historyStatusSchema,
  submission: ticketSubmissionSchema.optional(),
  review: seniorReviewSchema.optional(),
  savedAt: z.string().datetime(),
}).strict();

export const historyEnvelopeSchema = z.object({
  version: z.literal(2),
  entries: z.array(historyEntrySchema).max(100),
}).strict();

export const apiErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string(), retryable: z.boolean() }),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type TicketContent = z.infer<typeof ticketContentSchema>;
export type GeneratedTicket = z.infer<typeof generatedTicketSchema>;
export type WorkTicket = z.infer<typeof workTicketSchema>;
export type SubmissionType = z.infer<typeof submissionTypeSchema>;
export type TicketSubmission = z.infer<typeof ticketSubmissionSchema>;
export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type ReviewContent = z.infer<typeof reviewContentSchema>;
export type SeniorReview = z.infer<typeof seniorReviewSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export type HistoryEnvelope = z.infer<typeof historyEnvelopeSchema>;
export type HistoryStatus = z.infer<typeof historyStatusSchema>;
export type ApiErrorPayload = z.infer<typeof apiErrorSchema>;