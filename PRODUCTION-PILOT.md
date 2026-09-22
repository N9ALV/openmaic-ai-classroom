# OpenMAIC Australian Investment Education Pilot

## Current release position

This build is an **experimental, controlled internal pilot**. It is not yet
approved for an unauthenticated public or multi-tenant production deployment.

The practical first release target is a trusted single-user or small internal
trial with server-managed model credentials, a strong access code, usage caps,
manual content review and regular exports/backups.

## What this pilot adds

- `/learn`: six complete reading lessons, eighteen local self-check questions,
  four arithmetic exercises and PDF/text workbook downloads, with no API key or
  live model call required. Every lesson is visibly an editorial draft.
- A learner-first home screen, individual lesson routes, local resume/completion,
  optional remembered answers, applied scenarios and a plain-language glossary.
- Local claim-by-claim reviewer records with Draft → Reviewed → Approved steps.
  Changed content and overdue reviews invalidate the effective approval. These
  are self-declared local records, not authenticated certifications or IU approval.
- Retrieved context, source routes and generation metadata travel with newly
  generated investment classrooms. Classroom ZIP and PowerPoint exports retain
  evidence/status; imported review notes require a fresh local check.
- Six preinstalled Australian investment-learning briefs on the home page.
- Prompts that require primary-source checks, dated claims, downside analysis,
  realistic costs, tax, liquidity and AUD/USD treatment.
- English as the first-run interface language (the inherited catalogue is en-US).
  Newly authored educational content and course briefs use Australian spelling.
- Seven-day expiry for shared access-code sessions.
- Baseline security headers.
- Node-only startup registration isolated from the Edge bundle.
- Source-retrieval gating for those AI briefs: research is enabled when a usable
  selected provider exists, and generation stops if source material is empty.
  A built-in keyless search route may be available; no API key does not by
  itself prove that research is unavailable. Retrieval is not editorial approval.
- Server-side investment outline/content guards validate a short-lived receipt
  binding the course brief to the retrieved context and source set. The local
  receipt lasts four hours and is invalidated by a server restart unless an
  operator has deliberately configured a stable `RESEARCH_RECEIPT_SECRET`.
  A future multi-instance deployment needs a shared operator-managed secret.
  No secret needs to be entered to read the library. Receipt validation establishes
  retrieval provenance, not the truth or completeness of a claim. Custom finance
  detection is a heuristic; the explicit investment course type is the primary cue.
- Quoted/international font-family preservation without admitting CSS URL loads.
- Persistent library-load failure guidance and a non-destructive Retry button.
- Same-origin browser mutation checks, canonical access-token signatures, and
  portable ZIP paths on Windows.

## Content principles

Generated material must remain general education rather than personal advice.
Every classroom should distinguish facts, assumptions and examples; identify
failure modes; state what would change the conclusion; and cite current source
material. AI output must be reviewed before publication.

Starter source routes include current public material from:

- ASIC Moneysmart, ATO, RBA and ASX;
- IU articles on diversification, drawdowns, position sizing, evidence quality,
  market structure and currency-aware retirement analysis.

Links are starting points, not proof. Currentness and source quality must be
checked at generation and again before publication.

## Required before any public launch

1. Add real user authentication and owner-scoped authorisation.
2. Add per-user rate limits, concurrency controls, quotas and provider budget
   alerts for every billable endpoint.
3. Replace the development persistence token with server-verified identity and
   tenant isolation.
4. Complete a defence-in-depth review of remaining HTML-rendering paths. The
   primary text, table and shape renderers now use an allow-list sanitiser with
   hostile-content regression tests; other specialised renderers still need a
   documented trust-boundary review before public multi-user deployment.
5. Add a complete Content Security Policy compatible with the Next.js runtime.
6. Move durable background work to persistent workers/queues, or deploy only
   on a persistent Node container and state that limitation clearly.
7. Complete accessibility testing and third-party licence/notice review.
8. Run the full production build, browser tests and database contract suite.

## Controlled pilot checklist

- [ ] Use a newly rotated model-provider key; never reuse a key posted in chat.
- [ ] Keep provider keys server-side and out of browser settings.
- [ ] Set one approved model in the provider model list.
- [ ] Configure a long, unique `ACCESS_CODE` for any shared deployment.
- [ ] Set provider spending limits and alerts outside OpenMAIC.
- [ ] Keep Pro workbench and server persistence disabled unless deliberately
      deployed with PostgreSQL on a persistent Node host.
- [ ] Generate with dated sources and review every slide before sharing.
- [ ] Export both PPTX and Classroom ZIP for approved examples.
- [ ] Test restoration from an export before relying on browser storage.
- [ ] Record model, generation date, reviewer and approval status.

## Suggested acceptance test

1. Start from a clean browser profile.
2. Confirm only the approved server-managed provider/model is visible.
3. Generate “ASX investing foundations” from the preinstalled starter.
4. Check that the output distinguishes education from advice; covers fees, tax,
   liquidity, downside and AUD/USD where relevant; dates changeable facts; and
   includes source links.
5. Complete the quiz and interactive activity.
6. Export PPTX, resource pack and Classroom ZIP.
7. Import the Classroom ZIP into a clean browser and compare the result.
8. Confirm unauthenticated API calls fail when access-code protection is on.

## Known operating constraints

- Browser storage is not a production backup.
- The free OpenRouter model can be rate-limited, unavailable or change without
  notice; it is useful for experiments but not a production service guarantee.
- Development from a OneDrive-synchronised folder can cause file locks and slow
  builds. A short non-synchronised path is preferred for release engineering.
- A PowerPoint export is shareable; a `localhost` classroom link is not.

## Simple local start

On Windows, double-click `Start OpenMAIC.cmd`. It detects an already-running
copy by app identity, binds to `127.0.0.1:3000` only and opens the browser after
the liveness check responds. It no longer launches through nested pnpm/cmd
processes or passes a stray `--` project argument. Startup is bounded to three
minutes and never terminates unrelated Node processes. Keep its single window
open while using the classroom.

The browser address remains `http://localhost:3000` so an existing learner keeps
the same browser-storage origin. Changing to an IP address, port, browser or
profile selects different browser data; it does not migrate existing courses.

## Production-bundle verification

```text
pnpm install --frozen-lockfile
pnpm build
node scripts/prepare-standalone.mjs
pnpm exec playwright install chromium --only-shell
pnpm exec playwright test --config=playwright.pilot.config.ts
```

The packaging step copies the static browser assets omitted by a bare standalone
build and refuses obvious local credential files. Do not copy `.env.local` or
server-provider YAML into the package. Supply secrets at runtime through the
deployment's secret-management facility. This check is not a complete secret scan.

`/api/health` is explicitly a **liveness/configuration** report. Its `llm` flag
means a server provider is configured, not that credit, connectivity, model
availability or a completed lesson has been verified.

Browser tests use a separate fresh profile and port 3003 with mocked generation
and research. They prove UI behaviour, not the reliability of a live free model.
The separate pilot-acceptance workflow is prepared locally; a workflow file is
not proof that GitHub has run it.

## Shared-host deployment boundaries

The 22 September work deliberately leaves shared accounts, user-storage
architecture and spending controls for further consideration. Built-in progress
and review records use separate local browser keys and can be exported; this is
not a new cloud/account storage design. See `ENHANCEMENTS-2026-09-22.md` for
verification and remaining dependency/build findings.

The local launcher is for one trusted machine. Do not expose it publicly or add a
tunnel as a shortcut. A shared-access-code server is not a multi-user identity
system. Real authenticated ownership, rate limiting, quotas, backups and recovery
tests remain public-release requirements. A reverse proxy must preserve the
canonical public request origin for the same-origin mutation check.

The library is original draft content, not a redistribution of IU member courses.
IU membership, content permissions and review approval remain separate from
technical access. A subject-matter reviewer must sign off before publication.
