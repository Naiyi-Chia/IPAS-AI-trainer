# Issue #66 — Batch 5A remediation evidence

Baseline: `f1f1085` on `question/issue-14-remediation`, after Phase 4 aggregate QA / independent review / dev sync PASS.

## Validation

| Whole-bank metric | Before | After |
| --- | ---: | ---: |
| Self-authored questions / unique IDs | 483 | 483 |
| Uniquely longest correct option | 52 | 52 |
| Correct / average distractor length >= 2x | 0 | 0 |
| Repeated option-set groups | 12 | 4 |
| Questions in repeated option sets | 36 | 12 |

- Scoped audit PASS: exactly 24 specified IDs changed; ID order, protected metadata, answer indices, DB metadata and all HTML/CSS/JS outside DB unchanged. 483 questions / 483 unique IDs.
- All 24 reviewed items have no uniquely longest correct option, no repeated option set anywhere in the bank and correct/average-distractor length ratio <2x; maximum 1.0465x (rounded).
- Answer distribution unchanged: A 131 / B 109 / C 122 / D 121.
- Individual manual content review PASS for all 24; each after-explanation identifies the single answer and excludes alternatives. No metadata or content-error exceptions required.
- Structured-data questions distinguish raw content from fixed fields; minimization distractors distinguish security controls from limiting unnecessary data. Supervised-learning questions distinguish labels, loss and regression target.
- No Code / Low Code items state platform capabilities explicitly rather than assuming every product supports the same extensions. Tokenization / Embedding items distinguish segmentation, vector representation and sequence shape (8 × 16). Object Detection items cover class/box output, localization evaluation and box annotations.
- Mean/median calculations verified: Q076 median 5 versus mean 20; Q077 median 5 versus mean 28; Q078 mean increases 20, median remains 4.
- p-value items state preselected decision rules and model assumptions, distinguish threshold decisions from posterior probability / effect size, and avoid claiming statistical significance proves a hypothesis or practical importance.
- Inline JavaScript syntax PASS: one script compiled with Node vm.Script.
- Headless Edge QA PASS at 1280×900 and 375×900: all 24 items render and score in Practice and Mock, including exact displayed options, feedback, explanations and self-authored source labels in Practice; wrong-answer review verifies question, user answer, key and explanation in Mock.
- Mock: L11 8/9 correct (89%); L12 2/3 (67%); L21 5/6 (83%); L22 5/6 (83%). Each has one intentional wrong answer, zero blanks; four native submission confirmations per viewport.
- Wrong book records Q007, removes it after correct retry; L11201 weak area displays 2/3 (67%). Official 115-year second-paper loader and all seven tabs open normally. No document horizontal overflow, page/console errors/warnings or HTTP errors.
- Browser fixture filters only self-authored DB records to the 24 scoped IDs for deterministic coverage; app logic/assets/official loader remain unchanged. Fresh profiles do not change existing user progress. Representative mobile Practice and Mock screenshots visually reviewed: readable text, options, explanation and controls.
- git diff --check: PASS.

Reference checked: [ASA Statement on p-Values](https://doi.org/10.1080/00031305.2016.1154108), retrieved 2026-10-04, for p-value interpretation and limitations. This supports self-authored content, not official iPAS past-paper attribution.

Reproduce:

```text
python scripts/audit_question_cues.py --baseline f1f1085 --batch batch5a --csv docs/QUESTION_CUE_BIAS_BATCH5A.csv
NODE_PATH=<existing runtime node_modules> node scripts/test_question_batch5a.cjs <output-directory>
```

Evidence: [audit CSV](QUESTION_CUE_BIAS_BATCH5A.csv), [browser results](QUESTION_CUE_BIAS_BATCH5A_BROWSER.json), [mobile NLP Practice](qa/issue-66/practice-Q049-375.png), [mobile p-value Practice](qa/issue-66/practice-Q082-375.png), [mobile Mock review](qa/issue-66/mock-L22-375.png).

## Individual content review

Each item was reviewed for a single correct answer, grammatical parallelism, plausible concept-specific distractors and absence of length/completeness cues. Protected answer positions and metadata are unchanged. These are self-authored practice items.

### Q007 — 結構化與非結構化資料 (key C)

Before: 下列何者最典型屬於結構化資料？
- A. 無法分類資料
- B. 非結構化資料
- C. 結構化資料
- D. 僅影像資料
Before explanation: 具有固定 schema、欄位與型別的表格／關聯式資料通常屬結構化資料。

After: 下列哪一份原始資料具有固定欄位與型別，最典型屬於結構化資料？
- A. 客服通話的原始錄音檔
- B. 顧客自由撰寫的評論內文
- C. 訂單編號與金額的資料表
- D. 門市攝影機的原始影片檔
After explanation / single-answer review: 訂單資料表以固定欄位與型別記錄每筆資料，屬結構化資料。原始錄音、自由文字與影片的內容沒有同樣的表格結構。
Cue review: ratio 1.0312x; unique-longest=False; repeated set=False.

### Q008 — 結構化與非結構化資料 (key D)

Before: 若資料以固定欄位與型別儲存在關聯式資料庫中，通常稱為？
- A. 非結構化資料
- B. 僅影像資料
- C. 無法分類資料
- D. 結構化資料
Before explanation: 具有固定 schema、欄位與型別的表格／關聯式資料通常屬結構化資料。

After: 訂單金額原本存於固定欄位。若改為在客服筆記中自由描述金額與原因，就筆記內文而言，資料結構如何改變？
- A. 變為每個欄位型別固定的表格
- B. 變為已有明確標籤的 XML 文件
- C. 變為每筆都有相同鍵值的 JSON
- D. 變為需另行抽取欄位的自由文字
After explanation / single-answer review: 原本的金額欄位有固定結構；自由敘述的筆記內文屬非結構化文字，需額外抽取欄位。XML 標籤及 JSON 鍵值提供的組織方式與題述自由文字不同。
Cue review: ratio 1.0000x; unique-longest=False; repeated set=False.

### Q009 — 結構化與非結構化資料 (key A)

Before: 訂單表包含 order_id、date、amount 等固定欄位，最接近哪一類資料？
- A. 結構化資料
- B. 無法分類資料
- C. 僅影像資料
- D. 非結構化資料
Before explanation: 具有固定 schema、欄位與型別的表格／關聯式資料通常屬結構化資料。

After: 訂單表有 order_id、date、amount 欄位，另附客戶錄音檔。要查詢每月訂單金額，哪種作法直接利用結構化部分？
- A. 依日期欄位分組並加總金額
- B. 將錄音轉成文字再推測金額
- C. 依錄音檔案大小估算訂單金額
- D. 以錄音的音量分類各月營收
After explanation / single-answer review: 日期與金額已是可直接查詢的欄位，按月份分組後加總即可。錄音內容、檔案大小與音量都不是這份訂單表的金額欄位，無須用它們替代已有資料。
Cue review: ratio 0.9730x; unique-longest=False; repeated set=False.

### Q013 — 資料最小化 (key D)

Before: AI 專案蒐集個資時，何者最符合資料最小化？
- A. 將個資直接放進公開提示詞
- B. 取消權限控管以方便開發
- C. 先蒐集所有可能用到的個資並永久保存
- D. 只蒐集達成明確目的所必要的資料
Before explanation: 資料最小化要求蒐集與處理的資料應限於達成目的所必要、相稱的範圍。

After: 公司建立客服等待時間預測模型，只需來電時段、案件類型與等候秒數。哪個蒐集方案符合資料最小化？
- A. 加收住址以供日後規劃服務據點
- B. 加收證件號碼以便其他專案使用
- C. 加收家庭成員以供後續客群分析
- D. 限收時段、類型與等候秒數
After explanation / single-answer review: 資料最小化將蒐集範圍限制在明確目的所需資料。題目已指定預測所需欄位，住址、證件號碼與家庭成員都沒有已確認的必要性，未來可能使用不能取代當前目的。
Cue review: ratio 0.8571x; unique-longest=False; repeated set=False.

### Q014 — 資料最小化 (key C)

Before: 某欄位含敏感資訊且與模型目的無關，最合理的處理是？
- A. 取消權限控管以方便開發
- B. 先蒐集所有可能用到的個資並永久保存
- C. 只蒐集達成明確目的所必要的資料
- D. 將個資直接放進公開提示詞
Before explanation: 資料最小化要求蒐集與處理的資料應限於達成目的所必要、相稱的範圍。

After: 模型訓練資料中有與預測目的無關的健康紀錄欄位。就減少不必要個資處理而言，應採取哪個作法？
- A. 保留健康紀錄但改用代碼欄名
- B. 保留健康紀錄並加密完整內容
- C. 排除該欄位後再製作訓練集
- D. 保留健康紀錄但限制讀取帳號
After explanation / single-answer review: 與目的無關的欄位應排除，避免不必要的處理。改欄名、加密與權限限制可能是保護措施，但仍保留並處理不必要的健康紀錄，沒有達成題述的最小化目標。
Cue review: ratio 0.9231x; unique-longest=False; repeated set=False.

### Q015 — 資料最小化 (key D)

Before: 要降低 AI 專案的隱私風險，資料蒐集階段應優先採取？
- A. 先蒐集所有可能用到的個資並永久保存
- B. 取消權限控管以方便開發
- C. 將個資直接放進公開提示詞
- D. 只蒐集達成明確目的所必要的資料
Before explanation: 資料最小化要求蒐集與處理的資料應限於達成目的所必要、相稱的範圍。

After: 送貨延遲分析只需要行政區層級的位置，不需要辨識收件人。建立分析資料集時，哪個位置處理方案最符合資料最小化？
- A. 提供完整門牌後再限制分析權限
- B. 提供完整門牌並改用加密檔傳送
- C. 提供完整門牌但改寫地址欄名稱
- D. 提供所需行政區並省略門牌
After explanation / single-answer review: 當行政區已能滿足分析目的，就應只提供該粒度的位置資料。權限與加密降低暴露風險，改欄名改變呈現，但三者都未減少不必要的完整門牌內容。
Cue review: ratio 0.8571x; unique-longest=False; repeated set=False.

### Q019 — 監督式學習 (key B)

Before: 已有「垃圾郵件／正常郵件」標籤，希望預測新郵件類別，最適合？
- A. 強化式學習
- B. 監督式學習
- C. 非監督式學習
- D. 關聯規則
Before explanation: 監督式學習使用有標籤資料學習輸入到目標的映射，可用於分類或迴歸。

After: 郵件資料附有「垃圾／正常」人工標籤。若要用監督式學習建立分類器，訓練時應使用哪種配對？
- A. 郵件內容與隨機指派的群集編號
- B. 郵件內容與對應的垃圾／正常標籤
- C. 郵件內容與信箱儲存空間的容量
- D. 郵件內容與寄件伺服器當日的負載
After explanation / single-answer review: 監督式分類利用輸入及其正確目標標籤學習對應關係。隨機群集編號不是人工類別標籤；容量與負載也不是題目要預測的郵件類別。
Cue review: ratio 1.0465x; unique-longest=False; repeated set=False.

### Q020 — 監督式學習 (key B)

Before: 利用已標註的瑕疵／正常影像訓練分類器，屬於哪種學習？
- A. 關聯規則
- B. 監督式學習
- C. 非監督式學習
- D. 強化式學習
Before explanation: 監督式學習使用有標籤資料學習輸入到目標的映射，可用於分類或迴歸。

After: 工廠已有人工標註為「瑕疵／正常」的影像。哪個方案利用這些標籤進行監督式分類？
- A. 忽略標籤，依影像相似度建立群集
- B. 以影像預測類別，再依標籤計算損失
- C. 移除標籤，找出影像之間的共現規則
- D. 用產線操作的回饋訓練排程決策策略
After explanation / single-answer review: 監督式分類用模型預測與已知類別標籤的差異作為訓練訊號。相似度分群與共現分析不利用這些類別標籤；排程策略的回饋學習則不是題述影像分類任務。
Cue review: ratio 1.0213x; unique-longest=False; repeated set=False.

### Q021 — 監督式學習 (key D)

Before: 用歷史房屋特徵與成交價格訓練模型預測新房價，屬於？
- A. 強化式學習
- B. 非監督式學習
- C. 關聯規則
- D. 監督式學習
Before explanation: 監督式學習使用有標籤資料學習輸入到目標的映射，可用於分類或迴歸。

After: 以歷史房屋特徵及成交價格訓練模型，預測新屋的成交價格。這項監督式學習的目標變數是什麼？
- A. 房屋特徵中記錄的室內面積
- B. 房屋特徵中記錄的建築屋齡
- C. 房屋特徵中記錄的所在樓層
- D. 歷史交易記錄的成交價格
After explanation / single-answer review: 成交價格是每筆訓練資料對應的已知數值目標，因此這是監督式迴歸。面積、屋齡與樓層是用來預測價格的輸入特徵，不是此任務的目標變數。
Cue review: ratio 0.9167x; unique-longest=False; repeated set=False.

### Q031 — 限制與選型 (key C)

Before: 何種情況下 Low Code 通常比 No Code 更適合？
- A. 完全不需要整合且流程極簡單時才使用 Low Code
- B. 所有企業系統都應一律改為 No Code
- C. 需要更高客製性、複雜邏輯或深度系統整合時
- D. No Code 沒有任何擴充或平台依賴風險
Before explanation: Low Code 較能加入程式化客製；No Code 的優點是快速，但複雜整合、效能、治理或平台鎖定可能成為限制。

After: 團隊比較兩個平台：No Code 平台無法實作所需的自訂計價規則；Low Code 平台允許加入程式，團隊也具備維護能力。哪個選型較合理？
- A. 選 No Code，改用近似規則取代必要規則
- B. 選 No Code，以較短建置時間作為決定依據
- C. 選 Low Code，補上所需的計價邏輯
- D. 選 Low Code，並以編輯器外觀作為決定依據
After explanation / single-answer review: 選型應先滿足必要業務需求。題述 Low Code 的程式擴充可實作計價規則，且團隊能維護；近似規則、建置時間或外觀都不足以取代這項必要能力。
Cue review: ratio 0.8571x; unique-longest=False; repeated set=False.

### Q032 — 限制與選型 (key D)

Before: 若流程需要複雜商業邏輯與自訂 API 整合，較合理的選擇是？
- A. 所有企業系統都應一律改為 No Code
- B. 完全不需要整合且流程極簡單時才使用 Low Code
- C. No Code 沒有任何擴充或平台依賴風險
- D. 需要更高客製性、複雜邏輯或深度系統整合時
Before explanation: Low Code 較能加入程式化客製；No Code 的優點是快速，但複雜整合、效能、治理或平台鎖定可能成為限制。

After: 採購 Low Code 平台前，團隊需串接既有 API 並實作自訂驗證。哪項驗證最能支持技術選型？
- A. 用展示頁面確認平台的視覺風格
- B. 用空白專案確認帳號的登入流程
- C. 用範本列表確認可選的介面數量
- D. 以原型測試 API 與自訂驗證
After explanation / single-answer review: 應以概念驗證實際檢查必要的 API 串接及自訂驗證是否可行。展示風格、登入與範本數量可提供其他資訊，但不能證明這兩項整合需求已受支援。
Cue review: ratio 0.9286x; unique-longest=False; repeated set=False.

### Q033 — 限制與選型 (key C)

Before: No Code 的常見限制之一是？
- A. 完全不需要整合且流程極簡單時才使用 Low Code
- B. No Code 沒有任何擴充或平台依賴風險
- C. 需要更高客製性、複雜邏輯或深度系統整合時
- D. 所有企業系統都應一律改為 No Code
Before explanation: Low Code 較能加入程式化客製；No Code 的優點是快速，但複雜整合、效能、治理或平台鎖定可能成為限制。

After: 某 No Code 平台的業務規則只能用內建積木組合，且無程式擴充入口。當需求超出積木能力時，最直接的限制是什麼？
- A. 平台授權費用難以按使用量估算
- B. 平台帳號權限難以按角色分配
- C. 自訂邏輯難以在此平台內實作
- D. 平台操作紀錄難以按日期查詢
After explanation / single-answer review: 題目明確限定規則只能使用內建積木且不能擴充，因此主要限制是難以實作超出支援範圍的自訂邏輯。題述沒有指出費用、權限或紀錄查詢有問題。
Cue review: ratio 0.9750x; unique-longest=False; repeated set=False.

### Q049 — Tokenization / Embedding (key D)

Before: NLP 中將連續文字切成可處理的詞或子詞單位，稱為？
- A. PCA
- B. Lemmatization
- C. Bagging
- D. Tokenization
Before explanation: Tokenization 是把文字分割成 token 的過程，是 NLP 與 LLM 的基本處理步驟。

After: 文字模型將「unhappiness」切成數個子詞，之後才將各單位轉為向量。切成子詞的這一步稱為什麼？
- A. 詞形還原（Lemmatization）
- B. 位置編碼（Positional Encoding）
- C. 向量表示（Embedding）
- D. 斷詞處理（Tokenization）
After explanation / single-answer review: Tokenization 將文字切成詞、子詞或其他 token 單位。Embedding 把單位映射成向量；詞形還原處理詞形；位置編碼提供序列位置資訊，三者與切分步驟不同。
Cue review: ratio 0.9310x; unique-longest=False; repeated set=False.

### Q050 — Tokenization / Embedding (key B)

Before: 大型語言模型在處理文字前，常先把字串切為 token，這一步是？
- A. Bagging
- B. Tokenization
- C. Lemmatization
- D. PCA
Before explanation: Tokenization 是把文字分割成 token 的過程，是 NLP 與 LLM 的基本處理步驟。

After: 文字已切成 token，模型再依 token ID 查表取得稠密向量。這個查表步驟的主要用途是什麼？
- A. 將文字序列依子詞邊界分段
- B. 將 token 轉成稠密向量
- C. 將不同詞形還原成字典詞形
- D. 將序列各位置編碼成位置訊號
After explanation / single-answer review: Embedding 查表將離散 token ID 映射成可供模型運算的稠密向量。切分文字是 Tokenization；詞形還原與位置編碼處理的是不同資訊，並非此處 token 向量查表的用途。
Cue review: ratio 0.9730x; unique-longest=False; repeated set=False.

### Q051 — Tokenization / Embedding (key A)

Before: 某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，「將文本切成基本處理單位」最接近哪一項？
- A. Tokenization
- B. PCA
- C. Lemmatization
- D. Bagging
Before explanation: Tokenization 是把文字分割成 token 的過程，是 NLP 與 LLM 的基本處理步驟。

After: 客服模型的 tokenizer 把同一句話切成 8 個 token，embedding 層每個 token 輸出 16 維向量。先不考慮批次維度，向量序列形狀為何？
- A. 8 × 16
- B. 16 × 8
- C. 8 × 8
- D. 16 × 16
After explanation / single-answer review: 序列包含 8 個 token，每個 token 各有 16 個向量分量，因此形狀為序列長度 × 向量維度，即 8 × 16。16 × 8 顛倒軸意義；其餘形狀混淆了序列長度與向量維度。
Cue review: ratio 1.0000x; unique-longest=False; repeated set=False.

### Q052 — Object Detection (key B)

Before: 要找出圖片中每一台車的位置並輸出 bounding box，應使用哪種任務？
- A. Regression only
- B. Object Detection
- C. Text Summarization
- D. Image Classification
Before explanation: Object Detection 同時預測物件類別與位置；若需像素層級標註則更接近 Segmentation。

After: 交通畫面中有多台車，系統要對每台車輸出類別與矩形框。哪個任務最符合此輸出需求？
- A. 影像分類：預測整張畫面的類別
- B. 物件偵測：預測各車類別與框
- C. 語意分割：預測每個像素的類別
- D. 物件追蹤：串聯各車跨影格的身分
After explanation / single-answer review: 物件偵測對個別物件提供類別及 bounding box。影像分類不提供各車位置；語意分割的基本輸出是像素類別；追蹤處理跨影格身分，題目只要求單張畫面的矩形框。
Cue review: ratio 0.9070x; unique-longest=False; repeated set=False.

### Q053 — Object Detection (key A)

Before: 監視畫面需辨識『有哪些人、每個人在哪裡』，最接近？
- A. Object Detection
- B. Image Classification
- C. Text Summarization
- D. Regression only
Before explanation: Object Detection 同時預測物件類別與位置；若需像素層級標註則更接近 Segmentation。

After: 模型對單張倉庫照片輸出多筆「物件類別、信心分數、矩形框座標」。哪項檢查最直接驗證物件偵測的定位結果？
- A. 比較預測框與人工標註框的重疊
- B. 比較照片檔案與壓縮副本的容量
- C. 比較影像整體亮度與前一天均值
- D. 比較照片拍攝時間與入庫的日期
After explanation / single-answer review: 定位結果需與人工標註的物件位置比較，框的重疊程度可用 IoU 衡量。檔案容量、整體亮度與日期都不是物件框的定位正確性。類別判定則是偵測的另一個評估面向。
Cue review: ratio 1.0000x; unique-longest=False; repeated set=False.

### Q054 — Object Detection (key C)

Before: 輸出不只是整張影像類別，還要標出物件位置，應採用？
- A. Text Summarization
- B. Image Classification
- C. Object Detection
- D. Regression only
Before explanation: Object Detection 同時預測物件類別與位置；若需像素層級標註則更接近 Segmentation。

After: 已有只輸出「有車／無車」的整張影像分類器，現在要框出各台車的位置。要改成物件偵測，訓練標註應增加什麼？
- A. 每張影像的拍攝時間與相機型號
- B. 每張影像的平均亮度與壓縮品質
- C. 每台車的類別及其矩形框座標
- D. 每張影像的檔案容量與儲存路徑
After explanation / single-answer review: 物件偵測需要個別物件的類別與位置標註，矩形框可提供定位目標。時間、相機、亮度、壓縮品質或檔案資訊不能取代每台車的位置標註。
Cue review: ratio 0.9286x; unique-longest=False; repeated set=False.

### Q076 — 平均數與中位數 (key B)

Before: 收入資料有少數極端高薪者，要描述典型水準時，哪個統計量通常較不受極端值影響？
- A. 變異數（Variance）
- B. 中位數（Median）
- C. 全距（Range）
- D. 平均數（Mean）
Before explanation: 中位數依排序位置決定，通常比平均數不受極端值影響。

After: 五筆月收入由小到大為 3、4、5、6、82 萬元。中位數是多少萬元？
- A. 4.5 萬元
- B. 5.0 萬元
- C. 6.0 萬元
- D. 20.0 萬元
After explanation / single-answer review: 五筆資料的中位數是排序後第 3 筆，即 5 萬元。4.5 是錯取第 2、3 筆平均；6 是第 4 筆；20 是五筆總和 100 除以 5 的平均數。極端高收入使平均數高於中位數。
Cue review: ratio 0.9375x; unique-longest=False; repeated set=False.

### Q077 — 平均數與中位數 (key D)

Before: 某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，資料分布明顯右偏且含離群值，若要描述中心位置，何者較穩健？
- A. 平均數（Mean）
- B. 變異數（Variance）
- C. 全距（Range）
- D. 中位數（Median）
Before explanation: 中位數依排序位置決定，通常比平均數不受極端值影響。

After: 四筆感測器讀值排序後為 2、4、6、100。用中位數摘要中心位置，結果是多少？
- A. 4
- B. 6
- C. 28
- D. 5
After explanation / single-answer review: 偶數筆資料的中位數是中間兩筆的平均，(4+6)/2=5。4 或 6 只取其中一筆；28 是全部讀值加總後除以 4 的平均數，較受 100 這個極端值影響。
Cue review: ratio 0.7500x; unique-longest=False; repeated set=False.

### Q078 — 平均數與中位數 (key C)

Before: 比較平均數與中位數，何者通常對極端值較不敏感？
- A. 全距（Range）
- B. 變異數（Variance）
- C. 中位數（Median）
- D. 平均數（Mean）
Before explanation: 中位數依排序位置決定，通常比平均數不受極端值影響。

After: 一組資料排序後為 2、3、4、5、6。若最後一筆由 6 改為 106，平均數與中位數如何改變？
- A. 平均數增加 100，中位數增加 100
- B. 平均數維持 4，中位數增加 20
- C. 平均數增加 20，中位數維持 4
- D. 平均數增加 20，中位數增加 20
After explanation / single-answer review: 一筆增加 100，五筆平均數增加 100/5=20；排序後仍是 2、3、4、5、106，中間第 3 筆仍為 4。中位數看排序位置，沒有隨這筆極端值改變。
Cue review: ratio 0.9130x; unique-longest=False; repeated set=False.

### Q082 — p-value (key D)

Before: 某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，假設檢定得到 p-value = 0.01，顯著水準 α = 0.05，通常如何判斷？
- A. 一定證明替代假設為真
- B. 一定證明 H0 為假
- C. 因 p-value 小所以應提高 H0 的可信度
- D. 拒絕虛無假設 H0（在該顯著水準下）
Before explanation: 當 p-value < α，通常拒絕 H0；但這不等於在哲學上『證明』H0 為假。

After: 企業預先設定顯著水準 α=0.05，並以 p<α 作為拒絕 H0 的規則。檢定所需的模型假設滿足且得到 p=0.01，依此規則應如何判定？
- A. 因為 0.01 小於 0.05，所以不拒絕 H0
- B. 因為 0.01 大於 0.05，所以拒絕 H0
- C. 因為 0.01 等於 0.05，所以暫緩判定
- D. 因為 0.01 小於 0.05，所以拒絕 H0
After explanation / single-answer review: 依預先設定的規則，0.01<0.05，因此拒絕 H0。其他選項誤用拒絕方向或數值比較。這是條件於檢定假設的統計判定，並不證明 H0 為假，也不表示效果具有實務重要性。
Cue review: ratio 0.9828x; unique-longest=False; repeated set=False.

### Q083 — p-value (key D)

Before: 當 p-value 小於預先設定的顯著水準時，典型結論是？
- A. 因 p-value 小所以應提高 H0 的可信度
- B. 一定證明替代假設為真
- C. 一定證明 H0 為假
- D. 拒絕虛無假設 H0（在該顯著水準下）
Before explanation: 當 p-value < α，通常拒絕 H0；但這不等於在哲學上『證明』H0 為假。

After: 同一檢定得到 p=0.03。若拒絕規則為 p<α，在預先設定 α=0.05 與 α=0.01 的兩種情況下，決策分別為何？
- A. α=0.05 不拒絕；α=0.01 拒絕
- B. α=0.05 拒絕；α=0.01 也拒絕
- C. α=0.05 不拒絕；α=0.01 也不拒絕
- D. α=0.05 拒絕；α=0.01 不拒絕
After explanation / single-answer review: 0.03 小於 0.05，但大於 0.01，所以兩種預先設定的門檻分別導致拒絕與不拒絕。不能看完結果才挑選門檻；不拒絕也不代表已證明 H0 成立。
Cue review: ratio 0.9643x; unique-longest=False; repeated set=False.

### Q084 — p-value (key A)

Before: p-value = 0.03 且 α = 0.05，最合理的處理是？
- A. 拒絕虛無假設 H0（在該顯著水準下）
- B. 一定證明替代假設為真
- C. 因 p-value 小所以應提高 H0 的可信度
- D. 一定證明 H0 為假
Before explanation: 當 p-value < α，通常拒絕 H0；但這不等於在哲學上『證明』H0 為假。

After: 某檢定在 H0 及相關模型假設下得到 p=0.03。下列哪項是對 p-value 的正確解讀？
- A. 出現至少同樣極端檢定統計量的機率為 3%
- B. 虛無假設在本次研究中成立的機率為 3%
- C. 替代假設在本次研究中成立的機率為 97%
- D. 本次觀察到的效果量占母體平均值的 3%
After explanation / single-answer review: 在 H0 與相關統計模型假設下，p-value 是得到至少與觀察值同樣極端的檢定統計量的機率，此處為 3%。它不是 H0 或替代假設成立的機率，也不是效果量大小。
Cue review: ratio 1.0364x; unique-longest=False; repeated set=False.
