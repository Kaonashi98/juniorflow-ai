import { describe, expect, it } from "vitest";
import { detectLocale, detectRequestLocale, ENGLISH_MESSAGES, ITALIAN_MESSAGES, message, normalizeLocale } from "@/lib/i18n";

describe("interface localization", () => {
  it("keeps English and Italian dictionaries aligned", () => {
    expect(Object.keys(ITALIAN_MESSAGES).sort()).toEqual(Object.keys(ENGLISH_MESSAGES).sort());
  });

  it("detects Italian browsers and falls back to English", () => {
    expect(detectLocale(["it-IT", "en-US"])).toBe("it");
    expect(detectLocale(["de-DE"])).toBe("en");
    expect(normalizeLocale("IT-it")).toBe("it");
  });

  it("prefers a persisted valid choice", () => {
    expect(detectLocale(["it-IT"], "en")).toBe("en");
    expect(detectLocale(["en-US"], "it")).toBe("it");
    expect(detectLocale(["it-IT"], "invalid")).toBe("it");
  });

  it("uses the locale cookie before Accept-Language for server rendering", () => {
    expect(detectRequestLocale("it", "en-US,en;q=0.9")).toBe("it");
    expect(detectRequestLocale(undefined, "it-IT,it;q=0.9")).toBe("it");
    expect(detectRequestLocale("invalid", "fr-FR")).toBe("en");
  });

  it("returns localized controls without translating technical values", () => {
    expect(message("en", "nav.start")).toBe("Start simulation");
    expect(message("it", "nav.start")).toBe("Avvia simulazione");
  });
});