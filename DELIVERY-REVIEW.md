# Product-lead review — 6 September 2026

## Decision

**Controlled local pilot; not a public or multi-user production release.**
This round adds substantive no-key learning content and fixes review feedback.
No live provider generation, payment, public deployment, key rotation or merge
was performed. The existing ASX export and learner data were not overwritten.

## Changes in this review

1. Six original reading lessons at `/learn`, twelve self-checks, three calculators
   and downloadable workbooks. All remain editorial drafts; none claim IU approval.
2. Research gating for curated investment AI briefs, including restored drafts,
   empty results and a one-click route to Web Search settings. Search availability
   is checked using the application's existing provider rules, including keyless
   search; a citation list without retrieved context is rejected.
3. Corrected quoted/international font-family sanitisation and added hostile-HTML
   regressions. Removed the inaccurate claim that the inherited en-US UI is en-AU.
4. Reworked Windows startup: direct Node, stable origin, loopback-only binding,
   app-identity probing, bounded readiness and owned-process shutdown.
5. Packaged the standalone static assets and tested the actual production browser
   experience, not only a 200 response.
6. Added cross-site mutation rejection, canonical token syntax, storage-failure
   recovery guidance, render-worker failure termination and portable ZIP paths.
7. Fixed Windows-specific test assertions and Node 24 Web Lock test isolation.
   Expensive compilation/plugin loading is separated from behaviour-test timers.

## Final verification evidence

- Complete application suite: **7,326 passed, 0 failed, 96 skipped**, across 671
  test files. The 96 include 16 POSIX shell publishing cases explicitly
  unsupported on Windows; they still require Linux/macOS CI.
- Complete storage suite with a real disposable PostgreSQL 16 database:
  **1,126 passed, 0 failed, 6 skipped** across 32 files. Seven additional
  application-level PostgreSQL tests passed. The test container was removed and
  its loopback listener was checked after cleanup. This does not certify a live
  deployment's user identity, backups or access policy.
- Renderer suite: **61 passed**.
- Local launcher contracts: **3 passed**.
- Production build and standalone static-asset packaging: **passed**.
- Production Chromium acceptance: **8 passed** — no-key lessons, quizzes,
  downloads, arithmetic, unavailable/empty research, restored-session gating,
  mobile width, actual CSS/JS hydration and visible non-destructive recovery when
  browser document storage is blocked. Desktop/mobile screenshots were inspected.
- Application and storage TypeScript checks, formatting, translation-key
  alignment and Node engine contract: **passed**.
- Full lint: **0 errors, 17 inherited warnings**. The production build retains
  upstream file-tracing warnings; those are recorded, not silently called fixed.

Tests use mocks, isolated synthetic browser storage or the disposable PostgreSQL
database. They do not prove live model availability, spending control, production
database isolation, a real learner's export/restore, or completed human review.
No model changed inside OpenMAIC in
this round; the conversation's model change is separate from application routing.

## IU and source context

Reviewed the public IU Home Wealth-Fund course overview and IQ Wealth overview.
Their DEEP structure informs the process lesson: Discover, Educate, Evaluate,
Perform, with human authority and durable records. Supporting source routes are
linked, not copied or assumed verified merely because a model lists them. Current
product/tax/market facts require primary-source checks at publication time.

## Remaining release gates

- Human content/rights review using `CONTENT-REVIEW-TEMPLATE.md`.
- Rotate credentials previously disclosed in chat through the provider's own
  controls. Local files have not been claimed to be an exclusive secret store.
- Real authenticated identity, tenant isolation, quotas and rate limits before
  any shared/public deployment.
- Full CSP and remaining specialised HTML/asset execution-boundary review.
- Production PostgreSQL backup/restore, multi-user tests and durable-worker
  deployment validation; not simulated by unit tests.
- Linux/macOS CI and the prepared no-live-provider acceptance workflow.
- Remaining upstream lint and Turbopack file-tracing warnings.
- Scoped end-to-end live provider/content/export acceptance after approval of
  account, model, budget and data. Free models are not a reliability guarantee.

## Reproducing the evidence

```text
pnpm exec vitest run --maxWorkers=2 --testTimeout=30000
pnpm --filter @openmaic/renderer test
node --test scripts/test-start-local.mjs
pnpm exec tsc --noEmit
pnpm --filter @openmaic/storage typecheck
pnpm check
pnpm lint
pnpm build
node scripts/prepare-standalone.mjs
pnpm exec playwright install chromium --only-shell
pnpm exec playwright test --config=playwright.pilot.config.ts
```

Database contracts additionally need a disposable PostgreSQL endpoint through
`PG_CONTRACT_URL` and `STORAGE_PG_CONTRACT_REQUIRED=1`. Never point destructive
contract suites at a production database. Tests do not load `.env.local` unless
an explicit opt-in is set; leave that opt-in off for normal verification.

The first full run exposed Node 24's ambient Web Locks in tests intended to
simulate a browser without them. It also exposed Windows path assumptions and
cold-transform timeouts. Those were corrected without removing behavioural
assertions. A multipart-parser diagnostic differs between Node versions; its
test now requires the same 400 rejection and proves no registry method was
called, rather than assuming which validation step fails first.

## Version-control receipt

This review began on `production-pilot` at `4304f1a7` with PR 2 open. Changes
from this round are local and uncommitted unless a later receipt explicitly says
otherwise. PR 2 still represents the earlier committed work; it must not be
described as containing this round until a checked commit and push occur.
