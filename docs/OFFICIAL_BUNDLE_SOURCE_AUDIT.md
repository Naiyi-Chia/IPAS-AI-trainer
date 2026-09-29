# Official bundled-paper source audit — Issue #78

The current bundle implements the #72 Human-approved flat-master/shared-context
contract. Source decisions: [schema](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/72),
[VGG16 full-text preservation](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/72#issuecomment-5884191731),
[master ready for ingest](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/72#issuecomment-5885921154).
This is ingest/regression tooling; production has no PDF.js/parser/mirror dependency.

## Repeatable checks

Python standard library and Node, from repository root:

```powershell
python scripts/fetch_official_audit.py "$env:TEMP/ipas-78-audit"
python scripts/build_official_past_bundle.py --check
python -B scripts/test_official_past_bundle.py
node scripts/audit_official_pdf.cjs "$env:TEMP/ipas-78-audit"
node scripts/test_official_bundle_audit.cjs "$env:TEMP/ipas-78-audit"
node scripts/test_past_progress_migration.cjs
node scripts/test_past_answer_feedback.cjs
git diff --check
```

Use any writable input directory on other platforms. Fetch refreshes all 14 iPAS
PDFs and the existing PDF.js 3.11.174 audit dependency. An offline run against saved
PDFs is a regression run; fresh fetches also detect current upstream changes.
The audit writes `bundle-audit.json` to the input directory and fails on unrecorded
differences. Its optional second argument is a candidate JSON bundle.

Optional repeatable browser QA uses an existing Playwright installation (available
through `NODE_PATH`) and installed Edge, with no new application dependency:

```powershell
node scripts/test_official_bundle_browser.cjs "$env:TEMP/ipas-78-browser"
```

`BROWSER_CHANNEL` can select another installed Playwright-supported channel.
The script creates an isolated localhost server and fresh browser profiles.
Screenshots are optional; omit the output-directory argument to skip them.

## Source snapshot and schema 3

Live canonical sheet `AI應用規劃師_歷屆試題總表(700題)`, A1:X701, was read on
2026-09-29. CSV equality to all 700 live rows was checked after only CRLF/CR-to-LF
and trailing-line-whitespace normalization. No wording was changed during ingest.
Rows below the canonical block are blank; `archive_duplicate_rows` is excluded.
The master already contains the Q43/Q44 wording corrections, removal of Q45/Q49
summary prefixes, typography fixes and shared-asset deduplication.

- 700 verified questions, 14 papers × 50; unchanged canonical IDs and answers.
- 12 shared contexts, 36 dependent questions. `shared_contexts` stores each group
  once; questions store a nullable `shared_context_id`.
- Shared context includes its owning paper, complete official text, source pages
  and shared images. Question-specific images remain on questions.
- Builder rejects inconsistent repeated group text/pages/assets, missing IDs,
  invalid page ranges, duplicate shared/question images, invalid paths and
  unverified rows. CRLF/LF variants generate identical JSON.
- 47 visual-dependent rows and 63 unique assets remain. The previously replaced
  115-1-L22 Q48–50 image is preserved byte-for-byte from branch head `63d6ae5`.
- VGG16 full model-summary text remains in shared context for 114-2-L23 Q42–45.
  Its supplemental image does not replace or truncate the table.
- Bundle schema 3 is independent of progress migration version 2. No migration
  map, storage key, backup semantics, marker or exam-history behavior changed.

## Official-source audit coverage

The audit re-extracts each pinned official PDF and checks all 700 official
question/answer cells and actual runtime IDs. It checks 3,500 stem/option fields
using NFKC, whitespace removal and terminal option-semicolon normalization;
operators, case, digits and other punctuation are preserved.

All **12 shared-context texts match their recorded official page ranges**, including
the full VGG16 table. Runtime resolution, group ownership, all 36 references,
shared manifest pages/assets and absence of duplicate images are checked.

`OFFICIAL_BUNDLE_SOURCE_BASELINE.json` pins the normalized master CSV, all 700
records, all 12 contexts, official PDF fingerprints and all 63 image fingerprints.
`OFFICIAL_VISUAL_ASSET_MANIFEST.json` v2 separates question and group provenance
while retaining existing per-asset capture records. The builder cannot overwrite
the baseline. Evidence updates require source review, not automatic re-baselining.

### Results and remaining extraction limits

PASS: 700 answers/identities; **3,456 matching question text fields**; **44 exact
remaining extraction/typography pairs**. All 44 pairs are identical to the prior
reviewed evidence. **10 resolved exceptions were removed; none added or relaxed.**
In particular, 115-1-L22 Q43 stem/A and Q44 stem now match the official PDF, as do
the corrected Q45/Q49 per-question stems and the flagged typography fields.

Remaining pairs include image-only code/formula transcriptions, adjoining shared
context/section/end-of-paper furniture and minor typography. Full source/bundle
strings remain in `exceptions`; visuals rely on #72 Human verification plus the
verified asset manifest and immutable source/asset hashes, not an OCR equivalence
claim. A pinned pair does not authorize a future wording discrepancy.

114-2-L23 Q46 still records question pages 14–14 in the master although its numbered
cell begins on p15. This existing provenance exception remains explicit: shared
context covers pp14–15 and the manifest includes both pages. No source-page cells
were silently rewritten during ingest.

NFKC/whitespace comparison cannot establish visual layout or code indentation
correctness by itself. Changed PDF bytes require review even if text is unchanged.
The audit is a regression gate, not protection against simultaneous malicious
rewrites of both dataset and evidence.

## Engineering validation

- Deterministic build, Python/JavaScript syntax and all commands above: PASS.
- Negative controls reject answer/identity/text/visual/session/PDF drift, changed
  shared text/pages/assets, missing groups, wrong group ownership and inconsistent
  duplicated flat-master metadata. Source/bundle/model counts remain enforced.
- Local Edge, 1280×900 and 375×900: every one of 36 dependent questions renders
  its full shared context when opened directly and through wrong-question practice.
  Shared and question images are separate and never duplicated in the rendered question.
- All 14 paper loads; progress-driven resume directly at Q44; persisted scoring;
  wrong-answer/retry integration; stats; ordinary practice; mock submit/review;
  tabs; image loading; keyboard-native context disclosure; no horizontal overflow.
- Actual runtime migration seeded with all 50 entries in both affected papers:
  snapshot backup, cycle-safe remap, correct/last/custom metadata preservation,
  wrong/bookmarks, unaffected paper, unchanged exam history, cache retirement and
  reload idempotence: PASS. Existing migration and answer-feedback tests also PASS.
- Browser errors: zero; normal runtime external requests: zero.
- The Dev loader had an existing double-escaped script-end tag that produced
  malformed injected HTML. Corrected the escape; the real loader now passes a
  local test with raw-dev requests intercepted to this branch's bytes. Schema 3,
  raw asset URL resolution and `dev:` storage isolation PASS.
- Source diff confirms migration functions/maps and image bytes unchanged.
- `git diff --check`: PASS.

This is local engineering QA. It does not verify the deployed integrated Dev
Preview, iPhone Safari, Product Verify or production. No integration/release implied.
