import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@/components/app-providers";
import { EditSubmissionDialog } from "@/components/solution-workspace";
import { LandingPage } from "@/components/landing-page";
import { SeniorReviewCard } from "@/components/senior-review-card";
import { TicketDetails } from "@/components/ticket-details";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";
import { DEMO_SOLUTIONS_BY_LOCALE } from "@/data/demo-solution";
import { localizedDocumentTitle } from "@/components/localized-document-title";

function localized(locale: "en" | "it", children: React.ReactNode) {
  return renderToStaticMarkup(<LanguageProvider initialLocale={locale}>{children}</LanguageProvider>);
}

describe("fully bilingual application content", () => {
  it("localizes the landing page in both languages", () => {
    const en = localized("en", <LandingPage />);
    const it = localized("it", <LandingPage />);
    expect(en).toContain("Your AI work simulator");
    expect(en).not.toContain("Il tuo simulatore di lavoro con AI");
    expect(it).toContain("Il tuo simulatore di lavoro con AI");
    expect(it).not.toContain("Your AI work simulator");
  });

  it("renders only the selected global locale", () => {
    const en = localized("en", <TicketDetails ticket={DEMO_TICKET} />);
    const it = localized("it", <TicketDetails ticket={DEMO_TICKET} />);
    expect(en).toContain(DEMO_TICKET.content.en.title);
    expect(en).not.toContain(DEMO_TICKET.content.it.title);
    expect(it).toContain(DEMO_TICKET.content.it.title);
    expect(it).not.toContain(DEMO_TICKET.content.en.title);
    expect(en).toContain(DEMO_TICKET.likelyFiles[0]);
    expect(it).toContain(DEMO_TICKET.likelyFiles[0]);
  });

  it("renders only the selected review language", () => {
    const en = localized("en", <SeniorReviewCard review={DEMO_REVIEW} />);
    const it = localized("it", <SeniorReviewCard review={DEMO_REVIEW} />);
    expect(en).toContain(DEMO_REVIEW.content.en.approachAssessment);
    expect(en).not.toContain(DEMO_REVIEW.content.it.approachAssessment);
    expect(it).toContain(DEMO_REVIEW.content.it.approachAssessment);
    expect(it).not.toContain(DEMO_REVIEW.content.en.approachAssessment);
  });

  it("localizes review empty states and the edit dialog", () => {
    const review = {
      ...DEMO_REVIEW,
      content: {
        en: { ...DEMO_REVIEW.content.en, strengths: [] },
        it: { ...DEMO_REVIEW.content.it, strengths: [] },
      },
    };
    const html = localized("it", <><SeniorReviewCard review={review} /><EditSubmissionDialog open onCancel={() => undefined} onConfirm={() => undefined} /></>);
    expect(html).toContain("Non sono stati individuati punti di forza specifici.");
    expect(html).toContain("Modificare questa consegna?");
    expect(html).toContain('role="dialog"');
  });

  it("preserves demo technical content across locales", () => {
    expect(DEMO_TICKET.ticketId).toBe("JF-2048");
    expect(DEMO_TICKET.content.it.title).toContain("stato vuoto");
    expect(DEMO_REVIEW.content.it.educationalExplanation).toContain("stato dati");
    expect(DEMO_SOLUTIONS_BY_LOCALE.it.code).toBe(DEMO_SOLUTIONS_BY_LOCALE.en.code);
  });

  it("provides localized titles for every route", () => {
    for (const page of ["home", "simulate", "history", "demo", "guide", "session", "notFound", "error"] as const) {
      expect(localizedDocumentTitle(page, "en")).not.toBe(localizedDocumentTitle(page, "it"));
      expect(localizedDocumentTitle(page, "it")).toContain("JuniorFlow AI");
    }
  });
});