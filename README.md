# JuniorFlow AI

![JuniorFlow AI official brand](public/branding/juniorflow-ai-brand.png)

[Live application](https://juniorflow-ai.vercel.app/) · Education · OpenAI Build Week 2026 · [MIT licensed](LICENSE)

JuniorFlow AI is a first-job simulator for aspiring junior developers. It recreates the complete flow of a realistic junior assignment: understand a company ticket, explain a technical approach, submit code or pseudocode, receive a senior-style review, and turn feedback into a learning plan.

## Problem and inspiration

Many junior developers learn syntax without practicing the surrounding engineering work: product context, requirements, acceptance criteria, trade-offs, security, code review, and communication with a senior. JuniorFlow AI was inspired by the first weeks of a real software role, where progress comes from bounded tickets and thoughtful feedback rather than isolated exercises.

## Solution and audience

The application gives students, bootcamp graduates, self-taught developers, and early-career engineers a guided practice loop adapted to their role, experience, technologies, available time, and project context. It is not a code runner or generic exercise generator.

The public static demo lets judges experience a complete ticket, prefilled submission, and review without an access code, account, personal data, or OpenAI request. The protected simulation uses GPT-5.6 for live generation.

## Core features

- Professional, responsive English and Italian experience
- One global language selector for the entire application
- Browser-language detection with persisted preference
- Front-End, Back-End, Full-Stack, and Mobile profiles
- Internship-aware junior experience level
- Up to five predefined and five custom technologies, deduplicated case-insensitively
- Realistic GPT-5.6 tickets with context, requirements, acceptance criteria, likely files, hints, and common mistakes
- Pseudocode/technical-plan and working-code submission modes
- GPT-5.6 senior review with score, strengths, bugs, security, acceptance coverage, explanation, ideal solution, and study plan
- Duplicate-request protection and confirmed review-edit flow
- Versioned browser-local History with search, filters, reopening, and accessible deletion
- Fully bilingual static demo that never calls OpenAI
- Loading, sanitized error, empty, recovery, rate-limit, and 404 states
- Keyboard-operable tabs and dialogs, visible focus, reduced-motion support, and responsive layouts
- Official JuniorFlow AI favicon, Apple Touch Icon, and web-app manifest

## Global bilingual behavior

English and Italiano are the only supported global languages. The header selector is the single source of truth for controls, validation, errors, dates, statuses, metadata, tickets, reviews, History, and demo content.

Each live ticket is generated once as a structured object containing:

- shared technical metadata such as ticket ID, priority enum, difficulty enum, technologies, and file paths;
- semantically equivalent natural-language content in `content.en` and `content.it`.

Each review follows the same pattern:

- shared score and technical metadata;
- semantically equivalent content in `content.en` and `content.it`.

Changing language selects the already validated localized branch instantly. It does not call OpenAI again and never translates or changes user-written approach, code, pseudocode, difficulties, or senior question.

## Architecture

```text
Browser
  |-- global locale -------- cookie + localStorage preference
  |-- POST /api/access/unlock
  |       BotID + rate limit + same-origin + secure code comparison
  |       +--> signed HttpOnly cookie (maximum 8 hours)
  |-- GET  /api/access/status
  |-- POST /api/access/lock
  |-- POST /api/tickets
  |       access + BotID + size limit + Zod
  |       +--> GPT-5.6 Responses API --> bilingual Structured Output
  |-- POST /api/reviews
  |       access + BotID + size limit + Zod + duplicate reservation
  |       +--> GPT-5.6 Responses API --> bilingual Structured Output
  |-- /history ------------ versioned localStorage envelope
  +-- /demo --------------- static bilingual fixtures; no AI route
```

Next.js App Router renders the application. Route Handlers enforce the server boundary. The OpenAI client is imported only by `src/lib/openai.server.ts`; the browser never receives `OPENAI_API_KEY`.

There is no database, user account, identity authentication, analytics, or server-side storage of profiles and submissions.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 4
- OpenAI JavaScript SDK
- OpenAI Responses API
- GPT-5.6
- Structured Outputs and Zod
- Vercel BotID Basic
- Vitest
- Playwright
- browser `localStorage`
- npm
- Vercel

## Concrete use of GPT-5.6

Ticket generation and review are separate server-only workflows in `src/lib/openai.server.ts`. Both workflows:

- use the exact `gpt-5.6` model alias;
- call `responses.parse`;
- use medium reasoning effort;
- request Structured Outputs through `zodTextFormat`;
- validate parsed results again with strict bounded Zod schemas;
- return English and Italian in the same call;
- require semantic equivalence and unchanged technical identifiers;
- treat user input as untrusted data, never as instructions;
- use bounded output limits, `store: false`, a 45-second timeout, and no automatic retry.

The review evaluates submitted text but does not execute, compile, or test code, and its prompt forbids claiming otherwise.

## Concrete use of Codex

Codex supported implementation, refactoring, typed contract alignment, regression-test creation, security checks, release verification, and responsive browser testing. It helped identify mixed-language states, obsolete storage risks, accessibility gaps, metadata issues, and favicon configuration errors.

## Human decisions

Human product decisions include:

- choosing the Education category and first-job simulation problem;
- using a complete workplace flow instead of isolated exercises;
- supporting only English and Italian globally for this release;
- generating both languages together instead of translating on demand;
- keeping technical identifiers and user-authored content unchanged;
- separating plan and working-code evaluation;
- using browser-local History without accounts or a database;
- protecting live AI use with a temporary server-verified code;
- keeping the static demo completely public and AI-free;
- requiring confirmation before destructive edits or deletion.

## Local setup

Requirements:

- Node.js 20 or newer
- npm
- an OpenAI API key with access to GPT-5.6

Install dependencies:

```bash
npm install
```

Create the local environment file:

```powershell
Copy-Item .env.example .env.local
```

On macOS or Linux:

```bash
cp .env.example .env.local
```

Set server-only values:

```dotenv
OPENAI_API_KEY=your_openai_api_key_here
DEMO_ACCESS_CODE=your_temporary_demo_access_code
APP_SESSION_SECRET=replace_with_at_least_32_random_characters
```

Use a randomly generated `APP_SESSION_SECRET` of at least 32 characters. Never prefix a credential with `NEXT_PUBLIC_` and never commit `.env.local`.

Start development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts and tests

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
```

Vitest covers schemas, API routes, access sessions, rate limiting, duplicate prevention, bilingual fixtures, locale detection, storage migration, localized presentation, visible-copy guarding, metadata assets, and component behavior.

Playwright exercises the judge journey in a real Chromium browser: runtime locale switching and persistence, all public routes, static demo, protected unlock, controlled ticket and review responses, History, reopening, edit dialog, deletion, 404, favicon presence, and viewport widths of 1440, 1024, 768, 390, and 320 pixels.

Automated tests mock only the external AI boundary. They do not call OpenAI.

## API behavior

### `POST /api/tickets`

Accepts a strict bounded profile. Predefined technologies are limited to five, effective custom technologies to five, and the sanitized combined list to ten. It returns one validated bilingual ticket. There is no ticket-language field and no silent demo fallback.

### `POST /api/reviews`

Accepts a session ID, submission revision, bilingual ticket, delivery type, approach, code or pseudocode, difficulties, and senior question. It returns one validated bilingual review. Client state and a server-side revision reservation prevent accidental duplicates.

Both endpoints require a valid access session, same-origin request, and successful BotID check. They reject oversized or malformed requests, apply per-instance rate limits, set `Cache-Control: no-store`, and return sanitized errors without provider details or stack traces.

## History and migration

New History data uses `juniorflow-history` version 2:

```json
{
  "version": 2,
  "entries": []
}
```

Entries store bilingual ticket and review content plus shared metadata, profile, status, submission revision, optional user submission, and timestamps.

Version 1 records are monolingual and cannot be translated faithfully without another AI call. They are therefore isolated under a legacy backup key rather than copied into the wrong language. The UI explains this in the active language and lets the user remove the obsolete backup. Corrupt data is also isolated. Neither case crashes rendering or creates a hydration mismatch.

History is limited to the current browser and is not synchronized across devices. Clearing browser storage removes saved sessions.

## Security and privacy

- `OPENAI_API_KEY`, `DEMO_ACCESS_CODE`, and `APP_SESSION_SECRET` remain server-only.
- No `NEXT_PUBLIC_OPENAI_API_KEY` exists.
- Access-code comparison uses fixed-length HMAC digests and constant-time comparison.
- The signed access cookie is HttpOnly, same-origin scoped, expiring, and contains no access code.
- Protected mutations enforce same-origin checks, BotID, request-size limits, validation, and rate limiting.
- OpenAI calls use timeout, no retries, bounded output, and `store: false`.
- Provider errors and stack traces are mapped to safe public codes.
- Generated content is rendered as React text; no model HTML is passed to `dangerouslySetInnerHTML`.
- The static demo does not call AI routes.
- `.env.local` is ignored by Git; `.env.example` contains placeholders only.
- Real profile, ticket, and submission content is sent to OpenAI only when the user explicitly requests a live result.

Do not submit secrets, proprietary source code, personal data, or confidential company information.

## Deploying to Vercel

1. Import the Git repository into Vercel.
2. Keep the detected Next.js settings.
3. Configure `OPENAI_API_KEY`, `DEMO_ACCESS_CODE`, and `APP_SESSION_SECRET` as server environment variables.
4. Deploy the `main` branch.
5. Verify that the deployment commit matches `origin/main`.
6. Smoke-test both languages, the public demo, one protected live ticket and review, History, metadata, and icon routes.

For the temporary judged demo, a deployment-level WAF limit for `POST /api/access/unlock`, `POST /api/tickets`, and `POST /api/reviews` is recommended in addition to the application limiter.

## Demo mode

`/demo` is visibly labeled as a static sample. Its bilingual ticket, prefilled solution, and review are local fixtures. It requires no access code and never sends content to OpenAI.

## Limitations

- AI feedback can be incomplete or incorrect and does not replace a human mentor or production review.
- Submitted code is analyzed as text; it is not executed, compiled, or tested.
- History can be lost when browser storage is cleared and cannot be shared across devices.
- Rate limits and review reservations are in memory per server instance; stronger multi-instance enforcement requires a distributed store.
- Live generation requires GPT-5.6 access, API credit, and the temporary access code.
- English and Italian are the only supported global languages in this release.

## Future development

Potential post-release work includes distributed rate limiting and idempotency, privacy-preserving exports, educator-authored rubrics, progress analytics, and an isolated code-execution sandbox. These are intentionally outside this MVP.

## OpenAI Build Week 2026

JuniorFlow AI participates in the **Education** category of OpenAI Build Week 2026. This release prioritizes a complete, secure, explainable learning loop over feature breadth.

## License

Released under the [MIT License](LICENSE).

## Judge access

Public pages, the guide, the static demo, and browser-local History require no code. For live GPT-5.6 generation:

1. Choose **Unlock AI demo** / **Sblocca demo AI** in the header.
2. Enter the temporary code shared privately by the project owner.
3. Generate one ticket and request a senior review during the eight-hour session.
4. Use **Lock** / **Blocca** when finished.
