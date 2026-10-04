# Issue #65 — Batch 4G remediation evidence

Baseline: `ffc0ab9` on `question/issue-14-remediation` (includes #64).

## Validation

| Whole-bank metric | Before | After |
| --- | ---: | ---: |
| Self-authored questions / unique IDs | 483 / 483 | 483 / 483 |
| Uniquely longest correct option | 64 | 52 |
| Correct / average distractor length >= 2x | 0 | 0 |
| Repeated option-set groups | 14 | 12 |
| Questions in repeated option sets | 48 | 36 |

- Scoped audit PASS: exactly Q472–Q483 changed. ID order, answer indices, protected metadata, DB metadata and HTML/CSS/JS outside DB unchanged.
- All 12 items have no unique-longest correct option and no repeated option set anywhere in the bank. Maximum length ratio: 1.0455x (rounded).
- Answer distribution unchanged: A 131 / B 109 / C 122 / D 121.
- Individual manual review PASS for all 12; each after-explanation identifies the single correct answer and excludes alternatives. No protected-metadata or content-error exceptions required.
- Early Stopping: distinct questions cover validation monitoring, explicitly defined patience/counting, metric direction, regularization, counter reset and restoring best weights rather than assuming automatic restoration. Q473 explicitly stops after epochs 61–65; Q476 defines its counting rule independently of implementation-specific baseline/warm-up settings.
- Fairness: positive labels and denominators are explicit; distinguishes FNR, selection rate, precision, demographic parity and equalized odds; proxy-feature removal alone is not proof of fairness. Q481 verifies FNR 10/100=10% versus 8/20=40%. Q483 compares TPR for equal opportunity, equivalent to comparing FNR for the stated harm goal.
- Inline JavaScript syntax PASS: one script compiled using Node vm.Script.
- Headless Edge QA PASS at 1280×900 and 375×900: all 12 scoped items render and score in Practice and Mock. Intentional Practice error recorded and removed after correct retry; L23304 weak-area result 5/6 (83%).
- Mock L23: 11/12 correct (92%), one intentional wrong answer, zero blank; native submission confirmation and wrong-answer review verified.
- Official 115-year second-paper flow and seven tabs PASS. No document horizontal overflow, page/console warnings/errors or HTTP errors.
- Browser fixture filters only self-authored DB to the 12 scoped records for coverage; app logic/assets/official loader unchanged. Fresh profiles preserve existing user progress. The initial harness retained a 24-item navigation bound; corrected it to 12 items, then final complete runs passed.
- Representative mobile Practice screenshot visually checked: readable options, explanation and navigation.
- git diff --check: PASS.

References checked: [Keras EarlyStopping](https://keras.io/api/callbacks/early_stopping/) for patience, improvement direction and optional best-weight restoration; [Fairlearn fairness metrics](https://fairlearn.org/main/user_guide/assessment/common_fairness_metrics.html) for selection-rate parity, TPR/FPR parity and equal opportunity. Retrieved 2026-10-04. These support self-authored content, not official iPAS past-paper attribution.

Reproduce:

```text
python scripts/audit_question_cues.py --baseline ffc0ab9 --batch batch4g --csv docs/QUESTION_CUE_BIAS_BATCH4G.csv
NODE_PATH=<existing runtime node_modules> node scripts/test_question_batch4g.cjs <output-directory>
```

Evidence: [audit CSV](QUESTION_CUE_BIAS_BATCH4G.csv), [browser results](QUESTION_CUE_BIAS_BATCH4G_BROWSER.json), [mobile Practice](qa/issue-65/practice-Q478-375.png), [mobile Mock review](qa/issue-65/mock-L23-375.png).

Limitations: metrics are heuristics and do not certify content quality. Independent Technical Review remains pending before PR creation. No integration, phase checkpoint, Product Verify or production verification claimed.

## Per-item manual review (before / after)

### Q472 — key B

**Before**

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，訓練 loss 持續下降，但 validation loss 開始上升。最適合的訓練控制之一是？

- A. 只看 training loss 一上升就永久刪除模型
- B. 監控 validation 指標，當一段時間不再改善時停止訓練，以降低過擬合與浪費運算
- C. Early Stopping 代表只訓練一個 epoch
- D. Early Stopping 會增加模型參數量

Explanation: Early stopping 通常監控 validation loss/metric，在 patience 期間無改善時停止並保留最佳 checkpoint。

**After**

訓練 loss 持續下降，但 validation loss 已連續多輪上升。若用 Early Stopping 選擇停止時點，哪種監控較適當？

- A. 依 training loss 的最低值，繼續追求訓練資料表現
- B. 依 validation loss 改善情況，設定等待輪數
- C. 依 test loss 的每輪變化，反覆用測試資料選擇模型
- D. 依完成的固定 epoch 數，不考慮驗證資料的變化

Explanation: 驗證 loss 有助觀察泛化表現，搭配 patience 可避免因單次波動立即停止。只看訓練 loss 可能繼續過擬合，反覆用測試集決定停止時點會污染最終評估，固定輪數則不依驗證表現自適應。

### Q473 — key C

**Before**

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，模型訓練 200 epochs，但 60 epochs 後驗證表現不再改善。如何避免多餘訓練？

- A. Early Stopping 代表只訓練一個 epoch
- B. 只看 training loss 一上升就永久刪除模型
- C. 監控 validation 指標，當一段時間不再改善時停止訓練，以降低過擬合與浪費運算
- D. Early Stopping 會增加模型參數量

Explanation: Early stopping 通常監控 validation loss/metric，在 patience 期間無改善時停止並保留最佳 checkpoint。

**After**

最多訓練 200 epochs。Early Stopping 規則為連續 5 輪 validation loss 未低於歷史最佳值便停止；第 60 輪最佳，61–65 輪皆未改善。何時停止？

- A. 第 60 輪結束，剛達到目前最佳驗證表現時
- B. 第 61 輪結束，首次出現未改善的情況時
- C. 第 65 輪結束，連續未改善已達設定輪數時
- D. 第 200 輪結束，完成原本設定的最大輪數時

Explanation: 本題已明定連續 5 輪未改善就停止。第 61 至 65 輪共五輪，因此第 65 輪結束停止；最大 epochs 是上限而非必須完成的輪數。

### Q474 — key C

**Before**

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，下列哪一項最符合 Early Stopping？

- A. 只看 training loss 一上升就永久刪除模型
- B. Early Stopping 代表只訓練一個 epoch
- C. 監控 validation 指標，當一段時間不再改善時停止訓練，以降低過擬合與浪費運算
- D. Early Stopping 會增加模型參數量

Explanation: Early stopping 通常監控 validation loss/metric，在 patience 期間無改善時停止並保留最佳 checkpoint。

**After**

Early Stopping 用 validation loss 選停止時點。若改為監控 validation accuracy，最需要同步確認哪項設定？

- A. 將改善方向維持越低越好，並檢查最小改善幅度
- B. 維持原本 loss 的比較規則，只更換指標紀錄名稱
- C. 將改善方向改成越高越好，並檢查最小改善幅度
- D. 改用訓練 accuracy 的改善，只比較訓練資料表現

Explanation: Loss 通常越低越好，accuracy 通常越高越好；應讓停止規則的改善方向與監控指標一致，並設定適當最小改善幅度。沿用 loss 的低值比較規則或只觀察訓練表現，都不符合驗證 accuracy 的監控目標。

### Q475 — key A

**Before**

為什麼 Early Stopping 可視為一種正則化手段？

- A. 監控 validation 指標，當一段時間不再改善時停止訓練，以降低過擬合與浪費運算
- B. Early Stopping 會增加模型參數量
- C. 只看 training loss 一上升就永久刪除模型
- D. Early Stopping 代表只訓練一個 epoch

Explanation: Early stopping 通常監控 validation loss/metric，在 patience 期間無改善時停止並保留最佳 checkpoint。

**After**

為何依驗證表現提早停止訓練，可視為一種正則化手段？

- A. 限制過度貼合訓練細節的時間，減少繼續擬合雜訊
- B. 增加模型的隱藏層與參數，讓訓練資料更容易被記住
- C. 將驗證資料合併進訓練集，讓每輪訓練的樣本更多
- D. 將測試資料用於每輪更新，讓測試誤差下降得更快

Explanation: Early Stopping 限制訓練進程，可能減少模型持續擬合訓練雜訊。它不直接增加模型容量，也不是把驗證或測試資料納入權重更新；仍不保證完全避免過擬合。

### Q476 — key C

**Before**

某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，使用 patience=5 的 early stopping 通常表示什麼？

- A. Early Stopping 會增加模型參數量
- B. 只看 training loss 一上升就永久刪除模型
- C. 監控 validation 指標，當一段時間不再改善時停止訓練，以降低過擬合與浪費運算
- D. Early Stopping 代表只訓練一個 epoch

Explanation: Early stopping 通常監控 validation loss/metric，在 patience 期間無改善時停止並保留最佳 checkpoint。

**After**

某停止規則設定 patience=5，定義為連續 5 輪未達改善門檻便停止。第 3 輪等待期間指標再次改善，等待計數通常如何處理？

- A. 維持原計數，累計整次訓練中所有未改善輪數
- B. 直接停止訓練，因為先前已有未改善的輪數
- C. 重設等待計數，再從新的最佳值觀察後續改善
- D. 固定再跑兩輪，不論之後是否又出現新的改善

Explanation: 當指標達到設定的改善門檻，最佳值更新並重設等待計數，之後重新計算連續未改善輪數。本題明定規則，避免不同實作的基準值或暖身設定造成歧義。

### Q477 — key B

**Before**

模型最佳 validation score 出現在 epoch 42，之後逐漸惡化，部署時較合理保留哪個 checkpoint？

- A. 只看 training loss 一上升就永久刪除模型
- B. 監控 validation 指標，當一段時間不再改善時停止訓練，以降低過擬合與浪費運算
- C. Early Stopping 會增加模型參數量
- D. Early Stopping 代表只訓練一個 epoch

Explanation: Early stopping 通常監控 validation loss/metric，在 patience 期間無改善時停止並保留最佳 checkpoint。

**After**

validation loss 最低出現在 epoch 42，訓練於 epoch 47 提早停止。若部署目標是使用最佳驗證版本，應如何處理權重？

- A. 使用第 47 輪權重，因為訓練停止代表已自動選到最佳
- B. 載入第 42 輪權重，用 checkpoint 或恢復設定
- C. 使用第 1 輪權重，因為提早停止應選擇最早訓練版本
- D. 平均第 42 與 47 輪權重，視為原本停止規則選到的版本

Explanation: 最佳驗證版本是第 42 輪，需保存並載入該 checkpoint，或啟用恢復最佳權重的設定。停止訓練不必然自動恢復最佳權重；最後一輪或權重平均也不等同該版本。

### Q478 — key D

**Before**

某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，貸款模型整體準確率高，但不同群體的 False Negative 差異很大。公平性評估應如何做？

- A. 公平性只看整體 Accuracy
- B. 移除敏感欄位即可保證模型沒有代理偏誤
- C. 只要 demographic parity 達成就代表所有公平問題都解決
- D. 公平性有多種定義且可能互相衝突，應依情境、法律與傷害模式選擇指標並分群監控

Explanation: AI fairness 不是單一指標。Demographic parity、equal opportunity、equalized odds 等定義可能無法同時滿足，需依使用情境評估。

**After**

貸款模型以「符合資格」為正類。整體準確率高，但兩群體中符合資格者被錯拒的比例不同。哪項評估最直接檢查這個問題？

- A. 比較各群體樣本數，確認兩組是否有相同的人數
- B. 比較各群體核准率，確認整體被選取的比例是否相同
- C. 比較各群體精確率，確認獲核准者符合資格的比例
- D. 比較各群體漏判率，確認符合資格者被錯拒的比例

Explanation: 符合資格卻被拒絕是 false negative，應比較群體 FNR，或等價地比較 TPR。核准率、精確率與樣本數各回答不同問題；整體準確率可能掩蓋此差異。

### Q479 — key A

**Before**

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，團隊移除性別欄位後宣稱模型「保證公平」，為何這個結論不足？

- A. 公平性有多種定義且可能互相衝突，應依情境、法律與傷害模式選擇指標並分群監控
- B. 移除敏感欄位即可保證模型沒有代理偏誤
- C. 公平性只看整體 Accuracy
- D. 只要 demographic parity 達成就代表所有公平問題都解決

Explanation: AI fairness 不是單一指標。Demographic parity、equal opportunity、equalized odds 等定義可能無法同時滿足，需依使用情境評估。

**After**

團隊移除性別欄位後宣稱模型已公平，但其他特徵可能與性別相關。哪項理由最能指出這個結論的不足？

- A. 其他特徵可能保留代理訊號，仍需檢查各群體的結果
- B. 各群體都使用相同決策閾值，可據此確認群體待遇
- C. 整體準確率高於原先模型，可據此確認群體待遇
- D. 模型以同一演算法處理各群體，可據此確認群體待遇

Explanation: 不直接使用敏感屬性不代表沒有代理訊號或群體傷害。需依情境檢查資料及分群結果；相同閾值、較高整體準確率或相同演算法，都不能取代群體影響評估。

### Q480 — key B

**Before**

某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，下列哪一項最合理描述多種 AI fairness 指標？

- A. 只要 demographic parity 達成就代表所有公平問題都解決
- B. 公平性有多種定義且可能互相衝突，應依情境、法律與傷害模式選擇指標並分群監控
- C. 公平性只看整體 Accuracy
- D. 移除敏感欄位即可保證模型沒有代理偏誤

Explanation: AI fairness 不是單一指標。Demographic parity、equal opportunity、equalized odds 等定義可能無法同時滿足，需依使用情境評估。

**After**

二元模型在兩群體的正向預測比例相同，但真陽性率與假陽性率不同。對公平指標的解讀，哪項正確？

- A. demographic parity 未達成；equalized odds 已達成
- B. demographic parity 已達成；equalized odds 未達成
- C. demographic parity 已達成；equalized odds 已達成
- D. demographic parity 未達成；equalized odds 未達成

Explanation: Demographic parity 比較群體正向預測比例；equalized odds 同時要求群體 TPR 與 FPR 相同。前者達成並不表示後者達成，更不代表所有公平問題都已解決。

### Q481 — key C

**Before**

為什麼公平性治理需要分群監控而不能只看整體平均？

- A. 只要 demographic parity 達成就代表所有公平問題都解決
- B. 公平性只看整體 Accuracy
- C. 公平性有多種定義且可能互相衝突，應依情境、法律與傷害模式選擇指標並分群監控
- D. 移除敏感欄位即可保證模型沒有代理偏誤

Explanation: AI fairness 不是單一指標。Demographic parity、equal opportunity、equalized odds 等定義可能無法同時滿足，需依使用情境評估。

**After**

正類表示應獲服務者。A 群體 100 位正類中漏判 10 位，B 群體 20 位正類中漏判 8 位。哪項分群分析最合理？

- A. A 群體漏判 10 位高於 B 的 8 位，故 A 的漏判率較高
- B. 兩群體合計漏判 18 位，可用此總數取代群體漏判率
- C. A 漏判率 10%、B 為 40%，平均可能掩蓋落差
- D. B 群體正類人數較少，應以總樣本數代替正類分母

Explanation: FNR 的分母是實際正類：A 為 10/100=10%，B 為 8/20=40%。只比錯誤人數或合計數會忽略群體分母與待遇落差；估計的可靠性還需考量樣本數。

### Q482 — key D

**Before**

敏感屬性雖被移除，但郵遞區號可能成為代理變數。這說明什麼？

- A. 公平性只看整體 Accuracy
- B. 移除敏感欄位即可保證模型沒有代理偏誤
- C. 只要 demographic parity 達成就代表所有公平問題都解決
- D. 公平性有多種定義且可能互相衝突，應依情境、法律與傷害模式選擇指標並分群監控

Explanation: AI fairness 不是單一指標。Demographic parity、equal opportunity、equalized odds 等定義可能無法同時滿足，需依使用情境評估。

**After**

模型移除敏感欄位，但郵遞區號可能作為代理變數。要評估此特徵的公平性影響，哪種實驗較適當？

- A. 比較移除前後的整體準確率，以平均效能變化判定公平
- B. 比較移除前後的正向預測總數，以總選取率判定群體待遇
- C. 比較移除前後的特徵重要性，以重要性排名判定群體待遇
- D. 比較移除前後的分群錯誤率，連同效能與情境評估

Explanation: 可用特徵移除實驗檢查分群結果與效能變化，並依傷害情境評估。代理關係不等於此特徵必須一律移除，移除也不保證公平；整體平均、總選取率或特徵排名不足以評估不同群體的待遇。

### Q483 — key C

**Before**

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，高影響決策模型選 fairness metric 時，最重要的原則是？

- A. 只要 demographic parity 達成就代表所有公平問題都解決
- B. 移除敏感欄位即可保證模型沒有代理偏誤
- C. 公平性有多種定義且可能互相衝突，應依情境、法律與傷害模式選擇指標並分群監控
- D. 公平性只看整體 Accuracy

Explanation: AI fairness 不是單一指標。Demographic parity、equal opportunity、equalized odds 等定義可能無法同時滿足，需依使用情境評估。

**After**

服務資格模型中，正類表示符合資格。團隊首要關切是兩群體符合資格者被錯拒的比例相近。哪個指標最直接對應此目標？

- A. 比較各群體正向預測比例，作為人口統計平等指標
- B. 比較各群體正向預測的精確率，作為預測值平等指標
- C. 比較各群體真陽性率，作為機會平等指標
- D. 比較各群體總正確比例，作為整體準確率指標

Explanation: Equal opportunity（機會平等）比較群體 TPR；因 FNR=1−TPR，也直接對應符合資格者被錯拒的比例。其他指標著重選取率、精確率或總準確率，不能直接代表題述傷害目標。
