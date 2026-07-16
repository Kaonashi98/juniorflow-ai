import {
  historyEnvelopeSchema,
  historyEntrySchema,
  type HistoryEntry,
  type HistoryEnvelope,
  type ProfileInput,
  type WorkTicket,
} from "@/schemas";
import { STORAGE_KEY } from "@/lib/constants";

const CORRUPT_STORAGE_KEY = STORAGE_KEY + ":last-corrupt";
const LEGACY_STORAGE_KEY = STORAGE_KEY + ":legacy-v1";
const EMPTY_HISTORY: HistoryEnvelope = { version: 2, entries: [] };

export interface HistoryLoadResult {
  entries: HistoryEntry[];
  recoveredFromCorruption: boolean;
  obsoleteHistoryFound: boolean;
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

function emptyResult(storageAvailable: boolean): HistoryLoadResult {
  return {
    entries: [],
    recoveredFromCorruption: false,
    obsoleteHistoryFound: false,
    storageAvailable,
  };
}

export function loadHistory(storage?: Storage): HistoryLoadResult {
  const target = browserStorage(storage);
  if (!target) return emptyResult(false);

  let raw: string | null;
  try {
    raw = target.getItem(STORAGE_KEY);
  } catch {
    return emptyResult(false);
  }
  if (!raw) return emptyResult(true);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
    const validated = historyEnvelopeSchema.safeParse(parsed);
    if (validated.success) {
      return {
        entries: [...validated.data.entries].sort(
          (a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt),
        ),
        recoveredFromCorruption: false,
        obsoleteHistoryFound: false,
        storageAvailable: true,
      };
    }
  } catch {
    parsed = null;
  }

  const isLegacyV1 = typeof parsed === "object" && parsed !== null &&
    "version" in parsed && parsed.version === 1;
  try {
    target.setItem(isLegacyV1 ? LEGACY_STORAGE_KEY : CORRUPT_STORAGE_KEY, raw.slice(0, 50_000));
    target.removeItem(STORAGE_KEY);
  } catch {
    // A safe empty state remains available when storage cleanup fails.
  }

  return {
    entries: [],
    recoveredFromCorruption: !isLegacyV1,
    obsoleteHistoryFound: isLegacyV1,
    storageAvailable: true,
  };
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
  return historyEntrySchema.parse({
    id,
    profile,
    ticket,
    status: "ticket-generated",
    savedAt: new Date().toISOString(),
  });
}

export function upsertHistoryEntry(entry: HistoryEntry, storage?: Storage): boolean {
  const validated = historyEntrySchema.safeParse(entry);
  if (!validated.success) return false;
  const current = loadHistory(storage).entries;
  const next = [validated.data, ...current.filter((item) => item.id !== validated.data.id)].slice(0, 100);
  return writeEnvelope({ version: 2, entries: next }, storage);
}

export function getHistoryEntry(id: string, storage?: Storage) {
  return loadHistory(storage).entries.find((entry) => entry.id === id) ?? null;
}

export function deleteHistoryEntry(id: string, storage?: Storage) {
  const next = loadHistory(storage).entries.filter((entry) => entry.id !== id);
  return writeEnvelope({ version: 2, entries: next }, storage);
}

export function clearHistory(storage?: Storage) {
  return writeEnvelope(EMPTY_HISTORY, storage);
}

export function clearObsoleteHistory(storage?: Storage) {
  const target = browserStorage(storage);
  if (!target) return false;
  try {
    target.removeItem(LEGACY_STORAGE_KEY);
    target.removeItem(CORRUPT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function serializeHistory(entries: HistoryEntry[]) {
  return JSON.stringify(historyEnvelopeSchema.parse({ version: 2, entries }));
}

export function parseHistory(serialized: string): HistoryEnvelope | null {
  try {
    const validated = historyEnvelopeSchema.safeParse(JSON.parse(serialized) as unknown);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}