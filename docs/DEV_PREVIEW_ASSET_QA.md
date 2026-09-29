# Issue #78 — deployed Dev loader asset resolution rework

Baseline: `origin/dev` at `45dbf54` (PR #99). Scoped branch:
`codex/fix-issue-78-dev-asset-resolution`.

## Change

`bundledAssetUrl()` preserves explicit `window.__IPAS_DEV_RAW_BASE__` precedence.
Without an override, only `naiyi-chia.github.io/IPAS-AI-trainer/dev/` (including
its document paths) falls back to the raw `dev` branch. Production at
`/IPAS-AI-trainer/`, other hosts, localhost and unrelated paths retain relative URLs.
No loader release on main is required for this app-side fallback.

No changes to canonical data, visual files, Question IDs, answers, migration,
`dev/index.html` or `main`.

## Regression reproduction and results

`scripts/fixtures/issue78-main-dev-loader.html` is the unchanged deployed loader
from main commit `9b7de563845ed875de7eb7716e6145157d00182c`, path `dev/index.html`.
The fixture contains no raw-base injection. Its Git blob matches the main source.

The new browser test uses the real GitHub Pages origin/path in a fresh isolated
context. It executes this loader, intercepts its raw-dev app request with candidate
app bytes, and serves bundle/images only at the expected destinations. Incorrect
Pages `/dev/data/` and `/dev/assets/` requests receive HTTP 404; unmatched requests
also fail. This does not replace the loader with the newer dev loader.

Before the fix: the actual loader scenario failed with `內建考古題資料 HTTP 404`.
After the fix, all scenarios PASS:

| Scenario | Viewport | Result |
|---|---|---|
| Main legacy loader, no injection | 1280×900 | schema 3, 14 papers, 700 records, all 63 images loaded |
| Main legacy loader, no injection | 375×900 | same coverage, no horizontal overflow |
| Production repo-relative paths | 1280×900 | same coverage; no raw-dev requests |
| Explicit override on legacy loader | 1280×900 | override wins; same coverage |

All cases render and decode both shared-context and question-specific images;
zero HTTP 404 responses and page errors. Resolver matrix also checks non-preview
paths, other hosts, localhost, document URLs and production override precedence.

## Repeatable checks

Using existing Playwright via `NODE_PATH` and installed Edge (or `BROWSER_CHANNEL`):

```powershell
node scripts/test_dev_asset_resolution.cjs
node scripts/test_official_bundle_browser.cjs
node scripts/test_past_progress_migration.cjs
node scripts/test_past_answer_feedback.cjs
python scripts/build_official_past_bundle.py --check
git diff --check
```

All PASS. Existing browser suite covers desktop/375px practice, mock submit/review,
all paper loads, direct/shared/wrong-question flows, progress/stats, seeded actual
migration and reload idempotence, tabs, images, overflow and newer-loader behavior.
App/fixture inline JavaScript and new test syntax checks also PASS.

These are intercepted-network engineering tests, not a claim that the unmerged
branch is deployed. Product Verify remains failed pending Human retest on the
integrated public Dev Preview. No merge, release or main update was performed.
