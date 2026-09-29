# Official bundled-paper source audit — Issue #78

This replaces the old runtime-parser/mirror audit. It is ingest/regression tooling;
`index.html` has no PDF.js/parser/mirror dependency. No runtime packages were added.

## Repeatable commands

Requires Python standard library and Node. Run from the repository root:

```powershell
python scripts/fetch_official_audit.py "$env:TEMP/ipas-78-audit"
python scripts/build_official_past_bundle.py --check
node scripts/audit_official_pdf.cjs "$env:TEMP/ipas-78-audit"
node scripts/test_official_bundle_audit.cjs "$env:TEMP/ipas-78-audit"
node scripts/test_past_progress_migration.cjs
git diff --check
```

Use any writable input directory on other platforms. The fetch step refreshes
all 14 official PDFs directly from the app's iPAS URLs plus the existing audit
PDF.js 3.11.174. It no longer fetches a mirror. Reusing downloads is an offline
regression run; rerun the fetch command to check current upstream sources.
The audit writes `bundle-audit.json` to that input directory and exits nonzero
on an unrecorded difference. Its optional second argument is a candidate bundle,
not the legacy HTML baseline argument.

## Coverage and immutable evidence

`OFFICIAL_BUNDLE_SOURCE_BASELINE.json` pins official filenames/PDF SHA-256 hashes,
700 canonical record hashes, 63 asset hashes, and exact field-level differences.
The PDF hashes were independently matched to the existing #43 source fingerprints.
Record hashes preserve the existing c0a22d5 verified snapshot, not new transcriptions.
The normal builder cannot rewrite this audit baseline. A baseline update requires
source review and an Issue decision; never regenerate it just to make a failure pass.

Each run extracts the actual PDF again and verifies:

- 14 distinct papers, official source URLs and filenames; app/bundle session agreement.
- Official question/answer cells 1–50 per paper, including fullwidth answers and split digits.
- All 700 answers against those cells; all 700 actual runtime canonical IDs and their record identities.
- All 3,500 stem/option fields using Unicode NFKC, whitespace removal and terminal option-semicolon normalization. Operators, case, digits and other punctuation are preserved.
- 47 visual rows against the existing verified manifest and source filenames; all 63 asset bytes.
- Recorded question-page provenance, with one explicit shared-context exception described below.
- Known differences are exact source/bundle pairs, not blanket visual-question skips; new changes on either side fail. Whole-record hashes also protect fields the text comparator cannot verify.

## Results and limitations (2026-09-29)

PASS **regression**, with 700 official answer/identity checks, 3,446 matching text
fields and 54 pinned differing fields. This does **not** certify verbatim equivalence
of all existing content. Full source and bundle strings and reasons are in the
baseline's `exceptions` section, keyed by canonical ID and field.

Differences include image-only code/formula transcription, shared context following
an option D, typography, and **real pre-existing wording differences**. For example,
115-1-L22 Q43 stem/A and Q44 stem omit/rewrite official wording; Q45 prepends a
summarized shared context. 115-1-L23 Q49 also prepends a context summary. These remain
unchanged under this rework's content-preservation boundary and require content
review before anyone claims full wording fidelity. Visual-manifest membership is
provenance, not proof that an image and text are semantically equivalent. No OCR or
new human visual verification of all 47 rows is claimed.

114-2-L23 Q46 records page 14 (shared context), while the actual numbered question
starts on page 15. The existing verified manifest explicitly includes shared-page
assets for both pages. The audit pins this one exception; it does not silently
expand every question's page range or alter the canonical snapshot.

The baseline and comparator intentionally protect against regression, not a
malicious simultaneous rewrite of both data and evidence. Changed official PDF
bytes require review even when extracted text would be unchanged. NFKC/whitespace
comparison does not prove code indentation/layout equivalence; record/asset hashes
protect existing representations in those cases.

Negative controls PASS: altered answers, reordered identities, changed ordinary
wording, changed known-exception wording, missing visual mapping, wrong session and
changed source PDF all cause audit failure.

## Other validation

- Generator syntax and deterministic `--check`: PASS. CRLF inside CSV quoted cells
  is normalized to LF so Windows regeneration preserves the committed question strings.
- All 700 question objects equal the original c0a22d5 bundle. Generated JSON diff
  contains only the two 115-2 session corrections; 114 metadata stays unchanged.
- Existing #72 migration regression: PASS; migration/runtime files unchanged.
- App and Dev loader inline JavaScript syntax: PASS.
- Local headless Edge, isolated fresh profiles, 1280×900 and 375×900: PASS for
  practice start/answer/navigation, mock start/answer/submit/review, bundled paper
  load (50 questions), official wrong-answer scoring/persisted progress, wrong view,
  stats, visual image loading, every tab and horizontal-overflow checks.
- Browser page errors: zero; external requests: zero during these runtime flows.
- Static check confirms no runtime PDF parser, PDF.js or structured mirror symbols.
- `git diff --check`: PASS.

Browser QA was local, not the deployed integrated Dev Preview or iPhone Safari.
This is engineering evidence, not Product Verify, integration, release or production smoke.
