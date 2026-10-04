# Issue #46 — Batch 2A cue-bias remediation

## Contract and baseline

- Issue: https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/46; parent #14.
- Branch: `question/issue-46-batch2a-remediation`.
- Baseline: latest `question/issue-14-remediation` at implementation start, `952c878afb2ffe32e16e3d58f16f33a671ae7e2d`.
- Scope: exactly 21 IDs below. Only question/options/explanation change; every other field, including answer index and sourceType, is preserved.
- Application HTML/CSS/JavaScript outside the parsed DB and all non-question DB metadata are unchanged. Official content and storage behavior are unchanged.
- Editorial review below was performed item by item by the Engineering Agent; independent Technical Review and human gates remain pending. This is not Human Product Verify.

## Reproduction

```powershell
python scripts/audit_question_cues.py --batch batch2a --baseline 952c878afb2ffe32e16e3d58f16f33a671ae7e2d --csv docs/QUESTION_CUE_BIAS_BATCH2A.csv
python scripts/serve_question_batch1a.py --batch batch2a
```

Open `http://127.0.0.1:8766/batch2a`. The existing fixture now accepts a batch selector, retaining Batch 1A as the default. It narrows the in-memory pool, replaces localStorage with memory storage, auto-accepts exam confirmation, and disables PDF prewarming. No dependency was added.

CSV contains all 483 questions before and after (966 data rows). Length counts Unicode code points excluding whitespace; option-set comparison ignores option order and whitespace. Audit assertions cover exact scope, protected metadata, IDs/count/order, mapping, unchanged app shell, ratio <2, and no remaining duplicate option set for any reviewed item.

## Whole-bank metrics

| Metric | Before | After |
| --- | ---: | ---: |
| total | 483 | 483 |
| unique_ids | 483 | 483 |
| unique_longest | 437 | 419 |
| ratio_ge_2 | 281 | 260 |
| ratio_ge_3 | 57 | 36 |
| repeated_groups | 106 | 99 |
| repeated_questions | 473 | 452 |

Answer distribution unchanged: A 131 / B 109 / C 122 / D 121. All 21 previously exceeded 3x; maximum new ratio is 1.2245x. Three reviewed correct answers remain uniquely longest by a small margin; length alone is only a heuristic, and the strict contract threshold is met. Seven former repeated groups are now 21 distinct sets, each unique across the bank.

## Item-by-item editorial review

### Q085 — 缺失值與異常值

Protected mapping: 中級 / L22 / L22201 / medium; answer index 1 (B).
Length ratio: 3.1071 → 1.0345; option lengths: 10/29/8/10 → 20/20/19/19.

**Review:** 先診斷再處理；三個干擾項皆是可能採用、但此時尚無依據的清理方案。

**Before:** 某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，資料清理發現缺失值時，哪個原則最合理？

- A. 所有缺失值都一律填 0
- B. 先理解缺失原因、欄位意義與影響，再決定刪除、插補或其他處理
- C. 不必檢查資料來源
- D. 所有異常值都一定刪除

**After:** 金融機構發現收入欄位有缺失，尚未釐清來源。決定清理策略前，最適合先做哪項工作？

- A. 用全體收入平均值插補，再比較清理前後筆數
- B. 查核缺失分布與蒐集流程，評估欄位業務意義
- C. 刪除收入缺失的樣本，再檢查剩餘收入分布
- D. 用相似客戶收入插補，再計算補值後的變異

**Unique-answer rationale / explanation:** 缺失原因尚不明時，應先檢查缺失分布、蒐集流程與欄位意義。平均值插補、相似樣本插補或刪除樣本都可能適用，但須先評估假設與偏差，不能用處理後的統計量取代來源查核。

### Q086 — 缺失值與異常值

Protected mapping: 中級 / L22 / L22201 / medium; answer index 1 (B).
Length ratio: 3.1071 → 1.0000; option lengths: 8/29/10/10 → 18/18/18/18.

**Review:** 缺失與收入相關造成代表性偏差；其餘選項混淆刪除樣本與變異、平均或排序的必然關係。

**Before:** 遇到大量 missing values，第一步不應直接全部填 0，而應？

- A. 不必檢查資料來源
- B. 先理解缺失原因、欄位意義與影響，再決定刪除、插補或其他處理
- C. 所有缺失值都一律填 0
- D. 所有異常值都一定刪除

**After:** 某問卷的高收入受訪者較常略過收入題。若直接刪除收入缺失的樣本，最需要注意哪種影響？

- A. 保留樣本的收入變異會因筆數減少而增加
- B. 保留樣本的收入分布可能偏離原目標母體
- C. 保留樣本的收入平均會因刪除空值而升高
- D. 保留樣本的收入排序會因刪除空值而反轉

**Unique-answer rationale / explanation:** 缺失與收入高低相關，直接刪除可能使高收入者代表性不足，導致樣本分布偏離目標母體。樣本變異不因筆數減少就必然增加；刪除空值也不代表平均升高或既有收入排序反轉。

### Q087 — 缺失值與異常值

Protected mapping: 中級 / L22 / L22201 / medium; answer index 1 (B).
Length ratio: 3.1071 → 1.0385; option lengths: 10/29/10/8 → 17/18/17/18.

**Review:** 先核實來源；截尾、插補、轉換都是常見處理，但不能代替真偽查核。

**Before:** 處理異常值與缺失值前，最重要的是？

- A. 所有異常值都一定刪除
- B. 先理解缺失原因、欄位意義與影響，再決定刪除、插補或其他處理
- C. 所有缺失值都一律填 0
- D. 不必檢查資料來源

**After:** 交易資料出現一筆遠高於平常的金額，可能是輸入錯誤，也可能是真實大額交易。決定是否移除前，哪項處理最合適？

- A. 依金額分位數截尾，將該筆改為上限值
- B. 核對原始交易憑證，確認金額與業務情境
- C. 以鄰近交易均值插補，平滑該筆的金額
- D. 將交易金額取對數，以轉換結果判定真偽

**Unique-answer rationale / explanation:** 異常值可能是錯誤，也可能是有意義的真實事件，應先核對來源與業務情境。截尾和插補會先改動資料；對數轉換能改變尺度，卻不能判定交易是否真實。

### Q112 — 匿名化與再識別

Protected mapping: 中級 / L22 / L22404 / hard; answer index 1 (B).
Length ratio: 3.7059 → 1.0000; option lengths: 11/42/12/11 → 17/17/17/17.

**Review:** 聚焦外部連結風險；加密、品質檢查與發布筆數都是資料管理工作，但不直接檢驗可識別性。

**Before:** 某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，將姓名移除後，資料就一定無法再識別個人嗎？

- A. 資料越多越沒有隱私風險
- B. 仍可能透過其他欄位或外部資料再識別，因此需評估 re-identification 風險
- C. 加密後任何人都可取得金鑰
- D. 只刪姓名就等於完全匿名

**After:** 金融機構移除交易資料的姓名後，仍保留精確生日與郵遞區號。發布前要評估外部連結造成的再識別風險，哪項檢查最直接？

- A. 確認資料傳輸與儲存是否採取加密保護
- B. 測試剩餘欄位與公開名冊能否連結個人
- C. 統計各欄缺失比例與數值分布是否穩定
- D. 檢查交易紀錄總筆數是否達到發布門檻

**Unique-answer rationale / explanation:** 生日與郵遞區號等準識別欄位可能與外部名冊連結，需評估欄位組合的可識別性。加密是存取安全措施；缺失比例、分布穩定或總筆數都不足以判斷連結識別風險。

### Q113 — 匿名化與再識別

Protected mapping: 中級 / L22 / L22404 / hard; answer index 3 (D).
Length ratio: 3.7059 → 1.0000; option lengths: 11/11/12/42 → 17/17/17/17.

**Review:** 用明確的一對一連結情境區分再識別、解密、完整性與可用性風險。

**Before:** 資料集沒有姓名，但含精確生日、郵遞區號等組合欄位，仍可能有什麼風險？

- A. 只刪姓名就等於完全匿名
- B. 資料越多越沒有隱私風險
- C. 加密後任何人都可取得金鑰
- D. 仍可能透過其他欄位或外部資料再識別，因此需評估 re-identification 風險

**After:** 一份不含姓名的資料表，只有一列符合「生日 6 月 8 日、郵遞區號 12345、職業為獸醫」。公開名冊恰有一人符合這些條件。這主要呈現哪種風險？

- A. 藉由解密演算法還原已加密的姓名欄位
- B. 藉由竄改紀錄內容破壞資料表的完整性
- C. 藉由增加查詢流量降低資料服務可用性
- D. 藉由準識別欄位連結外部名冊識別個人

**Unique-answer rationale / explanation:** 多個準識別欄位的組合可能具有唯一性，與外部名冊連結後即可識別個人。此情境未涉及解密、資料竄改或服務阻斷；移除姓名仍未消除連結識別風險。

### Q114 — 匿名化與再識別

Protected mapping: 中級 / L22 / L22404 / hard; answer index 1 (B).
Length ratio: 3.7059 → 1.0500; option lengths: 11/42/12/11 → 20/21/20/20.

**Review:** 外部輔助資訊改變後需重估；固定格式、換檔名或增大筆數不足以證明安全。

**Before:** 大數據隱私保護中，何者是重要考量？

- A. 只刪姓名就等於完全匿名
- B. 仍可能透過其他欄位或外部資料再識別，因此需評估 re-identification 風險
- C. 加密後任何人都可取得金鑰
- D. 資料越多越沒有隱私風險

**After:** 團隊已將生日泛化為年齡區間，並移除姓名，準備公開個別紀錄。若外部可取得的輔助資料持續增加，最合理的風險管理方式是？

- A. 沿用首次檢查結果，以欄位格式未變作為依據
- B. 定期重估連結風險，視結果調整泛化或揭露範圍
- C. 定期更換發布檔名，以降低外部資料連結機會
- D. 增加公開紀錄筆數，以總量增長取代風險重估

**Unique-answer rationale / explanation:** 再識別風險會受外部輔助資料與揭露情境影響，應持續評估並視結果調整。欄位格式未變不代表風險未變；更換檔名或增加筆數也不能取代準識別欄位的連結風險分析。

### Q127 — Random Forest

Protected mapping: 中級 / L23 / L23202 / medium; answer index 2 (C).
Length ratio: 3.7826 → 0.9844; option lengths: 13/3/29/7 → 21/21/21/22.

**Review:** 以四種建樹機制區分森林、兩類 boosting 與單樹選擇，避免拿方法描述對比孤立名稱。

**Before:** 某機器學習團隊正在開發正式上線的預測模型，需在模型設計會議中做出判斷。 在此情境下，Random Forest 的核心概念何者較正確？

- A. 單一線性回歸一定是集成模型
- B. PCA
- C. Random Forest：結合多棵具隨機性的決策樹進行集成
- D. K-means

**After:** 團隊採用典型的 Random Forest 建立瑕疵分類模型。其建構多棵樹的方式，何者最符合核心設計？

- A. 逐棵提高前棵誤判樣本的權重，再整合各樹預測
- B. 逐棵擬合目前預測的殘差，再累加各樹預測結果
- C. 以重抽樣訓練多樹，分裂時抽取部分特徵供選擇
- D. 以相同資料和全部特徵建樹，再挑訓練分數最高者

**Unique-answer rationale / explanation:** 典型隨機森林結合 bootstrap 重抽樣與節點分裂時的特徵隨機抽樣，再整合多棵樹。提高誤判樣本權重較接近 AdaBoost；擬合殘差較接近梯度提升；只挑一棵樹不構成森林集成。

### Q128 — Random Forest

Protected mapping: 中級 / L23 / L23202 / medium; answer index 1 (B).
Length ratio: 3.7826 → 1.0476; option lengths: 13/29/7/3 → 21/22/21/21.

**Review:** 特徵隨機性降低樹間相關；干擾項分別混淆一致性、樣本抽樣與固定輪替。

**Before:** 希望用多棵決策樹降低單一樹容易過擬合的風險，適合？

- A. 單一線性回歸一定是集成模型
- B. Random Forest：結合多棵具隨機性的決策樹進行集成
- C. K-means
- D. PCA

**After:** 隨機森林在各節點分裂時，僅從隨機抽出的部分特徵中尋找切分，主要用意為何？

- A. 讓各樹優先使用相同強特徵，提升預測的一致性
- B. 減少強特徵支配各樹的機會，降低樹之間的相關性
- C. 讓每棵樹使用較少訓練樣本，縮小抽樣的樣本數
- D. 讓每個特徵依固定次序輪替，減少切分時的搜尋

**Unique-answer rationale / explanation:** 特徵抽樣可避免少數強特徵反覆主導各棵樹，降低樹間相關性，有助於集成降低變異。這不是要讓樹更一致，也不是改變訓練樣本數或依固定次序輪替特徵。

### Q129 — Random Forest

Protected mapping: 中級 / L23 / L23202 / medium; answer index 1 (B).
Length ratio: 3.7826 → 1.0299; option lengths: 7/29/3/13 → 22/23/22/23.

**Review:** 考查多樹平均降低變異；明訂誤差不完全相關，且解析保留非保證改善的界線。

**Before:** 某製造企業要建立瑕疵預測模型，資料科學團隊正在選擇訓練與評估方法。 在此情境下，下列何者屬於 Ensemble Learning？

- A. K-means
- B. Random Forest：結合多棵具隨機性的決策樹進行集成
- C. PCA
- D. 單一線性回歸一定是集成模型

**After:** 製造業使用隨機森林預測產品瑕疵率。相較單棵深樹，整合多棵預測誤差不完全相關的樹，通常為何能改善泛化表現？

- A. 各樹以相同切分規則預測，使訓練誤差進一步下降
- B. 多樹平均可抵銷部分波動，降低對訓練樣本的敏感度
- C. 平均結果會選出最深的樹，使模型偏差進一步下降
- D. 各樹共同增加葉節點數量，使每筆樣本得到專屬規則

**Unique-answer rationale / explanation:** 多棵樹的誤差若不完全相關，平均可抵銷部分隨機波動、降低變異。效果取決於各樹品質與相關性，並非保證改善。相同切分、選最深樹或增加專屬葉節點，都不是此集成降低變異的原因。

### Q133 — 特徵工程

Protected mapping: 中級 / L23 / L23301 / medium; answer index 0 (A).
Length ratio: 3.1250 → 1.0227; option lengths: 25/6/10/8 → 15/15/15/14.

**Review:** 限定線性模型、獨立類別效果與無預設距離，排除整數、頻率和標準化編碼的歧義。

**Before:** 某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，類別欄位如『北／中／南』要輸入多數傳統 ML 模型前，常需做什麼？

- A. One-hot Encoding（視模型與情境而定）
- B. 一律轉成日期
- C. 只增加訓練 epoch
- D. 直接把所有值刪除

**After:** 將無序的「北／中／南」地區欄位輸入線性分類器，希望各地區可有獨立係數，不預設地區間的數值距離。哪項轉換最符合需求？

- A. 將地區展開為個別的二元指示欄位
- B. 將地區依名稱順序編為連續整數值
- C. 將地區依樣本次數替換為出現頻率
- D. 將地區編號後再進行數值標準化

**Unique-answer rationale / explanation:** One-hot 編碼以二元指示欄位表示類別，可讓地區具有各自的效果；有截距時可用參考類別編碼避免共線性。整數編碼與其標準化仍保留人為距離，頻率編碼則用出現頻率限制類別表示。

### Q134 — 特徵工程

Protected mapping: 中級 / L23 / L23301 / medium; answer index 0 (A).
Length ratio: 3.1250 → 0.9767; option lengths: 25/6/8/10 → 14/15/14/14.

**Review:** 考查編碼引入的等距線性假設；其餘三項都是保留人為距離的尺度變換。

**Before:** 非序位類別變數若直接用 1、2、3 可能引入虛假大小關係，常用？

- A. One-hot Encoding（視模型與情境而定）
- B. 一律轉成日期
- C. 直接把所有值刪除
- D. 只增加訓練 epoch

**After:** 無序類別甲、乙、丙先編為 1、2、3，再作為線性迴歸的一個數值特徵。若要避免模型把類別視為等距且效果呈線性變化，哪個修正最合適？

- A. 改用二元欄位分別表示類別身分
- B. 將整數編碼減去均值再除以標準差
- C. 將整數編碼等比例縮放至零到一
- D. 把整數編碼由一二三改成十廿卅

**Unique-answer rationale / explanation:** 二元類別指示欄位可解除單一整數特徵所強加的等距線性效果。標準化、等比例縮放或改為 10、20、30 都只改變尺度，並未移除原本的人為距離關係。

### Q135 — 特徵工程

Protected mapping: 中級 / L23 / L23301 / medium; answer index 0 (A).
Length ratio: 3.1250 → 0.9310; option lengths: 25/8/6/10 → 18/19/19/20.

**Review:** 考查推論時欄位映射；明訂完整 One-hot 及欄位順序，排除參考類別編碼歧義。

**Before:** 某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，將 categorical feature 轉成模型可處理形式的常見方法是？

- A. One-hot Encoding（視模型與情境而定）
- B. 直接把所有值刪除
- C. 一律轉成日期
- D. 只增加訓練 epoch

**After:** 金融機構以訓練集的「信用卡／轉帳／現金」建立完整 One-hot 欄位，欄位順序固定如上。新資料的付款方式為「轉帳」，應如何編碼？

- A. 編為 [0, 1, 0]，保留既定欄位順序
- B. 編為 [1, 0, 0]，將出現的類別排首位
- C. 編為 [0, 2, 0]，以類別序號填入欄位
- D. 編為 [0, 0, 1]，按新資料重排欄位順序

**Unique-answer rationale / explanation:** 訓練與推論須沿用同一類別到欄位的映射；轉帳對應第二欄，故為 [0, 1, 0]。重新排列欄位會改變特徵語意，填入類別序號 2 則不符合二元指示編碼。

### Q139 — 交叉驗證

Protected mapping: 中級 / L23 / L23303 / medium; answer index 0 (A).
Length ratio: 3.0000 → 1.0345; option lengths: 27/9/10/8 → 20/19/19/20.

**Review:** 限定獨立同分布與另留測試集；比較不同驗證方案，排除固定切分、訓練分數與測試洩漏。

**Before:** 資料量有限，希望較穩健估計模型泛化能力，可使用？

- A. 以多次不同資料切分評估模型，降低單一次切分造成的偶然性
- B. 取代所有最終測試集
- C. 保證模型百分之百泛化
- D. 讓測試集加入訓練

**After:** 一批可視為獨立同分布的資料量有限，團隊已另留最終測試集。要降低一次訓練／驗證切分對模型選擇的影響，哪個評估方案較合適？

- A. 在開發資料上輪流留出各折驗證，再彙整分數
- B. 固定同一驗證集重複訓練，再彙整各次分數
- C. 在全部開發資料上訓練，再以訓練分數排序
- D. 輪流用最終測試集挑選設定，再彙整測試分數

**Unique-answer rationale / explanation:** K-fold 在開發資料的不同折上輪流驗證，可降低只依賴單次切分的偶然性。固定驗證集未改變切分；訓練分數可能過度樂觀；用最終測試集選設定會破壞其獨立評估用途。

### Q140 — 交叉驗證

Protected mapping: 中級 / L23 / L23303 / medium; answer index 2 (C).
Length ratio: 3.0000 → 0.9750; option lengths: 9/8/27/10 → 13/13/13/14.

**Review:** 明訂標準單輪 5-fold；四個選項皆以驗證／訓練次數作答，排除 repeated CV 歧義。

**Before:** K-fold Cross Validation 的主要目的為何？

- A. 取代所有最終測試集
- B. 讓測試集加入訓練
- C. 以多次不同資料切分評估模型，降低單一次切分造成的偶然性
- D. 保證模型百分之百泛化

**After:** 將開發資料分成 5 折進行標準 5-fold 交叉驗證，每輪用 4 折訓練、1 折驗證。完成一輪完整的 5-fold 後，每筆資料被用於驗證幾次？

- A. 兩次，其餘三次用於模型訓練
- B. 四次，其餘一次用於模型訓練
- C. 一次，其餘四次用於模型訓練
- D. 五次，每次也同時用於模型訓練

**Unique-answer rationale / explanation:** 標準 5-fold 會輪流留出一折，因此每筆資料在五次擬合中恰作為驗證資料一次、訓練資料四次。同一輪內不應同時用該筆資料訓練與驗證；這不同於重複多輪交叉驗證。

### Q141 — 交叉驗證

Protected mapping: 中級 / L23 / L23303 / medium; answer index 2 (C).
Length ratio: 3.0000 → 1.0312; option lengths: 8/9/27/10 → 21/21/22/22.

**Review:** 考查跨折波動的解讀；干擾項反映挑最高分、誤認獨立樣本、以驗證取代最終測試等誤用。

**Before:** 某產品團隊準備將機器學習模型部署到正式服務，正在檢查模型訓練流程。 在此情境下，相比只做一次 train/validation split，交叉驗證常可？

- A. 讓測試集加入訓練
- B. 取代所有最終測試集
- C. 以多次不同資料切分評估模型，降低單一次切分造成的偶然性
- D. 保證模型百分之百泛化

**After:** 產品團隊在同一組 5 折上比較兩個模型，平均驗證分數相近，但各折分數差異很大。相較只看單次切分，這些結果最支持哪項判斷？

- A. 應挑選各模型最高的一折分數，以估計部署效能
- B. 可將五次分數視為獨立樣本，以忽略訓練集重疊
- C. 應檢視跨折分數的波動，以評估比較結果的穩定性
- D. 可用平均驗證分數代替最終測試，以省去獨立評估

**Unique-answer rationale / explanation:** 交叉驗證提供不同切分下的表現，平均相近但跨折波動大時應檢視模型比較是否穩定。挑最高分有樂觀偏差；各折訓練資料重疊，分數不宜直接視為獨立樣本；模型選擇後仍需獨立最終評估。

### Q154 — RAG 與向量檢索

Protected mapping: 初級 / L12 / L12202 / medium; answer index 2 (C).
Length ratio: 3.8333 → 1.0435; option lengths: 5/7/23/6 → 16/15/16/15.

**Review:** 比較四種檢索機制；三個干擾項皆為可行的字面檢索設計，非無關操作。

**Before:** RAG 系統要依語意找出相關文件片段，常使用什麼？

- A. 隨機抽文件
- B. 只儲存模型權重
- C. 以 Embedding 建立向量並做語意相似度檢索
- D. 只依檔名排序

**After:** RAG 要找出「用字不同但意思接近」的文件片段，哪種檢索方式最直接利用語意向量？

- A. 依查詢詞與片段的字面重疊程度評分
- B. 依查詢詞在片段中的出現次數評分
- C. 將查詢與片段嵌入向量後比較相似度
- D. 將查詢視為完整字串尋找相同片段

**Unique-answer rationale / explanation:** 語意嵌入將查詢與文件片段表示為可比較的向量，依相似度檢索語意接近的內容。字面重疊、詞頻與完整字串比對主要依賴用字相同，無法直接利用語意向量。

### Q155 — RAG 與向量檢索

Protected mapping: 初級 / L12 / L12202 / medium; answer index 1 (B).
Length ratio: 3.8333 → 1.0000; option lengths: 5/23/6/7 → 20/20/20/20.

**Review:** 同義改寫情境；干擾項都是詞面匹配的調整，解析不保證向量檢索結果正確。

**Before:** 希望『汽車故障』能找到含『車輛異常』的內容，而非只做完全字串比對，可使用？

- A. 隨機抽文件
- B. 以 Embedding 建立向量並做語意相似度檢索
- C. 只依檔名排序
- D. 只儲存模型權重

**After:** 查詢「汽車故障」時，希望檢索到只寫「車輛異常」的片段。下列哪個設計較能處理這種同義改寫？

- A. 提高原查詢詞的比對權重，優先回傳字面命中
- B. 用適合該語言的嵌入模型，依向量相似度排序
- C. 限定查詢詞須連續且同序，優先回傳完整詞組
- D. 提高文件中重複詞的權重，優先回傳高頻用詞

**Unique-answer rationale / explanation:** 合適的嵌入模型可讓同義改寫具有接近的向量表示，因此較能找到字面不同但語意相近的片段。加重原詞、要求連續詞組或偏重詞頻都仍依賴字面特徵；向量相近也不保證文件內容正確。

### Q156 — RAG 與向量檢索

Protected mapping: 初級 / L12 / L12202 / medium; answer index 0 (A).
Length ratio: 3.8333 → 0.9818; option lengths: 23/7/6/5 → 18/18/18/19.

**Review:** 區分 RAG 元件職責；向量索引、嵌入、生成與權重更新各自同為管線工作。

**Before:** 向量資料庫在 RAG 中常扮演什麼角色？

- A. 以 Embedding 建立向量並做語意相似度檢索
- B. 只儲存模型權重
- C. 只依檔名排序
- D. 隨機抽文件

**After:** 在典型 RAG 流程中，嵌入模型、向量資料庫與生成模型分工合作。向量資料庫主要負責哪項工作？

- A. 索引片段向量，依查詢向量取回近鄰片段
- B. 編碼原始文字，依語境產生片段向量表示
- C. 整合檢索內容，依提示生成最終回答文字
- D. 更新模型權重，將新文件寫入生成模型參數

**Unique-answer rationale / explanation:** 嵌入模型負責產生向量；向量資料庫儲存與索引向量，依查詢向量檢索相近片段；生成模型利用取得的內容回答。向量資料庫本身的檢索工作並非微調生成模型權重。

### Q169 — 分類評估

Protected mapping: 中級 / L23 / L23303 / medium; answer index 0 (A).
Length ratio: 3.0000 → 1.0000; option lengths: 21/6/7/8 → 16/16/16/16.

**Review:** 直接驗算 2×0.75×0.50/1.25=0.60；干擾項對應算術平均、乘積與最大值。

**Before:** 類別高度不平衡時，單看 Accuracy 可能誤導。若要兼顧 Precision 與 Recall，可看？

- A. Precision 與 Recall 的調和平均
- B. 資料的標準差
- C. 迴歸的決定係數
- D. 神經網路的學習率

**After:** 二元分類以正類為關注對象，Precision 為 0.75、Recall 為 0.50。兩者等權的 F1-score 為何？

- A. 0.600，依兩者的調和平均計算
- B. 0.625，依兩者的算術平均計算
- C. 0.375，依兩者直接相乘來計算
- D. 0.750，依兩者較大的數值計算

**Unique-answer rationale / explanation:** F1 = 2PR / (P + R) = 2 × 0.75 × 0.50 / 1.25 = 0.60。算術平均、直接相乘與取最大值都不是 F1；調和平均會對較低的那一項較敏感。

### Q170 — 分類評估

Protected mapping: 中級 / L23 / L23303 / medium; answer index 1 (B).
Length ratio: 3.0000 → 1.0526; option lengths: 8/21/6/7 → 18/20/19/20.

**Review:** 明訂正類、同時反映漏報誤報與等權 P/R，避免單獨 Recall 也合理；用 TP/FP/FN 公式處理全負預測。

**Before:** 正類僅占 1%，模型全部猜負類也有 99% Accuracy。較應補充哪項指標？

- A. 神經網路的學習率
- B. Precision 與 Recall 的調和平均
- C. 資料的標準差
- D. 迴歸的決定係數

**After:** 正類占 1% 的二元分類任務中，模型全部預測為負類，Accuracy 仍為 99%。團隊要以單一指標同時反映正類的漏報與誤報，並對 Precision、Recall 等權衡量，應補充哪項指標？

- A. 負類的召回率，用負類辨識能力評估模型
- B. 正類的 F1 分數，用精確率與召回率評估模型
- C. 正類的召回率，用找回正類的比例評估模型
- D. 整體的正確率，用全部預測正確比例評估模型

**Unique-answer rationale / explanation:** 正類 F1 同時反映 Precision 與 Recall，符合題目等權兼顧漏報與誤報的要求。只看正類召回率不反映誤報，只看負類召回率或整體正確率會掩蓋此例的漏報。全猜負類時 TP 為 0，依 F1 = 2TP / (2TP + FP + FN) 得 0。

### Q171 — 分類評估

Protected mapping: 中級 / L23 / L23303 / medium; answer index 2 (C).
Length ratio: 3.0000 → 1.2245; option lengths: 6/7/21/8 → 16/14/20/19.

**Review:** 限定 P、R 大於 0 排除零分母；四個選項皆為公式加名稱，區分算術／調和平均及係數錯誤。

**Before:** 某金融機構正在訓練風險模型，工程師需要在模型效能與泛化能力間取得平衡。 在此情境下，分類任務中，F1-score 是什麼？

- A. 資料的標準差
- B. 迴歸的決定係數
- C. Precision 與 Recall 的調和平均
- D. 神經網路的學習率

**After:** 金融機構評估二元分類模型，令 P 為正類 Precision、R 為正類 Recall，且兩者皆大於 0。哪個式子是 F1-score？

- A. (P + R) / 2，即兩者的算術平均
- B. 2 × P × R，即兩者乘積的兩倍
- C. 2 × P × R / (P + R)，即兩者的調和平均
- D. P × R / (P + R)，即乘積除以兩者總和

**Unique-answer rationale / explanation:** F1 是 Precision 與 Recall 的調和平均，公式為 2PR / (P + R)。算術平均不是 F1，2PR 少了分母，PR / (P + R) 則少了係數 2；F1 不納入真負類數量，使用時仍應依任務搭配其他指標。

## Reference checks

Conceptual references checked 2026-09-24; these are not official iPAS question sources. No official question was edited.
- [scikit-learn missing-value imputation](https://scikit-learn.org/stable/modules/impute.html): alternative missing-data treatments.
- [NIST IR 8053](https://csrc.nist.gov/pubs/ir/8053/final): de-identification can leave re-identification risk.
- [scikit-learn ensembles](https://scikit-learn.org/stable/modules/ensemble.html): forest randomization, averaging and boosting distinctions.
- [scikit-learn preprocessing](https://scikit-learn.org/stable/modules/preprocessing.html): categorical encoding and numerical transformations.
- [scikit-learn cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html): fold roles and independent final evaluation.
- [Microsoft vector search](https://learn.microsoft.com/en-us/azure/search/vector-search-overview): embeddings, semantic matching and vector retrieval.
- [scikit-learn model evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html): F1 definition. Q169 arithmetic independently checked.

## QA evidence

- Scoped audit: PASS, exact 21 changed IDs, 483 unique questions, protected metadata/answer indices/source labels preserved, no outside-DB app changes.
- Node v24.19.0 `vm.Script` parsed the actual inline application script: PASS.
- In-app browser fixture, 375×812 Practice: all 21 answered correctly, 21/21 and 100%; one wrong choice per item, 0/21 and 0%. Correct feedback, explanations and next/finish navigation rendered. No horizontal overflow in any of these 42 answered states.
- Wrong-question view listed all 21 wrong items; weak-area view displayed matching 0/3 or 0/6 topic results.
- Fixture, 1440×900 Mock: L12 3/3, L22 6/6, L23 12/12, each scored 100 and entered review. No question-state overflow. Console error log empty.
- Additional 375×812 L22 Mock screenshot inspected: question and options wrap normally with usable controls.
- Unfiltered app at `http://127.0.0.1:8767/`: 483 questions; all seven panels open; six non-home panels checked for no mobile overflow. Practice start/answer/explanation/next PASS (random sample included Q154).
- Unfiltered 50-question Mock: answered one correctly, submitted, observed score 2 with 1 correct/49 blank, then entered review; no mobile review overflow. The browser click reported a transport timeout at submit, but the next snapshot showed the completed result; native confirmation interaction was not independently observed.
- Official-paper flow: cached 115 second-session L11 opened with 50 questions and official-source labeling; external PDF ingestion was not retested.
- Unfiltered browser console error log empty. Viewport override reset after QA.
- `git diff --check`: PASS.

## Limitations and handoff

- Heuristic improvements and editorial review do not establish learner difficulty or item discrimination. Metadata is intentionally preserved; independent content review remains required.
- 260 whole-bank length candidates and 99 repeated groups remain for later scoped batches.
- Fixture QA does not prove persistence, full-bank sampling or native dialogs; unfiltered smoke provides limited sampling/submit coverage. Physical mobile Safari/accessibility and integrated Dev Preview verification remain human follow-up.
- Epic baseline intentionally predates newer dev changes. No unrelated dev commits were merged into this scoped branch; parent #14 governs later epic synchronization.
- Implementation handoff only: no PR, merge, issue closure, Product Verify declaration or release.
