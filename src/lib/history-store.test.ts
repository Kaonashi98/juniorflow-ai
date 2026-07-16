import { beforeEach, describe, expect, it } from "vitest";
import {
  clearHistory,
  clearObsoleteHistory,
  createHistoryEntry,
  deleteHistoryEntry,
  loadHistory,
  parseHistory,
  serializeHistory,
  upsertHistoryEntry,
} from "@/lib/history-store";
import { profileInputSchema, type ProfileInput } from "@/schemas";
import { STORAGE_KEY } from "@/lib/constants";
import { DEMO_TICKET } from "@/data/demo-ticket";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const profile: ProfileInput = {
  role: "Front-End",
  experience: "6–12 months",
  technologies: ["React", "TypeScript"],
  availableTime: "2 hours",
  projectDescription: "A project-management dashboard for distributed product teams.",
};

describe("versioned bilingual history storage", () => {
  let storage: MemoryStorage;
  beforeEach(() => { storage = new MemoryStorage(); });

  it("persists and serializes a version 2 bilingual entry", () => {
    const entry = createHistoryEntry(profile, { ...DEMO_TICKET, isDemo: undefined }, "00000000-0000-4000-8000-000000000010");
    expect(upsertHistoryEntry(entry, storage)).toBe(true);
    expect(loadHistory(storage).entries).toHaveLength(1);
    const parsed = parseHistory(serializeHistory([entry]));
    expect(parsed?.version).toBe(2);
    expect(parsed?.entries[0]?.ticket.content.en.title).toBeTruthy();
    expect(parsed?.entries[0]?.ticket.content.it.title).toBeTruthy();
  });

  it("persists the sanitized combined stack", () => {
    const newProfile = profileInputSchema.parse({
      ...profile,
      predefinedTechnologies: ["React", "TypeScript"],
      technologies: ["React", "TypeScript", "Docker"],
      customTechnologies: "Docker",
    });
    const entry = createHistoryEntry(newProfile, { ...DEMO_TICKET, isDemo: undefined }, "00000000-0000-4000-8000-000000000012");
    expect(parseHistory(serializeHistory([entry]))?.entries[0]?.profile.technologies).toEqual(["React", "TypeScript", "Docker"]);
  });

  it("keeps compatible version 2 entries created with the previous ten-technology limit", () => {
    const previousProfile = {
      ...profile,
      predefinedTechnologies: ["TypeScript", "Java", "SQL", "Angular", "Spring Boot"],
      customTechnologies: "REST APIs, MySQL",
      technologies: ["TypeScript", "Java", "SQL", "Angular", "Spring Boot", "REST APIs", "MySQL"],
    } as ProfileInput;
    const entry = createHistoryEntry(previousProfile, { ...DEMO_TICKET, isDemo: undefined }, "00000000-0000-4000-8000-000000000013");
    expect(parseHistory(serializeHistory([entry]))?.entries[0]?.profile.technologies).toHaveLength(7);
  });

  it("isolates version 1 history instead of fabricating translations", () => {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries: [{ old: "record" }] }));
    const result = loadHistory(storage);
    expect(result.entries).toEqual([]);
    expect(result.obsoleteHistoryFound).toBe(true);
    expect(result.recoveredFromCorruption).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(storage.getItem(STORAGE_KEY + ":legacy-v1")).toContain('"version":1');
    expect(clearObsoleteHistory(storage)).toBe(true);
    expect(storage.getItem(STORAGE_KEY + ":legacy-v1")).toBeNull();
  });

  it("isolates corrupted data and recovers safely", () => {
    storage.setItem(STORAGE_KEY, "{not-json");
    const result = loadHistory(storage);
    expect(result.entries).toEqual([]);
    expect(result.recoveredFromCorruption).toBe(true);
    expect(result.obsoleteHistoryFound).toBe(false);
  });

  it("rejects unknown schema versions", () => {
    expect(parseHistory(JSON.stringify({ version: 1, entries: [] }))).toBeNull();
    expect(parseHistory(JSON.stringify({ version: 3, entries: [] }))).toBeNull();
  });

  it("deletes one entry and clears all entries", () => {
    const entry = createHistoryEntry(profile, { ...DEMO_TICKET, isDemo: undefined }, "00000000-0000-4000-8000-000000000011");
    upsertHistoryEntry(entry, storage);
    expect(deleteHistoryEntry(entry.id, storage)).toBe(true);
    upsertHistoryEntry(entry, storage);
    expect(clearHistory(storage)).toBe(true);
    expect(loadHistory(storage).entries).toEqual([]);
  });
});