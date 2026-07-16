import "server-only";

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { APP_COPY, type LocalizedPageTitle } from "@/lib/app-copy";
import {
  detectRequestLocale,
  LOCALE_COOKIE_KEY,
  type Locale,
} from "@/lib/i18n";

export async function requestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return detectRequestLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value);
}

export async function localizedPageMetadata(
  page: LocalizedPageTitle,
): Promise<Metadata> {
  const locale = await requestLocale();
  return {
    title: { absolute: APP_COPY[locale].common.titles[page] },
    description: APP_COPY[locale].common.descriptions[page],
  };
}
