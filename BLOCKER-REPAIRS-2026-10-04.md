# OpenMAIC blocker repairs — 4 October 2026

For the subsequent live-provider repairs and current text-model acceptance,
read [Muse/OpenRouter verification, 5 October](LIVE-OPENROUTER-2026-10-05.md).
The key-pending and no-live-provider statements below describe this report's
4 October session.

This records fresh local work on `codex/development-takeover-2026-10-03`, based
on `production-pilot` commit `440cd979423fed6889a4e95b926801ecd29b02f9` in
[N9ALV/openmaic-ai-classroom](https://github.com/N9ALV/openmaic-ai-classroom).
It supersedes the dependency, security, packaging and render-service blockers
in the [3 October takeover](DEVELOPMENT-TAKEOVER-2026-10-03.md). That report
remains the historical baseline and product backlog.

At the end of the 4 October repair session, the changes were local and
uncommitted. No push, deployment, GitHub Actions change or workflow execution
was performed in that session. No live AI provider was called; the user's AI
key was pending.

## Repairs completed

**Dependencies and installation.** Updated Next.js and its ESLint configuration
to 16.3.6, Undici to 7.29.1, Vitest to 4.1.11 and Vite to 8.0.16. Applied
compatible security floors to vulnerable transitive packages, including
DOMPurify, UUID, URI parsing and build tools. Removed unused `vue-to-react` and
unused vendored Gulp tooling. Both lockfiles are updated; the application uses
pnpm 10.28.0 and the render service retains its separate npm toolchain.

The host's existing shared pnpm cache repeatedly failed with a Windows `stat
UNKNOWN` error. Installation succeeded using the separate task cache
`C:\OpenMAIC-pnpm-store-2026-10-04`; the shared cache was not altered. A frozen
install and all workspace postinstall builds succeeded. This is a working
host-specific route, not a repair of the shared cache.

**Provider and media security.** Integrated the relevant official upstream
implementations and regression tests from `29735f10`, `68aed293`, `1fd4348f`,
`ee79762e`, `7420d26e`, `44762d9d` and `15af6ce5`. This was a selective
integration, with pilot changes retained, rather than a wholesale upstream
upgrade. The [official provider transport advisory](https://github.com/THU-MAIC/OpenMAIC/security/advisories/GHSA-g87c-cm4q-cw5x)
and [upstream changes](https://github.com/THU-MAIC/OpenMAIC/commit/15af6ce5)
provide the source context.

- Provider requests and downloaded media validate destinations and redirects;
  protected fetches pin the validated DNS result to the connection.
- Known cloud metadata/credential destinations remain blocked even when the
  operator allows local networks. Caller-selected provider endpoints retain
  stricter destination rules than operator-configured endpoints.
- Client responses use generic errors instead of forwarding provider response
  bodies or internal exception details.
- Classroom creation generates identifiers server-side and reserves storage;
  exclusive writes prevent callers from overwriting existing classrooms.
- Access-code verification gains the upstream bounded attempt limiter. It
  requires `TRUST_PROXY_HEADERS=true` and a real proxy which overwrites the
  identity headers. The default untrusted-header mode does not throttle all
  clients through one shared identity. This remains a deployment requirement.
- Render previews and uploaded projects receive HTML sanitisation and browser
  network restrictions, including frame/popup and external-resource checks.

Seven-day sessions, canonical access-token signatures, same-origin mutation
checks, investment retrieval guards, feature gates and the existing provider
catalogue remain intact. Incidental newer provider features were excluded.
Shared asset behaviour was preserved; these repairs do not establish member
authentication or owner isolation.

**Rendering.** Repaired a real browser failure in preview asset completion:
the callback no longer depends on a transpiler helper absent from the browser.
Regenerated the render-service lockfile without forcing conflicting peers and
verified `npm ci`. Its tests run with the required Chromium 151, kept in a task
cache, and native FFmpeg. The service's resource and browser-version admission
checks remain in force.

A real native Windows render produced a one-second H.264 MP4 at 320 × 180,
24 fps and 24 frames. It used one worker and screenshot capture, completed in
5.038 seconds and reported peak RSS of 788 MB. `ffprobe` confirmed the output;
an extracted frame was visually inspected. This proves a small synthetic
render, not long narrated lessons, live AI generation or Linux container egress.

**Standalone release.** Startup instrumentation still traced synthetic private
files despite route exclusions. Preparation now validates and removes only
byte-identical generated copies of excluded worktree data. It rejects new or
changed runtime state, redirected directories and local provider configuration;
original worktree files are preserved. Public assets and static files are
included, and the runtime Undici transport is copied explicitly.

Windows pnpm dependency links originally pointed into the checkout. Preparation
now converts them to relative links within the artefact. A plain Node recursive
copy lost directory-symlink types on this host, so
`scripts/copy-standalone.mjs` recreates typed relative links and refuses an
existing destination. The final copied release has 291 dependency links, no
external or broken links, and resolves Undici from within the release. Private
configuration and changed learner-state refusal cases have regression coverage.

The production Playwright configuration now serves the prepared standalone
release, including a copied release outside the checkout. Tests use isolated
browser contexts, synthetic data, cleared provider credentials and API mocks.
The fixture refuses unmocked API writes; it is not a general network firewall.
The earlier general-education test corrections and portable exact asset
inventory check remain included.

ESLint now excludes the already Git-ignored runtime and verification output
directories. A final check had otherwise linted copied third-party GSAP inside
the synthetic render evidence. Application and package source rules are retained.

## Fresh verification

All results below are from this repair session. Root Vitest does not include
workspace-package tests, so each package was run separately.

| Check | Result |
| --- | --- |
| Frozen pnpm install; all workspace postinstall builds | Passed |
| Root Vitest | 7,787 passed; 83 skipped; 698 files passed, 4 skipped |
| DSL / generation / importer / renderer / editor | 252 / 145 / 36 / 61 / 507 passed |
| Storage package, including disposable PostgreSQL contracts | 1,126 passed; 6 skipped |
| Separate render-service tests with Chromium 151 | 216 passed across 19 files; no skips |
| Standalone preparation/copy guards | 12 passed, included in root total |
| Final copied-release browser acceptance | 44 passed in 3.4 minutes; no retries |
| Root and render-service TypeScript checks | Passed |
| Production build and standalone preparation | Passed |
| Formatting, translations, Node engine, launcher, package-version check | Passed |
| ESLint | Passed; no errors, 17 inherited warnings; 40 source-boundary regression cases passed after the ignore change |
| Application production dependency audit | Zero findings |
| Render-service full dependency audit | Zero findings |
| Application/workspace development audit | One high and one low finding, below |

The skipped cases remain coverage gaps, including environment-gated render
checks and POSIX publishing cases. Windows verification does not certify those
paths. `TEST_LOAD_LOCAL_ENV` was unset. PostgreSQL contract suites used only
the disposable native cluster on port 55473; that server has been stopped.
No unrelated database service, learner profile or browser storage was reset.

Command logs and exit-status receipts are under ignored
`logs/blockers-2026-10-04/`: `root-tests-release`, `package-*`,
`render-tests-chromium151`, `typecheck-release`, `render-typecheck-final`,
`production-final-build`, `production-final-prepare`, `browser-release-final`,
`standalone-isolation-release`, `lint-source-release`, `lint-guards-release`,
`format-release-final` and `frozen-install`.
The native render has separate MP4, PNG, JSON and `ffprobe` receipts. Test-only
material is not committed as learner content.

### Remaining development advisories

The current audit reports no patched version for either remaining finding.
Neither was suppressed or marked fixed.

- **High: braces 3.0.3**, through Next's ESLint plugin → fast-glob → micromatch.
  The [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) concerns deeply
  nested input patterns exhausting the stack. This dependency is development
  tooling using repository-controlled patterns, absent from the production
  dependency audit. Do not expose this tooling to arbitrary user glob input.
  Revisit when its upstream chain publishes a compatible fix.
- **Low: elliptic 6.6.1**, through the importer's development Rollup Node-builtins
  plugin → crypto-browserify → browserify-sign. The
  [advisory](https://github.com/advisories/GHSA-848j-6mx2-7j84) concerns its
  cryptographic implementation. Searches of the freshly built importer and
  copied browser vendor bundle found no elliptic/secp256k1 markers. That
  observation is not proof about every future bundle or cryptographic use.
  Replacing the legacy build polyfill needs its own import/export regression
  work; retaining it is an explicit outstanding development-tool risk.

## Remaining release decisions and evidence

Live AI testing needs the supplied key plus the account, model, synthetic test
data and spending limit agreed with the user. It should prove generation,
retrieval, provider error handling, cancellation, usage accounting and export
with that actual provider. No assertion of provider connectivity or model
quality is made from the provider-free suites.

Member delivery still needs the established WordPress/Vault access contract,
server-derived ownership, protected-child and direct-origin checks, durable
storage/backups and shared quota/budget decisions. Render hosting still needs
the supported container and OS-level egress boundary, plus longer media and
restart/cancellation acceptance. These are public/shared-release gates, not
failures of the verified local reading pilot.

The six draft lessons, ASX sample, local progress and review/evidence features
were preserved. Authenticated editorial approval and a human learner/content
review remain separate from software checks. No financial claims were revised.

The affected repository instructions and release documentation have been
updated. The IU access/guidance contract and canonical ownership were reviewed;
a read-only canonical content search found no OpenMAIC-specific owning page.
The optional question about Vault/Knowledgebase updates has no answer yet, so
canonical publication is **explicitly deferred**. No competing page, legacy
sync or new member/agent access mechanism was created.

## Reproduce the local release check

Use native Windows and the pinned pnpm version. Clear real provider credentials
from the test process and leave `TEST_LOAD_LOCAL_ENV` unset. The PostgreSQL
contract commands in the takeover report require an explicitly disposable
database because they truncate tables; do not reuse an existing listener.

```powershell
pnpm install --frozen-lockfile --store-dir C:\OpenMAIC-pnpm-store-2026-10-04
pnpm exec vitest run --maxWorkers=2 --testTimeout=30000
$env:NEXT_PUBLIC_MAIC_EDITOR_ENABLED = 'true'
pnpm build
node scripts/prepare-standalone.mjs
node scripts/copy-standalone.mjs C:\OpenMAIC-review-NEW
$env:OPENMAIC_STANDALONE_DIR = 'C:\OpenMAIC-review-NEW'
pnpm exec playwright test --config=playwright.production.config.ts
pnpm audit --prod --audit-level=high
```

The destination must be new. Prepare only fresh build output; preserve/export
runtime data before replacing a served release. Chromium for Playwright and
Chromium 151 for rendering are separate dependencies. Follow the separate
render-service README for its npm/runtime requirements. These commands are
local verification, not permission to run GitHub Actions or deploy.
