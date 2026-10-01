# AGENTS.md

## Project

IPAS AI Trainer is a single-page static iPAS AI 應用規劃師 practice tool published with GitHub Pages.

- Main application: `index.html`
- Production site: `https://naiyi-chia.github.io/IPAS-AI-trainer/`
- Vanilla HTML / CSS / JavaScript; no build system or framework is currently required.
- UI copy is primarily Traditional Chinese (Taiwan usage).
- `main` is the production / deploy branch.
- `dev` is the integration + staging / Dev Preview branch.

Cross-project workflow governance is defined by the latest canonical AI Product Development Playbook in `Naiyi-Chia/naiyi-product-playbook`.

## Task contract and context retrieval

The relevant GitHub Issue is the Source of Truth for each development task.

Before changing code or repo files:
1. Read the task Issue and treat its Goal, Scope, Expected Behavior, Constraints, Acceptance Criteria, and any explicit base / target branch contract as authoritative.
2. Use the applicable repo instructions in this file.
3. Inspect only the implementation and evidence relevant to the current task.
4. Load additional context only when materially required.

Conditional context:
- Parent Issue: when the Sub-issue contract is insufficient or epic coordination / checkpoint context is required.
- `PROJECT_CONTEXT.md`: when stable product or repository context is needed and is not already sufficiently defined by the task.
- Canonical Playbook: when workflow interpretation, governance, responsibility boundaries, or rule conflicts need resolution.

Do not preload these sources merely because they exist. If sufficiently fresh and authoritative context is already available, reuse it instead of retrieving it again.

If Scope, Expected Behavior, or Acceptance Criteria changes during implementation, stop expanding the change and update the GitHub Issue first.

Context efficiency must not override correctness: if required evidence is missing, read the authoritative source instead of guessing.

## Baseline and branch

- Default task baseline: latest `dev`.
- Use another base / target only when the task contract explicitly records it.
- An Epic Integration Branch is an exception and must be explicitly enabled by the Human and recorded in the applicable Issue contract.
- Confirm the working tree is clean before editing.
- Create a scoped branch such as:
  - `feat/issue-N-short-name`
  - `fix/issue-N-short-name`
  - `ux/issue-N-short-name`
  - `question/issue-N-short-name`
  - `maint/issue-N-short-name`

## Editing rules

- Keep changes scoped to the Issue and prefer small, reviewable diffs.
- Keep the current vanilla HTML / CSS / JavaScript architecture unless the Issue explicitly requires an architecture change.
- Preserve mobile usability and basic accessibility.
- Do not remove or change existing user progress / localStorage behavior unless explicitly requested.
- Do not add external dependencies unless the need is documented in the Issue.
- Avoid unrelated refactors, formatting changes, or duplicate implementations.

### Question-bank and official-content rules

When the task touches question-bank or exam content:
- Clearly distinguish official iPAS past-paper questions / official answers from self-authored practice questions.
- Do not modify official past-paper wording, answer keys, source attribution, or exam metadata unless the Issue concerns a verified transcription / parsing / source error.
- Verify official-content changes against the authoritative iPAS official page / PDF before changing content.
- Do not present self-authored questions as official exam questions.
- Preserve question ID, mapped level / subject / competency topic, answer, explanation, and source consistency.
- Question-content changes must have dedicated question-content scope in the Issue.

## Validation

Run checks relevant to the changed scope. Prefer targeted validation and concise output when sufficient; do not emit unnecessarily broad logs, audits, or checks.

For UI / JavaScript changes, normally verify:
- the page loads without obvious JavaScript errors;
- the affected practice flow can start, answer, and navigate correctly;
- affected mock-exam / review / past-paper flows still work where relevant;
- affected wrong-question / weak-area / navigation views still render normally where relevant;
- the changed feature works on a desktop-sized viewport;
- the changed feature remains usable on a mobile-sized viewport (around 375px where relevant);
- no unintended horizontal scrolling is introduced;
- `git diff --check` passes.

For question-bank changes, additionally verify:
- question-count changes are intentional;
- correct option and explanation remain consistent;
- official vs self-authored labeling remains correct;
- no obvious duplicate question IDs are introduced;
- a representative sample renders and scores correctly in practice / mock mode.

Use broader regression checks only when the changed scope or risk justifies them.

## Completion and handoff

When implementation is ready:
1. Review the final scoped diff.
2. Run relevant QA / smoke checks.
3. Run `git diff --check`.
4. Commit and push the scoped branch.
5. If GitHub Issue-comment permission is available, post concise Engineering Ready evidence using `<!-- engineering-ready-for-review -->`; otherwise report the same concise evidence in the current handoff channel.

Engineering Ready evidence should include only what is needed to support review:
- Issue number;
- branch / commit SHA;
- changed scope / files;
- relevant validation and results;
- durable evidence / artifact reference when one exists;
- known limitations / blockers;
- final working-tree / remote-sync state when relevant.

Do not restate Goal / Scope / Expected Behavior / Acceptance Criteria already owned by the Issue. Reference durable artifacts instead of pasting large logs, audits, CSVs, or reports.

Engineering implementation stops at handoff. Follow the latest canonical Playbook and applicable repo governance for Technical Review, integration, Product Verify, release, Production Smoke, and Issue closure. Do not independently bypass any required Human decision.
