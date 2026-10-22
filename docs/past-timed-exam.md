# Official past-paper timed mode — Issue #158

Uses the existing [Past Paper attempt contract](past-attempt-history.md), `state.pastHistory.draft` and finalized records. No parallel session store, service, dependency or login is introduced. Practice and Mock timers are unchanged.

## Official timing rules

Verified against official iPAS brochures on 2026-10-22, §2.3 / PDF page 8:

- [115 brochure](https://www.ipas.org.tw/api/proxy/uploads/certification/AIAP/115%E5%B9%B4%E5%BA%A6AI%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83%E5%B8%AB%E8%83%BD%E5%8A%9B%E9%91%91%E5%AE%9A%E7%B0%A1%E7%AB%A0%28%E5%88%9D%E3%80%81%E4%B8%AD%E7%B4%9A%29_20251225235744.pdf#page=8).
- [114 brochure, announcement v3.1](https://www.ipas.org.tw/DownloadFile.ashx?filename=5070f383-019a-46ab-acf2-f3807a027966_114%E5%B9%B4%E5%BA%A6AI%E6%87%89%E7%94%A8%E8%A6%8F%E5%8A%83%E5%B8%AB%E8%83%BD%E5%8A%9B%E9%91%91%E5%AE%9A%E7%B0%A1%E7%AB%A0%28%E5%88%9D%E3%80%81%E4%B8%AD%E7%B4%9A%29_%E5%85%AC%E5%91%8A%E7%89%88v3.1.pdf&type=10#page=8).

| Paper year | Level / subjects | Minutes |
| --- | --- | --- |
| 114, 115 | 初級 / L11, L12 | 75 |
| 114, 115 | 中級 / L21, L22, L23 | 90 |

`PAST_TIMING_RULES` is keyed by year, then level with allowed subject codes, version and source URL. `pastPaperTiming(paper)` checks paper year/level/subject; unknown combinations have no inferred default and cannot start timed mode. Extend the year-specific rule with an official reference when future papers are introduced. Do not alter an active attempt's saved limit silently; unknown/changed rule versions fail recovery safely.

## Modes and lifecycle

- Paper cards offer practice (existing immediate feedback) and an explicitly labeled timed exam with its duration. The selected mode is fixed for that attempt. The paper list and question view remain separate.
- Timed mode starts from question one with all choices unanswered, regardless of latest progress. A new ID, start, limit, rule reference and full canonical answer/content-signature snapshot are saved **before** displaying the exam. Empty exams are resumable too.
- There is one existing draft slot. While a timed draft exists, the list offers resume and disables starting another paper or mode. It must be explicitly submitted before starting another. Returning to the list or another app tab does not pause or interrupt it.
- `elapsed = Date.now() - startedAt`, not an in-memory countdown. The display interval only redraws. At exactly the limit, remaining time is zero and no submission occurs; after the limit, `overtime = elapsed > limit`. Elapsed continues including away/offline time.
- Picks and question navigation persist only the timed draft, including `position`, `updatedAt`, `elapsedMs` and `overtime`. Choices are neutral, editable and restored on revisits. No current correctness, explanation, previous-result score/status or answer-PDF shortcut is rendered in the timed question view. Existing official wording/options/shared context/visuals are reused unchanged.
- Reload leaves a timed draft in progress. Resume validates the complete paper, IDs/order, content version and exact signatures, metadata, timing rule/limit, position and timestamps. It refreshes elapsed/overtime from the original start, even if the previously saved overtime flag was false. Missing/invalid/unsupported or future-clock data is retained without fabricating a result or resetting the timer.
- Explicit submission requires confirmation and writes the existing immutable finalized record (`mode: timed_exam`, `status: submitted`, actual `submittedAt`/`elapsedMs`, limit, overtime, answer snapshot and score). New `position` and `timingRule: {year, version, source}` metadata are additive within schema 1; older records remain supported.
- Latest-result/wrong-book evidence changes only after successful submission, and only for selected questions. Blank questions count zero in the session result but do not erase older latest results. Notes, bookmarks and unrelated history remain unchanged.
- Results use a neutral score plus counts/time/overtime. No new pass/fail or within/overtime attainment classification is defined. The existing unified history and per-attempt official review reveal the saved outcomes after submission.

## Persistence failures

An initial write failure creates no phantom attempt. A failed answer/navigation write retains the prior draft/selection; the error remains visible. A failed leave write keeps the exam view active so unsaved state is not silently discarded. A failed submit restores history/draft/latest-result/wrong stores and leaves the same exam running for retry. No correctness is revealed on failed submission. A backward system clock is reported and cannot produce a negative or reset elapsed record.

Recovery failures retain the raw draft and block resuming it or overwriting the single active slot. No silent repair, invented timestamp or destructive reset is performed. Correcting invalid data / migrating unsupported future content is outside this Issue; the existing explicit global reset remains a separate user action.

## Reproducible QA

`node scripts/test_past_timed_exam.cjs [screenshot-directory]` uses installed Edge, existing Playwright via `NODE_PATH`, controlled persistent `Date.now` and real interval callbacks. Both 1280×900 and 375×900 exercise rule selection, editable neutral choices, pre-submit evidence isolation, exact-zero/no-auto-submit, overtime, empty and overtime draft reloads, stale saved overtime flags, leaving/resume, submit cancel/retry, history/review and practice regression. It also covers an intermediate within-time result, 114 shared context and empty submission, eleven invalid recovery cases, initial/answer write failures and blocked unsaved exits.

Limits: device-local wall-clock timestamps; no pause or cross-device sync. Invalid content/rule versions block safe resume rather than substituting current data. The simulated long-duration QA is not a manual 75/90-minute endurance run or a physical Safari test.
