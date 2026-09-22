# PROJECT_CONTEXT.md

## Purpose

This file provides stable project context for ChatGPT and Engineering Agents working on IPAS AI Trainer.

It is intentionally semi-stable. Do not use it as a work log and do not store PR numbers, commit SHAs, temporary branch names, or transient task status here. Live task state belongs in GitHub Issues / PRs.

## Product

IPAS AI Trainer is a single-page, static iPAS AI 應用規劃師 practice tool published with GitHub Pages.

- Production: `https://naiyi-chia.github.io/IPAS-AI-trainer/`
- Dev Preview: `https://naiyi-chia.github.io/IPAS-AI-trainer/dev/`
- Primary UI language: Traditional Chinese (Taiwan usage)
- Main application: `index.html`
- Architecture: vanilla HTML / CSS / JavaScript
- No build system or framework is required.

The product supports practice, mock exam, official past-paper, wrong-question, weak-area, and official-scope learning flows.

## Source of Truth Hierarchy

Use the following hierarchy when deciding what to trust:

1. **Canonical cross-project workflow** — `Naiyi-Chia/naiyi-product-playbook`, AI Product Development Playbook v1.1.
2. **GitHub Issue** — task-level Source of Truth for Goal, Scope, Expected Behavior, Constraints, and Acceptance Criteria.
3. **AGENTS.md** — repository execution rules and agent guardrails.
4. **docs/GITHUB_PROJECT_WORKFLOW.md** — IPAS-specific mapping of the workflow to GitHub Project states / fields.
5. **PROJECT_CONTEXT.md** — stable product and repository context only.

If a task requirement changes, update the GitHub Issue first. Do not treat chat, commit messages, or PR comments as a replacement for the Issue contract.

## Branch and Environment Semantics

- `main` = production / deploy boundary.
- `dev` = integration + staging / fixed Dev Preview environment.
- Scoped implementation branches are created from the latest `dev`.
- Feature / fix / UX / question / maintenance work should not be implemented directly on `main`.

The fixed Dev Preview loads the current public `dev/index.html`, allowing integrated Human Product Verify before release to `main`.

## Standard Lifecycle

```text
Feedback / Requirement
→ GitHub Issue
→ scoped branch from latest dev
→ implementation + local/browser QA
→ commit + push
→ ChatGPT Technical Review
→ Feature PR: scoped branch → dev
→ Human Integration Approval
→ merge to dev
→ Dev Preview / staging
→ Human Product Verify
→ Ready for Release
→ Release PR: dev → main
→ ChatGPT Release Review
→ Human Release Approval
→ merge to main
→ Production Smoke
→ Done / Close Issue
```

Key rule:

`merge to dev` ≠ Product Verify passed ≠ Ready for Release.

Ready for Release requires both:
- integration into `dev`; and
- Human Product Verify passed.

## Human Gates

1. **Integration Approval** — approves entry into `dev` for integrated testing.
2. **Product Verify** — human verification on the integrated Dev Preview.
3. **Release Approval** — approves promoting the verified `dev` state to `main`.

Engineering Agent testing, ChatGPT review, and Human Product Verify are separate responsibilities.

## IPAS-Specific Content Guardrails

IPAS AI Trainer contains two different content classes and they must remain clearly separated:

- official iPAS past-paper questions / official answers; and
- self-authored practice questions based on the official competency scope.

Permanent rules:

- Do not modify official past-paper wording, answer keys, source attribution, or exam metadata unless the Issue explicitly concerns a verified transcription / parsing error.
- When official content is changed, verify against the official iPAS page / PDF first.
- Do not present self-authored questions as official exam questions.
- For self-authored questions, preserve consistency across mapped level, subject, competency topic, correct answer, explanation, and difficulty / distractors.
- Question-content changes require a dedicated Question Review Issue or explicit question-content scope.
- Preserve source labeling so users can distinguish official and self-authored content.

## Product / Technical Guardrails

- Preserve the vanilla HTML / CSS / JavaScript architecture unless an Issue explicitly changes it.
- Keep changes scoped and reviewable; avoid unrelated refactors.
- Preserve mobile usability, including a target around 375px where relevant.
- Preserve basic accessibility and avoid introducing horizontal overflow.
- Do not change user progress / localStorage behavior unless explicitly requested.
- Production localStorage keys include:
  - `ipasAIState`
  - `ipasOfficialPastCacheV2`
- The Dev Preview isolates those keys with `dev:` prefixes so preview testing does not overwrite production progress/cache.
- Do not add external dependencies unless the Issue documents the need.

## Validation Expectations

There is not yet a full automated test suite. Relevant local/browser smoke checks and `git diff --check` are expected before implementation is reported ready for review.

For UI / JavaScript work, verify at minimum:
- page load without obvious JavaScript errors;
- practice mode start / answer / navigation;
- mock exam start / submit / review;
- official past-paper flow;
- wrong-question / weak-area views when relevant;
- existing tabs;
- desktop and mobile-sized viewports;
- no unintended horizontal scrolling.

For question-bank changes, also verify:
- intentional question-count changes;
- correct option and explanation consistency;
- official vs self-authored labeling;
- no obvious duplicate question IDs;
- representative changed questions render and score correctly.

## Context Hygiene

Keep this file focused on durable project facts.

Do not add:
- transient task or review state;
- latest commit SHA;
- temporary branch names;
- one-off implementation notes;
- short-lived release status.

Put that information in the relevant GitHub Issue or PR instead.
