# Official PDF contamination audit — Issue #43

## Status and scope

The page-furniture fix and 14-paper scan are complete for the clarified [Issue #43](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/43) scope. The Human-confirmed boundary/numbering follow-up is [Issue #72](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/72); those defects are intentionally unchanged. No PR, merge, Product Verify, or production verification is implied.

Baseline: `3c2c369` (latest `dev` fetched before branch creation). Branch: `fix/issue-43-official-pdf-contamination`.

## Root cause and change

`PAST-115-3-L11-4` spans PDF pages 1–2. Option A absorbed the next page's publication heading, subject, date, page counter and table heading. NFKC converts fullwidth colons/commas to ASCII, while the old regexes still expected fullwidth punctuation. PDF glyph-run spacing also defeated subject/header matches; the partial year/title match left `】` behind.

A shared cleanup now matches the complete publication header with flexible glyph spacing and normalized punctuation. It removes complete page counters and the two observed table-heading orders (`答案題目`, `答題目案`), before splitting questions. The same cleanup applies to mirror stems and options. It does not broadly strip standalone subject names, dates, page references, or `AI 應用規劃師` in legitimate question text.

Derived cache entries carry `meta.contentVersion: 1`; older entries are ignored and rebuilt. Both localStorage key names and `ipasAIState` remain unchanged. No question ID, answer, scoring, progress code, self-authored DB, UI or navigation changes.

## Scan coverage and findings

Downloaded all 14 PDFs from the existing official iPAS URLs in `pastPapers`. Extracted text using the application's existing PDF.js **3.11.174**, then exercised the actual shipped parser functions in Node VM. Also exercised the structured-mirror path for its 12 supported papers.

The active paths still produce 700 records (50 each); this is a count check, **not a claim that every mirror record is correctly mapped to an official question**. PDF fallback retains its pre-existing incomplete counts for two papers; see limitations.

| Paper | PDF fallback count | PDF affected questions | Mirror affected questions |
|---|---:|---:|---:|
| 115-3-L11 | 50 | 14 | 0 |
| 115-3-L12 | 50 | 15 | 0 |
| 115-2-L11 | 50 | 12 | 0 |
| 115-2-L12 | 50 | 12 | 0 |
| 115-1-L11 | 50 | 11 | 0 |
| 115-1-L12 | 50 | 10 | 0 |
| 114-4-L11 | 50 | 12 | 0 |
| 114-4-L12 | 50 | 12 | 0 |
| 115-1-L21 | 50 | 14 | 0 |
| 115-1-L22 | 38 | 11 | 0 |
| 115-1-L23 | 50 | 17 | 0 |
| 114-2-L21 | 50 | 13 | 0 |
| 114-2-L22 | 50 | 15 | 11 |
| 114-2-L23 | 49 | 13 | 11 |

**209 fields** changed: 185 PDF-path fields and 24 mirror-path fields. All changes remove text/whitespace only. No question count, ID/order or answer change. The 209 changed fields' answer keys were checked against answer/number cells in the downloaded official PDF text, matched by stem for mirror rows. Q4 is **C**, visually checked on official PDF pages 1–2 along with its stem and all four options.

`OFFICIAL_PDF_CONTAMINATION_AUDIT.csv` records every changed field, application ID, official source question number, answer, removed fragments and result. The distinction between app/source number is deliberate: it exposes existing mirror misalignment instead of silently renumbering progress IDs.

## Repeatable checks

Requires Python standard library and Node; downloads the same existing PDF.js used by the app, not a new production dependency.

```powershell
python scripts/fetch_official_audit.py tmp/official-audit
# Materialize the baseline without PowerShell encoding conversion:
python -c "import pathlib,subprocess; pathlib.Path('tmp/official-baseline.html').write_bytes(subprocess.check_output(['git','show','3c2c369:index.html']))"
node scripts/audit_official_pdf.cjs tmp/official-audit tmp/official-baseline.html
```

The scanner writes `audit.json` and each active paper's `.clean.json` into the input directory. Without the optional baseline it still checks all-paper load counts, duplicate numbers, residual furniture, Q4 and false-positive controls; baseline comparison adds unchanged key/count checks and a per-field change ledger. Downloaded source hashes are recorded below, since the external mirror can change.

## QA performed

- Node full-source audit: PASS, 14 PDF paths + 12 mirror paths; 209 changed fields; affected keys match official PDF answer cells.
- Negative controls: standalone subject name, date, page reference (`第 20 頁的責任條款`), announcement, decimal, and legitimate `AI 應用規劃師` wording preserved.
- Cache regression: legacy entries ignored; current entries retained; attempts remain available to `paperProgress`. Browser reload with intentionally stale cache rebuilt the PDF content and retained Q4’s prior correct result and the 51 existing QA attempts.
- Browser: local Chromium fixture, actual app/parser/PDF worker and downloaded official PDFs, remapped to same-origin URLs to make source fetching deterministic. No production storage touched. Confirmation auto-accepted in the fixture for mock submission; native dialog interaction was not tested.
- Desktop 1280×900 and mobile 375×812: Q4 clean; no horizontal overflow; C scores correct and saves `PAST-115-3-L11-4`.
- Practice: start, answer correctly, next question PASS.
- Mock: start 50 questions, answer one, submit (2/100), review PASS.
- Wrong-question, weak-area, scope and home tabs render; mobile overflow checks PASS.
- Browser JavaScript error log: empty.
- Self-authored DB byte-identical to baseline.
- Inline JavaScript and audit-script syntax checks, Python compile check, and `git diff --check`: PASS.
- This does not verify live-site CORS/proxy availability, actual iPhone Safari, or production.

## Deferred integrity findings — Issue #72

These are not page-furniture text and cannot be safely fixed by deleting header patterns:

1. **114-2-L22 mirror application Q39 / row 388 option D** includes subsequent Q40–50 and shared dataset context (3,403 characters before cleanup). The later appended mirror records require official-number mapping verification.
2. **114-2-L23 mirror application Q40 / row 428 (official Q41)** option D includes the VGG16 context/table for following Q42–45 (1,987 characters before cleanup).
3. **114-2-L23 mirror application Q45 / row 433 (official Q47)** option D includes Titanic context and following Q48–50 (714 characters before cleanup). Further appended records are out of source order; renumbering would change which official question an existing progress ID denotes.
4. PDF fallback already returns **38** questions for 115-1-L22 (answer/number/layout ordering), and **49** for 114-2-L23 (Q34 has `(C )` instead of `(C)`). Counts are unchanged by this patch. Normal loading uses 50 mirror records for these papers.
5. Shared-question context in PDF fallback also attaches to preceding D options in intermediate papers. Removing it blindly would discard official context needed by later questions. This needs a boundary/context handling contract, not further header deletion.

The Human confirmed the split and updated #43 to explicitly exclude these defects. Issue #72 owns the boundary/numbering audit and any progress-mapping compatibility or migration decision. This patch does not implement that work.

## Source fingerprints

Official URLs are the exact `pastPapers[].pdf` values in `index.html` (official iPAS domain); filenames and metadata are unchanged.

| Paper | SHA-256 |
|---|---|
| 115-3-L11 | `c6d11084c73e9f9b1edff5a802465135d66a6da14cc3d3ed6fe80525b8a0cc3d` |
| 115-3-L12 | `ecbee5c656f63bd42f17ad094193760bf1b3273c3b4e5ca33db0ebb955591b5c` |
| 115-2-L11 | `912d2fdc3a605dade66463193432c8d70d9bccef348cba87583f873162b83100` |
| 115-2-L12 | `765af6acdb722b7a3f3382eff4b8b9e5d522dce4bfb7b8364aa8d2a3e67373e8` |
| 115-1-L11 | `fbba96cf077905166b1dda19310f6da236712cefaa465c8c73155d85dcab260c` |
| 115-1-L12 | `b5b26f049ae187f8921b4f2639725e7a8f18eedcf2459344416aa647b5b232b2` |
| 114-4-L11 | `42a0907e97bfcf6b359f478e0883f6afd7ba5c87e7124eb9cdbcda93cef09a4d` |
| 114-4-L12 | `41a1696989a452061863493a1f8121739a3c11c749115733b44f2e69a548fb41` |
| 115-1-L21 | `86a52c105ec68048060eb4b20f3ba92213267fd8c7dfdb718fbcc0c28f90f179` |
| 115-1-L22 | `86436d512dcd8e323fa3351c4254d7135adf92095c11a988616ddf449837effd` |
| 115-1-L23 | `96c553d232e0902a4973a612d3c44c5867466bb21af626e7480f9a1e76a03e76` |
| 114-2-L21 | `5e4860eee6faa50e735c7e8139e559b3b6f3b8dbd36398624942485eb3a3ac29` |
| 114-2-L22 | `f1ff76de3aea6ba8365764fd848bab0109a7790fdf2c85197106456d6e4ad967` |
| 114-2-L23 | `c9495cac9a8b58a6af2994d633613cb8e911aed347842e71f2c29e79abc9d1d3` |

Structured mirror HTML SHA-256: `b623eeb33be0069022a345f2b7874736405765a965815654c5af19307892540f`.
