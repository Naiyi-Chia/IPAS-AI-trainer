# Issue #60 — Batch 4B question cue remediation

Engineering evidence, 2026-10-03. Independent Technical Review pending.

## Baseline and changes

Branch `question/issue-60-batch4b`, based on latest fetched epic branch `question/issue-14-remediation` at `eb65a50` (PR #119 sync). No existing remote Issue #60 branch found. Isolated checkout preserves unrelated local work.

Exactly 24 question records changed: question/options/explanation only. All protected metadata and answer indices preserved; all other records, DB metadata and application shell unchanged. No official content, storage, UI or dependencies changed. Added batch4b to the existing audit and a scoped browser regression script.

## Audit

`python -B scripts/audit_question_cues.py --batch batch4b --baseline eb65a50 --csv docs/QUESTION_CUE_BIAS_BATCH4B.csv`

PASS. [CSV](QUESTION_CUE_BIAS_BATCH4B.csv) contains 483 before and 483 after rows.

| Whole-bank metric | Before | After |
|---|---:|---:|
| Questions / unique IDs | 483 / 483 | 483 / 483 |
| Uniquely longest correct | 184 | 160 |
| Ratio >= 2 | 0 | 0 |
| Repeated option groups | 38 | 30 |
| Questions in repeated groups | 168 | 144 |
| Answer A / B / C / D | 131 / 109 / 122 / 121 | 131 / 109 / 122 / 121 |

Scoped uniquely longest correct: 24 → 0. No revised correct option is uniquely shortest. Ratios range 0.9167–1.0435. All 24 revised option sets are unique across the bank, ignoring order and whitespace. Automated scope, key, metadata and shell preservation checks PASS. Previous batch definitions preserved.

## Editorial review

All 24 manually reviewed for a single defensible key, plausible alternatives at the same semantic level, consistent grammar and explanation. No verified error required a protected-field change. Each cluster now tests three distinct decisions:

| IDs | Checks and distractor rationale |
|---|---|
| Q100–102 | Monthly trend, hourly trend, categorical totals. Alternatives distinguish share, distribution and comparison tasks. |
| Q109–111 | Traceable source/permission lineage, duplicate weighting, geographic representation. Alternatives use plausible operational metrics that do not resolve the stated risk. |
| Q118–120 | Matrix product dimensions, numeric product, vector inner product. Alternatives represent transpose, elementwise, sum, outer-product and concatenation mistakes. |
| Q121–123 | Gradient purpose, numeric update, excessive-step oscillation. Alternatives confuse optimization with other procedures or update arithmetic. |
| Q124–126 | High-bias diagnosis, controlled capacity experiment, bias versus variance. Stems specify convergence and comparable data; explanations avoid treating symptoms as universal proof. |
| Q130–132 | Local connections/weight sharing, sliding edge detector, spatial adjacency. Alternatives describe other transformations; explanation does not claim unconditional translation invariance. |
| Q157–159 | Live API integration, application-side execution, failed-order result handling. Alternatives confuse historical retrieval, tool requests and actual execution results. |
| Q166–168 | Word-count mapper output, shuffle grouping, reducer total. Alternatives use different keys or legitimate aggregations that answer different questions. |

## QA

- Inline app JS compilation and new browser script syntax PASS; audit Python parsed and executed successfully; `git diff --check` PASS.
- `node scripts/test_question_batch4b.cjs <output-directory>` PASS in installed headless Edge at 1280×900 and 375×900, fresh profiles.
- All 24 revised questions rendered and scored in both Practice and Mock at each width; exact option text, answer feedback, explanation and source verified.
- Wrong Q100 added to wrong-question view; weak-area displayed 2/3 (67%); correct retry removed Q100.
- Mock subjects L12/L22/L23: respectively 2/3, 8/9, 11/12 correct, one deliberate wrong answer each, scores 67/89/92. Submission and wrong-only review checked against actual keys and explanations.
- All seven tabs opened; official 115 second-session paper loaded 50 questions; no page warnings/errors, HTTP failures or horizontal document overflow. Three native submission confirmations per viewport.
- Visually inspected mobile Q109 and desktop L23 review screenshots: options and explanations wrap and remain readable.

Browser result JSON is committed as [QUESTION_CUE_BIAS_BATCH4B_BROWSER.json](QUESTION_CUE_BIAS_BATCH4B_BROWSER.json). Script uses existing Playwright through NODE_PATH and installed Edge; no new dependencies. Scope fixture filters only the in-memory DB to the 24 reviewed records and serves unchanged app code/assets; full-bank random sampling is not covered. No physical-device, Dev Preview or production validation claimed. Independent Technical Review remains pending; no PR opened by Engineering.

## Technical references

- [NIST Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf): data provenance and related governance risks.
- [TensorFlow overfit/underfit](https://www.tensorflow.org/tutorials/keras/overfit_and_underfit): model capacity and generalization.
- [TensorFlow Conv2D](https://www.tensorflow.org/api_docs/python/tf/keras/layers/Conv2D): two-dimensional convolution.
- [Apache MapReduce tutorial](https://hadoop.apache.org/docs/current/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html): Map output, shuffle grouping and Reduce aggregation.
- [Function calling guide](https://developers.openai.com/api/docs/guides/function-calling): application execution and tool results.

## Exact before / after review

### Q100 — key C

**Before**

要比較不同月份的銷售趨勢，通常最適合哪種圖？

- A. 所有欄位都畫成 3D 圖
- B. 永遠使用圓餅圖
- C. 折線圖，並依分析目的選擇合適視覺編碼
- D. 圖表越花俏越能提高準確性

Explanation: 時間趨勢常用折線圖；視覺化應以問題、資料型態與可讀性為核心。

**After**

要呈現同一產品過去十二個月的銷售額升降，哪種圖最方便追蹤時間趨勢？

- A. 圓餅圖，以扇形表示月份占全年比重
- B. 散佈圖，以座標表示廣告費與銷售額關係
- C. 折線圖，依月份順序連接每月銷售額
- D. 直方圖，以區間統計各種銷售額出現頻率

Explanation: 折線圖將時間依序排列並連接數值，便於追蹤升降。圓餅圖呈現占比，散佈圖呈現兩變數關係，直方圖呈現數值分布，皆不直接對應月份趨勢。

### Q101 — key A

**Before**

某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，若要呈現隨時間變化的連續趨勢，優先考慮？

- A. 折線圖，並依分析目的選擇合適視覺編碼
- B. 圖表越花俏越能提高準確性
- C. 所有欄位都畫成 3D 圖
- D. 永遠使用圓餅圖

Explanation: 時間趨勢常用折線圖；視覺化應以問題、資料型態與可讀性為核心。

**After**

感測器每小時記錄一次溫度，想看一週內何時升溫、何時降溫，哪種呈現方式最直接？

- A. 以時間為橫軸，將溫度畫成折線
- B. 以溫度為分組，畫出頻率直方圖
- C. 以每日平均值，畫出七個圓餅圖
- D. 以每日最高值，製作排序長條圖

Explanation: 時間軸上的折線保留每小時觀測的先後順序。頻率分布不保留時間位置，每日平均或最高值會省略日內變化。

### Q102 — key B

**Before**

某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，資料可視化時，圖表選擇最應依據？

- A. 所有欄位都畫成 3D 圖
- B. 折線圖，並依分析目的選擇合適視覺編碼
- C. 圖表越花俏越能提高準確性
- D. 永遠使用圓餅圖

Explanation: 時間趨勢常用折線圖；視覺化應以問題、資料型態與可讀性為核心。

**After**

分析師想比較五個工廠本月的總產量，各工廠名稱為類別。哪種圖最便於比較數值大小？

- A. 以工廠為類別，連成時間折線圖
- B. 以工廠為類別，繪製產量長條圖
- C. 以產量為區間，繪製頻率直方圖
- D. 以工廠為類別，繪製產量堆疊面積圖

Explanation: 長條圖以共同基準的長度比較類別數值。工廠沒有時間順序，直方圖會改為分布問題，堆疊面積圖則通常用於隨連續軸變化的累積量。

### Q109 — key D

**Before**

訓練生成式 AI 時，大規模資料治理的重要性為何？

- A. 生成模型不受訓練資料影響
- B. 所有公開網頁都可無條件使用
- C. 資料量大即可忽略版權與隱私
- D. 需管理來源、品質、權利、隱私、偏誤與資料譜系

Explanation: 生成式 AI 的大規模資料需要來源、授權、品質、隱私、偏誤與譜系等治理。

**After**

生成式 AI 語料庫由多個供應商提供。某來源的使用許可已變更，團隊需要定位受影響語料及模型版本。哪項紀錄最直接支持追溯？

- A. 保留模型準確率與延遲，依表現差異判斷語料來源
- B. 保留語料總筆數與檔案大小，依容量差異判斷使用範圍
- C. 保留供應商合約與付款紀錄，依採購日期推定訓練批次
- D. 保留來源與許可版本，逐一連結處理批次及訓練版本

Explanation: 來源及許可紀錄需連結到處理與訓練版本，才能定位受影響資料與模型。模型指標、容量及採購日期均不足以建立這條資料譜系；實際處置需依確認後的使用條件決定。

### Q110 — key D

**Before**

某電商資料平台正在重新設計資料管線與分析架構，工程師遇到以下問題。 在此情境下，若訓練語料包含大量重複、侵權或敏感內容，最可能造成？

- A. 生成模型不受訓練資料影響
- B. 所有公開網頁都可無條件使用
- C. 資料量大即可忽略版權與隱私
- D. 需管理來源、品質、權利、隱私、偏誤與資料譜系

Explanation: 生成式 AI 的大規模資料需要來源、授權、品質、隱私、偏誤與譜系等治理。

**After**

生成式 AI 訓練語料中，同一份文件有數百個近似副本。團隊想降低該文件被過度代表的影響，哪項處理最直接？

- A. 將所有副本隨機分到多個檔案，再保持原抽樣權重
- B. 將副本依建立日期排序後匯入，再增加訓練迭代次數
- C. 將文件轉成一致的文字編碼，再依原筆數隨機抽樣
- D. 辨識近似重複並去重或降權，再檢查各類語料分布

Explanation: 大量近似副本可能使少數內容被過度代表，去重或降權直接處理此問題。重新分檔、排序或編碼不改變其抽樣占比，也不能取代其他品質與權利檢查。

### Q111 — key B

**Before**

某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，大數據支援生成式 AI 時，何者最重要？

- A. 資料量大即可忽略版權與隱私
- B. 需管理來源、品質、權利、隱私、偏誤與資料譜系
- C. 所有公開網頁都可無條件使用
- D. 生成模型不受訓練資料影響

Explanation: 生成式 AI 的大規模資料需要來源、授權、品質、隱私、偏誤與譜系等治理。

**After**

生成式 AI 的訓練語料多來自單一地區。模型在其他地區用語上的錯誤較多，新增資料時哪種評估最符合資料治理？

- A. 按檔案大小增加來源，再比較整體平均生成速度
- B. 按地區檢查代表性，再分群評估新增資料的效果
- C. 按發布日期增加來源，再比較整體文字平均長度
- D. 按供應商報價增加來源，再比較資料總筆數成長

Explanation: 題述顯示地區代表性不足的風險，應檢查相關語料並分群評估成效。容量、日期、成本及總筆數可用於管理，但不能單獨證明其他地區的表現改善。

### Q118 — key D

**Before**

某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，神經網路中大量線性轉換常以什麼數學運算表示？

- A. 只做字串搜尋
- B. 網路封包路由
- C. 資料庫索引
- D. 矩陣－向量乘法

Explanation: 神經網路與許多 ML 模型大量使用向量、矩陣、內積與矩陣乘法表示特徵和權重運算。

**After**

線性層 y = Wx 中，W 的形狀為 3×4，x 為 4×1 的欄向量。y 的形狀為何？

- A. 4×3 的矩陣，共十二個元素
- B. 4×1 的向量，共四個元素
- C. 3×4 的矩陣，共十二個元素
- D. 3×1 的向量，共三個元素

Explanation: 矩陣乘法要求內側維度相同，(3×4)(4×1) 的結果為 3×1。輸出維度由 W 的列數決定，不能直接沿用輸入或權重矩陣的形狀。

### Q119 — key D

**Before**

輸入向量 x 經權重矩陣 W 轉換，常寫成哪一類運算？

- A. 只做字串搜尋
- B. 網路封包路由
- C. 資料庫索引
- D. 矩陣－向量乘法

Explanation: 神經網路與許多 ML 模型大量使用向量、矩陣、內積與矩陣乘法表示特徵和權重運算。

**After**

W = [[1, 2], [3, 4]]，x = [1, 2]ᵀ。矩陣與向量相乘 Wx 的結果為何？

- A. [1, 4]ᵀ，將對角元素分別相乘
- B. [7, 10]ᵀ，將矩陣轉置後相乘
- C. [3, 7]ᵀ，將各列元素直接加總
- D. [5, 11]ᵀ，將各列與向量內積

Explanation: 第一列內積為 1×1+2×2=5，第二列為 3×1+4×2=11。其他選項分別混淆了逐元素運算、轉置乘法及列加總。

### Q120 — key A

**Before**

某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，線性代數在機器學習中的核心用途之一是？

- A. 矩陣－向量乘法
- B. 資料庫索引
- C. 網路封包路由
- D. 只做字串搜尋

Explanation: 神經網路與許多 ML 模型大量使用向量、矩陣、內積與矩陣乘法表示特徵和權重運算。

**After**

兩個欄向量 u、v 都含 n 個元素。要用內積得到兩者的單一相似程度數值，應如何計算？

- A. 將對應元素相乘，再把所有乘積加總
- B. 將對應元素相加，再保留各項結果
- C. 將所有元素交叉相乘，再排列成矩陣
- D. 將兩個向量串接，再保留雙倍長度

Explanation: 內積 uᵀv 是對應元素乘積的總和，結果是純量。向量相加、外積及串接分別得到向量、矩陣或更長向量，並非題述的內積。

### Q121 — key D

**Before**

某資料科學專案進入模型驗證階段，團隊針對下列技術問題進行評估。 在此情境下，Gradient Descent 的主要目的是？

- A. K-means
- B. Bootstrap only
- C. One-hot Encoding
- D. 梯度下降（Gradient Descent）

Explanation: 梯度下降利用梯度資訊調整參數，目標是降低損失函數。

**After**

使用梯度下降訓練模型時，損失函數梯度最直接用來決定什麼？

- A. 依樣本距離決定分群中心與各群成員
- B. 依特徵類別決定編碼欄位與排列順序
- C. 依重抽樣次數決定估計區間與抽樣誤差
- D. 依損失局部變化決定參數的更新方向

Explanation: 梯度描述損失對參數的局部變化；梯度下降沿負梯度更新參數，以適當步長嘗試降低損失。分群、編碼和重抽樣是不同目的的操作。

### Q122 — key C

**Before**

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，訓練模型時沿著損失函數負梯度方向更新參數，這稱為？

- A. One-hot Encoding
- B. Bootstrap only
- C. 梯度下降（Gradient Descent）
- D. K-means

Explanation: 梯度下降利用梯度資訊調整參數，目標是降低損失函數。

**After**

梯度下降更新式為 θ_new = θ − η∇L(θ)。若 θ = 2、η = 0.1、∇L(θ) = 3，更新後 θ_new 為何？

- A. 2.3，將參數加上步長乘梯度
- B. 0.3，保留步長乘梯度的結果
- C. 1.7，將參數減去步長乘梯度
- D. 1.9，將參數減去固定的步長

Explanation: 依更新式計算 2−0.1×3=1.7。梯度下降需同時使用方向與步長，不能改為加上梯度、只取更新量或省略梯度。

### Q123 — key C

**Before**

若要藉由反覆更新參數降低 loss，最常見的方法是？

- A. K-means
- B. One-hot Encoding
- C. 梯度下降（Gradient Descent）
- D. Bootstrap only

Explanation: 梯度下降利用梯度資訊調整參數，目標是降低損失函數。

**After**

以梯度下降最小化平滑損失時，參數在谷底兩側大幅來回跳動。若先只調整學習率，哪個做法最合理？

- A. 提高學習率，讓每次更新更快跨過谷底
- B. 保持學習率，以增加迭代次數處理震盪
- C. 降低學習率，再觀察損失值與更新幅度
- D. 固定為零學習率，以目前參數繼續訓練

Explanation: 過大步長可能造成來回越過谷底，先降低學習率並觀察較合理。增加步長可能加劇震盪，多跑迭代不直接修正步長，零學習率則停止參數更新。

### Q124 — key D

**Before**

模型過度簡單，訓練與測試誤差都高，通常較接近哪種情況？

- A. 測試集資料洩漏必定發生
- B. 變異（Variance）必定為無限大
- C. 模型一定過度複雜
- D. 偏差（Bias）較高，模型表達能力不足

Explanation: 欠擬合常見於模型過度簡單或訓練不足，通常呈現高偏差。

**After**

資料切分正確，模型已收斂。過度簡單的模型在訓練集與驗證集都表現差，兩者誤差接近。哪種解釋最符合？

- A. 高變異：模型記住訓練細節，因而在新資料上表現差
- B. 資料洩漏：驗證資訊進入訓練，因而高估泛化能力
- C. 分布偏移：訓練表現良好，但驗證樣本來自不同族群
- D. 高偏差：模型的表達能力不足，未捕捉資料主要模式

Explanation: 收斂後仍在訓練與驗證資料上同樣表現差，且模型過度簡單，最符合高偏差的欠擬合。高變異或分布偏移較常伴隨訓練與驗證表現落差；資料洩漏通常造成過度樂觀的驗證結果。

### Q125 — key C

**Before**

模型無法捕捉資料中的重要模式，可能是？

- A. 變異（Variance）必定為無限大
- B. 模型一定過度複雜
- C. 偏差（Bias）較高，模型表達能力不足
- D. 測試集資料洩漏必定發生

Explanation: 欠擬合常見於模型過度簡單或訓練不足，通常呈現高偏差。

**After**

已收斂的低容量模型欠擬合，訓練與驗證誤差都高。在資料與切分固定的前提下，哪種實驗最直接檢查表達能力不足？

- A. 降低模型容量，再比較兩個資料集的誤差
- B. 加強正則化限制，再比較兩個資料集的誤差
- C. 提高模型容量，再比較兩個資料集的誤差
- D. 縮減訓練樣本數，再比較兩個資料集的誤差

Explanation: 提高容量後比較訓練與驗證誤差，能直接檢查原模型是否受限於表達能力。降低容量或加強正則化可能加重欠擬合，縮減樣本則改變資料條件；提高容量仍須注意是否轉為過擬合。

### Q126 — key C

**Before**

欠擬合（Underfitting）通常代表？

- A. 變異（Variance）必定為無限大
- B. 測試集資料洩漏必定發生
- C. 偏差（Bias）較高，模型表達能力不足
- D. 模型一定過度複雜

Explanation: 欠擬合常見於模型過度簡單或訓練不足，通常呈現高偏差。

**After**

比較同一任務的模型時，哪種現象最符合高偏差，而非高變異？

- A. 訓練誤差很低，驗證誤差卻明顯偏高
- B. 更換訓練樣本後，預測結果大幅改變
- C. 訓練與驗證誤差都偏高，且差距較小
- D. 模型反覆貼合雜訊，訓練誤差持續下降

Explanation: 高偏差常呈現兩組誤差都高且差距較小；高變異常表現為對訓練樣本敏感，或訓練表現好而驗證表現差。這些是診斷線索，實際原因仍需配合訓練狀況與資料品質檢查。

### Q130 — key B

**Before**

某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，CNN 特別適合影像的主要原因之一是？

- A. 只能處理一維表格
- B. 利用局部感受野與權重共享擷取空間特徵
- C. 不含任何可學習參數
- D. 完全忽略像素間空間關係

Explanation: CNN 透過卷積、局部連接與權重共享學習影像局部與階層式空間特徵。

**After**

標準二維 CNN 的卷積層在影像上滑動同一組濾波器。這種設計最直接結合哪些特性？

- A. 全域像素連接，並讓每個位置分別學習權重
- B. 局部像素連接，並在各個不同位置共享權重
- C. 全域像素排序，並用固定名次代替空間座標
- D. 局部區域平均，並以固定運算取代濾波器學習

Explanation: 標準卷積在局部感受野中運算，並將相同濾波器權重用於不同位置。全連接、排序及固定平均並不等同於這種可學習的卷積設計。

### Q131 — key D

**Before**

某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，影像分類常使用卷積神經網路，卷積層的作用最接近？

- A. 不含任何可學習參數
- B. 完全忽略像素間空間關係
- C. 只能處理一維表格
- D. 利用局部感受野與權重共享擷取空間特徵

Explanation: CNN 透過卷積、局部連接與權重共享學習影像局部與階層式空間特徵。

**After**

CNN 的早期卷積層常學到邊緣濾波器。相同邊緣出現在影像不同位置時，權重共享有何作用？

- A. 為每個位置獨立學習濾波器，以記住固定座標
- B. 將整張影像壓成平均值，以消除位置之間差異
- C. 把每個像素依亮度排序，以統一邊緣排列位置
- D. 讓相同濾波器掃過不同位置，以偵測局部邊緣

Explanation: 共享的濾波器可在多個位置偵測相同局部模式，減少為每個位置另學權重的需求。平均或排序會改變或丟失空間資訊；這不表示整個 CNN 必然對所有平移完全不變。

### Q132 — key D

**Before**

某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，CNN 能有效利用影像的哪種特性？

- A. 完全忽略像素間空間關係
- B. 不含任何可學習參數
- C. 只能處理一維表格
- D. 利用局部感受野與權重共享擷取空間特徵

Explanation: CNN 透過卷積、局部連接與權重共享學習影像局部與階層式空間特徵。

**After**

將影像像素隨機打散後，原本相鄰像素不再相鄰。這會直接破壞 CNN 常利用的哪項資料特性？

- A. 每個像素數值所使用的數值型別
- B. 每張影像內含的像素數量與總和
- C. 不同影像在資料集中存放的順序
- D. 鄰近像素所組成局部邊緣與紋理

Explanation: 卷積利用局部空間結構，打散像素位置會破壞鄰近關係及邊緣紋理。單純置換位置可保留型別、像素數量與總和，也不需改變影像在資料集中的順序。

### Q157 — key B

**Before**

聊天模型需要真正查詢訂單 API，而不是用文字猜測，較適合哪種設計？

- A. 只把 Prompt 寫長
- B. 工具／Function Calling 整合
- C. 只提高 Temperature
- D. 把所有 API 結果預先寫死在模型中

Explanation: Tool/Function Calling 讓模型選擇並呼叫外部工具，再根據真實回傳結果作答。

**After**

客服模型要取得訂單的即時狀態，訂單 API 已提供且完成授權。哪種整合方式最直接？

- A. 檢索昨日批次匯出的訂單文件，再依文件內容回覆
- B. 讓模型產生查詢參數，由程式呼叫 API 回傳結果
- C. 微調歷史客服對話，再依模型記憶回覆訂單狀態
- D. 提供訂單狀態文字範例，再讓模型生成類似回覆

Explanation: Function Calling 可讓模型提出結構化的工具名稱與參數，由應用程式驗證並執行 API，再將結果交回模型。昨日文件、歷史微調與文字範例無法保證即時狀態。

### Q158 — key B

**Before**

希望模型能依需求呼叫計算器、資料庫或 API，應使用？

- A. 只提高 Temperature
- B. 工具／Function Calling 整合
- C. 只把 Prompt 寫長
- D. 把所有 API 結果預先寫死在模型中

Explanation: Tool/Function Calling 讓模型選擇並呼叫外部工具，再根據真實回傳結果作答。

**After**

模型已輸出計算器的函式名稱與參數，但尚未執行。一般 Function Calling 流程下一步應為何？

- A. 將函式名稱當成計算答案，直接交給使用者
- B. 由應用程式驗證參數並執行，再回傳工具結果
- C. 將函式參數加入訓練資料，等模型重新學習
- D. 由模型再生成另一組參數，作為第一次的結果

Explanation: 模型輸出的工具呼叫是執行請求，應用程式需驗證、執行並回傳結果。請求本身不是計算結果，也不需先重新訓練模型；再次生成參數不能替代執行。

### Q159 — key A

**Before**

生成式 AI 要完成『查庫存→下單→回覆結果』，關鍵能力是？

- A. 工具／Function Calling 整合
- B. 把所有 API 結果預先寫死在模型中
- C. 只提高 Temperature
- D. 只把 Prompt 寫長

Explanation: Tool/Function Calling 讓模型選擇並呼叫外部工具，再根據真實回傳結果作答。

**After**

工具流程已完成「查庫存→下單」。下單 API 回傳失敗。要讓最終回覆與實際執行一致，哪種處理最適當？

- A. 依工具失敗結果回覆，說明訂單未成立
- B. 依使用者原始意圖回覆，說明訂單已成立
- C. 依先前庫存查詢回覆，說明訂單已成立
- D. 依模型生成的訂單號回覆，請使用者等待配送

Explanation: 下單是否成功應依下單工具結果判斷。庫存充足或使用者有下單意圖均不代表訂單成立，模型生成的訂單號也不能取代系統紀錄。

### Q166 — key B

**Before**

某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，MapReduce 中，Map 與 Reduce 的功能何者較正確？

- A. Reduce 一定在 Map 前執行
- B. Map 將輸入映射為中間鍵值資料；Reduce 再彙整同鍵資料
- C. Map 與 Reduce 都只負責資料加密
- D. Map 只畫地圖；Reduce 只刪檔案

Explanation: Map 對輸入做平行轉換產生中間鍵值資料，Reduce 再依 key 聚合／彙總。

**After**

用 MapReduce 計算每個單字出現次數時，Map 對每次單字出現應輸出什麼，供後續加總？

- A. 以文件名稱為鍵，以全文字串為值
- B. 以單字本身為鍵，以數值 1 為值
- C. 以出現位置為鍵，以單字字串為值
- D. 以數值 1 為鍵，以文件名稱為值

Explanation: 字數統計的 Map 對每次出現輸出 (單字, 1)，之後按單字分組，由 Reduce 加總。以文件或位置為鍵不能直接把相同單字的計數送到同一組。

### Q167 — key B

**Before**

大規模資料平行處理中，MapReduce 的基本概念是？

- A. Map 只畫地圖；Reduce 只刪檔案
- B. Map 將輸入映射為中間鍵值資料；Reduce 再彙整同鍵資料
- C. Reduce 一定在 Map 前執行
- D. Map 與 Reduce 都只負責資料加密

Explanation: Map 對輸入做平行轉換產生中間鍵值資料，Reduce 再依 key 聚合／彙總。

**After**

多個 Map 工作都輸出同一商品編號的銷售金額。要讓 Reduce 計算商品總額，Shuffle 最需要完成什麼？

- A. 依金額大小分組，將不同商品的相同金額放在一起
- B. 依商品鍵分組，將各 Map 的同商品資料放在一起
- C. 依原檔名分組，讓每個 Reduce 保留完整來源檔案
- D. 依完成時間分組，讓每個 Reduce 處理一批 Map 結果

Explanation: Shuffle 將相同鍵的中間資料分組並送往對應 Reduce，才可計算每個商品的總額。金額、檔名或完成時間不是題述要聚合的鍵。

### Q168 — key A

**Before**

Map 階段與 Reduce 階段通常分別做什麼？

- A. Map 將輸入映射為中間鍵值資料；Reduce 再彙整同鍵資料
- B. Map 只畫地圖；Reduce 只刪檔案
- C. Reduce 一定在 Map 前執行
- D. Map 與 Reduce 都只負責資料加密

Explanation: Map 對輸入做平行轉換產生中間鍵值資料，Reduce 再依 key 聚合／彙總。

**After**

Map 已輸出 (部門, 金額)，Shuffle 已按部門分組。Reduce 要計算各部門總支出，應執行哪種操作？

- A. 對同部門金額加總，輸出部門與總額
- B. 對同部門資料計數，輸出部門與筆數
- C. 對同部門金額取最大，輸出部門與最高額
- D. 對同部門金額取平均，輸出部門與平均額

Explanation: 總支出需要加總該部門的所有金額。計數、最大值與平均值也是合理的聚合操作，但回答的是其他問題，不能代替總額。
