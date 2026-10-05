# OpenMAIC development and product context

## Start here

This is the IU Australian investment-education pilot at
`N9ALV/openmaic-ai-classroom`. Use the existing application and official
`THU-MAIC/OpenMAIC` sources before designing replacements.

Read `LIVE-OPENROUTER-2026-10-05.md`, `BLOCKER-REPAIRS-2026-10-04.md`,
`DEVELOPMENT-TAKEOVER-2026-10-03.md`, `PRODUCTION-PILOT.md` and
`ENHANCEMENTS-2026-09-22.md` before substantive work.
The full application is
on `production-pilot`; remote `main` contains the earlier artefacts and review
documents. Preserve the pilot customisations, ASX PowerPoint and learner data.
Check live branch/commit state before relying on this snapshot.

The lead engineering role covers architecture, implementation, regression
testing and release evidence. The product role covers priorities, learner
journeys, acceptance criteria and review readiness. Routine reversible local
work may proceed within the current user's request. This file does not grant
standing authority for unrelated work, live spending or production changes.

## Product and data boundaries

- Start with the six original draft lessons, accessible learner navigation,
  progress, workbooks, arithmetic exercises and evidence/review features.
- Use British spelling and clear language suitable for Australian learners.
- Local review labels are self-declared records. They are not verified reviewer
  identity, IU approval or permission to publish financial content.
- Keep education distinct from personal advice. Check primary sources and dates
  before changing financial claims; do not treat retrieval receipts as truth.
- Preserve browser origins and storage. Test with synthetic data and isolated
  profiles. Never reset a real learner's storage as a debugging shortcut.

For IU identity, login, membership, entitlements, protected content/files,
`/vault/*`, `/iq/app/*`, resource grants, origin credentials, IU Sync or
agent/client authentication, use the machine-wide `iu-vault-access` skill and
read `C:\Users\Administrator\Desktop\iq-vault\docs\VAULT-AGENT-ACCESS-MODEL.md`
before acting. This also applies to delegated agents. WordPress is the normal
member credential authority; Vault owns access decisions. Interactive agents
are ordinary clients and receive no special login, token, route or grant.
Re-measure the authoritative owner before implementation. Routine Vault content
authoring follows the canonical Supabase authoring contract in that skill.

## Verification

Use the pinned pnpm version and frozen lockfile. The existing test suite is
provider-free by default; leave `TEST_LOAD_LOCAL_ENV` unset. Keep real keys,
populated environment/provider files and private learner material out of Git,
logs and chat. Live provider verification requires an agreed account, model,
data and spending limit.

Follow the commands and test tiers in the takeover report. Root Vitest does
not include workspace-package tests. A passing HTTP health check does not
prove browser hydration, provider connectivity or a completed classroom.
Record fresh results separately from historical receipts and account for skips.

PostgreSQL contract tests truncate their tables. Use only an explicitly
disposable database; never infer that a listener on port 5432 is available for
testing. Preserve unrelated services. Use native Windows capabilities unless
the user has authorised the defined WSL task and host checks.

## GitHub Actions permission

Obtain explicit chat permission for this repository and action before
creating, changing, enabling, disabling or deleting Actions workflows or
settings, or dispatching, rerunning or approving a run. General development,
testing, deployment or push permission is not Actions permission. Before a
push, inspect Actions read-only and obtain permission for any resulting runs.
Preserve restrictions and disabled settings. Do not enable Actions or weaken
controls to fix a check. Existing chat authorisation remains valid within its
stated scope; do not ask again for the same authorised action.

Read-only inspection and local verification are allowed. The takeover used
read-only Actions inspection; no future Actions permission should be inferred.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
