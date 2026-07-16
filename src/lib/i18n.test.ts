import { describe, expect, it } from "vitest";
import { detectLocale, detectRequestLocale, ENGLISH_MESSAGES, ITALIAN_MESSAGES, message, normalizeLocale } from "@/lib/i18n";

describe("interface localization", () => {
  it("keeps English and Italian dictionaries aligned", () => {
    expect(Object.keys(ITALIAN_MESSAGES).sort()).toEqual(Object.keys(ENGLISH_MESSAGES).sort());
  });

  it("defaults new visitors to English without using browser languages", () => {
    expect(detectLocale(["it-IT", "en-US"])).toBe("en");
    expect(detectLocale(["de-DE"])).toBe("en");
    expect(normalizeLocale("IT-it")).toBe("it");
  });

  it("prefers a persisted valid choice", () => {
    expect(detectLocale(["it-IT"], "en")).toBe("en");
    expect(detectLocale(["en-US"], "it")).toBe("it");
    expect(detectLocale(["it-IT"], "invalid")).toBe("en");
  });

  it("uses a valid locale cookie and otherwise renders English", () => {
    expect(detectRequestLocale("it")).toBe("it");
    expect(detectRequestLocale("en")).toBe("en");
    expect(detectRequestLocale(undefined)).toBe("en");
    expect(detectRequestLocale("invalid")).toBe("en");
  });

  it("returns localized controls without translating technical values", () => {
    expect(message("en", "nav.start")).toBe("Start simulation");
    expect(message("it", "nav.start")).toBe("Avvia simulazione");
  });
});