import { describe, expect, it } from "vitest";
import { resolveSavedSession } from "@/components/session-view";
import { createHistoryEntry, upsertHistoryEntry } from "@/lib/history-store";
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

describe("saved session resolution after hydration", () => {
  it("returns an existing browser-local session", () => {
    const storage = new MemoryStorage();
    const entry = createHistoryEntry({
      role: "Front-End",
      experience: "Junior with internship experience",
      technologies: ["React", "TypeScript"],
      availableTime: "2 hours",
      language: "English",
      projectDescription: "A project dashboard used by a small distributed product team.",
    }, { ...DEMO_TICKET, isDemo: undefined }, "00000000-0000-4000-8000-000000000099");
    expect(upsertHistoryEntry(entry, storage)).toBe(true);
    expect(resolveSavedSession(entry.id, storage)?.id).toBe(entry.id);
  });

  it("returns null for a session absent from the current browser", () => {
    expect(resolveSavedSession("00000000-0000-4000-8000-000000000098", new MemoryStorage())).toBeNull();
  });
});