# Issue #157 — Engineering QA

Base: `dev@4c17d96`. Scoped branch: `codex/issue-157-past-attempt-history`.

Scope: additive official-paper session history in `index.html`, contract in `docs/past-attempt-history.md`, reproducible browser QA in `scripts/test_past_attempt_history.cjs`. Existing isolated feedback/count test harnesses provide stubs for the new history hooks; their progress/scoring assertions remain intact. No official question data changed.

## Checks

- PASS installed Edge at 1280×900 and 375×900: repeated same-paper partial/full attempts have unique stable IDs, independent snapshots, selected answers and stored answer keys; latest-result answers never populate the new session snapshot. Repeated submission is idempotent.
- PASS note creation/editing changes only the note; HTML-like text is escaped. Review has no result-edit controls; records and nested snapshots are frozen. Outcomes match the selected attempt after later attempts change latest results.
- PASS history cards show paper/year/session/level/subject, date/mode, correct/total/score, elapsed time, applicable timing state and notes. Review supports question-number jump and previous/next; official shared context/visuals reuse existing content.
- PASS deletion cancel/confirm, deleted-reference handling and reload persistence. Notes/review/deletion preserve byte-equivalent latest attempts, wrong book, bookmarks, mock history and computed competency evidence.
- PASS old state without history starts unchanged; drafts recover once as interrupted at the last persisted answer time; exit/restart/tab switch preserve partial records. Existing progress is not cleared.
- PASS unsupported store versions and malformed records/drafts show a warning, preserve original raw data, and permit existing latest-result practice. New sessions do not overwrite unsupported history.
- PASS schema negative controls: unsupported record version, inconsistent score/correct/time, invalid options, duplicate questions, unknown paper/mode/status, invalid IDs/overtime. Reserved timed-mode limit/overtime consistency validates; current UI does not enable timed exams or define official time limits.
- PASS incompatible question content shows saved answer/outcome plus a warning, never replacement content. Transient official-bundle load failure shows retry; successful retry leaves persisted history unchanged.
- PASS desktop/mobile history and review: no document horizontal overflow or JavaScript errors; screenshots inspected.

Screenshots: [history desktop](history-1280.png), [history mobile](history-375.png), [review desktop](review-1280.png), [review mobile](review-375.png).

Regression commands (Playwright supplied through `NODE_PATH`; no added dependency):

```powershell
node scripts/test_past_attempt_history.cjs docs/qa/issue-157
node scripts/test_source_aware_weakness.cjs
node scripts/test_official_bundle_browser.cjs
node scripts/test_practice_topic_reveal.cjs
node scripts/test_official_competency_runtime.cjs
node scripts/test_past_answer_feedback.cjs
node scripts/test_past_answer_count.cjs
node scripts/test_past_progress_migration.cjs
node scripts/test_past_bundle_cache_upgrade.cjs
node scripts/test_dev_asset_resolution.cjs
git diff --check
```

Browser regressions PASS Practice start/answer/navigation, Mock start/submit/review, official-paper/wrong/weak flows, all tabs, source-aware aggregation/recovery, canonical migration/scoring/shared contexts and Dev loader storage isolation at both widths. Syntax/runtime checks PASS 700 official mappings and ten loader negative controls. Question-data diff is empty.

Limits: local installed Edge only; no physical Safari or integrated Dev Preview Product Verify claimed. Practice is untimed; completed snapshots record wall elapsed time, and crash/reload recovery records only time observed through the last saved answer. No merge/release decision is part of this handoff.
