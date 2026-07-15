import {
  historyEnvelopeSchema,
  historyEntrySchema,
  type HistoryEntry,
  type HistoryEnvelope,
  type ProfileInput,
  type WorkTicket,
} from "@/schemas";
import { STORAGE_KEY } from "@/lib/constants";

const CORRUPT_STORAGE_KEY = `${STORAGE_KEY}:last-corrupt`;
const EMPTY_HISTORY: HistoryEnvelope = { version: 1, entries: [] };

export interface HistoryLoadResult {
  entries: HistoryEntry[];
  recoveredFromCorruption: boolean;
  storageAvailable: boolean;
}

function browserStorage(storage?: Storage): Storage | null {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadHistory(storage?: Storage): HistoryLoadResult {
  const target = browserStorage(storage);
  if (!target) {
    return { entries: [], recoveredFromCorruption: false, storageAvailable: false };
  }

  let raw: string | null;
  try {
    raw = target.getItem(STORAGE_KEY);
  } catch {
    return { entries: [], recoveredFromCorruption: false, storageAvailable: false };
  }

  if (!raw) {
    return { entries: [], recoveredFromCorruption: false, storageAvailable: true };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    const validated = historyEnvelopeSchema.safeParse(parsed);
    if (validated.success) {
      return {
        entries: [...validated.data.entries].sort(
          (a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt),
        ),
        recoveredFromCorruption: false,
        storageAvailable: true,
      };
    }
  } catch {
    // The controlled recovery below handles invalid JSON.
  }

  try {
    target.setItem(CORRUPT_STORAGE_KEY, raw.slice(0, 50_000));
    target.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be full or disabled; returning a safe empty state is enough.
  }

  return { entries: [], recoveredFromCorruption: true, storageAvailable: true };
}

function writeEnvelope(envelope: HistoryEnvelope, storage?: Storage): boolean {
  const target = browserStorage(storage);
  if (!target) return false;
  const validated = historyEnvelopeSchema.safeParse(envelope);
  if (!validated.success) return false;

  try {
    target.setItem(STORAGE_KEY, JSON.stringify(validated.data));
    return true;
  } catch {
    return false;
  }
}

export function createHistoryEntry(
  profile: ProfileInput,
  ticket: WorkTicket,
  id = crypto.randomUUID(),
): HistoryEntry {
  const now = new Date().toISOString();
  return historyEntrySchema.parse({
    id,
    profile,
    ticket,
    status: "ticket-generated",
    savedAt: now,
  });
}

export function upsertHistoryEntry(entry: HistoryEntry, storage?: Storage): boolean {
  const validated = historyEntrySchema.safeParse(entry);
  if (!validated.success) return false;
  const current = loadHistory(storage).entries;
  const next = [
    validated.data,
    ...current.filter((item) => item.id !== validated.data.id),
  ].slice(0, 100);
  return writeEnvelope({ version: 1, entries: next }, storage);
}

export function getHistoryEntry(id: string, storage?: Storage): HistoryEntry | null {
  return loadHistory(storage).entries.find((entry) => entry.id === id) ?? null;
}

export function deleteHistoryEntry(id: string, storage?: Storage): boolean {
  const next = loadHistory(storage).entries.filter((entry) => entry.id !== id);
  return writeEnvelope({ version: 1, entries: next }, storage);
}

export function clearHistory(storage?: Storage): boolean {
  return writeEnvelope(EMPTY_HISTORY, storage);
}

export function serializeHistory(entries: HistoryEntry[]): string {
  return JSON.stringify(historyEnvelopeSchema.parse({ version: 1, entries }));
}

export function parseHistory(serialized: string): HistoryEnvelope | null {
  try {
    const parsed: unknown = JSON.parse(serialized);
    const validated = historyEnvelopeSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}
