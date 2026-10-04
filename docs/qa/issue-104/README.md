# Issue #104 Engineering QA

Baseline: `dev@d06c7cebb747d3a5c9d9d6fc9e64eeacb63218f1`.
Branch: `feat/issue-104-source-aware-weakness`.
QA: 2026-10-04, local static server, headless installed Microsoft Edge, 1280×900 and 375×900.

## Results

- `scripts/test_source_aware_weakness.cjs`: PASS at both viewports. Cold saved official attempts block partial analysis/weak selection until trusted metadata loads; existing state remains unchanged. Fourteen aggregation/selection checks cover official-only, self-authored-only, mixed equal question weighting (1 official correct + 9 self-authored wrong = 10%), insertion order independence, latest-result replacement, 1–2 sample confidence, 2/3 weak, exact 70% non-weak, 60% weak, maximum four fallback topics, empty evidence, no matching drill, self-authored drill boundary and fallback session wording. Source counts, canonical chapter labels and section review links verified.
- Deliberate HTTP 503: visible loading failure, no partial diagnosis/drill, button restored, successful retry and preserved progress. This is an intentional negative test; normal browser runs have zero JavaScript/HTTP errors.
- Practice answer/navigation, mock submission/scoring/review, official and self-authored wrong-book entries, wrong-book drill, official paper answer/progress and every tab: PASS. Neither viewport introduces page horizontal overflow.
- `scripts/test_official_bundle_browser.cjs`: PASS at both viewports, including progress migration, scoring, practice/mock, shared contexts, tabs, overflow and intercepted Dev loader/storage isolation.
- `scripts/test_dev_asset_resolution.cjs`: PASS for intercepted legacy Dev loader at both viewports, and production route / explicit asset-base override at 1280px; schema 4 / 700 records / 63 image assets and no 404.
- `scripts/test_official_competency_runtime.cjs`: PASS full inline JS syntax, 700 mappings/content/scoring/provenance, stable IDs and ten negative loader controls.
- `scripts/test_past_answer_count.cjs`, `scripts/test_past_progress_migration.cjs`, `scripts/test_past_answer_feedback.cjs`: PASS.
- `git diff --check`: PASS.

## Visual evidence

- [Desktop combined diagnosis](weakness-1280.png)
- [375px combined diagnosis](weakness-375.png)

Both screenshots were visually reviewed. The canonical small chapter and combined result lead the diagnosis, source counts sit below, and paper-level progress remains a separate secondary card.

## Reproduction

Use Node.js with Playwright available through `NODE_PATH` and installed Edge (`BROWSER_CHANNEL` can override). From the repository root:

```powershell
node scripts/test_source_aware_weakness.cjs docs/qa/issue-104
node scripts/test_official_bundle_browser.cjs
node scripts/test_dev_asset_resolution.cjs
node scripts/test_official_competency_runtime.cjs
node scripts/test_past_answer_count.cjs
node scripts/test_past_progress_migration.cjs
node scripts/test_past_answer_feedback.cjs
git diff --check
```

No production deployment or Product Verify is claimed. Local browser tests exercise branch content, including intercepted Dev asset routing. Canonical official content/mapping and persistence format are unchanged; no new dependency is added to the application.
