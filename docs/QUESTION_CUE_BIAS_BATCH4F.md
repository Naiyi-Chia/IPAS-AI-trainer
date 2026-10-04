# Issue #64 — Batch 4F remediation evidence

Baseline: `32295af` on `question/issue-14-remediation` (includes #63).

## Validation

| Whole-bank metric | Before | After |
| --- | ---: | ---: |
| Self-authored questions / unique IDs | 483 / 483 | 483 / 483 |
| Uniquely longest correct option | 88 | 64 |
| Correct / average distractor length >= 2x | 0 | 0 |
| Repeated option-set groups | 18 | 14 |
| Questions in repeated option sets | 72 | 48 |

- Scoped audit PASS: exactly Q382–Q387, Q406–Q411, Q436–Q441 and Q460–Q465 changed. ID order, answer indices, protected metadata, DB metadata and HTML/CSS/JS outside DB unchanged.
- All 24 items have no unique-longest correct option and no repeated option set anywhere in the bank. Maximum length ratio: 1.03125x.
- Answer distribution unchanged: A 131 / B 109 / C 122 / D 121.
- Individual manual content review PASS for all 24; each after-explanation identifies the single correct answer and excludes alternatives. No protected-metadata or content-error exceptions required.
- Exactly-once / idempotency: explicitly covers stable keys, atomic DB deduplication and updates, persistence through restarts, external-sink boundaries and repeated effects rather than a promise of no redelivery.
- Conditional probability: checks conditional denominators, direction, joint/conditional identity and independence with positive conditioning probabilities. Q406 specifies a total population larger than its paid subgroup to keep distractor denominators distinct. Numeric checks: 30/200=0.15; 0.12/0.30=0.40; independence gives 0.20; 20/100=0.20.
- Gradient boosting: distinguishes sequential loss-driven updates from independent ensembles; residual fitting is specified for squared error. Numeric checks: 10−7=3; 7+0.1×3=7.3. Learning rate scales new-tree contributions.
- Stratified CV: preserves original proportions, not 50/50 balancing; samples are disjoint within each split. Minority-count and grouped-customer limitations are explicit. Numeric check: 100 positive samples / 5 folds = 20 per fold.
- Inline JavaScript syntax PASS: one script compiled using Node vm.Script.
- Headless Edge browser QA PASS at 1280×900 and 375×900: all 24 scoped items render and score in Practice and Mock. Intentional Practice error recorded and removed after correct retry; L22203 weak-area result 5/6 (83%).
- Mock scores: L22 5/6 (83%), L23 17/18 (94%), with one intentional wrong answer each; native submit confirmations and wrong-answer review verified.
- Official 115-year second-paper flow and seven tabs PASS. No document horizontal overflow, page/console warnings/errors or HTTP errors.
- Browser fixture filters only self-authored DB to the 24 scoped records for coverage; app logic/assets/official loader unchanged. Fresh profiles preserve existing user progress.
- Representative mobile Practice screenshot visually checked: readable options, explanation and navigation.
- git diff --check: PASS.

Technical references checked: [Apache Kafka design](https://kafka.apache.org/41/design/design/) for external-output/consumer-position coordination; [scikit-learn gradient boosting](https://scikit-learn.org/stable/modules/ensemble.html) for loss-gradient and additive learning; [StratifiedKFold documentation](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedKFold.html) for class-proportion preservation. Retrieved 2026-10-04. These support self-authored questions, not official iPAS past-paper attribution.

Reproduce:

```text
python scripts/audit_question_cues.py --baseline 32295af --batch batch4f --csv docs/QUESTION_CUE_BIAS_BATCH4F.csv
NODE_PATH=<existing runtime node_modules> node scripts/test_question_batch4f.cjs <output-directory>
```

Evidence: [audit CSV](QUESTION_CUE_BIAS_BATCH4F.csv), [browser results](QUESTION_CUE_BIAS_BATCH4F_BROWSER.json), [mobile Practice](qa/issue-64/practice-Q406-375.png), [mobile Mock review](qa/issue-64/mock-L23-375.png).

Limitations: metrics are heuristics and do not certify content quality. Independent Technical Review remains pending before PR creation. No integration, Product Verify or production verification claimed.

## Per-item manual review (before / after)

### Q382 — key C

**Before**

付款事件因 consumer 重試被處理兩次，造成重複扣款。資料管線最需要什麼設計？

- A. 只要使用 Kafka 就天然保證所有外部系統 exactly-once
- B. 將 consumer 關掉即可消除重複事件
- C. 串流系統需用 checkpoint、去重與冪等寫入等方式降低重複處理造成的副作用
- D. 重複訊息不會影響任何聚合結果

Explanation: 分散式串流可能重試或重送。端到端 exactly-once 往往需要來源、處理與 sink 協同，冪等操作是重要手段。

**After**

付款 API 支援冪等鍵。同一付款事件因 consumer 重試可能執行兩次，如何避免重複扣款？

- A. 每次重試產生新的請求鍵，讓 API 分別記錄每次扣款
- B. 每次重試增加請求間隔，讓 API 有時間完成前次扣款
- C. 同一付款沿用相同冪等鍵，讓 API 辨識已完成的扣款
- D. 同一付款更換 consumer，讓不同程序各自完成扣款

Explanation: 同一付款的重試應沿用穩定冪等鍵，由支援此機制的付款 API 辨識並返回既有結果。新鍵、延後重試或換程序不會消除重複扣款風險。

### Q383 — key C

**Before**

某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，串流系統遇到網路失敗後會重送訊息，如何降低重複寫入外部 DB 的風險？

- A. 將 consumer 關掉即可消除重複事件
- B. 只要使用 Kafka 就天然保證所有外部系統 exactly-once
- C. 串流系統需用 checkpoint、去重與冪等寫入等方式降低重複處理造成的副作用
- D. 重複訊息不會影響任何聚合結果

Explanation: 分散式串流可能重試或重送。端到端 exactly-once 往往需要來源、處理與 sink 協同，冪等操作是重要手段。

**After**

事件重送可能重複增加 DB 餘額。若 DB 支援交易與事件 ID 唯一約束，哪種處理能避免重複加值？

- A. 先增加餘額再另存事件 ID，兩者各自提交成功
- B. 先查事件 ID 再增加餘額，兩者不使用交易協調
- C. 同一交易新增事件 ID 並加值，遇重複鍵便不加值
- D. 在每次重送時建立新的 ID，再依新 ID 增加餘額

Explanation: 將事件 ID 的唯一約束與餘額更新放在同一交易中，使去重紀錄和加值一起提交或回滾。分開提交會留下失敗空窗，無交易的先查再寫還有並行競爭風險。

### Q384 — key C

**Before**

下列哪一項最符合 distributed streaming 的冪等設計？

- A. 只要使用 Kafka 就天然保證所有外部系統 exactly-once
- B. 將 consumer 關掉即可消除重複事件
- C. 串流系統需用 checkpoint、去重與冪等寫入等方式降低重複處理造成的副作用
- D. 重複訊息不會影響任何聚合結果

Explanation: 分散式串流可能重試或重送。端到端 exactly-once 往往需要來源、處理與 sink 協同，冪等操作是重要手段。

**After**

資料管線可能重放同一事件。哪種寫入操作在相同輸入下重複執行，最符合冪等性？

- A. 將帳戶累計值加上本次事件的金額
- B. 向明細表新增一筆隨機 ID 的資料
- C. 以相同事件鍵設定同一筆完整紀錄
- D. 將通知計數器加上一次處理的次數

Explanation: 以相同鍵寫入相同紀錄，重做後最終狀態不再改變，符合冪等性。累加、產生新 ID 的新增或增加計數都會隨重做而改變結果；此處假設寫入不另觸發非冪等副作用。

### Q385 — key A

**Before**

所謂 exactly-once 語意為何不能只看訊息 broker 一個元件？

- A. 串流系統需用 checkpoint、去重與冪等寫入等方式降低重複處理造成的副作用
- B. 重複訊息不會影響任何聚合結果
- C. 將 consumer 關掉即可消除重複事件
- D. 只要使用 Kafka 就天然保證所有外部系統 exactly-once

Explanation: 分散式串流可能重試或重送。端到端 exactly-once 往往需要來源、處理與 sink 協同，冪等操作是重要手段。

**After**

Kafka 管線將處理結果寫入外部 DB。要評估端到端 exactly-once，為何不能只檢查 broker 的設定？

- A. 還需檢查消費進度與 DB 寫入的協調及失敗恢復
- B. 還需檢查訊息壓縮比，依壓縮結果判斷交易完成
- C. 還需檢查訊息保留期，依保留天數判斷寫入成功
- D. 還需檢查分區數量，依分區數量判斷是否重複扣款

Explanation: 外部 DB 的結果提交與消費進度需協調，否則失敗恢復可能重做或漏做。Kafka 內部的保證不會自動涵蓋任意外部副作用；壓縮、保留期及分區數不能替代此檢查。

### Q386 — key A

**Before**

某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，訂單聚合服務重啟後重放部分事件，結果被重複加總。應優先加入？

- A. 串流系統需用 checkpoint、去重與冪等寫入等方式降低重複處理造成的副作用
- B. 重複訊息不會影響任何聚合結果
- C. 只要使用 Kafka 就天然保證所有外部系統 exactly-once
- D. 將 consumer 關掉即可消除重複事件

Explanation: 分散式串流可能重試或重送。端到端 exactly-once 往往需要來源、處理與 sink 協同，冪等操作是重要手段。

**After**

訂單聚合服務把 DB 金額加總成功後，尚未提交消費進度就當機。重啟後同一事件再來一次，應如何設計？

- A. 持久化去重事件鍵，並與加總在同一交易提交
- B. 把去重事件鍵放在記憶體，重啟時重新建立集合
- C. 依事件到達的時間排序，再對所有事件重新加總
- D. 每次重啟改用新的聚合鍵，再對重送事件進行加總

Explanation: 可恢復的去重紀錄要持久化，且與加總更新原子提交，才能在重啟後辨識已套用事件。記憶體集合會遺失，排序或換鍵不會消除重複加總。

### Q387 — key D

**Before**

某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，在事件驅動資料管線中，idempotent sink 的價值是？

- A. 將 consumer 關掉即可消除重複事件
- B. 重複訊息不會影響任何聚合結果
- C. 只要使用 Kafka 就天然保證所有外部系統 exactly-once
- D. 串流系統需用 checkpoint、去重與冪等寫入等方式降低重複處理造成的副作用

Explanation: 分散式串流可能重試或重送。端到端 exactly-once 往往需要來源、處理與 sink 協同，冪等操作是重要手段。

**After**

具冪等寫入能力的 sink 接收相同事件多次。在冪等鍵與有效範圍一致的前提下，它最直接提供何種價值？

- A. 讓來源免於重送，降低訊息在網路上出現的次數
- B. 讓來源依次送達，維持不同事件的原始時間順序
- C. 讓事件自動校正，修復不同事件中的錯誤欄位
- D. 讓重複套用不改變結果，降低重試的重複副作用

Explanation: 冪等 sink 著重同一操作重做後的效果，不能阻止來源重送、保證不同事件順序或修正內容。仍需管理冪等鍵、保存範圍與其他端到端條件。

### Q406 — key A

**Before**

已知使用者來自付費方案後，再計算其流失機率，數學上最接近？

- A. 條件機率 P(A|B) 表示已知 B 發生時 A 發生的機率
- B. 條件機率只適用常態分布
- C. P(A|B) 永遠等於 P(B|A)
- D. 若 A、B 獨立則 P(A|B)=0

Explanation: 條件機率描述在已知條件下事件的機率；若 A、B 獨立，則 P(A|B)=P(A)。

**After**

平台共有 1,000 位使用者，其中 200 人屬於付費方案，這 200 人中有 30 人流失。以這組頻數估計 P(流失｜付費)，應計算哪個比例？

- A. 30／200，以付費使用者為分母
- B. 200／30，以流失付費者為分母
- C. 30／全體人數，以全部使用者為分母
- D. 200／全體人數，以全部使用者為分母

Explanation: 條件為付費方案，分母應限制在 200 位付費使用者；其中 30 位流失，條件機率估計為 0.15。全體分母得到不同的機率。

### Q407 — key A

**Before**

P(詐欺｜海外交易) 的意義是？

- A. 條件機率 P(A|B) 表示已知 B 發生時 A 發生的機率
- B. 若 A、B 獨立則 P(A|B)=0
- C. 條件機率只適用常態分布
- D. P(A|B) 永遠等於 P(B|A)

Explanation: 條件機率描述在已知條件下事件的機率；若 A、B 獨立，則 P(A|B)=P(A)。

**After**

A 表示詐欺、B 表示海外交易，且 P(B)>0。P(A｜B) 表示哪個方向的機率？

- A. 已知交易是海外交易後，該交易為詐欺的機率
- B. 已知交易已被判為詐欺後，該交易為海外的機率
- C. 隨機選到一筆交易後，該交易同時為海外及詐欺的機率
- D. 隨機選到一筆交易後，該交易為海外或詐欺的機率

Explanation: P(A｜B) 以 B 為已知條件，詢問 A 的機率。反向條件機率、聯合機率與聯集機率回答的是不同問題。

### Q408 — key D

**Before**

某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，下列哪一項正確描述 Conditional Probability？

- A. 若 A、B 獨立則 P(A|B)=0
- B. 條件機率只適用常態分布
- C. P(A|B) 永遠等於 P(B|A)
- D. 條件機率 P(A|B) 表示已知 B 發生時 A 發生的機率

Explanation: 條件機率描述在已知條件下事件的機率；若 A、B 獨立，則 P(A|B)=P(A)。

**After**

已知 P(A∩B)=0.12、P(B)=0.30。依條件機率定義，P(A｜B) 為何？

- A. 0.036，將聯合機率乘上條件事件機率
- B. 0.18，將條件事件機率減去聯合機率
- C. 0.42，將條件事件機率加上聯合機率
- D. 0.40，將聯合機率除以條件事件機率

Explanation: P(A｜B)=P(A∩B)/P(B)=0.12/0.30=0.40，前提是 P(B)>0。乘法、加法或相減都不符合此定義。

### Q409 — key A

**Before**

某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，如果 A 與 B 獨立，P(A|B) 與 P(A) 的關係是？

- A. 條件機率 P(A|B) 表示已知 B 發生時 A 發生的機率
- B. P(A|B) 永遠等於 P(B|A)
- C. 條件機率只適用常態分布
- D. 若 A、B 獨立則 P(A|B)=0

Explanation: 條件機率描述在已知條件下事件的機率；若 A、B 獨立，則 P(A|B)=P(A)。

**After**

A 與 B 獨立，P(A)=0.20、P(B)=0.50。已知 B 發生後，P(A｜B) 為何？

- A. 0.20，獨立使條件機率等於 A 的邊際機率
- B. 0.10，獨立使條件機率等於兩機率的乘積
- C. 0.50，獨立使條件機率等於 B 的邊際機率
- D. 0.40，獨立使條件機率等於兩機率的比值

Explanation: 獨立且 P(B)>0 時，P(A｜B)=P(A)=0.20。0.10 是聯合機率，並非條件機率；條件機率也不等於條件事件本身的機率。

### Q410 — key D

**Before**

某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，醫療模型中「已知檢測陽性後實際患病的機率」屬於哪種機率概念？

- A. 若 A、B 獨立則 P(A|B)=0
- B. 條件機率只適用常態分布
- C. P(A|B) 永遠等於 P(B|A)
- D. 條件機率 P(A|B) 表示已知 B 發生時 A 發生的機率

Explanation: 條件機率描述在已知條件下事件的機率；若 A、B 獨立，則 P(A|B)=P(A)。

**After**

檢測評估資料中，100 人為陽性，其中 20 人實際患病。以這組頻數估計「陽性後實際患病」的機率，應計算？

- A. 20／實際患病總人數，估計患病後陽性的機率
- B. 100／全體受測人數，估計受測後陽性的機率
- C. 20／全體受測人數，估計同時陽性及患病的機率
- D. 20／100，以陽性者為分母估計其患病機率

Explanation: 詢問已知陽性後患病，分母是陽性者的 100 人，因此估計為 20%。以實際患病者為分母則是反向條件機率；此題為抽樣資料的機率估計，不是個人診斷。

### Q411 — key A

**Before**

某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，條件機率與聯合機率的核心差異是？

- A. 條件機率 P(A|B) 表示已知 B 發生時 A 發生的機率
- B. P(A|B) 永遠等於 P(B|A)
- C. 若 A、B 獨立則 P(A|B)=0
- D. 條件機率只適用常態分布

Explanation: 條件機率描述在已知條件下事件的機率；若 A、B 獨立，則 P(A|B)=P(A)。

**After**

若 P(B)>0，下列哪個關係式正確連結聯合機率與條件機率？

- A. P(A∩B)=P(A｜B)×P(B)
- B. P(A∩B)=P(A｜B)×P(A)
- C. P(A∩B)=P(A｜B)／P(B)
- D. P(A∩B)=P(A｜B)＋P(B)

Explanation: 將 P(A｜B)=P(A∩B)/P(B) 移項，可得 P(A∩B)=P(A｜B)P(B)。此關係不要求 A、B 獨立，分母及乘回的項應是條件事件 B。

### Q436 — key B

**Before**

XGBoost、LightGBM 類模型的核心集成思想較接近？

- A. 每棵樹完全獨立且同時訓練再平均就是 Gradient Boosting
- B. Gradient Boosting 依序建立弱學習器，讓後續模型著重修正前面模型的殘差／錯誤
- C. Boosting 的目的是隨機刪除所有難樣本
- D. Gradient Boosting 只能處理影像

Explanation: Boosting 與 Bagging 不同：Boosting 通常序列式學習，逐步修正誤差；Random Forest 更接近 Bagging。

**After**

典型梯度提升樹每輪新增一棵樹。新樹的學習目標與目前集成模型有何關係？

- A. 各輪重複學習原始標籤，再對獨立模型取平均
- B. 各輪依目前損失的梯度，學習改善預測的方向
- C. 各輪重新訓練獨立模型，再以模型間投票決定輸出
- D. 各輪選出單棵最佳的樹，再以該樹取代全部集成

Explanation: 梯度提升逐輪依當前模型損失的負梯度方向擬合新學習器。平方誤差時此目標對應殘差；獨立訓練後平均、投票或挑選單棵樹都不同於這種逐輪修正。

### Q437 — key C

**Before**

某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，比較 Random Forest 與 Gradient Boosting，下列哪個描述較正確？

- A. 每棵樹完全獨立且同時訓練再平均就是 Gradient Boosting
- B. Gradient Boosting 只能處理影像
- C. Gradient Boosting 依序建立弱學習器，讓後續模型著重修正前面模型的殘差／錯誤
- D. Boosting 的目的是隨機刪除所有難樣本

Explanation: Boosting 與 Bagging 不同：Boosting 通常序列式學習，逐步修正誤差；Random Forest 更接近 Bagging。

**After**

比較典型 Random Forest 與 Gradient Boosting 的樹訓練關係，哪項描述正確？

- A. 兩者的新樹都先修正前輪殘差，再把所有樹取平均
- B. 兩者的新樹都獨立學習原始標籤，再把所有樹相加
- C. 前者各樹可獨立訓練；後者新樹依集成結果學習
- D. 前者新樹依前輪結果；後者各樹可獨立平行訓練

Explanation: Random Forest 各樹通常在重抽樣及隨機特徵下獨立訓練，再平均或投票。Gradient Boosting 的新增學習器依賴目前集成預測的損失資訊。

### Q438 — key A

**Before**

某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，後一棵樹特別針對前面模型殘差繼續學習，這屬於哪類 ensemble？

- A. Gradient Boosting 依序建立弱學習器，讓後續模型著重修正前面模型的殘差／錯誤
- B. Gradient Boosting 只能處理影像
- C. 每棵樹完全獨立且同時訓練再平均就是 Gradient Boosting
- D. Boosting 的目的是隨機刪除所有難樣本

Explanation: Boosting 與 Bagging 不同：Boosting 通常序列式學習，逐步修正誤差；Random Forest 更接近 Bagging。

**After**

以平方誤差訓練梯度提升迴歸。某筆資料真值為 10，目前預測為 7，以 y−F(x) 定義殘差。新樹的該筆殘差目標為何？

- A. 3，真值減去目前集成的預測
- B. -3，目前集成的預測減去真值
- C. 7，沿用目前集成的預測數值
- D. 10，沿用該筆資料的原始真值

Explanation: 殘差 y−F(x)=10−7=3。平方誤差梯度提升以殘差作為下一輪學習訊號，並非每輪直接重學原始真值；符號反轉會改變修正方向。

### Q439 — key D

**Before**

某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，為何 Boosting 往往能把多個弱學習器組成較強模型？

- A. Boosting 的目的是隨機刪除所有難樣本
- B. Gradient Boosting 只能處理影像
- C. 每棵樹完全獨立且同時訓練再平均就是 Gradient Boosting
- D. Gradient Boosting 依序建立弱學習器，讓後續模型著重修正前面模型的殘差／錯誤

Explanation: Boosting 與 Bagging 不同：Boosting 通常序列式學習，逐步修正誤差；Random Forest 更接近 Bagging。

**After**

梯度提升的某輪迴歸更新為 F_new(x)=F_old(x)+ηh(x)。若原預測為 7、η=0.1、新樹輸出為 3，更新後為何？

- A. 0.3，只保留學習率乘上新樹輸出的數值
- B. 7.1，把學習率直接加到原本預測的數值
- C. 10.0，把新樹完整輸出加到原本預測的數值
- D. 7.3，把縮放後的新樹輸出加到原本預測

Explanation: 依題設更新式為 7+0.1×3=7.3。新樹逐步修正既有預測，學習率縮放其貢獻；不能只取修正量或省略縮放。

### Q440 — key A

**Before**

某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，下列哪一項最符合 Gradient Boosting 的訓練流程？

- A. Gradient Boosting 依序建立弱學習器，讓後續模型著重修正前面模型的殘差／錯誤
- B. 每棵樹完全獨立且同時訓練再平均就是 Gradient Boosting
- C. Gradient Boosting 只能處理影像
- D. Boosting 的目的是隨機刪除所有難樣本

Explanation: Boosting 與 Bagging 不同：Boosting 通常序列式學習，逐步修正誤差；Random Forest 更接近 Bagging。

**After**

一般梯度提升適用可微分的損失。相較平方誤差的殘差擬合，其他損失的下一輪學習訊號應如何取得？

- A. 依目前預測計算損失的負梯度，作為修正訊號
- B. 依原始標籤設定每輪目標，不使用目前模型的預測
- C. 依 y−F(x) 設定每輪目標，所有損失都用相同殘差
- D. 依前輪單棵樹的預測值，直接作為本輪學習目標

Explanation: 梯度提升利用損失對目前預測的負梯度，也稱偽殘差。平方誤差下可對應 y−F(x)，其他損失不一定使用同樣的原始殘差形式。

### Q441 — key D

**Before**

某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，表格資料競賽常使用梯度提升樹，其核心概念是？

- A. Boosting 的目的是隨機刪除所有難樣本
- B. 每棵樹完全獨立且同時訓練再平均就是 Gradient Boosting
- C. Gradient Boosting 只能處理影像
- D. Gradient Boosting 依序建立弱學習器，讓後續模型著重修正前面模型的殘差／錯誤

Explanation: Boosting 與 Bagging 不同：Boosting 通常序列式學習，逐步修正誤差；Random Forest 更接近 Bagging。

**After**

訓練梯度提升樹時，在樹數與其他設定不變下減小 learning rate，最直接改變什麼？

- A. 每棵樹的葉節點數，自動變成原本的固定比例
- B. 每輪訓練的樣本數，自動變成原本的固定比例
- C. 每筆輸入的特徵數，自動變成原本的固定比例
- D. 每棵新樹的預測貢獻，按較小係數加入集成

Explanation: Learning rate 主要縮放每輪新學習器的貢獻。較小值常需搭配更多輪數評估效果，但不直接固定樹的葉數、樣本數或輸入特徵數。

### Q460 — key A

**Before**

某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，詐欺樣本只占 1%，一般 K-fold 某些 fold 幾乎沒有正類。可改用？

- A. 分類資料不平衡時，Stratified K-fold 可讓各 fold 類別比例較一致
- B. 類別越不平衡越應完全隨機且不看標籤
- C. Stratified K-fold 會把同一筆資料同時放在 train/test
- D. Stratification 只適用迴歸

Explanation: Stratified split 在分類任務中盡量維持各折的類別比例，能降低某 fold 幾乎沒有少數類別的問題。

**After**

獨立分類樣本共 1,000 筆，含 50 筆正類，欲做五折驗證並讓各折類別比例接近整體。哪種切分最符合需求？

- A. 依類別分層分配樣本，再組成互不重疊的五折
- B. 依資料原始順序分段，再組成互不重疊的五折
- C. 依各筆樣本特徵排序，再組成互不重疊的五折
- D. 依模型預測信心排序，再組成互不重疊的五折

Explanation: Stratified K-fold 依標籤分層，使各折比例接近整體。原始順序、特徵值或預測信心不直接維持真實類別比例；此題假設樣本獨立。

### Q461 — key A

**Before**

某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，分類資料高度不平衡時，為何常使用 stratified train/test split？

- A. 分類資料不平衡時，Stratified K-fold 可讓各 fold 類別比例較一致
- B. Stratified K-fold 會把同一筆資料同時放在 train/test
- C. 類別越不平衡越應完全隨機且不看標籤
- D. Stratification 只適用迴歸

Explanation: Stratified split 在分類任務中盡量維持各折的類別比例，能降低某 fold 幾乎沒有少數類別的問題。

**After**

分類資料含 10% 正類。分層 train/test split 的主要目的為何？

- A. 讓兩個子集的類別比例接近原始的 10%
- B. 讓兩個子集的正負樣本比例都變為 50%
- C. 讓測試子集只包含正類以強化少數類評估
- D. 讓訓練子集只包含負類以維持主要類分布

Explanation: 分層切分維持原始類別比例，不是把資料平衡成 50%／50%，也不是將某一類單獨放到訓練或測試集。

### Q462 — key A

**Before**

下列對 Stratified K-fold 的描述哪一項正確？

- A. 分類資料不平衡時，Stratified K-fold 可讓各 fold 類別比例較一致
- B. Stratified K-fold 會把同一筆資料同時放在 train/test
- C. Stratification 只適用迴歸
- D. 類別越不平衡越應完全隨機且不看標籤

Explanation: Stratified split 在分類任務中盡量維持各折的類別比例，能降低某 fold 幾乎沒有少數類別的問題。

**After**

使用 Stratified K-fold 的某一輪驗證時，對同一筆樣本的訓練與驗證歸屬，哪項描述正確？

- A. 該輪只屬於訓練或驗證之一，兩者不重疊
- B. 該輪可同時屬於訓練與驗證，以維持比例
- C. 該輪必須同時屬於訓練與驗證，以增加樣本
- D. 該輪由預測是否正確決定歸屬，以修正分布

Explanation: 同一輪的訓練與驗證樣本互斥；每筆樣本在一折作驗證，在其他輪可作訓練。分層保留比例不需要同輪重複使用樣本，也不依預測結果分配。

### Q463 — key C

**Before**

若每一 fold 都希望正負樣本比例接近整體資料，應採用？

- A. Stratified K-fold 會把同一筆資料同時放在 train/test
- B. Stratification 只適用迴歸
- C. 分類資料不平衡時，Stratified K-fold 可讓各 fold 類別比例較一致
- D. 類別越不平衡越應完全隨機且不看標籤

Explanation: Stratified split 在分類任務中盡量維持各折的類別比例，能降低某 fold 幾乎沒有少數類別的問題。

**After**

獨立分類資料共 1,000 筆，正類 100 筆，以五折分層切分成等大的驗證折。每折理想上有多少正類？

- A. 100 筆，將所有正類複製到每一折
- B. 50 筆，將每折的正負類調成相同數量
- C. 20 筆，將正類平均分到五個驗證折
- D. 10 筆，將五折數再乘上原始正類比例

Explanation: 各驗證折 200 筆，維持 10% 正類即為 20 筆；等同 100 筆正類分配到五折。分層切分不複製正類，也不自動改成平衡資料。

### Q464 — key C

**Before**

不平衡分類驗證中，如何降低切分造成指標大幅波動？

- A. Stratified K-fold 會把同一筆資料同時放在 train/test
- B. Stratification 只適用迴歸
- C. 分類資料不平衡時，Stratified K-fold 可讓各 fold 類別比例較一致
- D. 類別越不平衡越應完全隨機且不看標籤

Explanation: Stratified split 在分類任務中盡量維持各折的類別比例，能降低某 fold 幾乎沒有少數類別的問題。

**After**

資料只含 3 筆少數類樣本，卻希望五個互不重疊驗證折各至少有 1 筆少數類。哪項判斷正確？

- A. 啟用洗牌即可達成，因為洗牌會增加少數類數量
- B. 啟用分層即可達成，因為分層會複製少數類樣本
- C. 目前無法達成，應減少折數或增加少數類樣本
- D. 提高模型容量即可達成，因為容量會改變切分數量

Explanation: 三筆樣本不能分到五個互斥折且每折至少一筆。分層或洗牌不增加樣本，模型容量也不解決此限制；折數須配合少數類樣本數。

### Q465 — key B

**Before**

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，Stratification 的主要目的不是提高模型容量，而是？

- A. 類別越不平衡越應完全隨機且不看標籤
- B. 分類資料不平衡時，Stratified K-fold 可讓各 fold 類別比例較一致
- C. Stratification 只適用迴歸
- D. Stratified K-fold 會把同一筆資料同時放在 train/test

Explanation: Stratified split 在分類任務中盡量維持各折的類別比例，能降低某 fold 幾乎沒有少數類別的問題。

**After**

同一客戶有多筆紀錄。一般 Stratified K-fold 保留類別比例，但可能把同客戶分到訓練與驗證。若要評估新客戶，應如何調整？

- A. 只依類別分層，不再考慮每筆紀錄所屬客戶
- B. 依客戶分組隔離，並在可行時兼顧類別分層
- C. 只依紀錄字數排序，不再考慮同客戶的關聯
- D. 依模型預測分組，將預测相似的紀錄放一起

Explanation: 新客戶評估需隔離客戶群組，以免同客戶資訊洩漏。可使用分組切分並在可行時兼顧分層；一般類別分層本身不保證客戶隔離。
