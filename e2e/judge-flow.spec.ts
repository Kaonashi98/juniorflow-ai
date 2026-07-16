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
    expect(route.request().headers()["idempotency-key"]).toMatch(/^[0-9a-f-]{36}$/i);
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    expect(payload).not.toHaveProperty("language");
    await new Promise((resolve) => setTimeout(resolve, 120));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ticket: generatedTicket }) });
  });
  await page.route("**/api/reviews", async (route) => {
    reviewRequests += 1;
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    expect(payload).not.toHaveProperty("language");
    await new Promise((resolve) => setTimeout(resolve, 120));
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
  await expect(page.getByText("nessuna richiesta OpenAI.", { exact: false })).toBeVisible();
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

  const generateButton = page.getByRole("button", { name: "Generate my ticket", exact: true });
  await expect(page.getByRole("button", { name: "React", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "TypeScript", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(generateButton).toBeDisabled();
  await expect(page.getByText("Choose or add at least one technology.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "TypeScript", exact: true }).click();
  await expect(page.getByRole("button", { name: "TypeScript", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.locator('textarea[name="projectDescription"]').fill(
    "A collaborative project dashboard for remote teams with tasks, members, and activity updates.",
  );
  await generateButton.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Access code", { exact: true }).fill("controlled-test-code");
  await page.getByRole("button", { name: "Unlock AI features", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await generateButton.click();
  await expect(page.getByRole("button", { name: "GPT-5.6 is creating the bilingual ticket…", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/session\//);
  await expect(page.getByText(DEMO_TICKET.content.en.title, { exact: true })).toBeVisible();
  expect(boundaries.counts().ticketRequests).toBe(1);

  await page.locator('textarea[name="approach"]').fill(
    "I would inspect the current empty-state boundary, preserve existing loading behavior, and add focused component tests.",
  );
  await page.locator('textarea[name="code"]').fill(
    "function EmptyState() { return isEmpty ? <EmptyStateCard /> : <ProjectGrid />; }",
  );
  const reviewButton = page.getByRole("button", { name: "Request senior review", exact: true });
  await reviewButton.click();
  await expect(page.getByRole("button", { name: "GPT-5.6 is creating the bilingual review…", exact: true })).toBeVisible();
  await expect(page.getByText(DEMO_REVIEW.content.en.approachAssessment, { exact: true })).toBeVisible();
  expect(boundaries.counts().reviewRequests).toBe(1);

  await page.getByLabel("Interface language", { exact: true }).selectOption("it");
  await expect(page.getByText(DEMO_TICKET.content.it.title, { exact: true })).toBeVisible();
  await expect(page.getByText(DEMO_REVIEW.content.it.approachAssessment, { exact: true })).toBeVisible();
  expect(boundaries.counts()).toEqual({ ticketRequests: 1, reviewRequests: 1 });

  await page.goto("/history");
  await expect(page.getByLabel("Cerca ticket", { exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Stato", exact: true })).toBeVisible();
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

test("provider failure preserves the profile and retry reuses the same idempotency key", async ({ page }) => {
  await mockExternalBoundaries(page);
  await page.unroute("**/api/tickets");
  const keys: string[] = [];
  let requests = 0;
  await page.route("**/api/tickets", async (route) => {
    requests += 1;
    keys.push(route.request().headers()["idempotency-key"] ?? "");
    await new Promise((resolve) => setTimeout(resolve, 80));
    if (requests === 1) {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "SERVICE_UNAVAILABLE", message: "sanitized", retryable: true } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ticket: generatedTicket }) });
  });

  await page.goto("/simulate");
  await page.getByRole("button", { name: "Angular", exact: true }).click();
  const description = page.locator('textarea[name="projectDescription"]');
  await description.fill("A remote-team project platform with assignments, members, and progress tracking.");
  const generate = page.getByRole("button", { name: "Generate my ticket", exact: true });
  await generate.click();
  await page.getByLabel("Access code", { exact: true }).fill("controlled-test-code");
  await page.getByRole("button", { name: "Unlock AI features", exact: true }).click();
  await generate.click();
  await expect(page.getByText("The AI service is temporarily unavailable. Please retry.", { exact: true })).toBeVisible();
  await expect(description).toHaveValue("A remote-team project platform with assignments, members, and progress tracking.");
  await expect(page.getByRole("button", { name: "Angular", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => localStorage.getItem("juniorflow-history"))).toBeNull();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page).toHaveURL(/\/session\//);
  expect(requests).toBe(2);
  expect(keys[0]).toBe(keys[1]);
});

test("browser contexts isolate the mocked HttpOnly access session and lock revokes it", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  const installAccessBoundary = async (page: Page) => {
    await page.route("**/api/access/status", async (route) => {
      const unlocked = (route.request().headers().cookie ?? "").includes("juniorflow_access=mock-session");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ unlocked }) });
    });
    await page.route("**/api/access/unlock", async (route) => route.fulfill({ status: 200, headers: { "set-cookie": "juniorflow_access=mock-session; Path=/; HttpOnly; SameSite=Lax" }, contentType: "application/json", body: JSON.stringify({ unlocked: true }) }));
    await page.route("**/api/access/lock", async (route) => route.fulfill({ status: 200, headers: { "set-cookie": "juniorflow_access=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" }, contentType: "application/json", body: JSON.stringify({ unlocked: false }) }));
  };
  await installAccessBoundary(pageA);
  await installAccessBoundary(pageB);
  await pageA.goto("/simulate");
  await pageB.goto("/simulate");
  await pageA.getByRole("button", { name: "Unlock AI demo", exact: true }).click();
  await pageA.getByLabel("Access code", { exact: true }).fill("controlled-test-code");
  await pageA.getByRole("button", { name: "Unlock AI features", exact: true }).click();
  await expect(pageA.getByRole("button", { name: "Lock AI demo", exact: true })).toBeVisible();
  await expect(pageB.getByRole("button", { name: "Unlock AI demo", exact: true })).toBeVisible();
  await pageA.getByRole("button", { name: "Lock AI demo", exact: true }).click();
  await expect(pageA.getByRole("button", { name: "Unlock AI demo", exact: true })).toBeVisible();
  await contextA.close();
  await contextB.close();
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
