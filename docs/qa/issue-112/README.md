# Issue #112 — Engineering QA

Baseline: `dev@b99d89ac8d46114dfdc24ff56652e700e3f5c963` after #14 final integration. Branch: `maint/issue-112-canonical-practice-bank`.

## Migration

- PASS: parsed subjects/topics/questions exactly equal the baseline embedded DB, including order, wording, sourceType, metadata, answer indices and all 483 unique IDs.
- Canonical-content SHA-256 (sorted keys, compact UTF-8 JSON): `e02ebd21d309cfa0c3e47c05af61f141215bb31d49fd608af72e1970fd34092f`.
- `data/practice-questions.json` is the only maintained dataset; App and audits consume it directly. No build step, dependency, generated bank, official-data change or progress-schema change.
- PASS validator and negative controls: required fields, IDs/duplicates, mapping/names/levels, difficulty, four valid unique options, integer answer indices, empty content and official-content boundary.
- PASS exact before/after audit rows and summaries. Current audit: {"total": 483, "unique_ids": 483, "unique_longest": 52, "ratio_ge_2": 0, "ratio_ge_3": 0, "repeated_groups": 0, "repeated_questions": 0, "answers": {"A": 131, "B": 109, "C": 122, "D": 121}}.

## Browser QA

Installed Edge via existing Playwright, fresh isolated profiles, local HTTP. Desktop 1280×900 and mobile 375×900.

- PASS delayed JSON: loading status, seven disabled tabs, no DB-dependent controls; state unchanged; initialization only after successful fetch.
- PASS 5 subjects: 10-question medium-filter Practice sessions, answering/scoring/navigation; each subject 50 unique Mock questions, original 75/90-minute timer, ticking, 100% score, review, stopped timer after submission.
- PASS ID-based wrong lookup, weak-area/stats, all scope topics, all seven tabs and no page horizontal overflow. Reload preserves saved attempts/wrong/bookmarks/exam history.
- PASS HTTP 503, network abort, invalid JSON and invalid top-level shape: explicit failure and successful retry, tabs gated and progress preserved.
- PASS existing source-aware weakness QA: 14 aggregation/selection cases, official cold load/recovery, no-drill and preservation.
- PASS existing official bundle browser QA: 700 questions, shared-context and wrong-question rendering, official migration/scoring and isolated Dev loader.
- PASS existing cache upgrade regression: schema-v3 cache revalidated to schema v4 at both widths.
- PASS asset resolver: local relative paths, simulated production Pages, old main `/dev/` loader at both widths, explicit raw-base override. Canonical practice JSON and official assets resolve to the expected branch; no main `/dev/data/` requests or 404s.
- PASS representative updated Batch 5B fixture at both widths: 12 Practice + Mock items, wrong/retry/stats/official/tabs and native confirmation. All nine batch fixtures use the same canonical JSON fixture adaptation; all CJS files compile.
- PASS all application JavaScript syntax, 700 official competency runtime mappings and 10 negative loader controls.
- PASS `git diff --check`. Mobile scope screenshot visually inspected; desktop screenshot retained.

## Reproduce

```powershell
python scripts/validate_practice_questions.py
python scripts/test_practice_bank.py
python scripts/audit_question_cues.py
# Existing Playwright must be resolvable via NODE_PATH; defaults to installed Edge.
node scripts/test_practice_bank_browser.cjs docs/qa/issue-112
node scripts/test_dev_asset_resolution.cjs
node scripts/test_source_aware_weakness.cjs
node scripts/test_official_bundle_browser.cjs
node scripts/test_past_bundle_cache_upgrade.cjs
node scripts/test_official_competency_runtime.cjs
node scripts/test_question_batch5b.cjs
```

## Limits

Production/Dev Preview tests intercept remote URLs with this scoped branch's bytes. This change is not integrated or deployed; actual integrated Dev Preview Product Verify and post-release Production Smoke remain later gates. No physical-device Safari test. Older pre-migration cue-bias reports can be reproduced from their historical checkout; current audit `--baseline` expects canonical JSON in the chosen Git ref.

Screenshots: [mobile scope](scope-375.png), [desktop scope](scope-1280.png).
