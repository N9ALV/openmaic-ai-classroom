# OpenMAIC development and product takeover

For the subsequent repairs and current local verification, read
[Blocker repairs, 4 October 2026](BLOCKER-REPAIRS-2026-10-04.md) and
[Muse/OpenRouter live verification, 5 October 2026](LIVE-OPENROUTER-2026-10-05.md).
The audit, packaging, security and render-service findings below are the
historical 3 October baseline, not the current result.

Prepared on 3 October 2026, using the Asia/Singapore date. This record establishes
the application baseline, product direction, verification routes and first
engineering priorities. The existing work is a useful internal investment
learning pilot. Shared member delivery remains a separate release milestone.

## Repository and continuity

| Item | Verified state |
| --- | --- |
| Repository | [N9ALV/openmaic-ai-classroom](https://github.com/N9ALV/openmaic-ai-classroom) |
| Application branch | `production-pilot` at `440cd979423fed6889a4e95b926801ecd29b02f9` |
| Default branch | `main` at `abe966bc8ba6a93f31470cb8d3218d2f226c7474`; earlier artefacts/review only |
| Existing application PR | [PR 2](https://github.com/N9ALV/openmaic-ai-classroom/pull/2), open; 2,898 changed files |
| Local working branch | `codex/development-takeover-2026-10-03`, based on the pilot |
| Local checkout | `C:\Users\Administrator\Desktop\Open-MAIC`; freshly cloned into the empty project folder |
| Upstream | [THU-MAIC/OpenMAIC](https://github.com/THU-MAIC/OpenMAIC), configured as read/reference remote `upstream` |
| Common upstream ancestor | `6334e9adde2ffedea866bf2e9f98a0d13b051fab`, 3 September 2026 |
| Upstream snapshot | `main` at `5312c2b4`; latest release tag inspected: `v1.1.2`, 28 September |

At inspection the pilot had six commits absent from upstream `main`, while
upstream had 147 absent from the pilot. This is an ancestry count, not a count
of missing features. No upstream merge or application upgrade was performed.

The latest pilot commit contains the 22 September improvements. Older reports
that describe those changes as uncommitted are historical snapshots. PR 2's
description still summarises the earlier verification round; its current head
contains the later commit. Do not use the old PR description as the current
test result.

## Product remit and proposed first milestone

Preserve the learner-first experience: open a lesson without configuring AI,
understand one idea, practise it, obtain a usable workbook and resume later.
The six reading lessons, eighteen self-check questions, six applied scenarios,
four arithmetic exercises, glossary and PDF/text workbooks are the existing
core. Content remains draft until subject-matter review. Progress, answers and
review notes are local to a browser/device.

The proposed first milestone is a reproducible, reliable internal pilot.
Member deployment and new authoring features follow the security and recovery
work. This ordering is a product recommendation, not a new publication or
deployment approval. The user was offered a choice of first milestone; no
choice is inferred merely from the passage of time.

Product acceptance should prove that a new learner can find the first lesson,
finish its exercise, download a legible workbook and return to the same version
and saved progress. A reviewer must be able to trace a material claim to dated
evidence and understand the difference between a local review label and actual
publication approval. Completion is not financial competence or suitability.

## Architecture and ownership

| Area | Existing implementation | Lead responsibility |
| --- | --- | --- |
| Application | Next.js 16.3.5 App Router, React 19.2.3, TypeScript; `app/`, `components/`, `lib/` | Preserve learner routes and deployment behaviour; review server/client boundaries |
| Learning library | `lib/learning/`, `components/learning/`, `/learn`, `/learn/[slug]` | Content versions, progress, assessment, readability and workbooks |
| Evidence and editorial workflow | `lib/home/investment-research.ts`, server research receipts, local review records and export metadata | Source provenance, expiry, edit invalidation and honest approval status |
| AI classroom creation | Generation routes, provider resolution, scene/action generation and classroom playback | Mocked regressions, cancellation/recovery, source enforcement and eventual live acceptance |
| Workspace packages | DSL, generation, storage, importer, renderer and editor under `packages/@openmaic/` | Run package tests separately; maintain export/import and rendering contracts |
| Persistence | Browser IndexedDB/local keys; optional PostgreSQL/runtime | Protect existing data; prove export/restore; design owner isolation before shared use |
| Rendering and video | Separate `render-service/`, Chromium/FFmpeg; own manifest/toolchain | Separate execution boundary, network policy and worker packaging |
| Local delivery | `Start OpenMAIC.cmd`, `scripts/start-local.mjs`, standalone package preparation | Loopback binding, stable origin, actual browser hydration and owned-process cleanup |

The shared access code and development persistence token are not IU member
identity or separate learner ownership. Any member-facing integration must
consume the existing WordPress/Vault authority and enforce exact resources at
the child API/data boundary. Do not introduce a parallel member login or
entitlement store. The machine-wide access model was read for this assessment;
no live IU identity or entitlement state was changed.

## Fresh verification on this host

Host baseline: Windows Server 2025, native Windows execution, Node 24.18.0,
pnpm 10.28.0 matching the repository pin, 16 logical processors and approximately
32 GiB RAM. C: reported healthy with approximately 280 GiB free before installation.
The sampled two-day system log had no matching critical/error storage events.
This is a point-in-time observation. WSL and system configuration were untouched.

| Check | Fresh result |
| --- | --- |
| Launcher contracts | 3 passed |
| Translation key alignment | Passed across 12 locale files |
| Frozen dependency installation and package builds | Passed; pinned pnpm 10.28.0, installation including package builds took 20m 7.7s |
| Full application suite | 7,352 passed, 83 skipped; 670 passed files and 4 entirely skipped files |
| DSL package | 252 passed |
| Generation package | 145 passed after correcting a Windows path-separator assertion; first run had 144 passes and 1 failure |
| Importer / renderer / editor packages | 36 / 61 / 507 passed |
| Storage package, including native PostgreSQL contracts | 1,126 passed, 6 skipped; 31 passed files and 1 entirely skipped file |
| Application and storage TypeScript | Passed |
| Lint, formatting and Node engine contract | Passed; lint has 0 errors and 17 inherited warnings |
| Focused runtime-tracing regressions | 98 passed, 1 skipped across usage, media extraction, skill reads and material bytes |
| Production build | Passed after tracing opt-outs; the original 7 broad tracing warnings are gone |
| Standalone packaging | BLOCKED: preparation guard rejects local data copied by startup instrumentation; the current trace still includes 5 local files |
| Initial standalone pilot Chromium acceptance | 14 passed; this predates the new packaging guard and does not prove a clean distributable package |
| Combined production Chromium acceptance | 44 passed in 2.8m (14 pilot + 30 broader cases), with one worker and no retries, against `next start` |
| Production dependency audit | 1 critical, 4 high, 12 moderate, 4 low; 21 advisory entries |

Raw local evidence is under ignored `logs/takeover-2026-10-03/`. Historical
totals in `DELIVERY-REVIEW.md` and `ENHANCEMENTS-2026-09-22.md` are not fresh
results from this machine.

Native PostgreSQL 17.10 was already installed on this host. A new disposable
cluster/database was created below the ignored evidence directory and bound to
`127.0.0.1:55473` for contract checks. The existing service on port 5432 was not
used. Application and storage contracts used separate disposable databases to
avoid interference. The disposable cluster was stopped after testing; port
55473 was closed and the original port 5432 listeners remained. Local contract
results therefore concern PostgreSQL 17.10; the earlier remote PostgreSQL 16
result remains a separate piece of evidence.

The application suite took 12m 15s with two workers. Skipped cases remain explicit
coverage gaps; these include environment-gated browser/video checks and POSIX
publishing cases. The separate render-service and documentation-site toolchains
were not freshly installed or verified here. The prior remote render-service
success is historical evidence, not a fresh native Windows worker test.

Final browser execution exited successfully and the owned port 3003 server was
closed. The production build and 98 focused runtime tests cover the final tracing
annotations; the earlier complete application/package suites establish the
feature baseline. Browser acceptance covers application behaviour, not a clean
standalone distribution or live model quality.

## Small fixes delivered during preparation

- Normalised relative asset paths in the generation package's exact inventory
  assertion. All 33 expected assets are still required; Windows separator syntax
  no longer creates a false failure. This changes a test, not published assets.
- General-lesson browser tests now explicitly select Other education. The four
  failing cases were reproduced before editing; the investment default and its
  research requirement are preserved. The shared browser fixture refuses
  unmocked API writes. Verification also clears provider keys from the child
  environment; this guard is not a general outbound-network firewall.
- Added `playwright.production.config.ts` to run the pilot and broader cases
  together against `next start`, with one worker, fresh contexts and an owned
  loopback server. It refuses to reuse an existing server. Standalone packaging
  remains a separate acceptance boundary.
- Added narrow output-tracing exclusions for root Git metadata, logs, generated
  data and test reports, following the official [Next.js output documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).
  The initial standalone output actually contained the disposable database,
  test browsers and generated data. The preparation script now rejects those
  directories rather than silently deleting them. A negative check confirmed
  rejection of that original contaminated package. Runtime-only host executable,
  media, usage, skill and uploaded-material reads now use the tracing opt-out
  recommended by the installed Next.js build diagnostics. Built-in skill assets
  retain their explicit inclusions and runtime access checks are unchanged.
  Rebuilds confirmed that these changes remove broad warnings but do not fully
  remove local files from startup instrumentation. The packaging guard correctly
  rejects the result. A complete packaging fix remains a release blocker.

The remaining instrumentation trace includes one synthetic uploaded-material
file and four test-browser resource files under `logs/`. They were generated by
this local verification; no live learner data was used. The result demonstrates
a route through which private runtime files could enter a future build. Do not
distribute the standalone output until this is resolved and the guard passes.
The guard is not a comprehensive secret scan.

Desktop home and mobile lesson screenshots were inspected; the primary learning
route and lesson text are readable. Automated checks do not replace a human
content or usability review.

### Existing remote checks

Read-only inspection found the 22 September CI run at the current pilot head:
[run 35718019152](https://github.com/N9ALV/openmaic-ai-classroom/actions/runs/35718019152).
Its lint/typecheck/unit-test job and render-service job passed. The broad browser
job had 40 passes and four failures: full happy path, slide content surface,
double-click text insertion and scene creation. Its log also shows a real Brave
search returning 429; the base browser mock does not cover every API request.
That leak is an identified test-harness gap; it is not yet proved to be the
cause of all four failures. Fresh local reproduction confirmed that the four
cases stop at the disabled generation button while investment education is
selected without research. Those general-lesson tests have now been corrected;
their fresh post-fix result is recorded in the verification table above.

The separate pilot acceptance and PostgreSQL workflow runs at that head passed.
Those are historical GitHub results; no workflow was dispatched or rerun here.
Actions are enabled. Any push that would trigger runs requires explicit chat
permission under the user's repository rule. Workflow files/settings were not
changed.

## Ordered engineering backlog

| Priority | Work | Acceptance evidence |
| --- | --- | --- |
| P0 | Patch and triage the current dependency audit in a focused change | Frozen install; no unresolved critical/high findings without an explicit, source-backed disposition; sanitiser, import/export, build and browser regressions pass |
| P0 before distributing a standalone package | Exclude runtime/private files from startup instrumentation tracing | Rebuild with synthetic marker files in data/logs; all trace/copy paths exclude them; preparation guard passes; isolated standalone browser acceptance passes |
| P0 before sharing | Apply the missing upstream security fixes with the custom pilot features preserved | Regression cases for DNS rebinding/redirects, metadata destinations, provider response leakage, classroom overwrite, render network policy and access-code attempts; no financial-evidence or learner-flow regression |
| P1 | Preserve the corrected browser baseline and confirm it in authorised CI | Local reproduction and corrections are complete; maintain provider mocks/refusals and obtain explicit permission before any remote rerun or triggering push |
| P1 | Prove learner data recovery | Export a complete synthetic classroom and progress; restore in a clean profile; compare scenes, media, quizzes, evidence and review status; interruption/reload preserves completed work |
| P1 | Conduct the focused internal learner/content review | Desktop/mobile, keyboard and 200% zoom journeys; readable workbook; reviewer records for all released lessons; no accidental claim of IU approval |
| P2 before member delivery | Define and implement Vault-backed member access and owner isolation | Anonymous/free/Premium/admin, revoked access, direct origin, protected children and Vault failure tested; owner derived server-side; no cross-user access |
| P2 before shared hosting | Decide durable storage, workers, quotas and budget controls | Disposable migration/backup restoration, cancellation/restart recovery, bounded billable requests, approved model/account and spend cap |
| P3 | Evaluate newer upstream chat, settings and capability configuration | Compare product benefit and migration cost; preserve existing provider policy, exports and learner data; test a deliberate upgrade on a separate branch |

The critical audit entry is [Next.js GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j):
the patched 16.x release starts at 16.3.6. The advisory concerns Node `next/og`
image generation with attacker-controlled SVG input. A source search found no
`next/og` or `ImageResponse` use in the reviewed application paths. This does
not demonstrate exploitability; upgrading and retaining a clear disposition
is still appropriate. High findings concern fast-uri 3.1.6 and Undici 7.29.0;
review current advisory ranges and dependency routes before choosing patches.

### Upstream security reference

The pilot already implements seven-day token expiry, canonical token signatures
and same-origin mutation rejection. It lacks the upstream access-code attempt
limiter. Its media proxy validates each URL then uses a separate plain fetch,
so validation is not pinned to the actual connection. Its classroom create
route still accepts `stage.id` as the stored identifier. These source differences
justify targeted remediation, without claiming that every advisory was exploited.

Start with the official [upstream changelog](https://github.com/THU-MAIC/OpenMAIC/blob/v1.1.2/CHANGELOG.md)
and these inspected commits: `29735f10` (metadata guard), `68aed293` (media DNS
pinning), `1fd4348f` (classroom creation), `ee79762e` (access-code throttling),
`7420d26e` (render network policy), `44762d9d` (MinerU transport) and `15af6ce5`
(caller-selected provider transport/error handling). These are review inputs,
not instructions to cherry-pick all commits without checking their dependencies.
See the official [provider transport advisory](https://github.com/THU-MAIC/OpenMAIC/security/advisories/GHSA-g87c-cm4q-cw5x).

## Verification workflow

Use existing commands and fixtures. Run heavy builds/tests with bounded
concurrency and retain each command's exit status. Do not use automatic format
or lint fixes across the inherited codebase during baseline assessment.

```text
pnpm install --frozen-lockfile
node --test scripts/test-start-local.mjs
node scripts/check-i18n-keys.mjs
pnpm exec tsc --noEmit --incremental false
pnpm --filter @openmaic/storage typecheck
pnpm lint
pnpm check
pnpm exec vitest run --maxWorkers=2 --testTimeout=30000
pnpm --filter @openmaic/dsl test --maxWorkers=2
pnpm --filter @openmaic/generation test --maxWorkers=2
pnpm --filter @openmaic/storage test --maxWorkers=2 --testTimeout=30000
pnpm --filter @openmaic/importer test --maxWorkers=2
pnpm --filter @openmaic/renderer test --maxWorkers=2
pnpm --filter @openmaic/editor test --maxWorkers=2
pnpm build
node scripts/prepare-standalone.mjs
pnpm exec playwright install chromium --only-shell
pnpm exec playwright test --config=playwright.pilot.config.ts
pnpm exec playwright test --config=playwright.production.config.ts
pnpm audit --prod --audit-level=high
```

PostgreSQL contracts require a disposable `PG_CONTRACT_URL`; set
`STORAGE_PG_CONTRACT_REQUIRED=1` to prevent silent omission. The tests truncate
tables. The unrelated native PostgreSQL listener on port 5432 must remain
untouched. POSIX publishing-script cases need an authorised non-Windows test
environment. `render-service/` and `packages/docs/` have separate toolchains;
the root workspace install is not their verification.

The standalone preparation command currently fails intentionally on the copied
data directory. Treat that as a release blocker. Combined production application
tests use `next start` and can run without preparing or distributing standalone
output. Run standalone pilot acceptance only after its packaging guard passes.

For the combined production browser suite, set the build-time flag
`NEXT_PUBLIC_MAIC_EDITOR_ENABLED=true` before `pnpm build`; the editor cases
require it. The workbench and agent-runtime flags remain disabled. Clear live
provider keys for verification. On this host, the pinned Chromium installation
was placed in the ignored evidence directory using `PLAYWRIGHT_BROWSERS_PATH`;
set the same path for test execution or install to Playwright's normal cache.

After the build, the production Playwright configs start an isolated loopback server
on port 3003 with fresh browser storage and provider calls refused/mocked. Stop
owned servers and disposable database processes after verification. Live model
quality, rate limits, voice/media generation, spending, actual member access
and production backup restoration require separate acceptance evidence.

## Working agreement

As lead engineer, own the technical design, focused changes, regressions and
reproducible release receipts. As product manager, own the ordered backlog,
learner outcomes, acceptance criteria and evidence needed for review. Bring
missing decisions to the user when they materially change the outcome. Use
routine reversible steps autonomously within the authorised task.

Keep application changes local until the relevant push/Actions boundary is
resolved. No push, merge, deployment, live provider call, credential write or
Actions mutation is part of this takeover receipt. Preparation establishes a
baseline; it does not certify a production launch.

The assessment, repository instructions and bounded fixes are saved as local
working changes on `codex/development-takeover-2026-10-03`. Raw evidence and test
browsers are ignored and are not intended for a future Git commit.
