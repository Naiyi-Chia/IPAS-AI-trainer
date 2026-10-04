# Issue #67 — Batch 5B remediation evidence

Baseline: `5d837bb` on `question/issue-14-remediation`, includes integrated #66.

## Validation

| Whole-bank metric | Before | After |
| --- | ---: | ---: |
| Self-authored questions / unique IDs | 483 | 483 |
| Uniquely longest correct option | 52 | 52 |
| Correct / average distractor length >= 2x | 0 | 0 |
| Repeated option-set groups | 4 | 0 |
| Questions in repeated option sets | 12 | 0 |

- Scoped audit PASS: exactly Q115–Q117, Q136–Q138, Q151–Q153 and Q160–Q162 changed. 483 questions / 483 unique IDs; ID order, protected metadata, answer indices, DB metadata and HTML/CSS/JS outside DB unchanged.
- All 12 reviewed items have no uniquely longest correct option and no repeated option set anywhere in the bank; maximum correct/average distractor length ratio 1.0645x (rounded), below 2x.
- Answer distribution unchanged: A 131 / B 109 / C 122 / D 121.
- Individual manual content review PASS for all 12; the after-explanations identify the single correct answer and explain distractors.
- Baseline inconsistencies were recorded in Issue #67 before editing: Q137/Q138 keyed inappropriate selection despite positive stems; Q115 keyed a theorem name rather than its function. Resolved through scoped stem/options/explanation rewrites, keeping every existing answer index and protected field. No scope expansion or metadata exception.
- Bayes computations verified: Q116 P(E)=0.5, posterior=0.8; Q117 P(E)=0.2, posterior=0.6. Hypotheses explicitly mutually exclusive and exhaustive; distinguishes conditional probability, prior, posterior and joint probability.
- Architecture questions assess resource constraints (only B meets all three Q136 requirements), chronological validation for forecasting and CPU/validation-based selection with an untouched final test set. Q137/Q138 remain keyed B.
- Precision/Recall uses explicit positive classes and populations: Q151 TP80/FN20/FP40 gives Recall80%; Q152 uses actual dangerous events as denominator; Q153 TP40/FP10/FN20 gives Precision80%, contrasted with Recall≈67%.
- Attention distinguishes Q–K score normalization, weighted Value aggregation (Q161 0.25×4+0.75×8=7) and encoder Value contribution in decoder cross-attention.
- Inline JS syntax PASS: one script compiled with Node vm.Script.
- Headless Edge QA PASS at 1280×900 and 375×900: all 12 scoped items render and score in Practice and Mock. Practice checks exact options, feedback, explanation and source label; Mock wrong-review checks question, submitted answer, key and explanation.
- Mock scores: L23 5/6 correct (83%); L11 2/3 (67%); L21 2/3 (67%). Each has one intentional wrong answer and zero blanks. Three native submission confirmations verified per viewport.
- Wrong-book records Q115 and removes it after correct retry; weak area L23101 displays 2/3 (67%). Official 115-year second-paper flow and all seven tabs PASS. No document horizontal overflow, page/console warnings/errors or HTTP errors. Mobile Practice screenshots visually checked for readable question/options/explanation/navigation.
- Browser fixture filters only self-authored DB records to the 12 scoped IDs for coverage. App logic/assets/official loader stay intact; fresh profiles preserve existing user progress.
- git diff --check: PASS.

References checked (2026-10-04): [scikit-learn metrics](https://scikit-learn.org/stable/modules/model_evaluation.html) for Precision/Recall; [scikit-learn cross-validation](https://sklearn.org/stable/modules/cross_validation.html) for selection and time-aware evaluation; [Dive into Deep Learning Attention](https://d2l.ai/chapter_attention-mechanisms-and-transformers/queries-keys-values.html) and [scoring functions](https://d2l.ai/chapter_attention-mechanisms-and-transformers/attention-scoring-functions.html) for Q/K/V and weighted aggregation. These support self-authored practice content, not official iPAS past-paper attribution.

Reproduce:

```text
python scripts/audit_question_cues.py --baseline 5d837bb --batch batch5b --csv docs/QUESTION_CUE_BIAS_BATCH5B.csv
NODE_PATH=<existing runtime node_modules> node scripts/test_question_batch5b.cjs <output-directory>
```

Evidence: [audit CSV](QUESTION_CUE_BIAS_BATCH5B.csv), [browser results](QUESTION_CUE_BIAS_BATCH5B_BROWSER.json), [mobile architecture Practice](qa/issue-67/practice-Q136-375.png), [mobile Attention Practice](qa/issue-67/practice-Q160-375.png).

## Individual content review

All items manually reviewed for one correct answer, semantic/grammatical parallelism and plausible distractors. Protected metadata and indices unchanged. These are self-authored practice items.

### Q115 — Bayes 定理 (key C)

Before: 某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，Bayes 定理主要用來做什麼？
- A. 梯度裁切
- B. 中央極限定理 μόνο
- C. Bayes 定理
- D. 畢氏定理
Before explanation: Bayes 定理用觀察到的證據更新先驗機率，得到後驗機率。

After: 驗證團隊已知假設 H 的先驗機率，並觀察到證據 E。Bayes 定理在此處的作用是什麼？
- A. 以 P(E|H) 直接取代 P(H|E)
- B. 以 P(H) 直接取代 P(H|E)
- C. 結合先驗與似然求出後驗機率
- D. 將 H 與 E 視為獨立後相乘
After explanation / single-answer review: Bayes 定理以 P(H|E)=P(E|H)P(H)/P(E) 更新假設的機率，前提是 P(E)>0。似然 P(E|H) 與後驗 P(H|E) 的條件方向不同，先驗也未納入證據；獨立性不能在沒有依據時自行假定。
Cue review: ratio 0.9070x; unique-longest=False; repeated set=False.

### Q116 — Bayes 定理 (key A)

Before: 某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，已知先驗機率與觀察證據的似然，希望更新事件機率，會用到？
- A. Bayes 定理
- B. 中央極限定理 μόνο
- C. 畢氏定理
- D. 梯度裁切
Before explanation: Bayes 定理用觀察到的證據更新先驗機率，得到後驗機率。

After: 某驗證資料中，兩種互斥且完備的狀態 H 與非 H 各占 50%。訊號 E 在 H 下出現的機率為 80%，在非 H 下為 20%。觀察到 E 後，P(H|E) 為何？
- A. 80%
- B. 50%
- C. 40%
- D. 20%
After explanation / single-answer review: P(E)=0.8×0.5+0.2×0.5=0.5，因此 P(H|E)=0.8×0.5/0.5=0.8。50% 是先驗；40% 是 H 與 E 同時發生的機率；20% 是非 H 下的訊號機率，皆不是此處後驗。
Cue review: ratio 1.0000x; unique-longest=False; repeated set=False.

### Q117 — Bayes 定理 (key A)

Before: 某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，Posterior 與 Prior、Likelihood 的關係通常由哪個定理描述？
- A. Bayes 定理
- B. 梯度裁切
- C. 中央極限定理 μόνο
- D. 畢氏定理
Before explanation: Bayes 定理用觀察到的證據更新先驗機率，得到後驗機率。

After: 在驗證資料中，H 與非 H 互斥且完備。已知 P(H)=0.2、P(E|H)=0.6、P(E|非 H)=0.1。用 Bayes 定理計算 P(H|E) 時，分母 P(E) 應如何取得？
- A. 0.6×0.2 + 0.1×0.8
- B. 0.6×0.2 + 0.1×0.2
- C. 0.6×0.8 + 0.1×0.2
- D. 0.6×0.8 + 0.1×0.8
After explanation / single-answer review: 證據機率需加總兩種狀態對 E 的貢獻。P(非 H)=0.8，因此 P(E)=0.6×0.2+0.1×0.8=0.2；後驗為 0.12/0.2=0.6。其他式子配錯了狀態的先驗權重。
Cue review: ratio 1.0000x; unique-longest=False; repeated set=False.

### Q136 — 模型架構選擇 (key B)

Before: 時間序列任務選模型時，最不合理的作法是？
- A. 依任務、資料量、效能、可解釋性與資源限制評估
- B. 不考慮資料型態與需求，只因模型最新就選它
- C. 用驗證資料比較候選方案
- D. 使用基準模型比較
Before explanation: 模型架構應配合任務、資料、效能、成本與工程條件，而不是追逐最新模型。

After: 邊緣裝置的記憶體上限為 100 MB，推論時間上限為 20 ms。同一驗證集上，A 準確率 95%、需 150 MB／10 ms；B 為 94%、80 MB／15 ms；C 為 96%、90 MB／30 ms。最低準確率要求為 93%，哪個選型符合全部要求？
- A. 選 A，因為推論只需 10 ms
- B. 選 B，因為三項要求均達標
- C. 選 C，因為準確率達到 96%
- D. 選 A，因為準確率高於模型 B
After explanation / single-answer review: B 的準確率、記憶體及延遲均符合要求。A 超過 100 MB 記憶體上限；C 超過 20 ms 延遲上限。只看單一效能數值不足以決定部署架構。
Cue review: ratio 0.9231x; unique-longest=False; repeated set=False.

### Q137 — 模型架構選擇 (key B)

Before: 模型架構設計應主要依據什麼？
- A. 依任務、資料量、效能、可解釋性與資源限制評估
- B. 不考慮資料型態與需求，只因模型最新就選它
- C. 用驗證資料比較候選方案
- D. 使用基準模型比較
Before explanation: 模型架構應配合任務、資料、效能、成本與工程條件，而不是追逐最新模型。

After: 團隊為每小時需求量預測比較線性模型與序列神經網路，上線時只能取得過去資料。哪種驗證設計最符合這個任務？
- A. 隨機打散時間後再切分訓練與驗證
- B. 用較早資料訓練、較晚資料驗證
- C. 用較晚資料訓練、較早資料驗證
- D. 用全部資料訓練、再評估原訓練集
After explanation / single-answer review: 時間序列選型應模擬以過去預測未來，使用較早時段訓練、較晚時段驗證。隨機打散或反向切分無法忠實模擬題述上線條件；原訓練集表現則不能直接代表泛化能力。
Cue review: ratio 0.9545x; unique-longest=False; repeated set=False.

### Q138 — 模型架構選擇 (key B)

Before: 某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，在多個候選模型間選擇時，何者較適當？
- A. 使用基準模型比較
- B. 不考慮資料型態與需求，只因模型最新就選它
- C. 用驗證資料比較候選方案
- D. 依任務、資料量、效能、可解釋性與資源限制評估
Before explanation: 模型架構應配合任務、資料、效能、成本與工程條件，而不是追逐最新模型。

After: 上線分類模型須在 CPU 上於 30 ms 內完成推論，且驗證 F1 至少 0.90。團隊保留一份最終測試集。哪種流程最適合在候選架構間選擇？
- A. 依訓練 F1 排名，選定後再測量延遲
- B. 依驗證 F1 與 CPU 延遲篩選架構
- C. 依 GPU 延遲排名，選定後再測量 F1
- D. 依測試 F1 反覆改架構直到達到門檻
After explanation / single-answer review: 選型應在驗證資料及目標 CPU 上檢查兩項必要條件，最終測試集留作選定後的評估。訓練 F1 不足以評估泛化；GPU 延遲不代表 CPU；反覆依測試集調整架構會污染最終評估。
Cue review: ratio 0.9184x; unique-longest=False; repeated set=False.

### Q151 — Precision / Recall (key B)

Before: 若疾病篩檢最怕漏掉真正患者，應優先提高哪個指標？
- A. Precision（精確率）
- B. Recall（召回率）
- C. MAE
- D. R²
Before explanation: Recall = TP/(TP+FN)。當漏掉正類的代價高時，通常優先關注 Recall。

After: 二元分類以「真正有瑕疵」為正類。驗證集有 100 件瑕疵品，模型找出 80 件、漏掉 20 件，另誤報 40 件正常品。Recall 是多少？
- A. 80/120，約 67%
- B. 80/100，等於 80%
- C. 20/100，等於 20%
- D. 40/120，約 33%
After explanation / single-answer review: Recall=TP/(TP+FN)=80/(80+20)=80%，分母是所有真正瑕疵品。80/120 是 Precision；20/100 是漏報率；40/120 是預測正類中的誤報比例。
Cue review: ratio 1.0588x; unique-longest=False; repeated set=False.

### Q152 — Precision / Recall (key D)

Before: 當 False Negative 的成本特別高時，通常最關注？
- A. MAE
- B. Precision（精確率）
- C. R²
- D. Recall（召回率）
Before explanation: Recall = TP/(TP+FN)。當漏掉正類的代價高時，通常優先關注 Recall。

After: 安全告警以「危險事件」為正類。團隊希望監控所有真正危險事件中有多少被系統找出，應選哪個指標？
- A. 所有預測危險中真正危險的比例
- B. 所有正常事件中判為正常的比例
- C. 所有事件中預測結果正確的比例
- D. 所有危險事件中判為危險的比例
After explanation / single-answer review: 所需指標是 Recall，以真正危險事件 TP+FN 為分母，以找出的 TP 為分子。其他三項依序是 Precision、Specificity 與 Accuracy，衡量的是不同群體。
Cue review: ratio 1.0000x; unique-longest=False; repeated set=False.

### Q153 — Precision / Recall (key A)

Before: 安全告警寧可多報一些，也不要漏掉真正危險事件，主要應提高？
- A. Recall（召回率）
- B. MAE
- C. R²
- D. Precision（精確率）
Before explanation: Recall = TP/(TP+FN)。當漏掉正類的代價高時，通常優先關注 Recall。

After: 郵件過濾以「垃圾郵件」為正類。模型攔下 50 封信，其中 40 封真的是垃圾郵件；另有 20 封垃圾郵件未攔下。Precision 是多少？
- A. 40/50，等於 80%
- B. 10/50，等於 20%
- C. 40/60，約 67%
- D. 50/60，約 83%
After explanation / single-answer review: Precision 的分母是預測為正類的 50 封信，分子是其中真正的 40 封垃圾郵件，故為 80%。10/50 是被攔郵件中的誤報比例；40/60 是 Recall；50/60 把預測正類總數誤作找到的真正正類。
Cue review: ratio 1.0645x; unique-longest=False; repeated set=False.

### Q160 — Attention (key A)

Before: Transformer 中用來計算序列不同位置彼此關聯的重要機制是？
- A. Attention
- B. Apriori
- C. K-means
- D. Random Forest
Before explanation: Attention 透過 Query、Key、Value 計算 token 間關聯，是 Transformer 的核心機制。

After: 在 Transformer 的 scaled dot-product attention 中，某 Query（Q）對各 Key（K）的注意力權重主要由哪個步驟取得？
- A. 將 Q 與 K 的相似分數正規化
- B. 將各 Value 的向量分量直接排序
- C. 將 token 的位置編號依序相加
- D. 將詞彙表中的出現次數轉成排名
After explanation / single-answer review: Scaled dot-product attention 先由 Query 與 Key 的點積取得分數，經縮放與 softmax 得到權重，再用權重加總 Value。直接排序 Value、相加位置編號或按詞頻排名都不是這項權重計算。
Cue review: ratio 0.8000x; unique-longest=False; repeated set=False.

### Q161 — Attention (key C)

Before: Query、Key、Value 是哪種機制的重要元件？
- A. Apriori
- B. K-means
- C. Attention
- D. Random Forest
Before explanation: Attention 透過 Query、Key、Value 計算 token 間關聯，是 Transformer 的核心機制。

After: 某次 Attention 對兩個 Value 的權重為 0.25 與 0.75；Value 的某一分量分別為 4 與 8。不考慮後續投影，聚合後該分量是多少？
- A. 3
- B. 6
- C. 7
- D. 12
After explanation / single-answer review: Attention 對 Value 加權求和：0.25×4+0.75×8=1+6=7。3 是把權重配反；6 是兩值直接平均；12 是兩值直接相加，均未使用題述權重。
Cue review: ratio 0.7500x; unique-longest=False; repeated set=False.

### Q162 — Attention (key C)

Before: 模型要動態決定哪些 token 對目前輸出更重要，主要依靠？
- A. Random Forest
- B. Apriori
- C. Attention
- D. K-means
Before explanation: Attention 透過 Query、Key、Value 計算 token 間關聯，是 Transformer 的核心機制。

After: 在一次 decoder cross-attention 中，Query 來自 decoder，Key 與 Value 來自 encoder。若對某個 encoder 位置給予較大權重，聚合時會發生什麼？
- A. 該位置的 Key 會取代 decoder 的 Query
- B. 該位置的序列編號會成為輸出向量
- C. 該位置的 Value 會有較大的加權貢獻
- D. 該位置的詞彙 ID 會成為預測機率
After explanation / single-answer review: 注意力權重用於加總對應的 Value，因此較大權重意味該 Value 的加權係數較大。Key 用來和 Query 計算相容程度，位置編號與詞彙 ID 都不是這次聚合要輸出的 Value 表示。
Cue review: ratio 1.0189x; unique-longest=False; repeated set=False.
