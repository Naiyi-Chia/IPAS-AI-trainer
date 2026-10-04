# Issue #51 — Batch 3C cue-bias remediation

## Contract and baseline

- Issue: https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/51; Parent #14.
- Branch: pre-created `codex/issue-51-batch3c`.
- Baseline: latest `question/issue-14-remediation` at implementation start, `6dfea04da4755115496e695b7c940e9635aa526f`; designated branch had the identical head. Batch 3B was already integrated via #90. Working tree was clean before editing.
- Scope: Q106–Q108, Q145–Q150, Q178–Q189 (21 questions).
- Only question/options/explanation change. All protected fields, answer indices, source labels, other questions, DB metadata and application shell are unchanged. No official question content, localStorage behavior, UI or dependency changes.
- Supporting files: add `batch3c` audit registry entry; this editorial/QA report and full-bank before/after CSV. All six prior batch definitions remain identical to baseline.
- Engineering evidence only; independent Technical Review is pending. No PR, merge, Issue closure or Product Verify is asserted.

## Reproduction

```powershell
python scripts/audit_question_cues.py --batch batch3c --baseline 6dfea04da4755115496e695b7c940e9635aa526f --csv docs/QUESTION_CUE_BIAS_BATCH3C.csv
node scripts/test_past_answer_feedback.cjs
python scripts/serve_question_batch1a.py --batch batch3c
```

Open `http://127.0.0.1:8766/batch3c`. The unchanged fixture runs the actual app with these 21 questions in memory, memory storage, automatically accepted exam confirmation, and PDF prewarming disabled. Practice order and Mock sampling remain randomized. It checks rendering/scoring, not persistent storage, native confirmation dialogs or full-bank 50-question sampling.

CSV contains 483 before + 483 after rows. Length counts Unicode code points excluding whitespace; duplicate option sets ignore ordering and whitespace. Assertions check exact changed IDs, protected fields, IDs/order, mappings, entire application shell, scoped ratios and full-bank option-set uniqueness.

## Whole-bank metrics

| Metric | Before | After |
| --- | ---: | ---: |
| total | 483 | 483 |
| unique_ids | 483 | 483 |
| unique_longest | 350 | 332 |
| ratio_ge_2 | 176 | 155 |
| ratio_ge_3 | 0 | 0 |
| repeated_groups | 77 | 72 |
| repeated_questions | 368 | 347 |

Answer A/B/C/D totals remain 131/109/122/121. All modified ratios are below 2.0 (0.8873–1.1429). Five repeated clusters become 21 option sets unique across the bank. Q148, Q178 and Q184 remain uniquely longest at 1.1429, 1.0526 and 1.0781. These metrics support editorial review; they do not establish empirical difficulty or prove that every possible cue is absent.

## Cluster review

| IDs | Distinct decisions tested |
| --- | --- |
| Q106–Q108 | Labeled classification; continuous-target prediction; paired image/label learning |
| Q145–Q147 | User-level adjacency; comparable privacy bounds; basic sequential composition |
| Q148–Q150 | False-negative denominators; proxy features; equal opportunity metric |
| Q178–Q183 | Weight learning; contaminated test recovery; chronological split; machine grouping; fold-local imputation; early stopping |
| Q184–Q189 | Missingness investigation; robust baseline statistic; train-only mean; structural not-applicable values; deletion bias; missing indicator |

Each item has a specific criterion and alternatives at the same decision level. Explanations identify why each competing approach fails that criterion. DP comparisons fix adjacency and delta; composition explicitly asks for the basic sequential calculation, not exact loss or an arbitrary looser bound. Fairness questions avoid treating one metric as proof of overall fairness. The six-item clusters no longer repeat a single all-inclusive answer checklist.

## Verification — 2026-09-27

- Scoped audit PASS: exactly 21 modified; 483 unique IDs; metadata/answers/source labels and app shell unchanged; all scoped ratios <2 and no repeated scoped option sets.
- JS syntax PASS: one inline application script compiled with Node `new Function`.
- Python syntax PASS: `ast.parse` for audit and fixture scripts; existing six batch registry definitions compared against baseline and unchanged.
- Existing official-answer regression PASS: all 16 answer/selection combinations, repeat guard, progress, render escaping, PDF entry, navigation/reset and completion score.
- Browser: Codex in-app browser; desktop 1280×900 and mobile 375×812.
- Practice: all 21 revised items rendered and answered; first 10 on desktop, remaining 11 on mobile. Correct/incorrect feedback, explanation, self-authored source label and navigation checked after every answer. 20 correct; Q146 deliberately incorrect.
- Practice order: Q183, Q146, Q186, Q179, Q148, Q108, Q150, Q147, Q181, Q180 / Q107, Q149, Q184, Q178, Q182, Q185, Q188, Q145, Q187, Q189, Q106.
- Wrong book: exactly Q146. Weak-area view: L23401 2/3 (67%); L11202 12/12 (100%); L23402 and L22402 each 3/3 (100%).
- Mobile L11 Mock: all 12 revised items answered correctly; submit → 100 points, 12 correct / 0 incorrect / 0 unanswered. Entered 12-item review; expanded Q183 and verified answer/explanation/source.
- Desktop L23 Mock: all six revised items answered with Q146 deliberately wrong; submit → 83 points, 5 correct / 1 incorrect / 0 unanswered. Wrong-only review showed Q146, selected A / correct B and matching explanation.
- Desktop L22 Mock: Q106, Q107 and Q108 all answered correctly; submit → 100 points, 3 correct / 0 incorrect / 0 unanswered. Entered three-item review.
- Desktop Practice and mobile Practice/expanded Mock review screenshots inspected: text wraps within cards; navigation and review expansion usable. Mobile document scrollWidth 360px at innerWidth 375px for Practice and expanded Mock review: no horizontal page overflow. Existing tab strip scrolls independently.
- All seven tabs opened. Official scope links rendered. Official-paper flow loaded 115 second-session L11, 50 structured questions, with original PDF link and answer controls.
- Browser console warnings/errors: none at completion.
- Final diff reviewed structurally because DB occupies one line; `git diff --check` PASS before commit.
- Limitations: isolated fixture as described above; no full-bank/native-dialog/persistent-storage or physical-device run. Corresponding application behavior is unchanged. No implementation blocker identified.

## Technical references

Primary references checked for relevant concepts. Scenarios, distractors and calculations are original self-authored practice content, not official exam wording.

- [NIST SP 800-226](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-226.pdf), sections 2.1.2, 2.2, 2.4 and 2.5: composition, epsilon, user-level privacy and comparable guarantees (Q145–Q147).
- [NIST differential privacy introduction](https://www.nist.gov/blogs/cybersecurity-insights/differential-privacy-privacy-preserving-data-analysis-introduction-our): privacy/utility and calibrated noise context.
- [Fairlearn common fairness metrics](https://fairlearn.org/main/user_guide/assessment/common_fairness_metrics.html): conditioning populations and group metrics (Q148, Q150).
- [Fairlearn fairness guide](https://github.com/fairlearn/fairlearn/blob/main/docs/user_guide/fairness_in_machine_learning.rst): group assessment and sensitive features (Q149).
- [scikit-learn cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html): independent evaluation, groups, temporal split and preprocessing within folds (Q178–Q182).
- [scikit-learn common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html): train-only preprocessing and avoiding leakage (Q182, Q186).
- [scikit-learn imputation](https://scikit-learn.org/stable/modules/impute.html): statistical imputation and missing indicators (Q185, Q189).

## Item-by-item editorial review

Engineering Agent editorial review: each item checked for one defensible key, plausible same-level alternatives, grammar/length cues, and explanation consistency. Independent Technical Review remains pending.

### Q106 — 鑑別式 AI 與大數據

Protected mapping: 中級 / L22 / L22402 / easy; answer index 1 (B).
Length ratio: 2.3750 → 1.0000; lengths: 6/19/9/9 → 19/19/19/19.

**Before:** 大量歷史交易與詐欺標籤最適合支援哪類鑑別式 AI 應用？

- A. 只生成新圖片
- B. 訓練分類／預測模型以學習輸入與標籤關係
- C. 完全不需標籤或特徵
- D. 只產生自然語言故事

**After:** 平台已有大量交易特徵及人工確認的詐欺標籤。若要對新交易輸出「詐欺／正常」，哪項任務最符合需求？

- A. 依交易特徵分群，探索尚未命名的交易型態
- B. 以標註交易訓練分類器，判斷新交易的類別
- C. 以歷史交易訓練生成器，合成新的交易紀錄
- D. 依交易時間建立預測器，估計下月交易總量

**Unique-answer rationale / explanation:** 以特徵對應既有詐欺標籤、預測新交易類別，是鑑別式分類的典型用途。分群探索群體、生成器合成紀錄、時間預測估計總量，都不是題目要求的逐筆類別判斷。

### Q107 — 鑑別式 AI 與大數據

Protected mapping: 中級 / L22 / L22402 / easy; answer index 1 (B).
Length ratio: 2.3750 → 0.9828; lengths: 9/19/6/9 → 19/19/19/20.

**Before:** 某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，有大量標註資料要預測『是否違約』，這屬於？

- A. 只產生自然語言故事
- B. 訓練分類／預測模型以學習輸入與標籤關係
- C. 只生成新圖片
- D. 完全不需標籤或特徵

**After:** 團隊以線性迴歸，從房屋特徵直接學習成交價格的預測關係。就模型的主要學習目標而言，這是哪種應用？

- A. 分群應用，依房屋相似性建立未命名的群組
- B. 鑑別式預測，從輸入特徵估計連續的目標值
- C. 生成式應用，學習資料分布以合成房屋樣本
- D. 關聯規則應用，找出設備項目經常共現的組合

**Unique-answer rationale / explanation:** 此模型直接學習輸入特徵到目標價格的映射，屬鑑別式預測中的迴歸任務。分群、合成樣本及共現規則各有不同目標；鑑別式應用並不限於離散類別。

### Q108 — 鑑別式 AI 與大數據

Protected mapping: 中級 / L22 / L22402 / easy; answer index 3 (D).
Length ratio: 2.3750 → 0.9545; lengths: 9/9/6/19 → 22/22/22/21.

**Before:** 大數據在鑑別式 AI 中常用來？

- A. 完全不需標籤或特徵
- B. 只產生自然語言故事
- C. 只生成新圖片
- D. 訓練分類／預測模型以學習輸入與標籤關係

**After:** 某鑑別式影像分類器要區分三種產品瑕疵。歷史影像已依相同標準標註，大量配對資料主要提供什麼學習訊息？

- A. 提供影像相似關係，讓模型據此探索未標示的群組
- B. 提供影像像素內容，讓模型據此學習還原原始影像
- C. 提供影像生成範例，讓模型據此合成新的產品照片
- D. 提供影像與類別關係，讓模型據此區分不同瑕疵

**Unique-answer rationale / explanation:** 鑑別式分類器利用影像特徵與瑕疵標籤的配對關係學習類別區分。探索未標示群組、還原原始影像及合成新影像，均非這個分類任務的主要學習目標。

### Q145 — 差分隱私

Protected mapping: 中級 / L23 / L23401 / hard; answer index 3 (D).
Length ratio: 2.7778 → 0.9718; lengths: 13/4/10/25 → 24/24/23/23.

**Before:** 某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，希望降低模型訓練結果洩漏單一個體資料的風險，可考慮哪種技術？

- A. Early Stopping
- B. 資料增強
- C. Beam Search
- D. 差分隱私（Differential Privacy）

**After:** 平台採用差分隱私發布統計，每位使用者可貢獻多筆紀錄。若承諾保護「一位使用者是否參與」，隱私分析應如何定義相鄰資料集？

- A. 以替換一個統計輸出為差異，按輸出欄位數量校準機制
- B. 以增減任意一筆紀錄為差異，不另外限制每人紀錄總量
- C. 以替換一個資料欄位為差異，按欄位平均值校準機制
- D. 以增減一人全部紀錄為差異，限制其貢獻並校準機制

**Unique-answer rationale / explanation:** 使用者層級保護須以一位使用者的全部貢獻界定相鄰資料集，並據此限制貢獻、校準機制。只保護一筆紀錄不能直接等同保護有多筆紀錄的個人；更換輸出或欄位也不符合題述保護單位。

### Q146 — 差分隱私

Protected mapping: 中級 / L23 / L23401 / hard; answer index 1 (B).
Length ratio: 2.7778 → 0.9692; lengths: 10/25/13/4 → 21/21/22/22.

**Before:** 某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，在統計／模型訓練中加入受控隨機噪聲，提供個體層級隱私保證，稱為？

- A. Beam Search
- B. 差分隱私（Differential Privacy）
- C. Early Stopping
- D. 資料增強

**After:** 兩個差分隱私方案使用相同的相鄰關係與 δ，甲宣告 ε＝0.5，乙宣告 ε＝2。僅就宣告的隱私損失界限，何者正確？

- A. 乙的界限較嚴格，因較大的 ε 代表更多隱私保護
- B. 甲的界限較嚴格，但不能據此判定統計誤差較小
- C. 兩者的界限相同，因相同的 δ 已決定全部隱私強度
- D. 甲的界限較嚴格，因此其輸出會更接近無噪聲統計

**Unique-answer rationale / explanation:** 在相同相鄰關係與 δ 下，較小的 ε 表示宣告的隱私損失上界更嚴格，不代表統計誤差更小。δ 相同不能消除 ε 的差異；隱私界限也不是準確度排名。

### Q147 — 差分隱私

Protected mapping: 中級 / L23 / L23401 / hard; answer index 3 (D).
Length ratio: 2.7778 → 0.9184; lengths: 10/13/4/25 → 17/16/16/15.

**Before:** 某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，Differential Privacy 的主要目標是？

- A. Beam Search
- B. Early Stopping
- C. 資料增強
- D. 差分隱私（Differential Privacy）

**After:** 同一批個人資料先後發布四份統計，每次機制各滿足 ε＝0.5 的純差分隱私。採基本循序組合界限時，總 ε 的上界如何計算？

- A. 取四次的最大值，總 ε 的上界為 0.5
- B. 將發布次數當成 ε，總 ε 的上界為 4
- C. 取平方和的平方根，總 ε 的上界為 1
- D. 將四次的 ε 相加，總 ε 的上界為 2

**Unique-answer rationale / explanation:** 對同一批資料多次發布，基本循序組合以各次 ε 相加作為總隱私損失上界，因此為 4×0.5＝2。最大值、發布次數或平方和開根號不是此處指定的計算規則；這個上界也不等於精確實際損失。

### Q148 — 公平性

Protected mapping: 中級 / L23 / L23402 / hard; answer index 2 (C).
Length ratio: 2.3824 → 1.1429; lengths: 6/12/27/16 → 21/21/24/21.

**Before:** 某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，信用模型對不同群體的錯誤率差距很大，應優先做什麼？

- A. 關閉模型監控
- B. 直接刪除所有少數群體資料
- C. 分群評估公平性指標、檢查資料與特徵偏誤，並評估修正方案
- D. 只看整體 Accuracy 即可忽略

**After:** 分類器用來找出應轉人工處理的案件。甲群 100 件實際需轉人工案件漏掉 10 件，乙群 50 件中漏掉 10 件。若關注漏接協助的差距，哪個判讀正確？

- A. 兩群漏接程度相同，因漏掉的案件數都為 10 件
- B. 甲群漏接程度較高，因實際需轉人工的案件較多
- C. 乙群漏接率為 20%，高於甲群的 10%，應調查差異
- D. 乙群漏接程度較低，因實際需轉人工的案件較少

**Unique-answer rationale / explanation:** 假陰性率以實際正例為分母：甲為 10/100＝10%，乙為 10/50＝20%。相同漏接件數不代表相同漏接率；此差距是調查訊號，尚不能單憑它確定偏誤來源。

### Q149 — 公平性

Protected mapping: 中級 / L23 / L23402 / hard; answer index 1 (B).
Length ratio: 2.3824 → 0.9863; lengths: 16/27/12/6 → 24/24/25/24.

**Before:** AI 公平性治理中，發現特定群體被系統性不利對待時，較適當的是？

- A. 只看整體 Accuracy 即可忽略
- B. 分群評估公平性指標、檢查資料與特徵偏誤，並評估修正方案
- C. 直接刪除所有少數群體資料
- D. 關閉模型監控

**After:** 團隊移除模型輸入中的群體欄位，但保留可能與群體相關的區域及使用行為特徵。評估公平性時，哪種做法較合理？

- A. 以輸入已移除群體欄位為依據，將公平性檢查視為完成
- B. 以合宜治理下的群體資料評估結果，檢查代理特徵影響
- C. 以整體準確率較改版前提高為依據，判定群體差距已消失
- D. 以各特徵與群體的線性相關較低為依據，判定結果公平

**Unique-answer rationale / explanation:** 移除群體欄位不會自動消除代理特徵或其他流程造成的差距。仍應在合宜的資料治理下分群評估並調查來源；整體準確率及單一線性相關檢查不能證明結果公平。

### Q150 — 公平性

Protected mapping: 中級 / L23 / L23402 / hard; answer index 2 (C).
Length ratio: 2.3824 → 0.9231; lengths: 16/12/27/6 → 21/21/20/23.

**Before:** 某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，模型整體 Accuracy 很高，但少數群體表現明顯較差，這表示？

- A. 只看整體 Accuracy 即可忽略
- B. 直接刪除所有少數群體資料
- C. 分群評估公平性指標、檢查資料與特徵偏誤，並評估修正方案
- D. 關閉模型監控

**After:** 案件篩選系統的公平性目標，是讓各群體中「實際需要協助者」有相近的被選中機會。應優先比較哪個指標？

- A. 各群體全體案件被選中的比例，不區分實際需求
- B. 各群體已被選中案件中，實際需要協助者的比例
- C. 各群體實際需要協助者中，被系統選中的比例
- D. 各群體全部案件中，預測類別與實際類別一致的比例

**Unique-answer rationale / explanation:** 題述關注實際正例被選中的機會，對應各群體的真陽性率（召回率）。全體選中率、精確率及整體準確率的分母不同，回答的是不同公平性或效能問題；單一指標也不代表所有面向公平。

### Q178 — Train/Validation/Test

Protected mapping: 初級 / L11 / L11202 / medium; answer index 1 (B).
Length ratio: 2.1064 → 1.0526; lengths: 17/33/14/16 → 19/20/19/19.

**Before:** 團隊要比較三種模型並調整超參數，最後還要保留一份資料估計真實泛化能力。訓練／驗證／測試資料的分工何者正確？

- A. 三個資料集都應同時用來更新模型權重
- B. 訓練集用來學參數；驗證集協助選模型／調參；測試集保留做最終泛化評估
- C. 驗證集只在模型上線後才有用途
- D. 測試集應反覆用來挑超參數直到最佳

**After:** 團隊已切分訓練、驗證與測試資料。要以梯度下降更新模型權重時，標準開發流程應使用哪份資料計算訓練損失？

- A. 驗證集，以候選模型比較用的樣本更新權重
- B. 訓練集，以供模型學習的樣本計算損失並更新
- C. 測試集，以最終評估用的樣本持續修正權重
- D. 三者合併，以增加每次更新可使用的樣本數

**Unique-answer rationale / explanation:** 模型權重由訓練資料的損失來學習；驗證資料用於選型與調參，保留測試資料用於最終評估。用後兩者更新權重或直接合併，會破壞原先的獨立評估分工。

### Q179 — Train/Validation/Test

Protected mapping: 初級 / L11 / L11202 / medium; answer index 0 (A).
Length ratio: 2.1064 → 0.9452; lengths: 33/16/17/14 → 23/25/24/24.

**Before:** 某模型開發者一直用測試集挑 learning rate，最後再回報同一測試集成績。較好的資料切分原則是？

- A. 訓練集用來學參數；驗證集協助選模型／調參；測試集保留做最終泛化評估
- B. 測試集應反覆用來挑超參數直到最佳
- C. 三個資料集都應同時用來更新模型權重
- D. 驗證集只在模型上線後才有用途

**After:** 開發者已反覆查看測試集分數來挑學習率。若仍要估計選定模型對未見資料的表現，下一步較合理的是？

- A. 另保留未參與選型的代表性資料，待方案固定後評估
- B. 把原測試集重新命名為驗證集，再以同一分數作最終成績
- C. 把原測試集的資料列重新排序，再評估一次作最終成績
- D. 把歷次測試分數取平均值，用平均成績消除選型的影響

**Unique-answer rationale / explanation:** 已參與選型的測試集不再提供獨立的最終評估，應以未參與選型且具代表性的資料確認表現。重新命名、排序或平均歷次分數都不能消除反覆選型造成的偏誤。

### Q180 — Train/Validation/Test

Protected mapping: 初級 / L11 / L11202 / medium; answer index 2 (C).
Length ratio: 2.1064 → 0.9718; lengths: 14/17/33/16 → 24/23/23/24.

**Before:** 在標準機器學習流程中，哪一種資料分工最能降低「為了測試集而調模型」造成的樂觀偏誤？

- A. 驗證集只在模型上線後才有用途
- B. 三個資料集都應同時用來更新模型權重
- C. 訓練集用來學參數；驗證集協助選模型／調參；測試集保留做最終泛化評估
- D. 測試集應反覆用來挑超參數直到最佳

**After:** 團隊用歷年銷售紀錄預測未來月份，部署時無法取得未來資訊。哪種資料切分較貼近實際使用情境？

- A. 以月份隨機分配資料，讓各集合都混合早期與晚期紀錄
- B. 以最近月份訓練模型，再用較早的月份評估預測能力
- C. 以早期月份訓練、後續月份驗證，保留更晚月份測試
- D. 以銷售額排序後切分，讓低額資料訓練而高額資料測試

**Unique-answer rationale / explanation:** 時間預測應模擬用過去預測未來，按時間先後安排訓練、驗證與測試，並避免特徵使用未來資訊。隨機混合、逆向時間及依金額切分都不如題述方式貼近部署情境。

### Q181 — Train/Validation/Test

Protected mapping: 初級 / L11 / L11202 / medium; answer index 2 (C).
Length ratio: 2.1064 → 0.9851; lengths: 14/17/33/16 → 22/22/22/23.

**Before:** 若資料已切成 train、validation、test，模型權重、模型選擇、最終評估通常分別由哪些資料負責？

- A. 驗證集只在模型上線後才有用途
- B. 三個資料集都應同時用來更新模型權重
- C. 訓練集用來學參數；驗證集協助選模型／調參；測試集保留做最終泛化評估
- D. 測試集應反覆用來挑超參數直到最佳

**After:** 設備資料中，同一台機器有多筆高度相似的紀錄。若要評估模型對全新機器的表現，應採哪種切分？

- A. 逐筆隨機切分，讓每台機器的紀錄分散到各資料集
- B. 依檔案筆數切分，使每個資料集包含相近的紀錄量
- C. 依機器識別分組，使同台機器不跨訓練與測試資料
- D. 依量測數值排序，使不同資料集分別涵蓋高值與低值

**Unique-answer rationale / explanation:** 目標是全新機器，須在機器層級隔離資料，避免同機近似紀錄跨集合而高估表現。逐筆隨機與按檔案筆數切分未保證隔離；依量測數值切分也不對應評估目標。

### Q182 — Train/Validation/Test

Protected mapping: 初級 / L11 / L11202 / medium; answer index 0 (A).
Length ratio: 2.1064 → 1.0000; lengths: 33/14/16/17 → 23/23/23/23.

**Before:** 產品團隊想公平比較候選模型。下列哪個 train/validation/test 使用方式較合理？

- A. 訓練集用來學參數；驗證集協助選模型／調參；測試集保留做最終泛化評估
- B. 驗證集只在模型上線後才有用途
- C. 測試集應反覆用來挑超參數直到最佳
- D. 三個資料集都應同時用來更新模型權重

**After:** 團隊已保留最終測試集，現在用五折交叉驗證挑模型。每一折含需由資料估計的補值步驟，應如何執行？

- A. 以該折訓練部分估計補值參數，再轉換該折驗證部分
- B. 以五折全部資料估計補值參數，再固定參數評估各折
- C. 以保留測試集估計補值參數，再套用到各折驗證部分
- D. 以該折驗證部分估計補值參數，再反向轉換訓練部分

**Unique-answer rationale / explanation:** 每折的驗證部分應模擬未見資料，因此補值參數只能由該折訓練部分估計。使用全部資料、最終測試集或該折驗證資料估計，都將評估資料資訊帶入開發流程。

### Q183 — Train/Validation/Test

Protected mapping: 初級 / L11 / L11202 / medium; answer index 1 (B).
Length ratio: 2.1064 → 1.0000; lengths: 17/33/16/14 → 24/24/24/24.

**Before:** 為避免測試結果被反覆調參污染，下列哪一項是正確做法？

- A. 三個資料集都應同時用來更新模型權重
- B. 訓練集用來學參數；驗證集協助選模型／調參；測試集保留做最終泛化評估
- C. 測試集應反覆用來挑超參數直到最佳
- D. 驗證集只在模型上線後才有用途

**After:** 訓練損失持續下降，但驗證損失開始上升。團隊使用早停法選擇訓練輪次，並保留最終測試集。何者較合適？

- A. 選訓練損失最低的輪次，以擬合訓練資料的程度為依據
- B. 依預定早停規則選驗證表現較佳的輪次，再做最終測試
- C. 逐輪查看測試集的損失，以測試表現最佳的輪次作選擇
- D. 先合併驗證資料再繼續訓練，以合併後的損失決定輪次

**Unique-answer rationale / explanation:** 早停通常以驗證表現及事先設定的規則選擇輪次，模型選定後才做最終測試。訓練損失較低不代表泛化較好；逐輪看測試集或先合併驗證資料會破壞這項分工。

### Q184 — 缺失值處理

Protected mapping: 初級 / L11 / L11202 / medium; answer index 3 (D).
Length ratio: 2.2895 → 1.0781; lengths: 14/9/15/29 → 21/21/22/23.

**Before:** 醫療資料中某檢驗欄位有 18% 缺值。團隊應先做什麼，再決定如何處理？

- A. 所有含缺失值的資料列一律刪除
- B. 所有缺失值一律補 0
- C. 直接用測試集平均值填補訓練資料
- D. 先理解缺失原因與欄位意義，再依情況刪除、插補或建立缺失指標

**After:** 工廠某感測欄位有 18% 缺值，尚不清楚是設備停機、傳輸失敗或匯入錯誤。決定刪除或插補前，應先做什麼？

- A. 依其他工廠慣用的補值方式，先產生完整資料表
- B. 依缺值比例套用固定刪欄門檻，先縮減資料欄位
- C. 依模型能否接受空值，先選定模型再解讀缺值原因
- D. 核對缺值發生條件與來源紀錄，釐清欄位及缺失意義

**Unique-answer rationale / explanation:** 不同原因的缺失可能有不同業務意義，應先核對來源與發生條件。套用他廠方法、固定比例門檻或只看模型是否支援空值，都不足以判斷這些資料應如何處理。

### Q185 — 缺失值處理

Protected mapping: 初級 / L11 / L11202 / medium; answer index 3 (D).
Length ratio: 2.2895 → 1.0526; lengths: 9/14/15/29 → 20/19/18/20.

**Before:** 客戶資料部分收入欄位缺失，而且缺失可能與職業型態相關。最合理的處理原則是？

- A. 所有缺失值一律補 0
- B. 所有含缺失值的資料列一律刪除
- C. 直接用測試集平均值填補訓練資料
- D. 先理解缺失原因與欄位意義，再依情況刪除、插補或建立缺失指標

**After:** 某數值欄位少量缺值，團隊要先做單一常數插補基準。已知有效值明顯右偏且有極端高值，希望補值較不受極端值影響，應優先試哪個統計量？

- A. 訓練資料的平均數，利用所有數值的總和計算
- B. 訓練資料的最大值，保留觀察到的最高數值
- C. 訓練資料的全距，以最大值減最小值計算
- D. 訓練資料的中位數，以排序後的中央位置代表

**Unique-answer rationale / explanation:** 中位數較不易受少數極端值影響，適合作為此條件下的簡單插補基準。平均數容易受極端高值拉動；最大值及全距不是典型中央值。此選擇仍須經驗證，並非所有缺值的最佳解。

### Q186 — 缺失值處理

Protected mapping: 初級 / L11 / L11202 / medium; answer index 0 (A).
Length ratio: 2.2895 → 0.9344; lengths: 29/15/9/14 → 19/20/21/20.

**Before:** 資料清理遇到 missing values 時，哪種策略最能避免「一刀切」造成資訊損失？

- A. 先理解缺失原因與欄位意義，再依情況刪除、插補或建立缺失指標
- B. 直接用測試集平均值填補訓練資料
- C. 所有缺失值一律補 0
- D. 所有含缺失值的資料列一律刪除

**After:** 訓練資料某欄位的已知值為 10、20、30，驗證資料的已知值為 100。若以訓練集平均數插補，驗證資料的缺值應補多少？

- A. 補 20，沿用訓練集已知值所算出的平均數
- B. 補 40，使用訓練與驗證全部已知值的平均數
- C. 補 100，使用驗證集本身已知值所算的平均數
- D. 補 30，使用訓練集最後一筆已知值作為補值

**Unique-answer rationale / explanation:** 訓練集已知值平均為（10＋20＋30）/3＝20，應將這個已估計的參數套用到驗證集。合併後平均為 40，使用它或驗證集的 100 都會使用評估資料估參數；30 則不是訓練平均。

### Q187 — 缺失值處理

Protected mapping: 初級 / L11 / L11202 / medium; answer index 2 (C).
Length ratio: 2.2895 → 1.0455; lengths: 14/9/29/15 → 23/21/23/22.

**Before:** 某欄位缺值比例很高，但具有重要業務意義。下列處理方式哪個最恰當？

- A. 所有含缺失值的資料列一律刪除
- B. 所有缺失值一律補 0
- C. 先理解缺失原因與欄位意義，再依情況刪除、插補或建立缺失指標
- D. 直接用測試集平均值填補訓練資料

**After:** 客戶表的「公司名稱」在個人客戶列為空白，查證後確認這表示不適用，並非漏填。較合理的處理方式是？

- A. 以最常見公司名稱插補，讓所有客戶都對應一家公司
- B. 將空白列移出客戶表，讓公司名稱欄位沒有缺值
- C. 標示為不適用並保留客戶型態，與真正漏填情況區分
- D. 以相鄰資料列的公司名稱插補，維持原始資料排列

**Unique-answer rationale / explanation:** 這是結構性的「不適用」，應保留其語意，並與未知或漏填區別。填入其他公司名稱會創造不實資訊；刪除個人客戶則會改變資料涵蓋的客群。

### Q188 — 缺失值處理

Protected mapping: 初級 / L11 / L11202 / medium; answer index 1 (B).
Length ratio: 2.2895 → 0.8873; lengths: 9/29/14/15 → 24/21/24/23.

**Before:** 在建立模型前發現多個欄位缺值型態不同，資料科學家應如何處理？

- A. 所有缺失值一律補 0
- B. 先理解缺失原因與欄位意義，再依情況刪除、插補或建立缺失指標
- C. 所有含缺失值的資料列一律刪除
- D. 直接用測試集平均值填補訓練資料

**After:** 客戶收入欄位的缺值多集中於某職業類型。若直接刪除所有缺收入的資料列，最需要檢查哪項影響？

- A. 剩餘資料的檔案大小是否降低，作為資料更可靠的依據
- B. 該職業類型是否被過度排除，改變樣本的代表性
- C. 欄位名稱是否維持一致，作為不同客群仍可比較的依據
- D. 剩餘資料是否已沒有空值，作為原有偏誤消失的依據

**Unique-answer rationale / explanation:** 當缺失集中於特定群體，刪列可能使該群體被過度排除，導致代表性改變。檔案變小、欄名相同或沒有空值，都不能證明資料仍具代表性或偏誤已消失。

### Q189 — 缺失值處理

Protected mapping: 初級 / L11 / L11202 / medium; answer index 1 (B).
Length ratio: 2.2895 → 0.9324; lengths: 9/29/15/14 → 24/23/25/25.

**Before:** 若缺值本身可能帶有訊息，下列哪一項作法較合理？

- A. 所有缺失值一律補 0
- B. 先理解缺失原因與欄位意義，再依情況刪除、插補或建立缺失指標
- C. 直接用測試集平均值填補訓練資料
- D. 所有含缺失值的資料列一律刪除

**After:** 某欄位的缺失狀態在預測當下即可得，可能帶有訊息。團隊要插補數值，同時讓模型區分「原值」與「補值」，應採哪種方式？

- A. 插補後將整欄標準化，以縮放結果表示哪些值原本缺失
- B. 插補時另加缺失旗標，以二元欄位保留原本缺失狀態
- C. 插補後重新排列資料列，以列的位置表示哪些值原本缺失
- D. 插補時統一增加小數位，以數值精度表示哪些值原本缺失

**Unique-answer rationale / explanation:** 另加缺失旗標可明確保留原始缺失狀態，再由驗證結果判斷是否有用。標準化、排序或統一增加小數位都不能可靠區分原值與補值；也應確認旗標在實際預測時可取得。
