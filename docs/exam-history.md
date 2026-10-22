# Unified Exam History — Issue #164

The top-level **考試紀錄** tab is the only history-list renderer. Its filters are 全部 / 考古題 / 模擬考. Direct tab entry defaults to 全部; the lightweight Past Paper and Mock result links open the relevant source filter. Returning from review or note management preserves that filter. Cards sort newest first by their displayed timestamp (Past Paper start, Mock submission / legacy date); records without dates come last.

Past Paper progress remains on paper cards. Weakness analysis retains the existing latest-result competency evidence and diagnosis / practice actions; it no longer lists paper progress or recent Mock sessions.

## Persistence sources

- Official history remains in the existing `state.pastHistory` contract from [#157](past-attempt-history.md). No second official-history store, copy or score migration is introduced. Review retains the content-version/signature checks and unavailable-content fallback.
- Mock history remains an array in `state.examHistory`, containing supported versioned records, supported legacy wrappers, or untouched unsupported raw entries. No backend or dependency is added.
- Practice/Past latest-result `attempts`, wrong book and bookmarks retain their existing semantics. History notes, reviews and single-record deletion never rewrite those stores or the computed weakness evidence.

## New Mock record: version 1

| Field | Meaning |
| --- | --- |
| `schemaVersion`, `kind` | `1`, `mock_attempt` |
| `id` | `mock-` + UUID, allocated when the Mock session starts |
| `mode`, `subject` | Existing `full` / `custom` mode semantics and selected subject |
| `configuration` | `{subject, requestedCount, timeLimitSeconds}`, captured at start |
| `startedAt`, `submittedAt` | Epoch milliseconds; elapsed wall time is measured between start and submission |
| `date` | Compatibility alias of `submittedAt` |
| `elapsedMs` | `submittedAt - startedAt`; not synthesized for old summaries |
| `remainingSeconds` | Nonnegative countdown value observed on submission |
| `autoSubmitted`, `timedOut` | Whether submission used the automatic path; timeout is automatic submission with zero remaining seconds |
| `answers` | Ordered `{number, question, selectedAnswer, correctAnswer, correct, unanswered}` snapshots |
| `count`, `correct`, `wrong`, `blank`, `score` | Total, correct, wrong selections, unanswered, rounded `100 * correct / count` |
| `note` | User-managed text, max 2,000 characters through the UI |

Each `question` is a JSON copy of the self-authored question shown in that session, including text, options, answer, competency metadata, explanation and source label. The copy is taken at session start. The final selected answer is zero-based, or `null` when unanswered. History review renders these saved copies using the existing Mock review markup; changing the current bank or starting another exam cannot replace historical content. Historical review never replaces the active session's answers, timer or live review data.

`validMockAttempt()` verifies supported version/kind/ID, question/option types and bounds, unique question IDs, ordered numbering, answer/correctness/unanswered consistency, score/count totals, configuration, timestamps, elapsed and automatic/timeout metadata. Records, configuration and nested question snapshots are recursively frozen in memory. Only the note can be replaced through the UI; confirmed deletion removes the single matching record.

Only submitted Mock sessions create records. Restart/reload behavior for unsubmitted Mock sessions is unchanged. The old automatic 30-record truncation is removed so a new submission does not silently discard earlier history. Browser localStorage remains the storage limit. A failed result write leaves the result in memory with an explicit warning and retry action; retry saves the same ID without duplicating the event.

## Existing summary-only Mock records

Startup, Practice, and diagnosis do not eagerly migrate old history. An absent `examHistory` field is an empty history view and is created only on new submission; unsupported non-array values remain untouched. On first entering the history list, each supported old summary is wrapped as:

```js
{schemaVersion: 1, kind: 'legacy_summary', id: 'mock-<UUID>', note: '', legacy: originalSummary}
```

The `legacy` object preserves the original fields and values exactly, including unknown additional fields. If the old summary already had a string note it is also made available in the editable wrapper note. Basic existing summary types are validated; unsupported entries are left untouched. A failed migration write restores the original array and reports the failure. Repeated visits/reloads do not rewrap records or change their IDs.

Legacy cards show the original available score/date/subject/counts/mode, with explicit labels for missing metadata. They say **此舊紀錄僅有成績摘要，無法回顧逐題答案**. No answer snapshot, elapsed time or new system result is invented. Notes and confirmed single-record deletion work through the wrapper; note changes never edit `legacy`.

## Failure behavior and management

Unsupported containers/entries remain in storage and show a visible warning. Supported records may still be viewed alongside unsupported entries. Submitting a new Mock can prepend a valid record to a mixed array while retaining every raw entry; an unsupported non-array container is never replaced.

Shared note/delete helpers serve both sources. Failed writes restore the original history array, preserve latest-result evidence, and display an error rather than claiming success. Deletion requires native confirmation and invalidates the current review reference / pending official load. Opening a deleted ID safely returns to the unified list. The existing explicit "clear all progress" operation still clears the entire app state, including history.

## Validation

`node scripts/test_unified_history.cjs [screenshot-directory]` covers source filters/order/routing, lossless legacy wrapping, new manual/timeout Mock snapshots, saved-content review independent of current bank, active-session isolation, notes/escaping, delete cancel/confirm, latest-evidence isolation, schema negative controls, reload, unsupported preservation, retention beyond 30 records and failed-write retry/rollback. Both 1280px and 375px are exercised. Existing #157 tests now use the top-level history panel while retaining their snapshot/content/migration assertions.
