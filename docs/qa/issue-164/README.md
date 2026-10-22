# Issue #164 — Engineering QA

Base: `dev@3d8aa52`. Branch: `codex/issue-164-unified-exam-history`.

Implementation: `index.html`, [unified contract](../../exam-history.md), existing official-history contract routing note, reproducible `scripts/test_unified_history.cjs`. Existing #157 tests target the new history panel; the Practice bank smoke test now expects seven tabs and validates the newest Mock record schema. Question-bank data is unchanged.

## Targeted validation

Installed Edge on local HTTP with isolated profiles at 1280×900 and 375×900.

- PASS top-level tab, source shortcuts, 全部 / 考古題 / 模擬考 filters, consistent cards, cross-source newest-first order, count/status labels, no duplicated official history list on Past Paper page.
- PASS existing official records appear from the same `pastHistory` store. Adapted #157 suite retains independent attempts, notes/delete, latest-evidence isolation, reload/draft lifecycle, signature/version compatibility, unknown schemas and official-load retry assertions.
- PASS new Mock stable UUID, schema/config/timestamps/elapsed, answer/correctness/full-question snapshots, correct/wrong/blank score totals, manual confirmation and real timer-callback automatic timeout. Schema negative controls reject inconsistent versions/IDs/options/outcomes/scores/time/config/timeout metadata.
- PASS historical Mock review renders saved text/options/explanation after current-bank content changes, shows correct/wrong/unanswered states and supports review filters. Viewing a prior record leaves an active Mock session, selections, timer and live review state intact.
- PASS note create/edit and HTML escaping; only note changes. New and legacy Mock deletion cancel/confirm; stale deleted ID safely returns to list. Notes/review/deletion preserve byte-equivalent latest attempts/wrong/bookmarks/computed competency evidence and official history.
- PASS lossless lazy legacy wrapper, stable persisted IDs, summary-only label, no fabricated elapsed/answers, legacy notes/delete, reload, no upgrade reset. An absent Mock history field renders empty and supports new submission without resetting progress. All 31 seeded old summaries remain after new submission; no automatic 30-record eviction.
- PASS future/malformed Mock container and mixed entries: startup/render safe, visible warning, raw entries/container preserved on new submission. Failed note/delete saves roll back; failed result save warns and explicit retry persists the same event once.
- PASS diagnosis no longer contains paper-progress/recent-Mock lists; competency evidence/actions remain. Past paper cards still show latest answered/correct/accuracy progress.
- PASS mobile/desktop history and review layout: no document horizontal overflow or page JavaScript errors; screenshots visually inspected.

Evidence: [history desktop](history-1280.png), [history mobile](history-375.png), [Mock review desktop](mock-review-1280.png), [Mock review mobile](mock-review-375.png), [weakness desktop](weakness-1280.png), [weakness mobile](weakness-375.png).

## Regression commands

Use existing Playwright through `NODE_PATH`; installed Edge, no added dependency.

```powershell
node scripts/test_unified_history.cjs docs/qa/issue-164
node scripts/test_past_attempt_history.cjs
node scripts/test_practice_bank_browser.cjs
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

Coverage includes Practice start/answer/navigation, five-subject full Mock timers/submission/review, official paper/shared visuals/progress, wrong/weak flows, keyboard tabs, loading/recovery, canonical migration, Dev loader/storage isolation and all relevant mobile overflow checks. Runtime syntax/mapping checks cover 700 official records and ten loader negative controls.

Limits: local installed Edge only; no physical Safari or integrated Dev Preview Product Verify claimed. Unsubmitted Mock sessions retain their existing restart/reload behavior. Legacy summaries lack historical question snapshots and elapsed time. Storage remains device-local; result-write failure requires retry before reload. No merge/release decision is part of Engineering handoff.
