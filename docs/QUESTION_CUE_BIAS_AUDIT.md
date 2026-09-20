# Self-authored Question Cue-Bias Audit

Issue: #14

## Purpose
Audit the self-authored IPAS AI Trainer question bank for answer cues that let a user guess the correct option without understanding the underlying concept.

This report is diagnostic only. It does not modify question content.

## Dataset
- Total self-authored questions: 483
- Subjects:
  - L11: 72
  - L12: 75
  - L21: 108
  - L22: 111
  - L23: 117

## Key Findings

### 1. Correct-option length is a systemic cue
- 444 / 483 questions have a correct option that is uniquely the longest choice.
- 450 / 483 have a correct-option length >= 1.5x the average distractor length.
- 291 / 483 have a ratio >= 2.0x.
- 132 / 483 have a ratio >= 2.5x.
- 66 / 483 have a ratio >= 3.0x.
- 336 / 483 have a uniquely longest correct option that exceeds the longest distractor by at least 10 non-space characters.
- 84 / 483 exceed the longest distractor by at least 20 characters.

This strongly supports the Google Form feedback that answer length is often usable as a guessing cue.

### 2. Q424 is a confirmed high-risk example
Q424 (L23 / L23201 / L1-L2 regularization):
- Option lengths: 14 / 18 / 37 / 13
- Correct option: C
- Correct / distractor-average length ratio: 2.47x
- Correct option exceeds the longest distractor by 19 characters

The user feedback is therefore consistent with the measured structure of the item.

### 3. Repeated option-set variants are widespread
- 109 repeated option-set groups were found.
- All 483 questions belong to a repeated option-set group.
- Many concept clusters use 3-6 variants built from the same answer/distractor set with reordered options and slightly different stems.

Examples include:
- Q172-Q177: Big Data 4V
- Q178-Q183: Train / Validation / Test
- Q184-Q189: Missing-value handling
- Q190-Q195: Classification vs regression
- Q196-Q201: Precision / Recall tradeoff
- Q202-Q207: Generative model types
- Q214-Q219: Zero-shot / Few-shot
- Q220-Q225: Temperature
- Q226-Q231: RAG chunking

This makes repeated practice more vulnerable to memorizing option patterns rather than learning the concept.

### 4. Answer position is not the main cue
Correct answer positions:
- A: 131
- B: 109
- C: 122
- D: 121

The distribution is reasonably balanced. The main problem is option construction, not answer-position bias.

## Subject-level signal

| Subject | Questions | Correct uniquely longest | Correct >= 2x distractor avg | Correct >= 3x |
| --- | ---: | ---: | ---: | ---: |
| L11 | 72 | 57 | 36 | 0 |
| L12 | 75 | 72 | 39 | 6 |
| L21 | 108 | 99 | 69 | 6 |
| L22 | 111 | 105 | 78 | 27 |
| L23 | 117 | 111 | 69 | 27 |

L22 and L23 show the strongest length-cue risk.

## High-risk examples
Representative severe cases include:
- Q163-Q165: Standard deviation
- Q142-Q144: Hyperparameter tuning
- Q046-Q048: Prompt injection
- Q154-Q156: RAG / vector retrieval
- Q127-Q129: Random Forest
- Q112-Q114: Re-identification risk
- Q340-Q345: Percentile / IQR
- Q388-Q393: Time-series validation
- Q424: L1 / L2 regularization

## Review Rules
A question should be reviewed when one or more of these signals occur:
1. Correct option is uniquely longest with a large margin.
2. Correct option is substantially more specific or qualified than every distractor.
3. Distractors are obviously absurd, unrelated, or at a different abstraction level.
4. The same option set is reused across several variants.
5. Stem wording or grammar makes only one option syntactically plausible.

Heuristics identify candidates only. They must not automatically rewrite or invalidate a question.

## Proposed remediation strategy

### Batch 1 - severe cue-bias set
Start with:
- Q424
- all items with correct/distractor length ratio >= 3.0
- repeated groups that contain obviously trivial distractors

For each reviewed item:
- keep the mapped level / subject / topic / concept;
- keep the intended learning objective;
- keep one unambiguous correct answer;
- rewrite distractors to be plausible misconceptions at the same semantic level;
- avoid making the correct option consistently more detailed than distractors;
- update explanation only when wording changes require it.

### Batch 2 - repeated option-set reduction
For concept clusters with 3-6 variants:
- keep genuinely different scenario or reasoning variants;
- replace near-duplicates that only shuffle the same four options;
- avoid teaching the answer through repetition.

### Batch 3 - regression audit
After edits:
- rerun length-cue metrics;
- verify answer-position balance;
- verify IDs remain unique;
- verify answer and explanation consistency;
- sample Practice and Mock rendering/scoring.

## Current conclusion
The Q424 feedback is valid and points to a broad question-quality issue. The next step should be a staged question rewrite, not a one-question patch and not an automatic bulk rewrite.
