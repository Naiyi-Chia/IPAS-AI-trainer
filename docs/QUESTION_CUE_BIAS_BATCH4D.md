# Issue #62 — Batch 4D remediation evidence

Baseline: `9d0ac21` on `question/issue-14-remediation` (includes #61).

## Validation

| Whole-bank metric | Before | After |
| --- | ---: | ---: |
| Self-authored questions / unique IDs | 483 / 483 | 483 / 483 |
| Uniquely longest correct option | 136 | 112 |
| Correct / average distractor length >= 2x | 0 | 0 |
| Repeated option-set groups | 26 | 22 |
| Questions in repeated option sets | 120 | 96 |

- Scoped audit PASS: exactly Q238–Q255 and Q268–Q273 changed. ID order, answer indices, all protected metadata, DB metadata and HTML/CSS/JS outside DB unchanged.
- All 24 items have no unique-longest correct option and no repeated option set anywhere in the bank. Maximum length ratio: 1.0345x.
- Answer distribution unchanged: A 131 / B 109 / C 122 / D 121.
- Individual manual content review PASS for all 24: each after-explanation identifies the single correct answer and excludes alternatives. Distractors cover stale data, execution/result confusion, incomplete state or validation, and partial document coverage. Independent Technical Review remains pending.
- Inline JavaScript syntax: PASS (one script compiled using Node vm.Script).
- Headless Edge QA PASS at 1280×900 and 375×900: all 24 scoped items render and score in Practice and Mock. One intentional Practice error is recorded and removed after correct retry; weak-area L12201 shows 5/6 (83%).
- Mock scores: L12 17/18 (94%), L21 5/6 (83%), with one intentional wrong answer each; native submit confirmations and wrong-answer review verified.
- Official 115-year second-paper flow, seven tabs, no document horizontal overflow, no page/console warnings/errors and no HTTP errors: PASS.
- Browser fixture serves the actual app with only the 24 scoped self-authored records for coverage. App logic/assets and official-paper loader are unchanged; fresh profiles preserve existing user progress.
- Representative mobile Practice screenshot visually checked for readable options, explanation and navigation.
- git diff --check: PASS.

Technical references checked for Q241 and Q252: MCP defines tool discovery/calling between clients and servers ([official architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)); JSON Schema requires explicitly listed required properties to be present ([official object validation documentation](https://json-schema.org/understanding-json-schema/reference/object)). Retrieved 2026-10-04. These references support the newly authored content, not official iPAS past-paper attribution.

Reproduce:

```text
python scripts/audit_question_cues.py --baseline 9d0ac21 --batch batch4d --csv docs/QUESTION_CUE_BIAS_BATCH4D.csv
NODE_PATH=<existing runtime node_modules> node scripts/test_question_batch4d.cjs <output-directory>
```

Evidence: [audit CSV](QUESTION_CUE_BIAS_BATCH4D.csv), [browser results](QUESTION_CUE_BIAS_BATCH4D_BROWSER.json), [mobile Practice](qa/issue-62/practice-Q250-375.png), [mobile Mock review](qa/issue-62/mock-L21-375.png).

Limitations: metrics are heuristics and do not certify content quality. Independent Technical Review is required before a PR. No integration, Product Verify or production verification claimed.

## Per-item manual review (before / after)

### Q238 — key C

**Before**

AI 助理要查 ERP 即時庫存再建立補貨單，而不能憑模型記憶回答。最適合的架構是？

- A. 只提高 Temperature 就能讓模型取得即時庫存
- B. 工具呼叫等同把外部資料永久訓練進模型
- C. 讓模型以受控方式呼叫外部工具／資料來源，並用真實回傳結果完成任務
- D. 把 API 金鑰寫進 Prompt 即可安全使用

Explanation: Tool/Function Calling 與工具協定可讓模型存取外部能力；安全上仍需權限、參數驗證、最小權限與輸出檢查。

**After**

AI 助理要查 ERP 即時庫存再建立補貨單。ERP 已提供授權 API，哪種架構最直接符合需求？

- A. 檢索昨日庫存報表，依報表內容產生補貨單文字
- B. 微調歷史補貨紀錄，依模型記憶產生補貨單文字
- C. 呼叫庫存與建單工具，依實際回傳結果回覆任務
- D. 提供庫存與建單範例，依範例格式模擬操作結果

Explanation: 即時庫存與實際建單需要執行已授權的外部工具。昨日報表、歷史微調或文字範例無法替代 API 的即時讀取與寫入。

### Q239 — key C

**Before**

模型需要讀取日曆、資料庫與計算器，產品應如何讓它取得這些外部能力？

- A. 把 API 金鑰寫進 Prompt 即可安全使用
- B. 只提高 Temperature 就能讓模型取得即時庫存
- C. 讓模型以受控方式呼叫外部工具／資料來源，並用真實回傳結果完成任務
- D. 工具呼叫等同把外部資料永久訓練進模型

Explanation: Tool/Function Calling 與工具協定可讓模型存取外部能力；安全上仍需權限、參數驗證、最小權限與輸出檢查。

**After**

模型已提出日曆工具名稱與查詢參數，但尚未執行。一般工具呼叫流程下一步應為何？

- A. 把工具名稱與參數當成結果，直接回覆使用者
- B. 把查詢參數加入訓練資料，等模型學習後回覆
- C. 由應用程式檢查並執行工具，將結果交回模型
- D. 由模型再產生一組查詢參數，當作查詢結果

Explanation: 模型提出的工具呼叫是請求，不是執行結果。應用程式需依權限與參數檢查後執行，再把工具結果交回模型。

### Q240 — key D

**Before**

若生成式 AI 必須執行「查詢→計算→更新系統」，單靠 Prompt 不足，應加入什麼？

- A. 只提高 Temperature 就能讓模型取得即時庫存
- B. 把 API 金鑰寫進 Prompt 即可安全使用
- C. 工具呼叫等同把外部資料永久訓練進模型
- D. 讓模型以受控方式呼叫外部工具／資料來源，並用真實回傳結果完成任務

Explanation: Tool/Function Calling 與工具協定可讓模型存取外部能力；安全上仍需權限、參數驗證、最小權限與輸出檢查。

**After**

AI 已透過工具完成查詢與計算，更新系統的工具卻回傳失敗。最終回覆應如何處理？

- A. 依原始任務目標回覆，宣告系統已完成更新
- B. 依先前查詢成功回覆，宣告系統已完成更新
- C. 依模型預測結果回覆，宣告系統已完成更新
- D. 依更新結果回覆，說明系統尚未更新成功

Explanation: 查詢或計算成功不代表更新成功。回覆應以更新工具的實際結果為依據；不能以使用者意圖或模型生成內容代替執行狀態。

### Q241 — key A

**Before**

公司考慮使用 MCP／Function Calling 串接內部工具，下列理解哪一項正確？

- A. 讓模型以受控方式呼叫外部工具／資料來源，並用真實回傳結果完成任務
- B. 只提高 Temperature 就能讓模型取得即時庫存
- C. 把 API 金鑰寫進 Prompt 即可安全使用
- D. 工具呼叫等同把外部資料永久訓練進模型

Explanation: Tool/Function Calling 與工具協定可讓模型存取外部能力；安全上仍需權限、參數驗證、最小權限與輸出檢查。

**After**

公司以 MCP 串接多種內部工具。MCP 在這種整合中的主要作用為何？

- A. 提供用戶端與伺服器互通的工具探索及呼叫介面
- B. 提供模型重新訓練的資料流程及權重更新介面
- C. 提供企業交易資料的儲存結構及資料修復介面
- D. 提供使用者身分審核的業務流程及授權決策介面

Explanation: MCP 定義 AI 應用與伺服器交換工具等能力的協定介面，支援工具探索與呼叫。模型訓練、交易儲存及企業授權政策需由其他機制處理。

### Q242 — key C

**Before**

客服模型回答訂單狀態時常幻覺，若真實狀態存在後端 API，最直接的改善方式是？

- A. 工具呼叫等同把外部資料永久訓練進模型
- B. 把 API 金鑰寫進 Prompt 即可安全使用
- C. 讓模型以受控方式呼叫外部工具／資料來源，並用真實回傳結果完成任務
- D. 只提高 Temperature 就能讓模型取得即時庫存

Explanation: Tool/Function Calling 與工具協定可讓模型存取外部能力；安全上仍需權限、參數驗證、最小權限與輸出檢查。

**After**

客服工具查到訂單狀態為「待出貨」，模型文字卻寫成「已送達」。應優先檢查哪個環節？

- A. 微調資料是否包含更多已送達的客服對話
- B. 提示範例是否包含更多禮貌且完整的回覆
- C. 最終回覆是否忠實採用本次工具查詢結果
- D. 採樣設定是否能生成更多不同風格的措辭

Explanation: 工具已回傳本次真實狀態，需檢查模型是否以該結果作答。增加對話、禮貌範例或措辭變化不能直接修正結果與回覆不一致。

### Q243 — key B

**Before**

工具型 AI 的安全設計除了讓模型選工具外，還應重視哪個核心原則？

- A. 把 API 金鑰寫進 Prompt 即可安全使用
- B. 讓模型以受控方式呼叫外部工具／資料來源，並用真實回傳結果完成任務
- C. 只提高 Temperature 就能讓模型取得即時庫存
- D. 工具呼叫等同把外部資料永久訓練進模型

Explanation: Tool/Function Calling 與工具協定可讓模型存取外部能力；安全上仍需權限、參數驗證、最小權限與輸出檢查。

**After**

客服模型可呼叫訂單查詢工具。使用者請求讀取另一位客戶的訂單，工具層應如何處理？

- A. 依模型對需求的理解執行，再把操作寫入日誌
- B. 依登入者的存取權限檢查，不符權限便拒絕
- C. 依參數是否符合資料型別執行，再遮蔽部分文字
- D. 依工具是否列在可用清單執行，再限制回傳長度

Explanation: 可用工具、正確型別或操作日誌不能替代資料存取授權。工具層應驗證登入者對該筆訂單的權限，避免模型請求越權讀取。

### Q244 — key B

**Before**

多輪任務中 Agent 常忘記先前已確認的需求，較好的記憶設計是？

- A. 記憶越多一定越準確，因此不需刪除過期資訊
- B. 將必要狀態以受控的短期上下文、摘要或外部記憶保存，並管理版本與權限
- C. 把所有歷史內容永久塞入每次 Prompt
- D. 每個 Agent 都應各自維護互不一致的真相

Explanation: Agent 記憶需兼顧上下文長度、資訊新鮮度、隱私、版本與權限。可使用摘要、狀態儲存或檢索式記憶。

**After**

長任務中使用者已確認交付期限，但後續對話把這項需求擠出上下文。哪種記憶設計最能減少需求遺失？

- A. 保留最近幾輪對話，以對話順序推測已確認的期限
- B. 保存已確認需求的狀態，每次規劃時載入必要欄位
- C. 保留模型最近的草稿，以草稿措辭推測已確認期限
- D. 保存常見專案的範例，每次規劃時套用範例期限

Explanation: 已確認的需求應作為明確任務狀態保存，並在需要時載入。近期對話、模型草稿或專案範例不能可靠地代表使用者已確認的期限。

### Q245 — key B

**Before**

多 Agent 協作時 A 已更新客戶地址、B 還用舊地址，最需要改善哪個機制？

- A. 把所有歷史內容永久塞入每次 Prompt
- B. 將必要狀態以受控的短期上下文、摘要或外部記憶保存，並管理版本與權限
- C. 每個 Agent 都應各自維護互不一致的真相
- D. 記憶越多一定越準確，因此不需刪除過期資訊

Explanation: Agent 記憶需兼顧上下文長度、資訊新鮮度、隱私、版本與權限。可使用摘要、狀態儲存或檢索式記憶。

**After**

Agent A 已將客戶地址更新為版本 8，Agent B 仍使用版本 7。B 寫入前最應增加哪種機制？

- A. 比較兩個地址的字數，選擇資訊較完整的一份
- B. 核對共享狀態的版本，發現過期時重新讀取
- C. 比較兩次回覆的語氣，選擇措辭較肯定的一份
- D. 核對模型輸出的時間，直接採用較晚生成的內容

Explanation: 共享狀態版本可辨識過期資料，寫入前應重新讀取或處理版本衝突。字數、語氣及模型輸出時間不等同於權威資料的更新版本。

### Q246 — key D

**Before**

長期 AI 助理要記住偏好，但不能無限制保存敏感資訊。下列設計較合理？

- A. 記憶越多一定越準確，因此不需刪除過期資訊
- B. 每個 Agent 都應各自維護互不一致的真相
- C. 把所有歷史內容永久塞入每次 Prompt
- D. 將必要狀態以受控的短期上下文、摘要或外部記憶保存，並管理版本與權限

Explanation: Agent 記憶需兼顧上下文長度、資訊新鮮度、隱私、版本與權限。可使用摘要、狀態儲存或檢索式記憶。

**After**

長期助理要記住使用者偏好，產品已定義只保存必要偏好的政策。哪種儲存設計最符合這項政策？

- A. 保存完整聊天紀錄，依回覆需要逐次抽取偏好
- B. 保存所有個人欄位，依欄位數量決定存取順序
- C. 保存每次模型草稿，依生成時間覆寫舊有偏好
- D. 保存必要偏好，依使用者範圍控制讀寫權限

Explanation: 明確保存必要偏好並按使用者範圍控制存取，符合題述資料最小化政策。完整紀錄、所有個人欄位或模型草稿包含不必要資訊或不可靠狀態。

### Q247 — key A

**Before**

Agent 工作流程跨多步驟執行，如何避免每一步上下文互相矛盾？

- A. 將必要狀態以受控的短期上下文、摘要或外部記憶保存，並管理版本與權限
- B. 每個 Agent 都應各自維護互不一致的真相
- C. 記憶越多一定越準確，因此不需刪除過期資訊
- D. 把所有歷史內容永久塞入每次 Prompt

Explanation: Agent 記憶需兼顧上下文長度、資訊新鮮度、隱私、版本與權限。可使用摘要、狀態儲存或檢索式記憶。

**After**

Agent 流程在「已確認訂單、尚未付款」時中斷。恢復時應如何避免把模型草稿誤當成已完成付款？

- A. 讀取持久化步驟狀態，再核對付款工具的結果
- B. 讀取最近一次生成草稿，依草稿中的語句續接
- C. 讀取原始使用者需求，依預期完成流程續接
- D. 讀取相似任務的紀錄，依過往成功案例續接

Explanation: 恢復執行應依已保存的步驟狀態與工具結果判斷完成情況。草稿、需求及相似案例都不能證明本次付款已完成。

### Q248 — key A

**Before**

關於 Agent memory，下列哪一項最符合可維運與隱私兼顧的做法？

- A. 將必要狀態以受控的短期上下文、摘要或外部記憶保存，並管理版本與權限
- B. 每個 Agent 都應各自維護互不一致的真相
- C. 記憶越多一定越準確，因此不需刪除過期資訊
- D. 把所有歷史內容永久塞入每次 Prompt

Explanation: Agent 記憶需兼顧上下文長度、資訊新鮮度、隱私、版本與權限。可使用摘要、狀態儲存或檢索式記憶。

**After**

使用者將偏好從「紙本通知」改為「電子通知」。長期記憶仍檢索到舊偏好，哪種維護方式最適當？

- A. 更新有效偏好並標記舊版失效，檢索時優先使用有效版本
- B. 把兩種偏好合併為並列選項，回覆時依模型措辭自行挑選
- C. 保留原偏好作為主要設定，回覆時以新對話補充模型提示
- D. 按偏好文字長度決定優先序，檢索時優先使用較完整版本

Explanation: 偏好變更需要管理有效版本及舊版失效狀態，避免過期記憶持續影響行為。並列、保留原設定或依字數排序都無法可靠辨識目前偏好。

### Q249 — key D

**Before**

模型上下文有限時，長任務的狀態管理最合理的方式是？

- A. 每個 Agent 都應各自維護互不一致的真相
- B. 把所有歷史內容永久塞入每次 Prompt
- C. 記憶越多一定越準確，因此不需刪除過期資訊
- D. 將必要狀態以受控的短期上下文、摘要或外部記憶保存，並管理版本與權限

Explanation: Agent 記憶需兼顧上下文長度、資訊新鮮度、隱私、版本與權限。可使用摘要、狀態儲存或檢索式記憶。

**After**

上下文有限，Agent 長任務還要保留已確認需求、未完成步驟及可追查依據。哪種記憶安排較合理？

- A. 只保留最後一輪對話，將先前需求交由模型推測
- B. 只保留整段對話摘要，移除任務步驟與來源紀錄
- C. 只保留最近模型草稿，將其中描述當成目前狀態
- D. 維護精簡任務狀態，另存來源紀錄供需要時檢索

Explanation: 精簡狀態保留需求與進度，外部來源紀錄保留追查能力，可降低每次上下文負擔。最後對話或草稿可能遺失已確認事項，只有摘要則可能缺少細節依據。

### Q250 — key C

**Before**

AI 產出採購單 JSON 後會直接呼叫下單 API，為降低錯誤，最重要的設計是？

- A. 只要模型輸出看起來像 JSON 就直接執行
- B. 取消驗證可降低延遲且不增加風險
- C. 要求結構化 schema，並在下游執行前做型別、必填欄位與業務規則驗證
- D. 提高 Temperature 可消除格式錯誤

Explanation: LLM 輸出若要進入自動化流程，應以 JSON/schema 等方式約束，並由應用程式驗證型別、欄位、範圍與業務規則。

**After**

AI 產出採購單 JSON 後將呼叫下單 API。哪種檢查最能區分「可解析」與「可執行的有效訂單」？

- A. 確認 JSON 可解析，再檢查必填欄位是否都已出現
- B. 確認 JSON 可解析，再檢查各個欄位的型別是否符合
- C. 確認 JSON 可解析，再檢查欄位型別與下單業務規則
- D. 確認 JSON 可解析，再檢查訂單金額是否為非負值

Explanation: JSON 可解析只表示語法成立；有效訂單還需符合 schema 的欄位型別與必填要求，以及商品、金額或權限等業務規則。僅檢查必填、型別或單一金額範圍都不能涵蓋完整下單條件。

### Q251 — key D

**Before**

模型回傳的 amount 偶爾變成文字或負數，下游仍照常執行。應優先增加？

- A. 只要模型輸出看起來像 JSON 就直接執行
- B. 提高 Temperature 可消除格式錯誤
- C. 取消驗證可降低延遲且不增加風險
- D. 要求結構化 schema，並在下游執行前做型別、必填欄位與業務規則驗證

Explanation: LLM 輸出若要進入自動化流程，應以 JSON/schema 等方式約束，並由應用程式驗證型別、欄位、範圍與業務規則。

**After**

amount 欄位要求數值且不得為負。模型回傳字串 "100" 或數值 -5，驗證層應如何判定？

- A. 兩者都通過，因為都能在畫面上顯示為金額
- B. 字串通過、負數不通過，因為字串看起來是數字
- C. 字串不通過、負數通過，因為負數仍是數值型別
- D. 兩者都不通過，因為分別違反型別及數值範圍

Explanation: 字串 "100" 不符合數值型別，-5 不符合非負範圍。若系統需要轉型，應有明確轉換流程，不能將原始資料直接視為通過驗證。

### Q252 — key D

**Before**

生成式 AI 輸出將作為機器可執行資料時，哪一項做法較安全？

- A. 提高 Temperature 可消除格式錯誤
- B. 只要模型輸出看起來像 JSON 就直接執行
- C. 取消驗證可降低延遲且不增加風險
- D. 要求結構化 schema，並在下游執行前做型別、必填欄位與業務規則驗證

Explanation: LLM 輸出若要進入自動化流程，應以 JSON/schema 等方式約束，並由應用程式驗證型別、欄位、範圍與業務規則。

**After**

JSON Schema 定義 customerId 的型別為字串，並將它列為 required。模型輸出 {}，應如何判定？

- A. 通過，因為空物件仍是合法的 JSON 語法
- B. 通過，因為型別檢查只需處理已出現欄位
- C. 不通過，因為物件中的欄位未依字母排序
- D. 不通過，因為缺少指定的必填欄位

Explanation: required 要求指定欄位實際存在。空物件雖可解析成 JSON，仍缺少 customerId 而不符合此 schema；欄位排序並非此處的限制。

### Q253 — key B

**Before**

要求模型輸出固定 schema 的目的之一是？

- A. 提高 Temperature 可消除格式錯誤
- B. 要求結構化 schema，並在下游執行前做型別、必填欄位與業務規則驗證
- C. 取消驗證可降低延遲且不增加風險
- D. 只要模型輸出看起來像 JSON 就直接執行

Explanation: LLM 輸出若要進入自動化流程，應以 JSON/schema 等方式約束，並由應用程式驗證型別、欄位、範圍與業務規則。

**After**

要求模型輸出固定 schema，對下一個自動化節點最直接的價值為何？

- A. 將每筆資料的內容固定，讓所有訂單金額保持相同
- B. 將欄位與型別要求明確化，讓程式可依規格驗證資料
- C. 將每次生成的措辭固定，讓所有說明文字保持相同
- D. 將外部系統的狀態固定，讓所有 API 呼叫結果相同

Explanation: Schema 明確定義結構、欄位及型別等約束，方便程式驗證與串接。它不固定每筆資料內容、自然語言措辭或外部系統狀態。

### Q254 — key B

**Before**

AI workflow 需要穩定傳遞欄位給下一個節點，除了 Prompt 還應做什麼？

- A. 只要模型輸出看起來像 JSON 就直接執行
- B. 要求結構化 schema，並在下游執行前做型別、必填欄位與業務規則驗證
- C. 提高 Temperature 可消除格式錯誤
- D. 取消驗證可降低延遲且不增加風險

Explanation: LLM 輸出若要進入自動化流程，應以 JSON/schema 等方式約束，並由應用程式驗證型別、欄位、範圍與業務規則。

**After**

訂單 JSON 符合 schema，但商品編號不存在於目前商品目錄。下一個節點在下單前應如何處理？

- A. 依 schema 通過結果直接下單，讓模型稍後補充商品說明
- B. 依商品目錄驗證編號，無有效商品時停止並回報修正需求
- C. 依模型說明的完整程度下單，讓商品名稱代替編號使用
- D. 依 JSON 欄位的排列順序下單，讓第一個欄位作為商品鍵

Explanation: 符合結構不代表業務資料正確。商品存在性需查對權威目錄，查無商品時應停止下單並要求修正，不能靠文字說明或欄位排序代替。

### Q255 — key A

**Before**

下列哪一項最能降低 LLM 格式錯誤直接影響交易系統的風險？

- A. 要求結構化 schema，並在下游執行前做型別、必填欄位與業務規則驗證
- B. 只要模型輸出看起來像 JSON 就直接執行
- C. 取消驗證可降低延遲且不增加風險
- D. 提高 Temperature 可消除格式錯誤

Explanation: LLM 輸出若要進入自動化流程，應以 JSON/schema 等方式約束，並由應用程式驗證型別、欄位、範圍與業務規則。

**After**

交易前驗證發現模型輸出的數量欄位缺失。哪種錯誤處理最能避免格式問題直接進入交易系統？

- A. 阻擋此次交易並回傳欄位錯誤，修正後重新驗證
- B. 套用上一筆交易的數量欄位，完成後再記錄差異
- C. 以模型生成的摘要推測數量，完成後再通知使用者
- D. 省略此筆數量欄位提交交易，完成後再補上欄位

Explanation: 缺少必要欄位應阻擋交易、回報可修正的錯誤並重新驗證。沿用前筆、推測或事後補欄位可能造成錯誤交易。

### Q268 — key A

**Before**

某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，數百頁報告超過模型 context window，團隊仍要產生全書摘要，較合理的做法是？

- A. 長文件超過 context window 時，可採切分、分層摘要或檢索，只放最相關內容進上下文
- B. 將所有文件重複貼多次可避免截斷
- C. context window 越小越能保留完整文件
- D. 超過 context window 時只要提高 Temperature

Explanation: 大型語言模型有有限上下文長度。長文任務通常需切分、Map-Reduce/Hierarchical summarization、RAG 或摘要記憶等方法。

**After**

數百頁報告超過模型上下文，團隊要摘要涵蓋全書各章。哪種方式最符合這項覆蓋需求？

- A. 逐章摘要並保留來源，再合併摘要檢查各章覆蓋
- B. 選取開頭數頁作摘要，再以開頭內容代表全書
- C. 檢索少量相似段落作摘要，再以檢索結果代表全書
- D. 選取最後一章作摘要，再以最後內容代表全書

Explanation: 全書摘要可先切分逐章處理，再合併並檢查覆蓋，保留來源以核對細節。只取開頭、少量檢索片段或末章不能確保涵蓋全部章節。

### Q269 — key C

**Before**

長篇會議紀錄無法一次放進模型，如何兼顧重要資訊與成本？

- A. context window 越小越能保留完整文件
- B. 超過 context window 時只要提高 Temperature
- C. 長文件超過 context window 時，可採切分、分層摘要或檢索，只放最相關內容進上下文
- D. 將所有文件重複貼多次可避免截斷

Explanation: 大型語言模型有有限上下文長度。長文任務通常需切分、Map-Reduce/Hierarchical summarization、RAG 或摘要記憶等方法。

**After**

長篇會議紀錄不能一次放入上下文。任務是整理所有決議與待辦，哪種分段摘要設計較適當？

- A. 各段只保留情緒摘要，合併時再推測決議與待辦
- B. 各段只保留發言長度，合併時以字數決定重要性
- C. 各段保留決議、負責人及期限，合併時核對遺漏
- D. 各段只保留最後一句，合併時以發言順序補全

Explanation: 摘要欄位應配合任務，保存決議、負責人與期限，並在合併時核對遺漏或衝突。情緒、字數或最後一句不能可靠涵蓋全部決議。

### Q270 — key B

**Before**

某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，LLM Context Window 不足時，下列哪個解法最適當？

- A. context window 越小越能保留完整文件
- B. 長文件超過 context window 時，可採切分、分層摘要或檢索，只放最相關內容進上下文
- C. 超過 context window 時只要提高 Temperature
- D. 將所有文件重複貼多次可避免截斷

Explanation: 大型語言模型有有限上下文長度。長文任務通常需切分、Map-Reduce/Hierarchical summarization、RAG 或摘要記憶等方法。

**After**

上下文總預算為 8,000 tokens，其中指令與問題占 1,000，另預留輸出 1,500。忽略其他開銷，文件最多可占多少？

- A. 6,500 tokens，僅扣除預留輸出的額度
- B. 5,500 tokens，扣除指令問題與輸出額度
- C. 7,000 tokens，僅扣除指令問題的額度
- D. 8,000 tokens，文件另有獨立的輸入額度

Explanation: 依題設總預算計算：8,000−1,000−1,500=5,500 tokens。實際系統還需考量訊息等開銷與模型限制；本題已明確忽略其他開銷。

### Q271 — key B

**Before**

某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，企業把整個知識庫每次都塞進 Prompt，成本高且超長。應如何改進？

- A. 超過 context window 時只要提高 Temperature
- B. 長文件超過 context window 時，可採切分、分層摘要或檢索，只放最相關內容進上下文
- C. 將所有文件重複貼多次可避免截斷
- D. context window 越小越能保留完整文件

Explanation: 大型語言模型有有限上下文長度。長文任務通常需切分、Map-Reduce/Hierarchical summarization、RAG 或摘要記憶等方法。

**After**

企業知識庫很大，但每次問答只需要少數相關條款。哪種安排最能減少每次送入模型的文件量？

- A. 固定載入字數最多的文件，依文件長度推測相關性
- B. 先依問題檢索相關片段，再將片段放入模型上下文
- C. 固定載入最早建立的文件，依建立時間推測相關性
- D. 先將所有文件接成長字串，再截取字串開頭的片段

Explanation: 問題導向檢索能在有限上下文中提供相關內容。文件長度、建立時間或固定截取開頭不能可靠代表與本次問題相關；檢索品質仍需驗證。

### Q272 — key B

**Before**

某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，處理超長文件時，分層摘要的主要價值是？

- A. 將所有文件重複貼多次可避免截斷
- B. 長文件超過 context window 時，可採切分、分層摘要或檢索，只放最相關內容進上下文
- C. context window 越小越能保留完整文件
- D. 超過 context window 時只要提高 Temperature

Explanation: 大型語言模型有有限上下文長度。長文任務通常需切分、Map-Reduce/Hierarchical summarization、RAG 或摘要記憶等方法。

**After**

長文先產生分段摘要，再將摘要合併成總摘要。這種分層摘要方式主要有何取捨？

- A. 減少模型輸入負擔，但每層摘要都會增加原文細節
- B. 降低單次上下文負擔，但需檢查資訊遺失或扭曲
- C. 保留完整原文內容，但每次合併都需再次載入全書
- D. 縮短每次輸出長度，但無法減少每次載入的原文量

Explanation: 分層摘要降低單次處理的上下文需求，但摘要是有損壓縮，合併時可能遺漏或扭曲重要資訊，應保留來源並核對。它不保證完整保留原文。

### Q273 — key B

**Before**

某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，若任務只需回答與某問題相關的文件片段，不需全文，最適合如何利用有限上下文？

- A. 超過 context window 時只要提高 Temperature
- B. 長文件超過 context window 時，可採切分、分層摘要或檢索，只放最相關內容進上下文
- C. 將所有文件重複貼多次可避免截斷
- D. context window 越小越能保留完整文件

Explanation: 大型語言模型有有限上下文長度。長文任務通常需切分、Map-Reduce/Hierarchical summarization、RAG 或摘要記憶等方法。

**After**

客服問題只涉及某份文件中的退款期限，不需全文摘要。應如何使用有限上下文較適當？

- A. 放入該文件的封面與目錄，依標題推測退款期限
- B. 檢索退款條款與相鄰內容，連同來源提供模型
- C. 放入該文件的首段與末段，依文件位置推測期限
- D. 檢索客服寒暄與回覆範例，依常見措辭推測期限

Explanation: 檢索退款條款及必要相鄰內容可提供期限與適用條件，來源便於核對。封面、固定首末段或回覆範例不足以提供本次問題所需的事實依據。
