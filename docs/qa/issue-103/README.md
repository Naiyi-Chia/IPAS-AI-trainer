# Issue #103 Engineering QA

Validated locally on 2026-10-03 using Python 3.12, Node.js, Playwright and installed headless Edge. Existing branch `data/issue-103-official-topic-mapping` was merged with `origin/dev` at `be74e19` without conflicts (merge `fd35a9c`).

## Data integrity

- Applied only the 50 approved `115-3-L12` status changes recorded in [the final mapping handoff](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/103#issuecomment-5966843585). Reverting those status cells reconstructs source Git blob `c7965e35d8e7da4bd5457ae99525296921a4fe46` exactly after Git's CRLF normalization.
- Canonical A:X SHA-256 remains `e7476f1d5270822de66ba15e13c27d4e84a57349bc216d195e6bf8814d058118` (LF-normalized fingerprint regression).
- Comparing the regenerated bundle with `origin/dev`, all 700 question objects match after removing only the three added competency fields; all paper metadata and 12 shared contexts match exactly.
- Strict audit: 700 mapped / 700 verified / 0 unmapped, invalid topics and cross-subject mismatches both zero. Distribution by paper, subject and topic: [competency-distribution.json](competency-distribution.json).
- Deterministic schema v4 rebuild: 14 papers, 47 visual rows, 63 unique assets, 12 shared contexts and 36 dependent questions.

## Reproducible checks

All commands below pass from the repository root:

```text
python scripts/audit_official_competency_mapping.py --require-verified
python scripts/build_official_past_bundle.py --check
python scripts/test_official_past_bundle.py
node scripts/test_official_competency_runtime.cjs
node scripts/test_past_answer_feedback.cjs
node scripts/test_past_answer_count.cjs
node scripts/test_past_progress_migration.cjs
node scripts/test_official_bundle_browser.cjs docs/qa/issue-103
node scripts/test_dev_asset_resolution.cjs
git diff --check
```

The browser commands require Playwright in `NODE_PATH` and installed Edge (or `BROWSER_CHANNEL`). No application dependency was added.

- Nine Python contract tests include content fingerprint, subject ownership, missing headers, unverified/needs-review/invalid/cross-subject mapping rejection and strict-audit negative controls.
- Runtime test compiles all inline JS, checks all 700 IDs/content/options/answers/provenance/mappings, feedback paper titles, stable-ID lookup of legacy attempts, and ten invalid-loader controls. A rejected bundle exposes no partial question index.
- Existing answer feedback, answered count and canonical-progress migration regressions pass. No new storage migration is introduced by #103.
- Browser smoke at 1280px and 375px: all 14 papers open; all 36 shared-context dependents render directly and in wrong-question practice; resume/scoring/persistence, practice answer/navigation, mock submit/review, all seven tabs and no horizontal overflow pass. Zero page JS errors and zero external requests in the local smoke.
- Existing attempts classify through the new runtime topic without rewriting stored attempt metadata. Stats/wrong views preserve state; official attempts still do not affect self-authored weak-practice selection. No #104 aggregation change is included.
- Asset-path regression: legacy Dev loader at both widths, production path and explicit override each load schema v4 and all 63 unique images with no 404/overflow. Dev-loader storage isolation passes using intercepted branch bytes.
- Screenshots inspected: [desktop](shared-1280.png) and [mobile](shared-375.png).

These are local Engineering checks, including simulated deployment paths; live Dev Preview, Product Verify and Production Smoke remain separate downstream checks.
