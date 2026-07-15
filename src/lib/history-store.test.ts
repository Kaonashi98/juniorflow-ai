import { beforeEach, describe, expect, it } from "vitest";
import {
  clearHistory,
  createHistoryEntry,
  deleteHistoryEntry,
  loadHistory,
  parseHistory,
  serializeHistory,
  upsertHistoryEntry,
} from "@/lib/history-store";
import type { ProfileInput } from "@/schemas";
import { STORAGE_KEY } from "@/lib/constants";
import { DEMO_TICKET } from "@/data/demo-ticket";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const profile: ProfileInput = {
  role: "Front-End",
  experience: "6–12 months",
  technologies: ["React", "TypeScript"],
  availableTime: "2 hours",
  language: "English",
  projectDescription: "A project-management dashboard for distributed product teams.",
};

describe("versioned history storage", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it("persists, reloads, and serializes a valid entry", () => {
    const entry = createHistoryEntry(
      profile,
      { ...DEMO_TICKET, isDemo: undefined },
      "00000000-0000-4000-8000-000000000010",
    );
    expect(upsertHistoryEntry(entry, storage)).toBe(true);
    expect(loadHistory(storage).entries).toHaveLength(1);

    const serialized = serializeHistory([entry]);
    expect(parseHistory(serialized)?.version).toBe(1);
  });

  it("isolates corrupted data and recovers safely", () => {
    storage.setItem(STORAGE_KEY, "{not-json");
    const result = loadHistory(storage);
    expect(result.entries).toEqual([]);
    expect(result.recoveredFromCorruption).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("rejects unknown schema versions", () => {
    expect(parseHistory(JSON.stringify({ version: 2, entries: [] }))).toBeNull();
  });

  it("deletes one entry and clears all entries", () => {
    const entry = createHistoryEntry(
      profile,
      { ...DEMO_TICKET, isDemo: undefined },
      "00000000-0000-4000-8000-000000000011",
    );
    upsertHistoryEntry(entry, storage);
    expect(deleteHistoryEntry(entry.id, storage)).toBe(true);
    expect(loadHistory(storage).entries).toEqual([]);
    upsertHistoryEntry(entry, storage);
    expect(clearHistory(storage)).toBe(true);
    expect(loadHistory(storage).entries).toEqual([]);
  });
});
