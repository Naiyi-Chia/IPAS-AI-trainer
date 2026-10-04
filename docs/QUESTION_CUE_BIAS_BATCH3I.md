# Issue #57 — Batch 3I question cue remediation

Engineering evidence, 2026-09-29. Independent Technical Review remains pending; this is not Product Verify.

## Baseline and scope

- Contract: [Issue #57](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/57).
- Branch: `codex/issue-57-batch3i`.
- Baseline: `d181b47bb381193f6fb9f9fb49615e46168366ae`, fetched `question/issue-14-remediation` head, identical to the pre-created scoped branch. Batch 3H was already integrated.
- Exactly 23 self-authored items: Q412–Q423, Q425–Q429, Q442–Q447. Q424 (Batch 1A) is explicitly excluded and unchanged.
- Only question, options and explanation changed. IDs/order, level, subject/topic, concept, difficulty, answer indices, sourceType and all other fields remain unchanged, as do non-question DB metadata and the HTML/CSS/JS shell.
- Official content, source links, UI and localStorage unchanged. No dependencies added. Audit script adds only batch3i; all twelve prior batch definitions are preserved.

## Reproducible audit

```powershell
python scripts/audit_question_cues.py --batch batch3i --baseline d181b47bb381193f6fb9f9fb49615e46168366ae --csv docs/QUESTION_CUE_BIAS_BATCH3I.csv
node scripts/test_past_answer_feedback.cjs
python scripts/serve_question_batch1a.py --batch batch3i
git diff --check
```

The [CSV](QUESTION_CUE_BIAS_BATCH3I.csv) contains 966 data rows: 483 before and 483 after. Length counts Unicode code points excluding whitespace; ratio compares the correct option with mean distractor length. Repeated sets ignore option order and whitespace.

| Whole-bank metric | Before | After |
|---|---:|---:|
| Questions / unique IDs | 483 / 483 | 483 / 483 |
| Unique longest correct option | 234 | 217 |
| Correct-length ratio ≥ 2 | 35 | 12 |
| Correct-length ratio ≥ 3 | 0 | 0 |
| Repeated option-set groups | 52 | 48 |
| Questions in repeated sets | 227 | 204 |
| Answer A / B / C / D | 131 / 109 / 122 / 121 | 131 / 109 / 122 / 121 |

Scoped validation PASS: all 23 ratios below 2 (0.9231–1.1667), all option sets unique across the whole bank. Remaining uniquely longest keys: Q413 (1.0588), Q426 (1.0952), Q427 (1.0615), Q429 (1.1163), Q442 (1.1667), Q446 (1.0909). These small differences carry mathematical or operational meaning rather than a correct-only long definition; all flags remain visible. Heuristics do not replace editorial review. Remaining whole-bank flags are outside scope.

## Editorial review

Engineering Agent reviewed all 23 items for one defensible key, answer/explanation consistency, distinct decision points, plausible misconceptions, grammatical cues and completeness cues. No contract or protected metadata changes were needed.

| Cluster | Distinct checks | Boundaries |
|---|---|---|
| Q412–Q417 Dot product / cosine | normalization formula, linear score with bias, unit vectors, positive scaling, opposite directions, ranking by magnitude versus angle | Nonzero vectors; cosine and dot product differ except under relevant normalization. Arithmetic keeps signs and bias. |
| Q418–Q423 Learning rate | controlled oscillation diagnosis, numerical gradient descent, step proportionality, scheduling, validation selection, quadratic divergence | Explicit ordinary SGD without momentum/adaptation where calculated. Lower learning rate is a controlled experiment, not a convergence guarantee. Test set is held out. |
| Q425–Q429 L1/L2 | penalty gradient, penalty values, train/validation tradeoff, feature units, soft thresholding | State squared L2 convention and half factor. Ordinary gradient descent result is not a universal AdamW equivalence. Validation losses exclude penalties. Threshold formula is explicitly given. |
| Q442–Q447 RNN/LSTM | recurrent state, forget gate, shared parameters, independent-sequence reset, long dependency limits, causal deployment | LSTM does not guarantee arbitrary memory. Sequence length does not create new shared weights. Streaming must not access future observations. |

The final editorial pass refined Q418 and Q446 distractors into operational misconceptions and checked Q413 arithmetic. Each item's rationale and exact before/after content follow below.

## QA evidence

- Scoped audit PASS: exact 23 changed IDs; 483 unique IDs; four distinct options; valid keys and topic references; all protected fields, Q424, other questions, DB metadata and shell preserved.
- All twelve old audit batch definitions unchanged. All 966 CSV rows and 23 report sections checked against the DB. Audit and fixture Python AST parsing PASS.
- Node compiled the page's one inline script with new Function; PASS.
- Official-answer regression PASS: 16 answer/selection combinations, repeat guard, progress, escaping, PDF entry, no duplicates/placeholders, navigation/reset and completion scoring.
- Browser: in-app Chromium at `http://127.0.0.1:8766/batch3i`, desktop 1280×900 and mobile 375×812.
- Practice covered all 23 revised items, first 12 desktop and remaining 11 mobile. Q419 deliberately answered A; all others correctly. Feedback, keys, explanations, source label and navigation checked. Desktop IDs: Q420, Q423, Q422, Q416, Q417, Q443, Q429, Q428, Q446, Q425, Q412, Q419. Mobile IDs: Q426, Q418, Q413, Q444, Q442, Q421, Q415, Q445, Q447, Q414, Q427.
- Wrong-question view contained only Q419. Weak-area statistics: L23103 5/6 (83%); L23102 and L23203 6/6; L23201 5/5.
- L23 mock covered all 23 items, 12 desktop and 11 mobile. Submission: 22 correct, one wrong, zero unanswered, score 96. Wrong-only review showed Q419 selected A (2.4), correct B (1.6), with the gradient calculation.
- Screenshots inspected: desktop Practice Q419, mobile Practice Q427 and mobile expanded mock review Q419. Mobile Practice and review measured innerWidth 375 and document scrollWidth 360, no page-level horizontal overflow. Tab bar remained scrollable and usable.
- All seven tabs opened. Official scope links rendered; 115 second-session L11 structured past paper loaded with 50 questions, official label, controls and original PDF link.
- Browser warning/error log empty. Temporary viewport override reset. Final git diff --check PASS before commit.

Limits: the existing fixture narrows the self-authored DB to this batch, uses memory storage, auto-accepts confirmation and disables PDF prewarming. QA covers changed content rendering/scoring, not persistent localStorage, native dialogs, full 50-question sampling, live PDF extraction, physical mobile devices, Dev Preview or production. Unchanged app and official code are protected by the shell assertion. No implementation blocker remains; independent review is pending.

## Technical references

- [scikit-learn cosine similarity](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html): normalized inner product.
- [scikit-learn linear models](https://scikit-learn.org/stable/modules/linear_model.html): L1/L2 penalties and regularization.
- [PyTorch SGD](https://docs.pytorch.org/docs/main/generated/torch.optim.sgd.SGD_class.html): gradient update and weight-decay term.
- [PyTorch LSTM](https://docs.pytorch.org/docs/2.14/generated/torch.nn.modules.rnn.LSTM.html): gate and recurrent-state equations.

These are technical references for self-authored exercises, not official iPAS question attribution.

## Per-question before / after

### Q412

Preserved: L23 / L23102; level 中級; difficulty medium; concept Dot Product / Cosine; key C.

**Before** — lengths 17/28/41/7; ratio 2.3654; flags: length>=2x;unique-longest-correct;repeated-option-set.

Embedding 搜尋要比較兩個向量方向是否接近，常使用哪個相似度？

- A. 向量維度不同仍可直接內積而不需處理
- B. cosine similarity 越接近 −1 代表方向越相同
- C. 內積可衡量向量方向與大小關係；cosine similarity 以夾角衡量方向相似度
- D. 內積只適用字串

Answer: C

Explanation: 向量內積是線性代數與 ML 的基本運算；Cosine similarity = dot/(norms)，常用於語意向量相似度。
**After** — lengths 18/17/18/18; ratio 1.0189; flags: none.

在同一向量空間比較兩個非零向量，目標是只比較方向，且不受任一向量乘上正數的影響。哪種分數符合這項需求？

- A. 原始內積，以各座標乘積的總和作為分數
- B. 歐氏距離，以各座標差的平方和開根號
- C. 餘弦相似度，以內積除以兩向量範數乘積
- D. 範數乘積，以兩向量的長度相乘作為分數

Answer: C

Explanation: 餘弦相似度為內積除以範數乘積，對非零向量的正倍數縮放不變。原始內積、歐氏距離及範數乘積一般會受大小影響；方向相似也不保證語意或任務結果一定正確。

### Q413

Preserved: L23 / L23102; level 中級; difficulty medium; concept Dot Product / Cosine; key C.

**Before** — lengths 28/17/41/7; ratio 2.3654; flags: length>=2x;unique-longest-correct;repeated-option-set.

神經網路線性層與 attention 中大量使用的向量基本運算之一是？

- A. cosine similarity 越接近 −1 代表方向越相同
- B. 向量維度不同仍可直接內積而不需處理
- C. 內積可衡量向量方向與大小關係；cosine similarity 以夾角衡量方向相似度
- D. 內積只適用字串

Answer: C

Explanation: 向量內積是線性代數與 ML 的基本運算；Cosine similarity = dot/(norms)，常用於語意向量相似度。
**After** — lengths 17/17/18/17; ratio 1.0588; flags: unique-longest-correct.

線性層的一個輸出為 w·x＋b，其中 w＝(2,−1)、x＝(3,4)、b＝1。這個輸出值是多少？

- A. 11，將兩項乘積都視為正值再加偏置
- B. 9，將各座標與偏置直接相加而未相乘
- C. 3，將相同位置的元素相乘求和再加偏置
- D. 2，只計算元素乘積總和而未加入偏置

Answer: C

Explanation: w·x＝2×3＋(−1)×4＝2，再加偏置 1 得 3。內積需保留符號並對齊座標；此處沒有再除以向量範數，也不是先逐項相加。

### Q414

Preserved: L23 / L23102; level 中級; difficulty medium; concept Dot Product / Cosine; key A.

**Before** — lengths 41/28/17/7; ratio 2.3654; flags: length>=2x;unique-longest-correct;repeated-option-set.

某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，兩個已正規化向量的 cosine similarity 與 dot product 有何關係？

- A. 內積可衡量向量方向與大小關係；cosine similarity 以夾角衡量方向相似度
- B. cosine similarity 越接近 −1 代表方向越相同
- C. 向量維度不同仍可直接內積而不需處理
- D. 內積只適用字串

Answer: A

Explanation: 向量內積是線性代數與 ML 的基本運算；Cosine similarity = dot/(norms)，常用於語意向量相似度。
**After** — lengths 16/16/17/17; ratio 0.9600; flags: none.

兩個非零向量皆已做 L2 正規化，範數各為 1；它們的內積為 0.6。餘弦相似度為多少？

- A. 0.6，因分母的兩個範數乘積為 1
- B. 0.3，因分母需改成兩個範數相加
- C. 0.36，因正規化後還要把內積平方
- D. 1.0，因單位向量之間必定方向相同

Answer: A

Explanation: Cosine＝dot／(norms)＝0.6／(1×1)＝0.6。單位長度不表示方向相同；正規化後的內積已等於 cosine，不需另除以 2 或平方。

### Q415

Preserved: L23 / L23102; level 中級; difficulty medium; concept Dot Product / Cosine; key B.

**Before** — lengths 17/41/28/7; ratio 2.3654; flags: length>=2x;unique-longest-correct;repeated-option-set.

下列對 dot product 與 cosine similarity 的敘述何者較正確？

- A. 向量維度不同仍可直接內積而不需處理
- B. 內積可衡量向量方向與大小關係；cosine similarity 以夾角衡量方向相似度
- C. cosine similarity 越接近 −1 代表方向越相同
- D. 內積只適用字串

Answer: B

Explanation: 向量內積是線性代數與 ML 的基本運算；Cosine similarity = dot/(norms)，常用於語意向量相似度。
**After** — lengths 16/16/15/17; ratio 1.0000; flags: none.

保持非零向量 b 不變，把非零向量 a 改成 3a。比較原本與修改後的內積及餘弦相似度，哪項正確？

- A. 內積不變，餘弦相似度變為原本三倍
- B. 內積變為原本三倍，餘弦相似度不變
- C. 內積與餘弦相似度都變為原本三倍
- D. 內積與餘弦相似度都不受此次縮放影響

Answer: B

Explanation: (3a)·b＝3(a·b)，而 ||3a||＝3||a||，因此 cosine 的分子與分母同倍放大而相消。這裡是正倍數縮放；負倍數會翻轉方向與 cosine 的符號。

### Q416

Preserved: L23 / L23102; level 中級; difficulty medium; concept Dot Product / Cosine; key B.

**Before** — lengths 28/41/17/7; ratio 2.3654; flags: length>=2x;unique-longest-correct;repeated-option-set.

若兩向量方向完全相同，cosine similarity 通常接近？

- A. cosine similarity 越接近 −1 代表方向越相同
- B. 內積可衡量向量方向與大小關係；cosine similarity 以夾角衡量方向相似度
- C. 向量維度不同仍可直接內積而不需處理
- D. 內積只適用字串

Answer: B

Explanation: 向量內積是線性代數與 ML 的基本運算；Cosine similarity = dot/(norms)，常用於語意向量相似度。
**After** — lengths 14/14/15/15; ratio 0.9545; flags: none.

兩個非零向量滿足 b＝−2a，且座標位於同一向量空間。它們的餘弦相似度是多少？

- A. 1，因兩個向量位於同一直線上
- B. −1，因兩個向量方向完全相反
- C. 0，因一個向量含有負的比例係數
- D. −2，因相似度等於兩向量的比例

Answer: B

Explanation: 負比例係數表示方向相反，cosine＝−1。共線不一定同向；cosine 在 −1 到 1 之間，不會等於縮放倍率 −2。

### Q417

Preserved: L23 / L23102; level 中級; difficulty medium; concept Dot Product / Cosine; key B.

**Before** — lengths 28/41/7/17; ratio 2.3654; flags: length>=2x;unique-longest-correct;repeated-option-set.

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，為何文本 embedding 常用 cosine similarity 做近鄰搜尋？

- A. cosine similarity 越接近 −1 代表方向越相同
- B. 內積可衡量向量方向與大小關係；cosine similarity 以夾角衡量方向相似度
- C. 內積只適用字串
- D. 向量維度不同仍可直接內積而不需處理

Answer: B

Explanation: 向量內積是線性代數與 ML 的基本運算；Cosine similarity = dot/(norms)，常用於語意向量相似度。
**After** — lengths 19/19/17/18; ratio 1.0556; flags: none.

查詢 q＝(1,0)，候選 a＝(2,0)、b＝(3,4)。只比較這兩個候選，使用原始內積與餘弦相似度的 Top-1 各是誰？

- A. 內積選 a，餘弦選 b，因兩者使用不同分母
- B. 內積選 b，餘弦選 a，因範數影響原始內積
- C. 兩者都選 b，因 b 的第一個座標比較大
- D. 兩者都選 a，因 a 與查詢的方向完全相同

Answer: B

Explanation: q·a＝2、q·b＝3，因此原始內積選 b。cos(q,a)＝1、cos(q,b)＝3/5＝0.6，因此 cosine 選 a。是否保留向量大小資訊應配合模型與檢索目標，不能認定兩種排序永遠相同。

### Q418

Preserved: L23 / L23103; level 中級; difficulty medium; concept Learning Rate; key A.

**Before** — lengths 32/10/12/12; ratio 2.8235; flags: length>=2x;unique-longest-correct;repeated-option-set.

模型 loss 在最佳值附近劇烈震盪甚至發散，第一個可檢查的超參數之一是？

- A. 學習率過大可能震盪／發散，過小則收斂慢；需透過驗證與排程適當調整
- B. 學習率與梯度更新無關
- C. 學習率越大一定越快且越準
- D. 學習率只影響資料儲存大小

Answer: A

Explanation: Learning rate 控制每次參數更新步幅，是重要超參數。過高／過低都可能造成訓練問題。
**After** — lengths 20/19/19/20; ratio 1.0345; flags: none.

同一訓練設定把學習率提高後，loss 開始大幅震盪。資料及梯度計算已檢查無明顯異常，下一個最直接的對照實驗是？

- A. 降低學習率重跑，保持其他設定不變比較曲線
- B. 加大學習率重跑，藉較大步幅跳過震盪區域
- C. 沿用目前學習率，只延長訓練而不比較步幅
- D. 只增加驗證頻率，保持目前更新步幅繼續訓練

Answer: A

Explanation: 過大步幅可能在低損失區附近反覆跨越或發散，降低學習率的受控實驗可檢查此原因。震盪並非只可能來自學習率，仍需結合梯度、資料及優化器診斷；只延長訓練或增加驗證頻率沒有對照步幅因素。

### Q419

Preserved: L23 / L23103; level 中級; difficulty medium; concept Learning Rate; key B.

**Before** — lengths 10/32/12/12; ratio 2.8235; flags: length>=2x;unique-longest-correct;repeated-option-set.

訓練非常穩定但下降極慢，可能與 learning rate 哪種情況有關？

- A. 學習率與梯度更新無關
- B. 學習率過大可能震盪／發散，過小則收斂慢；需透過驗證與排程適當調整
- C. 學習率越大一定越快且越準
- D. 學習率只影響資料儲存大小

Answer: B

Explanation: Learning rate 控制每次參數更新步幅，是重要超參數。過高／過低都可能造成訓練問題。
**After** — lengths 15/15/15/16; ratio 0.9783; flags: none.

使用無動量、無正則化的梯度下降，w＝2、梯度為 4、學習率 η＝0.1。依 w_new＝w−ηg 更新一次後，w_new 是多少？

- A. 2.4，沿正梯度方向加上更新量
- B. 1.6，沿負梯度方向減去更新量
- C. 0.4，只保留學習率與梯度乘積
- D. −2.0，直接減去梯度而忽略步幅

Answer: B

Explanation: 更新量為 0.1×4＝0.4，w_new＝2−0.4＝1.6。題目明定一般梯度下降，沒有動量、正則化或自適應縮放，因此可直接使用給定公式。

### Q420

Preserved: L23 / L23103; level 中級; difficulty medium; concept Learning Rate; key D.

**Before** — lengths 10/12/12/32; ratio 2.8235; flags: length>=2x;unique-longest-correct;repeated-option-set.

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，下列對 Learning Rate 的敘述何者正確？

- A. 學習率與梯度更新無關
- B. 學習率越大一定越快且越準
- C. 學習率只影響資料儲存大小
- D. 學習率過大可能震盪／發散，過小則收斂慢；需透過驗證與排程適當調整

Answer: D

Explanation: Learning rate 控制每次參數更新步幅，是重要超參數。過高／過低都可能造成訓練問題。
**After** — lengths 19/19/18/19; ratio 1.0179; flags: none.

同一參數位置、同一非零梯度，使用無動量的 SGD；其他設定不變，學習率由 0.01 改成 0.001。單次更新量的大小如何變化？

- A. 變為原本十倍，因較小學習率增加更新幅度
- B. 保持原本大小，因梯度相同就會有相同更新
- C. 方向改為相反，因學習率跨過小數點門檻
- D. 變為原本十分之一，因步幅與學習率成正比

Answer: D

Explanation: 在給定梯度且無其他修正時，更新量為 −ηg；正學習率縮為十分之一，大小也縮為十分之一而方向不變。這只比較同一位置的單步，不能推出整段訓練一定耗時十倍。

### Q421

Preserved: L23 / L23103; level 中級; difficulty medium; concept Learning Rate; key C.

**Before** — lengths 12/12/32/10; ratio 2.8235; flags: length>=2x;unique-longest-correct;repeated-option-set.

某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，使用 scheduler 在訓練後期降低 learning rate，主要目的可能是？

- A. 學習率越大一定越快且越準
- B. 學習率只影響資料儲存大小
- C. 學習率過大可能震盪／發散，過小則收斂慢；需透過驗證與排程適當調整
- D. 學習率與梯度更新無關

Answer: C

Explanation: Learning rate 控制每次參數更新步幅，是重要超參數。過高／過低都可能造成訓練問題。
**After** — lengths 14/16/14/15; ratio 0.9333; flags: none.

訓練前期需要較快移動，後期希望減小參數更新以細調。學習率排程逐步降低 η，主要是在調整什麼？

- A. 逐步減少模型的可訓練參數數量
- B. 逐步減少訓練資料中使用的特徵數量
- C. 逐步縮小給定梯度下的更新步幅
- D. 逐步縮小每筆輸入資料的儲存大小

Answer: C

Explanation: 降低學習率是在控制優化步幅，不會自動刪除模型參數、輸入特徵或壓縮資料。後期較小步幅可能有助細調，但仍需用實際訓練與驗證曲線判斷排程是否合適。

### Q422

Preserved: L23 / L23103; level 中級; difficulty medium; concept Learning Rate; key A.

**Before** — lengths 32/10/12/12; ratio 2.8235; flags: length>=2x;unique-longest-correct;repeated-option-set.

如果把學習率從 1e-4 突然改成 1，最可能造成什麼？

- A. 學習率過大可能震盪／發散，過小則收斂慢；需透過驗證與排程適當調整
- B. 學習率與梯度更新無關
- C. 學習率越大一定越快且越準
- D. 學習率只影響資料儲存大小

Answer: A

Explanation: Learning rate 控制每次參數更新步幅，是重要超參數。過高／過低都可能造成訓練問題。
**After** — lengths 24/24/24/21; ratio 1.0435; flags: none.

團隊要從四個候選學習率中選一個，已有固定訓練／驗證／測試切分。哪種比較流程較能避免用測試集調參？

- A. 固定比較條件，以驗證表現選擇，再用保留測試集評估
- B. 固定比較條件，以測試表現選擇，再回報同一測試分數
- C. 只比較訓練第一步的 loss，選最低者作為最終設定
- D. 只比較學習率數值大小，選最大者縮短調參流程

Answer: A

Explanation: 學習率屬超參數，可在可比較訓練預算及資料切分下用驗證集選擇，保留測試集供最後評估。用測試分數反覆挑設定會洩漏評估資訊；單一步 loss 或數值大小不足以決定泛化表現。

### Q423

Preserved: L23 / L23103; level 中級; difficulty medium; concept Learning Rate; key D.

**Before** — lengths 12/10/12/32; ratio 2.8235; flags: length>=2x;unique-longest-correct;repeated-option-set.

梯度下降中的 learning rate 主要控制什麼？

- A. 學習率越大一定越快且越準
- B. 學習率與梯度更新無關
- C. 學習率只影響資料儲存大小
- D. 學習率過大可能震盪／發散，過小則收斂慢；需透過驗證與排程適當調整

Answer: D

Explanation: Learning rate 控制每次參數更新步幅，是重要超參數。過高／過低都可能造成訓練問題。
**After** — lengths 14/14/14/14; ratio 1.0000; flags: none.

對 f(w)＝w²/2 使用完整梯度下降，固定 η＝3、初值 w＝1。由梯度 g＝w 可得 w_new＝(1−η)w。持續更新將如何變化？

- A. 保持正號並縮小，逐步靠近零點
- B. 正負交替且縮小，逐步靠近零點
- C. 維持原值不動，因初始梯度為零
- D. 正負交替且放大，逐步遠離零點

Answer: D

Explanation: 更新倍率為 1−3＝−2，序列為 1、−2、4、−8，正負交替且絕對值放大。這個明確二次函數例子展示過大学習率的發散，不是宣稱 η＝3 對所有模型都必然發散。

### Q425

Preserved: L23 / L23201; level 中級; difficulty hard; concept L1 / L2 正則化; key D.

**Before** — lengths 18/14/13/37; ratio 2.4667; flags: length>=2x;unique-longest-correct;repeated-option-set.

某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，深度模型權重過大且過擬合，加入 weight decay 通常更接近哪種正則化？

- A. 正則化一定讓訓練準確率提高到 100%
- B. L1/L2 只用來增加模型參數
- C. L2 會把所有權重直接設成 0
- D. L1 常促進稀疏權重；L2 以平方權重懲罰抑制過大參數，兩者都可幫助控制過擬合

Answer: D

Explanation: 正則化在 loss 中加入權重懲罰，以限制模型複雜度。L1 與 L2 的數學效果不同。
**After** — lengths 24/24/30/24; ratio 0.9231; flags: none.

目標函數為資料損失＋(λ/2)Σw_i²，採無動量的一般梯度下降，步長 η。資料損失梯度記為 g，更新式應是哪一個？

- A. w_new＝w−ηg−λw，忽略懲罰項的步長縮放
- B. w_new＝w−ηg＋ηλw，沿增加權重方向更新
- C. w_new＝w−ηg−ηλ sign(w)，使用絕對值懲罰梯度
- D. w_new＝w−ηg−ηλw，加入平方懲罰的梯度

Answer: D

Explanation: (λ/2)Σw_i² 對 w 的梯度為 λw，因此更新為 (1−ηλ)w−ηg。此等價形式限於題目指定的一般梯度下降；不能直接將自適應優化器的 L2 懲罰與解耦 weight decay 一概視為相同。

### Q426

Preserved: L23 / L23201; level 中級; difficulty hard; concept L1 / L2 正則化; key D.

**Before** — lengths 13/18/14/37; ratio 2.4667; flags: length>=2x;unique-longest-correct;repeated-option-set.

某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，比較 L1 與 L2，下列哪個敘述較正確？

- A. L2 會把所有權重直接設成 0
- B. 正則化一定讓訓練準確率提高到 100%
- C. L1/L2 只用來增加模型參數
- D. L1 常促進稀疏權重；L2 以平方權重懲罰抑制過大參數，兩者都可幫助控制過擬合

Answer: D

Explanation: 正則化在 loss 中加入權重懲罰，以限制模型複雜度。L1 與 L2 的數學效果不同。
**After** — lengths 21/21/21/23; ratio 1.0952; flags: unique-longest-correct.

只計算正則化項，權重 w＝(−2,3)，係數 λ＝1，且 L2 定義為平方和、沒有 1/2 因子。L1 與 L2 的值分別為何？

- A. L1＝1、L2＝13，先把帶符號的係數相加
- B. L1＝5、L2＝5，兩者都計算係數絕對值和
- C. L1＝13、L2＝5，將兩種懲罰的公式互換
- D. L1＝5、L2＝13，分別計算絕對值和及平方和

Answer: D

Explanation: L1＝|−2|＋|3|＝5；L2 平方懲罰＝(−2)²＋3²＝13。題目明定平方和與係數，避免不同慣例的 1/2 因子或 L2 範數開根號造成歧義。

### Q427

Preserved: L23 / L23201; level 中級; difficulty hard; concept L1 / L2 正則化; key A.

**Before** — lengths 37/18/13/14; ratio 2.4667; flags: length>=2x;unique-longest-correct;repeated-option-set.

某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，正則化為什麼可能降低訓練集表現但改善測試集泛化？

- A. L1 常促進稀疏權重；L2 以平方權重懲罰抑制過大參數，兩者都可幫助控制過擬合
- B. 正則化一定讓訓練準確率提高到 100%
- C. L2 會把所有權重直接設成 0
- D. L1/L2 只用來增加模型參數

Answer: A

Explanation: 正則化在 loss 中加入權重懲罰，以限制模型複雜度。L1 與 L2 的數學效果不同。
**After** — lengths 23/22/22/21; ratio 1.0615; flags: unique-longest-correct.

特徵已標準化。增加正則化強度後，訓練資料損失略升、驗證資料損失下降；兩者都未含懲罰項。哪個解讀最合理？

- A. 限制擬合程度可能減少過擬合，仍應以驗證證據判斷
- B. 訓練資料損失上升就代表失敗，無須檢查驗證結果
- C. 驗證資料損失下降表示資料被刪除，須先還原樣本
- D. 正則化強度愈高泛化必愈好，應持續加大到上限

Answer: A

Explanation: 正則化可能犧牲部分訓練擬合以降低變異並改善泛化，但不是越強越好，也可能欠擬合。此處比較的是同一定義的資料損失，不應將含懲罰的總目標與純資料損失混為一談。

### Q428

Preserved: L23 / L23201; level 中級; difficulty hard; concept L1 / L2 正則化; key D.

**Before** — lengths 18/13/14/37; ratio 2.4667; flags: length>=2x;unique-longest-correct;repeated-option-set.

如果目標是控制模型複雜度而不是增加資料，下列哪項可考慮？

- A. 正則化一定讓訓練準確率提高到 100%
- B. L2 會把所有權重直接設成 0
- C. L1/L2 只用來增加模型參數
- D. L1 常促進稀疏權重；L2 以平方權重懲罰抑制過大參數，兩者都可幫助控制過擬合

Answer: D

Explanation: 正則化在 loss 中加入權重懲罰，以限制模型複雜度。L1 與 L2 的數學效果不同。
**After** — lengths 19/20/21/21; ratio 1.0500; flags: none.

同一個線性預測模型把長度特徵由公尺改成公分，對應係數可縮小 100 倍而預測不變。若仍直接套相同 L2 係數懲罰，主要問題是？

- A. 預測不變，所以正則化成本也必定保持不變
- B. 樣本數沒有改變，所以所有懲罰都會自行抵銷
- C. 係數縮小後，L2 對該係數的懲罰會變為一萬倍
- D. 單位改變會改變懲罰成本，需處理特徵尺度差異

Answer: D

Explanation: 係數縮小 100 倍後，其平方懲罰縮為萬分之一，雖然預測可相同，正則化成本卻不同。因此常先標準化或依需求處理尺度；轉換參數應僅由訓練資料估計，不能用完整資料洩漏驗證資訊。

### Q429

Preserved: L23 / L23201; level 中級; difficulty hard; concept L1 / L2 正則化; key C.

**Before** — lengths 13/14/37/18; ratio 2.4667; flags: length>=2x;unique-longest-correct;repeated-option-set.

在損失函數加入參數大小懲罰，主要目的是？

- A. L2 會把所有權重直接設成 0
- B. L1/L2 只用來增加模型參數
- C. L1 常促進稀疏權重；L2 以平方權重懲罰抑制過大參數，兩者都可幫助控制過擬合
- D. 正則化一定讓訓練準確率提高到 100%

Answer: C

Explanation: 正則化在 loss 中加入權重懲罰，以限制模型複雜度。L1 與 L2 的數學效果不同。
**After** — lengths 14/15/16/14; ratio 1.1163; flags: unique-longest-correct.

一個參數的 L1 子問題為最小化 (w−0.3)²/2＋0.5|w|。依軟閾值解 sign(z)max(|z|−λ,0)，最優 w 是多少？

- A. 0.3，保留沒有正則化時的解
- B. −0.2，直接減 λ 而略過零門檻
- C. 0，因 |0.3| 未超過閾值 0.5
- D. 0.8，將 λ 加回資料擬合的解

Answer: C

Explanation: 代入 z＝0.3、λ＝0.5，max(0.3−0.5,0)＝0，所以最優 w＝0。這說明 L1 可以產生恰為零的係數；並非所有資料或任意懲罰強度都會把所有係數歸零。

### Q442

Preserved: L23 / L23203; level 中級; difficulty medium; concept RNN / LSTM; key A.

**Before** — lengths 39/12/16/15; ratio 2.7209; flags: length>=2x;unique-longest-correct;repeated-option-set.

早期語音／時間序列模型需要利用前面時間步資訊，常見的神經網路類型是？

- A. RNN/LSTM 透過循環狀態處理序列；LSTM 以閘門機制改善長期依賴與梯度問題
- B. RNN 不保留任何序列狀態
- C. LSTM 的所有時間步彼此完全獨立
- D. LSTM 是影像像素分割專用模型

Answer: A

Explanation: RNN 以 hidden state 表示序列歷史；LSTM/GRU 透過閘門改善較長期依賴的學習。
**After** — lengths 21/18/18/18; ratio 1.1667; flags: unique-longest-correct.

單向 RNN 逐步讀入時間序列，更新式為 h_t＝tanh(Wx_t＋Uh_(t−1)＋b)。哪個項目讓目前狀態可以利用先前資訊？

- A. 前一步的 h_(t−1)，經循環權重參與更新
- B. 目前的 x_t，單獨包含所有未來時間步
- C. 固定的偏置 b，每一步自動保存完整歷史
- D. 輸出層的類別數，決定已觀測資料的內容

Answer: A

Explanation: h_(t−1) 將先前處理的資訊帶入目前狀態，與當下輸入一起更新。它是學得的有限表示，不是保證保存完整歷史；單向模型也不會因這個式子取得尚未觀測的未來輸入。

### Q443

Preserved: L23 / L23203; level 中級; difficulty medium; concept RNN / LSTM; key B.

**Before** — lengths 15/39/12/16; ratio 2.7209; flags: length>=2x;unique-longest-correct;repeated-option-set.

LSTM 相較基本 RNN 的設計重點是？

- A. LSTM 是影像像素分割專用模型
- B. RNN/LSTM 透過循環狀態處理序列；LSTM 以閘門機制改善長期依賴與梯度問題
- C. RNN 不保留任何序列狀態
- D. LSTM 的所有時間步彼此完全獨立

Answer: B

Explanation: RNN 以 hidden state 表示序列歷史；LSTM/GRU 透過閘門改善較長期依賴的學習。
**After** — lengths 18/18/18/20; ratio 0.9643; flags: none.

標準 LSTM 的 cell 更新為 c_t＝f_t⊙c_(t−1)＋i_t⊙g_t。若某維度 f_t 接近 0，對該維度舊 cell 資訊的直接作用為何？

- A. 增加舊資訊權重，讓前一刻內容保留更多
- B. 減少舊資訊權重，讓前一刻內容保留更少
- C. 直接決定最終類別，不再經過後續輸出層
- D. 把舊資訊變成新輸入，停止更新 cell 狀態

Answer: B

Explanation: forget gate f_t 直接乘上前一刻 cell 狀態，接近 0 時抑制這條路徑的舊資訊。新內容仍由 i_t⊙g_t 決定；forget gate 本身不是分類輸出。

### Q444

Preserved: L23 / L23203; level 中級; difficulty medium; concept RNN / LSTM; key D.

**Before** — lengths 16/15/12/39; ratio 2.7209; flags: length>=2x;unique-longest-correct;repeated-option-set.

下列哪一項正確描述 recurrent network？

- A. LSTM 的所有時間步彼此完全獨立
- B. LSTM 是影像像素分割專用模型
- C. RNN 不保留任何序列狀態
- D. RNN/LSTM 透過循環狀態處理序列；LSTM 以閘門機制改善長期依賴與梯度問題

Answer: D

Explanation: RNN 以 hidden state 表示序列歷史；LSTM/GRU 透過閘門改善較長期依賴的學習。
**After** — lengths 18/19/19/19; ratio 1.0179; flags: none.

某單向、單層 RNN 使用同一組循環權重處理每個時間步，輸入及 hidden 維度固定。序列長度從 10 增為 20，參數數量通常如何變化？

- A. 循環權重增為兩倍，因時間步數變為兩倍
- B. 輸入權重增為兩倍，因同一特徵被讀取兩次
- C. 偏置數量增為兩倍，因每一步需要獨立偏置
- D. 可訓練參數不變，因時間步共用同一組權重

Answer: D

Explanation: 一般 RNN 沿時間共享參數；序列加長增加展開計算及訓練時需處理的狀態，不會在固定架構下自動新增一組可訓練權重。參數量不變不代表運算或記憶體需求不變。

### Q445

Preserved: L23 / L23203; level 中級; difficulty medium; concept RNN / LSTM; key A.

**Before** — lengths 39/12/16/15; ratio 2.7209; flags: length>=2x;unique-longest-correct;repeated-option-set.

某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，序列資料中前後順序很重要，RNN 的 hidden state 主要扮演什麼角色？

- A. RNN/LSTM 透過循環狀態處理序列；LSTM 以閘門機制改善長期依賴與梯度問題
- B. RNN 不保留任何序列狀態
- C. LSTM 的所有時間步彼此完全獨立
- D. LSTM 是影像像素分割專用模型

Answer: A

Explanation: RNN 以 hidden state 表示序列歷史；LSTM/GRU 透過閘門改善較長期依賴的學習。
**After** — lengths 20/19/21/20; ratio 1.0000; flags: none.

stateful LSTM 的兩批資料來自互不相關的客戶，卻把前一批最終狀態接到下一批。若每位客戶的序列應獨立，應如何處理？

- A. 在客戶序列邊界重設狀態，避免混入他人歷史
- B. 只打亂下一批客戶順序，繼續沿用前批狀態
- C. 只把 hidden 維度加倍，繼續沿用前批狀態
- D. 只調低輸出分數門檻，讓混入的資訊較難顯示

Answer: A

Explanation: 互不相關序列不應共用前一人的 hidden/cell 狀態，需在正確邊界重設或明確管理狀態。相同序列的連續區段可能需要延續狀態，但仍需確保樣本對應與訓練截斷設定正確。

### Q446

Preserved: L23 / L23203; level 中級; difficulty medium; concept RNN / LSTM; key A.

**Before** — lengths 39/12/16/15; ratio 2.7209; flags: length>=2x;unique-longest-correct;repeated-option-set.

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，基本 RNN 遇到長期依賴困難時，常使用哪種改良架構？

- A. RNN/LSTM 透過循環狀態處理序列；LSTM 以閘門機制改善長期依賴與梯度問題
- B. RNN 不保留任何序列狀態
- C. LSTM 的所有時間步彼此完全獨立
- D. LSTM 是影像像素分割專用模型

Answer: A

Explanation: RNN 以 hidden state 表示序列歷史；LSTM/GRU 透過閘門改善較長期依賴的學習。
**After** — lengths 24/22/21/23; ratio 1.0909; flags: unique-longest-correct.

LSTM 以 cell 狀態與閘門改善基本 RNN 的長期依賴學習。對這項改善的能力界限，哪個說法較準確？

- A. 提供較易保留資訊的路徑，但不保證任意長度皆可學好
- B. 改以較長序列訓練，就足以取代驗證集的效果檢查
- C. 可直接關閉梯度監控，讓閘門自動負責穩定梯度
- D. 僅訓練最後時間步，讓 cell 取代跨時間反向傳播

Answer: A

Explanation: LSTM 的 cell 與閘門有助保留和選擇資訊、緩解部分梯度問題，但並非對所有長度、資料及訓練設定的保證。仍需檢查梯度、序列長度與驗證表現，也仍使用時間上的反向傳播。

### Q447

Preserved: L23 / L23203; level 中級; difficulty medium; concept RNN / LSTM; key C.

**Before** — lengths 15/12/39/16; ratio 2.7209; flags: length>=2x;unique-longest-correct;repeated-option-set.

比較 CNN 與 LSTM，下列哪項較符合 LSTM 的典型優勢？

- A. LSTM 是影像像素分割專用模型
- B. RNN 不保留任何序列狀態
- C. RNN/LSTM 透過循環狀態處理序列；LSTM 以閘門機制改善長期依賴與梯度問題
- D. LSTM 的所有時間步彼此完全獨立

Answer: C

Explanation: RNN 以 hidden state 表示序列歷史；LSTM/GRU 透過閘門改善較長期依賴的學習。
**After** — lengths 22/21/21/21; ratio 0.9844; flags: none.

串流系統必須在時間 t 當下輸出預測，且不能等待未來資料。比較完整序列的雙向 LSTM 與單向 LSTM，哪個設計較符合這項限制？

- A. 採雙向模型並讀取完整未來序列，再稱為即時結果
- B. 採雙向模型並使用未來真實值，只在測試時補齊
- C. 採單向模型只讀到 t，訓練評估也遵守可用資訊
- D. 隨機打亂時間順序訓練，讓未來資料不再有順序

Answer: C

Explanation: 即時因果預測只能使用當下可取得的資料。完整序列的雙向 LSTM 會利用未來上下文，適用於可取得全序列的工作，但不符合本題限制；訓練與評估也需避免未來資訊洩漏。
