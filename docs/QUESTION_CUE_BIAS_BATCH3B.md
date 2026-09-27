# Issue #50 — Batch 3B cue-bias remediation

## Contract and baseline

- Issue: https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/50; Parent #14.
- Branch: `codex/issue-50-batch3b` (pre-created by the Human).
- Baseline: latest `question/issue-14-remediation` at implementation start, `65c0a99ca39c49c8ed54b6d823afe01bd184bfbc`; the designated branch had the identical head. Batch 3A was already integrated via #87. Working tree was clean before edits.
- Scope: Q064–Q075, Q088–Q093, Q097–Q099, Q103–Q105 (24 questions).
- Only question/options/explanation change. All protected metadata, answer indices, source labels, other questions, DB metadata and HTML/CSS/JS outside DB are preserved. No official question content, localStorage behavior, UI or dependency changes.
- Support changes: add `batch3b` to the existing audit registry; record this review and full-bank before/after CSV.
- This is Engineering evidence; independent Technical Review is pending. No PR, integration, release or Product Verify is asserted here.

## Reproduction

```powershell
python scripts/audit_question_cues.py --batch batch3b --baseline 65c0a99ca39c49c8ed54b6d823afe01bd184bfbc --csv docs/QUESTION_CUE_BIAS_BATCH3B.csv
node scripts/test_past_answer_feedback.cjs
python scripts/serve_question_batch1a.py --batch batch3b
```

Open `http://127.0.0.1:8766/batch3b`. The unchanged fixture uses the real app with only these 24 questions in memory, substitutes memory storage, auto-accepts exam confirmation and disables PDF prewarming. Practice order and Mock sampling remain randomized. It verifies content/rendering/scoring, not persistent storage, native confirmation dialogs or full-bank 50-question sampling.

The CSV contains 483 before + 483 after rows. Lengths count Unicode code points excluding whitespace; duplicate option sets ignore whitespace and ordering. Audit assertions check exact changed IDs, all protected fields, unique IDs/order, mappings, unchanged application shell, ratios and option-set uniqueness.

## Whole-bank metrics

| Metric | Before | After |
| --- | ---: | ---: |
| total | 483 | 483 |
| unique_ids | 483 | 483 |
| unique_longest | 372 | 350 |
| ratio_ge_2 | 200 | 176 |
| ratio_ge_3 | 0 | 0 |
| repeated_groups | 85 | 77 |
| repeated_questions | 392 | 368 |

Answer A/B/C/D totals remain 131/109/122/121. All modified ratios are below 2.0, ranging from 0.9041 to 1.0615. Eight repeated clusters become 24 option sets unique across the bank. Q069 and Q088 remain uniquely longest by small margins (1.0615 and 1.0455). Metrics are review aids, not empirical proof of item difficulty or the absence of every possible cue.

## Cluster review

| IDs | Distinct decisions tested within cluster |
| --- | --- |
| Q064–Q066 | Pilot planning; evidence-based stage funding; handling a failed milestone |
| Q067–Q069 | Subgroup harm; drift with delayed labels; changed use without human review |
| Q070–Q072 | Inspectable decision paths; validation-based selection; fair preprocessing |
| Q073–Q075 | Independently scalable serving; compatible rollback; API migration |
| Q088–Q090 | Raw multimodal retention; consistent warehouse reporting; catalog/lineage |
| Q091–Q093 | Seconds-level alerts; bounded daily batch; event-time and late events |
| Q097–Q099 | Customer segmentation task; arbitrary cluster IDs; K-means objective |
| Q103–Q105 | Coverage gaps; inconsistent labels; unseen-customer evaluation split |

Distractors now represent competing methods, metrics or operational decisions. Each item has a specific decision criterion, so the correct option need not be an all-inclusive checklist. The unchanged answer-position runs are required by the contract; content is no longer a verbatim rotated option set.

## Verification — 2026-09-27

- Scoped audit PASS: exactly 24 changed; 483 unique IDs; metadata, source labels, answer positions and entire app shell unchanged.
- JS syntax PASS: extracted inline application script compiled using Node `new Function` (one script).
- Existing `test_past_answer_feedback.cjs` PASS: 16 answer/selection combinations, repeated-answer guard, progress, render escaping, PDF entry, navigation/reset and completion score.
- Browser: Codex in-app browser, desktop 1280×900 and mobile 375×812.
- Practice: all 24 revised items rendered, answered and navigated. Questions 1–12 tested on desktop; 13–24 on mobile. 23 correct; Q103 deliberately incorrect. Feedback, explanation and self-authored source label observed after each answer.
- Practice order: Q073, Q091, Q064, Q071, Q104, Q090, Q092, Q093, Q075, Q072, Q089, Q074 / Q067, Q066, Q068, Q097, Q088, Q099, Q103, Q070, Q105, Q065, Q069, Q098.
- Wrong-question book: exactly Q103. Weak-area view: L22401 = 2/3 (67%); the other seven reviewed topics = 3/3 (100%).
- Mobile L21 Mock: all 12 revised L21 items answered; submit produced 100 points / 12 correct / 0 incorrect / 0 unanswered. Entered 12-item review and expanded Q067; answer, explanation and source label correct.
- Desktop L22 Mock: all 12 revised L22 items answered, with Q103 deliberately incorrect; submit produced 92 points / 11 correct / 1 incorrect / 0 unanswered. Wrong-only review contained Q103, selected A / correct D and the matching explanation.
- Desktop Practice and mobile Practice/review screenshots inspected: option text wraps and remains within the cards; navigation and review expansion usable. At 375px, document scrollWidth = 360px in Practice and Mock review, so no horizontal page overflow. The existing mobile tab strip scrolls independently.
- All seven tabs opened: Home, Practice, Mock, Past papers, Wrong questions, Weak areas, Official scope. Official scope links rendered; 115 second-session L11 official-paper flow loaded 50 structured questions and displayed original PDF link and answer controls.
- Browser console warnings/errors: none at completion. Initial navigation occurred before the local server was started and returned connection refused; after starting the server, all above checks completed successfully.
- Final diff reviewed structurally (question DB is one line); `git diff --check` PASS.
- Limitations: fixture isolation described above; no full-bank native-dialog test or real-device run. These content-only changes do not alter the corresponding application code. No implementation blocker identified.

## Technical references

These primary references were checked for the concepts below. Scenarios and distractors are original self-authored practice content, not official exam questions.

- [AWS PoC to preproduction](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-lifecycle-operational-excellence/dev-advancing.html): predefined success criteria, evidence-based continuation decisions and limited pilot users (Q064–Q066).
- [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/): ongoing risk measurement, context changes and post-deployment controls (Q067–Q069).
- [scikit-learn common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html): train-only preprocessing and leakage prevention (Q072).
- [scikit-learn cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html): validation/test separation and disjoint groups (Q071, Q105).
- [Microsoft API design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design): decoupled clients/services and version compatibility (Q073, Q075).
- [AWS lake/warehouse comparison](https://aws.amazon.com/compare/the-difference-between-a-data-warehouse-data-lake-and-data-mart/): original diverse data versus prepared analytical data (Q088–Q089).
- [Apache Beam model](https://beam.apache.org/documentation/basics/): bounded/unbounded collections, event-time windows and late data (Q091–Q093).
- [scikit-learn clustering](https://scikit-learn.org/stable/modules/clustering.html): unlabeled grouping, cluster identifiers and within-cluster sum of squares (Q097–Q099).

## Item-by-item editorial review

Engineering Agent editorial review: each item checked for one defensible key, plausible same-level alternatives, grammar/length cues, and explanation consistency. Independent Technical Review remains pending.

### Q064 — AI 專案規劃

Protected mapping: 中級 / L21 / L21202 / medium; answer index 2 (C).
Length ratio: 2.2857 → 0.9851; lengths: 11/14/32/17 → 22/23/22/22.

**Before:** AI 專案從 PoC 進入正式導入時，哪種規劃方式較合理？

- A. 成功標準等上線後再決定
- B. 一次性全面上線且不設回滾方案
- C. 定義基準線、PoC、Pilot、驗收 KPI、部署、監控與迭代機制
- D. 只排模型訓練，不規劃資料與系統整合

**After:** AI 專案的 PoC 已達技術門檻，但尚未驗證實際人員與系統協作。進入全面部署前，哪項安排最適合納入計畫？

- A. 擴充離線測試資料，以模型分數作為全面部署依據
- B. 完成使用操作手冊，以教育訓練出席率作為上線依據
- C. 安排有限場域試行，以流程成效決定是否擴大部署
- D. 增加展示情境數量，以主管對展示的評價決定上線

**Unique-answer rationale / explanation:** PoC 通過代表核心技術假設獲得支持；有限場域試行可進一步驗證人員、系統與實際流程的協作。離線分數、訓練出席率或展示評價不能取代這項驗證。

### Q065 — AI 專案規劃

Protected mapping: 中級 / L21 / L21202 / medium; answer index 3 (D).
Length ratio: 2.2857 → 1.0563; lengths: 14/11/17/32 → 23/23/25/25.

**Before:** 為降低 AI 專案導入風險，里程碑設計應包含？

- A. 一次性全面上線且不設回滾方案
- B. 成功標準等上線後再決定
- C. 只排模型訓練，不規劃資料與系統整合
- D. 定義基準線、PoC、Pilot、驗收 KPI、部署、監控與迭代機制

**After:** AI 專案採分階段撥款。若要讓下一階段的投入取決於可驗證成果，里程碑應如何設計？

- A. 依預定日期檢查工期，日期到達即撥付下一階段款項
- B. 依累積支出檢查預算，支出達標即撥付下一階段款項
- C. 依完成任務檢查進度，項目勾選完畢即撥付下一階段款項
- D. 依事前門檻檢查成效，驗證結果通過再撥付下一階段款項

**Unique-answer rationale / explanation:** 階段門檻應事先定義可驗證的成效與驗收證據，再依結果決定是否繼續投入。日期、支出與任務完成量可追蹤進度，但不足以證明方案已達成效。

### Q066 — AI 專案規劃

Protected mapping: 中級 / L21 / L21202 / medium; answer index 2 (C).
Length ratio: 2.2857 → 1.0000; lengths: 14/11/32/17 → 22/22/22/22.

**Before:** 某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，AI 導入計畫中，何者最適合作為階段性治理方式？

- A. 一次性全面上線且不設回滾方案
- B. 成功標準等上線後再決定
- C. 定義基準線、PoC、Pilot、驗收 KPI、部署、監控與迭代機制
- D. 只排模型訓練，不規劃資料與系統整合

**After:** 製造業 AI 試行發現漏檢率未達事前門檻，改善還需要額外標註資料。階段審查最適合如何處理？

- A. 以整體準確率替代漏檢率，沿用原定擴大部署時程
- B. 以模型開發完成為依據，將資料補足工作轉交維運
- C. 評估補資料的成本與時程，再決定修正試行或停止
- D. 以已投入成本作為依據，維持原定擴大部署的決策

**Unique-answer rationale / explanation:** 未達事前門檻應觸發階段審查，評估改善的可行性、成本與時程後決定修正或停止。替換指標、交接工作或援引沉沒成本，都不能證明擴大部署已具備條件。

### Q067 — AI 風險管理

Protected mapping: 中級 / L21 / L21203 / hard; answer index 2 (C).
Length ratio: 2.6129 → 0.9851; lengths: 10/7/27/14 → 22/22/22/23.

**Before:** 高風險 AI 模型可能受到資料漂移、偏誤與攻擊，最適當的風險管理是？

- A. 取消日誌避免留下紀錄
- B. 上線後不再評估
- C. 建立風險登錄、控制措施、監控指標、事件處理與定期再評估
- D. 只在模型失效後才開始討論風險

**After:** AI 審核系統整體錯誤率穩定，但某使用者群體的誤拒率持續升高，且申訴處理量有限。哪種風險處置較合理？

- A. 沿用整體錯誤率門檻，待全體指標超標後啟動處置
- B. 將該群體排除於評估，維持與上線前相同的平均值
- C. 調查群體差異的原因，依影響安排覆核與追蹤改善
- D. 先提高全體核准比例，以總通過率回升判定風險下降

**Unique-answer rationale / explanation:** 整體指標可能掩蓋特定群體受損，應調查資料與決策差異，依影響程度安排覆核並追蹤改善。排除群體、等待全體超標或調整總核准比例，都無法證明群體風險已受控。

### Q068 — AI 風險管理

Protected mapping: 中級 / L21 / L21203 / hard; answer index 3 (D).
Length ratio: 2.6129 → 1.0141; lengths: 14/7/10/27 → 24/24/23/24.

**Before:** AI 系統上線後要持續降低風險，應採取？

- A. 只在模型失效後才開始討論風險
- B. 上線後不再評估
- C. 取消日誌避免留下紀錄
- D. 建立風險登錄、控制措施、監控指標、事件處理與定期再評估

**After:** 已上線模型的輸入分布明顯改變，但真實結果標籤需數週才取得。團隊應如何管理這段期間的不確定風險？

- A. 將漂移直接視為失效證據，立即用未核對的新標籤重訓
- B. 以服務可用率作為替代指標，暫停追蹤模型的品質變化
- C. 待結果標籤全部到齊後，再開始分析漂移的影響範圍
- D. 調查漂移並加強抽查覆核，標籤到齊後再驗證實際影響

**Unique-answer rationale / explanation:** 分布漂移是風險訊號，尚不能單獨證明品質下降。可先調查影響範圍並採取抽查覆核等控制，再用延後取得的標籤驗證。未核對標籤重訓、可用率替代品質或完全延後調查均不合適。

### Q069 — AI 風險管理

Protected mapping: 中級 / L21 / L21203 / hard; answer index 3 (D).
Length ratio: 2.6129 → 1.0615; lengths: 10/14/7/27 → 21/22/22/23.

**Before:** 某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，下列何者最符合 AI 風險的生命週期管理？

- A. 取消日誌避免留下紀錄
- B. 只在模型失效後才開始討論風險
- C. 上線後不再評估
- D. 建立風險登錄、控制措施、監控指標、事件處理與定期再評估

**After:** 客服 AI 的輸出將由「僅供人員參考」改為「直接送給客戶」。模型版本不變，應如何處理這次用途變更？

- A. 沿用舊版的風險核准，將此次變更列為介面調整
- B. 以歷史平均滿意度推估，達標即視為新用途可接受
- C. 以供應商的通用評估替代，將風險判定交由供應商
- D. 重估移除人工覆核的影響，更新控制措施與上線門檻

**Unique-answer rationale / explanation:** 風險取決於模型及其使用情境。移除人工覆核會改變錯誤輸出的暴露與影響，須重新評估並更新控制及門檻；模型版本相同、歷史滿意度與供應商通用評估均不足以涵蓋此變更。

### Q070 — 數據準備與模型選擇

Protected mapping: 中級 / L21 / L21301 / medium; answer index 2 (C).
Length ratio: 2.8182 → 1.0147; lengths: 10/8/31/15 → 22/23/23/23.

**Before:** 表格分類資料量不大、需高可解釋性，模型選擇最合理的原則是？

- A. 永遠選參數最多的模型
- B. 不需檢查資料品質
- C. 依資料型態、資料量、任務、可解釋性、延遲與資源限制選擇適當模型
- D. 只要訓練準確率最高就是最佳模型

**After:** 小量表格資料的分類任務要求決策路徑可直接檢視。若數個模型驗證分數相近，哪個選擇最符合此要求？

- A. 選擇多層神經網路，以訓練損失曲線代替決策路徑
- B. 選擇多模型堆疊組合，以整體驗證分數代替決策路徑
- C. 選擇深度受限決策樹，讓人員檢視各節點的判斷條件
- D. 選擇非線性核分類器，以支持向量數量代替判斷條件

**Unique-answer rationale / explanation:** 深度受限決策樹可直接呈現各節點條件及決策路徑，符合題述要求。損失曲線、整體分數與支持向量數量是模型資訊，卻不等於可直接檢視的個別決策路徑。

### Q071 — 數據準備與模型選擇

Protected mapping: 中級 / L21 / L21301 / medium; answer index 2 (C).
Length ratio: 2.8182 → 1.0154; lengths: 15/10/31/8 → 21/22/22/22.

**Before:** 選模型時，何者比『一律選最大模型』更合理？

- A. 只要訓練準確率最高就是最佳模型
- B. 永遠選參數最多的模型
- C. 依資料型態、資料量、任務、可解釋性、延遲與資源限制選擇適當模型
- D. 不需檢查資料品質

**After:** 分類模型甲的訓練／驗證準確率為 99%／78%，乙為 91%／89%。兩者均符合延遲與資源限制，資料切分方式相同。下一步較合理的是？

- A. 先選甲進行部署，因較高訓練分數代表較佳泛化
- B. 將兩組分數直接取平均，依平均分數決定部署模型
- C. 優先考慮乙，再以保留測試集確認未見資料的表現
- D. 把驗證資料併入訓練，以重訓後訓練分數決定部署

**Unique-answer rationale / explanation:** 在限制相同時，乙的驗證表現較佳，較值得優先考慮；選型後再以保留測試集做最終評估。訓練分數、訓練與驗證的平均值或併入驗證後的訓練分數都不能取代未見資料評估。

### Q072 — 數據準備與模型選擇

Protected mapping: 中級 / L21 / L21301 / medium; answer index 2 (C).
Length ratio: 2.8182 → 0.9857; lengths: 8/10/31/15 → 24/23/23/23.

**Before:** 數據準備與模型選型應如何配合？

- A. 不需檢查資料品質
- B. 永遠選參數最多的模型
- C. 依資料型態、資料量、任務、可解釋性、延遲與資源限制選擇適當模型
- D. 只要訓練準確率最高就是最佳模型

**After:** 團隊要公平比較兩個分類模型，資料含缺值且需標準化。哪種資料準備方式較適合？

- A. 在完整資料估計補值與縮放參數，再切分資料比較模型
- B. 讓各模型自行挑選驗證樣本，再以最高分數比較模型
- C. 固定資料切分並用訓練集估參數，再轉換驗證集比較
- D. 每個模型評分後調整驗證標籤，再重算分數比較模型

**Unique-answer rationale / explanation:** 固定切分可維持可比性，補值與標準化參數應由訓練資料估計後套用到驗證資料，避免洩漏。完整資料估參數、各自挑驗證樣本或依結果改標籤都會破壞比較的可靠性。

### Q073 — 部署與系統集成

Protected mapping: 中級 / L21 / L21302 / medium; answer index 0 (A).
Length ratio: 2.2703 → 1.0147; lengths: 28/21/6/10 → 23/23/22/23.

**Before:** 某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，模型服務要供多個系統呼叫並可水平擴充，常見設計是？

- A. 以服務／API 封裝，搭配版本、監控、權限、擴縮與回滾機制
- B. 把 notebook 直接放在個人電腦長期執行
- C. 取消版本控管
- D. 只保存最後一個模型檔

**After:** 數個產品要即時呼叫同一模型，且推論容量須能獨立於產品擴充。哪種整合架構較符合需求？

- A. 將推論封裝為共用服務，由負載平衡分派至多個副本
- B. 將模型嵌入每個產品程序，隨產品整體增加執行副本
- C. 將請求彙整為每日檔案，由夜間排程產生預測結果
- D. 將推論綁定單一固定主機，由各產品直接共用該程序

**Unique-answer rationale / explanation:** 獨立推論服務可由多個產品共用，並透過副本與負載平衡擴充容量。嵌入產品使擴充耦合；每日批次不符合即時需求；固定單一程序則未提供所需的水平擴充方式。

### Q074 — 部署與系統集成

Protected mapping: 中級 / L21 / L21302 / medium; answer index 0 (A).
Length ratio: 2.2703 → 0.9583; lengths: 28/21/10/6 → 23/23/24/25.

**Before:** AI 模型正式部署時，除了模型檔本身，還需要考慮？

- A. 以服務／API 封裝，搭配版本、監控、權限、擴縮與回滾機制
- B. 把 notebook 直接放在個人電腦長期執行
- C. 只保存最後一個模型檔
- D. 取消版本控管

**After:** 模型更新後需能在異常時迅速恢復上一個可用版本。部署前應優先準備哪項機制？

- A. 保留相容的模型與前處理版本，演練切回舊版的流程
- B. 保留新模型的訓練摘要，出現異常時再重新訓練舊版
- C. 保留新版服務的操作日誌，出現異常時先擴大主機容量
- D. 保留目前部署的模型檔案，出現異常時重新啟動相同版本

**Unique-answer rationale / explanation:** 回滾需要可部署的舊版模型、相容的前處理等依賴及經驗證的切換流程。訓練摘要不能快速重建原版本，擴容與重啟新版也無法恢復舊版行為。

### Q075 — 部署與系統集成

Protected mapping: 中級 / L21 / L21302 / medium; answer index 0 (A).
Length ratio: 2.2703 → 0.9041; lengths: 28/10/21/6 → 22/25/24/24.

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，要讓模型能穩定整合進既有產品，何者最重要？

- A. 以服務／API 封裝，搭配版本、監控、權限、擴縮與回滾機制
- B. 只保存最後一個模型檔
- C. 把 notebook 直接放在個人電腦長期執行
- D. 取消版本控管

**After:** 模型服務 API 的輸出欄位型別即將變更，但部分呼叫端無法同步升級。哪種部署安排較能維持相容性？

- A. 提供版本化介面並保留舊版，讓呼叫端依計畫遷移
- B. 在原介面直接替換欄位型別，要求呼叫端收到錯誤後更新
- C. 在尖峰前增加服務副本數量，讓呼叫端繼續使用原格式
- D. 在原介面延長請求逾時時間，等待呼叫端適應新的格式

**Unique-answer rationale / explanation:** 版本化介面與遷移期可讓不同升級時程的呼叫端持續取得相容輸出。直接改型別會破壞舊端；增加副本或延長逾時處理的是容量與等待問題，不能修復格式不相容。

### Q088 — 資料湖與資料倉儲

Protected mapping: 中級 / L22 / L22202 / medium; answer index 3 (D).
Length ratio: 2.0294 → 1.0455; lengths: 9/10/15/23 → 22/22/22/23.

**Before:** 某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，資料湖（Data Lake）通常較適合哪種情境？

- A. 只適用於單機小資料
- B. 不需要任何治理與目錄
- C. 只能存固定 schema 的彙總表
- D. 可較彈性保存大量原始、多型態資料，再依需求處理

**After:** 工廠要保留原始影像、感測紀錄與設備日誌，供尚未確定的分析需求使用。哪個儲存方案較符合目的？

- A. 將各來源轉為每日總量，僅保留統一格式的彙總表
- B. 將各來源轉為即時指標，僅保留最近一小時的快取
- C. 將各來源轉為報表圖片，依產線分類存入文件目錄
- D. 將各來源存入受治理的資料湖，保留原始內容與目錄

**Unique-answer rationale / explanation:** 此需求重點是保留多型態原始內容，資料湖配合目錄及治理較適合支援後續探索。僅保留彙總、短期快取或報表圖片會失去未來分析所需的明細或原始資訊。

### Q089 — 資料湖與資料倉儲

Protected mapping: 中級 / L22 / L22202 / medium; answer index 2 (C).
Length ratio: 2.0294 → 0.9718; lengths: 15/9/23/10 → 24/23/23/24.

**Before:** 需要保存大量原始、半結構化與非結構化資料供後續分析，較適合？

- A. 只能存固定 schema 的彙總表
- B. 只適用於單機小資料
- C. 可較彈性保存大量原始、多型態資料，再依需求處理
- D. 不需要任何治理與目錄

**After:** 財務部每天使用固定口徑的營收報表，需跨年度進行穩定的 SQL 彙總查詢。哪種資料供應方式較合適？

- A. 讓各分析師從原始檔自行解析，於查詢時各自定義營收
- B. 將每日報表畫面存為影像，於查詢時再辨識其中數字
- C. 在資料倉儲建立一致維度與事實表，依統一口徑查詢
- D. 讓各部門直接查營運資料庫，依部門習慣設定彙總公式

**Unique-answer rationale / explanation:** 固定口徑且重複使用的跨年分析，適合透過資料倉儲的一致維度、事實與業務定義提供。各自解析或定義公式容易產生口徑差異；報表影像也不是穩定 SQL 分析的合適資料層。

### Q090 — 資料湖與資料倉儲

Protected mapping: 中級 / L22 / L22202 / medium; answer index 3 (D).
Length ratio: 2.0294 → 0.9718; lengths: 10/9/15/23 → 23/24/24/23.

**Before:** 某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，相較傳統資料倉儲，Data Lake 的典型特色是？

- A. 不需要任何治理與目錄
- B. 只適用於單機小資料
- C. 只能存固定 schema 的彙總表
- D. 可較彈性保存大量原始、多型態資料，再依需求處理

**After:** 資料湖已保存原始檔，但分析師常找不到欄位意義與來源。若要提升資料可發現性與可追溯性，應優先補強什麼？

- A. 增加儲存副本數量，讓相同檔案分散保存於多個區域
- B. 提升查詢運算規格，讓既有分析工作能在較短時間完成
- C. 延長原始檔保存期限，讓使用者可查詢更長的歷史區間
- D. 建立資料目錄與血緣，記錄欄位定義及來源轉換關係

**Unique-answer rationale / explanation:** 目錄提供欄位定義與搜尋線索，血緣記錄來源及轉換關係，直接對應可發現性與可追溯性。副本、運算規格與保存期限分別支援可用性、效能與歷史範圍，不能補上缺少的中繼資料。

### Q091 — 批次與串流處理

Protected mapping: 中級 / L22 / L22203 / medium; answer index 0 (A).
Length ratio: 2.6538 → 0.9403; lengths: 23/11/7/8 → 21/21/22/24.

**Before:** 某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，感測器資料需秒級處理異常事件，較適合哪種資料處理模式？

- A. 串流重視低延遲持續處理；批次則集中處理一批資料
- B. 批次一定比串流延遲更低
- C. 兩者只差在檔名
- D. 串流只能處理文字

**After:** 設備事件持續到達，系統須在收到異常後數秒內告警。哪項處理安排最符合這個延遲需求？

- A. 以串流工作持續判讀事件，符合條件即觸發告警
- B. 每小時集中讀取新增事件，完成彙總後觸發告警
- C. 每日夜間重跑當日資料，產出異常清單再通知人員
- D. 待累積足量事件再啟動作業，以檔案筆數決定處理時點

**Unique-answer rationale / explanation:** 持續串流判讀能以低延遲處理新事件，較符合收到後數秒內告警的要求。每小時、每日或等待足量資料的安排會引入等待時間，不能保證題述延遲。

### Q092 — 批次與串流處理

Protected mapping: 中級 / L22 / L22203 / medium; answer index 0 (A).
Length ratio: 2.6538 → 0.9194; lengths: 23/8/11/7 → 19/21/21/20.

**Before:** 夜間一次彙總前一天所有交易，較接近哪種處理？

- A. 串流重視低延遲持續處理；批次則集中處理一批資料
- B. 串流只能處理文字
- C. 批次一定比串流延遲更低
- D. 兩者只差在檔名

**After:** 某作業在每日資料截止後，讀取前一天完整交易、一次計算總額並結束。依作業的輸入範圍與執行方式，這屬於什麼？

- A. 批次處理，針對有界資料集合執行一次彙總
- B. 串流處理，持續接收未設終點的事件並更新狀態
- C. 互動查詢，等待使用者送出問題後回傳查詢結果
- D. 同步交易，隨每筆業務請求即時完成資料更新

**Unique-answer rationale / explanation:** 作業針對已截止的完整交易集合執行後結束，是典型批次處理。串流持續處理事件；互動查詢由使用者提問觸發；同步交易則隨個別業務請求執行。

### Q093 — 批次與串流處理

Protected mapping: 中級 / L22 / L22203 / medium; answer index 3 (D).
Length ratio: 2.6538 → 1.0000; lengths: 8/11/7/23 → 23/23/23/23.

**Before:** 某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，Streaming 與 Batch 的差異何者正確？

- A. 串流只能處理文字
- B. 批次一定比串流延遲更低
- C. 兩者只差在檔名
- D. 串流重視低延遲持續處理；批次則集中處理一批資料

**After:** 串流系統要依「事件發生的分鐘」統計交易，但網路延遲會讓部分事件晚到。哪種設計較能維持統計口徑？

- A. 依資料抵達的分鐘分組，將晚到事件計入下一個區間
- B. 依交易檔案的大小分組，檔案達門檻後產生一組總額
- C. 依資料處理的主機分組，分別計算各主機收到的總額
- D. 依事件時間建立視窗，設定晚到資料的補算更新規則

**Unique-answer rationale / explanation:** 題目指定事件發生時間，因此需使用事件時間視窗，並明定晚到資料如何補算或更新。抵達時間、檔案大小及主機分組都改變了要求的統計口徑。

### Q097 — 分群分析

Protected mapping: 中級 / L22 / L22302 / easy; answer index 1 (B).
Length ratio: 2.8000 → 1.0000; lengths: 6/14/4/5 → 18/18/18/18.

**Before:** 沒有客戶標籤，希望依行為將相似客戶分群，適合哪種方法？

- A. 時間序列預測
- B. 分群（Clustering）
- C. 文字生成
- D. 監督式分類

**After:** 電商沒有預設客群標籤，希望依購物頻率與金額找出相似客戶。哪種分析任務最直接符合目的？

- A. 迴歸分析，預測每位客戶下次消費的金額
- B. 分群分析，依行為特徵形成相似的客戶群
- C. 分類分析，學習已標註的高價值客戶類別
- D. 關聯分析，找出商品之間經常共購的組合

**Unique-answer rationale / explanation:** 分群依特徵相似性探索群體，不需先給定客群標籤。迴歸預測數值，分類需要既有類別標籤，關聯分析關注共購組合，均與題述目的不同。

### Q098 — 分群分析

Protected mapping: 中級 / L22 / L22302 / easy; answer index 0 (A).
Length ratio: 2.8000 → 1.0000; lengths: 14/6/4/5 → 22/22/22/22.

**Before:** 某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，想探索資料自然群集，不預先指定類別標籤，應考慮？

- A. 分群（Clustering）
- B. 時間序列預測
- C. 文字生成
- D. 監督式分類

**After:** 團隊以 K-means 將客戶分成四群，得到群號 0、1、2、3。尚未比較各群特徵時，哪種解讀正確？

- A. 群號只是群集識別，需比較特徵才能解讀客群意義
- B. 群號代表消費高低，數字越大即可解讀為價值越高
- C. 群號代表流失機率，數字越大即可解讀為越易流失
- D. 群號代表分類信心，數字越大即可解讀為判斷越準

**Unique-answer rationale / explanation:** K-means 的群號只是識別標記，不自帶價值、風險或信心排序。需分析各群特徵並結合業務情境，才可賦予客群意義。

### Q099 — 分群分析

Protected mapping: 中級 / L22 / L22302 / easy; answer index 3 (D).
Length ratio: 2.8000 → 0.9623; lengths: 6/5/4/14 → 18/19/16/17.

**Before:** 某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，K-means 最常被用於哪一類問題？

- A. 時間序列預測
- B. 監督式分類
- C. 文字生成
- D. 分群（Clustering）

**After:** 某電商以 K-means 分析已標準化的客戶數值特徵。演算法反覆更新群中心時，主要想降低哪一項？

- A. 預測營收與實際營收之間的平方誤差總和
- B. 預測流失標籤與實際流失標籤的分類錯誤數
- C. 不同群中心之間的成對平方距離總和
- D. 每筆資料到所屬群中心的平方距離總和

**Unique-answer rationale / explanation:** K-means 的目標是降低群內平方距離總和，使同群資料接近其中心。營收誤差與標籤分類錯誤屬監督式任務；降低群中心間距也不是 K-means 的目標。

### Q103 — 大數據與模型訓練

Protected mapping: 中級 / L22 / L22401 / medium; answer index 3 (D).
Length ratio: 2.2895 → 0.9844; lengths: 14/13/11/29 → 20/22/22/21.

**Before:** 某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，大量資料是否一定能讓模型變好？

- A. 資料越多一定越準，品質不重要
- B. 只要是大數據就不需要驗證集
- C. 重複與錯誤資料越多越好
- D. 高品質、具代表性的資料常有助模型，但資料品質與分布同樣重要

**After:** 工廠新增大量白天班資料後，模型對夜班設備的辨識仍差；既有訓練資料幾乎沒有夜班樣本。下一批資料應優先如何補充？

- A. 再收集更多白天班樣本，維持目前的班別比例
- B. 複製既有白天班紀錄，增加訓練時讀取的資料筆數
- C. 移除夜班評估樣本，改以資料最多的班別報告成效
- D. 補入具代表性的夜班樣本，核對標註後重新評估

**Unique-answer rationale / explanation:** 問題顯示訓練資料對夜班代表性不足，應補足該情境並確保標註品質，再檢查成效。增加或複製白天資料無法補上覆蓋缺口，移除夜班評估則只是掩蓋問題。

### Q104 — 大數據與模型訓練

Protected mapping: 中級 / L22 / L22401 / medium; answer index 0 (A).
Length ratio: 2.2895 → 0.9265; lengths: 29/14/11/13 → 21/22/23/23.

**Before:** 某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，增加訓練資料時，下列何者最合理？

- A. 高品質、具代表性的資料常有助模型，但資料品質與分布同樣重要
- B. 資料越多一定越準，品質不重要
- C. 重複與錯誤資料越多越好
- D. 只要是大數據就不需要驗證集

**After:** 準備併入的大批新資料，經抽查發現同類缺陷在不同標註員手上常被標成不同類別。擴充訓練前應優先做什麼？

- A. 釐清標註規則並複核爭議樣本，再納入訓練資料
- B. 提高新資料的抽樣權重，讓模型更快適應新增標籤
- C. 先混合所有標籤進行訓練，以整體分數判斷規則差異
- D. 延長模型的訓練迭代次數，以充分擬合不同標註結果

**Unique-answer rationale / explanation:** 標註定義不一致會將矛盾訊號帶入訓練，應先對齊規則並複核爭議資料。提高權重、直接混合或延長訓練不能消除標註規則衝突。

### Q105 — 大數據與模型訓練

Protected mapping: 中級 / L22 / L22401 / medium; answer index 0 (A).
Length ratio: 2.2895 → 0.9429; lengths: 29/13/14/11 → 22/23/23/24.

**Before:** 大數據對機器學習的價值最適合如何描述？

- A. 高品質、具代表性的資料常有助模型，但資料品質與分布同樣重要
- B. 只要是大數據就不需要驗證集
- C. 資料越多一定越準，品質不重要
- D. 重複與錯誤資料越多越好

**After:** 大量交易紀錄中，同一客戶常有多筆近似資料。若目標是評估模型對「全新客戶」的表現，應如何切分？

- A. 以客戶為單位分割，使同一客戶不跨訓練與測試集
- B. 以交易列隨機分割，讓同一客戶資料分布於兩個集合
- C. 以檔案大小平均分割，讓兩個集合占用相近儲存空間
- D. 以交易金額高低分割，讓高額交易作訓練而低額作測試

**Unique-answer rationale / explanation:** 評估全新客戶需要客戶層級的隔離，避免同一人的近似紀錄跨集合而高估泛化。隨機交易列或檔案大小不能保證隔離；按金額切分也不對應全新客戶的評估目標。
