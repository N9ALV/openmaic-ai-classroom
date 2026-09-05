# OpenMAIC AI Classroom

OpenMAIC classroom demo, described in the original project brief as a local setup using a free OpenRouter model.

## Current repository status

As inspected on **5 September 2026**, the application source and local runtime configuration have **not been recorded in this repository**. Before the review changes, `main` contained only this README and the exported PowerPoint below. This is an artifact and coordination repository at present, not a runnable checkout of OpenMAIC.

The installed OpenMAIC version, exact model ID, startup procedure, storage configuration, and a verified demo URL are not recorded here. Do not assume that upstream `main` matches the existing local demo, or replace that working installation with a fresh clone before preserving its changes and data.

## Review material

- [ASX Investing Basics — PowerPoint export](ASX%20Investing%20Basics.pptx)
- [5 September review and IDE improvement plan](docs/superpowers/plans/2026-09-05-review-and-improvements.md)
- [Upstream OpenMAIC project](https://github.com/THU-MAIC/OpenMAIC)

The PowerPoint is a presentation export, not evidence that the complete interactive classroom, its state, or its runtime can be reconstructed from this repository.

## Next development session

Start with Task 1 in the improvement plan: locate and preserve the working installation, identify its exact upstream revision and local changes, and record a reproducible, secret-free baseline. Then test the existing ASX lesson end to end before selecting a narrow improvement.

The plan distinguishes confirmed repository findings from upstream capabilities and local checks. No application code, provider configuration, deployment, or lesson content was changed by this review.

## Configuration and data safety

This repository is public. Keep API keys, access codes, populated environment files, server-provider configuration, local databases, and private learner material out of commits and issue comments. The new `.gitignore` excludes common local configuration and generated output while retaining documentation, reviewed configuration examples, source files, and portable lesson fixtures.

Ignore rules do not remove files already tracked by Git, scan for credentials, or replace reviewing a diff before pushing. Any example configuration must contain no live secrets.
