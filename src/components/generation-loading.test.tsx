import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GenerationLoading } from "@/components/generation-loading";

const copy = {
  preparing: "Preparing your request…",
  creating: "GPT-5.6 is creating your bilingual ticket…",
  ready: "Ticket ready.",
  steps: { preparing: "Request prepared", creating: "GPT-5.6 generation", ready: "Ready" },
  waiting: "Keep this page open.",
  elapsed: "Elapsed: {seconds}s",
};

describe("truthful generation progress", () => {
  it("renders only client-observable phases with elapsed time and an accessible live region", () => {
    const html = renderToStaticMarkup(<GenerationLoading phase="creating" copy={copy} />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain("Request prepared");
    expect(html).toContain("GPT-5.6 is creating your bilingual ticket");
    expect(html).toContain("Ready");
    expect(html).toContain("Elapsed: 0s");
    expect(html).not.toContain("Validating");
    expect(html).not.toContain("Saving");
  });

  it("marks the final ready state complete without an active spinner", () => {
    const html = renderToStaticMarkup(<GenerationLoading phase="ready" copy={copy} />);
    expect(html).toContain('aria-valuetext="Ticket ready."');
    expect(html).not.toContain("animate-spin");
  });
});
