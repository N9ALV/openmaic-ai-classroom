# OpenMAIC Review and Improvement Implementation Plan

> **For agentic workers:** Execute one task at a time, with a test-and-review checkpoint before the next. Use `superpowers:executing-plans` or the IDE's equivalent workflow. Task 1 is a prerequisite to application changes; subsequent tasks are conditional on what the actual installation already supports.

**Goal:** Make the existing classroom demo reproducible and easier to improve, then strengthen the learner journey without discarding working functionality.

**Architecture:** Preserve the existing installation and establish its relationship to upstream before changing it. Prefer verified upstream capabilities and narrow local patches over a new architecture. This repository currently holds artifacts and coordination material, not the application's implementation.

**Tech stack:** Local runtime unverified. The upstream reference inspected below is OpenMAIC 1.0.0, TypeScript, Next.js 16, React 19, and pnpm; its package manifest requires Node.js >=22.19.0. These are reference requirements, not a finding about the installed demo.

**Spec:** The owner's 5 September 2026 request: review the project, make obvious safe GitHub fixes, and plan the remaining work for the IDE agent. The evidence and scope boundaries below constrain this plan.

## Global constraints

- Preserve the working local demo, existing courses, and local changes before updating dependencies or upstream code.
- Do not deploy, reset a database, force-push, replace a working checkout, or introduce paid model fallback as part of this review.
- Keep the documented free-model demo path. Any paid comparison is a separate, explicitly approved option.
- This repository is public. No credentials, access codes, personal learner records, or private source material in commits, logs, screenshots, or issues.
- Do not confuse upstream capabilities with functionality verified in this installation.
- Do not create duplicate implementations for capabilities the installed version already provides.
- Application file locations must be confirmed against the recovered source. Paths below explicitly identified as upstream references are not present in this repository today.

## 1. Evidence and review limits

**Reviewed repository baseline:** `N9ALV/openmaic-ai-classroom`, `main` at `c818b1d1bcc274552d345fa94070d51dd64b008f`.

The complete, non-truncated tree contained exactly:

| File | Observed state |
| --- | --- |
| `README.md` | Two-line description of a local OpenMAIC demo with a free OpenRouter model. No executable setup instructions or actual demo link. |
| `ASX Investing Basics.pptx` | Exported presentation, 192,345 bytes; blob `884d5b8d031d1502d22dd9ff242d34c8db6dc322`. |

Only `main` existed. The history contained two commits, and the issue/PR collection was empty. Repository metadata had no homepage URL. There was no application source, dependency manifest, lockfile, runtime configuration example, test suite, workflow, native classroom export, or agent instruction file in the tree. The account-wide OpenMAIC code search found only this README; that does not prove that the source is absent from a local machine or from unindexed material.

**Important boundary:** This is a complete repository inventory/documentation review and a targeted upstream comparison, not a full code audit of the working classroom. The PPTX was available as encoded binary through GitHub, but could not be materialized/rendered through the available transfer path. Its slide text, narration, layout, and educational accuracy have **not** been reviewed. No running demo URL was available to test. No application build, browser test, model call, or deployment validation was performed.

### Safe changes made in this review

The accompanying commit improves `README.md`, adds a focused `.gitignore`, and records this plan. The PowerPoint is unchanged. Ignore-pattern validation used an isolated Git repository: 23 expected exclusions failed before the rules existed; all **36 cases** passed afterward, including 13 paths that must remain trackable. These are repository-hygiene checks, not application tests.

The exclusions cover local environment/provider files, dependency/build output, runtime data/logs, and test output. Source files, documentation, lockfiles, reviewed examples, and portable JSON/ZIP/PPTX fixtures remain eligible for tracking. Ignore rules do not remove previously tracked secrets and can be overridden by forced staging.

## 2. Upstream findings worth using, not rebuilding

**Pinned upstream reference:** `THU-MAIC/OpenMAIC` at `1e10f60b151cedb59ac21ddbcceb5ee0eed9c984`, inspected 5 September 2026. This is not a recommendation to upgrade blindly.

| Verified upstream finding | Implication for this project |
| --- | --- |
| The README describes v1.0.0, released 27 August 2026, with a course-building workbench, resumable server-backed sessions, page-level edits, and PPTX import. | Establish whether these are already installed and enabled before designing equivalent functionality. |
| Browser storage is the default; server-backed persistence and the workbench require additional configuration. | Define what must survive reloads/restarts and on which device. A local demo need not acquire a database merely because one is available. |
| The reference persistence setup explicitly warns that its browser-visible development token does not provide learner isolation. | Treat safe external sharing as a separate gate. A site access code is not per-learner authorization. This is not evidence that the local demo is currently exposed. |
| Commit `1e10f60` on 4 September fixes media requests sharing identifiers, with a regression test and generation-package version change. | Check applicability before copying a fix. Repeated suggested image IDs must not cause different scenes to share a generated asset accidentally. |
| OpenRouter documents free-model limits and separate model-fallback routing. | Test quota and provider failures. Changing to another free model must not be assumed to bypass account-level limits; never silently incur paid fallback. |

Primary sources: [upstream README](https://github.com/THU-MAIC/OpenMAIC/blob/1e10f60b151cedb59ac21ddbcceb5ee0eed9c984/README.md), [package manifest](https://github.com/THU-MAIC/OpenMAIC/blob/1e10f60b151cedb59ac21ddbcceb5ee0eed9c984/package.json), [upstream ignore rules](https://github.com/THU-MAIC/OpenMAIC/blob/1e10f60b151cedb59ac21ddbcceb5ee0eed9c984/.gitignore), [media-ID fix and regression test](https://github.com/THU-MAIC/OpenMAIC/commit/1e10f60b151cedb59ac21ddbcceb5ee0eed9c984), [OpenRouter limits FAQ](https://openrouter.ai/docs/faq), [OpenRouter model fallbacks](https://openrouter.ai/docs/guides/routing/model-fallbacks).

## 3. Ordered work for the IDE agent

### Task 1 — Establish the real, reproducible baseline

**Priority:** First, before all application changes.

**Deliverable:** Create `docs/runtime-baseline.md`; update `README.md` to point to the verified source and launch procedure. Record actual findings, not example values.

- [ ] Locate the installation used to generate the ASX lesson. Record its upstream repository, full commit SHA/tag, current branch, and local modifications. Preserve uncommitted work privately before synchronizing anything.
- [ ] Back up the native course data and relevant browser/server storage. Identify where lessons, narration assets, progress, and provider settings actually live.
- [ ] Record the actual Node/package-manager versions, install/build/start commands, port, deployment mode, selected model ID, required model capabilities, speech provider, and storage mode. Document environment variable names only, never their values.
- [ ] Choose a deliberate source arrangement: synchronize the sanitized working source into this repository, or document the canonical source repository plus pinned revision and reproducible local patch/configuration process. Do not substitute an unmodified upstream clone for the customized installation.
- [ ] Reproduce the existing demo from that baseline and open the existing ASX lesson. Capture pre-change failures separately from regressions introduced tonight.

**Acceptance:** Another IDE session can identify and reproduce the same application without guessing its version or configuration. The existing course survives. A scan of staged changes finds no credentials or private learner content. Preserve these review documents when importing upstream: the inspected upstream `.gitignore` ignores `/docs`, so it must not silently hide this repository's coordination material.

### Task 2 — Make one complete lesson easy to review and replay

**Priority:** First functional deliverable after the baseline.

**Deliverable:** Create `samples/asx-investing-basics/README.md`, `samples/asx-investing-basics/outline.md`, and a reviewed native classroom export using the installed version's real export format. Retain the original root PPTX as the untouched baseline artifact.

- [ ] Export the native lesson, not only the slides. Check what is actually preserved: scenes, narration, quizzes, interactive content, images, and other media.
- [ ] Add readable lesson text and narration for future content review. Record the source materials, generation prompt/settings, model ID, date, expected scene count/types, and intended learning outcomes, excluding secrets.
- [ ] Provide a clearly labelled way to open the saved lesson without generating it again. Distinguish this from creating a new lesson.
- [ ] Export an offline/static review copy where supported, and document which functions still require the app, an AI provider, or a network connection. Do not label live AI Q&A as offline-capable without proving it.
- [ ] Test import into a fresh browser profile. Confirm content and media load and note whether saved learner progress should be included or deliberately excluded.

**Acceptance:** A reviewer can inspect the lesson without the author's browser profile or API key. Replaying saved content does not unexpectedly trigger lesson-generation calls. No private prompt, credential, or learner record is embedded in shared exports.

### Task 3 — Improve targeted editing and regeneration, not whole-course churn

**Priority:** High-value authoring improvement; first establish what is already implemented.

**Reference locations:** Upstream `packages/@openmaic/generation/src/outline-media.ts` and `packages/@openmaic/generation/test/outline-media.test.ts`; the installed workbench's scene-editing path must be identified locally.

- [ ] Demonstrate editing one paragraph, replacing one question, and regenerating one scene using existing controls. List missing behavior rather than assuming the controls are absent.
- [ ] Before any patch, add a regression case in the actual project's test framework. Unrelated scenes and their media must remain unchanged; a failed edit must leave the last good version usable.
- [ ] Check whether the upstream media-ID fix is already present. If the older behavior exists, adapt the minimal fix with its package/build requirements rather than copying an isolated function into an incompatible version.
- [ ] Test different media requests that start with the same model-suggested ID, including mixed image/video requests. Every request must receive a distinct identifier without mutating the input, and playback must attach the correct asset to the correct scene.
- [ ] Verify the edited scene survives reload and native export/import. Preserve a recoverable original before making destructive authoring changes.

**Acceptance:** One-scene changes do not recreate the whole lesson, replace unrelated images, lose prior manual edits, or leave the saved course partially updated. If these behaviors already pass, record that and move on.

### Task 4 — Make the free-model path predictable under failure

**Priority:** Reliability gate for demonstrating new generation.

**Deliverable:** Extend the recovered provider/generation path and its existing tests only where failures are reproduced; add a configuration explanation to `docs/runtime-baseline.md`.

- [ ] Verify the exact selected model supports the actual mode's requirements: streaming, structured outputs, tool calls, and sufficient context as applicable. A successful simple chat request is not a complete workbench test.
- [ ] Exercise rate limiting, exhausted quota, invalid credentials, provider errors, malformed output, and an interrupted stream through mocked responses rather than deliberately exhausting the real account.
- [ ] Keep a single bounded retry policy; avoid nested SDK and application retries multiplying calls. Honour applicable retry guidance, stop on non-retryable failures, and show an actionable error instead of an indefinite spinner.
- [ ] Keep completed scenes when a later scene fails. Retrying must not duplicate content or overwrite the last good course. Cancellation must propagate to in-flight work where supported; do not promise that cancellation guarantees zero provider billing.
- [ ] Any fallback must be explicitly configured, compatible with the required features, and within the agreed cost policy. Surface the actual selected model. Do not silently move from a free route to a paid route.
- [ ] Preserve readable saved lessons when generation or narration services are unavailable. Provide text-only playback when speech cannot load.

**Acceptance:** Failure leaves a recoverable draft, a clear explanation, and a bounded number of attempts. No surprise model charges or automatic full-course restart.

### Task 5 — Prove persistence and safe sharing for the intended deployment

**Priority:** Persistence verification for every deployment; authorization is a release gate only when sharing beyond a trusted single-user setup.

**Reference locations:** Upstream `lib/persistence/server-auth.ts`, `/api/persistence`, and the persistence/workbench sections of its README. Confirm equivalent paths in the actual source.

- [ ] Test reload, closing/reopening the browser, restarting the app, and interruption during saving/generation. Document which state is device-local and which is server-backed.
- [ ] Keep the current lightweight storage mode if it meets the demo's requirements. Do not introduce PostgreSQL solely to satisfy an imagined requirement.
- [ ] Before exposing any shared instance, verify that unauthenticated visitors cannot use paid/provider-backed generation, retrieve private configuration, or mutate protected content.
- [ ] Where private learner data is required, derive identity and authorization server-side. Do not use a browser-supplied learner key or a public development token as the trust boundary. Test separate users for cross-user reads/writes and distinguish intentionally public course reads from private data.
- [ ] Review the actual upload and generated-interactive-content boundaries: accepted sizes/types, safe rendering, and fetch restrictions. These are verification tasks, not diagnosed vulnerabilities in this installation.
- [ ] Demonstrate restoration from the backup made in Task 1 before a storage migration. Avoid destructive database reset commands.

**Acceptance:** The chosen persistence promise is demonstrated. External sharing remains disabled or restricted until its applicable access checks pass. Local-only work can proceed without inventing a multi-user account system tonight.

### Task 6 — Improve the learner experience and verify teaching quality

**Priority:** Choose a narrow change after the complete lesson is reviewable.

**Deliverable:** Add `docs/lesson-review.md` with specific findings against the real lesson, then implement only the selected improvement in the recovered UI/content pipeline.

- [ ] Review every ASX slide and narration segment in full. Check clarity, arithmetic, dated/source-dependent claims, explanation of risk and costs, and consistency between the lesson and its quizzes. Do not treat AI-generated financial content as verified merely because it rendered correctly.
- [ ] Make progress, pause/replay, text access, and asking a question easy to discover. Keep provider configuration out of the ordinary learner journey.
- [ ] Test keyboard operation and visible focus, 200% zoom, a narrow screen, audio failure, and returning to a previously opened lesson.
- [ ] Prioritize explanatory feedback over a bare quiz score. Verify that the answer and explanation follow the lesson's stated assumptions and sources.
- [ ] Candidate enhancement: add one small decision-oriented exercise with explicit inputs and an explanation of the outcome. Use it only if it advances a stated learning objective; avoid adding a collection of decorative simulations.

**Acceptance:** Record concrete before/after evidence and the cases tested. No claim is made here that these features are currently absent or broken; the content/UI review determines what to change.

## 4. Verification and end-of-session handoff

Create `docs/validation-2026-09-05.md` with the exact application commit tested, environment, commands, results, and remaining gaps. In the recovered source, first inspect its own package scripts. The pinned upstream has `pnpm lint`, `pnpm test`, `pnpm test:e2e`, and `pnpm build`; these commands cannot be run against this artifact-only baseline. Run only scripts present in the selected version, with its required package build/install steps, and distinguish pre-existing failures from new ones.

The session's minimum useful end state is **a reproducible baseline, a reviewable native ASX lesson, and one verified narrow improvement if warranted**. The full backlog need not be implemented tonight. Move the safe-sharing gate earlier if an external demo is being released.

| Check | Required evidence |
| --- | --- |
| Baseline | Real source SHA, local changes preserved, exact sanitized setup recorded |
| Existing content | Original lesson still opens after the changes |
| Portable review | Readable lesson text plus successful clean-profile export/import |
| Targeted edit | Unrelated scenes/media unchanged and last good state recoverable |
| Provider failure | Bounded handling of mocked errors; no silent paid fallback |
| State | Reload/restart behavior matches the documented storage promise |
| Sharing, when applicable | Appropriate anonymous/user isolation checks pass |
| Learner access | Keyboard/zoom/audio-failure cases recorded |
| Validation | Commands and outcomes reported honestly, including unrun checks |

Do not claim a production deployment, a complete application audit, or successful application tests from this review commit. Those require evidence from the actual implementation and runtime.
