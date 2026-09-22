# GitHub Project Workflow — IPAS AI Trainer

This document defines the target GitHub Project configuration for IPAS AI Trainer according to AI Product Development Playbook v1.1.

> Note: GitHub Project (Projects v2) fields are account-level project metadata and are not currently exposed by the connected GitHub actions available in ChatGPT. The configuration below is therefore the verification target and manual setup checklist.

## Branch model

```text
main = production / GitHub Pages deploy
dev  = integration + staging / Dev Preview
```

Fixed Dev Preview:

`https://naiyi-chia.github.io/IPAS-AI-trainer/dev/`

All normal implementation work starts from the latest `dev` on an Issue-scoped branch.

Recommended branch prefixes:

```text
feat/issue-N-short-name
fix/issue-N-short-name
ux/issue-N-short-name
question/issue-N-short-name
maint/issue-N-short-name
docs/issue-N-short-name
```

## Status

Use these workflow states:

```text
Inbox
Ready
In Progress
Review
Verify
Ready for Release
Done
```

Definitions:

- **Inbox** — recorded but not fully triaged / specified.
- **Ready** — Issue has clear Goal / Scope / Acceptance Criteria and can be handed to an Engineering Agent.
- **In Progress** — implementation is active.
- **Review** — implementation is complete or nearly complete; ChatGPT Technical Review / PR review and Integration Approval are in progress.
- **Verify** — change is integrated into `dev` and Human Product Verify is in progress on the fixed Dev Preview.
- **Ready for Release** — change is integrated into `dev` and Human Product Verify passed; Issue remains open.
- **Done** — production / final verification gate passed and Issue may be closed.

## Human Gates

There are three separate Human Gates:

1. **Integration Approval**
   - Before Feature PR merge to `dev`.
   - Approves the reviewed change entering the integration / staging environment.
   - Does not mean Product Acceptance.

2. **Product Verify**
   - After merge to `dev`.
   - Performed on the fixed Dev Preview.
   - Covers UX, functionality, mobile / target-browser behavior, Acceptance Criteria, and integration behavior.
   - Failure returns the work to fix → review → integration → verify.

3. **Release Approval**
   - On the Release PR from `dev` to `main`.
   - Approves releasing the verified `dev` state to production.

Key rule:

`merge to dev` ≠ Product Verify passed ≠ Ready for Release.

## Deployment

Keep deployment state separate from Status when possible:

```text
Dev
Production
```

Do not encode deployment entirely in Status.

## Priority

```text
P0 = Production blocker / data loss / security
P1 = High impact
P2 = Normal
P3 = Later / nice-to-have
```

## Type

Recommended values for IPAS AI Trainer:

```text
Bug
Feature
UX
Question
Maintenance
Docs
```

`Question` is the project-specific content type for question-bank quality, official-source corrections, answer / explanation review, competency mapping, and difficulty / distractor improvements.

## Release / Version

Use a single-select or text field, for example:

```text
v0.1-beta
v0.2-beta
v1.0
```

## Recommended Views

### Current Work

Filter Status to:

```text
Ready
In Progress
Review
Verify
Ready for Release
```

### Inbox / Backlog

Filter Status to:

```text
Inbox
Ready
```

### Release

Group by `Release / Version`.

## State transitions

```text
Feedback / idea
→ Inbox
→ Ready
→ In Progress
→ Review
→ Verify
→ Ready for Release
→ Done
```

State meanings across the release flow:

- **Review** covers Technical Review, Feature PR review, and waiting for Integration Approval.
- After Integration Approval and merge to `dev`, move to **Verify**.
- After Human Product Verify passes, move to **Ready for Release**.
- Keep the Issue open through release.
- Move to **Done** only after `main` release and Production Smoke passes.
- Docs / maintenance work with no production deployment may reach Done after its defined final verification gate.

## Standard development lifecycle

Quick reference:

`Feature → Technical Review → Integration Approval → dev → Dev Preview → Product Verify → Ready for Release → Release PR → Release Approval → main → Production Smoke`

Full lifecycle:

```text
Issue
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

Feature PRs may use squash merge. Release PRs should normally use a normal merge so `dev` ancestry is preserved.

After a release, sync `dev` to the latest `main` with a fast-forward when safe. If it cannot fast-forward, inspect branch history first; never force blindly.

## Manual verification checklist

- [ ] Project contains Status field with all seven states.
- [ ] Status descriptions match the v1.1 semantics above.
- [ ] Deployment is a separate field with Dev / Production (if useful for the board).
- [ ] Priority contains P0 / P1 / P2 / P3.
- [ ] Type contains Bug / Feature / UX / Question / Maintenance / Docs.
- [ ] Release / Version field exists.
- [ ] Current Work view exists.
- [ ] Inbox / Backlog view exists.
- [ ] Release view groups by Release / Version.

## Connector limitation

The GitHub connector currently available in ChatGPT can create Issues, branches, files, PRs and related repository content, but does not expose GitHub Projects v2 custom field / view configuration. The Project board fields and views above must therefore be created or verified manually in the GitHub UI unless another integration is added later.
