"use client";

import { createContext, FormEvent, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { detectLocale, LOCALE_STORAGE_KEY, message, type Locale, type MessageKey } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

const LanguageContext = createContext<LanguageContextValue>({ locale: "en", setLocale: () => undefined, t: (key) => message("en", key) });

export function LanguageProvider({ children, initialLocale = "en" }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      // Browser language remains available when storage is blocked.
    }
    const detected = detectLocale(
      navigator.languages?.length ? navigator.languages : [navigator.language],
      stored,
    );
    const timeout = window.setTimeout(() => setLocaleState(detected), 0);
    document.documentElement.lang = detected;
    return () => window.clearTimeout(timeout);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // The interface can still switch when storage is unavailable.
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: (key) => message(locale, key) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

type AccessContextValue = {
  unlocked: boolean;
  checking: boolean;
  unlockRevision: number;
  openUnlock: () => void;
  lock: () => Promise<void>;
  dismissUnlockSuccess: () => void;
};

const AccessContext = createContext<AccessContextValue>({
  unlocked: false,
  checking: true,
  unlockRevision: 0,
  openUnlock: () => undefined,
  lock: async () => undefined,
  dismissUnlockSuccess: () => undefined,
});

export function AccessProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [unlockRevision, setUnlockRevision] = useState(0);
  const [successVisible, setSuccessVisible] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const successTimer = useRef<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dismissUnlockSuccess = useCallback(() => {
    setSuccessVisible(false);
    if (successTimer.current !== null) {
      window.clearTimeout(successTimer.current);
      successTimer.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/access/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: unknown) => {
        if (active && typeof data === "object" && data !== null && "unlocked" in data) {
          setUnlocked(data.unlocked === true);
        }
      })
      .catch(() => undefined)
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    codeRef.current?.focus();
    return () => previousFocus.current?.focus();
  }, [open]);

  useEffect(() => () => {
    if (successTimer.current !== null) window.clearTimeout(successTimer.current);
  }, []);

  function closeDialog() {
    setOpen(false);
    setShowCode(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    if (!code) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/access/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        setError(response.status === 401 ? t("access.invalid") : t("access.error"));
        return;
      }
      setUnlocked(true);
      setUnlockRevision((current) => current + 1);
      setSuccessVisible(true);
      if (successTimer.current !== null) window.clearTimeout(successTimer.current);
      successTimer.current = window.setTimeout(() => {
        setSuccessVisible(false);
        successTimer.current = null;
      }, 4_000);
      closeDialog();
      event.currentTarget.reset();
    } catch {
      setError(t("access.error"));
    } finally {
      setSubmitting(false);
    }
  }

  async function lock() {
    dismissUnlockSuccess();
    try {
      await fetch("/api/access/lock", { method: "POST" });
    } finally {
      setUnlocked(false);
    }
  }

  function openUnlock() {
    dismissUnlockSuccess();
    setError("");
    setShowCode(false);
    setOpen(true);
  }

  return (
    <AccessContext.Provider value={{ unlocked, checking, unlockRevision, openUnlock, lock, dismissUnlockSuccess }}>
      {children}
      {successVisible && (
        <div role="status" aria-live="polite" className="fixed right-4 top-20 z-[65] max-w-sm border border-[#b8cf83] bg-[#f5fbe8] px-4 py-3 text-sm font-semibold text-[#476013] shadow-sm">
          {t("access.success")}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#14261f]/60 p-5">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unlock-title"
            aria-describedby="unlock-description"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeDialog();
              if (event.key !== "Tab") return;
              const items = dialogRef.current?.querySelectorAll<HTMLElement>("input,button:not([disabled])");
              const first = items?.[0];
              const last = items?.[items.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
              if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }}
            className="w-full max-w-md border border-[#14261f] bg-white p-6 shadow-[7px_7px_0_#c8f169]"
          >
            <h2 id="unlock-title" className="text-2xl font-semibold">{t("access.title")}</h2>
            <p id="unlock-description" className="mt-2 leading-7 text-[#64736d]">{t("access.description")}</p>
            <form onSubmit={submit} className="mt-5">
              <label htmlFor="demo-access-code" className="block text-sm font-semibold">{t("access.code")}</label>
              <div className="relative mt-2">
                <input id="demo-access-code" ref={codeRef} name="code" type={showCode ? "text" : "password"} autoComplete="one-time-code" required maxLength={128} className="min-h-12 w-full border border-[#cbd4cc] px-3.5 pr-12 focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40" />
                <button type="button" onClick={() => setShowCode((current) => !current)} aria-label={showCode ? t("access.hideCode") : t("access.showCode")} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#52615b] focus-visible:ring-2 focus-visible:ring-[#678616] focus-visible:ring-inset">
                  {showCode ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-[#9a4433]">{error}</p>}
              <p className="mt-3 text-xs leading-5 text-[#66736d]">{t("access.help")}</p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeDialog} aria-label={t("access.cancel")} className="min-h-11 border border-[#cbd4cc] px-4 font-semibold">{t("access.cancel")}</button>
                <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#14261f] px-4 font-semibold text-white disabled:opacity-60">
                  {submitting && <LoaderCircle aria-hidden="true" size={17} className="animate-spin" />}
                  {submitting ? t("access.unlocking") : t("access.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  return useContext(AccessContext);
}