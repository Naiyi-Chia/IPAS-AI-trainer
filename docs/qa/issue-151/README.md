# Issue #151 — Engineering QA

Baseline: latest `dev@dd1f8e0f2cca9f7813f67d43c9b8fffdd586bba2`. Branch: `ux/issue-151-simplify-practice-entry`.

Changed `index.html` and three existing browser QA scripts to follow the reduced navigation and settings. No data files or answer/scoring/storage routines changed.

## Verification

- PASS: header subtitle removed, overview absent from navigation and panels, Practice is selected at startup.
- PASS: exactly three labeled settings (subject / mode / count), all five subjects remain available. Level/difficulty filters and their obsolete overview shortcuts removed; sessions use all difficulties for the selected subject.
- PASS: Edge 1280×900 and 375×900 screenshots visually inspected. Existing layout/styles retained; no page horizontal overflow.
- PASS: keyboard Home/End navigation follows the six remaining tabs. Starting another round focuses subject; settings can be adjusted and restarted.
- PASS: each of five subjects starts a 10-question Practice session; answer, scoring and navigation work. Wrong-only and unanswered selection preserve ID-based semantics; a corrected answer removes its wrong ID.
- PASS: each of five subjects starts a 50-question Mock with unique IDs; original timer, 100% scoring, stopped timer and review work at both widths.
- PASS: existing weak-area browser QA at both widths: 14 aggregation/selection cases, official cold-load/retry, state preservation and tab/scoring smoke.
- PASS: existing official-paper flow opens 50 questions; wrong/stats/scope and all six tabs render. Reload preserves progress.
- PASS: delayed startup, HTTP/network/JSON/shape errors and retries render in Practice and preserve records.
- PASS: full App JavaScript syntax and official competency runtime checks (700 mappings and 10 negative controls).
- PASS: `git diff --exit-code origin/dev -- data` and `git diff --check`.

## Reproduce

```powershell
# Existing Playwright via NODE_PATH; installed Edge is the default.
node scripts/test_practice_bank_browser.cjs docs/qa/issue-151
node scripts/test_source_aware_weakness.cjs
node scripts/test_official_competency_runtime.cjs
git diff --check
```

Evidence: [desktop entry](practice-entry-1280.png), [mobile entry](practice-entry-375.png).

Limits: local HTTP / installed Edge QA, no physical-device Safari or integrated Dev Preview Product Verify. This is implementation evidence; the scoped branch has not been merged or deployed.
