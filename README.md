# JuniorFlow AI

![JuniorFlow AI official logo](public/branding/juniorflow-ai-brand.png)

[Live demo](https://juniorflow-ai.vercel.app) · Education · OpenAI Build Week 2026

JuniorFlow AI is a first-job simulator for aspiring junior developers, created for the Education category of OpenAI Build Week 2026.

It turns the gap between tutorials and real engineering work into a guided practice loop: configure a developer profile, receive a realistic company ticket, submit an approach or working code, and get an educational senior-developer review.

## Problem and inspiration

Junior developers often learn syntax without seeing the surrounding work: product context, acceptance criteria, trade-offs, code review, security feedback, and communication with a senior. JuniorFlow AI was inspired by the first weeks of a real software job, where learning happens through scoped tickets and thoughtful review.

## Solution

JuniorFlow AI simulates that workflow without requiring an employer, mentor, account, or existing repository. GPT-5.6 creates a bounded ticket matched to the learner's role, experience, stack, available time, language, and project context. A second GPT-5.6 workflow evaluates the submission against that ticket and returns structured educational feedback.

## Intended audience

- Students and bootcamp graduates preparing for their first developer role
- Self-taught developers who want practice beyond tutorials
- Junior developers rehearsing unfamiliar stacks or delivery formats
- Educators who need realistic examples of tickets and review criteria

## Features

- Official JuniorFlow AI branding and social preview metadata
- Responsive English/Italian interface with browser detection and a persisted preference
- Public five-step guide and guided profile example
- Responsive landing page and guided profile configurator
- Front-End, Back-End, Full-Stack, and Mobile paths, including internship experience
- Up to five predefined and five custom technologies, deduplicated case-insensitively
- GPT-5.6 tickets with business context, requirements, acceptance criteria, likely files, hints, and common mistakes
- Pseudocode/technical-plan and working-code submission modes
- Structured senior review with scoring, bugs, security, acceptance coverage, guidance, and study skills
- Duplicate-review protection and a confirmed edit-and-review-again workflow
- Versioned History in `localStorage` with search, filters, reopening, and deletion
- Separate static Demo mode that never calls OpenAI
- Temporary access-code gate backed by an eight-hour signed HttpOnly cookie
- Vercel BotID Basic protection for unlock, ticket, and review requests
- Loading, error, empty, recovery, and not-found states
- Responsive layouts, keyboard review tabs, and an accessible confirmation dialog

## Architecture

```text
Browser
  |-- POST /api/access/unlock -- BotID + rate limit + same-origin
  |                               +--> server verifies temporary code
  |                               +--> signed HttpOnly cookie (max 8 hours)
  |-- GET  /api/access/status --- signed-cookie verification
  |-- POST /api/access/lock ----- clears signed cookie
  |-- POST /api/tickets --------- access + BotID + validation --> OpenAI Responses API
  |-- POST /api/reviews --------- access + BotID + validation --> OpenAI Responses API
  |-- /history ------------------ versioned localStorage envelope
  +-- /demo --------------------- static sample data; no API request
```

Next.js App Router pages and layouts render the public application. Interactive client components manage forms and browser storage. Same-origin Route Handlers validate every request before calling the server-only OpenAI module. The browser never receives the API key or imports the OpenAI client.

No user accounts or database are used. Live AI access is protected by a temporary server-verified access code and a signed session cookie.

## Technology stack

- Next.js 16 App Router
- React 19
- TypeScript with strict mode
- Tailwind CSS 4
- OpenAI JavaScript SDK and Responses API
- GPT-5.6
- Structured Outputs with Zod
- Vercel BotID Basic
- Vitest
- `localStorage`
- npm
- Vercel-ready deployment

## How GPT-5.6 is used

Ticket generation and senior review are separate server-side workflows in `src/lib/openai.server.ts`. Both:

- use the exact `gpt-5.6` model alias;
- call `responses.parse`;
- use medium reasoning effort;
- request Structured Outputs through `zodTextFormat`;
- validate parsed output again with shared Zod schemas;
- set bounded output-token limits and `store: false`;
- use a 45-second SDK timeout and disable automatic retries.

The interface language localizes controls and metadata only; the separately selected ticket language controls the language of both generated ticket and review content. Existing AI content is never translated automatically.

The ticket prompt treats profile content as untrusted data and adapts scope to experience and available time. The review prompt distinguishes a technical plan from working code and uses delivery-specific evaluation criteria. GPT-5.6 does not execute or compile submitted code, and the review must not claim otherwise.

## How Codex was used

Codex served as the implementation and verification partner. It helped scaffold and evolve the application, align shared TypeScript and Zod contracts, implement the server-only OpenAI boundary, write regression tests, run the release checks, and inspect the local UI across desktop, tablet, and smartphone layouts. It also identified accessibility, responsive, documentation, and release-readiness issues.

Codex did not replace product judgment or final validation. Changes were reviewed against explicit requirements and manual testing.

## Human decisions

Human product decisions include:

- Education as the Build Week category
- A first-job simulation instead of a generic code generator
- GPT-5.6 with medium reasoning as the quality/latency balance
- Separate ticket and review interactions
- Different evaluation expectations for plans and working code
- No user accounts, database, code execution, or hidden demo fallback; live AI access uses a temporary server-verified code and signed session cookie
- Browser-local History for a privacy-conscious MVP
- Confirmation before removing a completed review
- A clearly isolated static Demo mode

## Local installation

Requirements:

- Node.js 20 or newer
- npm
- An OpenAI API key with access to `gpt-5.6`

Install dependencies:

```bash
npm install
```

Create the local environment file on Windows:

```powershell
Copy-Item .env.example .env.local
```

On macOS or Linux:

```bash
cp .env.example .env.local
```

Set all server-only credentials:

```dotenv
OPENAI_API_KEY=your_openai_api_key_here
DEMO_ACCESS_CODE=your_temporary_demo_access_code
APP_SESSION_SECRET=replace_with_at_least_32_random_characters
```

Use a randomly generated secret of at least 32 characters for APP_SESSION_SECRET. Share the temporary judge code separately and never commit it. Never prefix credentials with NEXT_PUBLIC_.

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project scripts

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run build
npm start
npm audit --omit=dev
```

Automated tests mock the OpenAI boundary and do not make provider API calls.

## API behavior

### `POST /api/tickets`

Accepts a strict bounded profile. Predefined technologies are limited to five, effective custom technologies to five, and the sanitized combined list to ten. It returns a validated structured ticket. Failures never silently substitute demo content.

### `POST /api/reviews`

Accepts a session ID, submission revision, generated ticket, selected ticket language, delivery type, approach, code or pseudocode, difficulties, and senior question. It returns a validated structured review. Client state and a server-side revision reservation prevent accidental duplicates. Confirmed editing removes the old review, increments the revision, and preserves the ticket, profile, and submission text.

Both endpoints require a valid signed access session, same-origin request, and successful BotID Basic check before OpenAI can run. They reject oversized or malformed requests, apply per-instance rate limits, and return sanitized errors without provider details or stack traces.

## History and persistence

History uses the `juniorflow-history` key and a versioned envelope:

```json
{
  "version": 1,
  "entries": []
}
```

Entries contain the profile, ticket, status, submission revision, optional submission, optional review, and timestamp. Legacy entries without newer defaulted fields are migrated by the shared schema. Invalid or unknown data is isolated and replaced with a safe empty state.

History is local to the current browser, is not synchronized across devices, and saved session links cannot be reopened in another browser or device.

## Security and privacy

- OPENAI_API_KEY, DEMO_ACCESS_CODE, and APP_SESSION_SECRET are server-only and never use a NEXT_PUBLIC_ prefix.
- Access-code comparison uses fixed-length HMAC digests and constant-time comparison.
- The browser receives only an HMAC-signed, expiring HttpOnly cookie; the access code is never stored in cookies or localStorage.
- State-changing requests verify same origin, and protected AI routes use Vercel BotID Basic.
- `.env.local` is ignored by Git; only `.env.example` is tracked.
- No `NEXT_PUBLIC_OPENAI_API_KEY` variable is used.
- Requests and model responses are strictly validated and length-limited.
- Request bodies larger than 20 KB are rejected.
- OpenAI calls use timeouts, no retries, bounded output, and `store: false`.
- Provider errors and stack traces are mapped to safe public responses.
- API responses are marked `no-store`.
- Generated content is rendered as React text, never raw HTML.
- The application has no database, authentication, analytics, or server-side profile storage.
- Real profile, ticket, and submission content is sent to OpenAI for the requested result.
- Demo mode uses static local data and never sends content to OpenAI.

Do not submit secrets, proprietary source code, personal data, or confidential company information.

## Testing

The suite covers profile and technology rules; ticket, submission, review, API, and History schemas; invalid Structured Outputs; safe errors; History migration and recovery; delivery-aware reviews; completed-review locking; duplicate prevention; and review tabs.

Run the release check:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npm audit --omit=dev
```

No real OpenAI request is made by these commands.

## Deploying to Vercel

1. Push the repository to a Git provider.
2. Import it into Vercel.
3. Keep the detected Next.js settings.
4. Add OPENAI_API_KEY, DEMO_ACCESS_CODE, and APP_SESSION_SECRET in Project Settings > Environment Variables.
5. Deploy.
6. Smoke-test one real ticket and review.
7. Verify Demo mode and History independently.

Never expose the key through `NEXT_PUBLIC_` or paste it into build logs.

## Demo mode

`/demo` is visibly labeled **Sample ticket / Demo mode**. Its ticket and review are static fixtures, make no OpenAI request, and are never an automatic fallback.

## Limitations

- AI feedback can be incomplete or incorrect and is not a substitute for a human mentor or production review.
- Submitted code is reviewed as text; it is not compiled, executed, or tested.
- History exists only in the current browser and can be lost when storage is cleared.
- Rate limits and duplicate reservations are in memory and apply per server instance; multi-instance production needs a distributed store for stronger enforcement.
- There is no account, cross-device sync, collaboration, or recovery after local storage loss.
- Access to `gpt-5.6` and available API credit are required.

## Future development

Potential post-MVP work includes distributed rate limiting and idempotency, optional privacy-preserving exports, educator-authored rubrics, progress analytics, and an isolated code-execution sandbox. These are not part of this release candidate.

## OpenAI Build Week 2026

JuniorFlow AI participates in OpenAI Build Week 2026 in the **Education** category. This release candidate prioritizes a complete, secure, explainable GPT-5.6 learning loop over feature breadth.

## License

Released under the [MIT License](LICENSE).

## Judge access

Public pages, the bilingual guide, static demo, and browser-local History do not require a code. To evaluate live GPT-5.6 generation:

1. Open **Unlock AI demo** in the global header.
2. Enter the temporary code shared privately by the project owner.
3. Generate a ticket and request a senior review within the eight-hour session.
4. Use **Lock** in the header when finished.

The code is verified only on the server. A valid unlock creates a signed HttpOnly cookie; it is not saved to browser storage.

## Bot protection and recommended Vercel WAF rule

BotID runs at the Basic level on POST /api/access/unlock, POST /api/tickets, and POST /api/reviews. The existing application-level per-instance limiter remains in place.

As an additional deployment control, create a Vercel WAF rate-limit rule matching POST requests whose path matches ^/api/(access/unlock|tickets|reviews)$. A practical starting threshold for this temporary judged demo is 20 requests per IP in a 10-minute fixed window, initially observed in log mode before switching to a deny/429 action. Adjust it after reviewing legitimate traffic. WAF configuration is deployment-specific and is intentionally not stored in this repository.