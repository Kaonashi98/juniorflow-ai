import { ENGLISH_MESSAGES, ITALIAN_MESSAGES, type Locale } from "@/lib/i18n";
import { LANDING_COPY } from "@/lib/landing-copy";
import { UI_COPY } from "@/lib/ui-copy";

export const APP_COPY = {
  en: { ...UI_COPY.en, landing: LANDING_COPY.en, messages: ENGLISH_MESSAGES },
  it: { ...UI_COPY.it, landing: LANDING_COPY.it, messages: ITALIAN_MESSAGES },
} as const satisfies Record<Locale, typeof UI_COPY.en & {
  landing: typeof LANDING_COPY.en;
  messages: Record<keyof typeof ENGLISH_MESSAGES, string>;
}>;

export type AppCopy = (typeof APP_COPY)[Locale];
export type LocalizedPageTitle = keyof typeof APP_COPY.en.common.titles;