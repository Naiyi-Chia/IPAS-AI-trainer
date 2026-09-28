# Issue #54 — Batch 3F question cue remediation

Engineering evidence, 2026-09-28. Independent Technical Review remains pending; this is not Product Verify.

## Baseline and scope

- Contract: [Issue #54](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/54).
- Branch: `codex/issue-54-batch3f`.
- Baseline: `c488cb34d4af9f39fec90d04884f9b4f29b2dafc`, the fetched `question/issue-14-remediation` head when implementation began, identical to the pre-created scoped branch. Batch 3E was already integrated.
- Exactly 24 self-authored items: Q298–Q321. Only `question`, `options`, and `explanation` changed.
- Preserved all IDs/order, level, subject/topic, concept, difficulty, answer index, sourceType and other question fields, non-question DB metadata, and the entire HTML/CSS/JS shell outside the DB.
- Official content, source links, UI, localStorage and application logic are unchanged. No new dependencies. Audit script only adds `batch3f`; all nine existing batch definitions remain unchanged.

## Reproducible audit

```powershell
python scripts/audit_question_cues.py --batch batch3f --baseline c488cb34d4af9f39fec90d04884f9b4f29b2dafc --csv docs/QUESTION_CUE_BIAS_BATCH3F.csv
node scripts/test_past_answer_feedback.cjs
python scripts/serve_question_batch1a.py --batch batch3f
git diff --check
```

The [CSV](QUESTION_CUE_BIAS_BATCH3F.csv) includes 966 data rows: all 483 items before and after, with option lengths, ratio, unique-longest flag, repeated IDs and flag reasons. Length counts Unicode code points excluding whitespace. Ratio compares the correct option with mean distractor length. Repeated option sets ignore option order and whitespace.

| Whole-bank metric | Before | After |
|---|---:|---:|
| Questions / unique IDs | 483 / 483 | 483 / 483 |
| Unique longest correct option | 291 | 275 |
| Correct-length ratio ≥ 2 | 107 | 83 |
| Correct-length ratio ≥ 3 | 0 | 0 |
| Repeated option-set groups | 64 | 60 |
| Questions in repeated sets | 299 | 275 |
| Answer A / B / C / D | 131 / 109 / 122 / 121 | 131 / 109 / 122 / 121 |

Scoped validation PASS: all 24 ratios are below 2 (0.8571–1.2254), and every reviewed option set is unique across the full bank. Eight correct options remain uniquely longest: Q298 (1.0714), Q300 (1.0952), Q302 (1.0909), Q309 (1.0909), Q311 (1.1408), Q315 (1.1642), Q316 (1.0476), Q318 (1.1129). These small differences express the necessary relationship or action rather than a correct-only paragraph against short unrelated distractors. Flags remain visible in the CSV. Heuristics do not replace editorial review; remaining whole-bank flags are outside this issue's scope.

## Editorial review

Engineering Agent reviewed every item for one defensible answer, plausible alternatives, answer/explanation consistency, grammar and completeness cues. All six items in each cluster now have different option sets and different decision points. No protected metadata or contract change was needed.

| Cluster | Distinct checks | Editorial constraints |
|---|---|---|
| Q298–Q303 MLOps lifecycle | artifact lineage, deployment gates, compatible rollback bundle, training-serving preprocessing consistency, experiment reproducibility, retraining candidate validation | Versions must be explicitly linked; reproducibility does not promise bitwise identical output. A fresh model or good training score alone does not authorize promotion. |
| Q304–Q309 Online / batch inference | workload SLA, throughput arithmetic, P95 versus mean latency, asynchronous jobs, idempotent retries, prediction freshness | Throughput inputs and assumptions are explicit. Mean latency cannot establish a P95 target. Repeated execution and stale feature snapshots are distinct operational risks. |
| Q310–Q315 Data / concept drift | observed input shift, conditional target change, delayed labels, seasonal baselines, upstream unit errors, marginal-monitor blind spots | Input shift alone proves neither performance loss nor concept drift. Labels must mature; comparable seasons and stable target definitions matter. Fix data contracts before treating a unit bug as model adaptation. |
| Q316–Q321 A/B / Shadow deployment | mirrored inference, stable randomized assignment, limits of shadow conclusions, side-effect isolation, operational guardrails, per-arm conversion rates | Shadow predictions do not establish causal user response. No returned response does not mean no external side effects. Metric gains do not override failed guardrails; a 1-point observed difference is not completed significance analysis. |

Before/after options and each answer's rationale are recorded below. This is engineering editorial evidence, not an independent Technical Review decision.

## QA evidence

- Scoped audit PASS: exact 24 changed IDs; 483 unique IDs; four distinct options; valid answer indices and subject/topic references; protected fields, other questions, DB metadata and non-DB shell unchanged.
- Baseline comparison confirmed all nine prior audit batch definitions unchanged.
- JavaScript: Node compiled the page's one inline script with `new Function`; PASS. Python: AST parsing of audit and fixture scripts; PASS.
- Official-answer regression: `node scripts/test_past_answer_feedback.cjs` PASS for 16 answer/selection combinations, repeat guard, progress, render escaping, PDF entry, no duplicates/placeholders, navigation/reset and completion scoring.
- Browser: in-app Chromium, existing fixture at `http://127.0.0.1:8766/batch3f`. Desktop viewport 1280×900; mobile viewport 375×812.
- Practice: answered all 24 revised IDs, 12 on desktop and 12 on mobile. Q305 deliberately answered C; other 23 answered correctly. Verified feedback, explanations and self-authored labels after every answer; navigation worked throughout.
- Final wording review made Q318's available per-request measurements explicit. Reopened the fixture and rechecked the revised stem, D scoring, explanation and source label; PASS. Options, key and explanation were unchanged from the full Practice/Mock run.
- Wrong-question view contained only Q305. Weak-area statistics: L21302 11/12 (92%); L21203 and L21202 each 6/6 (100%).
- L21 mock: all 24 scoped questions, first 12 answered on desktop and remaining 12 on mobile. Submitted on mobile: 23 correct, one incorrect, zero unanswered, score 96. Wrong-only review showed Q305 selected C, correct A, and the required 250,000/hour versus actual 300,000/hour explanation.
- Screenshots inspected for desktop Practice feedback (Q305), mobile Practice feedback (Q316), and mobile wrong-only mock review (Q305). Mobile Practice/review: `innerWidth=375`, document `scrollWidth=360`, no page-level horizontal overflow. Existing scrollable tab bar remained usable.
- All seven tabs opened. Official scope links rendered. Official past-paper tab loaded the 115 second-session L11 structured paper with 50 questions, official source label, answer controls and original PDF link.
- Browser warning/error log empty at completion. Viewport override reset. `git diff --check` PASS before commit.

Limits: the existing fixture narrows self-authored content to this batch, replaces storage with memory, auto-accepts confirm dialogs and disables background PDF prewarming. These checks cover actual rendering/scoring for the changed questions, not persistent localStorage, native dialogs, a full 50-question self-authored mock, live PDF extraction, physical mobile devices, Dev Preview or production. Unchanged app/storage/official-content code is also checked by the non-DB-shell assertion. No known implementation blocker remains; independent review is pending.

## Technical references checked

- [Google Cloud MLOps lifecycle](https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning): validation, pipeline automation, metadata and monitoring.
- [Azure Machine Learning endpoints](https://learn.microsoft.com/en-us/azure/machine-learning/concept-endpoints?view=azureml-api-2): online real-time inference and asynchronous batch workloads.
- [IBM model drift](https://www.ibm.com/think/topics/model-drift) and [Google model monitoring](https://docs.cloud.google.com/gemini-enterprise-agent-platform/machine-learning/model-monitoring/overview): changing input/target relationships and distribution monitoring.
- [AWS shadow tests](https://docs.aws.amazon.com/sagemaker/latest/dg/shadow-tests.html) and [model validation](https://docs.aws.amazon.com/sagemaker/latest/dg/model-validation.html): production-request replication, deployment validation and comparison.
- [Microsoft trustworthy experimentation](https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/patterns-of-trustworthy-experimentation-pre-experiment-stage) and [Evolution of ExP](https://www.microsoft.com/en-us/research/wp-content/uploads/2020/07/2017-05-ICSE2017_EvolutionOfExP.pdf): randomized assignment, persistent experimental groups and evaluation guardrails.

These references support self-authored editorial checks. Numeric inputs are hypothetical exercise assumptions. No official iPAS wording, answer or metadata has been changed.

## Item-by-item review

### Q298 — MLOps 生命週期

Protected mapping: 中級 / L21 / L21202 / hard; answer index 3 (D).
Length ratio: 2.6250 → 1.0714; lengths: 15/12/13/35 → 24/23/23/25.

**Before:** 某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，模型每月更新，但團隊常不知道哪個資料版本訓練出目前線上模型。最需要建立？

- A. 上線後不需再記錄資料與模型版本
- B. 只保存最後一個模型檔即可
- C. MLOps 只負責採購 GPU
- D. 版本化資料、程式與模型，建立自動測試／部署、監控與可回滾的生命週期流程

**After:** 模型每月更新，事故調查需要確認目前線上模型究竟由哪份資料及哪版程式產生。哪種紀錄最能直接建立這條追溯鏈？

- A. 保存部署日期與負責人，依時間接近程度推定訓練來源
- B. 保存模型檔名與測試分數，依分數相同與否推定來源
- C. 保存資料筆數與模型大小，依檔案規模推定訓練來源
- D. 把模型版本連到訓練執行紀錄，記錄資料快照與程式版本

**Unique-answer rationale / explanation:** 追溯需要模型、訓練執行、資料快照與程式版本的明確關聯。日期、分數或檔案大小可能相同，無法唯一識別來源；這些輔助資訊不能取代版本關聯。

### Q299 — MLOps 生命週期

Protected mapping: 中級 / L21 / L21202 / hard; answer index 1 (B).
Length ratio: 2.6250 → 1.0161; lengths: 12/35/13/15 → 21/21/21/20.

**Before:** AI 服務要做到 CI/CD、自動測試、模型版本與回滾，這屬於哪個工程方向？

- A. 只保存最後一個模型檔即可
- B. 版本化資料、程式與模型，建立自動測試／部署、監控與可回滾的生命週期流程
- C. MLOps 只負責採購 GPU
- D. 上線後不需再記錄資料與模型版本

**After:** 候選模型訓練成功、容器也能啟動，但尚未驗證重要客群品質與推論介面。自動部署流程此時應採哪種晉級條件？

- A. 以訓練作業成功作為條件，直接晉級至正式服務
- B. 以分群品質及介面測試達標為條件，再晉級部署
- C. 以容器映像建置成功為條件，直接晉級正式服務
- D. 以本次訓練損失低於前版為條件，再晉級部署

**Unique-answer rationale / explanation:** 訓練或建置成功只表示流程的一部分可執行。晉級前仍需驗證代表性資料及重要分群的品質、輸入輸出契約與推論整合；訓練損失不能取代部署驗證。

### Q300 — MLOps 生命週期

Protected mapping: 中級 / L21 / L21202 / hard; answer index 3 (D).
Length ratio: 2.6250 → 1.0952; lengths: 13/15/12/35 → 21/21/21/23.

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，模型上線後發現品質下降，希望快速切回前一版。部署前應具備什麼？

- A. MLOps 只負責採購 GPU
- B. 上線後不需再記錄資料與模型版本
- C. 只保存最後一個模型檔即可
- D. 版本化資料、程式與模型，建立自動測試／部署、監控與可回滾的生命週期流程

**After:** 新版模型同時改了特徵前處理。上線後品質下降，團隊要快速回到已驗證的前版行為，且資料介面仍相容。部署前應準備哪種回滾單位？

- A. 保存前版模型權重，回滾時繼續搭配新版前處理
- B. 保存前版評估分數，回滾時重新調整新版的門檻
- C. 保存前版訓練資料，回滾時重新訓練相似的權重
- D. 保存已驗證的模型與前處理套件，連同相容環境切回

**Unique-answer rationale / explanation:** 模型行為依賴權重、前處理及執行環境；回滾應恢復相容且已驗證的組合，並演練切換。只還原權重可能造成特徵不一致，臨時改門檻或重訓也不等同恢復前版。

### Q301 — MLOps 生命週期

Protected mapping: 中級 / L21 / L21202 / hard; answer index 2 (C).
Length ratio: 2.6250 → 1.0500; lengths: 12/13/35/15 → 20/19/21/21.

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，MLOps 的核心價值下列何者最完整？

- A. 只保存最後一個模型檔即可
- B. MLOps 只負責採購 GPU
- C. 版本化資料、程式與模型，建立自動測試／部署、監控與可回滾的生命週期流程
- D. 上線後不需再記錄資料與模型版本

**After:** 同一筆原始資料在離線訓練與線上推論產生不同標準化特徵。權重版本相同，差異來自兩套前處理實作。哪項 MLOps 改善最直接？

- A. 增加訓練輪次，使模型適應兩套前處理的差異
- B. 增加推論副本，使更多請求可同時完成運算
- C. 共用版本化前處理並加入一致性測試，核對特徵
- D. 增加模型登錄欄位，僅記錄每次推論的回應時間

**Unique-answer rationale / explanation:** 這是訓練與服務前處理不一致的問題。應對齊轉換實作及參數，並用相同輸入驗證特徵一致性；增加訓練、服務容量或只記延遲不會直接修正特徵差異。

### Q302 — MLOps 生命週期

Protected mapping: 中級 / L21 / L21202 / hard; answer index 1 (B).
Length ratio: 2.6250 → 1.0909; lengths: 12/35/15/13 → 22/24/22/22.

**Before:** 某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，多個模型版本同時實驗，若想確保可追溯與可重現，應如何管理？

- A. 只保存最後一個模型檔即可
- B. 版本化資料、程式與模型，建立自動測試／部署、監控與可回滾的生命週期流程
- C. 上線後不需再記錄資料與模型版本
- D. MLOps 只負責採購 GPU

**After:** 團隊希望日後能重跑某次實驗，並說明模型表現差異來自哪些設定。下列哪組紀錄最能支援這項工作？

- A. 實驗名稱、執行日期、訓練耗時與最後的模型分數
- B. 資料與程式版本、參數及環境，並關聯產物與評估結果
- C. 模型檔案大小、訓練設備型號與當次的資源使用率
- D. 專案負責人、部署網址、服務流量與每月營運費用

**Unique-answer rationale / explanation:** 重跑及比較實驗需要可取得的資料版本、程式、訓練參數與環境，並將產物及評估連到該次執行。隨機種子等設定也應記錄；硬體及非確定性運算仍可能造成差異，紀錄完整不保證逐位元相同。

### Q303 — MLOps 生命週期

Protected mapping: 中級 / L21 / L21202 / hard; answer index 1 (B).
Length ratio: 2.6250 → 0.9265; lengths: 13/35/12/15 → 23/21/22/23.

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，資料漂移後觸發再訓練並經驗證再部署，這最符合哪種生命週期概念？

- A. MLOps 只負責採購 GPU
- B. 版本化資料、程式與模型，建立自動測試／部署、監控與可回滾的生命週期流程
- C. 只保存最後一個模型檔即可
- D. 上線後不需再記錄資料與模型版本

**After:** 漂移告警觸發再訓練，產生了新模型，但新版尚未通過品質檢查。哪個流程較符合有驗證關卡的 MLOps 生命週期？

- A. 訓練完成後直接取代線上模型，再等下一次監控告警
- B. 先比較候選模型與部署門檻，通過後再受控發布
- C. 先以原訓練集確認新版準確率，再直接替換正式版
- D. 以訓練使用的資料量較多為依據，將新版設為正式版

**Unique-answer rationale / explanation:** 再訓練產物仍是候選模型，需通過品質、相容性及其他部署門檻，再進入受控發布流程。告警、資料量增加或訓練完成不代表新版較好；只在訓練集評估也不能確認泛化品質。

### Q304 — 線上／批次部署

Protected mapping: 中級 / L21 / L21302 / medium; answer index 0 (A).
Length ratio: 2.5833 → 1.0169; lengths: 31/10/13/13 → 20/20/19/20.

**Before:** 某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，推薦系統每晚計算隔日名單；詐欺攔截則要在刷卡瞬間判斷。兩者適合的部署方式分別是？

- A. 線上推論偏低延遲逐請求服務；批次推論偏大量吞吐且可容忍較高延遲
- B. 批次推論只能用於影像
- C. 兩者差別只有 API 路徑名稱
- D. 線上推論一定比批次更省成本

**After:** 推薦名單每天凌晨計算，隔天使用即可；交易攔截則需在當次請求 200ms 內回覆。兩者的主要推論部署型態應如何選？

- A. 推薦採排程批次，交易攔截採低延遲線上服務
- B. 推薦採低延遲線上服務，交易攔截採每日批次
- C. 兩者皆採每日排程批次，統一等待整批完成
- D. 兩者皆先累積一小時資料，再提交非同步作業

**Unique-answer rationale / explanation:** 隔日名單可容忍等待整批計算，適合批次；當次交易需要低延遲回應，應使用能符合 SLA 的線上推論。部署方式由時效和工作量決定，不是由資料型態決定。

### Q305 — 線上／批次部署

Protected mapping: 中級 / L21 / L21302 / medium; answer index 0 (A).
Length ratio: 2.5833 → 1.1163; lengths: 31/10/13/13 → 16/13/16/14.

**Before:** 百萬筆歷史資料每天夜間一次處理，不要求秒級回應，較適合？

- A. 線上推論偏低延遲逐請求服務；批次推論偏大量吞吐且可容忍較高延遲
- B. 批次推論只能用於影像
- C. 兩者差別只有 API 路徑名稱
- D. 線上推論一定比批次更省成本

**After:** 夜間批次需在 4 小時內處理 100 萬筆資料。假設吞吐率穩定、無啟動或重試開銷，下列哪個實測方案符合期限？

- A. 每小時 30 萬筆，約需 3.33 小時
- B. 每小時 20 萬筆，約需 5 小時
- C. 每小時 24 萬筆，約需 4.17 小時
- D. 每小時 10 萬筆，約需 10 小時

**Unique-answer rationale / explanation:** 至少需要 100 萬／4＝25 萬筆每小時，只有每小時 30 萬筆能在期限內完成。批次 SLA 要看總工作量與完成時間；實務上還需預留啟動、失敗重試和負載波動空間。

### Q306 — 線上／批次部署

Protected mapping: 中級 / L21 / L21302 / medium; answer index 1 (B).
Length ratio: 2.5833 → 1.0500; lengths: 13/31/13/10 → 21/21/18/21.

**Before:** 某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，客服即時回覆要求 P95 latency 小於 800ms，部署重點應是？

- A. 線上推論一定比批次更省成本
- B. 線上推論偏低延遲逐請求服務；批次推論偏大量吞吐且可容忍較高延遲
- C. 兩者差別只有 API 路徑名稱
- D. 批次推論只能用於影像

**After:** 線上客服要求 P95 端到端延遲小於 800ms。某次壓測平均延遲 300ms、P95 為 1,200ms，成功率達標。依這項延遲要求，該如何判定？

- A. 已達標，因平均延遲 300ms 低於 800ms
- B. 未達標，因 P95 延遲 1,200ms 高於上限
- C. 已達標，因成功率達標可抵銷較慢的請求
- D. 資料不足，必須取得每筆延遲才能判定是否達標

**Unique-answer rationale / explanation:** 規格指定的是 P95，而非平均值；即使平均延遲很低，尾端延遲仍可能超標。成功率與延遲是不同要求；題目已提供 P95，可直接與門檻比較，不必等到取得每筆延遲才能判定。

### Q307 — 線上／批次部署

Protected mapping: 中級 / L21 / L21302 / medium; answer index 3 (D).
Length ratio: 2.5833 → 0.9324; lengths: 10/13/13/31 → 24/26/24/23.

**Before:** 某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，下列哪一項正確比較 online inference 與 batch inference？

- A. 批次推論只能用於影像
- B. 兩者差別只有 API 路徑名稱
- C. 線上推論一定比批次更省成本
- D. 線上推論偏低延遲逐請求服務；批次推論偏大量吞吐且可容忍較高延遲

**After:** 文件推論通常需 2 分鐘，使用者可接受 5 分鐘內取回結果，但網站 HTTP 請求逾時為 30 秒。哪種介面設計較符合需求？

- A. 維持同步回應，讓使用者每次逾時後重新送出整份文件
- B. 將 HTTP 成功碼提早回傳，並把尚未完成的結果當作完成
- C. 縮短模型運算至 30 秒時強制停止，直接採用部分結果
- D. 先回傳作業 ID，以佇列執行並提供狀態與結果查詢

**Unique-answer rationale / explanation:** 可容忍分鐘級等待的長作業可採非同步處理，將請求接收與作業完成分開，以 ID 查詢狀態和結果。反覆重送、提早假稱完成或截斷計算，不能提供可靠的完整結果。

### Q308 — 線上／批次部署

Protected mapping: 中級 / L21 / L21302 / medium; answer index 2 (C).
Length ratio: 2.5833 → 0.9167; lengths: 13/13/31/10 → 24/24/22/24.

**Before:** 某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，模型推論服務設計時，何時應優先使用批次而非即時 API？

- A. 線上推論一定比批次更省成本
- B. 兩者差別只有 API 路徑名稱
- C. 線上推論偏低延遲逐請求服務；批次推論偏大量吞吐且可容忍較高延遲
- D. 批次推論只能用於影像

**After:** 夜間批次部分分區失敗，成功分區已寫入結果。系統採至少一次重試，要求每筆資料只保留一份最終預測。哪種寫入設計較合適？

- A. 每次重試均附加全部結果，事後以總列數判斷是否完成
- B. 任一分區失敗就略過整批，沿用前一天結果並標為成功
- C. 以資料及模型版本作唯一鍵，重試時使用冪等寫入
- D. 每次重試都產生新的隨機鍵，讓每次結果保留獨立紀錄

**Unique-answer rationale / explanation:** 重試可能重複處理同一輸入，使用資料識別與模型版本等穩定鍵進行冪等寫入，可避免同一預測重複累積。隨機新鍵或直接附加不會去重；略過失敗資料則無法完成本批需求。

### Q309 — 線上／批次部署

Protected mapping: 中級 / L21 / L21302 / medium; answer index 3 (D).
Length ratio: 2.5833 → 1.0909; lengths: 13/13/10/31 → 22/22/22/24.

**Before:** 某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，當吞吐量優先、單筆延遲不敏感時，常見的推論方式是？

- A. 兩者差別只有 API 路徑名稱
- B. 線上推論一定比批次更省成本
- C. 批次推論只能用於影像
- D. 線上推論偏低延遲逐請求服務；批次推論偏大量吞吐且可容忍較高延遲

**After:** 每晚預先計算的推薦能快速回傳，但新需求要求反映使用者剛完成的操作，不能等到隔天。評估部署調整時應優先確認什麼？

- A. 夜間作業的平均吞吐量，是否高於前一晚的處理量
- B. 預先計算結果的檔案大小，是否小於服務的記憶體
- C. 批次輸出資料的欄位名稱，是否與線上 API 相同
- D. 特徵與預測的更新時效，是否能在所需時間內反映操作

**Unique-answer rationale / explanation:** 查詢已算好的結果很快，不代表結果包含最新資訊。需確認特徵及預測更新時效，再評估線上推論、增量更新或其他方案；吞吐量、檔案大小及欄位名稱本身不能證明時效達標。

### Q310 — Data / Concept Drift

Protected mapping: 中級 / L21 / L21203 / hard; answer index 3 (D).
Length ratio: 2.3478 → 1.2254; lengths: 13/12/21/36 → 29/21/21/29.

**Before:** 某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，疫情後消費行為改變，線上模型輸入分布與訓練時差異很大。這應優先檢查？

- A. 發現漂移後一律立即刪除模型
- B. 漂移只會發生在硬體故障時
- C. 只要上線前 Accuracy 高就不需監控漂移
- D. 監控輸入資料與目標關係的變化；漂移超過門檻時應調查、重評估並視情況再訓練

**After:** 新客戶來源改變後，輸入年齡分布與訓練期不同，但尚未取得新一批真實標籤。僅根據這項觀察，哪個判斷有直接證據？

- A. 已證實 Concept Drift，因年齡與結果的關係必定改變
- B. 已證實模型準確率下降，因輸入分布和以前不同
- C. 已證實標籤品質下降，因新客戶來自不同的管道
- D. 已觀察到 Data Drift，但尚不能判定品質或條件關係變化

**Unique-answer rationale / explanation:** 輸入分布 P(X) 改變支持 Data Drift 的判斷。這不直接證明 P(Y|X) 改變或模型品質下降；仍需取得標籤、評估切片及調查資料品質，不能把漂移指標當成正確率。

### Q311 — Data / Concept Drift

Protected mapping: 中級 / L21 / L21203 / hard; answer index 3 (D).
Length ratio: 2.3478 → 1.1408; lengths: 12/21/13/36 → 24/26/21/27.

**Before:** 詐欺手法改變後，同樣交易特徵與「是否詐欺」的關係改變。這更接近什麼？

- A. 漂移只會發生在硬體故障時
- B. 只要上線前 Accuracy 高就不需監控漂移
- C. 發現漂移後一律立即刪除模型
- D. 監控輸入資料與目標關係的變化；漂移超過門檻時應調查、重評估並視情況再訓練

**After:** 在標籤定義與蒐集方式不變的前提下，可靠追蹤資料顯示：相同交易特徵下，詐欺機率由 5% 變為 30%，而特徵分布保持相近。這最直接支持哪種變化？

- A. Data Drift：輸入特徵的邊際分布已明顯改變
- B. Schema Drift：輸入欄位的資料型別已明顯改變
- C. 服務效能退化：推論請求的回應時間已明顯增加
- D. Concept Drift：給定特徵時目標的條件分布改變

**Unique-answer rationale / explanation:** 題目描述相同 X 對應的 Y 機率改變，即 P(Y|X) 改變，符合 Concept Drift。特徵邊際分布可以維持相近；資料型別與延遲則沒有題目提供的變化證據。

### Q312 — Data / Concept Drift

Protected mapping: 中級 / L21 / L21203 / hard; answer index 1 (B).
Length ratio: 2.3478 → 0.9429; lengths: 12/36/21/13 → 23/22/24/23.

**Before:** 某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，模型上線半年後 Accuracy 下降，但程式未變。監控應先檢查哪些資料現象？

- A. 漂移只會發生在硬體故障時
- B. 監控輸入資料與目標關係的變化；漂移超過門檻時應調查、重評估並視情況再訓練
- C. 只要上線前 Accuracy 高就不需監控漂移
- D. 發現漂移後一律立即刪除模型

**After:** 模型每筆預測的真實結果要 30 天後才能確認。團隊已能監控輸入與預測分布，若要檢查 Concept Drift 及實際品質，還應建立什麼？

- A. 把當天模型預測當作標準答案，立即計算每日準確率
- B. 待標籤成熟後回連原始預測，依時間窗與客群評估
- C. 以當天輸入漂移分數代替準確率，使用相同百分比報表
- D. 只比較每日預測的平均信心，視為真實結果的替代值

**Unique-answer rationale / explanation:** 有延遲的真實標籤應回連當時輸入與預測，依成熟的時間窗評估品質及關係變化，避免未成熟標籤偏差。預測、自信程度或輸入漂移指標都不是可靠的真實答案替代品。

### Q313 — Data / Concept Drift

Protected mapping: 中級 / L21 / L21203 / hard; answer index 0 (A).
Length ratio: 2.3478 → 1.0154; lengths: 36/13/21/12 → 22/21/22/22.

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，下列哪一項最符合 drift management 的做法？

- A. 監控輸入資料與目標關係的變化；漂移超過門檻時應調查、重評估並視情況再訓練
- B. 發現漂移後一律立即刪除模型
- C. 只要上線前 Accuracy 高就不需監控漂移
- D. 漂移只會發生在硬體故障時

**After:** 零售模型每到週末都出現輸入分布告警；目前監控將週末資料與平日基準比較。模型品質尚未確認，下一步較合理的是？

- A. 檢查週期性與可比較基準，再用成熟標籤評估影響
- B. 將所有週末告警直接關閉，視為已排除品質風險
- C. 每次告警即以當天資料重訓，省略基準與品質比較
- D. 把週末輸入分布複製成平日比例，直接送入原模型

**Unique-answer rationale / explanation:** 告警可能反映正常週期，也可能伴隨真正品質變化，應採可比較的季節／週期基準並評估結果。僅關閉告警或自動重訓沒有確認原因；強行改比例也可能扭曲實際輸入。

### Q314 — Data / Concept Drift

Protected mapping: 中級 / L21 / L21203 / hard; answer index 1 (B).
Length ratio: 2.3478 → 1.0455; lengths: 21/36/12/13 → 21/23/22/23.

**Before:** 某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，若 PSI、特徵分布與錯誤率持續異常，模型團隊應如何處理？

- A. 只要上線前 Accuracy 高就不需監控漂移
- B. 監控輸入資料與目標關係的變化；漂移超過門檻時應調查、重評估並視情況再訓練
- C. 漂移只會發生在硬體故障時
- D. 發現漂移後一律立即刪除模型

**After:** 感測器欄位仍叫 temperature，但上游更新後由攝氏改成華氏，模型輸入分布與錯誤率同時異常。已確認模型訓練時使用攝氏，應優先怎麼處理？

- A. 直接用華氏資料重訓模型，不再核對原資料契約
- B. 修正單位轉換與資料契約，再重評品質及是否需重訓
- C. 提高漂移告警門檻，讓新溫度範圍回到可接受區間
- D. 只把模型輸出重新縮放，讓預測平均值回到原先水準

**Unique-answer rationale / explanation:** 已知根因是資料管線違反單位契約，應先修正轉換並驗證輸入及品質。不能把所有分布異常都當成必須重訓的自然概念變化；調整告警或輸出均未修正根因。

### Q315 — Data / Concept Drift

Protected mapping: 中級 / L21 / L21203 / hard; answer index 1 (B).
Length ratio: 2.3478 → 1.1642; lengths: 12/36/21/13 → 22/26/22/23.

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，Data Drift 與 Concept Drift 的差異何者較正確？

- A. 漂移只會發生在硬體故障時
- B. 監控輸入資料與目標關係的變化；漂移超過門檻時應調查、重評估並視情況再訓練
- C. 只要上線前 Accuracy 高就不需監控漂移
- D. 發現漂移後一律立即刪除模型

**After:** 各輸入特徵的單變量分布檢查皆未告警，但成熟標籤顯示模型錯誤率升高。哪項解讀較正確？

- A. 輸入檢查未告警，已足以排除輸入與目標關係改變
- B. 單變量檢查未涵蓋所有變化，仍須檢查聯合分布與目標關係
- C. 錯誤率升高，已足以證明所有特徵的邊際分布改變
- D. 模型程式未修改，已足以把異常歸因於標籤蒐集故障

**Unique-answer rationale / explanation:** 各特徵邊際分布相近，不表示特徵間聯合關係或 P(Y|X) 相同。應進一步檢查資料品質、聯合分布及目標關係；不能由沒有輸入告警排除 Concept Drift，也不能僅憑錯誤率指定根因。

### Q316 — A/B 與 Shadow Deployment

Protected mapping: 中級 / L21 / L21302 / hard; answer index 0 (A).
Length ratio: 2.2241 → 1.0476; lengths: 43/18/10/30 → 22/21/21/21.

**Before:** 某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，新風控模型想先接真實流量觀察 latency 與預測，但不能影響實際核准結果，應採用？

- A. Shadow 可讓新模型接收真實流量但不影響決策；A/B 則讓部分使用者實際接受新版本結果
- B. A/B test 不會影響任何真實使用者
- C. 兩者都只能用離線資料
- D. Shadow deployment 會立刻把全部使用者切到新模型

**After:** 新模型需接收當下的真實請求以量測延遲及預測差異，但對外回應仍須完全由舊模型決定。哪種流量安排符合要求？

- A. 複製請求給新版作影子推論，對外仍採用舊版結果
- B. 將 10% 請求交給新版回應，其餘請求採用舊版
- C. 將新舊結果加權平均，對所有請求回傳混合結果
- D. 每天更換對外使用的版本，交替比較兩版的表現

**Unique-answer rationale / explanation:** Shadow 複製線上請求給候選模型，但不讓其結果成為對外決策。少量真實回應、混合結果或交替上線都會改變部分使用者結果，不符合這裡的限制。

### Q317 — A/B 與 Shadow Deployment

Protected mapping: 中級 / L21 / L21302 / hard; answer index 1 (B).
Length ratio: 2.2241 → 0.9844; lengths: 30/43/10/18 → 21/21/22/21.

**Before:** 產品希望 10% 使用者看到新版推薦、90% 使用舊版，並比較轉換率，這是？

- A. Shadow deployment 會立刻把全部使用者切到新模型
- B. Shadow 可讓新模型接收真實流量但不影響決策；A/B 則讓部分使用者實際接受新版本結果
- C. 兩者都只能用離線資料
- D. A/B test 不會影響任何真實使用者

**After:** 推薦 A/B 實驗要讓 10% 使用者看到新版、90% 看到舊版，比較轉換率；同一使用者反覆造訪不應換組。哪種分派方式較合適？

- A. 由使用者自行選新舊版，再直接比較兩組轉換率
- B. 以使用者為單位隨機且固定分組，同期觀察結果
- C. 每次請求重新抽籤分組，使同一人可交替看到兩版
- D. 白天全部使用新版、晚上使用舊版，再比較結果

**Unique-answer rationale / explanation:** 以使用者為單位的穩定隨機分派可避免反覆造訪時換組，並減少自選或時段差異的混淆。仍需檢查分派與樣本品質，以及適當的不確定性分析，不能僅憑隨機化就忽略實驗設計。

### Q318 — A/B 與 Shadow Deployment

Protected mapping: 中級 / L21 / L21302 / hard; answer index 3 (D).
Length ratio: 2.2241 → 1.1129; lengths: 30/18/10/43 → 20/21/21/23.

**Before:** 某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，比較 A/B 與 Shadow deployment，下列哪一項正確？

- A. Shadow deployment 會立刻把全部使用者切到新模型
- B. A/B test 不會影響任何真實使用者
- C. 兩者都只能用離線資料
- D. Shadow 可讓新模型接收真實流量但不影響決策；A/B 則讓部分使用者實際接受新版本結果

**After:** Shadow 測試記錄了新版每筆鏡像請求的延遲、錯誤與新舊推薦結果；使用者實際只看舊版。這些紀錄仍不能直接回答哪個問題？

- A. 新版處理鏡像請求時，量測到的延遲分布為何
- B. 新舊模型收到同一請求時，推薦清單的差異為何
- C. 新版處理鏡像請求時，出現推論錯誤的比例為何
- D. 使用者看到新版推薦後，轉換率相對舊版會增加多少

**Unique-answer rationale / explanation:** 使用者未接觸新版推薦，因此 Shadow 不能直接觀察其行為反應或估計實際轉換提升。它可以量測鏡像路徑的延遲、錯誤與輸出差異；業務影響仍需適當的線上實驗等證據。

### Q319 — A/B 與 Shadow Deployment

Protected mapping: 中級 / L21 / L21302 / hard; answer index 0 (A).
Length ratio: 2.2241 → 1.0141; lengths: 43/10/30/18 → 24/24/21/26.

**Before:** 某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，高風險模型上線前想先驗證 production traffic 下的穩定性但不改使用者決策，適合？

- A. Shadow 可讓新模型接收真實流量但不影響決策；A/B 則讓部分使用者實際接受新版本結果
- B. 兩者都只能用離線資料
- C. Shadow deployment 會立刻把全部使用者切到新模型
- D. A/B test 不會影響任何真實使用者

**After:** 候選模型在 Shadow 模式不回傳答案給使用者，但推論流程原本會寫入客戶狀態並發送通知。要維持不影響正式業務，應怎麼安排？

- A. 隔離或停用影子路徑的業務寫入與通知，另存測試紀錄
- B. 只隱藏新版的 HTTP 回應，保留原有業務寫入與通知
- C. 只降低鏡像流量比例，保留原有業務寫入與通知
- D. 只把模型名稱加上 shadow，沿用相同帳號與寫入流程

**Unique-answer rationale / explanation:** 不對外回傳預測不代表沒有副作用。Shadow 路徑仍需隔離業務寫入、通知等外部行為，並考量資源競爭；只隱藏回應或改名稱不足以保護正式流程。

### Q320 — A/B 與 Shadow Deployment

Protected mapping: 中級 / L21 / L21302 / hard; answer index 0 (A).
Length ratio: 2.2241 → 1.0299; lengths: 43/18/10/30 → 23/21/23/23.

**Before:** 某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，若要直接量測新模型對使用者行為的因果影響，通常比 Shadow 更適合的是？

- A. Shadow 可讓新模型接收真實流量但不影響決策；A/B 則讓部分使用者實際接受新版本結果
- B. A/B test 不會影響任何真實使用者
- C. 兩者都只能用離線資料
- D. Shadow deployment 會立刻把全部使用者切到新模型

**After:** A/B 事前規則訂為：新版若逾時率超過 2% 就停止擴量並調查。觀察期內新版轉換率較高，但逾時率達 4%。依已定規則應怎麼做？

- A. 停止擴量並依預案控制流量，調查逾時原因後再評估
- B. 因轉換率較高而繼續擴量，將逾時列為下期改善
- C. 在看到結果後將逾時門檻改為 5%，讓新版繼續擴量
- D. 刪除逾時請求後重算指標，以成功請求決定是否擴量

**Unique-answer rationale / explanation:** 逾時率已違反事前護欄，不能用單一業務指標的改善抵銷。應依預案停止擴量、控制影響並調查；事後改門檻或排除失敗請求會扭曲原先決策標準。

### Q321 — A/B 與 Shadow Deployment

Protected mapping: 中級 / L21 / L21302 / hard; answer index 0 (A).
Length ratio: 2.2241 → 0.8571; lengths: 43/18/30/10 → 18/18/24/21.

**Before:** 模型部署策略中，哪一種模式會「收真實流量但結果不對外生效」？

- A. Shadow 可讓新模型接收真實流量但不影響決策；A/B 則讓部分使用者實際接受新版本結果
- B. A/B test 不會影響任何真實使用者
- C. Shadow deployment 會立刻把全部使用者切到新模型
- D. 兩者都只能用離線資料

**After:** 同期隨機 A/B 實驗中，新版有 10,000 位使用者、900 位轉換；舊版有 90,000 位、7,200 位轉換，每人只計一次。先做描述統計，哪項正確？

- A. 新版 9%、舊版 8%，新版高 1 個百分點
- B. 新版 8%、舊版 9%，新版低 1 個百分點
- C. 新版 0.9%、舊版 7.2%，新版低 6.3 個百分點
- D. 新版 90%、舊版 80%，新版高 10 個百分點

**Unique-answer rationale / explanation:** 各組轉換率應使用各自人數作分母：900／10,000＝9%，7,200／90,000＝8%，差為 1 個百分點。不能用總流量或轉換件數直接比較；描述差異不等於完成因果、不確定性與護欄檢查。
