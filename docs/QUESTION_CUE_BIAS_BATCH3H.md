# Issue #56 — Batch 3H question cue remediation

Engineering evidence, 2026-09-29. Independent Technical Review remains pending; this is not Product Verify.

## Baseline and scope

- Contract: [Issue #56](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/56).
- Branch: `codex/issue-56-batch3h`.
- Baseline: `231de941a412ffeba326276d3e928a8563a9ee43`, the fetched `question/issue-14-remediation` head when implementation began, identical to the pre-created scoped branch. Batch 3G was already integrated.
- Exactly 24 self-authored items: Q370–Q381 and Q394–Q405. Only `question`, `options`, and `explanation` changed.
- Preserved all IDs/order, level, subject/topic, concept, difficulty, answer index, sourceType and other question fields, non-question DB metadata, and the entire HTML/CSS/JS shell outside the DB.
- Official content, source links, UI, localStorage and application logic are unchanged. No new dependencies. Audit script only adds `batch3h`; all eleven existing batch definitions remain unchanged.

## Reproducible audit

```powershell
python scripts/audit_question_cues.py --batch batch3h --baseline 231de941a412ffeba326276d3e928a8563a9ee43 --csv docs/QUESTION_CUE_BIAS_BATCH3H.csv
node scripts/test_past_answer_feedback.cjs
python scripts/serve_question_batch1a.py --batch batch3h
git diff --check
```

The [CSV](QUESTION_CUE_BIAS_BATCH3H.csv) contains 966 data rows: all 483 items before and after, with option lengths, ratio, unique-longest flag, repeated IDs and flag reasons. Length counts Unicode code points excluding whitespace. Ratio compares the correct option with mean distractor length. Repeated option sets ignore option order and whitespace.

| Whole-bank metric | Before | After |
|---|---:|---:|
| Questions / unique IDs | 483 / 483 | 483 / 483 |
| Unique longest correct option | 255 | 234 |
| Correct-length ratio ≥ 2 | 59 | 35 |
| Correct-length ratio ≥ 3 | 0 | 0 |
| Repeated option-set groups | 56 | 52 |
| Questions in repeated sets | 251 | 227 |
| Answer A / B / C / D | 131 / 109 / 122 / 121 | 131 / 109 / 122 / 121 |

Scoped validation PASS: all 24 ratios are below 2 (0.8372–1.1250), and every reviewed option set is unique across the full bank. Three correct options remain uniquely longest: Q371 (1.0455), Q377 (1.1250), Q405 (1.0678). The small differences express snapshot publication, deferred execution and privacy-unit boundaries; options no longer contrast a long correct-only definition with short unrelated claims. Flags remain visible in the CSV. Heuristics do not replace editorial review; remaining whole-bank flags are outside this issue's scope.

## Editorial review

Engineering Agent reviewed all 24 items for one defensible answer, plausible alternatives, answer/explanation consistency, grammar and completeness cues. Each cluster has six distinct option sets and decision points. No protected metadata or contract change was needed. The final editorial pass replaced several overly easy distractors with actual operational misconceptions before browser QA.

| Cluster | Distinct checks | Editorial constraints |
|---|---|---|
| Q370–Q375 Lakehouse | table-management architecture, atomic snapshots, historical reproducibility, engine compatibility, access governance, scan/file tuning | File access alone is not transaction compatibility. Historical snapshots depend on retention; full reproducibility also needs query/dependency versions. Central storage does not confer authorization or performance. |
| Q376–Q381 Spark | reuse persistence, lazy transformations, MEMORY_ONLY capacity, hot-key skew, driver collection limits, selective caching | State the storage level: MEMORY_ONLY recomputation differs from MEMORY_AND_DISK and execution spill. Persist is materialized by execution; caching every intermediate is not automatically faster. |
| Q394–Q399 Visualization integrity | bar baseline, 3D distortion, area/radius encoding, comparable scales, period selection, uncertainty | Zero baseline applies to length encoding, not every chart. Fourfold circle area requires double radius. Full periods and estimation context matter; interval overlap alone is not a universal significance test. |
| Q400–Q405 Privacy | minimum equivalence group, neighboring-output guarantee, epsilon/noise tradeoff, homogeneous sensitive values, sequential composition, user contribution bounds | Explicit quasi-identifiers and one-person-per-row assumption for k. Differential privacy constrains output probabilities, not identical outputs. Specify Laplace sensitivity, pure DP/basic sequential composition, and person versus event protection. |

Each key's rationale and before/after content appear below. This is engineering editorial evidence, not an independent Technical Review decision.

## QA evidence

- Scoped audit PASS: exact 24 changed IDs; 483 unique IDs; four distinct options; valid answer indices and subject/topic references; protected fields, other questions, DB metadata and non-DB shell unchanged.
- Baseline comparison confirmed all eleven prior audit batch definitions unchanged. CSV rows and all before/after report entries checked against the DB.
- JavaScript: Node compiled the page's one inline script with `new Function`; PASS. Python: AST parsing of audit and fixture scripts; PASS.
- Official-answer regression: `node scripts/test_past_answer_feedback.cjs` PASS for 16 answer/selection combinations, repeat guard, progress, render escaping, PDF entry, no duplicates/placeholders, navigation/reset and completion scoring.
- Browser: in-app Chromium, existing fixture at `http://127.0.0.1:8766/batch3h`; desktop 1280×900 and mobile 375×812.
- Practice: all 24 revised IDs answered, first 12 on desktop and remaining 12 on mobile. Q396 deliberately answered B; other 23 answered correctly. Feedback, correct keys, explanations, self-authored labels and navigation checked. Desktop IDs: Q395, Q401, Q372, Q404, Q373, Q394, Q376, Q402, Q405, Q399, Q370, Q397. Mobile IDs: Q379, Q400, Q378, Q380, Q403, Q377, Q374, Q396, Q375, Q381, Q371, Q398.
- Wrong-question view contained only Q396. Weak-area statistics: L22303 5/6 (83%); L22404, L22202 and L22203 each 6/6 (100%).
- L22 mock: all 24 scoped questions, first 12 on desktop and remaining 12 on mobile. Submitted on mobile: 23 correct, one incorrect, zero unanswered; score 96. Wrong-only review showed Q396 selected B (40), correct A (20), and the square-root area explanation.
- Screenshots inspected for desktop Practice Q397, mobile Practice Q398 and mobile expanded mock review Q396. Mobile Practice/review measured `innerWidth=375`, document `scrollWidth=360`: no page-level horizontal overflow; scrollable tab bar remained usable.
- All seven tabs opened. Official scope links rendered. Official past-paper tab loaded the 115 second-session L11 structured paper with 50 questions, official source label, answer controls and original PDF link.
- Browser warning/error log empty at completion. Temporary viewport override reset. `git diff --check` PASS before commit.

Limits: the existing fixture narrows self-authored content to this batch, replaces storage with memory, auto-accepts confirm dialogs and disables background PDF prewarming. Checks cover actual rendering/scoring for changed questions, not persistent localStorage, native dialogs, full 50-question self-authored sampling, live PDF extraction, physical mobile devices, Dev Preview or production. Unchanged app/storage/official-content code is checked by the non-DB-shell assertion. A usage-limit interruption occurred after mock submission; resumed QA confirmed the preserved result and completed review/official-entry checks. No known implementation blocker remains; independent review is pending.

## Technical references checked

- [Apache Iceberg reliability](https://iceberg.apache.org/docs/1.4.2/reliability/) and [table specification](https://iceberg.apache.org/spec/): atomic snapshots, metadata and versioned table contents.
- [Apache Spark RDD programming guide](https://spark.apache.org/docs/latest/rdd-programming-guide): lazy evaluation, persistence levels, shuffle and driver collection.
- [ONS axes and gridlines](https://service-manual.ons.gov.uk/data-visualisation/guidance/axes-and-gridlines): length encoding and comparable scales.
- [NIST differential privacy introduction](https://www.nist.gov/blogs/cybersecurity-insights/differential-privacy-privacy-preserving-data-analysis-introduction-our) and [SP 800-226](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-226.pdf): neighboring datasets, sensitivity, epsilon and composition.

References support self-authored editorial checks. Numeric inputs are hypothetical exercise assumptions. No official iPAS wording, answer or metadata has been changed.

## Item-by-item review

### Q370 — Lakehouse

Protected mapping: 中級 / L22 / L22202 / hard; answer index 2 (C).
Length ratio: 2.1549 → 0.9545; lengths: 26/25/51/20 → 22/22/21/22.

**Before:** 公司同時希望保存原始多型態資料，又想讓 BI/SQL 能穩定查詢與管理表格，常評估哪種架構？

- A. Lakehouse 不需要 schema、治理或交易能力
- B. Lakehouse 代表把所有資料移到單一 Excel
- C. Lakehouse 嘗試結合 Data Lake 的彈性低成本儲存與 Data Warehouse 的管理／查詢能力
- D. Lakehouse 只是一種資料視覺化圖表

**After:** 團隊希望在物件儲存保留多型態原始資料，同時讓分析表具備交易、版本與 SQL 查詢能力。哪項設計最符合 Lakehouse 的核心方向？

- A. 只保存原始檔案，讓每位分析師自行推定表格版本
- B. 每天匯出獨立副本，讓各部門自行維護欄位與版本
- C. 在資料湖加上表格管理層，供相容引擎一致讀寫
- D. 僅在物件目錄建立索引，讓索引取代表格交易紀錄

**Unique-answer rationale / explanation:** Lakehouse 在資料湖儲存之上加入表格管理與分析能力，結合資料湖的彈性與資料倉儲式管理。只有檔案或個別匯出副本，並未建立受控交易與版本語意；實際能力仍取決於格式、引擎與治理設定。

### Q371 — Lakehouse

Protected mapping: 中級 / L22 / L22202 / hard; answer index 3 (D).
Length ratio: 2.1549 → 1.0455; lengths: 26/20/25/51 → 22/22/22/23.

**Before:** 某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，Data Lake 與 Data Warehouse 的能力希望在同一平台更緊密結合，最接近？

- A. Lakehouse 不需要 schema、治理或交易能力
- B. Lakehouse 只是一種資料視覺化圖表
- C. Lakehouse 代表把所有資料移到單一 Excel
- D. Lakehouse 嘗試結合 Data Lake 的彈性低成本儲存與 Data Warehouse 的管理／查詢能力

**After:** Lakehouse 表格更新需寫入多個檔案，讀者不能看到只完成一半的批次。哪種機制最直接提供一致的讀取版本？

- A. 依檔案最後修改時間排序，讀取目前已出現的檔案
- B. 每寫完一個檔案就更新報表，讓讀者逐步取得資料
- C. 以檔案名稱包含相同日期為準，推定整批都已完成
- D. 完成檔案後原子提交表格快照，讀者使用已提交版本

**Unique-answer rationale / explanation:** 交易表格透過原子提交快照或交易紀錄，使讀者取得完整的已提交版本，而非任意混讀正在寫入的檔案。檔名與修改時間不能單獨建立多檔案交易的一致性。

### Q372 — Lakehouse

Protected mapping: 中級 / L22 / L22202 / hard; answer index 3 (D).
Length ratio: 2.1549 → 1.0345; lengths: 25/20/26/51 → 19/18/21/20.

**Before:** 下列哪一項較合理描述 Lakehouse？

- A. Lakehouse 代表把所有資料移到單一 Excel
- B. Lakehouse 只是一種資料視覺化圖表
- C. Lakehouse 不需要 schema、治理或交易能力
- D. Lakehouse 嘗試結合 Data Lake 的彈性低成本儲存與 Data Warehouse 的管理／查詢能力

**After:** 某 Lakehouse 已保存歷史表格快照。分析師要重現昨天報表的輸入資料，今天表格已更新，應採哪種做法？

- A. 查詢最新表格，再把報表日期欄位改為昨天
- B. 只依報表產生時間排序，不指定資料版本
- C. 重新執行今天的匯入流程，推定結果與昨天一致
- D. 使用昨天報表記錄的快照版本，讀取當時資料

**Unique-answer rationale / explanation:** 重現資料輸入需要鎖定當時使用的版本，並確保快照與其引用檔案仍在保留期內。改日期或查最新表格不能恢復過去資料；完整報表重現還需保留查詢程式與其他依賴。

### Q373 — Lakehouse

Protected mapping: 中級 / L22 / L22202 / hard; answer index 0 (A).
Length ratio: 2.1549 → 1.0000; lengths: 51/25/20/26 → 22/22/22/22.

**Before:** 資料團隊不想在 Lake 與 Warehouse 間大量複製資料，希望統一分析層，可考慮？

- A. Lakehouse 嘗試結合 Data Lake 的彈性低成本儲存與 Data Warehouse 的管理／查詢能力
- B. Lakehouse 代表把所有資料移到單一 Excel
- C. Lakehouse 只是一種資料視覺化圖表
- D. Lakehouse 不需要 schema、治理或交易能力

**After:** BI 與機器學習團隊想直接共用同一份 Lakehouse 表格，避免各自維護不同副本。啟用第二個引擎前，最應先驗證什麼？

- A. 兩個引擎是否支援相同表格格式、版本及讀寫語意
- B. 兩個引擎是否能開啟底層檔案，無須核對表格協定
- C. 兩個引擎是否支援 SQL 語法，無須核對快照處理
- D. 兩個引擎是否能列出相同目錄，無須核對交易紀錄

**Unique-answer rationale / explanation:** 共用資料需驗證格式與版本相容、快照及交易語意，並核對實際讀寫功能。都能讀 Parquet、使用 SQL 或列出目錄，不表示都能正確理解其上的交易表格。

### Q374 — Lakehouse

Protected mapping: 中級 / L22 / L22202 / hard; answer index 3 (D).
Length ratio: 2.1549 → 1.0161; lengths: 25/20/26/51 → 21/21/20/21.

**Before:** Lakehouse 架構的核心訴求之一是？

- A. Lakehouse 代表把所有資料移到單一 Excel
- B. Lakehouse 只是一種資料視覺化圖表
- C. Lakehouse 不需要 schema、治理或交易能力
- D. Lakehouse 嘗試結合 Data Lake 的彈性低成本儲存與 Data Warehouse 的管理／查詢能力

**After:** Lakehouse 的儲存已集中，但分析帳號可直接讀到未遮罩的敏感欄位。若目標是落實最小資料存取權，應優先補上哪項能力？

- A. 增加物件儲存副本數，讓敏感資料更容易被還原
- B. 增加查詢工作節點數，讓讀取敏感資料更快完成
- C. 增加表格的快照保留天數，讓歷史資料更完整
- D. 設定身分與欄位存取政策，驗證各讀取路徑權限

**Unique-answer rationale / explanation:** 集中儲存或採用交易格式不會自動落實授權。應依角色設定敏感欄位的存取或遮罩政策，並驗證 SQL 與直接檔案讀取等路徑，避免繞過控制；副本、算力與保留天數處理的是不同需求。

### Q375 — Lakehouse

Protected mapping: 中級 / L22 / L22202 / hard; answer index 1 (B).
Length ratio: 2.1549 → 1.0000; lengths: 26/51/25/20 → 22/22/22/22.

**Before:** 某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，若架構在物件儲存上加入 ACID table format、catalog 與 SQL 分析能力，概念上更接近？

- A. Lakehouse 不需要 schema、治理或交易能力
- B. Lakehouse 嘗試結合 Data Lake 的彈性低成本儲存與 Data Warehouse 的管理／查詢能力
- C. Lakehouse 代表把所有資料移到單一 Excel
- D. Lakehouse 只是一種資料視覺化圖表

**After:** Lakehouse 上某彙總查詢很慢，執行計畫顯示掃描大量不相關分區及小檔案。開始調校時，哪項工作最直接對應已觀察到的瓶頸？

- A. 先增加結果快取時間，不檢查首次查詢的掃描成本
- B. 檢查分區裁剪與檔案整理，再用相同查詢比較效能
- C. 先增加歷史快照數量，讓每次查詢有更多版本可選
- D. 先提高來源匯入頻率，不調整目前的資料檔案布局

**Unique-answer rationale / explanation:** 應根據掃描與檔案開啟成本檢查分區設計、裁剪條件及小檔案整理，再用可比較負載驗證。結果快取可能幫助重複查詢，但不能修正首次掃描成本；增加快照或匯入頻率也沒有直接對應此瓶頸。

### Q376 — Spark 與記憶體運算

Protected mapping: 中級 / L22 / L22203 / hard; answer index 0 (A).
Length ratio: 2.3617 → 0.9844; lengths: 37/12/20/15 → 21/22/22/20.

**Before:** 大數據 ETL 有多次反覆轉換，團隊希望利用分散式記憶體運算降低中間 I/O，常考慮？

- A. Spark 透過分散式運算與記憶體中處理等機制，適合反覆迭代與大規模資料處理
- B. Spark 只能在單機執行
- C. Spark 是關聯式資料庫引擎且不能做串流
- D. Spark 的核心用途是生成圖片

**After:** Spark 作業把同一份昂貴的清理結果用於多輪迭代，且結果可容納於可用快取。哪項調整最直接減少每輪重算？

- A. 持久化重複使用的結果，在使用完畢後釋放快取
- B. 每輪都重新讀取來源，僅將輸出檔案名稱保持相同
- C. 每輪都增加一次 count，以此取代結果持久化
- D. 每輪只快取最終彙總，不保留重用的清理結果

**Unique-answer rationale / explanation:** persist/cache 可讓後續操作重用已物化的分區，避免反覆執行昂貴轉換；用完釋放可降低記憶體壓力。單純 count 不等同持久化，只快取最終彙總也未保留題目要重用的清理結果；實際效益仍需測量。

### Q377 — Spark 與記憶體運算

Protected mapping: 中級 / L22 / L22203 / hard; answer index 1 (B).
Length ratio: 2.3617 → 1.1250; lengths: 20/37/15/12 → 20/24/23/21.

**Before:** 與傳統每階段大量落盤的處理相比，Spark 的常見優勢之一是？

- A. Spark 是關聯式資料庫引擎且不能做串流
- B. Spark 透過分散式運算與記憶體中處理等機制，適合反覆迭代與大規模資料處理
- C. Spark 的核心用途是生成圖片
- D. Spark 只能在單機執行

**After:** Spark 程式對 RDD 連續呼叫 map 與 filter，尚未呼叫任何 action。此時轉換結果通常處於什麼狀態？

- A. 所有分區已完成運算，且結果已自動寫回來源
- B. 已建立轉換的相依關係，等 action 觸發實際運算
- C. 所有資料已集中到 driver，等待程式列印結果
- D. 每個轉換都已產生永久備份，等待清除過期檔案

**Unique-answer rationale / explanation:** RDD 轉換採延遲求值，先記錄相依關係，action 才觸發需要的計算。map/filter 本身不表示所有結果已運算、集中到 driver 或永久落盤。

### Q378 — Spark 與記憶體運算

Protected mapping: 中級 / L22 / L22203 / hard; answer index 0 (A).
Length ratio: 2.3617 → 1.0000; lengths: 37/12/15/20 → 20/20/20/20.

**Before:** 某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，下列哪一項最符合 Apache Spark 的定位？

- A. Spark 透過分散式運算與記憶體中處理等機制，適合反覆迭代與大規模資料處理
- B. Spark 只能在單機執行
- C. Spark 的核心用途是生成圖片
- D. Spark 是關聯式資料庫引擎且不能做串流

**After:** RDD 使用 MEMORY_ONLY 持久化，但部分分區放不進記憶體。依這個儲存層級，後續再次需要未快取分區時通常如何取得？

- A. 依相依關係重新計算未快取分區，再提供結果
- B. 自動把整個 RDD 轉成資料庫表格後重新查詢
- C. 永遠略過未快取分區，直接回傳剩餘資料結果
- D. 自動保證全部分區落盤，直接從磁碟取回結果

**Unique-answer rationale / explanation:** MEMORY_ONLY 無法容納的分區不會因此自動成為磁碟快取，通常在需要時重算。若要記憶體不足時使用磁碟，可評估適當的 MEMORY_AND_DISK 等層級；這與運算中可能發生的 spill 是不同概念。

### Q379 — Spark 與記憶體運算

Protected mapping: 中級 / L22 / L22203 / hard; answer index 0 (A).
Length ratio: 2.3617 → 1.0455; lengths: 37/15/20/12 → 23/24/21/21.

**Before:** 某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，企業需要分散式 SQL、批次與部分串流分析能力，可考慮哪個框架？

- A. Spark 透過分散式運算與記憶體中處理等機制，適合反覆迭代與大規模資料處理
- B. Spark 的核心用途是生成圖片
- C. Spark 是關聯式資料庫引擎且不能做串流
- D. Spark 只能在單機執行

**After:** Spark 聚合時一個熱門 key 佔大部分資料，少數 task 遠慢於其他 task。執行紀錄顯示資料傾斜，哪項改善最有針對性？

- A. 檢查熱門 key 的分布，評估預聚合或分散其工作量
- B. 只增加 driver 記憶體，保留現有熱門 key 分區
- C. 只延長 task 的逾時時間，保留現有聚合方式
- D. 只減少輸出檔案個數，保留聚合階段的資料分布

**Unique-answer rationale / explanation:** 熱門 key 可能使聚合工作集中於少數分區。需依運算語意評估預聚合、拆分熱門 key 後再合併或其他傾斜處理；增加 driver 記憶體、延長逾時或改最終輸出檔數，不會直接重分配聚合時的熱門 key 負載。

### Q380 — Spark 與記憶體運算

Protected mapping: 中級 / L22 / L22203 / hard; answer index 3 (D).
Length ratio: 2.3617 → 0.9403; lengths: 20/15/12/37 → 27/20/20/21.

**Before:** 某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，Spark 為何常被用於機器學習前的大規模特徵處理？

- A. Spark 是關聯式資料庫引擎且不能做串流
- B. Spark 的核心用途是生成圖片
- C. Spark 只能在單機執行
- D. Spark 透過分散式運算與記憶體中處理等機制，適合反覆迭代與大規模資料處理

**After:** 大型 Spark DataFrame 的處理結果超過 driver 記憶體。團隊只需各地區彙總數字與少量預覽，應如何取得？

- A. 對完整結果 collect，之後才在 driver 計算彙總
- B. 把完整結果轉成本機清單，再篩出需要的地區
- C. 把完整結果列印到日誌，再由人工挑選預覽列
- D. 在叢集先彙總並限制預覽列數，再取回小型結果

**Unique-answer rationale / explanation:** collect 會把全部結果帶回 driver，可能造成記憶體不足。應在分散式端完成聚合，僅取回可容納的小結果或有限預覽；分散式運算不代表 driver 能容納全資料。

### Q381 — Spark 與記憶體運算

Protected mapping: 中級 / L22 / L22203 / hard; answer index 1 (B).
Length ratio: 2.3617 → 0.8919; lengths: 20/37/12/15 → 20/22/32/22.

**Before:** 某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，關於 Spark，下列敘述何者較正確？

- A. Spark 是關聯式資料庫引擎且不能做串流
- B. Spark 透過分散式運算與記憶體中處理等機制，適合反覆迭代與大規模資料處理
- C. Spark 只能在單機執行
- D. Spark 的核心用途是生成圖片

**After:** Spark 團隊把每個只用一次的中間結果都 cache，之後出現記憶體壓力與較長執行時間。哪項調整較合理？

- A. 只增加來源檔案副本，保留所有中間結果快取
- B. 依重用成本選擇快取結果，釋放不用的持久化資料
- C. 將所有資料 collect 到 driver，取代 executor 快取
- D. 一律改用磁碟持久化，省略各結果的重用成本評估

**Unique-answer rationale / explanation:** 快取有儲存與管理成本，對只使用一次的結果不一定有利。應依重用頻率、計算成本及記憶體容量選擇持久化，並適時 unpersist；不能假設快取越多就越快。

### Q394 — 視覺化誠信

Protected mapping: 中級 / L22 / L22303 / medium; answer index 3 (D).
Length ratio: 2.4474 → 1.0000; lengths: 8/17/13/31 → 21/21/21/21.

**Before:** 兩產品銷售差 3%，柱狀圖卻從 97% 起畫，看起來差距巨大。這主要違反什麼原則？

- A. 圖表越立體越準確
- B. 柱狀圖 Y 軸任意截斷不會影響讀者感受
- C. 使用最多顏色一定提升資訊量
- D. 使用恰當尺度、標籤與圖型，避免截斷座標軸或面積誤導造成錯誤解讀

**After:** 兩產品銷售量分別為 100 與 103 件，柱狀圖從 99 件開始畫，使第二根柱高看似第一根的四倍。若要用柱長比較總量，應如何修正？

- A. 保留 99 件起點，只把較高的柱子改成較淡顏色
- B. 保留 99 件起點，只在較低的柱子加上醒目外框
- C. 保留 99 件起點，只將圖表寬度增加為原本兩倍
- D. 將數值軸改從零開始，保留件數標籤與一致尺度

**Unique-answer rationale / explanation:** 柱長代表數值大小，截去共同基線會誇大比例；從零起畫可如實呈現 100 與 103 的相對量。顏色、外框或寬度不會修正柱長的比例問題；這不是要求所有類型圖表一律從零起畫。

### Q395 — 視覺化誠信

Protected mapping: 中級 / L22 / L22303 / medium; answer index 3 (D).
Length ratio: 2.4474 → 1.0169; lengths: 17/8/13/31 → 19/20/20/20.

**Before:** 某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，儀表板用 3D 圓餅圖造成面積視覺扭曲，較好的做法是？

- A. 柱狀圖 Y 軸任意截斷不會影響讀者感受
- B. 圖表越立體越準確
- C. 使用最多顏色一定提升資訊量
- D. 使用恰當尺度、標籤與圖型，避免截斷座標軸或面積誤導造成錯誤解讀

**After:** 部門占比用傾斜的 3D 圓餅圖呈現，前方扇區因透視看起來較大。若要保留占比訊息並減少視覺扭曲，哪項修改最直接？

- A. 保留傾斜視角，增加前方扇區的陰影與厚度
- B. 保留透視效果，將最大的扇區移到畫面最前方
- C. 保留立體造型，只把圖例依部門名稱重新排序
- D. 改成平面條形圖，以共同尺度標示各部門占比

**Unique-answer rationale / explanation:** 平面條形圖以共同基線及長度比較占比，可避免 3D 透視造成的面積判斷偏差。陰影、旋轉或重排圖例不會消除透視；平面圓餅圖在適當情境下也可使用。

### Q396 — 視覺化誠信

Protected mapping: 中級 / L22 / L22303 / medium; answer index 0 (A).
Length ratio: 2.4474 → 0.9796; lengths: 31/13/8/17 → 16/17/15/17.

**Before:** 某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，下列哪一項最符合誠實且可讀的資料視覺化？

- A. 使用恰當尺度、標籤與圖型，避免截斷座標軸或面積誤導造成錯誤解讀
- B. 使用最多顏色一定提升資訊量
- C. 圖表越立體越準確
- D. 柱狀圖 Y 軸任意截斷不會影響讀者感受

**After:** 氣泡圖以圓的面積代表人數。B 組人數為 A 組的四倍，若 A 的半徑為 10，B 的半徑應設為多少才符合比例？

- A. 20，讓半徑平方後的面積成為四倍
- B. 40，讓半徑本身直接成為人數的四倍
- C. 80，讓直徑數值乘上人數的四倍
- D. 10，讓所有群組保留相同的圓形大小

**Unique-answer rationale / explanation:** 圓面積與半徑平方成正比，半徑應為 10×√4＝20。若把半徑放大四倍，面積會放大十六倍，誇大差距；應清楚標示面積編碼及圖例。

### Q397 — 視覺化誠信

Protected mapping: 中級 / L22 / L22303 / medium; answer index 2 (C).
Length ratio: 2.4474 → 1.0328; lengths: 17/8/31/13 → 21/20/21/20.

**Before:** 某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，比較不同期間數值時，座標尺度設計為何重要？

- A. 柱狀圖 Y 軸任意截斷不會影響讀者感受
- B. 圖表越立體越準確
- C. 使用恰當尺度、標籤與圖型，避免截斷座標軸或面積誤導造成錯誤解讀
- D. 使用最多顏色一定提升資訊量

**After:** 兩張等高小圖並排比較兩季的營收水準，第一張軸範圍 0–100，第二張 0–1,000，卻未提示尺度不同。若目的是直接比較柱高，應怎麼處理？

- A. 各自縮放到填滿圖框，讓每張圖的最高柱一樣高
- B. 各自隱藏數值軸標籤，避免讀者注意尺度差異
- C. 使用相同單位與軸範圍，再保留清楚的期間標示
- D. 將第二張的柱子加寬，藉此補償兩張圖的軸差

**Unique-answer rationale / explanation:** 直接比較柱高需要相同單位與尺度，否則相同高度可能代表差十倍的值。獨立尺度可用於其他分析目的，但必須明示且不能引導讀者把柱高當作可直接比較的總量。

### Q398 — 視覺化誠信

Protected mapping: 中級 / L22 / L22303 / medium; answer index 1 (B).
Length ratio: 2.4474 → 1.0000; lengths: 17/31/13/8 → 21/21/21/21.

**Before:** 主管希望「把圖畫得看起來成長很多」，分析師應如何處理？

- A. 柱狀圖 Y 軸任意截斷不會影響讀者感受
- B. 使用恰當尺度、標籤與圖型，避免截斷座標軸或面積誤導造成錯誤解讀
- C. 使用最多顏色一定提升資訊量
- D. 圖表越立體越準確

**After:** 年度營收圖漏掉虧損最嚴重的一季，只連接其他季的數值並標成「全年持續改善」。若要忠實呈現全年趨勢，應如何修正？

- A. 保留省略的季度，改用更平滑的曲線連接其他點
- B. 補回完整期間資料，對缺值或排除理由明確註記
- C. 保留改善標題，僅把資料來源字體縮小移到角落
- D. 只挑最高與最低兩個觀測值，取代原本全年資料

**Unique-answer rationale / explanation:** 呈現全年趨勢應保留完整期間及一致口徑，不應挑選有利時間點。若確有缺值或合理排除，須註明且避免用連線暗示已觀測的連續趨勢；平滑或修改裝飾不能修正選樣偏差。

### Q399 — 視覺化誠信

Protected mapping: 中級 / L22 / L22303 / medium; answer index 3 (D).
Length ratio: 2.4474 → 0.9836; lengths: 13/8/17/31 → 20/21/20/20.

**Before:** 某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，對外公開數據圖表時，除了美觀還應注意什麼？

- A. 使用最多顏色一定提升資訊量
- B. 圖表越立體越準確
- C. 柱狀圖 Y 軸任意截斷不會影響讀者感受
- D. 使用恰當尺度、標籤與圖型，避免截斷座標軸或面積誤導造成錯誤解讀

**After:** 兩組調查比例分別為 51% 與 49%，圖表只畫點估計就宣稱存在可靠差異。讀者要判斷估計精度，最應補充什麼？

- A. 加大兩組配色差異，讓接近的點更容易被區分
- B. 增加百分比的小數位數，讓估計值看起來更精細
- C. 只顯示兩組的排名順序，省略差距大小與誤差
- D. 提供樣本與估計方法，並呈現定義清楚的區間

**Unique-answer rationale / explanation:** 點估計差異不等於已有可靠差異證據。應提供樣本、估計方法及適當的不確定性區間，並使用符合設計的比較方法；僅由兩個區間是否重疊也不宜一概判定顯著性。

### Q400 — K-anonymity 與差分隱私

Protected mapping: 中級 / L22 / L22404 / hard; answer index 0 (A).
Length ratio: 2.7447 → 1.0213; lengths: 43/24/14/9 → 16/15/16/16.

**Before:** 某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，資料集移除姓名後，仍可能由年齡、郵遞區號、性別組合辨識個人。若要求每組至少有 k 人，這是？

- A. K-anonymity 限制準識別組合的可辨識性；差分隱私則限制單一個體對查詢輸出的影響
- B. K-anonymity 可保證抵抗所有背景知識攻擊
- C. 差分隱私只是在資料中刪除姓名
- D. 兩者都等同資料加密

**After:** 每人一列的釋出表，以年齡區間與地區作為全部準識別欄位，分組後人數為 4、7、9。只就這些欄位而言，表格可達到的最大 k 是多少？

- A. 4，由最小準識別等價群的人數決定
- B. 7，由各等價群人數的中位數決定
- C. 9，由最大準識別等價群的人數決定
- D. 20，由釋出表格的總人數直接決定

**Unique-answer rationale / explanation:** k-anonymity 要求每個準識別組合至少對應 k 筆紀錄，因此最大可達 k 為最小群的人數 4。這取決於選定的準識別欄位及每人一列假設，不代表所有敏感屬性推斷都被阻止。

### Q401 — K-anonymity 與差分隱私

Protected mapping: 中級 / L22 / L22404 / hard; answer index 0 (A).
Length ratio: 2.7447 → 1.0328; lengths: 43/14/24/9 → 21/21/20/20.

**Before:** 某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，統計查詢想降低單一個體是否加入資料集對結果的影響，通常可考慮？

- A. K-anonymity 限制準識別組合的可辨識性；差分隱私則限制單一個體對查詢輸出的影響
- B. 差分隱私只是在資料中刪除姓名
- C. K-anonymity 可保證抵抗所有背景知識攻擊
- D. 兩者都等同資料加密

**After:** 分析服務聲稱提供個體層級差分隱私，鄰接資料集定義為增減一人的所有紀錄。這項保證主要約束什麼？

- A. 相鄰資料集經隨機機制後，輸出事件的機率差異
- B. 相鄰資料集的每筆明文內容，必須變成相同字串
- C. 每次查詢的實際輸出值，必須與上次完全相同
- D. 每個準識別群組的人數，必須與總樣本數相同

**Unique-answer rationale / explanation:** 差分隱私限制鄰接資料集下各輸出事件的機率關係，以 ε（以及適用時的 δ）量化。它不是要求輸出完全相同，也不是 k-anonymity 的群組大小條件；個體保護範圍必須由鄰接定義說清楚。

### Q402 — K-anonymity 與差分隱私

Protected mapping: 中級 / L22 / L22404 / hard; answer index 0 (A).
Length ratio: 2.7447 → 1.0000; lengths: 43/14/24/9 → 14/14/14/14.

**Before:** 比較 k-anonymity 與 differential privacy，下列哪一項較正確？

- A. K-anonymity 限制準識別組合的可辨識性；差分隱私則限制單一個體對查詢輸出的影響
- B. 差分隱私只是在資料中刪除姓名
- C. K-anonymity 可保證抵抗所有背景知識攻擊
- D. 兩者都等同資料加密

**After:** 固定相同鄰接定義與計數查詢，使用 Laplace 機制且敏感度不變。把 ε 從 1 降為 0.5，對噪聲尺度與隱私約束有何影響？

- A. 噪聲尺度加倍，隱私約束更嚴格
- B. 噪聲尺度減半，隱私約束更嚴格
- C. 噪聲尺度不變，隱私約束更寬鬆
- D. 噪聲尺度加倍，隱私約束更寬鬆

**Unique-answer rationale / explanation:** Laplace 機制的尺度為敏感度／ε；敏感度固定時 ε 減半，尺度加倍。較小 ε 對機率比施加更嚴格的隱私約束，通常付出較多噪聲的代價；不能脫離機制與假設直接比較效用。

### Q403 — K-anonymity 與差分隱私

Protected mapping: 中級 / L22 / L22404 / hard; answer index 2 (C).
Length ratio: 2.7447 → 0.9130; lengths: 9/14/43/24 → 23/23/21/23.

**Before:** 某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，為何 k-anonymity 並不能解決所有再識別與敏感屬性推斷問題？

- A. 兩者都等同資料加密
- B. 差分隱私只是在資料中刪除姓名
- C. K-anonymity 限制準識別組合的可辨識性；差分隱私則限制單一個體對查詢輸出的影響
- D. K-anonymity 可保證抵抗所有背景知識攻擊

**After:** 某釋出表達到 5-anonymity，但某個五人準識別群的敏感屬性全是同一值。已知某人屬於該群，仍可能洩漏什麼？

- A. 只能推得該人的敏感值機率為五分之一，無法再提高
- B. 只能推得該人屬於五人之一，敏感屬性仍被完整隱藏
- C. 可推得該人的敏感屬性，即使無法區分五筆身分
- D. 可直接區分五筆各自的身分，因敏感值相同可作連結

**Unique-answer rationale / explanation:** 這是同質性造成的屬性洩漏：無法唯一辨識群內哪一列，仍可能因整群屬性相同而推得敏感值。k-anonymity 並不保證敏感屬性多樣性，也不會憑空揭露表格與背景資料中沒有的資訊。

### Q404 — K-anonymity 與差分隱私

Protected mapping: 中級 / L22 / L22404 / hard; answer index 2 (C).
Length ratio: 2.7447 → 0.8372; lengths: 14/9/43/24 → 15/14/12/14.

**Before:** 某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，公開大數據統計時加入經校準噪聲以取得個體層級保證，最接近？

- A. 差分隱私只是在資料中刪除姓名
- B. 兩者都等同資料加密
- C. K-anonymity 限制準識別組合的可辨識性；差分隱私則限制單一個體對查詢輸出的影響
- D. K-anonymity 可保證抵抗所有背景知識攻擊

**After:** 同一資料集依序發布三個各自滿足 ε＝0.2 的純差分隱私結果。若使用基本循序組合定理，整體 ε 的保證上界是多少？

- A. 0.2，只取其中最大的單次 ε 值
- B. 0.008，將三個單次 ε 相乘
- C. 0.6，將三個單次 ε 相加
- D. 0.0，因每次查詢都加入噪聲

**Unique-answer rationale / explanation:** 基本循序組合提供 ε 總和的上界：0.2＋0.2＋0.2＝0.6。對同一批人的多次發布需累計隱私預算；此上界不一定是所有機制可得到的最緊界，也不是互斥人群的平行組合情境。

### Q405 — K-anonymity 與差分隱私

Protected mapping: 中級 / L22 / L22404 / hard; answer index 3 (D).
Length ratio: 2.7447 → 1.0678; lengths: 24/9/14/43 → 20/19/20/21.

**Before:** 下列何者正確描述兩種常見隱私技術的差異？

- A. K-anonymity 可保證抵抗所有背景知識攻擊
- B. 兩者都等同資料加密
- C. 差分隱私只是在資料中刪除姓名
- D. K-anonymity 限制準識別組合的可辨識性；差分隱私則限制單一個體對查詢輸出的影響

**After:** 系統對每列事件加噪並宣稱「保護每個使用者」，但一位使用者可能貢獻數千列。評估這項宣稱時，應優先確認什麼？

- A. 輸出檔案是否改名，避免保留原始事件的日期
- B. 事件資料是否排序，避免同一人的紀錄相鄰
- C. 查詢介面是否隱藏姓名，避免顯示使用者標籤
- D. 鄰接定義與貢獻界限，是否涵蓋一人的全部紀錄

**Unique-answer rationale / explanation:** 逐列保護不自動等同個體層級保護。需明確定義一人增減所涉及的紀錄，限制或處理個體貢獻並據此校準敏感度與機制；移除姓名、排序或改檔名不能建立所宣稱的差分隱私保證。
