# OpenRouter live verification — 5 October 2026

Live text generation and classroom interaction now pass with
**`meta/muse-spark-1.3-contributor`**. The user supplied the OpenRouter key,
selected this model and authorised testing up to the existing OpenRouter cap.
No separate spending restriction or cap change was imposed.

This follows the [4 October blocker repairs](BLOCKER-REPAIRS-2026-10-04.md)
and [3 October takeover](DEVELOPMENT-TAKEOVER-2026-10-03.md). Verification used
local changes on `codex/development-takeover-2026-10-03`, based on
`440cd979423fed6889a4e95b926801ecd29b02f9`. Read-only GitHub inspection on
5 October, before publication, confirmed `production-pilot` pointed to that
commit. No push, deployment, GitHub Actions change or workflow execution was
performed during verification. Subsequent repository delivery is tracked in
[PR 2](https://github.com/N9ALV/openmaic-ai-classroom/pull/2).

## Repairs from live testing

- Added Muse Spark 1.3 Contributor to the existing OpenRouter catalogue, with
  the context, output and capability metadata returned by OpenRouter.
- Recorded its mandatory reasoning and supported effort levels. The settings
  controls no longer offer an unsupported Off setting for Muse. Best-effort
  disabling, including the server setting, requests the lowest supported
  effort instead. Existing explicit per-call thinking precedence is retained.
- Increased the connection check's output allowance from 64 to 1,024 tokens.
  The earlier allowance could be consumed entirely by reasoning, producing a
  successful upstream response with no visible answer.
- The connection check now rejects empty or whitespace-only replies with
  HTTP 502 and a clear message. A live check against the repaired build
  returned HTTP 200 and `OK`.

The [official model page](https://openrouter.ai/meta/muse-spark-1.3-contributor)
identifies the selected model. OpenRouter's
[reasoning documentation](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens)
explains how reasoning consumes the output allowance. Contributor inputs and
outputs may be used to improve Meta products, so these checks used only
invented general-education material.

## Actual provider and browser acceptance

A fresh production build was prepared and copied outside the checkout to
`C:\OpenMAIC-live-review-2026-10-05-01fee60b`. Its server listened on IPv4
loopback, with the normal `localhost` browser origin. The supplied credential
was injected into the owned server process in memory. It was not saved to a
provider file, browser profile, source file or command line. Server log capture
redacted credentials. Only the selected model was configured for live calls.

| Check | Fresh result |
| --- | --- |
| Server-managed model discovery | Selected Muse model available; response contains no key |
| Connection check | HTTP 200 with visible `OK` |
| Background classroom generation | Job `omouC12gAK` completed all three scenes; saved classroom `ckY-b2BgO9` |
| Generated content | Two slides and a two-question quiz about litres and millilitres, with British spelling |
| Browser rendering/navigation | All three scenes loaded and could be selected |
| Quiz as a learner | Both correct answers graded locally: 20/20 |
| Classroom ZIP | Three-scene manifest retained the slides and quiz |
| PowerPoint | Valid archive containing two slide XML files |
| Resource pack | ZIP download contains the PowerPoint |
| Fresh-browser import | Imported course opens from the saved-course list with a new identifier |
| Import/re-export comparison | Scene titles, order, slide content and quiz content unchanged |
| Restored quiz | Both answers still grade correctly |
| Live teacher question | `/api/chat` streamed a complete, visible explanation that 500 millilitres is half a litre; the teacher highlighted the formula |
| Browser generation cancellation | Back returned home, aborted the live outline request, cleared the active session and made no further generation requests during the observation period |
| Uncaught browser errors | Zero across the accepted checks |
| Usage accounting | Fixed-build release recorded 18 Muse requests and 76,302 tokens across generation, connection checks and teacher interaction |

The arithmetic and generated answer choices were checked directly: one litre
equals 1,000 millilitres, 500 millilitres equals half a litre, and
250 + 250 millilitres equals 500 millilitres. This verifies this synthetic
course, not general correctness of future model output or financial content.

Browser cancellation evidence is a cancelled client request and navigation;
it does not certify immediate termination or final billing at the provider.
The detached background classroom API has no cancellation endpoint, and this
session did not add one or claim to cancel its completed job.

Raw synthetic classroom JSON, screenshots, ZIPs, PowerPoint, streamed chat
events, redacted logs and exit receipts are kept in the Git-ignored directory
`logs/live-openrouter-2026-10-05/`. The accepted classroom/recovery receipt is
`classroom-and-recovery-receipt.json`; the final interaction/cancellation
receipt is `live-receipt.json`. Earlier failed harness attempts are retained
separately rather than presented as application failures or passing receipts.

## Fresh source verification

| Check | Result on 5 October |
| --- | --- |
| Focused model/connection regressions | 105 passed, including real SDK wire-format checks with synthetic transport |
| Full root Vitest | 7,792 passed; 83 skipped; 699 files passed, 4 skipped |
| Copied-release browser regression suite | All 44 passed; no retries |
| Root TypeScript | Passed |
| Production build and standalone preparation/copy | Passed |
| Changed-source ESLint | Passed with no errors |
| Repository formatting | Passed before the handover update; updated documents checked separately |

The first root run had one cold ESLint-boundary test exceed its 30-second
allowance while the production build was also running. After that build
finished, the complete suite passed with two workers and a 60-second allowance
per test. Both receipts are retained. No test was removed or skipped to obtain
the passing run.

`TEST_LOAD_LOCAL_ENV` remained unset. PostgreSQL contracts used only the
explicitly disposable native cluster on port 55473, with
`STORAGE_PG_CONTRACT_REQUIRED=1`. That cluster and the owned test servers have
been stopped; no unrelated database or real learner storage was reset.

The unchanged workspace packages, render service, frozen installation and
dependency audits retain their separately dated results in the 4 October
report. They were not silently counted as fresh 5 October checks. The 83
root skips remain coverage gaps.

## Configuration and remaining release work

For the same server-managed configuration, supply `OPENROUTER_API_KEY` at
runtime and select `OPENROUTER_MODELS=meta/muse-spark-1.3-contributor` and
`DEFAULT_MODEL=openrouter:meta/muse-spark-1.3-contributor`. The catalogue now
offers Muse without changing the project's default model. This session's key
injection was temporary; test services are stopped and the key was not
installed into a persistent deployment.

No further account or key is required for these text-model checks. Live
primary-source investment retrieval, voice/image/video generation, longer
media/restart acceptance and shared member delivery remain separate work.
Existing WordPress/Vault ownership, protected-content, hosting, storage and
content-review requirements in the pilot report still apply. No financial
claim, ASX sample, original lesson or real learner record was changed.

Official upstream has since published the
[server-first 1.2.0 release candidate](https://github.com/THU-MAIC/OpenMAIC/commit/636fab0d7edee5e7c2694117c38ece8f623573f9).
It was inspected read-only; a larger storage/runtime migration was not mixed
into this provider repair.

The repository handover and pilot guidance have been updated. The earlier
optional Vault/Knowledgebase question is still unanswered, so canonical
publication remains **explicitly deferred**. No competing guide or new member
or agent access mechanism was created.
