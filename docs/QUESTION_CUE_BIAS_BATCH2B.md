# Issue #47 — Batch 2B cue-bias remediation

## Contract and baseline

- Issue: https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/47; Parent #14.
- Branch: `question/issue-47-batch2b-remediation`.
- Baseline: latest `question/issue-14-remediation` at implementation start, `0cebcdfc7e93f6b9ca581f87b3345f8c23b09f79`. Includes Batch 2A via PR #75.
- Scope: exactly Q334–Q351 and Q388–Q393 (24 items). Only question/options/explanation changed; all other fields, including answer indices, concept, difficulty and sourceType, are preserved.
- All non-scoped questions, non-question DB metadata, and HTML/CSS/application JavaScript outside the DB are unchanged. No official content or storage behavior changes.
- Engineering Agent editorial review is recorded below; independent Technical Review and human gates remain pending. This is not Human Product Verify.

## Reproduction

```powershell
python scripts/audit_question_cues.py --batch batch2b --baseline 0cebcdfc7e93f6b9ca581f87b3345f8c23b09f79 --csv docs/QUESTION_CUE_BIAS_BATCH2B.csv
python scripts/serve_question_batch1a.py --batch batch2b
```

Open `http://127.0.0.1:8766/batch2b`. The existing fixture uses the actual app with a narrowed in-memory question pool, memory storage, automatic exam confirmation and no background PDF prewarming. Batch 1A remains the default; Batch 2A remains available. No dependencies were added.

The CSV includes 483 before and 483 after rows. Length counts Unicode code points excluding whitespace. Option-set comparison ignores order and whitespace. Assertions check scope, count/unique IDs/order, protected fields, mappings, non-question metadata, unchanged app shell, ratios <2 and no repeated modified option sets.

## Whole-bank metrics

| Metric | Before | After |
| --- | ---: | ---: |
| total | 483 | 483 |
| unique_ids | 483 | 483 |
| unique_longest | 419 | 399 |
| ratio_ge_2 | 260 | 236 |
| ratio_ge_3 | 36 | 12 |
| repeated_groups | 99 | 95 |
| repeated_questions | 452 | 428 |

Answer distribution unchanged: A 131 / B 109 / C 122 / D 121. All 24 previously had ratios >=3; maximum after is 1.3171. Four modified correct answers remain uniquely longest, but no item approaches the 2.0 threshold. The four former repeated groups are now 24 option sets, each unique across the bank.

## Item-by-item editorial review

### Q334 — LLM 評測資料集

Protected mapping: 中級 / L21 / L21103 / hard; answer index 0 (A).
Length ratio: 3.0769 → 1.0400; option lengths: 40/10/6/23 → 26/25/25/25.

**Review:** 代表性與風險覆蓋；四項都是取樣／比較方案，解析說明風險加樣應另報而不冒充流量平均。

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，公司要從三個 LLM 中選一個處理客服，如何建立較可靠的內部 benchmark？

- A. 建立代表實際使用情境且可重複的測試集，定義正確性、安全性與任務 KPI，再比較模型
- B. 只挑幾個成功 Demo
- C. 只比較參數量
- D. 只使用供應商公開 benchmark 不做內部驗證

**After:** 客服團隊要比較三個 LLM。正式流量包含常見查詢、少見但高風險的權限要求，以及無法回答的問題。哪個評測資料集設計最能支援選型？

- A. 依實際流量抽樣並補入風險案例，分別報告任務與安全表現
- B. 依實際流量抽樣後排除少見類型，以常見問題平均分選型
- C. 依各模型擅長的客服類型分配題目，以各自平均分作比較
- D. 依公開排行榜的題型配置客服題目，以相同題數維持公平

**Unique-answer rationale / explanation:** 應涵蓋真實任務與重要風險，並分別呈現任務品質和安全表現。少見但高風險的案例不能因頻率低而忽略；各模型使用不同題目會混入難度差異；公開題型比例也未必符合內部流量。額外補入的風險案例應另列結果，避免誤稱為實際流量的平均表現。

### Q335 — LLM 評測資料集

Protected mapping: 中級 / L21 / L21103 / hard; answer index 3 (D).
Length ratio: 3.0769 → 0.9863; option lengths: 6/23/10/40 → 24/25/24/24.

**Review:** 控制模型版本以外的比較條件；記錄設定並重跑量測隨機波動，不宣稱固定設定就能逐字重現。

**Before:** 模型 Demo 看起來很厲害，但團隊無法重現比較結果。最需要建立什麼？

- A. 只比較參數量
- B. 只使用供應商公開 benchmark 不做內部驗證
- C. 只挑幾個成功 Demo
- D. 建立代表實際使用情境且可重複的測試集，定義正確性、安全性與任務 KPI，再比較模型

**After:** 同一客服模型的兩次評測結果差很多。團隊發現測試題、提示模板與生成設定都曾變動。要釐清模型版本本身的差異，最適合怎麼做？

- A. 每版重新抽取一組客服問題，以增加測試情境的涵蓋率
- B. 沿用測試題但各自調整提示，以比較每版可達到的最高分
- C. 固定測試題並只執行一次，以排除重複生成造成的成本
- D. 固定並記錄資料與設定版本，以重複試跑比較分數分布

**Unique-answer rationale / explanation:** 比較模型版本的效果時，應控制測試資料、提示、生成設定及評分規則，並記錄版本。重複試跑可觀察生成隨機性造成的波動，並不保證輸出完全相同。改題或改提示會混入其他因素，單次執行則不足以估計波動。

### Q336 — LLM 評測資料集

Protected mapping: 中級 / L21 / L21103 / hard; answer index 0 (A).
Length ratio: 3.0769 → 1.0000; option lengths: 40/10/6/23 → 24/24/24/24.

**Review:** 防止提示調整對測試集過度適配；三個干擾項都是未保留獨立資訊的資料安排。

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，LLM 選型若只看公開排行榜，可能無法反映企業任務。較好的做法是？

- A. 建立代表實際使用情境且可重複的測試集，定義正確性、安全性與任務 KPI，再比較模型
- B. 只挑幾個成功 Demo
- C. 只比較參數量
- D. 只使用供應商公開 benchmark 不做內部驗證

**After:** 團隊反覆看同一組內部評測題的錯誤，據此調整提示。現在要估計提示定稿後面對新客服問題的品質，哪個資料安排較可靠？

- A. 保留未參與調整的代表性測試集，定稿後再做最終評估
- B. 將已修正的評測題複製成新檔案，定稿後再做最終評估
- C. 從調整提示時看過的題目重抽樣，定稿後再做最終評估
- D. 將歷次模型答對的題目合成題庫，定稿後再做最終評估

**Unique-answer rationale / explanation:** 反覆依同一評測集調整提示，可能對該資料集過度適配。保留未參與開發且具代表性的測試集，才能較可靠地估計新案例品質。複製或重抽已看過的題目未消除資訊使用；只保留答對案例則有選擇偏差。

### Q337 — LLM 評測資料集

Protected mapping: 中級 / L21 / L21103 / hard; answer index 2 (C).
Length ratio: 3.0769 → 0.9868; option lengths: 6/10/40/23 → 26/25/25/25.

**Review:** 對事實、完整性與格式建立規準；干擾項是常見代理指標或評分權重不一致，非無關操作。

**Before:** 某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，摘要模型需要兼顧事實正確、完整與格式，評測集應如何設計？

- A. 只比較參數量
- B. 只挑幾個成功 Demo
- C. 建立代表實際使用情境且可重複的測試集，定義正確性、安全性與任務 KPI，再比較模型
- D. 只使用供應商公開 benchmark 不做內部驗證

**After:** 摘要任務要求事實正確、重要資訊完整且符合指定格式。評測者對同一份摘要的分數分歧很大。哪項改善最能讓這三項要求被一致評分？

- A. 用摘要與參考答案的字詞重疊率，取代三項要求的分項評分
- B. 以摘要長度是否接近參考答案，作為三項要求的共同代理
- C. 為三項要求訂定分項規準與範例，再以共同樣本校準評分
- D. 讓每位評測者自行設定三項權重，再將個別總分直接平均

**Unique-answer rationale / explanation:** 分項規準、正反例與共同樣本校準，可協助評測者對事實、完整性及格式採取一致判準。字詞重疊或長度不足以涵蓋三項品質；各自使用不同權重則難以解釋總分差異。

### Q338 — LLM 評測資料集

Protected mapping: 中級 / L21 / L21103 / hard; answer index 0 (A).
Length ratio: 3.0769 → 1.0000; option lengths: 40/23/10/6 → 25/25/25/25.

**Review:** 回歸評測需保存歷史失敗與預期行為；其餘資產可用於其他目的，卻無法可靠重測舊缺陷。

**Before:** 某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，模型改版後要確認品質沒有 regression，最需要哪種資產？

- A. 建立代表實際使用情境且可重複的測試集，定義正確性、安全性與任務 KPI，再比較模型
- B. 只使用供應商公開 benchmark 不做內部驗證
- C. 只挑幾個成功 Demo
- D. 只比較參數量

**After:** 客服模型改版後，平均分上升，但過去曾修好的權限洩漏案例再次失敗。要及早發現這類品質退步，最應維護哪種評測資產？

- A. 版本化的歷史失敗案例集，搭配預期行為與分項通過門檻
- B. 定期替換的熱門問題樣本，搭配當期流量與總體平均分數
- C. 各版最高分的成功回覆集，搭配示範提示與輸出格式紀錄
- D. 供應商發布的標準測試集，搭配公開分數與模型版本資訊

**Unique-answer rationale / explanation:** 將已知失敗案例與預期安全行為納入可重跑的回歸評測，可檢查舊問題是否復發。熱門樣本、成功展示及公開測試各有用途，但不能代替這些案例。安全門檻宜獨立檢查，避免被總體平均分掩蓋。

### Q339 — LLM 評測資料集

Protected mapping: 中級 / L21 / L21103 / hard; answer index 2 (C).
Length ratio: 3.0769 → 1.0286; option lengths: 23/6/40/10 → 23/23/24/24.

**Review:** 由交換順序造成勝負反轉診斷位置偏差；平衡順序配合人工校準，增加同順序樣本無法消除偏差。

**Before:** 下列哪一項最符合可持續的 LLM Evaluation 流程？

- A. 只使用供應商公開 benchmark 不做內部驗證
- B. 只比較參數量
- C. 建立代表實際使用情境且可重複的測試集，定義正確性、安全性與任務 KPI，再比較模型
- D. 只挑幾個成功 Demo

**After:** 團隊以 LLM 裁判評分客服回答，發現交換兩個候選回答的展示順序後，勝負常隨之改變。哪項評測流程調整最直接處理這個問題？

- A. 固定較新模型的回答在前，讓每次比較採用一致順序
- B. 延長所有候選回答的篇幅，讓裁判取得更多文字線索
- C. 平衡候選回答的展示順序，並抽樣以人工判斷校準裁判
- D. 增加相同展示順序的題數，讓整體平均分更快趨於穩定

**Unique-answer rationale / explanation:** 展示順序影響判斷屬於位置偏差。平衡順序並以人工抽查校準，可檢查和降低此偏差。固定新模型在前或擴增同順序題數仍可能保留系統性偏差；延長回答則改變被評內容，未直接解決順序問題。

### Q340 — Percentile / IQR

Protected mapping: 中級 / L22 / L22101 / medium; answer index 3 (D).
Length ratio: 3.3750 → 1.3171; option lengths: 11/12/9/36 → 12/15/14/18.

**Review:** 限定中央 50% 的離散，唯一對應 IQR；其餘三項均為合理但衡量對象不同的敘述統計。

**Before:** 薪資資料有明顯離群值，團隊希望用較穩健方式描述中間 50% 的分散程度，應用？

- A. IQR=最大值−最小值
- B. 百分位數只能用於類別資料
- C. Q2 一定等於平均數
- D. 百分位數描述相對位置；IQR=Q3−Q1，常用於衡量中間 50% 的離散程度

**After:** 薪資資料呈右偏，且含少數極高薪資。若要描述中間 50% 資料的分散程度，應選哪個統計量？

- A. 全距：最大薪資減最小薪資
- B. 標準差：薪資對平均值的離散程度
- C. 中位數：排序後位居中央的薪資
- D. 四分位距：第三四分位數減第一四分位數

**Unique-answer rationale / explanation:** 四分位距 IQR = Q3 − Q1，描述中央一半資料的跨度。全距依賴兩端極值，標準差反映全體相對平均值的離散，中位數則描述位置而非分散程度。

### Q341 — Percentile / IQR

Protected mapping: 中級 / L22 / L22101 / medium; answer index 1 (B).
Length ratio: 3.3750 → 1.0000; option lengths: 9/36/11/12 → 14/14/14/14.

**Review:** 百分位是群體相對位置；明訂忽略同分及算法細節，排除把百分位誤當答對率、滿分比或反向排名。

**Before:** 某人成績位於第 90 百分位，最合理的解讀是？

- A. Q2 一定等於平均數
- B. 百分位數描述相對位置；IQR=Q3−Q1，常用於衡量中間 50% 的離散程度
- C. IQR=最大值−最小值
- D. 百分位數只能用於類別資料

**After:** 某人成績位於參照群體的第 90 百分位。忽略同分與百分位計算慣例的細微差異，最合理的解讀為何？

- A. 其答對題數約占全部題目的九成
- B. 參照群體約九成的成績不高於他
- C. 其成績約為群體最高分數的九成
- D. 參照群體約九成的成績不低於他

**Unique-answer rationale / explanation:** 百分位描述在參照群體中的相對位置，而非答題正確率或相對最高分的比例。第 90 百分位約表示九成成績不高於該值；同分與計算慣例可能使精確比例略有不同。

### Q342 — Percentile / IQR

Protected mapping: 中級 / L22 / L22101 / medium; answer index 0 (A).
Length ratio: 3.3750 → 0.9767; option lengths: 36/11/12/9 → 14/14/14/15.

**Review:** 已給 Q1/Q3，避免樣本分位數算法歧義；差、和、平均與比值都是可辨別的運算。

**Before:** 某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，Q1=20、Q3=50，則 IQR 為多少，且它主要描述什麼？

- A. 百分位數描述相對位置；IQR=Q3−Q1，常用於衡量中間 50% 的離散程度
- B. IQR=最大值−最小值
- C. 百分位數只能用於類別資料
- D. Q2 一定等於平均數

**After:** 某資料集已算得 Q1 = 20、Q3 = 50。其四分位距 IQR 與意義為何？

- A. 30，表示中央一半資料的跨度
- B. 70，表示中央一半資料的總和
- C. 35，表示全體資料的中位位置
- D. 2.5，表示全體資料的離散倍數

**Unique-answer rationale / explanation:** IQR = Q3 − Q1 = 50 − 20 = 30。Q1 與 Q3 的和、平均或比值均不是 IQR；尤其 (Q1 + Q3)/2 不一定等於中位數。題目已給定四分位數，無須另選樣本分位數算法。

### Q343 — Percentile / IQR

Protected mapping: 中級 / L22 / L22101 / medium; answer index 1 (B).
Length ratio: 3.3750 → 0.9574; option lengths: 9/36/11/12 → 15/15/17/15.

**Review:** 明訂 Q1/Q3 不變；因此全距增加 100 而 IQR 不變，不把穩健性誤寫為完全不受任何資料改動影響。

**Before:** 某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，比較 Range 與 IQR，哪一個較不受極端值影響？

- A. Q2 一定等於平均數
- B. 百分位數描述相對位置；IQR=Q3−Q1，常用於衡量中間 50% 的離散程度
- C. IQR=最大值−最小值
- D. 百分位數只能用於類別資料

**After:** 一組大型資料中，最大值再增加 100，其餘值與排序不變，且計算 Q1、Q3 所用的位置及數值均未改變。全距與 IQR 如何變化？

- A. 全距維持不變，IQR 增加 100
- B. 全距增加 100，IQR 維持不變
- C. 全距增加 100，IQR 也增加 100
- D. 全距維持不變，IQR 也維持不變

**Unique-answer rationale / explanation:** 最大值增加 100、最小值未變，因此全距增加 100。題目明訂 Q1、Q3 均未變，故 IQR 不變。這說明 IQR 不直接依賴最極端值，但不代表任何資料改動都不影響四分位數。

### Q344 — Percentile / IQR

Protected mapping: 中級 / L22 / L22101 / medium; answer index 1 (B).
Length ratio: 3.3750 → 1.0000; option lengths: 11/36/12/9 → 14/14/14/14.

**Review:** 考查四分位數與百分位對應；四個選項均為三個百分位位置，格式相同。

**Before:** 下列關於百分位數與四分位數的敘述何者正確？

- A. IQR=最大值−最小值
- B. 百分位數描述相對位置；IQR=Q3−Q1，常用於衡量中間 50% 的離散程度
- C. 百分位數只能用於類別資料
- D. Q2 一定等於平均數

**After:** 以同一套分位數定義整理連續數值資料時，Q1、Q2、Q3 分別對應哪些百分位？

- A. 第 10、第 50、第 90 百分位
- B. 第 25、第 50、第 75 百分位
- C. 第 20、第 40、第 60 百分位
- D. 第 33、第 50、第 67 百分位

**Unique-answer rationale / explanation:** 三個四分位數分別對應第 25、50、75 百分位，將排序資料分成四個部分；Q2 即中位數。不同樣本分位數算法可能給出不同數值，但不改變這些百分位的對應關係。

### Q345 — Percentile / IQR

Protected mapping: 中級 / L22 / L22101 / medium; answer index 3 (D).
Length ratio: 3.3750 → 1.1111; option lengths: 11/12/9/36 → 8/9/10/10.

**Review:** 題幹明訂 1.5×IQR 界線，獨立驗算為 −10、70；四個選項均是下／上界。解析區分潛在離群與錯誤資料。

**Before:** 某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，箱型圖常使用 Q1、Median、Q3 與 IQR，主要是因為？

- A. IQR=最大值−最小值
- B. 百分位數只能用於類別資料
- C. Q2 一定等於平均數
- D. 百分位數描述相對位置；IQR=Q3−Q1，常用於衡量中間 50% 的離散程度

**After:** 箱型圖以 Q1 − 1.5×IQR、Q3 + 1.5×IQR 作為潛在離群值的下、上界。若 Q1 = 20、Q3 = 40，哪一組界線正確？

- A. 下界 0、上界 60
- B. 下界 10、上界 50
- C. 下界 −30、上界 70
- D. 下界 −10、上界 70

**Unique-answer rationale / explanation:** IQR = 40 − 20 = 20，1.5×IQR = 30，因此下界 20 − 30 = −10，上界 40 + 30 = 70。超出界線的值只是待查核的潛在離群值，不能據此直接判定資料錯誤。

### Q346 — Binomial / Poisson

Protected mapping: 中級 / L22 / L22102 / medium; answer index 1 (B).
Length ratio: 3.2045 → 1.0435; option lengths: 10/47/17/17 → 16/16/15/15.

**Review:** 明訂固定次數、獨立且同機率，以及穩定事件速率；選項均為分布配對，區分成功數、等待次數與時間間隔。

**Before:** 某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，抽查 20 件產品，記錄其中瑕疵品數量；與一小時內客服來電數相比，常見分布選擇分別是？

- A. 兩者都只用於文字資料
- B. Binomial 常描述固定次數獨立試驗中的成功次數；Poisson 常描述固定區間內事件發生次數
- C. Binomial 只能用於無限次試驗
- D. Poisson 專門描述連續常態資料

**After:** 獨立抽查 20 件產品，每件瑕疵機率同為 p；另假設客服來電近似獨立發生且平均速率穩定。瑕疵品數與一小時來電數的典型分布模型分別為何？

- A. 前者為卜瓦松分布，後者為二項分布
- B. 前者為二項分布，後者為卜瓦松分布
- C. 前者為幾何分布，後者為二項分布
- D. 前者為二項分布，後者為指數分布

**Unique-answer rationale / explanation:** 固定 20 次獨立、同成功機率的二元試驗，其成功次數服從二項分布。卜瓦松過程在固定時間內的事件數服從卜瓦松分布；幾何分布描述等待首次成功的試驗次數，指數分布則可描述該過程的事件間隔。

### Q347 — Binomial / Poisson

Protected mapping: 中級 / L22 / L22102 / medium; answer index 0 (A).
Length ratio: 3.2045 → 0.9767; option lengths: 47/17/10/17 → 14/15/15/13.

**Review:** 固定 n=100、p=0.05 且獨立；np=5。其他答案對應單次機率、失敗次數期望與等待首次成功期望。

**Before:** 某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，固定 100 次投放中有幾次點擊，較接近哪種分布？

- A. Binomial 常描述固定次數獨立試驗中的成功次數；Poisson 常描述固定區間內事件發生次數
- B. Binomial 只能用於無限次試驗
- C. 兩者都只用於文字資料
- D. Poisson 專門描述連續常態資料

**After:** 廣告共曝光 100 次，每次是否點擊視為獨立事件，點擊機率固定為 0.05。以二項分布建模時，點擊次數的期望值為何？

- A. 5 次，由 100 × 0.05 計算
- B. 0.05 次，由單次點擊機率計算
- C. 95 次，由 100 × 0.95 計算
- D. 20 次，由 1 ÷ 0.05 計算

**Unique-answer rationale / explanation:** 二項分布的期望值為 np，故為 100×0.05 = 5 次。0.05 是單次成功機率，95 是未點擊次數的期望，20 則是相同條件下等待首次點擊所需試驗次數的期望。

### Q348 — Binomial / Poisson

Protected mapping: 中級 / L22 / L22102 / medium; answer index 1 (B).
Length ratio: 3.2045 → 0.9783; option lengths: 17/47/10/17 → 15/15/15/16.

**Review:** 明訂齊次卜瓦松過程；λ 隨區間長度縮放，4×0.5=2，避免把速率與區間事件期望混淆。

**Before:** 某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，單位時間內伺服器錯誤事件數，若事件近似獨立且平均速率穩定，常以哪種分布近似？

- A. Poisson 專門描述連續常態資料
- B. Binomial 常描述固定次數獨立試驗中的成功次數；Poisson 常描述固定區間內事件發生次數
- C. 兩者都只用於文字資料
- D. Binomial 只能用於無限次試驗

**After:** 伺服器錯誤近似服從每小時平均 4 次的齊次卜瓦松過程。要建立任意連續半小時內錯誤次數的分布，其參數 λ 應設為多少？

- A. λ = 4，沿用每小時的事件平均數
- B. λ = 2，使用半小時的事件平均數
- C. λ = 8，依時間縮短而加倍參數值
- D. λ = 0.5，直接使用半小時的長度

**Unique-answer rationale / explanation:** 卜瓦松計數的 λ 是所選區間內的期望事件數，應將速率乘以區間長度。每小時 4 次乘以 0.5 小時，得到 λ = 2；λ 不是時間長度本身。

### Q349 — Binomial / Poisson

Protected mapping: 中級 / L22 / L22102 / medium; answer index 2 (C).
Length ratio: 3.2045 → 1.1111; option lengths: 17/17/47/10 → 17/18/20/19.

**Review:** 相同期望不同支持範圍；n=10 限制二項上界，λ=2 不是卜瓦松上界。

**Before:** 下列哪一項正確區分 Binomial 與 Poisson？

- A. Binomial 只能用於無限次試驗
- B. Poisson 專門描述連續常態資料
- C. Binomial 常描述固定次數獨立試驗中的成功次數；Poisson 常描述固定區間內事件發生次數
- D. 兩者都只用於文字資料

**After:** 令 X 服從 Binomial(n=10, p=0.2)，Y 服從 Poisson(λ=2)。兩者期望值相同，下列哪項正確比較其可能取值？

- A. X 與 Y 的取值上限都等於各自期望值 2
- B. X 可取任意非負整數，Y 的最大取值為 2
- C. X 的最大取值為 10，Y 沒有有限的取值上限
- D. X 與 Y 的最大取值都等於固定試驗次數 10

**Unique-answer rationale / explanation:** 二項分布的成功次數介於 0 與 n，故 X 最大為 10。卜瓦松分布可取任意非負整數，λ 是期望值而非上限；這是模型的數學支持範圍，不表示極大計數很常見。

### Q350 — Binomial / Poisson

Protected mapping: 中級 / L22 / L22102 / medium; answer index 2 (C).
Length ratio: 3.2045 → 1.0435; option lengths: 10/17/47/17 → 22/23/24/24.

**Review:** 群聚與時變速率要求重估模型假設；不把所有計數資料直接視為固定 λ 的卜瓦松。三個干擾項為不足的處理方案。

**Before:** 某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，某路口每分鐘事故通報數是計數型隨機變數，若符合常見假設，可考慮？

- A. 兩者都只用於文字資料
- B. Binomial 只能用於無限次試驗
- C. Binomial 常描述固定次數獨立試驗中的成功次數；Poisson 常描述固定區間內事件發生次數
- D. Poisson 專門描述連續常態資料

**After:** 某路口的通報數原擬採用單一固定 λ 的卜瓦松分布。資料顯示事件常成群出現，且尖峰與離峰速率差異很大。最合理的下一步是？

- A. 將整日計數合併求平均，再以單一 λ 取代分時差異
- B. 先把每次成群事件合成一次，再沿用原本的計數定義
- C. 檢查群聚與速率變化，再評估分時模型或其他計數分布
- D. 改以固定樣本數的二項分布，並略過事件相依性的檢查

**Unique-answer rationale / explanation:** 事件群聚與明顯時變速率，提示簡單齊次卜瓦松模型的假設可能不適合。應檢查原因，考慮分時速率或能處理額外變異的計數模型。合併平均、改變事件定義或直接換分布，都不能取代假設檢查。

### Q351 — Binomial / Poisson

Protected mapping: 中級 / L22 / L22102 / medium; answer index 2 (C).
Length ratio: 3.2045 → 1.0169; option lengths: 17/17/47/10 → 21/18/20/20.

**Review:** 獨立固定 p 的恰一成功計算；組合數 10 與互斥事件加總得到 0.3874，排除至少一件及九件的混淆。

**Before:** 某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，固定 n 次伯努利試驗的成功次數，其典型分布是？

- A. Poisson 專門描述連續常態資料
- B. Binomial 只能用於無限次試驗
- C. Binomial 常描述固定次數獨立試驗中的成功次數；Poisson 常描述固定區間內事件發生次數
- D. 兩者都只用於文字資料

**After:** 抽驗 10 件產品，假設各件是否瑕疵相互獨立且瑕疵機率固定為 0.1。以二項分布計算「恰有 1 件瑕疵」的機率，哪個式子正確？

- A. 0.1 × 0.9⁹，只計一個固定位置出現瑕疵
- B. 1 − 0.9¹⁰，計算至少出現一件瑕疵
- C. 10 × 0.1 × 0.9⁹，加總十種瑕疵位置
- D. 10 × 0.9 × 0.1⁹，加總十種良品位置

**Unique-answer rationale / explanation:** 恰有一件瑕疵包含十個互斥的位置安排，每種機率為 0.1×0.9⁹，故總機率為 10×0.1×0.9⁹，約 0.3874。未乘 10 只算單一位置；1−0.9¹⁰ 是至少一件；最後一式是恰有九件瑕疵。

### Q388 — 時間序列切分

Protected mapping: 中級 / L22 / L22302 / hard; answer index 3 (D).
Length ratio: 3.3830 → 1.0633; option lengths: 16/10/21/53 → 24/28/27/28.

**Review:** 先訓練、再選型、最後未參與選型的未來測試；各選項都是具體資料安排。明訂特徵當時可得以聚焦切分。

**Before:** 某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，預測明日銷量時，若將 2026 年資料隨機打散到 train/test，最主要的風險是？

- A. 測試資料可以早於訓練資料且不影響
- B. 所有時間特徵都應刪除
- C. 應隨機打散全部日期再做 K-fold 才最公平
- D. 時間序列驗證應尊重時間順序，使用 rolling/forward validation，避免未來資料洩漏到過去

**After:** 零售團隊用一年資料開發隔日銷量模型，需選超參數並保留一次未參與選型的未來表現評估。假設各日期的特徵都在預測當時可得，哪個方案最合適？

- A. 隨機抽六成日期訓練、兩成選型，剩下兩成作最終測試
- B. 以 1–6 月訓練、10–12 月選型，再以 7–9 月作最終測試
- C. 以 1–6 月訓練、7–9 月選型，再以該選型分數作最終評估
- D. 以 1–6 月訓練、7–9 月選型，再以 10–12 月作最終測試

**Unique-answer rationale / explanation:** 訓練、選型與最終測試依時間向前安排，且不以最終測試資料決定設定，較符合用過去預測未來的目的。隨機切分可能用到較晚資料；先以 10–12 月選型再測 7–9 月引入較晚資訊；將選型分數當最終表現則缺少未參與選型的評估。

### Q389 — 時間序列切分

Protected mapping: 中級 / L22 / L22302 / hard; answer index 3 (D).
Length ratio: 3.3830 → 1.0000; option lengths: 10/21/16/53 → 16/16/16/16.

**Review:** 明訂 expanding window 與每月底取得結果；保留起點並新增 7 月。固定長度、反向或改預測距離均不符合。

**Before:** 時間序列模型要模擬真實上線情境，交叉驗證應如何切分？

- A. 所有時間特徵都應刪除
- B. 應隨機打散全部日期再做 K-fold 才最公平
- C. 測試資料可以早於訓練資料且不影響
- D. 時間序列驗證應尊重時間順序，使用 rolling/forward validation，避免未來資料洩漏到過去

**After:** 月資料的預測目標是下一個月，且每月結束後才取得當月結果。用 expanding-window 驗證時，第一折以 1–6 月訓練、7 月驗證；下一折應如何安排？

- A. 以 2–7 月訓練，再以 8 月資料驗證
- B. 以 1–8 月訓練，再以 7 月資料驗證
- C. 以 1–6 月訓練，再以 8 月資料驗證
- D. 以 1–7 月訓練，再以 8 月資料驗證

**Unique-answer rationale / explanation:** Expanding window 保留原訓練資料，向前推進時加入新近已取得的月份，因此下一折為 1–7 月訓練、8 月驗證。2–7 月屬固定長度滑動窗口；用到 8 月再驗證 7 月洩漏未來；固定 1–6 月則未擴展且改變預測距離。

### Q390 — 時間序列切分

Protected mapping: 中級 / L22 / L22302 / hard; answer index 1 (B).
Length ratio: 3.3830 → 1.0000; option lengths: 21/53/10/16 → 16/16/16/16.

**Review:** 明訂最近六個月、緊接一月驗證；窗口應移至 2–7 月，不把 expanding 與 rolling 混為同一安排。

**Before:** 某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，下列哪一項最符合 walk-forward validation？

- A. 應隨機打散全部日期再做 K-fold 才最公平
- B. 時間序列驗證應尊重時間順序，使用 rolling/forward validation，避免未來資料洩漏到過去
- C. 所有時間特徵都應刪除
- D. 測試資料可以早於訓練資料且不影響

**After:** 需求分布近期變動，團隊決定每次只用最近 6 個月資料訓練，再驗證緊接的 1 個月。首折為 1–6 月訓練、7 月驗證，下一折應如何切分？

- A. 以 1–7 月訓練，再以 8 月資料驗證
- B. 以 2–7 月訓練，再以 8 月資料驗證
- C. 以 2–8 月訓練，再以 7 月資料驗證
- D. 以 1–6 月訓練，再以 9 月資料驗證

**Unique-answer rationale / explanation:** 固定長度 rolling window 向後移動一個月時，移除 1 月並加入已取得的 7 月，以 2–7 月訓練、8 月驗證。1–7 月增加窗口長度；用到 8 月驗證 7 月違反時間順序；跳到 9 月也不符合緊接一個月的要求。

### Q391 — 時間序列切分

Protected mapping: 中級 / L22 / L22302 / hard; answer index 2 (C).
Length ratio: 3.3830 → 1.0154; option lengths: 10/21/53/16 → 22/21/22/22.

**Review:** 時間順序切分仍可能經前處理洩漏；只用每折訓練期擬合，原樣套用驗證期。

**Before:** 某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，需求預測模型若使用未來月份的統計資訊處理過去資料，會造成什麼？

- A. 所有時間特徵都應刪除
- B. 應隨機打散全部日期再做 K-fold 才最公平
- C. 時間序列驗證應尊重時間順序，使用 rolling/forward validation，避免未來資料洩漏到過去
- D. 測試資料可以早於訓練資料且不影響

**After:** 團隊以 1–6 月訓練、7 月驗證，但先用 1–12 月資料估計缺失值插補的平均數。要模擬 6 月底可建立的模型，應如何修正？

- A. 分別以 1–6 月及 7 月均值，處理訓練與驗證資料
- B. 以 1–7 月均值統一插補，排除更晚月份的資訊
- C. 以 1–6 月估計插補參數，再原樣套用於 7 月資料
- D. 以 7–12 月估計插補參數，再統一套用所有月份

**Unique-answer rationale / explanation:** 在該驗證折，插補等前處理參數應只從訓練期間估計，再套用於驗證資料。用全年、截至驗證月底或驗證期自身的統計量，都使用了 6 月底尚不可得的分布資訊；後續折應各自重新擬合前處理。

### Q392 — 時間序列切分

Protected mapping: 中級 / L22 / L22302 / hard; answer index 2 (C).
Length ratio: 3.3830 → 1.0746; option lengths: 21/16/53/10 → 21/22/24/24.

**Review:** 五日標籤會跨越原點切分邊界；按可得時間剔除或間隔，未硬定所有資料都適用的 gap 天數。

**Before:** 金融時間序列驗證為何通常不直接使用一般隨機 K-fold？

- A. 應隨機打散全部日期再做 K-fold 才最公平
- B. 測試資料可以早於訓練資料且不影響
- C. 時間序列驗證應尊重時間順序，使用 rolling/forward validation，避免未來資料洩漏到過去
- D. 所有時間特徵都應刪除

**After:** 金融模型在每日 t 收盤時預測接下來 5 個交易日的累積報酬。驗證從第 101 日開始，訓練原點到第 100 日；其中部分訓練標籤要到驗證期才完整。應如何避免此處的洩漏？

- A. 保留全部訓練原點，只將驗證日期改為隨機抽樣
- B. 保留全部訓練原點，只移除輸入特徵中的日期欄位
- C. 依標籤涵蓋區間剔除邊界樣本，確保訓練標籤當時已知
- D. 依訓練原點先後排序樣本，仍使用完整的未來報酬標籤

**Unique-answer rationale / explanation:** 僅依原點切分不足以保證標籤可用。多日報酬標籤可能跨入驗證期，應依實際預測截止時間及標籤涵蓋區間，剔除邊界樣本或設適當間隔。隨機抽樣、刪日期欄或排序都無法使未來標籤提前可得。

### Q393 — 時間序列切分

Protected mapping: 中級 / L22 / L22302 / hard; answer index 3 (D).
Length ratio: 3.3830 → 1.0678; option lengths: 10/21/16/53 → 19/20/20/21.

**Review:** 每天開始預測當日，明確要求特徵只含 t−7 到 t−1；四個選項均為七日／週平均窗口。

**Before:** 某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，以歷史 1–6 月訓練、7 月驗證，再逐步向後滾動，這種方式較接近？

- A. 所有時間特徵都應刪除
- B. 應隨機打散全部日期再做 K-fold 才最公平
- C. 測試資料可以早於訓練資料且不影響
- D. 時間序列驗證應尊重時間順序，使用 rolling/forward validation，避免未來資料洩漏到過去

**After:** 零售模型在每天開始時預測當日銷量，以過去 7 天的銷量平均作為特徵。資料已依日期切分，以下哪種特徵計算最符合驗證時的資訊可得性？

- A. 用當日及前 6 天的實際銷量，計算七日平均
- B. 用前 3 天至後 3 天的實際銷量，計算七日平均
- C. 用當日所在週全部的實際銷量，計算該週平均
- D. 用前 7 天且不含當日的實際銷量，計算七日平均

**Unique-answer rationale / explanation:** 當日開始時尚無當日或未來的實際銷量，應使用 t−7 到 t−1 的歷史資料。含當日、置中窗口或整週平均都可能洩漏預測時未知的資訊；依日期切分後仍需檢查特徵計算的時間邊界。

## Reference checks

Consulted 2026-09-24 for conceptual verification; these are not official iPAS question sources.
- [Anthropic evaluation engineering](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): representative evaluations, regression cases, grading and calibration.
- [NIST location measures](https://www.itl.nist.gov/div898/handbook/eda/section3/eda351.htm) and [distribution functions](https://www.itl.nist.gov/div898/handbook/eda/section3/eda362.htm): location, ranks and quantiles.
- [NIST outlier detection](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h.htm): potential outlier labeling does not automatically establish erroneous data.
- [NIST Binomial](https://www.itl.nist.gov/div898/handbook/eda/section3/eda366i.htm) and [Poisson](https://www.itl.nist.gov/div898/handbook/eda/section3/eda366j.htm): distributions, support and expectations.
- [scikit-learn TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html) and [data leakage](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage): time order and train-only preprocessing.

## QA evidence

- Scoped baseline audit: PASS. Exactly 24 changed IDs; 483 unique IDs; protected metadata/answers/source labels and application shell unchanged.
- Actual inline JS parsed using Node v24.19.0 `vm.Script`: PASS. Both Python scripts compiled without writing bytecode: PASS.
- Historical validation with extended audit: Batch 1A `119b1ce^ → 119b1ce`, Batch 2A `952c878 → 0cebcdf`: PASS. Default Batch 1A and existing Batch 2A paths preserved.
- Numerical answers independently recomputed in Python: Q342 50−20=30; Q345 bounds (−10,70); Q347 np=5; Q348 λ=2; Q351 10×0.1×0.9⁹≈0.3874: PASS.
- In-app browser, fixture at 375×812: all 24 Practice items answered correctly (24/24, 100%), then a wrong choice per item (0/24, 0%). Correct/incorrect feedback, answer letter, explanations and next/finish navigation verified. No horizontal overflow in all 48 answered states.
- Wrong-question panel showed 24 items; weak-area panel showed four topics, each 0/6 after the wrong-answer pass.
- Fixture at 1440×900: L21 Mock 6/6 and L22 Mock 18/18, both 100 and review opened. No question-state overflow; console error log empty.
- Mobile L21 Mock screenshot inspected: longer stem and options wrap normally; usable controls.
- Unfiltered app at `http://127.0.0.1:8767/`: shows 483 questions; all seven panels open. Six non-home panels checked at 375px with no horizontal overflow. Practice start/answer/explanation/next PASS.
- Unfiltered 50-question Mock: one correct answer, 49 blank, score 2; submission result and review verified, no mobile review overflow. Browser submit interaction reported an error but immediately subsequent state showed completed submission; native confirmation interaction was not independently observed.
- Official flow: cached 115 second-session L11 opened with 50 questions and official labeling; external PDF ingestion not retested. Unfiltered console error log empty.
- Temporary viewport override reset. `git diff --check`: PASS.

## Limitations / follow-up

- Editorial/heuristic validation is not psychometric evidence. Difficulty labels are preserved; learner discrimination and difficulty require subsequent data and independent human review.
- Remaining whole-bank candidates: 236 at >=2x (12 at >=3x), 95 repeated groups; subsequent batches remain scoped separately.
- Deterministic fixture does not validate persistent storage, full-bank sampling or native dialogs. Unfiltered checks provide limited end-to-end coverage. Physical mobile Safari/accessibility and integrated Dev Preview Product Verify remain separate follow-up.
- The required epic baseline intentionally excludes newer dev changes; parent #14 governs future synchronization.
- No PR, merge, Issue closure, Product Verify declaration or release is part of this handoff.
