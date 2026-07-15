import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@/components/app-providers";
import { EditSubmissionDialog } from "@/components/solution-workspace";
import { LandingPage } from "@/components/landing-page";
import { SeniorReviewCard } from "@/components/senior-review-card";
import { TicketDetails } from "@/components/ticket-details";
import { DEMO_REVIEW, DEMO_REVIEWS_BY_LOCALE } from "@/data/demo-review";
import { DEMO_TICKET, DEMO_TICKETS_BY_LOCALE } from "@/data/demo-ticket";
import { DEMO_SOLUTIONS_BY_LOCALE } from "@/data/demo-solution";
import { localizedDocumentTitle } from "@/components/localized-document-title";

function italian(children: React.ReactNode) {
  return renderToStaticMarkup(
    <LanguageProvider initialLocale="it">{children}</LanguageProvider>,
  );
}

describe("Italian static interface copy", () => {
  it("localizes landing copy and the official logo alt text", () => {
    const html = italian(<LandingPage />);
    expect(html).toContain("Logo ufficiale JuniorFlow AI");
    expect(html).toContain("Il tuo simulatore di lavoro con AI");
    expect(html).not.toContain("Your AI work simulator");
  });

  it("localizes ticket metadata without translating saved AI content", () => {
    const html = italian(<TicketDetails ticket={DEMO_TICKET} />);
    expect(html).toContain("Priorità");
    expect(html).toContain("Facile");
    expect(html).toContain("60–90 minuti");
    expect(html).toContain(DEMO_TICKET.title);
  });

  it("localizes every senior-review tab and empty-state message", () => {
    const html = italian(<SeniorReviewCard review={{ ...DEMO_REVIEW, strengths: [] }} />);
    expect(html).toContain("Panoramica");
    expect(html).toContain("Punti forti e priorità");
    expect(html).toContain("Revisione tecnica");
    expect(html).toContain("Piano di apprendimento");
    expect(html).toContain("Non sono stati individuati punti di forza specifici.");
  });

  it("localizes the accessible edit confirmation dialog", () => {
    const html = italian(<EditSubmissionDialog open onCancel={() => undefined} onConfirm={() => undefined} />);
    expect(html).toContain("Modificare questa consegna?");
    expect(html).toContain("Annulla");
    expect(html).toContain("Rimuovi la review e modifica");
    expect(html).toContain('role="dialog"');
  });
});

describe("localized static demo fixtures", () => {
  it("switches every natural-language demo layer while preserving technical identifiers", () => {
    expect(DEMO_TICKETS_BY_LOCALE.it.title).toContain("stato vuoto");
    expect(DEMO_REVIEWS_BY_LOCALE.it.educationalExplanation).toContain("stato dati");
    expect(DEMO_SOLUTIONS_BY_LOCALE.it.approach).toContain("componente");
    expect(DEMO_TICKETS_BY_LOCALE.it.ticketId).toBe(DEMO_TICKETS_BY_LOCALE.en.ticketId);
    expect(DEMO_TICKETS_BY_LOCALE.it.likelyFiles).toEqual(DEMO_TICKETS_BY_LOCALE.en.likelyFiles);
    expect(DEMO_SOLUTIONS_BY_LOCALE.it.code).toBe(DEMO_SOLUTIONS_BY_LOCALE.en.code);
  });

  it("provides localized titles for every route", () => {
    for (const page of ["home", "simulate", "history", "demo", "guide", "session"] as const) {
      expect(localizedDocumentTitle(page, "en")).not.toBe(localizedDocumentTitle(page, "it"));
      expect(localizedDocumentTitle(page, "it")).toContain("JuniorFlow AI");
    }
  });
});