# Issue #158 — Engineering QA

Base: `dev@d8ebed8` (includes #157 and #164). Branch: `codex/issue-158-past-timed-exam`.

Scope: two Past Paper mode entry points, timestamp-based timed view/resume/submit using the existing draft/history contract, optional versioned timing-rule/position metadata, new browser QA, and an existing isolated feedback harness supplied with the session-state stub. No official question data, Practice timer or Mock timer changed; no new dependency.

Official timing was verified against the primary 114/115 brochures; sources/rule policy are recorded in the [timed contract](../../past-timed-exam.md). All 14 current papers resolve the proper year/level/subject rule; unknown combinations have no global fallback.

## Results

- PASS installed Edge 1280×900 / 375×900, controlled persistent Date.now with real interval callbacks: mode buttons, fresh timed attempt from question one, original start/ID persisted before any answer, neutral editable options, previous/next and saved position/selection. No answer/correctness/explanation/latest-result status rendered before submission.
- PASS picks leave latest attempts, wrong book, bookmarks, Mock history and computed weakness evidence unchanged. Practice remains untimed with immediate feedback; Mock behavior is covered by existing regression suites.
- PASS exact zero does not auto-submit. Overtime remains editable and elapsed continues. Resume across empty-draft reload, overtime reload with a stale persisted `overtime: false`, temporary exit, another tab and later reload retains original ID/start/answers and derives the actual elapsed/overtime state. No pause/reset occurs.
- PASS primary 75-minute and intermediate 90-minute records; within-time and overtime results; 114 shared official context, no page overflow. User confirmation cancel keeps the exam active. Confirmed submit saves the existing versioned snapshot, actual duration/limit/overtime, updates selected latest results/wrong status, and enables official per-attempt review. Duplicate submission is guarded; all-blank submission preserves previous latest answers.
- PASS result has neutral score/counts/time/overtime without new attainment classifications; timing metadata is recursively immutable in finalized records.
- PASS eleven invalid recovery cases: missing start, wrong limit, incomplete answer set, unknown paper, content version/signature mismatch, inconsistent overtime, future system time, invalid position/year/schema. No fabricated timer/result or raw draft/latest-result overwrite.
- PASS initial/answer write failure rollback, blocked unsaved exit, and atomic submit failure/retry: prior draft/latest evidence remains, no premature reveal, no phantom/duplicate attempt.
- PASS desktop/mobile screenshots visually inspected; controls do not cover question/choices; no document horizontal overflow or page JS errors in targeted normal/failure flows.

Screenshots: [mode entry desktop](modes-1280.png), [mode entry mobile](modes-375.png), [timed desktop](timed-1280.png), [timed mobile](timed-375.png), [overtime desktop](overtime-1280.png), [overtime mobile](overtime-375.png), [submitted desktop](submitted-1280.png), [submitted mobile](submitted-375.png).

## Regressions

Existing suites PASS official Practice/immediate feedback/list separation/progress, immutable history/signature/recovery, unified history/notes/delete/legacy migration, five-subject Practice/full Mock timing/submission/review, wrong/weak evidence, all tabs, loading/retry, shared visuals, progress migration, Dev loader/storage isolation and cache upgrade. Runtime compilation and 700 official mappings / ten loader negative controls pass.

```powershell
node scripts/test_past_timed_exam.cjs docs/qa/issue-158
node scripts/test_past_attempt_history.cjs
node scripts/test_unified_history.cjs
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

Limits: local installed Edge and controlled long-duration clock QA, not physical Safari / a manual 75–90 minute endurance run. No integrated Dev Preview Product Verify or production verification claimed. Unsupported/invalid active drafts are retained and blocked, not silently repaired. Engineering handoff only; no merge/release decision.
