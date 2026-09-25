# AGENTS.md

## Project
IPAS AI Trainer is a single-page, static iPAS AI 應用規劃師 practice tool published with GitHub Pages.

- Main application: `index.html`
- Production site: `https://naiyi-chia.github.io/IPAS-AI-trainer/`
- No build system or framework is currently required.
- UI copy is primarily Traditional Chinese (Taiwan usage).
- `main` is the production / deploy branch.
- `dev` is the integration + staging / Dev Preview branch.
- Cross-project workflow follows the canonical AI Product Development Playbook v1.6 in `Naiyi-Chia/naiyi-product-playbook`.

## Source of Truth
The GitHub Issue is the Source of Truth for each development task.

Before implementation, read the Issue and treat its Goal, Scope, Expected Behavior, Constraints, and Acceptance Criteria as the task contract.

If Scope, Expected Behavior, or Acceptance Criteria changes during implementation:
1. Stop expanding the implementation.
2. Update the GitHub Issue first.
3. Continue only after the Issue reflects the new requirement.

Do not keep requirement changes only in chat, commit messages, PR comments, or handoff text.

## Before making changes
1. Confirm the repository root and fetch origin.
2. Read the relevant GitHub Issue; it is the mandatory task contract.
3. Use the applicable `AGENTS.md` / repo instructions. If the runtime already loaded them, do not reload or paste them only for formality.
4. Load additional context only when materially needed:
   - Parent Issue: when the Sub-issue contract is insufficient, or for epic orchestration / checkpoint / final integration.
   - `PROJECT_CONTEXT.md`: when stable product / repository context is needed for the task.
   - Canonical Playbook: for workflow ambiguity, governance changes, or interpreting repo rules; routine implementation should not reread the whole Playbook.
5. Determine the explicit integration strategy from the Issue:
   - default: latest `dev`;
   - Human-enabled Epic pattern: latest named Epic Integration Branch.
6. Switch / update the correct baseline and confirm the working tree is clean.
7. Create a scoped branch from that baseline, for example:
   - `feat/issue-N-short-name`
   - `fix/issue-N-short-name`
   - `ux/issue-N-short-name`
   - `question/issue-N-short-name`
   - `maint/issue-N-short-name`
8. Inspect only the relevant existing implementation / evidence before editing; do not duplicate existing behavior.

Context efficiency must not override correctness: if required evidence is missing, read the authoritative source instead of guessing.

## Editing rules
- Keep changes scoped to the Issue. Avoid unrelated refactors.
- Prefer small, reviewable diffs.
- Keep the current vanilla HTML/CSS/JavaScript approach unless the Issue explicitly requires an architecture change.
- Preserve mobile usability and basic accessibility.
- Do not remove or change existing user progress / localStorage behavior unless explicitly requested.
- Do not add external dependencies unless the need is documented in the Issue.
- Do not change unrelated files merely to reformat them.

### Question-bank and official-content rules
- Distinguish clearly between:
  - official iPAS past-paper questions / official answers; and
  - self-authored practice questions based on the official competency scope.
- Do not modify official past-paper wording, answer keys, source attribution, or exam metadata unless the Issue specifically concerns a verified transcription / parsing error.
- For self-authored questions, preserve the mapped level, subject, competency topic, answer, and explanation consistency.
- Question-content changes must have a dedicated Question Review Issue or explicitly include question-content scope.
- When an official source is involved, verify against the iPAS official page / PDF before changing the content.
- Do not present self-authored questions as official exam questions.

## Validation
There is not yet a full automated test suite. Before reporting implementation ready for review, run the relevant checks and record the result.

Minimum smoke checks after UI / JavaScript changes:
- Page loads without obvious JavaScript errors.
- Practice mode can start, answer, and navigate questions.
- Mock exam can start, submit, and enter review.
- Past-paper tab / official-paper flow still opens normally.
- Wrong-question and weak-area views still render normally when relevant.
- Existing tabs still open normally.
- The changed feature works on a desktop-sized viewport.
- The changed feature remains usable on a mobile-sized viewport (target around 375px where relevant).
- No unintended horizontal scroll is introduced.
- Run `git diff --check` before commit.

For question-bank changes also verify:
- Question count changes are intentional.
- Correct option and explanation remain consistent.
- Official vs self-authored source labeling remains correct.
- No obvious duplicate question IDs are introduced.
- A sample of changed questions renders and scores correctly in practice / mock mode.

## Implementation completion
When implementation is complete:
1. Review the final diff.
2. Run relevant QA / smoke checks.
3. Run `git diff --check`.
4. Commit the scoped change.
5. Push the scoped branch.
6. If GitHub Issue-comment permission is available, post concise Engineering Ready evidence using `<!-- engineering-ready-for-review -->`; otherwise report the same concise evidence in the current handoff channel.

Stop implementation after the handoff. Technical Review PASS may cause ChatGPT / orchestration to create or update the correct PR automatically. Engineering implementation itself must not merge into `dev` / `main`, close the Issue, declare Product Verify, or make a release decision.

## Completion report
Preferred location: the task GitHub Issue, when write permission is available.

Use this marker:

```html
<!-- engineering-ready-for-review -->
```

Keep the report concise. Record:
- Issue number.
- Branch / commit SHA.
- Changed scope / files.
- Relevant tests / browser QA and results.
- Durable evidence / report path when one exists.
- Known limitations / blockers.
- Final working-tree / remote-sync state when relevant.

Do **not** restate Goal / Scope / Expected Behavior / Acceptance Criteria already owned by the Issue.

Detailed machine-generated audit output, CSVs, logs, or large reports should live in durable repository artifacts when useful; the completion comment should reference them instead of pasting them.

The completion report is implementation evidence / handoff status only. If Scope, Expected Behavior, or Acceptance Criteria changed, update the Issue first.

A GitHub Issue comment creates a retrievable shared handoff, so the Human can use a short request such as `review #N` instead of copying the report into chat.

## Human gates
Human decisions control state transitions; GitHub mechanics around those decisions may be automated.

An Engineering Agent / orchestrator must not independently:
- merge into `dev` without Human Integration Approval;
- declare Product Verify complete;
- release / merge into `main` without Human Release Approval / release intent;
- close a deployable Issue before Production Smoke passes;
- claim the production site is verified without evidence.

PR creation itself is **not** a Human Gate. After ChatGPT Technical Review PASS, the correct Feature / Sub-issue PR may be created or updated automatically.

There are three Human-owned decision semantics:

1. **Integration Approval**
   - Required before a reviewed change crosses into `dev`.
   - Human can simply say `可以 merge 到 dev`.
   - If the PR does not exist yet, orchestration may create it, verify head / base / review / mergeability, then merge when clean.
   - It is not Product Acceptance.

2. **Product Verify**
   - Happens after the change is integrated into `dev`.
   - Must verify the integrated Dev Preview for UX, function, mobile / target-browser behavior, Acceptance Criteria, and integration behavior.
   - `Product Verify 通過` means Ready for Release; it does **not** release automatically.
   - A failed Product Verify keeps the Issue open. If Expected Behavior / Scope / AC changes, update the Issue before rework.

3. **Release Approval / release intent**
   - Human decides whether the verified `dev` state should now enter production.
   - `Product Verify 通過，可以發布` may provide Product Verify and Release Approval in one explicit instruction.
   - If Product Verify already passed, a later `可以發布` supplies Release Approval.
   - After release intent, orchestration may create / update the Release PR and run Final Release Review.
   - If Final Release Review is clean, it may merge `main` without asking for a redundant second approval. Any blocker / conflict / unexpected scope stops automation.

Merge to `dev` does not mean Product Verify passed and does not mean Ready for Release.

### Optional Epic Integration Branch authorization

The canonical Playbook v1.6 allows an **Optional Epic Integration Branch** for a large initiative made of multiple highly related Sub-issues that should accumulate before entering shared `dev`.

This pattern is an explicit exception, not the default.

- ChatGPT may identify the pattern as a candidate, but must not enable it without a clear Human decision.
- The Human decision, epic branch identity, sequencing / checkpoint strategy, and final integration plan belong in the **Parent Issue**.
- Each **Sub-issue** keeps its own Goal / Scope / Acceptance Criteria and explicit base / target branch.
- Every Sub-issue still requires Engineering QA and independent ChatGPT Technical Review.
- After Technical Review PASS, the Sub-issue PR to the enabled Epic Integration Branch may be created automatically and merged when review / conflict checks are clean.
- Per-Sub-issue Human Epic Integration Approval is **not required**.
- Human aggregate checkpoint reviews remain available at meaningful phases or when accumulated risk / conflict exposure warrants them. A checkpoint is **not Product Verify**.
- The Epic Integration Branch should sync latest `dev` at meaningful checkpoints and **must** sync current `dev` before final integration, followed by aggregate regression / conflict checks.
- Do not arbitrarily rewrite shared epic-branch history. If branches diverge or conflict, inspect history first; do not blind force or rebase.
- The Epic Integration Branch is not staging or production. Do not declare canonical Product Verify on it.
- Final `Epic Integration Branch → dev` still requires Human Integration Approval.
- Keep initiative-specific branch names and contracts in the Parent Issue / Sub-issues, not in `AGENTS.md`.

## Branch and release model

### Default lifecycle

Quick reference:

`Feature → Engineering Ready → Technical Review → auto Feature PR → Integration Approval → dev → Dev Preview → Product Verify → Ready for Release → release intent → Release PR + Final Release Review → main → Production Smoke`

```text
Issue
→ scoped branch from latest dev
→ implementation + local/browser QA
→ commit + push
→ concise Engineering Ready for Review evidence
→ ChatGPT Technical Review
→ Feature PR automatically created / updated
→ Human Integration Approval
→ merge to dev
→ Dev Preview / staging (/dev/)
→ Human Product Verify
→ Ready for Release (Issue remains open)
→ Human Release Approval / release intent
→ Release PR automatically created / updated
→ ChatGPT Final Release Review
→ clean: merge to main / blocker: stop
→ Production Smoke
→ Done / Close Issue
```

### Optional Epic Integration Branch lifecycle

Use this only when the Parent Issue contains the explicit Human decision enabling it.

```text
Parent Issue enables Epic Integration Branch
→ Sub-issue scoped branch from latest Epic Integration Branch
→ implementation + local/browser QA
→ concise Engineering Ready
→ ChatGPT Technical Review
→ Sub-issue PR automatically created / updated
→ clean checks: merge to Epic Integration Branch
→ aggregate checkpoints / dev sync as defined by Parent Issue
→ final aggregate QA + sync current dev
→ PR: Epic Integration Branch → dev
→ Human Integration Approval
→ merge to dev
→ Dev Preview / staging
→ Human Product Verify
→ Ready for Release
→ Human Release Approval / release intent
→ Release PR + Final Release Review
→ clean: merge to main / blocker: stop
→ Production Smoke
→ Done / Close Issue
```

Feature and Sub-issue PRs may use squash merge. Release PRs should normally use a normal merge so `dev` ancestry is preserved.

After a release, sync `dev` to the latest `main` with a fast-forward when safe. If it cannot fast-forward, inspect branch history first; never force blindly.
