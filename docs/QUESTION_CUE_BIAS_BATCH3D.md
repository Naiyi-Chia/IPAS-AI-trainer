# Issue #52 — Batch 3D question cue remediation

Engineering evidence, 2026-09-27; final editorial follow-up 2026-09-28. Independent Technical Review is pending; this is not Product Verify.

## Baseline and scope

- Contract: [Issue #52](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/52).
- Branch: `codex/issue-52-batch3d`; baseline: `460d4de9e6c57e434833b431da45906d48a0758b`, the fetched `question/issue-14-remediation` head when implementation began (Batch 3C integrated).
- Exactly 24 self-authored questions: Q196–Q207, Q214–Q219, Q226–Q231.
- Only their `question`, `options`, and `explanation` fields changed. IDs/order, level, subject, topic, concept, difficulty, answer index, sourceType and all other fields are preserved.
- `index.html` outside the DB and all non-question DB metadata are byte-for-byte unchanged after DB extraction. Official questions, source links, app behavior and storage code are unchanged.
- Audit script adds only `batch3d`; all seven prior batch definitions are unchanged. No dependency or architecture change.

## Reproducible audit

```powershell
python scripts/audit_question_cues.py --batch batch3d --baseline 460d4de9e6c57e434833b431da45906d48a0758b --csv docs/QUESTION_CUE_BIAS_BATCH3D.csv
node scripts/test_past_answer_feedback.cjs
python scripts/serve_question_batch1a.py --batch batch3d
git diff --check
```

The [CSV](QUESTION_CUE_BIAS_BATCH3D.csv) contains 966 rows: all 483 questions before and after, including option lengths, ratio, unique-longest flag, repeated IDs and reasons. Length uses Unicode code points excluding whitespace; ratio is correct-option length divided by mean distractor length. Repeated option sets ignore order and whitespace.

| Whole-bank metric | Before | After |
|---|---:|---:|
| Questions / unique IDs | 483 / 483 | 483 / 483 |
| Unique longest correct option | 332 | 311 |
| Correct-length ratio ≥ 2 | 155 | 131 |
| Correct-length ratio ≥ 3 | 0 | 0 |
| Repeated option-set groups | 72 | 68 |
| Questions in repeated sets | 347 | 323 |
| Answer A / B / C / D | 131 / 109 / 122 / 121 | 131 / 109 / 122 / 121 |

Scoped validation: PASS. All 24 ratios are below 2 (0.9375–1.1579); all 24 option sets are unique across the full bank. Correct options remain uniquely longest in Q197, Q199 and Q227, with ratios 1.1500, 1.1111 and 1.0563: small differences from meaningful threshold/cost/overlap wording, not extended correct-only explanations. This heuristic does not prove editorial quality; the review below covers semantic ambiguity and distractors separately. Remaining whole-bank flags belong to other batches.

## Editorial decisions

| Cluster | Distinct checks now covered | Cue / ambiguity review |
|---|---|---|
| Q196–Q201 Precision / Recall | denominators; threshold effect; predicted-positive reliability; weighted error costs; Recall constraint; F1 | Replaced six reused option sets. Numeric alternatives expose denominator/cost errors. Lowering a threshold need not strictly increase predictions or improve Precision; Q197 explicitly fixes model/data and uses non-decrease. |
| Q202–Q207 Generative model types | diffusion; GAN discriminator; VAE; autoregression; GAN inference; empirical model comparison | Mechanisms and components are distinguished under standard-model assumptions. No claim that a family, parameter count or training rounds guarantees quality or speed. |
| Q214–Q219 Zero-shot / Few-shot | identifying examples; paired demonstrations; context versus weights; contradictory labels; held-out evaluation; examples versus retrieval | No guarantee that Few-shot always wins or creates permanent memory. Evaluation and context conditions are explicit. |
| Q226–Q231 RAG chunking | semantic boundaries; overlap; token truncation; provenance; evaluation; table context | Alternatives express specific retrieval/structure misconceptions. No universal chunk size, overlap ratio or block count is presented as optimal. |

Each item was reviewed for one defensible answer, parallel alternatives, answer/explanation consistency, unnecessary absolutist cues, and distinction from the other five questions in its cluster. Some distractors intentionally describe common misconceptions; they are not presented as recommended techniques. Detailed before/after options and rationale follow.

Final internal editorial follow-up improved Q197's distractors to test threshold-direction and metric tradeoff misconceptions, and Q216's distractors to test matching-only and cross-request context misconceptions. This removed the earlier draft's implausible actual-class-count, permanent-index and tokenizer changes. This internal check is separate from the pending independent Technical Review.

## QA evidence

- Audit PASS: exact scoped IDs, 483 unique IDs, four distinct options each, answer bounds, valid subject/topic mapping, protected fields, non-scoped questions, DB metadata and non-DB shell preserved.
- JavaScript syntax: compiled the page's one inline script with Node `new Function`; PASS. Python AST parsing of audit and fixture scripts: PASS.
- `node scripts/test_past_answer_feedback.cjs`: PASS for all 16 correct/selected option combinations, repeated-answer guard, progress, escaping, PDF entry, no duplicates, navigation/reset and completion.
- Browser: in-app Chromium at `http://127.0.0.1:8766/batch3d`, using the existing fixture. Desktop 1280×900 and mobile viewport 375×812.
- Practice: all 24 unique revised IDs rendered and answered; 12 on desktop and 12 on mobile. Q199 deliberately answered A; all others correct. Correct/incorrect feedback, explanation and self-authored source label verified on every item, with question navigation throughout.
- Wrong-question view: exactly Q199. Weak-area view: L11302 5/6 (83%), L11401 6/6 (100%), L12202 12/12 (100%).
- Desktop L11 mock: all 12 scoped L11 questions, 11 correct / 1 incorrect / 0 unanswered, score 92. Wrong-only review showed Q199 selected A, correct B and the 80-versus-160 cost explanation.
- Mobile L12 mock: all 12 scoped L12 questions correct, score 100. Entered full review and expanded Q228; answer and explanation rendered normally.
- Visual screenshots inspected for desktop wrong-answer review, mobile practice and mobile mock review. Mobile `innerWidth=375`, document `scrollWidth=360` in practice and review: no page-level horizontal overflow. Existing horizontally scrollable tab bar remains usable.
- All seven tabs opened. Official scope links rendered; official past-paper tab loaded 115 second-session L11 structured paper with 50 questions, answer controls, official label and original PDF link.
- Browser warning/error log was empty at end of QA.
- After the final Q197/Q216 distractor and explanation edits, reran the full audit/CSV and JS syntax check, then reloaded the fixture and verified both questions' final options, correct-answer feedback (B/C), explanations and self-authored labels in Practice; PASS, with empty warning/error log. The earlier full Practice/Mock runs above preceded this last two-item wording adjustment; answer indices and application code did not change.

Limits: the fixture limits the self-authored DB to this batch, substitutes in-memory storage, auto-accepts confirm dialogs and disables PDF prewarming. Browser results cover the actual practice/mock render and scoring paths for these 24 questions, not persistent localStorage, native dialogs, a full 50-question self-authored mock, live PDF text extraction, physical mobile hardware, Dev Preview or production. Official content and storage/app code are additionally protected by the unchanged-shell assertion. No implementation blocker remains; independent review is still required.

## Technical references checked for editorial accuracy

- [scikit-learn Precision–Recall example](https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html): definitions and threshold behavior.
- [Generative Adversarial Nets](https://arxiv.org/abs/1406.2661), [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239), [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114): model mechanisms.
- [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165): in-context examples without gradient updates.
- [Microsoft document chunking](https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-chunk-documents) and [layout-aware chunking](https://learn.microsoft.com/en-us/azure/search/search-how-to-semantic-chunking): size constraints, overlap and document structure.

These references support self-authored editorial checks; no official iPAS question or answer has been rewritten.

## Item-by-item editorial review

Engineering Agent editorial review: each item checked for one defensible key, plausible same-level alternatives, grammar/length cues, and explanation consistency. Independent Technical Review remains pending.

### Q196 — Precision 與 Recall 取捨

Protected mapping: 初級 / L11 / L11302 / medium; answer index 1 (B).
Length ratio: 2.1053 → 1.0000; lengths: 21/40/15/21 → 24/24/24/24.

**Before:** 癌症篩檢最怕漏掉患者；廣告黑名單則很怕誤封正常客戶。兩者在指標重點上應如何取捨？

- A. Precision 與 Recall 只適用迴歸
- B. 漏掉真正陽性代價高時優先關注 Recall；誤報代價高時則更重視 Precision
- C. 任何情境都只看 Accuracy
- D. Recall 高就保證 Precision 也高

**After:** 瑕疵檢測將「有瑕疵」視為陽性。驗證資料有 100 件真正瑕疵，系統找出其中 90 件，並將 30 件良品誤報為瑕疵。Precision 與 Recall 分別為何？

- A. Precision 為 90%，Recall 為 75%
- B. Precision 為 75%，Recall 為 90%
- C. Precision 為 75%，Recall 為 30%
- D. Precision 為 90%，Recall 為 30%

**Unique-answer rationale / explanation:** Precision＝真正陽性／預測陽性＝90／（90＋30）＝75%；Recall＝真正陽性／實際陽性＝90／100＝90%。兩者分母不同，不能把找到瑕疵的比例當成預測陽性的可信度。

### Q197 — Precision 與 Recall 取捨

Protected mapping: 初級 / L11 / L11302 / medium; answer index 1 (B).
Length ratio: 2.1053 → 1.1500; lengths: 21/40/21/15 → 19/23/22/19.

**Before:** 詐欺偵測若漏掉詐欺造成的損失遠高於多查幾筆正常交易，應優先提升哪種能力？

- A. Recall 高就保證 Precision 也高
- B. 漏掉真正陽性代價高時優先關注 Recall；誤報代價高時則更重視 Precision
- C. Precision 與 Recall 只適用迴歸
- D. 任何情境都只看 Accuracy

**After:** 告警系統要盡量找出真正故障，人工複核量仍有餘裕。同一模型與同一批資料中，故障分數越高越可能為陽性。降低判陽性門檻時，哪項敘述成立？

- A. 預測陽性不會增加，Recall 可能降低
- B. 預測陽性不會減少，但 Precision 未必提升
- C. 漏報件數不會增加，Precision 必定提升
- D. 誤報件數不會增加，Recall 不會降低

**Unique-answer rationale / explanation:** 在分數固定的同一批資料上降低門檻，原有陽性預測仍被保留，並可能納入更多樣本。漏報不會增加、Recall 不會降低，但新納入樣本也可能是誤報，因此不能保證誤報不增加或 Precision 提升。

### Q198 — Precision 與 Recall 取捨

Protected mapping: 初級 / L11 / L11302 / medium; answer index 2 (C).
Length ratio: 2.1053 → 1.1250; lengths: 21/15/40/21 → 19/21/24/24.

**Before:** 郵件攔截系統若誤把重要信件判為垃圾信會造成很大損失，通常需要更重視什麼？

- A. Recall 高就保證 Precision 也高
- B. 任何情境都只看 Accuracy
- C. 漏掉真正陽性代價高時優先關注 Recall；誤報代價高時則更重視 Precision
- D. Precision 與 Recall 只適用迴歸

**After:** 郵件系統把「垃圾信」視為陽性。團隊要知道被攔截信件中，有多少比例確實是垃圾信，以評估攔截結果的可靠性。應查看哪個指標？

- A. Recall：所有垃圾信中被攔截的比例
- B. Accuracy：全部信件中分類正確的比例
- C. Precision：被攔截信件中真正垃圾信的比例
- D. Specificity：正常信件中未被攔截的比例

**Unique-answer rationale / explanation:** 問題以被攔截的預測陽性為分母，對應 Precision。Recall 以實際垃圾信為分母，Accuracy 看所有信件，Specificity 看實際正常信件，衡量的面向不同。

### Q199 — Precision 與 Recall 取捨

Protected mapping: 初級 / L11 / L11302 / medium; answer index 1 (B).
Length ratio: 2.1053 → 1.1111; lengths: 15/40/21/21 → 19/20/18/17.

**Before:** 若 False Negative 成本很高、False Positive 可接受，下列指標策略較合理？

- A. 任何情境都只看 Accuracy
- B. 漏掉真正陽性代價高時優先關注 Recall；誤報代價高時則更重視 Precision
- C. Recall 高就保證 Precision 也高
- D. Precision 與 Recall 只適用迴歸

**After:** 兩個門檻在同一驗證集的結果為：甲漏報 5 件、誤報 30 件；乙漏報 15 件、誤報 10 件。若每件漏報成本為 10 單位、誤報為 1 單位，僅按總錯誤成本應選哪個？

- A. 選乙，因總錯誤件數較少，成本為 25 單位
- B. 選甲，因加權錯誤成本較低，成本為 80 單位
- C. 選乙，因誤報件數較少，成本為 10 單位
- D. 選甲，因漏報件數較少，成本為 5 單位

**Unique-answer rationale / explanation:** 甲的成本為 5×10＋30×1＝80；乙為 15×10＋10×1＝160。當漏報與誤報代價不同，應比較加權成本，而不是只數總錯誤或只看其中一類錯誤。

### Q200 — Precision 與 Recall 取捨

Protected mapping: 初級 / L11 / L11302 / medium; answer index 1 (B).
Length ratio: 2.1053 → 1.0000; lengths: 15/40/21/21 → 28/28/28/28.

**Before:** 某瑕疵檢測要求「真正瑕疵盡量都抓到」，即使稍微多報也可接受。應優先看？

- A. 任何情境都只看 Accuracy
- B. 漏掉真正陽性代價高時優先關注 Recall；誤報代價高時則更重視 Precision
- C. Recall 高就保證 Precision 也高
- D. Precision 與 Recall 只適用迴歸

**After:** 團隊要求 Recall 至少 90%，達標後再選 Precision 較高的門檻。候選結果為甲 P＝85%／R＝88%、乙 P＝78%／R＝93%、丙 P＝70%／R＝97%、丁 P＝92%／R＝80%。應選何者？

- A. 選甲，其 Precision 為 85%、Recall 為 88%
- B. 選乙，其 Precision 為 78%、Recall 為 93%
- C. 選丙，其 Precision 為 70%、Recall 為 97%
- D. 選丁，其 Precision 為 92%、Recall 為 80%

**Unique-answer rationale / explanation:** 先依 Recall≥90% 排除甲與丁，再比較乙和丙的 Precision，乙的 78% 較高。不能因丁的 Precision 最高就忽略必要門檻，也不必在達標後仍一律選 Recall 最高者。

### Q201 — Precision 與 Recall 取捨

Protected mapping: 初級 / L11 / L11302 / medium; answer index 2 (C).
Length ratio: 2.1053 → 0.9500; lengths: 15/21/40/21 → 22/18/19/20.

**Before:** Precision 與 Recall 的使用方式，下列哪一項最符合實務風險取捨？

- A. 任何情境都只看 Accuracy
- B. Precision 與 Recall 只適用迴歸
- C. 漏掉真正陽性代價高時優先關注 Recall；誤報代價高時則更重視 Precision
- D. Recall 高就保證 Precision 也高

**After:** 分類器甲的 Precision／Recall 為 95%／40%，乙為 80%／80%。團隊決定以 F1 同等兼顧兩者，應如何選擇？

- A. 選甲，因 Precision 較高，F1 就會較高
- B. 選甲，因兩指標差距較大，F1 就會較高
- C. 選乙，其 F1 為 80%，高於甲的約 56%
- D. 選乙，其 F1 為 160%，高於甲的 135%

**Unique-answer rationale / explanation:** F1 是 Precision 與 Recall 的調和平均：2PR／（P＋R）。甲約為 56%，乙為 80%。F1 不是只看 Precision，也不是兩者直接相加；題目已指定以 F1 作選擇標準。

### Q202 — 生成模型類型

Protected mapping: 初級 / L11 / L11401 / medium; answer index 2 (C).
Length ratio: 2.0400 → 0.9375; lengths: 19/15/34/16 → 21/20/20/23.

**Before:** 設計團隊比較 Diffusion 與 GAN 兩類影像生成技術，下列描述哪一項正確？

- A. K-means 是典型高品質影像生成模型
- B. 決策樹由生成器與鑑別器對抗訓練
- C. 擴散模型常以逐步去噪生成高品質影像；GAN 透過生成器與鑑別器對抗訓練
- D. 線性迴歸主要透過逐步去噪生成圖片

**After:** 某影像生成方法在訓練時對影像逐步加噪，讓模型學習去噪；生成時再從雜訊逐步得到影像。這個核心機制對應哪類模型？

- A. 生成對抗模型，以生成器與鑑別器的競爭為核心
- B. 變分自編碼器，以潛在分布與重建學習為核心
- C. 擴散生成模型，以加噪過程的反向去噪為核心
- D. 自回歸生成模型，以已生成內容預測下一單位為核心

**Unique-answer rationale / explanation:** 題述是典型擴散模型的加噪與反向去噪流程。GAN 以對抗學習為核心，VAE 學習潛在分布與解碼，典型自回歸模型則逐單位條件生成，與題述機制不同。

### Q203 — 生成模型類型

Protected mapping: 初級 / L11 / L11401 / medium; answer index 3 (D).
Length ratio: 2.0400 → 1.0328; lengths: 19/15/16/34 → 20/21/20/21.

**Before:** 某模型從雜訊逐步去噪得到圖片；另一模型讓生成器與鑑別器互相競爭。兩者最可能是？

- A. K-means 是典型高品質影像生成模型
- B. 決策樹由生成器與鑑別器對抗訓練
- C. 線性迴歸主要透過逐步去噪生成圖片
- D. 擴散模型常以逐步去噪生成高品質影像；GAN 透過生成器與鑑別器對抗訓練

**After:** 在標準 GAN 訓練中，鑑別器接收真實資料與生成器產生的樣本。鑑別器主要學習哪項任務？

- A. 從隨機潛在向量產生樣本，改善生成影像內容
- B. 將每張影像編碼為潛在分布，改善重建影像內容
- C. 估計每個去噪步驟的雜訊，改善反向採樣流程
- D. 判斷樣本來自真實資料或生成器，提供對抗訊號

**Unique-answer rationale / explanation:** GAN 的鑑別器學習區分真實與生成樣本，形成生成器可利用的對抗訓練訊號。從潛在向量生成樣本是生成器的工作；潛在分布編碼與去噪估計則屬其他模型的典型機制。

### Q204 — 生成模型類型

Protected mapping: 初級 / L11 / L11401 / medium; answer index 0 (A).
Length ratio: 2.0400 → 0.9818; lengths: 34/16/19/15 → 18/18/18/19.

**Before:** 下列哪項正確說明常見生成式影像模型，而不是分類／分群演算法？

- A. 擴散模型常以逐步去噪生成高品質影像；GAN 透過生成器與鑑別器對抗訓練
- B. 線性迴歸主要透過逐步去噪生成圖片
- C. K-means 是典型高品質影像生成模型
- D. 決策樹由生成器與鑑別器對抗訓練

**After:** 某生成模型用編碼器估計輸入的潛在分布，再透過解碼器重建資料，訓練時同時考量重建與潛在分布正則化。最符合哪一類？

- A. 變分自編碼器，結合潛在變數推論與解碼
- B. 生成對抗網路，結合生成器與真假鑑別器
- C. 擴散生成模型，結合逐步加噪與反向去噪
- D. 自回歸語言模型，依前文逐一預測後續詞元

**Unique-answer rationale / explanation:** VAE 透過編碼器近似潛在分布、解碼器重建資料，並以分布正則化約束潛在空間。對抗真假判別、擴散去噪及逐詞元預測不是題述的核心訓練安排。

### Q205 — 生成模型類型

Protected mapping: 初級 / L11 / L11401 / medium; answer index 0 (A).
Length ratio: 2.0400 → 0.9836; lengths: 34/19/16/15 → 20/21/20/20.

**Before:** 若文件提到 denoising process 與 generator-discriminator game，分別對應哪些生成方法？

- A. 擴散模型常以逐步去噪生成高品質影像；GAN 透過生成器與鑑別器對抗訓練
- B. K-means 是典型高品質影像生成模型
- C. 線性迴歸主要透過逐步去噪生成圖片
- D. 決策樹由生成器與鑑別器對抗訓練

**After:** 某文字生成器先讀取前文，預測下一個詞元，將產生的詞元接回前文後重複此步驟。這是哪種生成方式？

- A. 自回歸生成，讓下一步依賴前面已產生的內容
- B. 擴散式生成，讓整段內容經由多步去噪逐漸成形
- C. 對抗式訓練，讓真假判別結果引導生成器更新
- D. 變分式重建，讓潛在分布的樣本經解碼器還原

**Unique-answer rationale / explanation:** 依先前內容逐次預測下一詞元，是典型自回歸生成。其他選項分別描述擴散、GAN 訓練與 VAE 的機制，並非題述逐詞元條件生成流程。

### Q206 — 生成模型類型

Protected mapping: 初級 / L11 / L11401 / medium; answer index 2 (C).
Length ratio: 2.0400 → 0.9818; lengths: 19/15/34/16 → 18/18/18/19.

**Before:** 產品經理要理解 Diffusion 與 GAN 的核心差異，下列哪一項較正確？

- A. K-means 是典型高品質影像生成模型
- B. 決策樹由生成器與鑑別器對抗訓練
- C. 擴散模型常以逐步去噪生成高品質影像；GAN 透過生成器與鑑別器對抗訓練
- D. 線性迴歸主要透過逐步去噪生成圖片

**After:** 標準 GAN 已完成訓練，現在只需從隨機潛在向量生成新影像，不做額外品質篩選。推論時主要需要哪個元件？

- A. 鑑別器，將潛在向量轉換成完整影像內容
- B. 編碼器，將潛在向量轉換成真實影像標籤
- C. 生成器，將潛在向量映射為新的影像樣本
- D. 去噪器，按固定反向擴散步驟還原影像內容

**Unique-answer rationale / explanation:** 標準 GAN 的生成器在訓練後可直接把潛在向量映射為樣本。鑑別器主要用於訓練中的真假判別，並非生成影像所必需；標準 GAN 也不要求編碼器或反向擴散流程。

### Q207 — 生成模型類型

Protected mapping: 初級 / L11 / L11401 / medium; answer index 3 (D).
Length ratio: 2.0400 → 1.0000; lengths: 16/19/15/34 → 23/23/23/23.

**Before:** 關於生成式影像模型，下列哪個技術配對最合理？

- A. 線性迴歸主要透過逐步去噪生成圖片
- B. K-means 是典型高品質影像生成模型
- C. 決策樹由生成器與鑑別器對抗訓練
- D. 擴散模型常以逐步去噪生成高品質影像；GAN 透過生成器與鑑別器對抗訓練

**After:** 產品團隊已有 GAN 與擴散模型兩個原型，需兼顧影像品質與回應時間。選型時，哪種比較方式較能支持部署決策？

- A. 比較兩模型的參數數量，以參數較多者代表品質較佳
- B. 比較兩模型的訓練輪次，以輪次較多者代表生成較快
- C. 比較兩模型的展示圖片，以最好的一張代表日常品質
- D. 在目標環境測代表性案例，同時量測品質與回應時間

**Unique-answer rationale / explanation:** GAN 與擴散模型的機制不同，但產品表現仍取決於具體模型、資料與執行設定。應在目標環境以代表性案例比較品質及時間；參數量、訓練輪次或單張最佳展示不足以支持部署決策。

### Q214 — Zero-shot / Few-shot

Protected mapping: 初級 / L12 / L12202 / medium; answer index 2 (C).
Length ratio: 2.3208 → 1.1579; lengths: 18/22/41/13 → 22/17/22/18.

**Before:** 客服分類 Prompt 沒有任何示例直接要求分類，之後版本加入 3 組輸入／輸出示例。兩者分別屬於？

- A. Few-shot 必須重新訓練模型權重
- B. Zero-shot 一定比 Few-shot 準確
- C. Zero-shot 不提供示例直接下指令；Few-shot 在提示中放少量示例引導模型
- D. Few-shot 等同 RAG

**After:** 提示甲只有任務指令與待分類文字；提示乙另外提供三組已完成的輸入／類別示例。兩者都不更新模型權重，分別屬於哪種提示方式？

- A. 甲為 Few-shot，乙為 Zero-shot
- B. 甲為模型微調，乙為 Few-shot
- C. 甲為 Zero-shot，乙為 Few-shot
- D. 甲為 Zero-shot，乙為模型微調

**Unique-answer rationale / explanation:** Zero-shot 不提供任務示例；Few-shot 在提示上下文中放少量示例。這兩種用法都可不更新模型權重，不能把提示中加入示例直接視為微調。

### Q215 — Zero-shot / Few-shot

Protected mapping: 初級 / L12 / L12202 / medium; answer index 1 (B).
Length ratio: 2.3208 → 1.0154; lengths: 13/41/22/18 → 21/22/22/22.

**Before:** 團隊不想微調模型，只想在提示中用幾個例子讓輸出格式更穩定，應採用？

- A. Few-shot 等同 RAG
- B. Zero-shot 不提供示例直接下指令；Few-shot 在提示中放少量示例引導模型
- C. Zero-shot 一定比 Few-shot 準確
- D. Few-shot 必須重新訓練模型權重

**After:** 資訊擷取提示已列出 JSON 欄位，但輸出格式仍不穩定。團隊想用 Few-shot 引導格式，應加入哪種內容？

- A. 加入更多欄位名稱說明，但不呈現完整輸出樣本
- B. 加入數組原始文字及對應的正確 JSON 輸出範例
- C. 加入較長的領域背景介紹，但不呈現輸入輸出配對
- D. 加入幾段原始文字片段，讓模型自行猜測輸出形式

**Unique-answer rationale / explanation:** Few-shot 需要示範任務如何由輸入得到理想輸出，完整且正確的文字／JSON 配對可展示格式。欄位說明、背景文字或只有輸入的片段不等同這類任務示例；格式仍需驗證。

### Q216 — Zero-shot / Few-shot

Protected mapping: 初級 / L12 / L12202 / medium; answer index 2 (C).
Length ratio: 2.3208 → 1.0000; lengths: 18/22/41/13 → 22/22/22/22.

**Before:** 下列對 Zero-shot 與 Few-shot Prompting 的描述哪個正確？

- A. Few-shot 必須重新訓練模型權重
- B. Zero-shot 一定比 Few-shot 準確
- C. Zero-shot 不提供示例直接下指令；Few-shot 在提示中放少量示例引導模型
- D. Few-shot 等同 RAG

**After:** 團隊只把三個示例放入一次請求的上下文，沒有訓練程序，也未啟用跨請求記憶。對這次 Few-shot 的理解何者正確？

- A. 示例會更新模型權重，後續請求可直接沿用新權重
- B. 示例僅影響與範例相同的輸入，無法引導其他案例
- C. 示例在當次上下文引導回應，不代表模型權重更新
- D. 示例會留在後續請求的上下文，省略示例仍可沿用

**Unique-answer rationale / explanation:** Few-shot 在當次上下文中示範任務，能引導模型處理類似但未出現的輸入，並非只複製範例。這不等於微調或權重更新；未啟用記憶時，後續請求若未再提供示例，不能假設上下文會自動沿用。

### Q217 — Zero-shot / Few-shot

Protected mapping: 初級 / L12 / L12202 / medium; answer index 0 (A).
Length ratio: 2.3208 → 1.0000; lengths: 41/13/18/22 → 22/22/22/22.

**Before:** 模型收到「請判斷情緒」與「先看三個標註範例再判斷」兩種提示，差異是？

- A. Zero-shot 不提供示例直接下指令；Few-shot 在提示中放少量示例引導模型
- B. Few-shot 等同 RAG
- C. Few-shot 必須重新訓練模型權重
- D. Zero-shot 一定比 Few-shot 準確

**After:** 情緒分類指令規定「抱怨且未解決」標為負面，但某個 Few-shot 示例卻把同類文字標為正面。改善提示時應優先做什麼？

- A. 核對標註並修正矛盾示例，使規則與示範保持一致
- B. 複製該矛盾示例多次，讓模型更熟悉這個標註結果
- C. 把矛盾示例移到最後，以位置決定應遵循哪個標準
- D. 為矛盾示例增加篇幅，以更長文字提高示範的權重

**Unique-answer rationale / explanation:** 指令與示例互相矛盾會造成判斷標準不清，應先對齊規則與標註。重複、換位置或增加長度都不能解決標準衝突，甚至可能強化錯誤訊號。

### Q218 — Zero-shot / Few-shot

Protected mapping: 初級 / L12 / L12202 / medium; answer index 2 (C).
Length ratio: 2.3208 → 0.9706; lengths: 22/18/41/13 → 23/22/22/23.

**Before:** 若任務規則不易用一句話描述，但可提供幾個理想示例，最適合哪種提示技巧？

- A. Zero-shot 一定比 Few-shot 準確
- B. Few-shot 必須重新訓練模型權重
- C. Zero-shot 不提供示例直接下指令；Few-shot 在提示中放少量示例引導模型
- D. Few-shot 等同 RAG

**After:** 團隊要比較 Zero-shot 與加入三個示例的 Few-shot，判斷是否改善客服分類。模型設定相同時，哪種評估較可靠？

- A. 以提示中的三個示例測試，選能完整重現示例的方案
- B. 由各方案各挑容易的案件，以各自最佳成績作比較
- C. 以同一份未作示例的代表性題集，依相同指標比較
- D. 以各方案輸出的文字長度，推估分類判斷是否更完整

**Unique-answer rationale / explanation:** 應以未用作示例的共同代表性資料與相同指標比較，避免記住示例或挑選樣本造成偏誤。Few-shot 不保證比 Zero-shot 好；能重現示例或輸出較長也不能證明分類品質改善。

### Q219 — Zero-shot / Few-shot

Protected mapping: 初級 / L12 / L12202 / medium; answer index 1 (B).
Length ratio: 2.3208 → 0.9851; lengths: 18/41/22/13 → 22/22/22/23.

**Before:** Few-shot prompting 的本質最接近下列哪一項？

- A. Few-shot 必須重新訓練模型權重
- B. Zero-shot 不提供示例直接下指令；Few-shot 在提示中放少量示例引導模型
- C. Zero-shot 一定比 Few-shot 準確
- D. Few-shot 等同 RAG

**After:** 系統甲在提示中附上三組客服分類示例；系統乙依提問檢索最新手冊段落，供模型回答引用。兩者的主要作用分別為何？

- A. 甲提供最新事實依據；乙用輸入輸出配對示範分類
- B. 甲示範任務的判斷方式；乙補入與提問相關的資料
- C. 甲以示例更新模型權重；乙以文件更新模型的詞表
- D. 甲以示例建立永久記憶；乙將檢索結果存入模型權重

**Unique-answer rationale / explanation:** Few-shot 示例主要示範任務格式或判斷模式；RAG 檢索內容主要補充相關資料。兩者可以併用，但不因此等同，也都不代表自動更新權重、詞表或永久記憶。

### Q226 — RAG Chunking

Protected mapping: 初級 / L12 / L12202 / medium; answer index 0 (A).
Length ratio: 2.2941 → 1.0299; lengths: 39/22/17/12 → 23/23/22/22.

**Before:** 公司手冊每份數百頁，RAG 常找不到完整規則。團隊調整 chunking 時最合理的做法是？

- A. 把長文件切成語意合理、可檢索的 chunk，並保留必要重疊與來源 metadata
- B. chunk 越小越好，最好每個字一個 chunk
- C. 將每個文件全部壓成一個超長向量即可
- D. 切塊後不需要保留來源資訊

**After:** 手冊的一條規則與其例外條件經常被固定字數切到不同區塊，檢索只取到規則而漏掉例外。優先調整哪個切塊策略較直接？

- A. 依規則段落保留語意邊界，必要時帶入相鄰例外條件
- B. 將每個段落平均切成更短字串，維持完全相同的長度
- C. 依頁碼將不同章節交錯合併，讓每塊包含更多主題
- D. 將每個段落改按關鍵字排序，讓相同詞彙集中保存

**Unique-answer rationale / explanation:** 此問題出在規則與例外的語意關係被切斷，應調整邊界或適度保留相鄰上下文。更短的固定切割、跨章混合或重排文字，都不能直接維持原規則及例外的關係。

### Q227 — RAG Chunking

Protected mapping: 初級 / L12 / L12202 / medium; answer index 3 (D).
Length ratio: 2.2941 → 1.0563; lengths: 12/17/22/39 → 24/23/24/25.

**Before:** 知識庫文件若切得太碎容易失去上下文，切得太大又可能降低檢索精準度。應如何處理？

- A. 切塊後不需要保留來源資訊
- B. 將每個文件全部壓成一個超長向量即可
- C. chunk 越小越好，最好每個字一個 chunk
- D. 把長文件切成語意合理、可檢索的 chunk，並保留必要重疊與來源 metadata

**After:** RAG 增加相鄰區塊的重疊後，邊界資訊較完整，但檢索結果出現大量重複文字。下一步較合理的是？

- A. 持續提高重疊比例，以更多重複內容推估更高的涵蓋率
- B. 把重疊部分當成獨立證據，以重複次數提高答案信心
- C. 維持切塊但提高輸出長度，讓模型把重複文字一併呈現
- D. 比較不同重疊量與去重效果，兼顧內容完整及上下文成本

**Unique-answer rationale / explanation:** 重疊可補足邊界資訊，也會增加索引及上下文中的重複。應以代表性問題比較重疊量與去重策略，不能把相同來源的重複文字視為更多獨立證據，或假設重疊越多越好。

### Q228 — RAG Chunking

Protected mapping: 初級 / L12 / L12202 / medium; answer index 0 (A).
Length ratio: 2.2941 → 0.9857; lengths: 39/17/12/22 → 23/23/24/23.

**Before:** RAG 建庫時，chunking 的主要設計原則何者較合理？

- A. 把長文件切成語意合理、可檢索的 chunk，並保留必要重疊與來源 metadata
- B. 將每個文件全部壓成一個超長向量即可
- C. 切塊後不需要保留來源資訊
- D. chunk 越小越好，最好每個字一個 chunk

**After:** 某切塊方案產生超過 embedding 模型輸入上限的區塊，送入時尾段被截斷。若要讓尾段內容也能被檢索，應優先如何處理？

- A. 依 token 上限再切分，保留各子塊必要的上下文
- B. 保留原區塊並增加向量維度，讓向量記住被截斷尾段
- C. 保留原區塊並延長回答上限，讓生成器補回未索引內容
- D. 保留原區塊並增加檢索筆數，重複取回相同截斷向量

**Unique-answer rationale / explanation:** 未送入 embedding 模型的尾段不會因向量維度、回答長度或取回次數而自動補入。應先依輸入 token 上限重新切分，避免截斷，再評估上下文與檢索品質。

### Q229 — RAG Chunking

Protected mapping: 初級 / L12 / L12202 / medium; answer index 3 (D).
Length ratio: 2.2941 → 0.9857; lengths: 17/12/22/39 → 24/23/23/23.

**Before:** 客服知識庫希望回答時能同時顯示文件章節來源。切塊階段應保留什麼？

- A. 將每個文件全部壓成一個超長向量即可
- B. 切塊後不需要保留來源資訊
- C. chunk 越小越好，最好每個字一個 chunk
- D. 把長文件切成語意合理、可檢索的 chunk，並保留必要重疊與來源 metadata

**After:** 客服知識庫需要在回答旁顯示可核對的文件版本及章節。每個區塊應保留哪組中繼資料，才能直接支援來源追溯？

- A. 向量維度、相似度分數及查詢耗時，作為內容來源標記
- B. 區塊字數、平均句長及詞頻分布，作為內容來源標記
- C. 檢索名次、回傳筆數及回答長度，作為內容來源標記
- D. 文件識別、版本及章節位置，建立區塊與原文的對應

**Unique-answer rationale / explanation:** 文件識別、版本和章節位置可將區塊連回確切原文，支援引用核對。相似度、字數或排名屬計算與檢索資訊，不能單獨指出內容來自哪個版本的哪個章節。

### Q230 — RAG Chunking

Protected mapping: 初級 / L12 / L12202 / medium; answer index 0 (A).
Length ratio: 2.2941 → 1.0147; lengths: 39/22/17/12 → 23/23/22/23.

**Before:** 長文檢索品質不佳，除了 embedding 模型外，最值得檢查的資料處理因素之一是？

- A. 把長文件切成語意合理、可檢索的 chunk，並保留必要重疊與來源 metadata
- B. chunk 越小越好，最好每個字一個 chunk
- C. 將每個文件全部壓成一個超長向量即可
- D. 切塊後不需要保留來源資訊

**After:** 兩套 chunking 方案在相同文件與檢索模型下產生不同數量的區塊。若要選出較能支援問答的方案，應優先比較什麼？

- A. 代表性問題的證據檢索與回答品質，以及上下文用量
- B. 全部區塊的總數量，以產生較多區塊者判定效果較佳
- C. 區塊長度的整齊程度，以每塊等長者判定效果較佳
- D. 建庫後的索引檔大小，以檔案較大者判定涵蓋較完整

**Unique-answer rationale / explanation:** 切塊目的是支援檢索與回答，應在一致條件下比較相關證據是否取得、回答品質及上下文成本。區塊數、長度一致性或索引大小只是結構特徵，不能取代實際任務評估。

### Q231 — RAG Chunking

Protected mapping: 初級 / L12 / L12202 / medium; answer index 2 (C).
Length ratio: 2.2941 → 0.9857; lengths: 22/12/39/17 → 24/23/23/23.

**Before:** 下列哪一項最符合良好的 RAG chunking 實務？

- A. chunk 越小越好，最好每個字一個 chunk
- B. 切塊後不需要保留來源資訊
- C. 把長文件切成語意合理、可檢索的 chunk，並保留必要重疊與來源 metadata
- D. 將每個文件全部壓成一個超長向量即可

**After:** 費率表切成數個區塊後，某塊只剩數值列，沒有欄名與適用方案；模型因此把數值套到錯誤方案。切塊時應如何改善？

- A. 依數值大小重新排列各列，讓同一數值範圍集中在同塊
- B. 將每個儲存格獨立切塊，讓檢索直接比對最短的內容
- C. 保留數值列對應的欄名與方案標題，使區塊可被理解
- D. 把表格數值轉成未附欄名的字串，讓區塊格式更一致

**Unique-answer rationale / explanation:** 表格數值須搭配欄名與方案等結構脈絡才能正確解讀，切塊應保留或附上這些資訊。按數值重排、逐格切碎或移除標頭，容易繼續丟失數值與語意的對應。
