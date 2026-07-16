import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDifficulty,
  formatEstimatedTime,
  formatExperience,
  formatHistoryStatus,
  formatPriority,
  formatSubmissionType,
} from "@/lib/presentation";

describe("localized presentation values", () => {
  it("formats shared enum values without changing their stored representation", () => {
    expect(formatHistoryStatus("solution-draft", "it")).toBe("Soluzione in corso");
    expect(formatPriority("Critical", "it")).toBe("Critica");
    expect(formatDifficulty("Intermediate", "it")).toBe("Intermedia");
    expect(formatSubmissionType("Working code", "it")).toBe("Codice funzionante");
    expect(formatExperience("Junior with internship experience", "it")).toContain("tirocinio");
    expect(formatEstimatedTime("Half a day", "it")).toBe("Mezza giornata");
  });

  it("uses locale-consistent dates", () => {
    const value = "2026-07-15T12:00:00.000Z";
    expect(formatDate(value, "it")).toContain("2026");
    expect(formatDate(value, "en")).toContain("2026");
  });
});