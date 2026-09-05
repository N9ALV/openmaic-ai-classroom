# OpenMAIC Australian Investment Education Pilot

## Current release position

This build is an **experimental, controlled internal pilot**. It is not yet
approved for an unauthenticated public or multi-tenant production deployment.

The practical first release target is a trusted single-user or small internal
trial with server-managed model credentials, a strong access code, usage caps,
manual content review and regular exports/backups.

## What this pilot adds

- Six preinstalled Australian investment-learning briefs on the home page.
- Prompts that require primary-source checks, dated claims, downside analysis,
  realistic costs, tax, liquidity and AUD/USD treatment.
- Australian English as the first-run language.
- Seven-day expiry for shared access-code sessions.
- Baseline security headers.
- Node-only startup registration isolated from the Edge bundle.

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
copy, starts only on port 3000 and opens the browser when the health check is
ready. Keep its single black window open while using the classroom.
