# Issue #42 — official past-paper answer feedback

## Product Verify revision — 2026-09-25

Baseline: `dev@7db745736036d104fcb6babc9826a5971f25d479`.
This section supersedes the first implementation's result-panel expectations below.

Before: option labels and a second result panel repeated the selected/correct answers,
followed by a no-explanation placeholder and a duplicate PDF link.
After: the option labels alone communicate the result. `#pastExplain`, its rendering
and its unused CSS are removed. The existing metadata PDF link remains unchanged.
Focus now moves to the named, programmatically focusable option group, preserving
keyboard orientation without introducing another result or explanation panel.

Revision checks:

- PASS: `PAST-115-3-L11-1`, correct A / wrong B at 375×812 and 1280×900;
  visual inspection confirms readable options, explicit labels and no lower result box.
- PASS: all answered options remain disabled, text `rgb(23,32,51)`, opacity 1;
  no horizontal overflow (375/360 and 1280/1265 viewport/scroll widths).
- PASS: Previous / Next / restart remove old labels and preserve saved attempt status.
- PASS: Enter / Space answer activation; focus lands on `pastOpts` with visible
  keyboard focus outline. No focus call targets the deleted panel.
- PASS: wrong-to-correct progression retains `PAST-115-3-L11-1`, updates the existing
  attempt and clears its wrong record; reload shows 1 official answer / 100% accuracy.
- PASS: existing metadata PDF link remains available and clickable; its unchanged
  official URL returns HTTP 200, `application/pdf`, `%PDF-` signature.
- PASS: Practice start / correct answer / original explanation / next;
  Mock start 50 / answer / submit (1 correct, 49 blank, score 2) / review.
- PASS: home, wrong-question, weak-area and official-scope views at 375px;
  browser JavaScript error log empty.
- PASS: updated regression script covers all 16 answer/selection combinations,
  repeat guard, unchanged state writes, absent duplicate/placeholder, retained PDF
  entry, render escaping, navigation/reset and final score.
- PASS: inline application JS and regression script syntax; `git diff --check`.
- PASS: baseline comparison confirms DB, parser/cache, Practice/Mock, scoring/storage
  statements, navigation functions and retained CSS are unchanged.

Browser setup: local Chromium with actual app/PDF.js and retained official PDFs
served on localhost; fixture auto-accepts Mock confirmation. No production storage
was touched. The in-app browser did not expose a new PDF tab after clicking the
link, so PDF availability was verified separately via the official HTTP response.
Actual iPhone Safari, VoiceOver and native confirmation-dialog interaction remain
untested. This is Engineering QA for Product Verify rework, not Human Product Verify.
No #44, #72, #78 or #79 work is included.

## First implementation — historical QA

Baseline: `dev@75aeb6e60e15b6e8f6b9329e9495ac43053b35b9`.
Scope: official past-paper answer UI only; no question content, answer keys,
localStorage schema, scoring/progress, parser/cache or Practice/Mock changes.

## Reproduction and fix

Reproduced `PAST-115-3-L11-1` using official PDF inputs retained from #43.
Chromium computed option text as `rgb(0, 0, 0)` before answering, then
`rgba(16, 16, 16, 0.3)` on all four native-disabled buttons after answering,
despite element opacity remaining `1`. The shared `.option` rule did not specify
text color, leaving native disabled styling to reduce readability.

Only `#pastOpts` overrides text color, WebKit text fill, disabled opacity/cursor
and correct/wrong borders. Native disabled behavior and the repeat-answer guard
remain intact. Text labels identify the official answer and the user's selection.
The named result region presents the selected answer, official answer, existing
source label, PDF link and `官方公告未提供逐選項解析。` No explanation is invented.
Keyboard focus moves to that region; Tab then reaches the PDF link.

## Verification

| Check | Result |
|---|---|
| Desktop 1280×900, Q1 choose A and B | PASS: correct/wrong feedback and explicit labels |
| Mobile 375×812, Q1 choose A and B | PASS: all options readable, wrapping intact, no horizontal overflow |
| Disabled state | PASS: all four disabled, opacity 1, text/fill `rgb(23, 32, 51)` |
| Keyboard Enter / Space | PASS: answer activation, result focus, Tab to PDF link |
| Next / Previous / restart | PASS: no stale labels; feedback resets; prior attempt status retained |
| Progress | PASS: wrong records wrong; later correct clears wrong; same question ID |
| Reload / continue | PASS: 52 QA attempts retained; official paper 1 answered / 100%; resumes Q2; Previous shows Q1 prior correct |
| Practice | PASS: start, correct answer, original explanation/source, next |
| Mock | PASS: start 50, select A, submit 1 correct / 49 blank / score 2, review |
| Other tabs | PASS: wrong-question, weak-area, scope, home; no mobile overflow |
| Browser JavaScript errors | PASS: empty error log |
| Automated regression | PASS: 16 key/selection combinations; repeated activation does not save/rescore; unrelated state retained |
| Inline JS / test-script syntax and diff whitespace | PASS |

Source comparison confirmed shared CSS is unchanged, application JavaScript before
`renderPastQuiz` is identical, `answerPast` scoring/storage statements are identical,
and everything from `pastNext` onward is identical to baseline. This includes the
self-authored DB, parser/cache, Practice/Mock and navigation.
Practice's existing native-disabled dim text is intentionally unchanged; Mock still
uses its original enabled selected state. Neither receives official-answer labels.

### Contrast

| Text / background | Ratio |
|---|---:|
| Option `#172033` / white | 16.27:1 |
| Option `#172033` / correct `#ecfdf3` | 15.42:1 |
| Option `#172033` / wrong `#fef3f2` | 14.96:1 |
| Correct label `#087443` / `#ecfdf3` | 5.55:1 |
| Wrong label `#b42318` / `#fef3f2` | 6.05:1 |
| Source `#596579` / feedback `#f8fafc` | 5.63:1 |
| PDF link `#4f46e5` / feedback `#f8fafc` | 6.01:1 |

Computed rendered colors were checked using relative luminance; all exceed 4.5:1.

## Repeatable automated check

```text
node scripts/test_past_answer_feedback.cjs
node --check scripts/test_past_answer_feedback.cjs
git diff --check
```

The test evaluates shipped `answerPast` with minimal DOM doubles and synthetic
options, including HTML-special characters. It verifies state writes, repeat guard,
escaping, source disclosure, labels and focus, not browser CSS/layout.

## Browser setup and limitations

Local Chromium QA used the actual application and PDF.js, with downloaded official
PDFs/mirror/PDF.js from #43 served at same-origin URLs for deterministic loading.
Mock confirmation was auto-accepted by the test-only fixture. QA storage was confined
to localhost; production and Dev Preview storage were not touched.

Actual Safari/iPhone, VoiceOver and native confirmation-dialog interaction were not
tested. The WebKit text-fill override's computed value was checked in Chromium;
this is not Safari verification. No Product Verify or production verification claimed.
