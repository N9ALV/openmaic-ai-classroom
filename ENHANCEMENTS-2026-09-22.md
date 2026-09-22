# Seven requested improvements — local delivery

**Date:** 22 September 2026

**Scope:** apply quality-review improvements 1–7; defer shared user-storage design and spending controls.

**Release position:** controlled local pilot on `production-pilot`. This is an implementation and verification receipt; commit and pull-request history establish publication and merge status.

## Delivered

1. **Security maintenance.** Next.js and its lint configuration updated to 16.3.5;
   `sanitize-html` to 2.17.7; ECharts to 6.1.0; JS-YAML to 4.3.2; PostCSS to
   8.5.28; XML parsing and affected transitive packages updated. Removed unused
   CopilotKit packages, the unused direct MCP SDK declaration and unused
   `image-size` dependency. The SDK still required transitively is patched through
   scoped dependency floors. The Shadcn build-time stylesheet/CLI dependency is
   retained as a development dependency. A small maintained patch makes
   `omml2mathml` reuse its supplied DOM, eliminating its obsolete `get-dom` /
   jsdom / request dependency chain. The package's existing licence is retained.
2. **Learner-first home.** A prominent Start learning button, a plain explanation,
   separate AI creation route, investing example and explicit lesson-type selector.
3. **Evidence and review records.** Investment outline/content requests require
   server-verifiable retrieved evidence; headless classroom generation requires
   research too. Retrieved context and sources persist with newly generated
   investment classrooms. Built-in lessons and classrooms offer local
   claim/source/passage/date/reviewer records. Reviewed and Approved are separate
   explicit actions. Content changes, invalid records and expired review dates
   revert the effective status to draft. ZIP exports retain evidence and review
   records; PowerPoint investment exports include source/review pages; PDF
   workbooks include status, version and recorded claims. Imported review records
   retain their notes but return to unchecked draft.
4. **Accessibility and readability.** Larger important text, names for icon
   controls (including disabled states), visible keyboard focus, labelled inputs,
   keyboard-operated upload area and reduced-motion support. Automated checks
   cover the home, library and a lesson in light/dark themes. Mobile/reflow checks
   cover learner pages. This is not a claim of complete WCAG certification.
5. **Individual lessons and resume.** Six `/learn/[slug]` pages, Previous/Next,
   content-versioned local progress, optional saved answers/reflections, a resume
   link, progress export and a scoped confirmed reset. Storage failure is visible
   and does not falsely report that completion was saved.
6. **PDF workbooks.** Offline-generated A4 PDFs with lesson text, exercises,
   writing space, knowledge checks, source/version/status information and a
   separate answer section. The original editable text option remains available.
7. **Applied learning.** Six fictional scenarios, a third application question
   per lesson with misconception-specific feedback, written reflections, a
   plain-language glossary and a visual/table-based two-year retirement
   withdrawal exercise. Exhausted capital and unmet withdrawals are explicit.

## Verification

| Check | Result |
| --- | --- |
| Full application suite | 7,339 passed, 0 failed, 96 skipped; 674 files including 10 entirely skipped files |
| Renderer suite | 61 passed |
| Importer suite | 36 passed, including the patched mathematics conversion path |
| Editor suite | 507 passed |
| Launcher contracts | 3 passed |
| Production browser acceptance | 14 passed |
| Full application TypeScript | Passed |
| Workspace package builds and production build | Passed |
| Standalone asset preparation | Passed |
| Final lint, formatting, translation-key alignment and Node engine checks | Passed; lint retains 17 warnings and 0 errors |
| Production dependency audit | 0 critical, 0 high, 1 moderate |

The browser checks cover discovery without scrolling, quizzes, PDF download and
PDF structure, optional answer persistence, reload/resume, scoped reset, review
validation and explicit local approval, unavailable/empty research, restored
sessions, calculator boundaries, withdrawal arithmetic, mobile/reflow,
light/dark accessibility and storage failure recovery. The downloaded ASX PDF
was inspected for lesson text, sources, pagination and its separate answer section.

Unit/contract checks also cover receipt expiry/tampering/topic/source binding,
direct API rejection before model resolution, review invalidation, and evidence
inside classroom ZIP and PowerPoint output. All review identities and approvals
created by tests are synthetic and confined to isolated browser/test storage.

The complete application run was followed by a small disabled-control label fix
and a corrected browser-test locator. The final production build and all fourteen
browser tests passed after that fix. No whole-suite rerun was needed for that
label-only change.

These are mock/fixture-based checks, not live model availability, a budget test,
human content approval or a full real-learner classroom backup restoration.
Database/Docker integration tests were not run in this round. The 96 skipped
application tests remain separately gated/environment-dependent.

## Remaining security and engineering notes

- The sole production audit finding is `uuid@10.0.0`, brought by
  `@langchain/langgraph`, [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
  The advisory concerns v3/v5/v6 calls with external output buffers. The inspected
  LangGraph JavaScript imports use `v4` and `validate`; the affected buffer APIs
  were not found in those direct call sites. It remains visible in the audit,
  rather than being muted or declared universally harmless. Prefer an upstream
  compatible dependency update when available.
- Five production file-tracing warnings remain, now pinpointed by the upgraded
  Next.js diagnostics to runtime file/binary discovery. Packaging's credential
  guard passed; that guard is not a comprehensive secret audit. These warnings
  still need release-engineering review before shared deployment.
- The final lint run shows 17 inherited warnings and no errors. Package installation
  also reports the inherited optional OpenAI v4/Zod peer mismatch; application
  typechecking and tests passed. These are not silently represented as resolved.
- Source receipts last four hours. The default signing key is local-process
  memory, so a restart requires fresh retrieval. A future multi-instance host
  requires a deliberately configured shared secret. Receipt validity proves the
  retrieved source set is unchanged, not that it is relevant, authoritative or
  complete. Editorial review remains necessary.
- Custom investment detection combines explicit course-type metadata with a
  conservative text heuristic. It is not comprehensive semantic classification
  of all possible finance prompts, nor a universal policy for every upstream
  agent/editor path.
- Local review labels are self-declared records, not verified reviewer identities
  or authenticated publication permissions. Actual user identity, storage,
  spending limits and publication authority need the deferred design discussion.
- Previously disclosed provider-key rotation remains unverified. No new live
  generation or provider setup was performed for this work.

## Try the improvements

Start with `Start OpenMAIC.cmd`, then choose **Start learning**. Open a lesson,
try its scenario and quiz, choose **Mark lesson complete**, and return to the
library to see **Continue learning**. Download the PDF workbook for an ordinary
printable copy. The reviewer workspace is a separate editorial workflow.

## Reproduce the important checks

```text
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --incremental false
pnpm exec vitest run --maxWorkers=2 --testTimeout=30000
pnpm --filter @openmaic/renderer test --maxWorkers=2
pnpm --filter @openmaic/importer test --maxWorkers=2
pnpm --filter @openmaic/editor test --maxWorkers=2
node --test scripts/test-start-local.mjs
pnpm lint
pnpm check
pnpm build
node scripts/prepare-standalone.mjs
pnpm exec playwright install chromium --only-shell
pnpm exec playwright test --config=playwright.pilot.config.ts
pnpm audit --prod --audit-level=high
```

Local browser verification used the already-installed test browser by setting
`PLAYWRIGHT_BROWSERS_PATH=C:\Users\CMD\AppData\Local\Temp\opencode\openmaic-qa-browsers`.
That machine-specific location is not hardcoded in app or CI configuration.
The CI workflow now also includes typechecking, lint and a high/critical dependency
gate; its local file does not establish that remote CI has run.
