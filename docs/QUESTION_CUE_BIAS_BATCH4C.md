# Issue #61 — Batch 4C remediation evidence

- Baseline: `e7d4709` on `question/issue-14-remediation` (includes #60).
- Scope: 24 self-authored items; protected metadata and answer indices preserved.
- Manual review: each item has one correct answer; distractors represent alternative 4V mappings, task definitions, governance arrangements, or generation mechanisms. Six distinct questions per concept replace repeated option sets.

## Validation

| Whole-bank metric | Before | After |
| --- | ---: | ---: |
| Self-authored questions / unique IDs | 483 / 483 | 483 / 483 |
| Uniquely longest correct option | 160 | 136 |
| Correct / average distractor length >= 2x | 0 | 0 |
| Repeated option-set groups | 30 | 26 |
| Questions in repeated option sets | 144 | 120 |

- Scoped audit PASS: exactly the 24 scoped IDs changed. ID order, answer indices, protected metadata, DB metadata and HTML/CSS/JS outside DB unchanged.
- All 24 items have no unique-longest correct option and no repeated option set anywhere in the bank. Maximum length ratio: 1.0588x.
- Answer distribution unchanged: A 131 / B 109 / C 122 / D 121.
- Manual content review PASS for all items: each after-explanation below identifies the correct concept and excludes alternatives. Independent Technical Review remains pending.
- Inline JavaScript syntax: PASS (one script compiled using Node vm.Script).
- Headless Edge QA PASS at 1280×900 and 375×900: all 24 scoped items render and score in Practice and Mock. One intentional Practice error is recorded and removed after correct retry; weak-area L11201 shows 5/6 (83%).
- Mock scores: L11 17/18 (94%), L12 5/6 (83%), with one intentional wrong answer each; native submit confirmations and wrong-answer review verified.
- Official 115-year second-paper flow, seven tabs, no document horizontal overflow, no page/console warnings/errors and no HTTP errors: PASS.
- Browser test serves the actual app with only the 24 scoped self-authored records for coverage. App logic/assets and official-paper loader are unchanged; fresh profiles preserve existing user progress.
- Visually inspected representative mobile Practice screenshot: readable options, explanation and navigation.
- git diff --check: PASS.

Reproduce:

```text
python scripts/audit_question_cues.py --baseline e7d4709 --batch batch4c --csv docs/QUESTION_CUE_BIAS_BATCH4C.csv
NODE_PATH=<existing runtime node_modules> node scripts/test_question_batch4c.cjs <output-directory>
```

Evidence: [audit CSV](QUESTION_CUE_BIAS_BATCH4C.csv), [browser results](QUESTION_CUE_BIAS_BATCH4C_BROWSER.json), [mobile Practice](qa/issue-61/practice-Q220-375.png), [mobile Mock review](qa/issue-61/mock-L11-375.png).

Limitations: metrics are heuristics and do not certify content quality. Independent Technical Review is required before a PR. No integration, Product Verify or production verification claimed.

## Per-item review (before / after)

### Q172 — key A

**Before**

某製造商每天新增數十 TB 感測資料，來源包含影像、JSON 與機台數值，且每秒持續寫入。若用大數據常見的 4V 概念描述，最適合的是哪一組？

- A. Volume、Velocity、Variety、Veracity
- B. Accuracy、Recall、F1、AUC
- C. CPU、RAM、SSD、GPU
- D. ETL、API、SQL、HTML

Explanation: 大數據常以 4V 描述：資料量（Volume）、速度（Velocity）、多樣性（Variety）與可信度／真實性（Veracity）。

**After**

某製造商每天新增數十 TB 感測資料。就大數據 4V 而言，這項描述主要對應哪個面向？

- A. Volume：資料累積的規模
- B. Velocity：資料產生的速度
- C. Variety：資料來源的型態
- D. Veracity：資料內容的可信度

Explanation: 每天新增數十 TB 強調資料量的規模，對應 Volume。速度著重到達或處理速率，多樣性著重型態，可信度著重資料品質。

### Q173 — key B

**Before**

零售平台的交易、影音瀏覽與客服文字同時快速累積。下列何者最完整描述這類大數據特性？

- A. CPU、RAM、SSD、GPU
- B. Volume、Velocity、Variety、Veracity
- C. Accuracy、Recall、F1、AUC
- D. ETL、API、SQL、HTML

Explanation: 大數據常以 4V 描述：資料量（Volume）、速度（Velocity）、多樣性（Variety）與可信度／真實性（Veracity）。

**After**

零售平台整合交易表格、影音檔案與客服文字。就大數據 4V 而言，多種資料型態主要對應哪個面向？

- A. Volume：評估各類資料的總容量
- B. Variety：評估各類資料的多樣性
- C. Velocity：評估各類資料的更新率
- D. Veracity：評估各類資料的可靠性

Explanation: 表格、影音與文字的型態差異對應 Variety。總容量、更新率與可靠性分別屬於其他 4V 面向。

### Q174 — key D

**Before**

智慧城市資料同時具有大量、即時、多格式與品質不一等特性。這通常對應哪一組概念？

- A. Accuracy、Recall、F1、AUC
- B. CPU、RAM、SSD、GPU
- C. ETL、API、SQL、HTML
- D. Volume、Velocity、Variety、Veracity

Explanation: 大數據常以 4V 描述：資料量（Volume）、速度（Velocity）、多樣性（Variety）與可信度／真實性（Veracity）。

**After**

智慧城市感測資料每秒持續到達，平台需及時處理。就大數據 4V 而言，這主要對應哪個面向？

- A. Volume：著重長期儲存的總量
- B. Veracity：著重量測內容的品質
- C. Variety：著重接收格式的差異
- D. Velocity：著重資料流入的速率

Explanation: 每秒持續到達與及時處理的需求對應 Velocity。即使資料總量尚小，也可能面臨高速資料流的處理需求。

### Q175 — key D

**Before**

企業評估是否屬於大數據情境時，常檢查資料規模、產生速度、型態與可信度。這四項合稱？

- A. CPU、RAM、SSD、GPU
- B. ETL、API、SQL、HTML
- C. Accuracy、Recall、F1、AUC
- D. Volume、Velocity、Variety、Veracity

Explanation: 大數據常以 4V 描述：資料量（Volume）、速度（Velocity）、多樣性（Variety）與可信度／真實性（Veracity）。

**After**

企業發現感測資料存在缺值、誤差與來源可信度問題。若用大數據 4V 分析，應優先檢查哪個面向？

- A. Velocity：檢查資料傳入的頻率
- B. Variety：檢查資料格式的種類
- C. Volume：檢查資料儲存的容量
- D. Veracity：檢查資料內容的品質

Explanation: 缺值、誤差及來源可信度主要屬於 Veracity，不能僅以傳入頻率、格式種類或儲存容量衡量。

### Q176 — key C

**Before**

IoT 平台面臨高頻串流、影像與表格混合、資料品質不穩與巨量儲存需求，最符合哪一組特性？

- A. Accuracy、Recall、F1、AUC
- B. ETL、API、SQL、HTML
- C. Volume、Velocity、Variety、Veracity
- D. CPU、RAM、SSD、GPU

Explanation: 大數據常以 4V 描述：資料量（Volume）、速度（Velocity）、多樣性（Variety）與可信度／真實性（Veracity）。

**After**

IoT 平台同時處理巨量儲存、高頻串流、多種格式與資料品質問題。在本題採用的 4V 中，哪組配對正確？

- A. Volume—速率；Velocity—規模；Variety—型態；Veracity—可信度
- B. Volume—規模；Velocity—速率；Variety—可信度；Veracity—型態
- C. Volume—規模；Velocity—速率；Variety—型態；Veracity—可信度
- D. Volume—型態；Velocity—可信度；Variety—規模；Veracity—速率

Explanation: 本題採 Volume、Velocity、Variety、Veracity 的 4V 定義，分別對應規模、速率、型態與可信度。其他選項交換了面向與意義。

### Q177 — key D

**Before**

下列哪一組最接近大數據常用的 4V，而不是模型評估指標或硬體規格？

- A. ETL、API、SQL、HTML
- B. Accuracy、Recall、F1、AUC
- C. CPU、RAM、SSD、GPU
- D. Volume、Velocity、Variety、Veracity

Explanation: 大數據常以 4V 描述：資料量（Volume）、速度（Velocity）、多樣性（Variety）與可信度／真實性（Veracity）。

**After**

本題採 Volume、Velocity、Variety、Veracity 的大數據 4V 定義。哪項觀察最直接反映 Veracity？

- A. 資料格式增加，整合時需支援影像與文字
- B. 資料量持續累積，儲存時需擴充磁碟空間
- C. 資料更新更頻繁，處理時需縮短等待時間
- D. 資料來源有誤差，使用前需確認量測品質

Explanation: Veracity 著重資料的真實性與可信度，量測誤差需透過品質檢查處理。格式、總量及更新頻率分別對應 Variety、Volume 與 Velocity。

### Q190 — key D

**Before**

公司要分別預測「明日用電量」與「客戶是否流失」，這兩項任務通常分別屬於？

- A. 分類只能有兩類，超過兩類就不是分類
- B. 迴歸只能使用線性模型
- C. 連續數值一定使用分群；類別一定使用迴歸
- D. 預測連續數值通常是迴歸；預測離散類別通常是分類

Explanation: 監督式學習中，分類預測離散標籤；迴歸預測連續數值。兩者都可使用多種不同演算法。

**After**

公司要分別預測「明日用電量的連續數值」與「客戶是否流失的類別」。這兩項監督式學習任務分別屬於？

- A. 前者為分類，後者為分類
- B. 前者為分類，後者為迴歸
- C. 前者為迴歸，後者為迴歸
- D. 前者為迴歸，後者為分類

Explanation: 用電量的連續數值屬於迴歸目標；是否流失是離散類別，屬於分類。任務由目標的意義決定。

### Q191 — key D

**Before**

預測房屋成交價格與判斷產品瑕疵類型，在機器學習任務分類上最適合如何區分？

- A. 連續數值一定使用分群；類別一定使用迴歸
- B. 分類只能有兩類，超過兩類就不是分類
- C. 迴歸只能使用線性模型
- D. 預測連續數值通常是迴歸；預測離散類別通常是分類

Explanation: 監督式學習中，分類預測離散標籤；迴歸預測連續數值。兩者都可使用多種不同演算法。

**After**

模型要預測房屋成交價格的連續數值。若改為預測「低價／中價／高價」三個價格帶，任務類型如何改變？

- A. 原為分類，改為三類迴歸
- B. 原為迴歸，改為三群分群
- C. 原為分類，改為三群分群
- D. 原為迴歸，改為三類分類

Explanation: 價格數值預測為迴歸；預先定義價格帶並以其標籤訓練則為分類。三個類別不代表分群或迴歸。

### Q192 — key D

**Before**

模型 A 輸出 325.7 元，模型 B 輸出「高風險／低風險」。兩者通常分別是？

- A. 連續數值一定使用分群；類別一定使用迴歸
- B. 分類只能有兩類，超過兩類就不是分類
- C. 迴歸只能使用線性模型
- D. 預測連續數值通常是迴歸；預測離散類別通常是分類

Explanation: 監督式學習中，分類預測離散標籤；迴歸預測連續數值。兩者都可使用多種不同演算法。

**After**

模型 A 預測商品售價為 325.7 元；模型 B 預測「高風險／低風險」，並以 1／0 編碼。任務類型如何判斷？

- A. A 與 B 都是迴歸，因為輸出以數字表示
- B. A 與 B 都是分類，因為輸出是單一結果
- C. A 是分類，B 是迴歸，依輸出大小判斷
- D. A 是迴歸，B 是分類，依目標意義判斷

Explanation: 售價是連續數值目標，風險標籤是離散類別；用 1／0 編碼不會把分類變成迴歸。應看目標意義而非呈現格式。

### Q193 — key B

**Before**

客服團隊預測處理分鐘數；風控團隊預測違約／不違約。任務型態何者正確？

- A. 迴歸只能使用線性模型
- B. 預測連續數值通常是迴歸；預測離散類別通常是分類
- C. 連續數值一定使用分群；類別一定使用迴歸
- D. 分類只能有兩類，超過兩類就不是分類

Explanation: 監督式學習中，分類預測離散標籤；迴歸預測連續數值。兩者都可使用多種不同演算法。

**After**

客服團隊預測處理分鐘數的連續數值；風控團隊預測違約／不違約。哪組「任務與評估指標」配對最適當？

- A. 客服：分類搭配準確率；風控：迴歸搭配均方誤差
- B. 客服：迴歸搭配平均絕對誤差；風控：分類搭配召回率
- C. 客服：迴歸搭配平均絕對誤差；風控：迴歸搭配均方誤差
- D. 客服：分類搭配準確率；風控：分類搭配召回率

Explanation: 分鐘數是連續目標，可用平均絕對誤差衡量迴歸誤差；違約是類別，可用召回率衡量違約類別的辨識情況。實際評估還需依業務目標選擇多種指標。

### Q194 — key C

**Before**

下列對 Classification 與 Regression 的敘述，哪一項較正確？

- A. 連續數值一定使用分群；類別一定使用迴歸
- B. 迴歸只能使用線性模型
- C. 預測連續數值通常是迴歸；預測離散類別通常是分類
- D. 分類只能有兩類，超過兩類就不是分類

Explanation: 監督式學習中，分類預測離散標籤；迴歸預測連續數值。兩者都可使用多種不同演算法。

**After**

下列對監督式學習中 Classification 與 Regression 的區分，哪一項正確？

- A. 分類依輸入欄位是否為文字；迴歸依輸入欄位是否為數字
- B. 分類依模型是否使用樹狀結構；迴歸依模型是否使用直線
- C. 分類依目標是否為離散類別；迴歸依目標是否為連續數值
- D. 分類依資料是否含有兩個欄位；迴歸依資料是否含多個欄位

Explanation: 分類與迴歸主要依預測目標區分，不由輸入型態、欄位數或模型架構決定。樹模型與神經網路都可用於分類或迴歸。

### Q195 — key B

**Before**

若目標值一個是連續溫度、一個是離散設備狀態，應如何選擇任務類型？

- A. 迴歸只能使用線性模型
- B. 預測連續數值通常是迴歸；預測離散類別通常是分類
- C. 連續數值一定使用分群；類別一定使用迴歸
- D. 分類只能有兩類，超過兩類就不是分類

Explanation: 監督式學習中，分類預測離散標籤；迴歸預測連續數值。兩者都可使用多種不同演算法。

**After**

設備狀態標籤為「正常／過熱／故障」，以 0／1／2 編碼。模型要預測這些標籤，應選哪種任務與輸出解讀？

- A. 迴歸：把編碼值當成連續溫度預測
- B. 分類：把編碼值當成三種類別標籤
- C. 分群：把編碼值當成待發現的群集
- D. 迴歸：把編碼值當成等距嚴重程度

Explanation: 0／1／2 在題中只是三種設備狀態的編碼，目標仍是離散類別，因此是分類。數字編碼不表示溫度或等距量尺，也不是無標籤分群。

### Q208 — key D

**Before**

銀行用 AI 拒絕貸款申請，若要提升治理品質，下列哪種設計較適當？

- A. 模型供應商應承擔所有最終決策責任
- B. 完全隱藏模型邏輯可提升信任
- C. 只要模型平均準確率高就可取消人工覆核
- D. 對高影響決策提供適當可解釋資訊、保留人工覆核與責任歸屬

Explanation: 高影響 AI 應兼顧透明度、可解釋性、人工監督與責任歸屬；不能用高準確率取代治理。

**After**

銀行以 AI 輔助拒絕貸款申請，申請人對結果提出異議。哪種設計最能支援決策的可解釋性與責任追蹤？

- A. 保留模型的整體準確率，讓客服以此回覆個別異議
- B. 保留供應商的效能報告，讓供應商處理所有個別異議
- C. 保留申請人的風險分數，讓系統以原分數回覆異議
- D. 保留個案理由與決策紀錄，由指定人員覆核個別異議

Explanation: 個案理由、決策紀錄與指定覆核人員能支援解釋及責任追蹤。整體效能、供應商報告或重述分數均不足以處理個案異議。

### Q209 — key A

**Before**

保險理賠模型直接影響客戶權益，組織應如何兼顧可解釋性與責任？

- A. 對高影響決策提供適當可解釋資訊、保留人工覆核與責任歸屬
- B. 模型供應商應承擔所有最終決策責任
- C. 完全隱藏模型邏輯可提升信任
- D. 只要模型平均準確率高就可取消人工覆核

Explanation: 高影響 AI 應兼顧透明度、可解釋性、人工監督與責任歸屬；不能用高準確率取代治理。

**After**

保險理賠模型直接影響客戶權益。哪種安排最能讓組織在模型建議出錯時追查並修正決策？

- A. 記錄模型版本與個案依據，指定有權修正決策的覆核人員
- B. 記錄模型平均效能與排名，指定負責彙整月報的行政人員
- C. 記錄系統運算時間與成本，指定負責維護伺服器的技術人員
- D. 記錄客戶回覆速度與滿意度，指定負責寄送通知的客服人員

Explanation: 版本、個案依據與有權修正決策的人員使錯誤可追查並可補救。效能月報、系統維護及通知服務各有用途，但不能替代決策覆核責任。

### Q210 — key C

**Before**

高風險 AI 決策系統若只能輸出「拒絕」卻無法被人工覆核，主要缺少什麼治理觀念？

- A. 模型供應商應承擔所有最終決策責任
- B. 只要模型平均準確率高就可取消人工覆核
- C. 對高影響決策提供適當可解釋資訊、保留人工覆核與責任歸屬
- D. 完全隱藏模型邏輯可提升信任

Explanation: 高影響 AI 應兼顧透明度、可解釋性、人工監督與責任歸屬；不能用高準確率取代治理。

**After**

高風險 AI 系統已保存拒絕理由與模型版本，但受理異議的人員無權改變決策。最需要補強哪種機制？

- A. 增加模型效能報表，讓人員比較歷月準確率
- B. 增加運算資源監測，讓人員檢查服務回應時間
- C. 建立有權覆核的流程，讓人員更正不當決策
- D. 建立版本更新排程，讓人員追蹤模型上線時間

Explanation: 可解釋的紀錄仍需搭配有效人工監督。覆核人員應有適當權限與流程修正不當決策；效能、資源或排程資訊不能補上這項權限。

### Q211 — key A

**Before**

企業導入會影響升遷或信用的 AI 時，下列哪種做法較符合負責任 AI？

- A. 對高影響決策提供適當可解釋資訊、保留人工覆核與責任歸屬
- B. 只要模型平均準確率高就可取消人工覆核
- C. 模型供應商應承擔所有最終決策責任
- D. 完全隱藏模型邏輯可提升信任

Explanation: 高影響 AI 應兼顧透明度、可解釋性、人工監督與責任歸屬；不能用高準確率取代治理。

**After**

企業導入影響升遷的 AI。主管會覆核結果，但尚未定義各單位的決策責任。哪種安排較適當？

- A. 明定使用單位的決策責任、覆核權限與異議處理窗口
- B. 以模型開發單位的測試成績作為使用單位免責的依據
- C. 以系統供應商的服務承諾替代使用單位的覆核責任
- D. 讓各使用單位自行判斷，由員工尋找能處理異議的人

Explanation: AI 輔助決策仍需明確的組織責任、覆核權限與異議窗口。測試成績或供應商承諾不能替代使用組織的治理安排。

### Q212 — key B

**Before**

模型準確率 95% 是否代表可以取消解釋與人工覆核？下列何者最合理？

- A. 模型供應商應承擔所有最終決策責任
- B. 對高影響決策提供適當可解釋資訊、保留人工覆核與責任歸屬
- C. 只要模型平均準確率高就可取消人工覆核
- D. 完全隱藏模型邏輯可提升信任

Explanation: 高影響 AI 應兼顧透明度、可解釋性、人工監督與責任歸屬；不能用高準確率取代治理。

**After**

貸款模型整體準確率為 95%。團隊據此提議取消個案解釋與人工覆核。哪項評估最合理？

- A. 可依整體準確率取消覆核，將剩餘錯誤納入下一輪訓練
- B. 仍應依決策風險保留解釋與覆核，整體指標不足以替代
- C. 可依供應商測試取消覆核，將個案異議轉交供應商處理
- D. 仍應保留效能月報即可，個案錯誤可由整體平均值反映

Explanation: 高整體準確率不代表每個個案正確，也不說明錯誤對權益的影響。高影響決策仍需依風險安排解釋、覆核與責任機制。

### Q213 — key D

**Before**

關於 AI 可解釋性與責任機制，下列哪一項較正確？

- A. 完全隱藏模型邏輯可提升信任
- B. 只要模型平均準確率高就可取消人工覆核
- C. 模型供應商應承擔所有最終決策責任
- D. 對高影響決策提供適當可解釋資訊、保留人工覆核與責任歸屬

Explanation: 高影響 AI 應兼顧透明度、可解釋性、人工監督與責任歸屬；不能用高準確率取代治理。

**After**

AI 已提供每次決策的主要影響因素。關於可解釋性與責任機制的關係，哪項敘述較正確？

- A. 有影響因素說明即可取代覆核，因為使用者已知道模型理由
- B. 有影響因素說明即可確認公平，因為模型已揭露判斷依據
- C. 有影響因素說明即可移轉責任，因為開發者已交付說明功能
- D. 有影響因素說明仍需明定責任，並提供適當覆核與補救管道

Explanation: 解釋有助理解及檢查決策，但本身不保證公平或正確，也不會自動移轉責任。組織仍需明定責任並安排適當覆核與補救。

### Q220 — key C

**Before**

法規摘要希望每次輸出較穩定，創意標語則希望更多變化。Temperature 通常應如何設定？

- A. Temperature 是向量資料庫的相似度指標
- B. Temperature 決定模型可讀取的檔案大小
- C. 降低 Temperature 通常讓輸出較穩定一致；提高則通常增加隨機性與多樣性
- D. 提高 Temperature 可保證事實正確

Explanation: Temperature 主要影響取樣分布的隨機程度。低溫通常較穩定，高溫通常較多樣，但不能把它當成事實正確率控制器。

**After**

在模型、Prompt 與其他採樣參數相同時，法規摘要希望措辭較穩定，創意標語希望更多變化。Temperature 通常如何設定？

- A. 摘要設較高值；標語設較低值
- B. 摘要與標語皆設較高值以減少變化
- C. 摘要設較低值；標語設較高值
- D. 摘要與標語皆設較低值以增加變化

Explanation: 較低 Temperature 通常使採樣更集中，較高值通常增加多樣性。穩定措辭不等於事實正確，法規摘要仍需核對來源。

### Q221 — key A

**Before**

同一 Prompt 回覆過於發散，團隊希望降低隨機性，最直接可調哪個生成參數？

- A. 降低 Temperature 通常讓輸出較穩定一致；提高則通常增加隨機性與多樣性
- B. 提高 Temperature 可保證事實正確
- C. Temperature 決定模型可讀取的檔案大小
- D. Temperature 是向量資料庫的相似度指標

Explanation: Temperature 主要影響取樣分布的隨機程度。低溫通常較穩定，高溫通常較多樣，但不能把它當成事實正確率控制器。

**After**

同一 Prompt 回覆過於發散，希望降低採樣隨機性。其他條件不變，哪種 Temperature 調整最直接符合需求？

- A. 降低 Temperature，使採樣偏向高機率候選
- B. 提高 Temperature，使採樣納入更多低機率候選
- C. 維持 Temperature，讓既有採樣分布保持不變
- D. 交替高低 Temperature，使不同回覆變化更大

Explanation: 降低 Temperature 通常讓高機率候選更集中，減少採樣隨機性。提高或交替高低值不符合降低發散的目標；低溫仍不保證完全一致。

### Q222 — key C

**Before**

下列對 LLM Temperature 的敘述何者較正確？

- A. 提高 Temperature 可保證事實正確
- B. Temperature 是向量資料庫的相似度指標
- C. 降低 Temperature 通常讓輸出較穩定一致；提高則通常增加隨機性與多樣性
- D. Temperature 決定模型可讀取的檔案大小

Explanation: Temperature 主要影響取樣分布的隨機程度。低溫通常較穩定，高溫通常較多樣，但不能把它當成事實正確率控制器。

**After**

對支援 Temperature 的語言模型採樣而言，下列哪項描述較正確？

- A. 較高值使高機率候選更集中，通常減少輸出多樣性
- B. 較低值使低機率候選更常出現，通常增加輸出多樣性
- C. 較高值使候選機率分布較平坦，通常增加輸出多樣性
- D. 較低值使模型讀取更多來源，通常提高事實查證能力

Explanation: Temperature 調整採樣機率分布；較高值使分布較平坦，較低值使分布較集中。它不控制來源檢索或事實查證能力。

### Q223 — key A

**Before**

創意腦暴與固定格式抽取相比，哪一類任務通常可接受較高 Temperature？

- A. 降低 Temperature 通常讓輸出較穩定一致；提高則通常增加隨機性與多樣性
- B. 提高 Temperature 可保證事實正確
- C. Temperature 是向量資料庫的相似度指標
- D. Temperature 決定模型可讀取的檔案大小

Explanation: Temperature 主要影響取樣分布的隨機程度。低溫通常較穩定，高溫通常較多樣，但不能把它當成事實正確率控制器。

**After**

團隊比較創意腦暴與固定格式資訊抽取。若先只考慮輸出多樣性的需求，哪項任務較適合嘗試較高 Temperature？

- A. 腦暴多種活動標語，探索不同表達方向
- B. 抽取發票統一編號，保持欄位內容一致
- C. 擷取合約到期日期，保持原文數值一致
- D. 轉寫產品型號清單，保持字元順序一致

Explanation: 活動標語腦暴可接受多種表達，較適合嘗試較高 Temperature。抽取或轉寫通常較重視穩定及忠實；格式與事實仍需另外驗證。

### Q224 — key D

**Before**

如果把 Temperature 從 0.2 提高到 1.0，通常最可能看到哪種變化？

- A. Temperature 決定模型可讀取的檔案大小
- B. Temperature 是向量資料庫的相似度指標
- C. 提高 Temperature 可保證事實正確
- D. 降低 Temperature 通常讓輸出較穩定一致；提高則通常增加隨機性與多樣性

Explanation: Temperature 主要影響取樣分布的隨機程度。低溫通常較穩定，高溫通常較多樣，但不能把它當成事實正確率控制器。

**After**

模型、Prompt 與其他採樣參數不變，把 Temperature 從 0.2 提高到 1.0，通常最可能看到哪種變化？

- A. 回覆的候選詞更集中，措辭變化較少
- B. 回覆會使用更多來源，事實查證更完整
- C. 回覆會保留更長歷史，可讀取的上下文增加
- D. 回覆的候選詞較分散，措辭變化較多

Explanation: 提高 Temperature 通常增加採樣多樣性，可能出現更多措辭變化。它不直接擴充來源或上下文，也不保證事實正確。

### Q225 — key D

**Before**

生成參數 Temperature 最主要控制什麼？

- A. 提高 Temperature 可保證事實正確
- B. Temperature 決定模型可讀取的檔案大小
- C. Temperature 是向量資料庫的相似度指標
- D. 降低 Temperature 通常讓輸出較穩定一致；提高則通常增加隨機性與多樣性

Explanation: Temperature 主要影響取樣分布的隨機程度。低溫通常較穩定，高溫通常較多樣，但不能把它當成事實正確率控制器。

**After**

生成參數 Temperature 最直接調整語言模型產生下一個 token 時的哪項機制？

- A. 檢索來源的排序分數與引用優先順序
- B. 上下文的容量上限與歷史保留範圍
- C. 輸出長度的終止上限與字數限制
- D. 候選詞元的機率分布與採樣隨機性

Explanation: Temperature 調整候選 token 的採樣機率分布，影響隨機性與多樣性。檢索排序、上下文容量及輸出長度屬於其他機制或設定。
