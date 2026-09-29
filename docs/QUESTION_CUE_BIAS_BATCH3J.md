# Issue #58 — Batch 3J question cue remediation

Engineering evidence, 2026-09-30. Independent Technical Review pending; not Product Verify.

## Baseline and scope

- Contract: [Issue #58](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/58).
- Branch: `codex/issue-58-batch3j`.
- Baseline: `cf8bbd3c444852cc5c47971647e890830e891f75`, fetched latest `question/issue-14-remediation`, identical to the pre-created branch; Batch 3I already integrated.
- Exactly Q448–Q459 (12 self-authored questions). Only question/options/explanation changed; all other fields, answer indices, ID order, non-question DB metadata and HTML/CSS/JS shell preserved.
- Official content, localStorage and unrelated code unchanged. Audit adds batch3j only; all 13 prior batch definitions compared with baseline and preserved. No dependencies added.

## Reproducible audit

```powershell
python scripts/audit_question_cues.py --batch batch3j --baseline cf8bbd3c444852cc5c47971647e890830e891f75 --csv docs/QUESTION_CUE_BIAS_BATCH3J.csv
node scripts/test_past_answer_feedback.cjs
python scripts/serve_question_batch1a.py --batch batch3j
git diff --check
```

The [CSV](QUESTION_CUE_BIAS_BATCH3J.csv) has 966 data rows (483 before / 483 after). Length counts Unicode code points excluding whitespace. Ratio is correct-option length divided by mean distractor length. Repeated sets ignore order and whitespace.

| Whole-bank metric | Before | After |
|---|---:|---:|
| total | 483 | 483 |
| unique_ids | 483 | 483 |
| unique_longest | 217 | 208 |
| ratio_ge_2 | 12 | 0 |
| ratio_ge_3 | 0 | 0 |
| repeated_groups | 48 | 46 |
| repeated_questions | 204 | 192 |
| Answer A / B / C / D | 131 / 109 / 122 / 121 | 131 / 109 / 122 / 121 |

Scoped validation PASS: exactly 12 changed IDs; 483 unique IDs; four distinct options each; valid keys and topic references; all protected fields and non-question shell unchanged. Scoped ratios 0.9623–1.0526, each option set unique across the whole bank. Remaining uniquely-longest keys in scope: Q452 (1.0526), Q453 (1.0526), Q457 (1.0500). These small length differences remain visible; metrics do not replace content review. Whole-bank repeated sets outside scope remain.

## Editorial review

All 12 items manually reviewed for one defensible key, plausible distractors, same-level alternatives, grammar/completeness cues, explanation consistency and distinct decision points. No verified content error requiring a protected-field or contract change was found. Generic scenario padding was replaced with concrete timing or algorithm assumptions.

| Item | Key and distractor review |
|---|---|
| Q448 | A: post-discharge information unavailable at admission. Other options are plausible evaluation diagnoses without supporting evidence in the stem. |
| Q449 | A: remove outcome field and derivatives. Missingness flags, imputation and elapsed days still expose the event. |
| Q450 | C: month-end outcome processing unavailable on month one. Other observations explicitly already known. |
| Q451 | D: reconstruct point-in-time data and retrain. Regularization, more validation samples and threshold tuning retain leaked input. |
| Q452 | D: system availability, not event/day-end/backtest time, defines usable information. |
| Q453 | C: temporal splitting does not remove leakage within a row. More history or smaller model cannot fix availability. |
| Q454 | A: rescaling changes relative distance contributions, not class balance, sample count or K. |
| Q455 | C: RBF uses distance; ordinary single-feature trees rely on order. Algorithm assumptions explicit. |
| Q456 | B: (70−50)/10 = 2. Other values isolate omitted centering, omitted scaling or wrong denominator. |
| Q457 | A: per-feature scaling addresses units. Initialization, iteration count and K address different clustering choices. |
| Q458 | A: positive linear scaling preserves order; distances, variances and threshold numbers change. Finite precision excluded. |
| Q459 | A: fit in training folds, evaluate held-out folds. Other workflows contaminate evaluation or use inconsistent transforms. |

## QA evidence

- Audit PASS; CSV 966 rows; all 13 previous batch definitions preserved.
- Python AST parsing: audit and fixture PASS. Node new Function compiled the inline app script: PASS.
- Existing official-answer regression PASS: 16 answer/selection combinations, repeat guard, progress, escaping, PDF entry, no duplicate/placeholders, navigation/reset and completion scoring.
- In-app Chromium fixture: desktop 1280×900, mobile 375×812. All 12 items answered in Practice (six each). Q456 deliberately selected A; others correct. Feedback, correct key, explanation, self-authored source and navigation verified.
- Practice desktop: Q455, Q451, Q448, Q458, Q459, Q456. Mobile: Q453, Q454, Q450, Q449, Q452, Q457.
- Wrong-question view contained Q456 only; weak-area L23301 showed 11/12, 92%.
- Mock covered all 12 (six mobile, six desktop). Q456 deliberately selected A; submission: 11 correct, 1 wrong, 0 unanswered, score 92. Wrong-only review showed selected A (7), correct B (2) and calculation.
- All seven tabs opened; official scope links rendered. Official 115 second-session L11 structured paper loaded 50 questions with source PDF link and controls.
- Screenshots inspected: mobile Practice Q457, desktop Mock Q451, final mobile Practice Q448. Mobile document scrollWidth 360 with innerWidth 375; no page-level horizontal overflow. Long options wrapped within cards.
- Final editorial refinement replaced Q448 distractors with plausible evaluation diagnoses; refreshed fixture and rechecked final Q448 rendering, correct feedback, explanation, source label and mobile overflow. Answer index unchanged.
- Browser warning/error log empty; viewport override reset. git diff --check PASS before commit.

Limits: existing fixture restricts the in-memory bank to 12 questions, substitutes memory storage, auto-accepts confirmation and disables PDF prewarming. This validates content/rendering/scoring, not persistent storage, native dialogs, full-bank 50-question sampling, live PDF extraction, physical devices, Dev Preview or production. No implementation blocker remains; independent review pending.

## Technical references

- [scikit-learn common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html): unavailable prediction-time information, train-only fitting and consistent transforms.
- [scikit-learn scaling example](https://scikit-learn.org/stable/auto_examples/preprocessing/plot_scaling_importance.html): distance-based models and relative tree robustness.

References support self-authored technical content, not official iPAS attribution.

## Per-question before / after

### Q448

Preserved: 中級 / L23 / L23301; Target Leakage; difficulty hard; key A; sourceType unchanged.

**Before** — lengths 43/17/21/23; ratio 2.1148; flags: length>=2x;unique-longest-correct;repeated-option-set.

預測病人是否住院時，把「出院結算金額」當特徵，離線表現超高。最大問題是？

- A. 任何在預測當下不可取得、卻直接或間接透露目標的特徵都可能造成 Target Leakage
- B. 只要特徵與目標高度相關就一定要保留
- C. 上線後才產生的欄位最適合拿來預測上線前事件
- D. Target Leakage 只會發生在測試集太小

Answer: A

Explanation: Target leakage 會讓離線成績虛高，因模型使用了真實預測時間點不可能取得的資訊。

**After** — lengths 20/20/20/20; ratio 1.0000; flags: none.

急診團隊要在入院決策前預測病人是否住院，歷史資料含本次就醫的「出院結算金額」，且加入後離線分數大增。最直接的問題是？

- A. 結算金額在決策後產生，將事後資訊帶入預測
- B. 未住院樣本比例偏高，使多數類預測拉高分數
- C. 模型參數數量過多，使模型記住訓練樣本雜訊
- D. 訓練與驗證來自不同院區，使資料分布有落差

Answer: A

Explanation: 本次出院結算金額在入院決策時尚不可得，可能間接揭露本次住院結果，形成 Target Leakage。類別不平衡、過度擬合與院區分布差異也是評估時應檢查的問題，但題幹未提供這些證據；已明確指出的缺陷是事後資訊。

### Q449

Preserved: 中級 / L23 / L23301; Target Leakage; difficulty hard; key A; sourceType unchanged.

**Before** — lengths 43/21/23/17; ratio 2.1148; flags: length>=2x;unique-longest-correct;repeated-option-set.

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，預測違約前，特徵包含「催收完成日期」，該欄位只有違約後才出現。這是？

- A. 任何在預測當下不可取得、卻直接或間接透露目標的特徵都可能造成 Target Leakage
- B. 上線後才產生的欄位最適合拿來預測上線前事件
- C. Target Leakage 只會發生在測試集太小
- D. 只要特徵與目標高度相關就一定要保留

Answer: A

Explanation: Target leakage 會讓離線成績虛高，因模型使用了真實預測時間點不可能取得的資訊。

**After** — lengths 20/20/19/20; ratio 1.0169; flags: none.

銀行在貸款核准時預測未來一年是否違約。「催收完成日期」只有本次違約後才會出現；歷史資料中的缺值也保留。哪個處理能直接排除此欄位的目標洩漏？

- A. 移除此欄及其衍生值，改用核准時已知的資料
- B. 改成是否有日期的旗標，以避免模型記住日期
- C. 用固定日期補齊缺值，再保留日期作為輸入
- D. 將日期轉成距今的天數，以減少不同格式差異

Answer: A

Explanation: 是否存在催收完成日期本身就可能揭露違約，轉成旗標、天數或補值仍保留結果資訊。此情境應排除該欄及衍生值，以核准時可得資料重建特徵；不是所有歷史催收資料都不能使用。

### Q450

Preserved: 中級 / L23 / L23301; Target Leakage; difficulty hard; key C; sourceType unchanged.

**Before** — lengths 23/21/43/17; ratio 2.1148; flags: length>=2x;unique-longest-correct;repeated-option-set.

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，下列哪一項最可能造成 Target Leakage？

- A. Target Leakage 只會發生在測試集太小
- B. 上線後才產生的欄位最適合拿來預測上線前事件
- C. 任何在預測當下不可取得、卻直接或間接透露目標的特徵都可能造成 Target Leakage
- D. 只要特徵與目標高度相關就一定要保留

Answer: C

Explanation: Target leakage 會讓離線成績虛高，因模型使用了真實預測時間點不可能取得的資訊。

**After** — lengths 18/18/17/17; ratio 0.9623; flags: none.

銀行在每月一日預測客戶當月是否違約。以下特徵中，哪一項最可能造成 Target Leakage？

- A. 截至上月底且已入帳的最近三期還款金額
- B. 截至上月底且已確認的既有貸款剩餘本金
- C. 當月底結算後回填的本月違約處理進度
- D. 每月一日預測前已確認的客戶契約利率

Answer: C

Explanation: 當月底才結算的本月違約處理進度，在月初預測時不可得，且與當月結果直接相關。其餘三項明定在預測前已確認，不會僅因與目標相關就構成洩漏。

### Q451

Preserved: 中級 / L23 / L23301; Target Leakage; difficulty hard; key D; sourceType unchanged.

**Before** — lengths 17/23/21/43; ratio 2.1148; flags: length>=2x;unique-longest-correct;repeated-option-set.

模型驗證 AUC 0.99，上線卻很差。檢查發現某欄位在結果發生後才生成，這說明？

- A. 只要特徵與目標高度相關就一定要保留
- B. Target Leakage 只會發生在測試集太小
- C. 上線後才產生的欄位最適合拿來預測上線前事件
- D. 任何在預測當下不可取得、卻直接或間接透露目標的特徵都可能造成 Target Leakage

Answer: D

Explanation: Target leakage 會讓離線成績虛高，因模型使用了真實預測時間點不可能取得的資訊。

**After** — lengths 19/19/20/20; ratio 1.0345; flags: none.

驗證 AUC 為 0.99，上線卻明顯下降。團隊發現模型使用了結果發生後才產生的欄位。要檢驗這項 Target Leakage 對評估的影響，哪個實驗最合適？

- A. 保留該欄並提高正則化，再比較原驗證分數
- B. 保留該欄並增加驗證量，再比較原驗證分數
- C. 保留該欄並改變分類閾值，再比較上線準確率
- D. 排除該欄並依預測時點重建資料，再訓練評估

Answer: D

Explanation: 應以預測當下可取得的資訊重建特徵並重新訓練評估，才能檢驗移除洩漏後的效能。正則化、增加樣本或調整閾值都未消除事後資訊；AUC 高低本身不能證明其他原因不存在。

### Q452

Preserved: 中級 / L23 / L23301; Target Leakage; difficulty hard; key D; sourceType unchanged.

**Before** — lengths 23/21/17/43; ratio 2.1148; flags: length>=2x;unique-longest-correct;repeated-option-set.

資料科學家選特徵時，為避免 leakage 最重要的時間點觀念是？

- A. Target Leakage 只會發生在測試集太小
- B. 上線後才產生的欄位最適合拿來預測上線前事件
- C. 只要特徵與目標高度相關就一定要保留
- D. 任何在預測當下不可取得、卻直接或間接透露目標的特徵都可能造成 Target Leakage

Answer: D

Explanation: Target leakage 會讓離線成績虛高，因模型使用了真實預測時間點不可能取得的資訊。

**After** — lengths 19/19/19/20; ratio 1.0526; flags: unique-longest-correct.

每天上午九點預測當日需求。某筆交易發生於八點五十分，但十點才進入可查詢的特徵系統。回測九點的預測時，應採用哪個時間界線？

- A. 以交易發生時間為準，將這筆交易納入特徵
- B. 以當日結束時間為準，將這筆交易納入特徵
- C. 以回測執行時間為準，將這筆交易納入特徵
- D. 以預測可取得時間為準，將這筆交易排除特徵

Answer: D

Explanation: 回測必須重現九點可查詢的資料，而不只是檢查事件發生時間。這筆交易雖已發生，仍未進入可用系統；事後回填會讓回測使用當時不可得的資訊。

### Q453

Preserved: 中級 / L23 / L23301; Target Leakage; difficulty hard; key C; sourceType unchanged.

**Before** — lengths 17/23/43/21; ratio 2.1148; flags: length>=2x;unique-longest-correct;repeated-option-set.

為何「未來才知道的資訊」不應加入預測當下的模型？

- A. 只要特徵與目標高度相關就一定要保留
- B. Target Leakage 只會發生在測試集太小
- C. 任何在預測當下不可取得、卻直接或間接透露目標的特徵都可能造成 Target Leakage
- D. 上線後才產生的欄位最適合拿來預測上線前事件

Answer: C

Explanation: Target leakage 會讓離線成績虛高，因模型使用了真實預測時間點不可能取得的資訊。

**After** — lengths 19/19/20/19; ratio 1.0526; flags: unique-longest-correct.

留存模型在月初預測客戶當月是否退訂。團隊將月底生成的「退訂結案代碼」加入特徵，並改用時間切分驗證。哪個判斷正確？

- A. 時間切分已隔開月份，因此可保留結案代碼
- B. 增加歷史月份的數量，因此可保留結案代碼
- C. 每筆特徵仍含事後資訊，因此應移除結案代碼
- D. 降低模型的參數數量，因此可保留結案代碼

Answer: C

Explanation: 按月份切分不能修復每筆樣本內的洩漏：月初仍無法取得當月底才生成的結案代碼。增加月份或降低複雜度也不能改變這個可得性限制。

### Q454

Preserved: 中級 / L23 / L23301; Feature Scaling; difficulty medium; key A; sourceType unchanged.

**Before** — lengths 38/19/13/19; ratio 2.2353; flags: length>=2x;unique-longest-correct;repeated-option-set.

身高以公分、收入以元，使用 KNN 時為何常要先做 scaling？

- A. 對尺度敏感的模型如 KNN、SVM、梯度型線性模型常需縮放；樹模型通常較不敏感
- B. Scaling 的主要目的為產生更多樣本
- C. 樹模型若不標準化就無法分裂
- D. 所有模型都必須做 Min-Max 才能運作

Answer: A

Explanation: 是否需要 scaling 取決於演算法。距離與梯度型方法通常較敏感；決策樹分裂主要依排序，通常不太受單位尺度影響。

**After** — lengths 21/20/21/21; ratio 1.0161; flags: none.

KNN 使用未加權的歐氏距離，輸入包含身高（公分）與年收入（元），兩者數值範圍差很多。先做特徵縮放的主要理由是？

- A. 調整各維尺度，減少收入數值範圍對距離的主導
- B. 調整類別比例，減少多數類樣本對投票的主導
- C. 調整樣本數量，減少訓練資料不足對估計的影響
- D. 調整鄰居數目，減少單一近鄰對預測結果的影響

Answer: A

Explanation: 歐氏距離累加各維度差的平方，數值範圍大的收入可能主導鄰居選擇。縮放改變各維相對尺度，不會直接改變類別比例、樣本數或 K；是否縮放仍須配合任務需要。

### Q455

Preserved: 中級 / L23 / L23301; Feature Scaling; difficulty medium; key C; sourceType unchanged.

**Before** — lengths 19/19/38/13; ratio 2.2353; flags: length>=2x;unique-longest-correct;repeated-option-set.

同一份表格資料分別訓練 SVM 與 Random Forest，對尺度敏感程度通常如何？

- A. 所有模型都必須做 Min-Max 才能運作
- B. Scaling 的主要目的為產生更多樣本
- C. 對尺度敏感的模型如 KNN、SVM、梯度型線性模型常需縮放；樹模型通常較不敏感
- D. 樹模型若不標準化就無法分裂

Answer: C

Explanation: 是否需要 scaling 取決於演算法。距離與梯度型方法通常較敏感；決策樹分裂主要依排序，通常不太受單位尺度影響。

**After** — lengths 22/22/22/23; ratio 0.9851; flags: none.

同一份數值資料含差異很大的特徵尺度。比較使用 RBF 核的 SVM 與一般依單一特徵閾值分裂的 Random Forest，哪個描述較合理？

- A. 兩者都依單一欄位排序，因此通常較少受尺度影響
- B. 兩者都依樣本間的距離，因此通常較易受尺度影響
- C. 前者的核涉及距離，因此通常比後者更受尺度影響
- D. 後者的分裂涉及距離，因此通常比前者更受尺度影響

Answer: C

Explanation: RBF 核使用平方距離，特徵尺度會影響核值。一般 Random Forest 的分裂主要依欄位排序與閾值，通常較少受正向線性縮放影響；這不保證所有實作或任何資料轉換都完全不變。

### Q456

Preserved: 中級 / L23 / L23301; Feature Scaling; difficulty medium; key B; sourceType unchanged.

**Before** — lengths 19/38/13/19; ratio 2.2353; flags: length>=2x;unique-longest-correct;repeated-option-set.

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，下列哪一項最合理描述 Feature Scaling？

- A. 所有模型都必須做 Min-Max 才能運作
- B. 對尺度敏感的模型如 KNN、SVM、梯度型線性模型常需縮放；樹模型通常較不敏感
- C. 樹模型若不標準化就無法分裂
- D. Scaling 的主要目的為產生更多樣本

Answer: B

Explanation: 是否需要 scaling 取決於演算法。距離與梯度型方法通常較敏感；決策樹分裂主要依排序，通常不太受單位尺度影響。

**After** — lengths 15/16/16/17; ratio 1.0000; flags: none.

某欄位以訓練集平均數 50、標準差 10 做標準化 z＝(x−平均數)／標準差。驗證集的一筆原值為 70；沿用訓練集參數後應得到多少？

- A. 7，將原值直接除以訓練集標準差
- B. 2，將原值減去平均數後除以標準差
- C. 20，將原值減去平均數後作為結果
- D. 1.4，將原值直接除以訓練集平均數

Answer: B

Explanation: z＝(70−50)／10＝2。標準化同時中心化與縮放，不能只做其中一步或改除以平均數；驗證與推論應沿用訓練階段取得的參數。

### Q457

Preserved: 中級 / L23 / L23301; Feature Scaling; difficulty medium; key A; sourceType unchanged.

**Before** — lengths 38/19/19/13; ratio 2.2353; flags: length>=2x;unique-longest-correct;repeated-option-set.

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，K-means 的距離可能被高量綱特徵主導，應如何改善？

- A. 對尺度敏感的模型如 KNN、SVM、梯度型線性模型常需縮放；樹模型通常較不敏感
- B. 所有模型都必須做 Min-Max 才能運作
- C. Scaling 的主要目的為產生更多樣本
- D. 樹模型若不標準化就無法分裂

Answer: A

Explanation: 是否需要 scaling 取決於演算法。距離與梯度型方法通常較敏感；決策樹分裂主要依排序，通常不太受單位尺度影響。

**After** — lengths 21/20/20/20; ratio 1.0500; flags: unique-longest-correct.

以歐氏距離做 K-means，金額欄位的數值範圍遠大於其他欄位。團隊希望各欄位具有較接近的尺度，哪個做法最直接符合目的？

- A. 逐欄縮放到可比較的尺度，再以轉換後資料分群
- B. 增加群集中心的初始候選，再以原始資料分群
- C. 提高群集中心的更新次數，再以原始資料分群
- D. 增加預先指定的群集數目，再以原始資料分群

Answer: A

Explanation: 逐欄縮放直接改變各維度在歐氏距離中的相對貢獻。初始化、迭代次數與群數會影響分群，但不直接修正量綱差異；縮放方法也應符合各特徵在任務中的意義。

### Q458

Preserved: 中級 / L23 / L23301; Feature Scaling; difficulty medium; key A; sourceType unchanged.

**Before** — lengths 38/13/19/19; ratio 2.2353; flags: length>=2x;unique-longest-correct;repeated-option-set.

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，決策樹為何通常不像 KNN 那麼依賴標準化？

- A. 對尺度敏感的模型如 KNN、SVM、梯度型線性模型常需縮放；樹模型通常較不敏感
- B. 樹模型若不標準化就無法分裂
- C. 所有模型都必須做 Min-Max 才能運作
- D. Scaling 的主要目的為產生更多樣本

Answer: A

Explanation: 是否需要 scaling 取決於演算法。距離與梯度型方法通常較敏感；決策樹分裂主要依排序，通常不太受單位尺度影響。

**After** — lengths 23/22/23/24; ratio 1.0000; flags: none.

一般決策樹對單一數值欄位做閾值分裂。將此欄全部由公分改為公尺，忽略浮點誤差且重新訓練時，為何通常可得到相同的樣本分組？

- A. 正向線性縮放保留排序，對應閾值仍可分出相同樣本
- B. 正向線性縮放保留距離，因此相鄰樣本的距離不變
- C. 正向線性縮放保留變異，因此每個欄位的變異數不變
- D. 正向線性縮放保留閾值，因此節點使用的數值門檻不變

Answer: A

Explanation: 除以 100 保留大小排序，原門檻也除以 100 就能對應相同分組。距離、變異數及門檻的數值會改變；此敘述針對一般單欄閾值樹，不泛指所有樹模型或有限精度實作。

### Q459

Preserved: 中級 / L23 / L23301; Feature Scaling; difficulty medium; key A; sourceType unchanged.

**Before** — lengths 38/13/19/19; ratio 2.2353; flags: length>=2x;unique-longest-correct;repeated-option-set.

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，選擇 Standardization/Normalization 前，應先考慮什麼？

- A. 對尺度敏感的模型如 KNN、SVM、梯度型線性模型常需縮放；樹模型通常較不敏感
- B. 樹模型若不標準化就無法分裂
- C. 所有模型都必須做 Min-Max 才能運作
- D. Scaling 的主要目的為產生更多樣本

Answer: A

Explanation: 是否需要 scaling 取決於演算法。距離與梯度型方法通常較敏感；決策樹分裂主要依排序，通常不太受單位尺度影響。

**After** — lengths 26/25/25/26; ratio 1.0263; flags: none.

團隊要為含離群值的數值特徵選擇標準化、Min-Max 或穩健縮放。哪個評估程序最合理？

- A. 依模型與資料分布提出候選，在訓練折擬合後用驗證折比較
- B. 依測試集分數逐一挑選候選，再回到訓練集擬合最佳方法
- C. 先用全部資料估計縮放參數，再切成訓練折與驗證折比較
- D. 先將每個資料子集各自縮放，再比較各自重新擬合後的結果

Answer: A

Explanation: 縮放方法要配合模型、分布及離群值，並在每個訓練折擬合參數後套用至驗證折。用測試集選方法或先擬合全部資料會洩漏評估資訊；各子集各自擬合則改變特徵轉換基準。
