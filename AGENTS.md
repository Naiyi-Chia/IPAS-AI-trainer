# AGENTS.md

## Project
IPAS AI Trainer is a single-page, static iPAS AI 應用規劃師 practice tool published with GitHub Pages.

- Main application: `index.html`
- Production site: `https://naiyi-chia.github.io/IPAS-AI-trainer/`
- No build system or framework is currently required.
- UI copy is primarily Traditional Chinese (Taiwan usage).
- `main` is the production / deploy branch.
- `dev` is the integration + staging / Dev Preview branch.
- Cross-project workflow follows the canonical AI Product Development Playbook v1.4 in `Naiyi-Chia/naiyi-product-playbook`.

## Source of Truth
The GitHub Issue is the Source of Truth for each development task.

Before implementation, read the Issue and treat its Goal, Scope, Expected Behavior, Constraints, and Acceptance Criteria as the task contract.

If Scope, Expected Behavior, or Acceptance Criteria changes during implementation:
1. Stop expanding the implementation.
2. Update the GitHub Issue first.
3. Continue only after the Issue reflects the new requirement.

Do not keep requirement changes only in chat, commit messages, PR comments, or handoff text.

## Before making changes
1. Confirm the repository root.
2. Fetch origin.
3. Read the relevant GitHub Issue and determine the explicit integration strategy.
4. By default, switch to `dev` and update from `origin/dev`. If the Parent Issue has Human-approved the canonical Optional Epic Integration Branch pattern, use the named Epic Integration Branch as the implementation baseline instead.
5. Confirm the working tree is clean.
6. Read this `AGENTS.md`.
7. Read `PROJECT_CONTEXT.md` for stable project context.
8. Create a scoped branch from the correct baseline, for example:
   - `feat/issue-N-short-name`
   - `fix/issue-N-short-name`
   - `ux/issue-N-short-name`
   - `question/issue-N-short-name`
   - `maint/issue-N-short-name`
9. Inspect the existing implementation before editing; do not duplicate existing behavior.

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
5. Push the feature branch.
6. If GitHub Issue-comment permission is available, post the completion report to the task Issue using the marker `<!-- engineering-ready-for-review -->`. If Issue commenting is unavailable, report the same information in the current handoff channel.

By default, stop after the completion report. Do not open a PR unless the human explicitly authorizes it.

## Completion report
Preferred location: the task GitHub Issue, when write permission is available.

Use this marker:

```html
<!-- engineering-ready-for-review -->
```

Report:
- Issue number.
- Branch name.
- Commit SHA.
- Files changed.
- Approximate `+/-` lines when available.
- What changed.
- Tests / browser QA performed and results.
- Known limitations or follow-up work.
- Final `git status` / working-tree state.
- Remote-sync state.

The completion report is implementation evidence / handoff status only. It does not change requirements or Acceptance Criteria. If Scope, Expected Behavior, or Acceptance Criteria changed, update the Issue first.

Posting the completion report does not authorize opening a PR, merging, closing the Issue, declaring Product Verify complete, or releasing.

A GitHub Issue comment does not automatically send a message into an existing ChatGPT conversation. It creates a shared handoff that ChatGPT can retrieve later, so the human can use a short request such as `review #N` instead of copying the full report.

If the agent cannot comment on the GitHub Issue, use the same completion-report content in the current handoff channel.

## Human gates
Unless explicitly authorized by the human, an Engineering Agent must not independently:
- open a Pull Request;
- merge into `dev`;
- merge into `main`;
- close the Issue;
- declare Product Verify complete;
- make a release decision;
- claim the production site is verified.

There are three canonical Human Gates:

1. **Integration Approval**
   - Happens before a reviewed change enters `dev`.
   - In the default flow, this is before Feature PR merge to `dev`.
   - For an approved Epic Integration Branch, this is the final Human Gate before the Epic Integration Branch PR merges to `dev`.
   - Means the change has completed the required technical review and may enter the integration / staging environment.
   - It is not Product Acceptance.

2. **Product Verify**
   - Happens after the change is integrated into `dev`.
   - Must verify the integrated Dev Preview for UX, functional behavior, mobile / target browser behavior, Acceptance Criteria, and integration behavior.
   - A failed Product Verify keeps the Issue open and requires another fix → review → integration → verify loop.

3. **Release Approval**
   - Happens on the Release PR from `dev` to `main`.
   - Means the human approves releasing the verified `dev` state to production.

Merge to `dev` does not mean Product Verify passed and does not mean Ready for Release.

Ready for Release requires:
- the change is integrated into `dev`; and
- Human Product Verify passed.

### Optional Epic Integration Branch authorization

The canonical Playbook v1.4 allows an **Optional Epic Integration Branch** for a large initiative made of multiple highly related Sub-issues that need to accumulate into one coherent result before entering shared `dev`.

This pattern is an explicit exception, not the default.

- ChatGPT may identify the pattern as a candidate, but must not enable it without a clear Human decision.
- The Human decision, epic branch identity, sequencing / checkpoint strategy, and final integration plan belong in the **Parent Issue**.
- Each **Sub-issue** keeps its own Goal / Scope / Acceptance Criteria and must state its explicit base / target branch.
- A Sub-issue scoped branch starts from the latest named Epic Integration Branch and its PR targets that Epic Integration Branch.
- Every Sub-issue still requires Engineering QA and independent ChatGPT Technical Review.
- Before a reviewed Sub-issue PR merges to the Epic Integration Branch, require **Human Epic Integration Approval**.
- Epic Integration Approval is an additional lightweight authorization. It is **not** canonical Integration Approval and does not replace any of the three Human Gates.
- Human aggregate checkpoint reviews may be used at meaningful phases or when accumulated risk / conflict exposure warrants them. A checkpoint review is **not Product Verify**.
- The Epic Integration Branch should sync latest `dev` at meaningful checkpoints and **must** sync current `dev` before final integration, followed by aggregate regression / conflict checks.
- Do not arbitrarily rewrite shared epic-branch history. If branches diverge or conflict, inspect history first; do not blind force or rebase.
- The Epic Integration Branch is not staging or production. Do not declare canonical Product Verify on it.
- Final integration must still follow: Epic Integration Branch → PR to `dev` → Human Integration Approval → merge to `dev` → Dev Preview → Human Product Verify → Ready for Release → Release PR `dev → main` → Human Release Approval → Production Smoke.
- Keep initiative-specific branch names and full initiative contracts out of `AGENTS.md`; store them in the Parent Issue / Sub-issues.

## Branch and release model

### Default lifecycle

The default path remains:

Quick reference:

`Feature → Engineering Ready for Review → Technical Review → Integration Approval → dev → Dev Preview → Product Verify → Release PR → Release Approval → main → Production Smoke`

```text
Issue
→ scoped branch from latest dev
→ implementation + local/browser QA
→ commit + push
→ Engineering Ready for Review Issue comment (or handoff fallback)
→ ChatGPT Technical Review
→ Feature PR: scoped branch → dev
→ Human Integration Approval
→ merge to dev
→ Dev Preview / staging (/dev/)
→ Human Product Verify
→ Ready for Release (Issue remains open)
→ Release PR: dev → main
→ Human Release Approval
→ merge to main
→ Production Smoke
→ Done / Close Issue
```

### Optional Epic Integration Branch lifecycle

Use this only when the Parent Issue contains the explicit Human decision enabling it.

```text
Parent Issue enables Epic Integration Branch
→ Sub-issue scoped branch from latest Epic Integration Branch
→ implementation + local/browser QA
→ Engineering Ready for Review
→ ChatGPT Technical Review
→ Sub-issue PR: scoped branch → Epic Integration Branch
→ Human Epic Integration Approval
→ merge to Epic Integration Branch
→ aggregate checkpoints / dev sync as needed
→ final aggregate QA + sync current dev
→ PR: Epic Integration Branch → dev
→ Human Integration Approval
→ merge to dev
→ Dev Preview / staging
→ Human Product Verify
→ Ready for Release
→ Release PR: dev → main
→ Human Release Approval
→ merge to main
→ Production Smoke
→ Done / Close Issue
```

Feature and Sub-issue PRs may use squash merge. Release PRs should normally use a normal merge so `dev` ancestry is preserved.

After a release, sync `dev` to the latest `main` with a fast-forward when safe. If it cannot fast-forward, inspect branch history first; never force blindly.
