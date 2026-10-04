# Issue #53 — Batch 3E question cue remediation

Engineering evidence, 2026-09-28. Independent Technical Review remains pending; this is not Product Verify.

## Baseline and scope

- Contract: [Issue #53](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/53).
- Branch: `codex/issue-53-batch3e`.
- Baseline: `b1cabeb1a369d4fc6671b5346bdeaf8d44793286`, the fetched `question/issue-14-remediation` head when implementation began, identical to the pre-created scoped branch. Batch 3D was already integrated.
- Exactly 24 self-authored items: Q232–Q237, Q256–Q267, Q286–Q291. Only `question`, `options`, and `explanation` changed.
- Preserved all IDs/order, level, subject/topic, concept, difficulty, answer index, sourceType and other question fields, non-question DB metadata, and the entire HTML/CSS/JS shell outside the DB.
- Official content, source links, UI, localStorage and application logic are unchanged. No new dependencies. Audit script only adds `batch3e`; all eight existing batch definitions remain unchanged.

## Reproducible audit

```powershell
python scripts/audit_question_cues.py --batch batch3e --baseline b1cabeb1a369d4fc6671b5346bdeaf8d44793286 --csv docs/QUESTION_CUE_BIAS_BATCH3E.csv
node scripts/test_past_answer_feedback.cjs
python scripts/serve_question_batch1a.py --batch batch3e
git diff --check
```

The [CSV](QUESTION_CUE_BIAS_BATCH3E.csv) includes 966 data rows: all 483 items before and after, with option lengths, ratio, unique-longest flag, repeated IDs and flag reasons. Length counts Unicode code points excluding whitespace. Ratio compares the correct option with mean distractor length. Repeated option sets ignore option order and whitespace.

| Whole-bank metric | Before | After |
|---|---:|---:|
| Questions / unique IDs | 483 / 483 | 483 / 483 |
| Unique longest correct option | 311 | 291 |
| Correct-length ratio ≥ 2 | 131 | 107 |
| Correct-length ratio ≥ 3 | 0 | 0 |
| Repeated option-set groups | 68 | 64 |
| Questions in repeated sets | 323 | 299 |
| Answer A / B / C / D | 131 / 109 / 122 / 121 | 131 / 109 / 122 / 121 |

Scoped validation PASS: all 24 ratios are below 2 (0.9091–1.1831), and every reviewed option set is unique across the full bank. Four correct options remain uniquely longest: Q232 (1.1831), Q267 (1.0862), Q289 (1.1077), Q291 (1.1194). Their small differences convey the technique or validation action; the options no longer expose a long correct-only definition against short unrelated distractors. These flags remain visible in the CSV rather than being suppressed. Heuristics do not replace editorial review. Remaining whole-bank flags are outside this issue's scope.

## Editorial review

Engineering Agent reviewed every item for one defensible answer, plausible alternatives, answer/explanation consistency, grammar and completeness cues. Numeric questions state their assumptions and period so that omitted costs, denominator errors or incompatible accounting treatments produce explicit distractors. No protected metadata or contract change was needed.

| Cluster | Distinct checks | Editorial constraints |
|---|---|---|
| Q232–Q237 Vector similarity | semantic retrieval, cosine scaling, Top-1 ranking, score interpretation, compatible encoders, hybrid retrieval | Similarity is not a calibrated probability or guarantee; equal dimensions do not imply compatible spaces. Keyword search remains useful for exact identifiers. |
| Q256–Q261 ROI / TCO | multi-year TCO, ROI denominator, net time value, exit cost, expected review cost, break-even volume | Explicit no-other-cost / no-discount assumptions where relevant. Time value is distinguished from realized cash savings. Alternatives show specific accounting errors instead of generic “only look at price” statements. |
| Q262–Q267 NER / extraction | span/type output, context/boundaries, strict entity scoring, relation roles, domain adaptation, entity linking | Full boundaries and strict scoring are explicit. Organization type is distinct from buyer/supplier role and from a canonical company ID. |
| Q286–Q291 Multimodal alignment | timestamps, contrastive pairs, missing modality, spatial coordinates, semantic space, visual grounding evaluation | Do not equate equal shape with semantic alignment; no assumption that repeated evidence adds a modality. Alignment includes temporal/spatial correspondence, not only shared embeddings. |

Before/after options and the rationale supporting each key are recorded below. All six items in each cluster now have different option sets and different decision points. This is engineering editorial evidence, not an independent Technical Review decision.

## QA evidence

- Scoped audit PASS: exact 24 changed IDs; 483 unique IDs; four distinct options; valid answer indices and subject/topic references; protected fields, other questions, DB metadata and non-DB shell unchanged.
- Baseline comparison confirmed all eight prior audit batch definitions unchanged.
- JavaScript: Node compiled the page's one inline script with `new Function`; PASS. Python: AST parsing of audit and fixture scripts; PASS.
- Official-answer regression: `node scripts/test_past_answer_feedback.cjs` PASS for 16 answer/selection combinations, repeat guard, progress, render escaping, PDF entry, no duplicates/placeholders, navigation/reset and completion scoring.
- Browser: in-app Chromium, existing fixture at `http://127.0.0.1:8766/batch3e`. Desktop viewport 1280×900; mobile viewport 375×812.
- Practice: answered all 24 revised IDs, 12 on desktop and 12 on mobile. Q257 deliberately answered A; other 23 answered correctly. Verified feedback, explanations and self-authored labels after every answer; navigation worked throughout.
- Wrong-question view contained only Q257. Weak-area statistics: L12301 5/6 (83%); L12202, L21101 and L21104 each 6/6 (100%).
- Desktop L12 mock: all 12 scoped L12 questions, 11 correct, one incorrect, zero unanswered; score 92. Wrong-only review showed Q257 selected A, correct B, and the 20/80 = 25% explanation.
- Mobile L21 mock: all 12 scoped L21 questions correct, score 100. Entered full review and expanded Q288; answer, source and explanation rendered normally.
- Screenshots inspected for mobile Practice (Q261), desktop wrong-only mock review (Q257), and mobile mock review (Q288). In mobile Practice and review, `innerWidth=375`, document `scrollWidth=360`: no page-level horizontal overflow. Existing scrollable tab bar remained usable.
- All seven tabs opened. Official scope links rendered. Official past-paper tab loaded the 115 second-session L11 structured paper with 50 questions, official source label, answer controls and original PDF link.
- Browser warning/error log empty at completion. `git diff --check` PASS before commit.

Limits: the existing fixture narrows self-authored content to this batch, replaces storage with memory, auto-accepts confirm dialogs and disables background PDF prewarming. These checks cover actual rendering/scoring for the changed questions, not persistent localStorage, native dialogs, a full 50-question self-authored mock, live PDF extraction, physical mobile devices, Dev Preview or production. Unchanged app/storage/official-content code is also checked by the non-DB-shell assertion. No known implementation blocker remains; independent review is pending.

## Technical references checked

- [scikit-learn cosine similarity](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html): normalized dot product and positive-scale invariance.
- [Microsoft hybrid search](https://learn.microsoft.com/azure/search/hybrid-search-overview): complementary vector/keyword retrieval and exact product identifiers.
- [FinOps for AI](https://www.finops.org/wg/finops-for-ai-overview/): total ownership cost and business value. Numeric amounts in the questions are explicitly hypothetical exercise inputs.
- [spaCy linguistic features](https://spacy.io/usage/linguistic-features) and [entity recognizer](https://spacy.io/api/entityrecognizer): entity spans/types and the distinction from entity linking.
- [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020): paired image/text training and cross-modal representations.

These references support self-authored editorial checks. No official iPAS wording, answer or metadata has been changed.

## Item-by-item review

### Q232 — 向量相似度

Protected mapping: 初級 / L12 / L12202 / medium; answer index 0 (A).
Length ratio: 2.4643 → 1.1831; lengths: 46/16/23/17 → 28/24/24/23.

**Before:** 使用者查「車子發不動」，知識庫內容寫「引擎無法啟動」。若希望仍能找到相關段落，最適合？

- A. Embedding 將內容映射為向量，語意檢索常以 cosine similarity 等度量找近鄰
- B. Embedding 只用來加密資料
- C. Cosine similarity 是模型的幻覺率
- D. 向量檢索只能找到字面完全相同的句子

**After:** 查詢寫「車子發不動」，文件寫「引擎無法啟動」。團隊希望補強不同用詞但意思相近的搜尋，哪種方法最直接？

- A. 以語意 embedding 表示查詢與文件，再比較向量相似度
- B. 以原始關鍵字統計查詢與文件，再依相同詞彙數量排序
- C. 以完整查詢字串比對各份文件，再依連續字串命中排序
- D. 以文件標題比對查詢的字詞，再依標題命中字數排序

**Unique-answer rationale / explanation:** 語意 embedding 可把相關語意映射到可比較的向量表示，補強不同用詞的檢索。其他方法仍以字面命中為主要依據；實際效果仍需用代表性查詢驗證，不能保證每個同義表達都能找到。

### Q233 — 向量相似度

Protected mapping: 初級 / L12 / L12202 / medium; answer index 2 (C).
Length ratio: 2.4643 → 1.0000; lengths: 17/23/46/16 → 17/18/17/16.

**Before:** 向量資料庫如何支援語意搜尋，而不是只做關鍵字完全匹配？

- A. 向量檢索只能找到字面完全相同的句子
- B. Cosine similarity 是模型的幻覺率
- C. Embedding 將內容映射為向量，語意檢索常以 cosine similarity 等度量找近鄰
- D. Embedding 只用來加密資料

**After:** 非零向量甲＝(1, 2)，乙＝(2, 4)。使用 cosine similarity 比較兩者時，結果為何？

- A. 相似度為 0，因兩向量的各維數值不同
- B. 相似度為 0.5，因甲的長度為乙的一半
- C. 相似度為 1，因兩向量具有相同的方向
- D. 相似度為 2，因乙的長度為甲的兩倍

**Unique-answer rationale / explanation:** Cosine similarity 是內積除以兩向量長度的乘積。乙是甲的正倍數，方向相同，結果為 1；它不把長度倍數直接當作相似度，也不是逐維相等比對。

### Q234 — 向量相似度

Protected mapping: 初級 / L12 / L12202 / medium; answer index 2 (C).
Length ratio: 2.4643 → 1.0000; lengths: 17/16/46/23 → 12/12/12/12.

**Before:** RAG 中的 Embedding 與 cosine similarity 通常分別扮演什麼角色？

- A. 向量檢索只能找到字面完全相同的句子
- B. Embedding 只用來加密資料
- C. Embedding 將內容映射為向量，語意檢索常以 cosine similarity 等度量找近鄰
- D. Cosine similarity 是模型的幻覺率

**After:** 同一 embedding 模型對查詢與四段文件計算 cosine similarity，甲 0.82、乙 0.75、丙 0.91、丁 0.68。未套其他規則且採精確排序，Top-1 應取哪段？

- A. 取甲，因相似度為 0.82
- B. 取乙，因相似度為 0.75
- C. 取丙，因相似度為 0.91
- D. 取丁，因相似度為 0.68

**Unique-answer rationale / explanation:** 以 cosine similarity 由高到低排序時，0.91 的丙為 Top-1。若使用距離則可能是由小到大，不能混用排序方向；最高相似度也不等於內容必定正確。

### Q235 — 向量相似度

Protected mapping: 初級 / L12 / L12202 / medium; answer index 2 (C).
Length ratio: 2.4643 → 1.0526; lengths: 17/16/46/23 → 19/18/20/20.

**Before:** 兩句話用詞不同但意思相近，系統希望在向量空間判定它們接近，通常使用？

- A. 向量檢索只能找到字面完全相同的句子
- B. Embedding 只用來加密資料
- C. Embedding 將內容映射為向量，語意檢索常以 cosine similarity 等度量找近鄰
- D. Cosine similarity 是模型的幻覺率

**After:** 某段文件與查詢的 cosine similarity 為 0.88，系統未做機率校準。對這個數值的解讀何者合理？

- A. 代表該段文件有 88% 機率能正確回答查詢
- B. 代表該段文件與查詢有 88% 的字詞相同
- C. 代表兩者向量方向接近，仍需核對內容相關性
- D. 代表本次搜尋已找回全部相關文件中的 88%

**Unique-answer rationale / explanation:** 0.88 是向量方向相近程度的分數，不是未經校準即可使用的正確率、字詞重疊率或檢索召回率。語意相近的內容仍可能過時、條件不符或不含答案。

### Q236 — 向量相似度

Protected mapping: 初級 / L12 / L12202 / medium; answer index 0 (A).
Length ratio: 2.4643 → 0.9857; lengths: 46/17/16/23 → 23/23/24/23.

**Before:** 下列哪一項最正確描述向量語意檢索？

- A. Embedding 將內容映射為向量，語意檢索常以 cosine similarity 等度量找近鄰
- B. 向量檢索只能找到字面完全相同的句子
- C. Embedding 只用來加密資料
- D. Cosine similarity 是模型的幻覺率

**After:** 文件以模型甲建立向量，查詢改用獨立訓練的模型乙；兩者維度相同，但未訓練跨模型映射。檢索品質下降時，應優先修正什麼？

- A. 改用相容的查詢與文件編碼器，必要時重建文件向量
- B. 保留兩個編碼器，將所有向量補零成相同的更高維度
- C. 保留兩個編碼器，把 cosine 分數乘上相同的常數
- D. 保留兩個編碼器，將檢索結果改依文件建立時間排序

**Unique-answer rationale / explanation:** 維度相同不代表向量座標的語意一致。應使用同一模型或經共同訓練、明確相容的查詢／文件編碼器；更換模型可能需重建索引。補零、共同縮放分數或改按日期排序不會建立跨模型語意對應。

### Q237 — 向量相似度

Protected mapping: 初級 / L12 / L12202 / medium; answer index 3 (D).
Length ratio: 2.4643 → 1.0154; lengths: 17/23/16/46 → 22/22/21/22.

**Before:** 產品規格搜尋需要「意思相近也找得到」，應優先採用哪種表示與比較方式？

- A. 向量檢索只能找到字面完全相同的句子
- B. Cosine similarity 是模型的幻覺率
- C. Embedding 只用來加密資料
- D. Embedding 將內容映射為向量，語意檢索常以 cosine similarity 等度量找近鄰

**After:** 產品搜尋同時需要找「省電的筆電」等語意描述，並精確命中「ZX-410」等料號。單純向量搜尋常把相似料號混在一起，較合適的改善是？

- A. 增加語意檢索的回傳筆數，直接依原向量分數排序
- B. 將查詢中的料號改成產品類別，再送入原向量檢索
- C. 降低語意檢索的相似度門檻，納入更多相近產品
- D. 結合詞彙與向量檢索，依驗證集調整結果合併方式

**Unique-answer rationale / explanation:** 詞彙檢索可補強精確料號，向量檢索可補強語意描述；混合檢索需評估合併策略。增加回傳數或降低門檻不會直接優先命中精確料號；將料號改成類別還可能丟失必要識別資訊。

### Q256 — ROI / TCO

Protected mapping: 初級 / L12 / L12301 / hard; answer index 1 (B).
Length ratio: 2.7143 → 1.0465; lengths: 11/38/18/13 → 14/15/15/14.

**Before:** 兩個 LLM 方案單價差很多，但整合與人工覆核需求也不同。要比較哪個方案更划算，應採用？

- A. 只計算第一次 PoC 費用
- B. 同時評估可量化效益、導入與持續維運成本、風險與替代方案，再計算 ROI/TCO
- C. 只要節省工時就不需考慮品質與風險成本
- D. 只比較每百萬 Token 單價

**After:** 兩個方案服務品質與用量相同。甲導入費 120 萬、每年維運 10 萬；乙導入費 30 萬、每年維運 50 萬。使用三年，忽略折現且無其他成本，哪個 TCO 較低？

- A. 乙較低：甲 130 萬，乙 80 萬
- B. 甲較低：甲 150 萬，乙 180 萬
- C. 乙較低：甲 390 萬，乙 240 萬
- D. 甲較低：甲 30 萬，乙 150 萬

**Unique-answer rationale / explanation:** 三年 TCO＝一次性導入費＋三年維運費。甲為 120＋3×10＝150 萬，乙為 30＋3×50＝180 萬。只算一年、重複計入導入費或漏掉導入費都會偏離題目期間。

### Q257 — ROI / TCO

Protected mapping: 初級 / L12 / L12301 / hard; answer index 1 (B).
Length ratio: 2.7143 → 0.9333; lengths: 11/38/13/18 → 14/14/15/16.

**Before:** PoC 成功後，主管問「全面導入到底值不值得」。最完整的財務評估方式是？

- A. 只計算第一次 PoC 費用
- B. 同時評估可量化效益、導入與持續維運成本、風險與替代方案，再計算 ROI/TCO
- C. 只比較每百萬 Token 單價
- D. 只要節省工時就不需考慮品質與風險成本

**After:** AI 專案第一年的可量化效益為 100 萬，含導入及營運的總成本為 80 萬。依 ROI＝（效益－成本）／成本計算，不折現且無其他項目，ROI 為何？

- A. ROI 為 20%，以效益作分母
- B. ROI 為 25%，以成本作分母
- C. ROI 為 80%，以成本除以效益
- D. ROI 為 125%，以效益除以成本

**Unique-answer rationale / explanation:** 依題目定義，淨效益為 100－80＝20 萬，ROI＝20／80＝25%。20% 的分母錯置；80% 是成本效益比，125% 是未扣成本的效益成本比。

### Q258 — ROI / TCO

Protected mapping: 初級 / L12 / L12301 / hard; answer index 0 (A).
Length ratio: 2.7143 → 0.9444; lengths: 38/13/11/18 → 17/18/18/18.

**Before:** AI 摘要每月可省 500 小時，但需要監控、人工作業與 API 成本。ROI 評估應如何進行？

- A. 同時評估可量化效益、導入與持續維運成本、風險與替代方案，再計算 ROI/TCO
- B. 只比較每百萬 Token 單價
- C. 只計算第一次 PoC 費用
- D. 只要節省工時就不需考慮品質與風險成本

**After:** 摘要工具每月省下原作業 500 小時，但新增覆核 100 小時。以每小時 300 元估算人力時間價值，另付 API 及維運 4 萬元。無其他成本，每月淨效益估值為何？

- A. 8 萬元：先扣覆核時間，再扣營運費用
- B. 11 萬元：採原節省時間，再扣營運費用
- C. 12 萬元：先扣覆核時間，不扣營運費用
- D. 14 萬元：加上覆核時間，再扣營運費用

**Unique-answer rationale / explanation:** 淨時間價值＝（500－100）×300＝12 萬元，再扣 4 萬元為 8 萬元。這是時間價值估算；若薪資支出未減少，不應直接宣稱已有同額現金節省。

### Q259 — ROI / TCO

Protected mapping: 初級 / L12 / L12301 / hard; answer index 1 (B).
Length ratio: 2.7143 → 1.0755; lengths: 13/38/18/11 → 17/19/19/17.

**Before:** 下列哪一項最符合生成式 AI 導入的 TCO 概念？

- A. 只比較每百萬 Token 單價
- B. 同時評估可量化效益、導入與持續維運成本、風險與替代方案，再計算 ROI/TCO
- C. 只要節省工時就不需考慮品質與風險成本
- D. 只計算第一次 PoC 費用

**After:** 某方案一次性整合費 20 萬、每月 API 與監控費 3 萬，24 個月後結束服務另付資料移轉費 8 萬。合約無其他費用且不折現，完整期間 TCO 為何？

- A. 92 萬元：整合費加上 24 個月營運費
- B. 100 萬元：整合、營運與結束移轉費合計
- C. 72 萬元：24 個月 API 與監控費的合計
- D. 28 萬元：初始整合費加上結束移轉費

**Unique-answer rationale / explanation:** TCO 應包含指定生命週期內的必要成本：20＋24×3＋8＝100 萬元。終止與移轉費也是成本，不能只算購置或使用期間的其中一部分。

### Q260 — ROI / TCO

Protected mapping: 初級 / L12 / L12301 / hard; answer index 0 (A).
Length ratio: 2.7143 → 1.0000; lengths: 38/11/18/13 → 15/15/15/15.

**Before:** 模型 A Token 費較低但錯誤率高、需要大量人工覆核；模型 B 較貴但流程成本低。比較時應？

- A. 同時評估可量化效益、導入與持續維運成本、風險與替代方案，再計算 ROI/TCO
- B. 只計算第一次 PoC 費用
- C. 只要節省工時就不需考慮品質與風險成本
- D. 只比較每百萬 Token 單價

**After:** 兩模型經覆核後皆達品質門檻。每件甲 API 費 0.2 元、10% 需覆核；乙 API 費 0.5 元、2% 需覆核。每次覆核 5 元，無其他成本，何者每件期望成本較低？

- A. 乙較低：甲 0.7 元，乙 0.6 元
- B. 甲較低：甲 0.2 元，乙 0.5 元
- C. 甲較低：甲 5.2 元，乙 5.5 元
- D. 乙較低：甲 0.5 元，乙 0.1 元

**Unique-answer rationale / explanation:** 期望成本＝每件 API 費＋覆核率×每次覆核費。甲 0.2＋0.10×5＝0.7 元，乙 0.5＋0.02×5＝0.6 元。另三項分別漏算覆核、假設每件均覆核或漏算 API。

### Q261 — ROI / TCO

Protected mapping: 初級 / L12 / L12301 / hard; answer index 0 (A).
Length ratio: 2.7143 → 0.9091; lengths: 38/18/13/11 → 20/21/22/23.

**Before:** 評估 AI 專案商業可行性時，為何不能只看模型 API 單價？

- A. 同時評估可量化效益、導入與持續維運成本、風險與替代方案，再計算 ROI/TCO
- B. 只要節省工時就不需考慮品質與風險成本
- C. 只比較每百萬 Token 單價
- D. 只計算第一次 PoC 費用

**After:** 某 AI 流程每年固定成本 12 萬元，每件變動成本 2 元，可取代每件成本 5 元的原流程。兩者品質相同且無其他成本或效益，一年處理多少件達到成本損益兩平？

- A. 40,000 件，以固定成本除以每件淨節省
- B. 60,000 件，以固定成本除以每件變動成本
- C. 24,000 件，以固定成本除以原流程單件成本
- D. 約 17,143 件，以固定成本除以兩單件成本之和

**Unique-answer rationale / explanation:** 每件淨節省為 5－2＝3 元，令 120,000＋2N＝5N，可得 N＝40,000。不能用變動成本本身、原單價或兩者之和作為每件可回收的金額。

### Q262 — NER 與文本抽取

Protected mapping: 中級 / L21 / L21101 / medium; answer index 2 (C).
Length ratio: 2.3846 → 0.9661; lengths: 13/13/31/13 → 20/20/19/19.

**Before:** 法務系統要從合約中自動找出公司名稱、日期與金額欄位，最適合的 NLP 技術是？

- A. NER 是數值特徵標準化方法
- B. NER 主要用於影像物件偵測
- C. 命名實體辨識（NER）可從文字辨識人名、地點、組織、日期等實體
- D. NER 只能產生新的長篇文字

**After:** 合約抽取服務要在原文標出公司名稱、日期及金額的起訖位置與類型，暫不產生摘要或判斷合約種類。哪種輸出最符合此 NER 任務？

- A. 每份合約的主題類別，以及各類別的信心分數
- B. 每份合約的重點句子，以及各句子的排序分數
- C. 每個實體的原文範圍，以及對應的實體類型
- D. 每段文字的情緒標籤，以及對應的情緒強度

**Unique-answer rationale / explanation:** NER 辨識文字中的實體範圍並給予類型標籤，例如組織、日期或金額。文件分類、摘要句排序與情緒分析的輸出單位及目標都不同。

### Q263 — NER 與文本抽取

Protected mapping: 中級 / L21 / L21101 / medium; answer index 2 (C).
Length ratio: 2.3846 → 1.0541; lengths: 13/13/31/13 → 11/13/13/13.

**Before:** 新聞分析希望標註人物、地點、組織，應使用？

- A. NER 是數值特徵標準化方法
- B. NER 只能產生新的長篇文字
- C. 命名實體辨識（NER）可從文字辨識人名、地點、組織、日期等實體
- D. NER 主要用於影像物件偵測

**After:** 新聞句子為「蘋果公司宣布在台北設立研發中心」。標註規範含組織、地點、人名與產品，要求依語境標完整實體。何者符合規範？

- A. 蘋果＝組織；台北＝地點
- B. 蘋果公司＝產品；台北＝地點
- C. 蘋果公司＝組織；台北＝地點
- D. 蘋果公司＝組織；台北＝組織

**Unique-answer rationale / explanation:** 此句的蘋果公司是宣布設立中心的組織，台北是設立地點。NER 應依上下文及標註規範判斷，不能只因名稱中出現某個詞就套用固定類型。

### Q264 — NER 與文本抽取

Protected mapping: 中級 / L21 / L21101 / medium; answer index 0 (A).
Length ratio: 2.3846 → 1.0000; lengths: 31/13/13/13 → 14/14/14/14.

**Before:** 客服文字要抽取產品名稱與城市名稱，哪個技術最直接？

- A. 命名實體辨識（NER）可從文字辨識人名、地點、組織、日期等實體
- B. NER 是數值特徵標準化方法
- C. NER 只能產生新的長篇文字
- D. NER 主要用於影像物件偵測

**After:** NER 評估採「範圍與類型皆完全相符」才算正確。某句唯一標準實體為「台灣數據科技股份有限公司／組織」，模型只標「數據科技／組織」。此句應如何計數？

- A. TP＝0、FP＝1、FN＝1
- B. TP＝1、FP＝0、FN＝0
- C. TP＝0、FP＝0、FN＝1
- D. TP＝0、FP＝1、FN＝0

**Unique-answer rationale / explanation:** 嚴格實體層級比對要求邊界和類型都正確。預測的短範圍不是標準實體，記一個 FP；完整標準實體沒有被正確找到，另記一個 FN。不能當成完整命中或只記其中一項。

### Q265 — NER 與文本抽取

Protected mapping: 中級 / L21 / L21101 / medium; answer index 0 (A).
Length ratio: 2.3846 → 0.9194; lengths: 31/13/13/13 → 19/21/21/20.

**Before:** 下列哪一個任務最符合 Named Entity Recognition？

- A. 命名實體辨識（NER）可從文字辨識人名、地點、組織、日期等實體
- B. NER 只能產生新的長篇文字
- C. NER 主要用於影像物件偵測
- D. NER 是數值特徵標準化方法

**After:** NER 已標出交易文件中的公司名稱，但「甲向乙採購」與「乙供貨給甲」兩種句型並存。若要填入採購方與供應方欄位，接下來最直接需要哪一步？

- A. 分析實體間的語意關係，判定各自交易角色
- B. 固定把句中最先提到的公司，設為交易的採購方
- C. 固定把句中最後提到的公司，設為交易的採購方
- D. 比較組織實體的信心分數，較高者設為採購方

**Unique-answer rationale / explanation:** NER 找出組織不等於已判定買賣關係，還需關係抽取或依句意解析角色。兩種句型的採購方都是甲，但提及順序不同；實體辨識信心也不是交易角色的判斷依據。

### Q266 — NER 與文本抽取

Protected mapping: 中級 / L21 / L21101 / medium; answer index 2 (C).
Length ratio: 2.3846 → 1.0147; lengths: 13/13/31/13 → 22/23/23/23.

**Before:** 若輸出需要標示「台北=地點、OpenAI=組織」，通常使用什麼？

- A. NER 主要用於影像物件偵測
- B. NER 是數值特徵標準化方法
- C. 命名實體辨識（NER）可從文字辨識人名、地點、組織、日期等實體
- D. NER 只能產生新的長篇文字

**After:** 通用 NER 模型能辨識人名與地點，卻常漏掉企業自訂產品代號。團隊要提升 PRODUCT 類型的抽取品質，何者最直接？

- A. 增加產品文章的摘要長度，再從摘要重做相同辨識
- B. 降低所有實體的信心門檻，將新增結果一律標為產品
- C. 制定產品邊界與類型規則，以領域標註資料訓練驗證
- D. 沿用人名地點的標註資料，把輸出類型名稱改成產品

**Unique-answer rationale / explanation:** 新增領域實體類型需要一致的標註規範與代表性資料，才能訓練並驗證邊界及類型。拉長摘要、任意降低門檻或重新命名既有標籤，都不能提供正確的產品判斷依據。

### Q267 — NER 與文本抽取

Protected mapping: 中級 / L21 / L21101 / medium; answer index 1 (B).
Length ratio: 2.3846 → 1.0862; lengths: 13/31/13/13 → 20/21/19/19.

**Before:** 某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，資訊抽取流程中，NER 的主要用途是？

- A. NER 主要用於影像物件偵測
- B. 命名實體辨識（NER）可從文字辨識人名、地點、組織、日期等實體
- C. NER 是數值特徵標準化方法
- D. NER 只能產生新的長篇文字

**After:** NER 已找出「台積電」與「台灣積體電路製造公司」兩個組織提及。下游需要把它們連到同一公司主檔 ID，最適合補上哪項處理？

- A. 再做文件主題分類，將兩段文字歸入同一主題
- B. 進行實體連結與別名解析，對應共同的主檔識別
- C. 再做詞性標註，將兩個名稱都歸入同一詞性
- D. 進行情緒分類，將兩個名稱都歸入同一情緒

**Unique-answer rationale / explanation:** NER 辨識文字提及與類型；實體連結則利用別名及語境，對應知識庫或主檔的唯一識別。相同主題、詞性或情緒不代表同一現實實體。

### Q286 — 多模態對齊

Protected mapping: 中級 / L21 / L21104 / hard; answer index 1 (B).
Length ratio: 2.0769 → 0.9706; lengths: 17/36/15/20 → 21/22/24/23.

**Before:** 某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，影片分析要同時利用畫面、字幕與聲音判斷事件，最核心的技術問題之一是？

- A. 多模態模型不需要處理時間或空間對齊
- B. 多模態系統需將不同模態的特徵對齊／融合，讓文字、影像或聲音可共同表示語意
- C. 每個模態完全獨立且禁止共享表示
- D. 只需把圖片檔名改成文字即可完成多模態融合

**After:** 影音事件系統發現聲音事件的時間戳一律比對應畫面晚 2 秒，兩串流採樣率也不同。若要配對同一事件的片段，應先做什麼？

- A. 依各自的採樣序號直接配對，維持原始串流順序
- B. 校正時間偏移並映射共同時間軸，再配對對應片段
- C. 分別挑出聲音最強與畫面最亮的片段，再視為同一事件
- D. 將整段聲音與畫面各取平均特徵，再分配到所有片段

**Unique-answer rationale / explanation:** 時間戳存在固定偏移，且採樣序號不等於共同時間，因此要先校正並按共同時間範圍配對。各自極值或整段平均會丟失事件的時間對應，不能解決同一事件的片段對齊。

### Q287 — 多模態對齊

Protected mapping: 中級 / L21 / L21104 / hard; answer index 1 (B).
Length ratio: 2.0769 → 1.0000; lengths: 20/36/15/17 → 23/23/24/22.

**Before:** 某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，圖文搜尋希望「一張狗的照片」與「一隻在草地跑的狗」在共同空間接近，這需要？

- A. 只需把圖片檔名改成文字即可完成多模態融合
- B. 多模態系統需將不同模態的特徵對齊／融合，讓文字、影像或聲音可共同表示語意
- C. 每個模態完全獨立且禁止共享表示
- D. 多模態模型不需要處理時間或空間對齊

**After:** 圖文檢索以成對圖片與描述訓練共同嵌入空間。採對比式目標時，哪種安排最能學到跨模態對應？

- A. 拉近同批所有圖片與文字，讓整批樣本共用相近表示
- B. 拉近語意匹配的圖文配對，區分經確認不匹配的配對
- C. 分別拉近圖片及文字各自的近鄰，不使用圖文配對資訊
- D. 依各模態的類別頻率排序，再按名次建立圖文配對

**Unique-answer rationale / explanation:** 對比式學習利用正配對與負配對建立跨模態語意對應。不能把整批樣本都拉近，或只做各模態內的相似性；負配對也需注意同義描述及多張相符圖片造成的假負例。

### Q288 — 多模態對齊

Protected mapping: 中級 / L21 / L21104 / hard; answer index 3 (D).
Length ratio: 2.0769 → 0.9718; lengths: 17/20/15/36 → 24/25/22/23.

**Before:** 某金融服務團隊正在評估 AI 方案的可行性與風險，需選出最合理的設計。 在此情境下，多模態客服同時讀照片與文字說明，為了共同推理應如何處理？

- A. 多模態模型不需要處理時間或空間對齊
- B. 只需把圖片檔名改成文字即可完成多模態融合
- C. 每個模態完全獨立且禁止共享表示
- D. 多模態系統需將不同模態的特徵對齊／融合，讓文字、影像或聲音可共同表示語意

**After:** 影音模型原本使用同步的聲音與畫面。部署時攝影機偶爾斷訊，團隊仍要提供可標示不確定性的事件判斷。哪個方案較能處理缺失模態？

- A. 把缺失畫面填成全零並視為有效影像，維持原信心分數
- B. 重複使用最近一張畫面並視為即時影像，維持原融合權重
- C. 以聲音的預測複製成影像預測，再將兩份結果平均
- D. 標記畫面缺失並驗證聲音備援，調整融合及信心呈現

**Unique-answer rationale / explanation:** 缺失模態應被明確標記，並驗證模型或備援流程在此條件下的表現與不確定性。零值或過期畫面不能直接視為有效同步觀測；複製聲音結果也不會增加獨立的影像證據。

### Q289 — 多模態對齊

Protected mapping: 中級 / L21 / L21104 / hard; answer index 3 (D).
Length ratio: 2.0769 → 1.1077; lengths: 20/17/15/36 → 21/22/22/24.

**Before:** 下列哪一項最符合 cross-modal alignment？

- A. 只需把圖片檔名改成文字即可完成多模態融合
- B. 多模態模型不需要處理時間或空間對齊
- C. 每個模態完全獨立且禁止共享表示
- D. 多模態系統需將不同模態的特徵對齊／融合，讓文字、影像或聲音可共同表示語意

**After:** 文件問答先在原圖取得 OCR 文字框座標，之後把影像旋轉並裁切才送入視覺編碼器。若要讓文字框對應正確影像區域，應如何處理？

- A. 保留原圖文字框座標，直接套用到處理後的影像
- B. 依 OCR 文字的字數重排座標，配合文字內容長度
- C. 只按新圖寬高縮放座標，忽略旋轉角度與裁切位移
- D. 套用相同幾何轉換更新座標，處理落在裁切外的文字框

**Unique-answer rationale / explanation:** 空間對齊需讓文字框與影像使用一致的座標系，包含旋轉及裁切的轉換，並處理已不在影像內的框。僅保留舊座標、按字數重排或只縮放寬高都不足以維持區域對應。

### Q290 — 多模態對齊

Protected mapping: 中級 / L21 / L21104 / hard; answer index 2 (C).
Length ratio: 2.0769 → 0.9851; lengths: 20/15/36/17 → 22/22/22/23.

**Before:** 某企業正在規劃 AI 系統導入，技術團隊必須在架構評估會議中做出正確判斷。 在此情境下，視覺與文字嵌入若完全沒有對齊，最可能造成什麼問題？

- A. 只需把圖片檔名改成文字即可完成多模態融合
- B. 每個模態完全獨立且禁止共享表示
- C. 多模態系統需將不同模態的特徵對齊／融合，讓文字、影像或聲音可共同表示語意
- D. 多模態模型不需要處理時間或空間對齊

**After:** 圖像與文字編碼器各自訓練、輸出皆為 512 維；團隊直接計算跨模態 cosine similarity，結果接近隨機。若兩者未做任何跨模態訓練，最主要缺口是？

- A. 兩者向量維度不足，將維度同時加倍即可建立對應
- B. 兩者向量長度不同，各自正規化即可建立語意對應
- C. 兩者座標語意未對齊，需要配對資料或學得的映射
- D. 兩者分數範圍不同，將分數平移到正值即可建立對應

**Unique-answer rationale / explanation:** 相同維度只代表可以進行數值運算，不保證不同編碼器的座標具有共同語意。跨模態配對訓練或適當映射才能學習對應；增加維度、長度正規化或分數平移不會自行完成語意對齊。

### Q291 — 多模態對齊

Protected mapping: 中級 / L21 / L21104 / hard; answer index 2 (C).
Length ratio: 2.0769 → 1.1194; lengths: 15/17/36/20 → 22/22/25/23.

**Before:** 一家跨部門產品團隊準備把 AI 能力整合進既有服務，正在進行技術選型。 在此情境下，多模態模型設計時，為何需要對齊不同模態的語意表示？

- A. 每個模態完全獨立且禁止共享表示
- B. 多模態模型不需要處理時間或空間對齊
- C. 多模態系統需將不同模態的特徵對齊／融合，讓文字、影像或聲音可共同表示語意
- D. 只需把圖片檔名改成文字即可完成多模態融合

**After:** 圖文問答模型在測試集表現良好，但團隊懷疑它只靠文字線索猜答案。要檢查是否利用圖文對應關係，哪種驗證最有辨識力？

- A. 在相同配對上增加輸出字數，觀察回答是否更詳細
- B. 重測訓練時看過的圖文配對，觀察答案是否更穩定
- C. 固定問題換入會改變答案的圖片，檢查答案是否隨之改變
- D. 只測文字就能作答的題目，檢查語言模型的答題能力

**Unique-answer rationale / explanation:** 固定文字但替換會改變正解的影像，可檢查模型是否依視覺證據調整答案，並需預先確認新配對的標準答案。回答長度、訓練集重現或純文字可解題目，無法有效區分是否使用跨模態對應。
