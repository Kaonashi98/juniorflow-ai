import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDifficulty,
  formatEstimatedTime,
  formatExperience,
  formatHistoryStatus,
  formatPriority,
  formatSubmissionType,
  formatTicketLanguage,
  syncTicketLanguage,
  ticketLanguageForLocale,
} from "@/lib/presentation";

describe("localized presentation values", () => {
  it("formats canonical session and ticket values without changing them", () => {
    expect(formatHistoryStatus("solution-draft", "it")).toBe("Soluzione in corso");
    expect(formatPriority("Critical", "it")).toBe("Critica");
    expect(formatDifficulty("Intermediate", "it")).toBe("Intermedia");
    expect(formatSubmissionType("Working code", "it")).toBe("Codice funzionante");
    expect(formatExperience("Junior with internship experience", "it")).toContain("tirocinio");
    expect(formatTicketLanguage("English", "it")).toBe("Inglese");
    expect(formatEstimatedTime("60–90 minutes", "it")).toBe("60–90 minuti");
  });

  it("uses locale-consistent dates", () => {
    const value = "2026-07-15T12:00:00.000Z";
    expect(formatDate(value, "it")).toContain("2026");
    expect(formatDate(value, "en")).toContain("2026");
  });

  it("follows interface language until ticket language is selected manually", () => {
    expect(ticketLanguageForLocale("it")).toBe("Italian");
    expect(syncTicketLanguage("it", "English", false)).toBe("Italian");
    expect(syncTicketLanguage("it", "French", true)).toBe("French");
  });
});
