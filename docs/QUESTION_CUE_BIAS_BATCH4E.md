# Issue #63 — Batch 4E remediation evidence

Baseline: `ea63448` on `question/issue-14-remediation` (includes #62).

## Validation

| Whole-bank metric | Before | After |
| --- | ---: | ---: |
| Self-authored questions / unique IDs | 483 / 483 | 483 / 483 |
| Uniquely longest correct option | 112 | 88 |
| Correct / average distractor length >= 2x | 0 | 0 |
| Repeated option-set groups | 22 | 18 |
| Questions in repeated option sets | 96 | 72 |

- Scoped audit PASS: exactly Q274–Q285, Q292–Q297 and Q352–Q357 changed. ID order, answer indices, protected metadata, DB metadata and HTML/CSS/JS outside DB unchanged.
- All 24 items have no unique-longest correct option and no repeated option set anywhere in the bank. Maximum length ratio: 1.08x.
- Answer distribution unchanged: A 131 / B 109 / C 122 / D 121.
- Individual manual content review PASS for all 24 items; each after-explanation below identifies the single correct answer and explains why alternatives do not fit. No protected metadata changes or verified content-error exceptions required.
- LoRA review: distinguishes frozen base weights, adapter training/storage, rank-dependent parameter count and capacity; does not claim that adapters remove all memory costs or guarantee better quality.
- Segmentation review: distinguishes image labels, boxes, pixel labels and separate instance masks; does not claim guaranteed contour accuracy or physical area without calibration.
- Feasibility review: scenarios separate value evidence, deployment integration, Pilot load testing and ongoing review/maintenance cost rather than repeating a broad checklist.
- Confidence-interval review: explicitly uses frequentist coverage and fixed-method/known-standard-deviation conditions for width comparisons; distinguishes precision from lack of bias.
- Inline JavaScript syntax: PASS (one script compiled using Node vm.Script).
- Headless Edge QA PASS at 1280×900 and 375×900: all 24 scoped items render and score in Practice and Mock. One intentional Practice error recorded and removed after correct retry; L21103 weak-area result 5/6 (83%).
- Mock scores: L21 17/18 (94%), L22 5/6 (83%), one intentional wrong answer each; native submission confirmations and wrong-answer review verified.
- Official 115-year second-paper flow and seven tabs PASS. No document horizontal overflow, page/console warnings/errors or HTTP errors.
- Browser fixture filters only the self-authored DB to the 24 scoped records for deterministic coverage; app logic/assets/official-paper loader unchanged. Fresh profiles preserve existing user progress.
- Representative mobile Practice screenshot visually checked: readable options, explanation and navigation.
- git diff --check: PASS.

Technical references checked: [original LoRA paper](https://arxiv.org/abs/2106.09685) for frozen base weights and trainable low-rank updates; [NIST interval definition](https://www.itl.nist.gov/div898/handbook/prc/section1/prc14.htm) and [NIST mean confidence limits](https://itl.nist.gov/div898/handbook/eda/section3/eda352.htm) for coverage and width relationships; [COCO task definitions](https://cocodataset.org/workshop/coco-mapillary-iccv-2019.html) for instance-mask tasks. Retrieved 2026-10-04. These support self-authored questions and are not official iPAS past-paper attribution.

Reproduce:

```text
python scripts/audit_question_cues.py --baseline ea63448 --batch batch4e --csv docs/QUESTION_CUE_BIAS_BATCH4E.csv
NODE_PATH=<existing runtime node_modules> node scripts/test_question_batch4e.cjs <output-directory>
```

Evidence: [audit CSV](QUESTION_CUE_BIAS_BATCH4E.csv), [browser results](QUESTION_CUE_BIAS_BATCH4E_BROWSER.json), [mobile Practice](qa/issue-63/practice-Q352-375.png), [mobile Mock review](qa/issue-63/mock-L21-375.png).

Limitations: metrics are heuristics and do not certify content quality. Independent Technical Review remains pending before PR creation. No integration, Product Verify or production verification claimed.

## Per-item manual review (before / after)

### Q274 — key B

**Before**

公司想讓 70B 模型適配特定寫作風格，但 GPU 資源有限，較適合考慮哪種微調方法？

- A. LoRA 會把模型所有權重都重新從零訓練
- B. LoRA 等 PEFT 方法只訓練較少額外參數，可降低微調所需運算與儲存成本
- C. LoRA 的主要目的只是增加推論 Temperature
- D. LoRA 是向量資料庫索引方法

Explanation: PEFT（如 LoRA）以少量可訓練參數適配大型模型，通常比全量 Fine-tuning 更省資源。

**After**

公司已有預訓練模型，要以 LoRA 適配寫作風格。相較全量微調，標準 LoRA 主要更新哪些參數？

- A. 更新全部原始權重，並保存完整的模型副本
- B. 更新新增低秩矩陣，並凍結原始模型權重
- C. 更新原始權重數值，並移除新增的適配矩陣
- D. 更新每層完整矩陣，並重新初始化原始權重

Explanation: 標準 LoRA 凍結預訓練權重，訓練新增的低秩更新矩陣，減少可訓練參數。全量更新或重新初始化並非此處的 LoRA 設計。

### Q275 — key B

**Before**

某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，LoRA 相較 full fine-tuning 的主要優點是什麼？

- A. LoRA 的主要目的只是增加推論 Temperature
- B. LoRA 等 PEFT 方法只訓練較少額外參數，可降低微調所需運算與儲存成本
- C. LoRA 是向量資料庫索引方法
- D. LoRA 會把模型所有權重都重新從零訓練

Explanation: PEFT（如 LoRA）以少量可訓練參數適配大型模型，通常比全量 Fine-tuning 更省資源。

**After**

比較相同基礎模型的 LoRA 與全量微調。LoRA 減少可訓練參數後，哪項資源需求通常最直接下降？

- A. 載入基礎模型原始權重所需的參數數量
- B. 儲存訓練梯度與最佳化器狀態的記憶體
- C. 保存訓練資料原始文字所需的磁碟空間
- D. 處理輸入序列所需的上下文長度上限

Explanation: 只更新少量參數可降低梯度及最佳化器狀態的記憶體需求。仍需載入基礎模型，也仍有活化值等記憶體成本；LoRA 本身不縮減原始模型參數量、資料量或上下文上限。

### Q276 — key D

**Before**

需要為多個客戶維護不同模型適配版本，希望減少每版儲存成本，可考慮？

- A. LoRA 的主要目的只是增加推論 Temperature
- B. LoRA 會把模型所有權重都重新從零訓練
- C. LoRA 是向量資料庫索引方法
- D. LoRA 等 PEFT 方法只訓練較少額外參數，可降低微調所需運算與儲存成本

Explanation: PEFT（如 LoRA）以少量可訓練參數適配大型模型，通常比全量 Fine-tuning 更省資源。

**After**

多個客戶共用相同基礎模型，各自訓練 LoRA 版本。若要減少每個客戶版本的儲存量，應如何保存？

- A. 每個客戶保存完整權重，不再記錄基礎模型版本
- B. 每個客戶保存完整對話，不再記錄適配器權重
- C. 每個客戶保存生成範例，不再記錄訓練產物版本
- D. 共用基礎模型，另存各客戶適配器及相容版本

Explanation: LoRA 的少量適配器權重可與共用基礎模型分開保存，並需記錄相容的基礎模型版本。完整模型副本儲存較大，對話或範例則不能替代已訓練的適配器。

### Q277 — key A

**Before**

下列哪一項最符合 Parameter-Efficient Fine-Tuning（PEFT）？

- A. LoRA 等 PEFT 方法只訓練較少額外參數，可降低微調所需運算與儲存成本
- B. LoRA 是向量資料庫索引方法
- C. LoRA 的主要目的只是增加推論 Temperature
- D. LoRA 會把模型所有權重都重新從零訓練

Explanation: PEFT（如 LoRA）以少量可訓練參數適配大型模型，通常比全量 Fine-tuning 更省資源。

**After**

企業要用帶標籤資料適配模型，又希望只訓練少量參數。哪種做法最符合參數高效微調（PEFT）？

- A. 凍結大部分基礎權重，訓練少量任務適配參數
- B. 凍結全部模型權重，檢索文件後加入輸入提示
- C. 重新初始化全部權重，利用語料重新訓練模型
- D. 解凍全部模型權重，利用任務資料全量微調

Explanation: PEFT 透過只訓練少量參數降低適配成本，例如 LoRA。檢索增強屬於提供外部上下文，未訓練參數；從零訓練與全量微調則不是題述的參數高效做法。

### Q278 — key A

**Before**

某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，微調大型模型時只新增低秩矩陣並更新少量參數，這最接近？

- A. LoRA 等 PEFT 方法只訓練較少額外參數，可降低微調所需運算與儲存成本
- B. LoRA 是向量資料庫索引方法
- C. LoRA 會把模型所有權重都重新從零訓練
- D. LoRA 的主要目的只是增加推論 Temperature

Explanation: PEFT（如 LoRA）以少量可訓練參數適配大型模型，通常比全量 Fine-tuning 更省資源。

**After**

LoRA 用 ΔW = BA 表示權重更新。若 W 為 1000×1000，B 為 1000×8，A 為 8×1000，A 與 B 合計有多少參數？

- A. 16,000 個，將兩個低秩矩陣的元素數加總
- B. 1,000,000 個，沿用原始權重矩陣的元素數
- C. 8,000 個，僅計算其中一個低秩矩陣元素數
- D. 64 個，僅計算兩個低秩維度相乘的元素數

Explanation: B 與 A 各有 8,000 個元素，合計 16,000。BA 的乘積形狀與 W 相同，但 LoRA 訓練的是 A 與 B 的參數，不是另存全部 1,000,000 個更新元素。

### Q279 — key C

**Before**

一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，企業對大型模型做領域適配但不想更新全部權重，應優先評估？

- A. LoRA 會把模型所有權重都重新從零訓練
- B. LoRA 的主要目的只是增加推論 Temperature
- C. LoRA 等 PEFT 方法只訓練較少額外參數，可降低微調所需運算與儲存成本
- D. LoRA 是向量資料庫索引方法

Explanation: PEFT（如 LoRA）以少量可訓練參數適配大型模型，通常比全量 Fine-tuning 更省資源。

**After**

團隊提高 LoRA 的秩 r，基礎模型、適配層數與矩陣形狀皆不變。最直接的取捨是什麼？

- A. 適配器參數減少，但可表示的更新空間增加
- B. 適配器參數減少，但基礎模型的層數增加
- C. 適配器參數增加，可表示的更新空間擴大
- D. 適配器參數增加，基礎模型的詞彙表擴大

Explanation: 固定矩陣形狀時，A 與 B 的參數量隨 r 增加，可表示的低秩更新空間也擴大。這不會增加基礎模型層數或詞彙表，也不保證任務表現一定改善。

### Q280 — key C

**Before**

醫療影像要標出腫瘤的精確邊界，而不只是「有／無腫瘤」，最適合？

- A. Image Classification 會直接輸出每個像素的類別
- B. Object Detection 一定能提供精確像素輪廓
- C. 影像分割（Segmentation）可對像素或區域賦予類別，適合需要精細輪廓的任務
- D. OCR 專門做腫瘤邊界分割

Explanation: Classification 判整張圖；Detection 找物件框；Segmentation 可提供像素層級或實例層級輪廓。

**After**

影像應用要輸出腫瘤區域的像素遮罩，而非整張影像的有／無標籤。應優先評估哪種輸出設計？

- A. 整張影像的類別分數，描述是否存在腫瘤
- B. 各個候選區域的矩形框，描述腫瘤大致位置
- C. 每個像素的分割標籤，描述腫瘤區域輪廓
- D. 影像中關鍵點的座標，描述少數代表位置

Explanation: 像素遮罩需要影像分割的像素層級輸出。分類分數、矩形框及關鍵點可提供其他資訊，但不直接提供整個區域的輪廓；實際精度仍需驗證。

### Q281 — key B

**Before**

自駕系統要將每個像素分為道路、行人、天空等類別，應使用？

- A. Object Detection 一定能提供精確像素輪廓
- B. 影像分割（Segmentation）可對像素或區域賦予類別，適合需要精細輪廓的任務
- C. Image Classification 會直接輸出每個像素的類別
- D. OCR 專門做腫瘤邊界分割

Explanation: Classification 判整張圖；Detection 找物件框；Segmentation 可提供像素層級或實例層級輪廓。

**After**

自駕影像要對每個像素標記道路、行人或天空，不要求區分同類行人的個別身分。哪種任務最符合？

- A. 實例分割，為每位行人建立各自的物件遮罩
- B. 語意分割，為每個像素指定所屬的語意類別
- C. 物件偵測，為每個行人建立各自的矩形外框
- D. 影像分類，為整張影像指定主要的場景類別

Explanation: 語意分割標記像素類別，不要求分開同類物件實例。實例分割著重個別物件，偵測通常輸出框，整圖分類則不產生逐像素類別圖。

### Q282 — key C

**Before**

某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，瑕疵檢測需要知道裂痕實際輪廓與面積，哪個視覺任務較合適？

- A. Image Classification 會直接輸出每個像素的類別
- B. Object Detection 一定能提供精確像素輪廓
- C. 影像分割（Segmentation）可對像素或區域賦予類別，適合需要精細輪廓的任務
- D. OCR 專門做腫瘤邊界分割

Explanation: Classification 判整張圖；Detection 找物件框；Segmentation 可提供像素層級或實例層級輪廓。

**After**

裂痕已被矩形框圈住，但產品要估計裂痕在影像中占用的像素面積。哪種新增輸出最適合？

- A. 裂痕外框的寬與高，將框內全部像素視為裂痕
- B. 整張影像的裂痕分數，將分數當成面積比例
- C. 裂痕分割的像素遮罩，計算被標為裂痕的像素
- D. 裂痕中心點的座標，將座標值相乘當成面積

Explanation: 分割遮罩可計數裂痕像素，矩形框包含背景而可能高估面積。分類分數或中心座標不能替代面積；若需實際物理面積，還要校正像素尺度。

### Q283 — key A

**Before**

比較 Classification、Detection 與 Segmentation，下列描述何者正確？

- A. 影像分割（Segmentation）可對像素或區域賦予類別，適合需要精細輪廓的任務
- B. Object Detection 一定能提供精確像素輪廓
- C. Image Classification 會直接輸出每個像素的類別
- D. OCR 專門做腫瘤邊界分割

Explanation: Classification 判整張圖；Detection 找物件框；Segmentation 可提供像素層級或實例層級輪廓。

**After**

比較典型影像分類、物件偵測與語意分割的輸出，哪組配對正確？

- A. 分類—整圖標籤；偵測—物件外框；分割—像素類別
- B. 分類—像素類別；偵測—物件外框；分割—整圖標籤
- C. 分類—物件外框；偵測—整圖標籤；分割—像素類別
- D. 分類—整圖標籤；偵測—像素類別；分割—物件外框

Explanation: 典型分類提供整圖標籤，偵測提供物件框與類別，語意分割提供逐像素類別。其餘選項交換了任務與輸出層級。

### Q284 — key A

**Before**

某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，若 bounding box 太粗略，產品需要精確物件輪廓，應改用？

- A. 影像分割（Segmentation）可對像素或區域賦予類別，適合需要精細輪廓的任務
- B. OCR 專門做腫瘤邊界分割
- C. Image Classification 會直接輸出每個像素的類別
- D. Object Detection 一定能提供精確像素輪廓

Explanation: Classification 判整張圖；Detection 找物件框；Segmentation 可提供像素層級或實例層級輪廓。

**After**

影像中有兩個相鄰且同類的零件，產品需要各自的輪廓與面積。哪種輸出最能直接區分兩個零件？

- A. 兩個個別實例的遮罩，各自保留物件識別
- B. 一張同類零件的遮罩，將同類像素合為一類
- C. 兩個個別物件的外框，各自保留矩形邊界
- D. 一個整張影像的標籤，保留主要零件類別

Explanation: 實例分割為各物件提供獨立遮罩，可分開同類且相鄰的零件。語意遮罩不保留個別身分，外框不提供精細輪廓，整圖標籤則不定位個別物件。

### Q285 — key C

**Before**

影像語意分割（Semantic Segmentation）的典型輸出是？

- A. Image Classification 會直接輸出每個像素的類別
- B. Object Detection 一定能提供精確像素輪廓
- C. 影像分割（Segmentation）可對像素或區域賦予類別，適合需要精細輪廓的任務
- D. OCR 專門做腫瘤邊界分割

Explanation: Classification 判整張圖；Detection 找物件框；Segmentation 可提供像素層級或實例層級輪廓。

**After**

語意分割模型處理一張 H×W 的影像，輸出每個位置最可能的類別。典型最終類別圖的結構為何？

- A. 每張影像一個類別，形成整圖分類的標籤
- B. 每個物件一組座標，形成矩形外框的清單
- C. 每個像素一個類別，形成 H×W 的標籤圖
- D. 每個關鍵點一組座標，形成代表位置的清單

Explanation: 語意分割的最終類別圖為逐像素標籤。模型中間可能產生多通道分數圖並需上採樣，但題述的最終輸出應對應各像素類別。

### Q292 — key C

**Before**

某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，AI PoC 準確率很高，但正式場域沒有穩定資料介接、延遲也不符需求。這表示評估時漏了什麼？

- A. 只要業務主管支持即可跳過資料評估
- B. PoC 成功等於已證明可大規模營運
- C. 同時評估使用者價值、資料、技術效能、系統整合、法遵、成本與營運條件
- D. 只要模型 benchmark 高就代表專案可行

Explanation: AI 導入可行性是多面向問題：商業價值、資料、技術、流程、資安法遵、成本、維運與組織能力都需評估。

**After**

AI PoC 在離線資料上準確率高，但正式場域介接不穩，回應延遲超出需求。下一個 Pilot 應優先驗證什麼？

- A. 增加離線資料上的準確率，沿用既有測試環境
- B. 增加公開資料上的模型排名，沿用既有評分方式
- C. 驗證真實介接與端到端延遲，使用目標場域負載
- D. 驗證簡報中的使用流程，使用預先整理的示範資料

Explanation: 問題在實際整合與營運負載，Pilot 應驗證資料介接及端到端延遲。離線分數、公開排名或整理過的示範都不足以證明場域可運作。

### Q293 — key A

**Before**

一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，某 AI 構想很吸睛，但沒有明確使用者痛點與 KPI。專案啟動前最需要補強？

- A. 同時評估使用者價值、資料、技術效能、系統整合、法遵、成本與營運條件
- B. 只要業務主管支持即可跳過資料評估
- C. 只要模型 benchmark 高就代表專案可行
- D. PoC 成功等於已證明可大規模營運

Explanation: AI 導入可行性是多面向問題：商業價值、資料、技術、流程、資安法遵、成本、維運與組織能力都需評估。

**After**

AI 構想已能展示模型能力，但缺少明確痛點與 KPI。專案啟動前最應補強哪項證據？

- A. 確認使用者問題及現行基準，定義可衡量的改善目標
- B. 確認模型參數及公開排名，定義下一次模型升級時程
- C. 確認簡報版型及展示畫面，定義下一次展示會議日期
- D. 確認供應商名單及品牌聲量，定義下一次採購詢價順序

Explanation: 商業可行性需確認值得解決的使用者問題與可衡量成效，並以現行流程作為比較基準。模型規格、展示排程或品牌聲量不能代替價值證據。

### Q294 — key B

**Before**

某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，下列哪一組因素最完整地判斷 AI 專案是否值得進入 Pilot？

- A. 只要業務主管支持即可跳過資料評估
- B. 同時評估使用者價值、資料、技術效能、系統整合、法遵、成本與營運條件
- C. PoC 成功等於已證明可大規模營運
- D. 只要模型 benchmark 高就代表專案可行

Explanation: AI 導入可行性是多面向問題：商業價值、資料、技術、流程、資安法遵、成本、維運與組織能力都需評估。

**After**

模型表現達標，使用者痛點也已確認，但尚未估算人工覆核與正式維運成本。進入 Pilot 前應如何補強可行性評估？

- A. 只估算模型推論費用，再以準確率推估整體效益
- B. 納入覆核與維運成本，再與預期業務效益比較
- C. 只估算初期訓練費用，再以完成訓練視為回收
- D. 納入展示與宣傳費用，再以關注人數視為收益

Explanation: 可行性評估應涵蓋持續營運、人工覆核等成本，再與業務效益比較。只看推論或訓練費用可能低估總成本，展示關注也不等於業務收益。

### Q295 — key C

**Before**

模型在實驗室有效，是否代表可以直接全面上線？最合理的答案是？

- A. PoC 成功等於已證明可大規模營運
- B. 只要模型 benchmark 高就代表專案可行
- C. 同時評估使用者價值、資料、技術效能、系統整合、法遵、成本與營運條件
- D. 只要業務主管支持即可跳過資料評估

Explanation: AI 導入可行性是多面向問題：商業價值、資料、技術、流程、資安法遵、成本、維運與組織能力都需評估。

**After**

實驗室模型有效，但尚未測試正式資料分布、尖峰負載及異常處理。哪種下一步最能降低全面上線的不確定性？

- A. 沿用實驗室結果全面上線，以使用者回饋補充測試
- B. 換用公開排名更高的模型，以模型排名補充場域證據
- C. 在限定場域進行 Pilot，以資料與負載驗證流程
- D. 擴充離線測試的重複次數，以同一批資料補充證據

Explanation: 限定場域的 Pilot 可檢查實際資料、負載與異常處理，再依結果決定擴大。實驗室重複測試或公開排名不能涵蓋正式場域風險。

### Q296 — key D

**Before**

某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，AI 導入評估若只看模型準確率，最可能忽略哪些關鍵問題？

- A. 只要模型 benchmark 高就代表專案可行
- B. PoC 成功等於已證明可大規模營運
- C. 只要業務主管支持即可跳過資料評估
- D. 同時評估使用者價值、資料、技術效能、系統整合、法遵、成本與營運條件

Explanation: AI 導入可行性是多面向問題：商業價值、資料、技術、流程、資安法遵、成本、維運與組織能力都需評估。

**After**

AI 方案可達到準確率目標，但需新增人工覆核。要判斷它是否比現行流程值得導入，應比較什麼？

- A. 模型參數量與競品模型參數量，判斷技術規模差距
- B. 展示畫面數與現行系統畫面數，判斷功能呈現差距
- C. 模型訓練次數與歷史訓練次數，判斷開發投入差距
- D. 含覆核成本的效益與現行流程，判斷業務改善幅度

Explanation: 導入價值應與現行流程比較，納入覆核成本、時間、品質與錯誤影響等。技術規模、畫面數及訓練次數不是直接的業務效益。

### Q297 — key C

**Before**

一個成熟的 AI feasibility assessment 應涵蓋？

- A. 只要業務主管支持即可跳過資料評估
- B. PoC 成功等於已證明可大規模營運
- C. 同時評估使用者價值、資料、技術效能、系統整合、法遵、成本與營運條件
- D. 只要模型 benchmark 高就代表專案可行

Explanation: AI 導入可行性是多面向問題：商業價值、資料、技術、流程、資安法遵、成本、維運與組織能力都需評估。

**After**

專案已有正向業務效益估算，但所需資料尚未取得授權，也未確認正式系統的介接方式。較合理的評估結論是？

- A. 效益估算支持商業價值，可據此認定資料與整合已可行
- B. 示範結果支持模型能力，可據此認定授權與介接已可行
- C. 效益估算支持進一步評估，仍需確認資料授權與整合
- D. 供應商支援模型部署，可據此認定內部資料使用已可行

Explanation: 商業效益只是可行性的一部分。資料授權與系統整合仍是未驗證條件，不能由效益、示範或供應商部署能力推定已成立。

### Q352 — key D

**Before**

某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，同樣變異下，樣本從 100 增加到 1000，平均值的 95% 信賴區間通常會如何變化？

- A. 信賴區間可完全取代假設檢定
- B. 樣本越大信賴區間一定越寬
- C. 95% 信賴區間代表參數有 95% 機率落在已計算出的固定區間內
- D. 信賴區間反映估計的不確定性；在其他條件相同時樣本越大通常區間越窄

Explanation: 頻率學派下，信賴區間是重複抽樣程序的覆蓋率概念；樣本數增加通常降低標準誤，使區間變窄。

**After**

以獨立隨機樣本估計母體平均值，已知母體標準差不變，使用相同的 95% z 信賴區間公式。樣本数從 100 增為 1000，區間寬度如何變化？

- A. 通常變寬，因為樣本數增加會擴大估計的標準誤
- B. 維持不變，因為信賴水準仍設定為相同的 95%
- C. 通常變寬，因為更多樣本需涵蓋更多個別觀察值
- D. 通常變窄，因為標準誤隨樣本數增加而降低

Explanation: 已知標準差的平均值 z 區間半寬為臨界值乘以 σ/√n。其他條件相同時，樣本數增加降低標準誤，縮窄的是平均值估計區間，不是個別觀察值範圍。

### Q353 — key A

**Before**

某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，主管把 95% 信賴區間解讀成「真實參數有 95% 機率在此區間」，這個說法是否精確？

- A. 信賴區間反映估計的不確定性；在其他條件相同時樣本越大通常區間越窄
- B. 信賴區間可完全取代假設檢定
- C. 樣本越大信賴區間一定越寬
- D. 95% 信賴區間代表參數有 95% 機率落在已計算出的固定區間內

Explanation: 頻率學派下，信賴區間是重複抽樣程序的覆蓋率概念；樣本數增加通常降低標準誤，使區間變窄。

**After**

在頻率學派中，以同樣方法反覆抽樣並計算 95% 信賴區間，95% 最精確的意義為何？

- A. 長期約 95% 的這些區間會涵蓋固定的真實參數
- B. 每個已算出的固定區間都有 95% 機率涵蓋參數
- C. 約 95% 的個別觀察值會位於每次計算的區間
- D. 約 95% 的樣本平均值都等於固定的真實參數

Explanation: 95% 描述建構區間程序的長期覆蓋率。真實參數視為固定，已觀測的區間或包含它或不包含它；這也不是個別資料的涵蓋率或點估計恰好相等的比例。

### Q354 — key D

**Before**

某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，信賴區間主要提供什麼資訊？

- A. 信賴區間可完全取代假設檢定
- B. 樣本越大信賴區間一定越寬
- C. 95% 信賴區間代表參數有 95% 機率落在已計算出的固定區間內
- D. 信賴區間反映估計的不確定性；在其他條件相同時樣本越大通常區間越窄

Explanation: 頻率學派下，信賴區間是重複抽樣程序的覆蓋率概念；樣本數增加通常降低標準誤，使區間變窄。

**After**

報告提供母體平均值的點估計與 95% 信賴區間。相較只有點估計，區間最主要增加哪項資訊？

- A. 個別觀察值的分布範圍，描述資料本身的離散程度
- B. 下一筆觀察值的預測範圍，描述個體預測的不確定性
- C. 母體樣本的最小與最大值，描述已收集資料的極端值
- D. 平均值估計的可能範圍，描述抽樣估計的不確定性

Explanation: 母體平均值的信賴區間反映參數估計的不確定性。它不同於原始資料分布、樣本極值或下一筆資料的預測區間；覆蓋率仍依建構方法與假設解讀。

### Q355 — key C

**Before**

某零售平台累積大量交易資料，分析團隊要選擇合適的統計與大數據方法。 在此情境下，如果兩組研究的估計值相同，但一組樣本數大很多，通常哪一組區間更精確？

- A. 樣本越大信賴區間一定越寬
- B. 信賴區間可完全取代假設檢定
- C. 信賴區間反映估計的不確定性；在其他條件相同時樣本越大通常區間越窄
- D. 95% 信賴區間代表參數有 95% 機率落在已計算出的固定區間內

Explanation: 頻率學派下，信賴區間是重複抽樣程序的覆蓋率概念；樣本數增加通常降低標準誤，使區間變窄。

**After**

使用相同 95% z 區間公式，母體標準差已知且相同。樣本數由 100 增為 400，平均值區間的半寬變為原本多少？

- A. 約四倍，因為半寬與樣本數成正比
- B. 約兩倍，因為半寬與樣本數平方根成正比
- C. 約一半，因為半寬與樣本數平方根成反比
- D. 約四分之一，因為半寬與樣本數成反比

Explanation: 半寬與 1/√n 成正比，√(100/400)=1/2。因此樣本數增加四倍，半寬縮為一半，而非四分之一。

### Q356 — key D

**Before**

某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，下列對 Confidence Interval 的敘述何者較合理？

- A. 樣本越大信賴區間一定越寬
- B. 95% 信賴區間代表參數有 95% 機率落在已計算出的固定區間內
- C. 信賴區間可完全取代假設檢定
- D. 信賴區間反映估計的不確定性；在其他條件相同時樣本越大通常區間越窄

Explanation: 頻率學派下，信賴區間是重複抽樣程序的覆蓋率概念；樣本數增加通常降低標準誤，使區間變窄。

**After**

資料、樣本數與平均值 z 區間方法相同，將信賴水準從 95% 提高為 99%。區間通常如何改變？

- A. 變窄，因為更高信賴水準要求更精確的估計
- B. 不變，因為點估計與樣本數都沒有發生改變
- C. 平移，因為更高信賴水準會提高樣本平均值
- D. 變寬，因為更高覆蓋率需要更大的臨界值

Explanation: 提高信賴水準使 z 臨界值增加，因而擴大區間半寬。樣本平均值並不因此改變；更高覆蓋率與更窄區間是不同要求。

### Q357 — key B

**Before**

資料分析報告同時提供點估計與信賴區間，主要原因是？

- A. 信賴區間可完全取代假設檢定
- B. 信賴區間反映估計的不確定性；在其他條件相同時樣本越大通常區間越窄
- C. 樣本越大信賴區間一定越寬
- D. 95% 信賴區間代表參數有 95% 機率落在已計算出的固定區間內

Explanation: 頻率學派下，信賴區間是重複抽樣程序的覆蓋率概念；樣本數增加通常降低標準誤，使區間變窄。

**After**

兩研究以相同方法與信賴水準估計同一母體平均值，點估計相同，A 的區間較窄。較合理的解讀是？

- A. A 的估計較精密，因此可排除資料收集的系統性偏誤
- B. A 的估計較精密，但區間寬度不能排除系統性偏誤
- C. A 的估計較不精密，因為較窄區間排除了較多可能值
- D. A 的估計較不精密，因此應以觀察值極差取代區間

Explanation: 同條件下較窄區間表示較小的抽樣不確定性，即較高精密度；但系統性偏誤或假設違反不會因區間窄而消失。精密度不能等同於沒有偏誤。
