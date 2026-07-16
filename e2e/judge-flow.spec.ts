import { expect, test, type Page } from "@playwright/test";
import { DEMO_REVIEW } from "../src/data/demo-review";
import { DEMO_TICKET } from "../src/data/demo-ticket";

const { createdAt: _createdAt, isDemo: _isDemo, ...generatedTicket } = DEMO_TICKET;
void _createdAt;
void _isDemo;

async function mockExternalBoundaries(page: Page) {
  let ticketRequests = 0;
  let reviewRequests = 0;
  let unlocked = false;

  await page.route("**/api/access/status", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ unlocked }) });
  });
  await page.route("**/api/access/unlock", async (route) => {
    unlocked = true;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ unlocked: true }) });
  });
  await page.route("**/api/access/lock", async (route) => {
    unlocked = false;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ unlocked: false }) });
  });
  await page.route("**/api/tickets", async (route) => {
    ticketRequests += 1;
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    expect(payload).not.toHaveProperty("language");
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ticket: generatedTicket }) });
  });
  await page.route("**/api/reviews", async (route) => {
    reviewRequests += 1;
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    expect(payload).not.toHaveProperty("language");
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ review: DEMO_REVIEW }) });
  });

  return {
    counts: () => ({ ticketRequests, reviewRequests }),
  };
}

test("global locale persists across navigation and the static demo never calls AI routes", async ({ page }) => {
  const boundaries = await mockExternalBoundaries(page);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/Your first job/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your first job");

  const locale = page.getByLabel("Interface language", { exact: true });
  await locale.selectOption("it");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page).toHaveTitle(/Il tuo primo lavoro/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Il tuo primo lavoro");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "it");

  await page.goto("/how-it-works");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Come funziona JuniorFlow AI");

  await page.goto("/demo");
  await expect(page.getByText(DEMO_TICKET.content.it.title, { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole("button", { name: "Mostra review di esempio", exact: true }).click();
  await expect(page.getByText(DEMO_REVIEW.content.it.approachAssessment, { exact: true })).toBeVisible();

  await page.getByLabel("Lingua dell’interfaccia", { exact: true }).selectOption("en");
  await expect(page.getByText(DEMO_TICKET.content.en.title, { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText(DEMO_REVIEW.content.en.approachAssessment, { exact: true })).toBeVisible();
  expect(boundaries.counts()).toEqual({ ticketRequests: 0, reviewRequests: 0 });

  const icons = await page.locator('link[rel~="icon"]').count();
  expect(icons).toBeGreaterThan(0);
  expect(consoleErrors).toEqual([]);
});

test("mocked real flow generates once, reviews once, switches locale instantly, reopens and deletes history", async ({ page }) => {
  const boundaries = await mockExternalBoundaries(page);
  await page.goto("/simulate");

  await page.locator('textarea[name="projectDescription"]').fill(
    "A collaborative project dashboard for remote teams with tasks, members, and activity updates.",
  );
  await page.getByRole("button", { name: "Generate my ticket", exact: true }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Access code", { exact: true }).fill("controlled-test-code");
  await page.getByRole("button", { name: "Unlock AI features", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: "Generate my ticket", exact: true }).click();
  await expect(page).toHaveURL(/\/session\//);
  await expect(page.getByText(DEMO_TICKET.content.en.title, { exact: true })).toBeVisible();
  expect(boundaries.counts().ticketRequests).toBe(1);

  await page.locator('textarea[name="approach"]').fill(
    "I would inspect the current empty-state boundary, preserve existing loading behavior, and add focused component tests.",
  );
  await page.locator('textarea[name="code"]').fill(
    "function EmptyState() { return isEmpty ? <EmptyStateCard /> : <ProjectGrid />; }",
  );
  await page.getByRole("button", { name: "Request senior review", exact: true }).click();
  await expect(page.getByText(DEMO_REVIEW.content.en.approachAssessment, { exact: true })).toBeVisible();
  expect(boundaries.counts().reviewRequests).toBe(1);

  await page.getByLabel("Interface language", { exact: true }).selectOption("it");
  await expect(page.getByText(DEMO_TICKET.content.it.title, { exact: true })).toBeVisible();
  await expect(page.getByText(DEMO_REVIEW.content.it.approachAssessment, { exact: true })).toBeVisible();
  expect(boundaries.counts()).toEqual({ ticketRequests: 1, reviewRequests: 1 });

  await page.goto("/history");
  await expect(page.getByText(DEMO_TICKET.content.it.title, { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Apri", exact: true }).click();
  await expect(page).toHaveURL(/\/session\//);
  await expect(page.getByText(DEMO_REVIEW.content.it.approachAssessment, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Modifica consegna", exact: true }).click();
  const editDialog = page.getByRole("dialog");
  await expect(editDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(editDialog).toBeHidden();

  await page.goto("/history");
  await page.getByRole("button", { name: `Elimina ${DEMO_TICKET.content.it.title}`, exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Elimina", exact: true }).click();
  await expect(page.getByText("Nessun ticket salvato", { exact: true })).toBeVisible();
});

test("404 and mobile layouts remain localized and do not overflow horizontally", async ({ page }) => {
  await mockExternalBoundaries(page);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await page.getByLabel("Interface language", { exact: true }).selectOption("it");

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 900 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of ["/", "/how-it-works", "/simulate", "/demo", "/history"]) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
      await expect(page.locator("html")).toHaveAttribute("lang", "it");
    }
  }

  await page.goto("/missing-judge-route");
  await expect(page.getByText("404 · TICKET NON TROVATO", { exact: true })).toBeVisible();
  await expect(page).toHaveTitle("Pagina non trovata | JuniorFlow AI");
  const favicon = await page.locator('link[rel~="icon"][type="image/x-icon"]').getAttribute("href");
  expect(favicon).toBeTruthy();
});
