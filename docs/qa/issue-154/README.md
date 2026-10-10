# Issue #154 — Engineering QA

Baseline: `dev@8894fac9267f558dd2c5448c07a8bd45a51ac095`. Branch: `ux/issue-154-practice-topic-reveal`.

App change is limited to the Practice topic label in `index.html`: emit an empty label until the question is answered in the current round; reveal the original label through the existing answer restoration path. Persisted `state.attempts` retains the existing history status but never makes the topic reveal-eligible in a new round. No question data, storage schema or scoring changes.

Rework on 2026-10-10 addresses Technical Review FAIL on `f1de7ad`: the original `current || past` condition incorrectly exposed topics for historical answers. The condition now uses only `current`. The assertions and screenshots below supersede the original historical-answer QA expectation.

## Verification

Installed Edge, local HTTP, fresh isolated profiles at 1280×900 and 375×900.

- PASS: unanswered label text is empty in the DOM, with no topic text/attribute fallback. Difficulty, question number and progress remain visible.
- PASS: correct and incorrect choices immediately reveal the exact original subject/topic/name label; answer feedback, explanation, four disabled options and progress update normally.
- PASS: next unanswered question has an empty label; previous answered question retains its label and restored selection.
- PASS: bookmarking before answering does not reveal the topic. Historical answers, persisted answers after reload, and starting another round all keep the topic empty until a current-round answer; `曾作答` history remains visible.
- PASS: the actual Practice `wrong` filter starts with historical wrong answers and empty topics. Incorrect answers immediately reveal the original label; next hides and previous retains the current-round label.
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
node scripts/test_practice_topic_reveal.cjs
git diff --check
```

Targeted topic QA is reproducible in `scripts/test_practice_topic_reveal.cjs`. It uses two canonical questions, isolated browser contexts, real option/button clicks, correct/incorrect answers, previous/next, bookmark, a new round, reload, and Practice wrong mode. Updated screenshots show a historically attempted question before and after its current-round answer. No new dependency was added.

Limits: local Edge evidence; physical Safari and integrated Dev Preview Product Verify are not claimed. Engineering handoff only; no merge or release.
