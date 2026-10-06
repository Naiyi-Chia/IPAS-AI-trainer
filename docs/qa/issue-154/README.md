# Issue #154 — Engineering QA

Baseline: `dev@8894fac9267f558dd2c5448c07a8bd45a51ac095`. Branch: `ux/issue-154-practice-topic-reveal`.

App change is limited to the Practice topic label in `index.html`: emit an empty label for an unrecorded answer; reveal the original label through the existing answer restoration path. Both current-round answers and existing `state.attempts` count as answered when revisiting. No question data, storage schema or scoring changes.

## Verification

Installed Edge, local HTTP, fresh isolated profiles at 1280×900 and 375×900.

- PASS: unanswered label text is empty in the DOM, with no topic text/attribute fallback. Difficulty, question number and progress remain visible.
- PASS: correct and incorrect choices immediately reveal the exact original subject/topic/name label; answer feedback, explanation, four disabled options and progress update normally.
- PASS: next unanswered question has an empty label; previous answered question retains its label and restored selection.
- PASS: bookmarking before answering does not reveal the topic. Existing historical answers and persisted answers after reload show their label; saved records remain unchanged by viewing.
- PASS: desktop/mobile screenshots inspected, no page horizontal overflow or JavaScript errors.
- PASS existing source-aware weakness browser QA: both widths, 14 aggregation/selection cases, official cold-load/retry, no-drill, scoring/navigation and record preservation.
- PASS existing official bundle browser QA: both widths, direct/shared/wrong contexts, migration/scoring/Practice/Mock/tab smoke and isolated Dev loader.
- PASS full App JS syntax and official competency runtime checks (700 mappings, 10 negative controls).
- PASS `git diff --exit-code origin/dev -- data`; `git diff --check`.

Evidence: [mobile before](before-375.png), [mobile after](after-375.png), [desktop before](before-1280.png), [desktop after](after-1280.png).

Existing regression commands:

```powershell
# Existing Playwright via NODE_PATH; installed Edge is the default.
node scripts/test_source_aware_weakness.cjs
node scripts/test_official_bundle_browser.cjs
node scripts/test_official_competency_runtime.cjs
git diff --check
```

Targeted topic QA used three canonical questions (unrecorded privacy topic, unrecorded AI topic, historically answered generative-AI topic), an isolated seeded profile, real option clicks/keyboard activation, previous/next, bookmark and reload. No persistent test fixture or new dependency was added.

Limits: local Edge evidence; physical Safari and integrated Dev Preview Product Verify are not claimed. Engineering handoff only; no merge or release.
