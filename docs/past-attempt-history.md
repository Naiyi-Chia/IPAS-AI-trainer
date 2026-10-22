# Official past-paper attempt history (Issue #157)

History is additive to the existing `ipasAIState` localStorage object. `attempts`, `wrong`, `bookmarks`, and `examHistory` keep their current meaning. In particular, `attempts` is still the latest result per stable question ID; history never feeds the weakness calculation.

Issue #164 routes this unchanged official-history contract through the top-level **考試紀錄** tab. The Past Paper page retains a lightweight link; the single shared list and management UI are described in [Unified Exam History](exam-history.md). No second official-history data store is created.

## Version 1 contract

`state.pastHistory = { schemaVersion: 1, records: [...], draft: null | Draft }`.
The field is created on the first new practice answer, or before a timed exam starts. Reading an old state does not synthesize history, clear progress, or rewrite stored question IDs. Unsupported versions and malformed records remain in storage; the history UI warns and only displays supported valid records. Invalid drafts / unsupported stores block new history capture while latest-result practice remains available.

Each finalized record has:

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Record version, currently `1` |
| `id` | `past-` + UUID; generated once at session start |
| `paper` | Snapshot of `id`, `title`, `year`, `session`, `level`, `subject`, `name`; stable paper reference |
| `contentVersion` | Content generation used for the session; supplied by `OFFICIAL_PAST_CONTENT_VERSION` (currently `2`) and checked during review. Increment for canonical content revisions; this is separate from bundle `schema_version` |
| `mode` | `practice` or `timed_exam`; timed producer/resume behavior is defined in [Issue #158](past-timed-exam.md) |
| `startedAt`, `updatedAt`, `submittedAt` | Epoch milliseconds; finalized `updatedAt` equals `submittedAt` |
| `elapsedMs` | Nonnegative wall time from opening/restarting the paper to finalization |
| `timeLimitMs`, `overtime` | Both `null` for practice. Timed mode: positive saved official limit, boolean `elapsedMs > timeLimitMs`; per-year/level/subject rules live in the timed-mode contract |
| `position`, `timingRule` | Additive timed metadata: zero-based position and `{year, version, source}`. Optional for older records; typed/validated if present |
| `answers` | Ordered snapshot of `{questionId, number, optionCount, selectedAnswer, correctAnswer, contentSignature}` for every question in the paper |
| `answered`, `correct`, `total`, `score` | Selected count, correct count, paper length, rounded `100 * correct / total`; unanswered contributes zero |
| `status` | Finalized records: `submitted` or practice `interrupted`. Timed leave/reload retains an `in_progress` draft until explicit submission |
| `resultStatus` | `complete` if all questions have a selection, otherwise `partial`; no pass/fail threshold |
| `note` | User text, editable through Notes UI, max 2,000 characters |

Answers are zero-based option indices. `selectedAnswer: null` means unanswered **in this session**, even when older progress exists. A repeated selection in the same session replaces only that session's choice; a finalized record is never rescored or edited. System fields and nested snapshots are frozen in memory. Note updates replace only `note`; deletion removes only the matching history record after native confirmation.

`validPastAttempt()` validates IDs, supported versions/modes/statuses, unique question numbers/IDs, option bounds, timing consistency, summary consistency, optional position/rule metadata, and overtime semantics. The record and store both carry versions so later migrations can be explicit. The timed producer added by #158 reuses this version 1 contract; it also validates resumable drafts against the complete canonical paper and saved timing rule.

`contentSignature` is an exact serialized identity (`JSON.stringify`) of runtime question text, ordered options, correct-answer index, visual asset paths and the complete shared context (including its visual paths). It is stored at session creation and compared at review time. It is not a lossy hash. This prevents changed wording/options/context from being rendered as historical content even if a content revision accidentally retains the same version, option count and answer index. Asset bytes are referenced by their existing paths; replacing bytes at the same path requires a content-version increment.

The signature field is additive within record version 1: if present it must be a string. Older records and recovered drafts lacking it remain valid for listing, notes, deletion and saved-answer outcomes. They cannot prove content identity, so review shows the saved selected/correct answers and the unavailable-content warning, without displaying current question/options/context/visuals. No signature is backfilled from current content and no historical field is rewritten.

## Session lifecycle

- Practice: loading/restarting starts an independent in-memory session. Existing "continue" navigation can start at the first question without a latest result; earlier questions are still unanswered in this new snapshot. Each practice answer saves the draft alongside the usual latest-result update.
- Practice finish saves a submitted snapshot. Return to papers, tab switch, or restart saves an interrupted snapshot if at least one answer exists. Empty practice sessions create no history. Reload recovers a valid practice draft once as interrupted at its **last persisted answer time**, without adding offline time.
- Timed: a full unanswered draft is saved at start, including its timestamp and official limit. Answer/position updates change only the draft. Leaving/reloading does not finalize it; explicit resume keeps its ID, start and selections, and recomputes elapsed/overtime from current time. No pause/reset is provided. The existing single draft slot is protected against starting a different paper/mode until submission.
- Timed explicit submission saves a finalized snapshot (including empty/partial attempts), clears the draft, and updates latest results/wrong book only for selected questions. Unanswered questions contribute zero to the session score without overwriting an older latest result. Failed submission rolls back stores and leaves the exam active. Repeated submission cannot duplicate a record.
- History review loads existing canonical questions by stable ID and uses only saved selections / answer keys for outcomes. Current content is rendered only when the saved content version matches `OFFICIAL_PAST_CONTENT_VERSION`, a saved exact signature matches the current runtime content, and answer index/option count agree. Missing, unknown or incompatible content shows the snapshot answers plus an explicit unavailable-content message. Shared context and official visuals reuse existing renderers only after these checks. No new AI explanation is generated.
- Delete cancels the current review reference and pending review loads. Reopening a deleted ID safely returns to history.

Storage remains device-local and follows the app's existing save/reset pattern. "Clear all progress" also removes history because it removes the entire state object. Single-record deletion does not change progress or statistics.

## Reproducible QA

`node scripts/test_past_attempt_history.cjs [screenshot-directory]` requires existing Playwright in `NODE_PATH` and installed Edge. It covers old-state compatibility, repeated same-paper sessions, immutable snapshots, complete/partial results, version validation, reserved timed-field consistency, note editing/escaping, deletion confirmation, review, draft recovery, restart/exit/tab behavior, unsupported-history preservation, and 1280px/375px layouts. Content-review negative controls include changed wording/options/shared context/visual paths with unchanged version, answer and option count, explicit saved/current version mismatch, and old records without signatures. Matching content still renders; negative cases retain snapshot outcomes and omit all current content without changing history/progress.
