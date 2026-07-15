"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Clock3,
  Code2,
  Languages,
  LoaderCircle,
  PanelsTopLeft,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { z } from "zod";
import { ClientApiError, postJson } from "@/lib/api-client";
import { createHistoryEntry, upsertHistoryEntry } from "@/lib/history-store";
import {
  EXPERIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
  ROLE_OPTIONS,
  TECHNOLOGY_OPTIONS,
  TIME_OPTIONS,
} from "@/lib/constants";
import {
  customTechnologiesSchema,
  generatedTicketSchema,
  getEffectiveCustomTechnologies,
  mergeTechnologies,
  profileInputSchema,
} from "@/schemas";
import type { DeveloperRole, TicketLanguage } from "@/types";
import { UI_COPY, localizedApiError } from "@/lib/ui-copy";
import { formatExperience, formatEstimatedTime, formatRole, formatTicketLanguage, syncTicketLanguage, ticketLanguageForLocale } from "@/lib/presentation";
import { useAccess, useLanguage } from "@/components/app-providers";

const ticketResponseSchema = z.object({ ticket: generatedTicketSchema });

export const GUIDED_PROFILE_EXAMPLE = {
  role: "Full-Stack" as DeveloperRole,
  experience: "Junior with internship experience",
  technologies: ["TypeScript", "React", "Node.js", "REST APIs", "PostgreSQL"],
  customTechnologies: "Docker",
  availableTime: "2 hours",
  language: "English",
  projectDescription: "A project-management dashboard for small remote teams. Users can create projects, invite teammates, and track tasks.",
};

export function ProfileForm() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const copy = UI_COPY[locale];
  const { unlocked, openUnlock } = useAccess();
  const [selectedRole, setSelectedRole] = useState<DeveloperRole>("Front-End");
  const [technologies, setTechnologies] = useState<string[]>(["React", "TypeScript"]);
  const [customTechnologies, setCustomTechnologies] = useState("");
  const [experience, setExperience] = useState("6–12 months");
  const [availableTime, setAvailableTime] = useState("2 hours");
  const [ticketLanguage, setTicketLanguage] = useState<TicketLanguage>(() => ticketLanguageForLocale(locale));
  const ticketLanguageManuallySelected = useRef(false);
  const [projectDescription, setProjectDescription] = useState(GUIDED_PROFILE_EXAMPLE.projectDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ClientApiError | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTicketLanguage((current) => syncTicketLanguage(locale, current, ticketLanguageManuallySelected.current));
      setProjectDescription((current) => current === GUIDED_PROFILE_EXAMPLE.projectDescription || current === UI_COPY.it.profile.guidedDescription ? copy.profile.guidedDescription : current);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [locale, copy.profile.guidedDescription]);
  const inFlight = useRef(false);
  const customValidation = customTechnologiesSchema.safeParse(customTechnologies);
  const effectiveCustomTechnologies = getEffectiveCustomTechnologies(
    technologies,
    customTechnologies,
  );
  const customError = !customValidation.success
    ? copy.profile.customInvalid
    : effectiveCustomTechnologies.length > 5
      ? copy.profile.customLimit
      : null;
  const combinedTechnologies = mergeTechnologies(
    technologies,
    customTechnologies,
  );

  function toggleTechnology(technology: string) {
    setTechnologies((current) =>
      current.includes(technology)
        ? current.filter((item) => item !== technology)
        : current.length < 5
          ? [...current, technology]
          : current,
    );
  }

  function applyGuidedExample() {
    setSelectedRole(GUIDED_PROFILE_EXAMPLE.role);
    setExperience(GUIDED_PROFILE_EXAMPLE.experience);
    setTechnologies(GUIDED_PROFILE_EXAMPLE.technologies);
    setCustomTechnologies(GUIDED_PROFILE_EXAMPLE.customTechnologies);
    setAvailableTime(GUIDED_PROFILE_EXAMPLE.availableTime);
    ticketLanguageManuallySelected.current = false;
    setTicketLanguage(ticketLanguageForLocale(locale));
    setProjectDescription(copy.profile.guidedDescription);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    if (!unlocked) {
      openUnlock();
      setError(new ClientApiError(t("profile.unlockRequired"), "ACCESS_REQUIRED", false));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const candidate = {
      role: selectedRole,
      experience: String(formData.get("experience") ?? ""),
      technologies: combinedTechnologies,
      predefinedTechnologies: technologies,
      customTechnologies,
      availableTime: String(formData.get("availableTime") ?? ""),
      language: String(formData.get("language") ?? ""),
      projectDescription: String(formData.get("projectDescription") ?? ""),
    };
    const parsed = profileInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(new ClientApiError(parsed.error.issues[0]?.message ?? "Check your profile.", "INVALID_INPUT", false));
      return;
    }

    inFlight.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await postJson("/api/tickets", parsed.data, ticketResponseSchema);
      const ticket = {
        ...result.ticket,
        createdAt: new Date().toISOString(),
      };
      const entry = createHistoryEntry(parsed.data, ticket);
      if (!upsertHistoryEntry(entry)) {
        throw new ClientApiError(
          "The ticket was created but browser storage is unavailable. Check your privacy settings and retry.",
          "STORAGE_UNAVAILABLE",
          false,
        );
      }
      router.push(`/session/${entry.id}`);
    } catch (caught) {
      setError(caught instanceof ClientApiError ? caught : new ClientApiError("Ticket generation failed. Please retry.", "UNKNOWN", true));
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }

  const fieldClass =
    "mt-2 min-h-12 w-full border border-[#cbd4cc] bg-white px-3.5 text-[#14261f] transition-colors placeholder:text-[#6a766f] hover:border-[#84958c] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40";

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
        <div className="lg:col-span-2 flex flex-col gap-2 border border-[#dbe5c6] bg-[#f5f8ef] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold">{t("profile.example")}</p><p className="mt-1 text-xs text-[#66736d]">{t("profile.exampleHelp")}</p></div>
          <button type="button" onClick={applyGuidedExample} className="min-h-10 shrink-0 border border-[#14261f] bg-white px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[#678616] focus-visible:ring-offset-2">{t("profile.example")}</button>
        </div>
        <div className="border border-[#d5ddd6] bg-white">
          <div className="border-b border-[#e1e6e1] p-6 sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center bg-[#eef8d6] text-[#5e7a17]"><UserRound aria-hidden="true" size={20} /></span>
              <div><p className="text-sm text-[#66736d]">{t("profile.step")}</p><h2 className="text-xl font-semibold">{t("profile.title")}</h2></div>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold">{t("profile.role")}</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map((role) => (
                  <label key={role} className={`relative cursor-pointer border p-4 transition-colors focus-within:ring-2 focus-within:ring-[#5e7a17] focus-within:ring-offset-2 ${selectedRole === role ? "border-[#14261f] bg-[#f4f7ed]" : "border-[#d8dfd9] hover:border-[#99a79f]"}`}>
                    <input className="sr-only" type="radio" name="role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} />
                    <span className="flex items-start justify-between gap-3">
                      <span><span className="block font-semibold">{formatRole(role, locale)}</span><span className="mt-1 block text-sm text-[#66736d]">{copy.profile.roleDescriptions[role]}</span></span>
                      {selectedRole === role && <span className="flex size-5 items-center justify-center bg-[#c8f169]"><Check aria-hidden="true" size={14} /></span>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="space-y-7 p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                <span className="flex items-center gap-2"><PanelsTopLeft aria-hidden="true" size={16} className="text-[#5e7a17]" />{t("profile.experience")}</span>
                <select name="experience" className={fieldClass} value={experience} onChange={(event) => setExperience(event.target.value)}>{EXPERIENCE_OPTIONS.map((option) => <option key={option} value={option}>{formatExperience(option, locale)}</option>)}</select><span className="mt-2 block font-normal leading-5 text-[#66736d]">{t("profile.experienceHelp")}</span>
              </label>
              <label className="block text-sm font-semibold">
                <span className="flex items-center gap-2"><Clock3 aria-hidden="true" size={16} className="text-[#5e7a17]" />{t("profile.time")}</span>
                <select name="availableTime" className={fieldClass} value={availableTime} onChange={(event) => setAvailableTime(event.target.value)}>{TIME_OPTIONS.map((option) => <option key={option} value={option}>{formatEstimatedTime(option, locale)}</option>)}</select><span className="mt-2 block font-normal leading-5 text-[#66736d]">{t("profile.timeHelp")}</span>
              </label>
            </div>

            <fieldset>
              <legend className="flex items-center gap-2 text-sm font-semibold"><Code2 aria-hidden="true" size={16} className="text-[#5e7a17]" />{t("profile.technologies")} <span className="font-normal text-[#66736d]">({t("profile.chooseFive")})</span></legend>
              <div className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">
                {TECHNOLOGY_OPTIONS.map((technology) => {
                  const selected = technologies.includes(technology);
                  return (
                    <button key={technology} type="button" aria-pressed={selected} onClick={() => toggleTechnology(technology)} className={`border px-3 py-2 text-sm font-medium transition-colors ${selected ? "border-[#14261f] bg-[#14261f] text-white" : "border-[#cfd7d0] bg-white hover:border-[#83928a]"}`}>
                      {technology}{selected && <Check aria-hidden="true" size={13} className="ml-1.5 inline" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-[#e1e6e1] pt-4">
                <label htmlFor="custom-technologies" className="block text-sm font-semibold">
                  {t("profile.other")} <span className="font-normal text-[#66736d]">({t("profile.optional")})</span>
                </label>
                <p id="custom-technologies-help" className="mt-1 text-sm leading-6 text-[#66736d]">
                  {copy.profile.customHelp}
                </p>
                <input
                  id="custom-technologies"
                  name="customTechnologies"
                  type="text"
                  value={customTechnologies}
                  onChange={(event) => setCustomTechnologies(event.target.value)}
                  maxLength={150}
                  aria-describedby="custom-technologies-help custom-technologies-count"
                  aria-invalid={Boolean(customError)}
                  className={`${fieldClass} mt-2`}
                  placeholder={copy.profile.customPlaceholder}
                />
                <div className="mt-1 flex items-start justify-between gap-4">
                  <div>
                    {customError && <p className="text-sm text-[#a34235]" role="alert">{customError}</p>}
                    {!customError && combinedTechnologies.length === 0 && <p className="text-sm text-[#a34235]" role="alert">{copy.profile.techRequired}</p>}
                  </div>
                  <span id="custom-technologies-count" className="shrink-0 text-xs text-[#66736d]">{customTechnologies.length}/150</span>
                </div>
              </div>
            </fieldset>

            <label className="block text-sm font-semibold">
              <span className="flex items-center gap-2"><Languages aria-hidden="true" size={16} className="text-[#5e7a17]" />{t("profile.ticketLanguage")}</span>
              <select name="language" className={fieldClass} value={ticketLanguage} onChange={(event) => { ticketLanguageManuallySelected.current = true; setTicketLanguage(event.target.value as TicketLanguage); }}>{LANGUAGE_OPTIONS.map((option) => <option key={option} value={option}>{formatTicketLanguage(option, locale)}</option>)}</select>
              <span className="mt-2 block font-normal leading-5 text-[#66736d]">{t("profile.interfaceVsTicket")}</span>
            </label>

            <label className="block text-sm font-semibold">
              {t("profile.project")}
              <span className="mt-1 block font-normal leading-6 text-[#66736d]">{t("profile.projectHelp")}</span>
              <textarea name="projectDescription" required minLength={20} maxLength={800} rows={5} className={`${fieldClass} py-3`} value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} />
              <span className="mt-1 block text-right text-xs font-normal text-[#66736d]">{copy.profile.chars}</span>
            </label>

            {error && (
              <div role="alert" className="border border-[#e5c8bc] bg-[#fff7f3] p-4 text-sm text-[#8f3f2d]">
                <p className="font-semibold">{copy.profile.unavailable}</p>
                <p className="mt-1 leading-6">{localizedApiError(error.code, locale)}</p>
                <div className="mt-3 flex flex-wrap gap-4">
                  {error.retryable && <button type="button" onClick={() => formRef.current?.requestSubmit()} className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4"><RotateCcw aria-hidden="true" size={15} />{copy.common.retry}</button>}
                  <Link href="/demo" className="font-semibold underline underline-offset-4">{copy.common.demo}</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="border border-[#d5ddd6] bg-[#eef1e9] p-5 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5e7a17]">{t("profile.setup")}</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-[#66736d]">{copy.common.role}</dt><dd className="mt-1 font-semibold">{formatRole(selectedRole, locale)}</dd></div>
            <div><dt className="text-[#66736d]">{copy.common.stack}</dt><dd className="mt-1 font-semibold">{combinedTechnologies.length ? combinedTechnologies.join(", ") : copy.common.notSelected}</dd></div>
            <div><dt className="text-[#66736d]">{copy.common.model}</dt><dd className="mt-1 font-semibold">GPT-5.6</dd></div>
          </dl>
          <div className="mt-6 border-t border-[#d5ddd6] pt-5">
            <p className="mb-4 text-xs leading-5 text-[#66736d]">{t("profile.limited")}</p>
            <button type="submit" disabled={isLoading || combinedTechnologies.length === 0 || Boolean(customError)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#14261f] px-4 font-semibold text-white transition-colors hover:bg-[#29483b] disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? <><LoaderCircle aria-hidden="true" size={18} className="animate-spin" />{copy.profile.creating}</> : <>{t("profile.generate")} <ArrowRight aria-hidden="true" size={18} /></>}
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}
