# GitHub Project Workflow — IPAS AI Trainer

This document defines the target GitHub Project configuration for IPAS AI Trainer, aligned with the workflow currently used by PMP Trainer.

> Note: GitHub Project (Projects v2) fields are account-level project metadata and are not currently exposed by the connected GitHub actions available in ChatGPT. The configuration below is therefore the verification target and manual setup checklist.

## Branch model

```text
main = production / GitHub Pages deploy
dev  = integration
```

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
- **Review** — code / diff / scope review is in progress.
- **Verify** — Human functional / UX verification is in progress.
- **Ready for Release** — Human Verify passed and feature has been integrated into `dev`; Issue remains open.
- **Done** — production / final verification gate passed and Issue may be closed.

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

Important gates:

- Merge to `dev` alone does **not** mean Done.
- `Ready for Release` requires integration to `dev` plus Dev Preview Human Verify.
- The fixed Dev Preview URL is `https://naiyi-chia.github.io/IPAS-AI-trainer/dev/`.
- User-facing deployable work reaches `Done` only after `main` release and Production Smoke passes.
- Docs / maintenance work with no production deployment may reach Done after its defined final verification gate.

## Standard development lifecycle

```text
Issue
→ scoped branch from latest dev
→ implementation + local/browser QA
→ commit + push
→ ChatGPT diff / scope review
→ Feature PR: scoped branch → dev
→ Human merge approval
→ merge to dev
→ Dev Preview Human Verify (/dev/)
→ Ready for Release
→ Release PR: dev → main
→ Human release approval
→ merge to main
→ Production Smoke
→ Done / Close Issue
```

## Manual verification checklist

- [ ] Project contains Status field with all seven states.
- [ ] Deployment is a separate field with Dev / Production (if useful for the board).
- [ ] Priority contains P0 / P1 / P2 / P3.
- [ ] Type contains Bug / Feature / UX / Question / Maintenance / Docs.
- [ ] Release / Version field exists.
- [ ] Current Work view exists.
- [ ] Inbox / Backlog view exists.
- [ ] Release view groups by Release / Version.

## Connector limitation

The GitHub connector currently available in ChatGPT can create Issues, branches, files, PRs and related repository content, but does not expose GitHub Projects v2 custom field / view configuration. The Project board fields and views above must therefore be created or verified manually in the GitHub UI unless another integration is added later.
