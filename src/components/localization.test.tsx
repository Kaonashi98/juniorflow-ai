import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@/components/app-providers";
import { EditSubmissionDialog } from "@/components/solution-workspace";
import { LandingPage } from "@/components/landing-page";
import { SeniorReviewCard } from "@/components/senior-review-card";
import { TicketDetails } from "@/components/ticket-details";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";

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
