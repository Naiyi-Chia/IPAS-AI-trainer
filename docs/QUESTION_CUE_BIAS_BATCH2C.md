# Issue #48 — Batch 2C cue-bias remediation

## Contract and baseline

- Issue: https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/48; Parent #14.
- Branch: `question/issue-48-batch2c-remediation`.
- Baseline: latest `question/issue-14-remediation` at implementation start, `ccb648523a840d2b7cbc3e432e3e3d85a3651cc2` (includes Batch 2B via #77).
- Scope: exactly Q430–Q435 and Q466–Q471 (12 items). Only question/options/explanation change; every other field, including answer index, difficulty, concept and sourceType, is preserved.
- All other questions, non-question DB metadata and HTML/CSS/application JS outside the DB remain unchanged. No official content, storage behavior or dependencies changed.
- Engineering Agent item-by-item editorial review is recorded below; independent Technical Review and human gates remain pending.

## Reproduction

```powershell
python scripts/audit_question_cues.py --batch batch2c --baseline ccb648523a840d2b7cbc3e432e3e3d85a3651cc2 --csv docs/QUESTION_CUE_BIAS_BATCH2C.csv
python scripts/serve_question_batch1a.py --batch batch2c
```

Open `http://127.0.0.1:8766/batch2c`. The existing fixture uses the actual app with a narrowed in-memory pool, memory storage, automatic confirmation and no PDF prewarming. Batch 1A remains default, and Batch 2A/2B remain supported.

CSV contains 483 before and 483 after rows. Length counts Unicode code points excluding whitespace. Repetition comparison ignores option order and whitespace. Assertions cover exact scope, count/unique IDs/order, protected metadata, mappings, unchanged app shell, ratio <2, and uniqueness of each modified option set.

## Whole-bank metrics

| Metric | Before | After |
| --- | ---: | ---: |
| total | 483 | 483 |
| unique_ids | 483 | 483 |
| unique_longest | 399 | 389 |
| ratio_ge_2 | 236 | 224 |
| ratio_ge_3 | 12 | 0 |
| repeated_groups | 95 | 93 |
| repeated_questions | 428 | 416 |

Answer distribution unchanged: A 131 / B 109 / C 122 / D 121. All 12 formerly had ratios >=3; the maximum after is 1.2. Two modified correct options remain uniquely longest by a small margin. Both former repeated groups are now 12 distinct sets, each unique across the bank.

The scoped branch now has zero >=3x candidates. This is implementation evidence only: it does not declare Parent #14 Phase 2 checkpoint complete. Technical Review, Human Epic Integration Approval, aggregate review and dev synchronization remain subsequent steps under the Parent contract.

## Item-by-item editorial review

### Q430 — SVM Kernel

Protected mapping: 中級 / L23 / L23202 / hard; answer index 2 (C).
Length ratio: 3.1395 → 1.1250; option lengths: 14/19/45/10 → 24/24/27/24.

**Review:** 以同心圓和已調 C 的欠擬合情境區分模型表達能力與參數／閾值；四項都是 SVM 改動，解析不保證 RBF 改善。

**Before:** 資料在原空間無法用直線分開，團隊希望使用 SVM 建立非線性邊界，可考慮？

- A. Kernel 的作用是資料加密
- B. RBF kernel 一定能避免所有過擬合
- C. Kernel trick 可在不顯式建立高維特徵的情況下計算某些高維空間內積，以處理非線性邊界
- D. SVM 只能做線性回歸

**After:** 兩類資料呈同心圓分布，線性 SVM 即使調整 C 仍明顯欠擬合。若不手動展開非線性特徵，哪個改動能讓模型表達原空間中的非線性邊界？

- A. 保留線性 kernel 並提高 C，增加違反間隔的懲罰
- B. 保留線性 kernel 並平移特徵，改變各欄位的中心
- C. 改用 RBF kernel 建模，再驗證 C 與 gamma 的設定
- D. 保留線性 kernel 並調整閾值，改變正類判定門檻

**Unique-answer rationale / explanation:** RBF kernel 可讓 SVM 表達原空間的非線性決策邊界，是否改善仍須驗證。提高 C 只改變懲罰強度；平移原特徵或調整線性分數的判定閾值，仍無法讓單一線性邊界分隔同心圓。

### Q431 — SVM Kernel

Protected mapping: 中級 / L23 / L23202 / hard; answer index 3 (D).
Length ratio: 3.1395 → 1.0000; option lengths: 19/10/14/45 → 27/27/27/27.

**Review:** 題幹給定 K 與映射內積的等式，考查隱式計算的用途；干擾項混淆標籤、資料順序與樣本配對的角色。

**Before:** Kernel trick 的核心作用是什麼？

- A. RBF kernel 一定能避免所有過擬合
- B. SVM 只能做線性回歸
- C. Kernel 的作用是資料加密
- D. Kernel trick 可在不顯式建立高維特徵的情況下計算某些高維空間內積，以處理非線性邊界

**After:** 某特徵映射 φ(x) 的維度很高，但可直接計算 K(x,z)=φ(x)·φ(z)。SVM 使用 kernel trick 時，主要如何利用這個性質？

- A. 以 K(x,z) 取代兩筆樣本的類別標籤，再重新標註訓練集
- B. 以 K(x,z) 排列樣本的出現順序，再沿用原始特徵做內積
- C. 以 K(x,z) 作為單一新輸入欄位，再捨棄原有的樣本關係
- D. 以 K(x,z) 取代映射後的內積，免逐一展開 φ 的各個分量

**Unique-answer rationale / explanation:** 當演算法可由樣本間內積表示時，可用 kernel 值取得映射後的內積，而不顯式列出高維特徵。Kernel 不取代類別標籤，也不是只用來排列資料或產生一個脫離樣本配對關係的新欄位。

### Q432 — SVM Kernel

Protected mapping: 中級 / L23 / L23202 / hard; answer index 2 (C).
Length ratio: 3.1395 → 1.0000; option lengths: 19/10/45/14 → 24/24/24/24.

**Review:** 固定尺度、C 與非零距離，排除 x=z 的例外；由 exp 公式直接驗證 gamma 提高使相似度下降，不混為 C 或維度。

**Before:** 下列對 RBF-kernel SVM 的描述何者較正確？

- A. RBF kernel 一定能避免所有過擬合
- B. SVM 只能做線性回歸
- C. Kernel trick 可在不顯式建立高維特徵的情況下計算某些高維空間內積，以處理非線性邊界
- D. Kernel 的作用是資料加密

**After:** RBF kernel 為 K(x,z)=exp(−gamma×||x−z||²)。保持資料尺度與 C 不變，對兩個距離大於 0 的固定樣本提高 gamma，會發生哪項變化？

- A. 兩者的 kernel 值上升，單一樣本的影響範圍變廣
- B. 兩者的 kernel 值不變，只有違反間隔的懲罰增加
- C. 兩者的 kernel 值下降，單一樣本的影響範圍變窄
- D. 兩者的 kernel 值下降，特徵空間的維度隨之減少

**Unique-answer rationale / explanation:** 距離固定且大於 0 時，提高 gamma 會使指數更負、kernel 值更小，對應較局部的影響範圍。C 才控制違反間隔的懲罰；gamma 並不是直接設定特徵空間維度。過大的 gamma 可能使邊界過度局部化。

### Q433 — SVM Kernel

Protected mapping: 中級 / L23 / L23202 / hard; answer index 3 (D).
Length ratio: 3.1395 → 1.2000; option lengths: 19/14/10/45 → 19/18/18/22.

**Review:** 限定兩欄皆有意義，避免把尺度大誤當重要；正解直接回應距離影響，干擾項則是標準化不會保證的效果。

**Before:** 某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，SVM 使用 kernel 時，為何常需要先做 feature scaling？

- A. RBF kernel 一定能避免所有過擬合
- B. Kernel 的作用是資料加密
- C. SVM 只能做線性回歸
- D. Kernel trick 可在不顯式建立高維特徵的情況下計算某些高維空間內積，以處理非線性邊界

**After:** RBF SVM 的兩項數值特徵分別以數十與數萬為常見尺度，且兩者都有預測意義。訓練前標準化特徵的主要理由是？

- A. 使每個欄位與目標類別的相關程度變得相同
- B. 使原本無法線性分隔的資料轉為線性可分
- C. 使每個樣本在決策函數中的權重變得相等
- D. 減少數值尺度差異對距離及 kernel 值的支配

**Unique-answer rationale / explanation:** RBF kernel 依賴特徵間的平方距離，數值尺度大的欄位可能主導距離。標準化可減少單位與尺度的影響，但不保證各特徵同樣重要、資料線性可分或樣本權重相等；縮放參數須只由訓練資料估計。

### Q434 — SVM Kernel

Protected mapping: 中級 / L23 / L23202 / hard; answer index 3 (D).
Length ratio: 3.1395 → 0.9545; option lengths: 10/14/19/45 → 22/22/22/21.

**Review:** 考查 kernel 模型選型的前處理邊界；四個選項均描述擬合標準化的資料來源，只有訓練折可用。

**Before:** 某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，若線性 SVM underfit 明顯，資料確實具有非線性結構，可嘗試？

- A. SVM 只能做線性回歸
- B. Kernel 的作用是資料加密
- C. RBF kernel 一定能避免所有過擬合
- D. Kernel trick 可在不顯式建立高維特徵的情況下計算某些高維空間內積，以處理非線性邊界

**After:** 團隊要比較 RBF SVM 的多組 C、gamma，已保留獨立最終測試集。採交叉驗證選型並需要標準化時，哪個流程較能避免評估資料洩漏？

- A. 先在全部開發資料擬合標準化，再切各折比較參數
- B. 先在開發與測試資料擬合標準化，再用各折選參數
- C. 先在每個驗證折獨立擬合標準化，再轉換該折資料
- D. 先在每個訓練折擬合標準化，再轉換對應驗證折

**Unique-answer rationale / explanation:** 每個交叉驗證訓練折應獨立擬合標準化與模型，再用同一轉換處理對應驗證折。用全部開發資料、測試資料或驗證折自身估計縮放參數，都使用了該折訓練時不應取得的資訊。C、gamma 選定後才進行最終獨立測試。

### Q435 — SVM Kernel

Protected mapping: 中級 / L23 / L23202 / hard; answer index 0 (A).
Length ratio: 3.1395 → 0.9296; option lengths: 45/14/10/19 → 22/25/22/24.

**Review:** 固定 RBF 的 gamma 與尺度，聚焦 C 的損失／間隔取捨；不把增加 C 說成必然提升泛化。

**Before:** 某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，關於 SVM 與 kernel，下列哪個敘述正確？

- A. Kernel trick 可在不顯式建立高維特徵的情況下計算某些高維空間內積，以處理非線性邊界
- B. Kernel 的作用是資料加密
- C. SVM 只能做線性回歸
- D. RBF kernel 一定能避免所有過擬合

**After:** 在標準 soft-margin RBF SVM 中固定 gamma 與資料尺度，將 C 調大，最直接改變目標函數中的哪項取捨？

- A. 加重違反間隔的損失，相對減弱對較大間隔的偏好
- B. 加快 kernel 隨距離衰減，相對縮小樣本的影響範圍
- C. 降低違反間隔的損失，相對加強對較大間隔的偏好
- D. 增加 kernel 的多項式次數，相對提高邊界的階數

**Unique-answer rationale / explanation:** 標準 soft-margin SVM 以 C 加權違反間隔的損失。提高 C 使模型更重視降低這項損失，與維持大間隔形成取捨；不保證驗證表現改善。距離衰減由 RBF 的 gamma 控制，而 RBF 並沒有多項式次數這個參數。

### Q466 — ROC-AUC / PR-AUC

Protected mapping: 中級 / L23 / L23303 / hard; answer index 1 (B).
Length ratio: 3.1475 → 1.0141; option lengths: 24/64/25/12 → 23/24/24/24.

**Review:** 正類為詐欺，清楚定義警示精確率與找回率；其他選項是不同分析目標，不再使用荒謬的指標敘述。

**Before:** 詐欺率 0.1%，模型 Accuracy 99.9% 但完全抓不到詐欺。若比較候選模型，應補看什麼？

- A. Accuracy 在 0.1% 正類時永遠足以判斷模型
- B. 極度不平衡且關注正類時，PR curve / PR-AUC 常比單看 Accuracy 更有資訊；ROC-AUC 則衡量不同閾值的整體排序能力
- C. PR-AUC 不包含 Precision 或 Recall
- D. ROC-AUC 只適用迴歸

**After:** 詐欺僅占交易的 0.1%，全猜正常也有 99.9% Accuracy。團隊改用 PR 曲線檢視候選模型，最主要能補充哪項資訊？

- A. 正常交易的判對比例，與全部交易正確率之間的變化
- B. 警示中詐欺的比例，與實際詐欺被找回比例之間的取捨
- C. 風險分數的數值大小，與預測機率校準程度之間的差異
- D. 不同模型的訓練時間，與部署時每秒處理量之間的關係

**Unique-answer rationale / explanation:** PR 曲線呈現不同閾值下的 Precision 與 Recall：警示中有多少是真正詐欺，以及實際詐欺有多少被找出。它不會讓大量真負類直接主導這兩個比例，也不等同機率校準或執行效率評估。

### Q467 — ROC-AUC / PR-AUC

Protected mapping: 中級 / L23 / L23303 / hard; answer index 3 (D).
Length ratio: 3.1475 → 1.0476; option lengths: 12/25/24/64 → 21/20/22/22.

**Review:** 明訂分數方向與無同分，唯一對應成對排序機率；其餘三項是閾值下的 Accuracy、Recall、Precision。

**Before:** 下列哪一項正確描述 ROC-AUC 與 PR-AUC？

- A. ROC-AUC 只適用迴歸
- B. PR-AUC 不包含 Precision 或 Recall
- C. Accuracy 在 0.1% 正類時永遠足以判斷模型
- D. 極度不平衡且關注正類時，PR curve / PR-AUC 常比單看 Accuracy 更有資訊；ROC-AUC 則衡量不同閾值的整體排序能力

**After:** 二元分類模型以較高分數表示較可能為正類。若無同分情況，ROC-AUC 為 0.90，哪個解讀最符合其排序意義？

- A. 使用預設閾值時，全部樣本約有九成被正確分類
- B. 使用預設閾值時，模型找回約九成的實際正類
- C. 從預測為正的樣本抽一筆，約九成機率為真實正類
- D. 隨機抽一正一負樣本，約九成機率是正類分數較高

**Unique-answer rationale / explanation:** 無同分時，ROC-AUC 可解讀為隨機抽取一個正類與一個負類，正類分數高於負類的機率。它不是單一閾值的 Accuracy、Recall 或 Precision；即使 AUC 高，仍須另行選擇適合業務的閾值。

### Q468 — ROC-AUC / PR-AUC

Protected mapping: 中級 / L23 / L23303 / hard; answer index 0 (A).
Length ratio: 3.1475 → 1.0179; option lengths: 64/24/25/12 → 19/19/20/17.

**Review:** 用實際類別數與 TPR/FPR 算 TP=80、FP=99，展示低 FPR 不等於高 Precision；干擾項均對應另一個真實比例。

**Before:** 某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，極端不平衡資料下，為何 PR curve 常比 Accuracy 更具參考性？

- A. 極度不平衡且關注正類時，PR curve / PR-AUC 常比單看 Accuracy 更有資訊；ROC-AUC 則衡量不同閾值的整體排序能力
- B. Accuracy 在 0.1% 正類時永遠足以判斷模型
- C. PR-AUC 不包含 Precision 或 Recall
- D. ROC-AUC 只適用迴歸

**After:** 驗證集有 100 個正類、9,900 個負類。某閾值的 TPR=80%、FPR=1%，以 PR 曲線檢視該點時，Precision 約為多少？

- A. 44.7%，以 80 ÷ (80 + 99) 計算
- B. 80.0%，以 80 ÷ (80 + 20) 計算
- C. 99.0%，以 9,801 ÷ 9,900 計算
- D. 0.8%，以 80 ÷ 10,000 計算

**Unique-answer rationale / explanation:** TP=100×80%=80，FP=9,900×1%=99，故 Precision=80/(80+99)≈44.7%。80% 是 Recall，99% 是負類召回率，0.8% 是 TP 占全部樣本的比例。正類稀少時，低 FPR 仍可能對應不少誤報。

### Q469 — ROC-AUC / PR-AUC

Protected mapping: 中級 / L23 / L23303 / hard; answer index 1 (B).
Length ratio: 3.1475 → 0.9718; option lengths: 12/64/24/25 → 25/23/23/23.

**Review:** 明訂 ROC 軸順序，計算 FPR=.10、TPR=.80；干擾項區分補數與交換座標。

**Before:** 某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，模型輸出風險分數後，可調 threshold 取得不同 TPR/FPR。這常用哪種曲線觀察？

- A. ROC-AUC 只適用迴歸
- B. 極度不平衡且關注正類時，PR curve / PR-AUC 常比單看 Accuracy 更有資訊；ROC-AUC 則衡量不同閾值的整體排序能力
- C. Accuracy 在 0.1% 正類時永遠足以判斷模型
- D. PR-AUC 不包含 Precision 或 Recall

**After:** 金融模型在某閾值下的混淆矩陣為 TP=80、FN=20、FP=90、TN=810。若 ROC 圖以 FPR 為橫軸、TPR 為縱軸，該閾值對應哪個座標？

- A. (0.90, 0.80)，以負類召回率搭配正類召回率
- B. (0.10, 0.80)，以假陽性率搭配真陽性率
- C. (0.20, 0.90)，以假陰性率搭配真陰性率
- D. (0.80, 0.10)，以真陽性率搭配假陽性率

**Unique-answer rationale / explanation:** FPR=FP/(FP+TN)=90/900=0.10，TPR=TP/(TP+FN)=80/100=0.80，因此座標為 (0.10,0.80)。其餘選項分別混淆補數、陰性相關率或橫縱軸順序。

### Q470 — ROC-AUC / PR-AUC

Protected mapping: 中級 / L23 / L23303 / hard; answer index 3 (D).
Length ratio: 3.1475 → 1.0658; option lengths: 24/25/12/64 → 27/24/25/27.

**Review:** 固定兩類條件分數分布，只改先驗比例，排除一般資料漂移的歧義；解析用 Precision 公式說明 PR 受比例影響。

**Before:** 如果業務特別關注少數正類的 precision 與 recall，應優先觀察？

- A. Accuracy 在 0.1% 正類時永遠足以判斷模型
- B. PR-AUC 不包含 Precision 或 Recall
- C. ROC-AUC 只適用迴歸
- D. 極度不平衡且關注正類時，PR curve / PR-AUC 常比單看 Accuracy 更有資訊；ROC-AUC 則衡量不同閾值的整體排序能力

**After:** 同一模型在兩個母體中的正類及負類條件分數分布相同，但正類比例不同，兩條件分布又有重疊。忽略有限樣本誤差，比較 ROC-AUC 與 PR 曲線時，何者較合理？

- A. 正類比例降低會使 ROC-AUC 降低，PR 曲線則維持不變
- B. 兩者皆由分數排序決定，因此都不受正類比例變動影響
- C. 先依正類比例調整分數閾值，就能保證兩條 PR 曲線相同
- D. ROC-AUC 可維持不變，但 PR 曲線會受到正類比例影響

**Unique-answer rationale / explanation:** 固定類別條件分數分布時，各閾值的 TPR、FPR 不變，ROC-AUC 因而不變。Precision 還取決於正類比例：πTPR/[πTPR+(1−π)FPR]，因此 PR 曲線及其摘要分數可能改變。跨資料集比較 PR-AUC 時應交代類別比例與計算方式。

### Q471 — ROC-AUC / PR-AUC

Protected mapping: 中級 / L23 / L23303 / hard; answer index 0 (A).
Length ratio: 3.1475 → 1.0781; option lengths: 64/25/24/12 → 23/20/23/21.

**Review:** 給出三個候選操作點與明確限制，在可行集合取最高 Precision；區分排序摘要與部署閾值，不宣稱 AUC 決定操作點。

**Before:** 分類模型的閾值選擇為何不能只看單一 Accuracy？

- A. 極度不平衡且關注正類時，PR curve / PR-AUC 常比單看 Accuracy 更有資訊；ROC-AUC 則衡量不同閾值的整體排序能力
- B. PR-AUC 不包含 Precision 或 Recall
- C. Accuracy 在 0.1% 正類時永遠足以判斷模型
- D. ROC-AUC 只適用迴歸

**After:** 同一模型在驗證集的三個候選閾值分別為：0.2 時 Precision=20%、Recall=95%；0.4 時 Precision=40%、Recall=90%；0.6 時 Precision=60%、Recall=80%。業務要求 Recall 至少 90%，並在符合條件者中最大化 Precision，應選哪個方案？

- A. 選 0.4，在達標方案中取最高 Precision
- B. 選 0.2，在全部方案中取最高 Recall
- C. 選 0.6，在全部方案中取最高 Precision
- D. 三者任選，因為同一模型的 ROC-AUC 相同

**Unique-answer rationale / explanation:** 0.2 與 0.4 都達 Recall≥90%，其中 0.4 的 Precision 較高，故應選 0.4。0.6 未達召回率限制。ROC-AUC 是跨閾值的排序摘要，不能取代業務限制下的操作點選擇；此選擇仍須在獨立測試資料確認表現。

## Reference checks

Conceptual references checked 2026-09-24; browser QA completed 2026-09-25. These are not official iPAS question sources.
- [scikit-learn SVM](https://scikit-learn.org/stable/modules/svm.html): kernel formulation, soft-margin C and scaling.
- [RBF parameters](https://scikit-learn.org/stable/auto_examples/svm/plot_rbf_parameters.html): C/gamma effects and validation.
- [Model evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html): ROC, AUC, precision and recall definitions.
- [Precision-Recall example](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html): PR interpretation and class imbalance.

## QA evidence

- Scoped baseline audit: PASS. Exactly 12 IDs change; 483 unique questions; all protected metadata/answers/source labels and app shell preserved.
- Node v24.19.0 `vm.Script` syntax parse of actual inline application JS: PASS. Python syntax compilation of both scripts: PASS.
- Historical audits: Batch 1A default (`119b1ce^ → 119b1ce`), Batch 2A (`952c878 → 0cebcdf`), Batch 2B (`0cebcdf → ccb6485`): PASS.
- Independent numerical checks: exp(−2)<exp(−1); Q468 TP=80/FP=99 gives Precision≈44.7%; Q469 ROC point (.10,.80); Q471 feasible-threshold maximum Precision selects .4: PASS.
- Fixture at 375×812: all 12 Practice items correct → 12/12,100%; one wrong choice per item → 0/12,0%. Feedback, answer letters, explanations and next/finish navigation passed. No horizontal overflow across all 24 answered states.
- Wrong-question view showed 12 items; weak-area view showed both topics at 0/6 after wrong answers.
- Fixture at 1440×900: L23 Mock 12/12, score 100, submission and review opened. No question-state overflow; console error log empty.
- Additional mobile Mock screenshot inspected: Q431 notation, longer stem and options wrap normally with usable controls.
- Unfiltered app at `http://127.0.0.1:8767/`: displays 483 questions; all seven panels opened; six non-home panels checked at 375px without horizontal overflow. Practice start/answer/explanation/next passed.
- Cached official 115 second-session L11 opened with 50 questions and official-source labeling; external PDF ingestion was not retested.
- Unfiltered 50-question Mock started and accepted a correct first choice. At submission the browser controller timed out (`Emulation.setFocusEmulationEnabled`); subsequent DOM/AX/log reads also timed out. No confirmation dialog was reported by the dialog API. Therefore unfiltered submission result/review and final console state are NOT claimed as verified. Submission/scoring/review of all 12 changed items passed in the fixture above.
- Browser troubleshooting used the documented tab/dialog/AX APIs; viewport override reset successfully. No app changes made to work around the controller issue.
- `git diff --check`: PASS.

## Limitations / handoff

- Editorial and heuristic checks do not establish learner difficulty/discrimination; protected difficulty labels remain unchanged. Independent Technical Review and human content review remain required.
- 224 >=2x length candidates and 93 repeated groups remain for subsequent batches.
- Fixture narrows the pool, uses memory storage and auto-confirms submission. Native dialog/full-bank submit needs follow-up due to the controller limitation above. Persistence, physical mobile Safari/accessibility and external PDF ingestion were not retested.
- This scoped branch intentionally follows the epic baseline rather than newer dev; Parent #14 governs the subsequent Phase 2 aggregate checkpoint and synchronization.
- No PR, merge, Issue closure, Product Verify declaration or release is performed.
