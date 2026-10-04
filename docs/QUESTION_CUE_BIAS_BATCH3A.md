# Issue #49 — Batch 3A cue-bias remediation

## Contract and baseline

- Issue: https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/49; Parent #14.
- Branch: `codex/issue-49-batch3a`.
- Baseline: latest `question/issue-14-remediation` at start, `52e6d99554491e41233131f217c0669af05bae99`.
- Sequencing prerequisite: [Phase 2 checkpoint QA PASS](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/14#issuecomment-5829114124) recorded before implementation.
- Scope: Q001–Q003, Q010–Q012, Q016–Q018, Q022–Q024, Q034–Q036, Q040–Q042, Q043–Q045, Q061–Q063 (24 questions).
- Only question/options/explanation change. Protected metadata, answer positions, other questions, DB metadata and HTML/CSS/JS outside DB are unchanged. No official content, localStorage behavior or dependencies changed.
- Item-by-item Engineering Agent editorial review is below. This is not independent Technical Review, Human Product Verify or a claim of empirical learner validation.

## Reproduction

```powershell
python scripts/audit_question_cues.py --batch batch3a --baseline 52e6d99554491e41233131f217c0669af05bae99 --csv docs/QUESTION_CUE_BIAS_BATCH3A.csv
python scripts/serve_question_batch1a.py --batch batch3a
```

Open `http://127.0.0.1:8766/batch3a`. Existing fixture automatically supports the added batch registry. It narrows the in-memory bank, replaces storage with memory, auto-accepts exam confirmation and disables PDF prewarming. It tests application rendering/scoring, not native dialogs or full-bank sampling. No fixture behavior was changed.

CSV records 483 before + 483 after rows. Lengths count Unicode code points excluding whitespace; duplicate option sets ignore whitespace and option ordering. Assertions validate exact changed IDs, all protected fields, unique IDs/order, mappings, unchanged application shell, ratios and option-set uniqueness.

## Whole-bank metrics

| Metric | Before | After |
| --- | ---: | ---: |
| total | 483 | 483 |
| unique_ids | 483 | 483 |
| unique_longest | 389 | 372 |
| ratio_ge_2 | 224 | 200 |
| ratio_ge_3 | 0 | 0 |
| repeated_groups | 93 | 85 |
| repeated_questions | 416 | 392 |

Answer A/B/C/D remains 131/109/122/121. All 24 modified ratios are below 2.0 (range 0.9643–1.0909); eight former repeated clusters become 24 option sets unique across the entire bank. Seven correct options remain uniquely longest by a small margin. These heuristics support review rather than prove difficulty or eliminate all possible cues.

## Verification — 2026-09-25

- Scoped audit: PASS; 483 questions / unique IDs; exactly 24 changed; all protected fields and app shell preserved.
- JS syntax: PASS (inline application script compiled with Node `new Function`).
- Browser: Codex in-app browser; desktop 1280×900 and mobile 375×812.
- Practice fixture: completed all 24 questions (desktop questions 1–16, mobile 17–24), 23 correct / deliberately incorrect Q062. Correct/incorrect feedback, explanations, source labels and next-question navigation rendered. Wrong-question book contained only Q062; L21201 weak-area result was 2/3 (67%), other seven scoped topics 3/3 (100%).
- Q022 received a final distractor revision after that Practice run; the final wording was subsequently rendered, answered and scored correctly in the L11 Mock below.
- Mobile L11 fixture Mock: 12/12 answered correctly, submit → 100 points / 12 correct / 0 incorrect / 0 unanswered; entered 12-item review successfully. Includes final Q022. This fixture automatically accepts confirmation.
- Mobile screenshot inspection: long-option Practice and Mock review remained usable. DOM measurement: innerWidth 375, document scrollWidth 360 (no horizontal page overflow).
- Desktop official-paper flow: opened 115 second-session L11, loaded 50 structured official questions and displayed original PDF link and answer controls. No official question edits.
- Home, Practice, Mock, Wrong and Weak-area tabs opened during the fixture run; official-paper tab opened and loaded normally. No application console errors were reported before the additional native-dialog test.
- Additional unmodified full-bank smoke: home displayed 483; L11 native 50-question exam started and accepted an answer. Its native submit confirmation stalled browser control (CDP mouse/focus timeouts; dialog, keyboard and close recovery were unsuccessful). Native full-bank submit/result is **not verified in this run**. It also prevented completing the final Official Scope tab / desktop Mock follow-up. This limitation does not affect the completed fixture scoring checks and is not reported as an application failure.
- `git diff --check`: PASS. Final diff checked structurally because question DB occupies one line.

## Content references

Technical points were cross-checked against these primary vendor references; questions remain self-authored, not official exam content. Scenarios and distractors are original editorial constructions.

- [Google Cloud AI overview](https://cloud.google.com/learn/what-is-artificial-intelligence): AI / ML / DL containment.
- [scikit-learn common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html): train-only preprocessing, fold isolation and feature-selection leakage.
- [Google ML Crash Course: Overfitting](https://developers.google.com/machine-learning/crash-course/overfitting/overfitting): training versus unseen-data generalization.
- [AWS PoC architecture guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-lifecycle-operational-excellence/dev-architecting.html): measurable success criteria, data readiness, technical feasibility.
- [AWS advancing PoC to preproduction](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-lifecycle-operational-excellence/dev-advancing.html): business evaluation, latency, cost and production readiness.

## Item-by-item editorial review

### Q001 — AI、ML、DL 關係

Protected mapping: 初級 / L11 / L11101 / easy; answer index 1 (B).
Length ratio: 2.0455 → 1.0000; lengths: 18/30/17/9 → 14/14/14/14.

**Review:** 四個選項採相同包含關係句型，考查三者層級而非文字長度。

**Before:** 下列哪一項對 AI、機器學習（ML）與深度學習（DL）的關係描述最適當？

- A. ML 包含所有 AI，而 AI 只是一種 ML
- B. AI 是較廣泛範疇，ML 是其中一類方法，DL 又是 ML 的一類方法
- C. 所有 AI 系統都一定使用深度神經網路
- D. DL 與 ML 完全無關

**After:** 依一般分類，AI、機器學習（ML）與深度學習（DL）的包含關係為何？

- A. ML 包含 AI，AI 再包含 DL
- B. AI 包含 ML，ML 再包含 DL
- C. AI 包含 DL，DL 再包含 ML
- D. DL 包含 ML，ML 再包含 AI

**Unique-answer rationale / explanation:** AI 是較廣的領域，ML 是其中從資料學習的方法，DL 則是 ML 中使用多層神經網路的一類方法；其餘選項顛倒了包含方向。

### Q002 — AI、ML、DL 關係

Protected mapping: 初級 / L11 / L11101 / easy; answer index 2 (C).
Length ratio: 2.0455 → 1.0000; lengths: 18/17/30/9 → 14/14/14/14.

**Review:** 規則式專家系統明確排除資料訓練；四個選項均為領域歸屬，避免與 Q001 重複背順序。

**Before:** 若把 AI 視為較大的技術範疇，ML 與 DL 的層級關係通常如何理解？

- A. ML 包含所有 AI，而 AI 只是一種 ML
- B. 所有 AI 系統都一定使用深度神經網路
- C. AI 是較廣泛範疇，ML 是其中一類方法，DL 又是 ML 的一類方法
- D. DL 與 ML 完全無關

**After:** 一個以人工撰寫規則推論的專家系統，未從資料訓練模型。在 AI、ML、DL 分類中，較適合歸為？

- A. 屬於 AI 與 ML，但不屬於 DL
- B. 屬於 AI 與 DL，但不屬於 ML
- C. 屬於 AI，但不屬於 ML 或 DL
- D. 屬於 ML 與 DL，但不屬於 AI

**Unique-answer rationale / explanation:** 規則式專家系統屬於 AI，但題述未透過資料學習，因此不是 ML，也不是其子領域 DL。AI 並不以使用機器學習為必要條件。

### Q003 — AI、ML、DL 關係

Protected mapping: 初級 / L11 / L11101 / easy; answer index 3 (D).
Length ratio: 2.0455 → 1.0000; lengths: 18/9/17/30 → 13/13/13/13.

**Review:** 由標註資料訓練單棵決策樹，區分 ML 與 DL；其餘組合違反題述方法或包含關係。

**Before:** 在一般概念分類下，哪一個敘述最合理？

- A. ML 包含所有 AI，而 AI 只是一種 ML
- B. DL 與 ML 完全無關
- C. 所有 AI 系統都一定使用深度神經網路
- D. AI 是較廣泛範疇，ML 是其中一類方法，DL 又是 ML 的一類方法

**After:** 團隊以標註資料訓練一棵決策樹做分類。依一般 AI、ML、DL 分類，這個模型屬於哪一組？

- A. AI，未使用 ML 或 DL 方法
- B. ML 與 DL，未使用 AI 方法
- C. AI 與 DL，未使用 ML 方法
- D. AI 與 ML，未使用 DL 方法

**Unique-answer rationale / explanation:** 決策樹由資料學習分類規則，屬於 ML，也屬於較廣的 AI；單棵決策樹不是深度神經網路，因此不屬於 DL。

### Q010 — 避免 Data Leakage

Protected mapping: 初級 / L11 / L11202 / medium; answer index 2 (C).
Length ratio: 2.2308 → 1.0000; lengths: 7/15/29/17 → 17/17/17/17.

**Review:** 四項都是縮放參數估計流程；測試集不可參與擬合，且部署應沿用訓練轉換。

**Before:** 為避免標準化造成 Data Leakage，正確流程為何？

- A. 只前處理測試集
- B. 訓練集與測試集分別各自估計參數
- C. 先切分資料，只用訓練集估計前處理參數，再套用至驗證／測試集
- D. 先用全部資料估計平均與標準差再切分

**After:** 資料已分為訓練集與測試集。為評估需要標準化的模型，平均值與標準差應如何取得？

- A. 由合併後的資料估計，再轉換兩個集合
- B. 由兩個集合各自估計，再分別進行轉換
- C. 由訓練集估計，再用同一組值轉換兩集
- D. 由測試集估計，再用同一組值轉換兩集

**Unique-answer rationale / explanation:** 標準化參數應只由訓練集估計，再固定套用至測試集。合併估計或使用測試集估計都引入評估資料資訊；兩集各自估計也無法模擬固定前處理的部署流程。

### Q011 — 避免 Data Leakage

Protected mapping: 初級 / L11 / L11202 / medium; answer index 0 (A).
Length ratio: 2.2308 → 1.0500; lengths: 29/15/17/7 → 21/21/21/18.

**Review:** 將洩漏邊界移到交叉驗證折，四項都是 scaler 估計來源；不把全開發集誤當該折訓練集。

**Before:** 使用 StandardScaler 前，要如何處理訓練集與測試集才較正確？

- A. 先切分資料，只用訓練集估計前處理參數，再套用至驗證／測試集
- B. 訓練集與測試集分別各自估計參數
- C. 先用全部資料估計平均與標準差再切分
- D. 只前處理測試集

**After:** 使用五折交叉驗證比較模型，且每折都需要 StandardScaler。哪種安排能避免驗證折參與縮放參數估計？

- A. 各訓練折擬合 scaler，再轉換對應驗證折
- B. 全開發集擬合 scaler，再切出各個驗證折
- C. 各驗證折擬合 scaler，再轉換對應訓練折
- D. 合併各折的縮放參數，再轉換全部驗證折

**Unique-answer rationale / explanation:** 每折的 scaler 與模型都只能在該折訓練資料上擬合。先在全開發集擬合、以驗證折擬合或合併各折參數，都可能讓該驗證折資訊進入前處理估計。

### Q012 — 避免 Data Leakage

Protected mapping: 初級 / L11 / L11202 / medium; answer index 2 (C).
Length ratio: 2.2308 → 1.0000; lengths: 17/7/29/15 → 18/18/18/18.

**Review:** 改考有監督特徵選擇；合併資料、測試集排名及依測試分數調整皆破壞獨立評估。

**Before:** 模型評估前進行前處理時，如何避免測試資料資訊提前進入訓練？

- A. 先用全部資料估計平均與標準差再切分
- B. 只前處理測試集
- C. 先切分資料，只用訓練集估計前處理參數，再套用至驗證／測試集
- D. 訓練集與測試集分別各自估計參數

**After:** 團隊想以特徵與目標的相關性篩選欄位，再評估模型。已保留獨立測試集，哪個流程較能避免資料洩漏？

- A. 合併兩集計算相關性，再用選定欄位訓練
- B. 測試集計算欄位排名，再用訓練集建模型
- C. 訓練集決定保留欄位，再固定套用測試集
- D. 依測試分數調整欄位，再報告最佳的分數

**Unique-answer rationale / explanation:** 特徵選擇也是學習流程的一部分，不能使用最終測試集的特徵與目標關係或測試分數來選欄位。以訓練資料決定欄位並固定套用，才能維持測試集的獨立性。

### Q016 — 過擬合

Protected mapping: 初級 / L11 / L11301 / easy; answer index 2 (C).
Length ratio: 2.0000 → 0.9730; lengths: 2/5/16/17 → 12/13/12/12.

**Review:** 限定同分布且無洩漏，四項都是模型學習／泛化情況；高訓練分數與高偏差、未學到規律不符。

**Before:** 模型訓練準確率 99%，測試準確率只有 72%，最可能出現什麼問題？

- A. 分群
- B. 資料正規化
- C. 過擬合（Overfitting）
- D. 欠擬合（Underfitting）

**After:** 訓練與測試資料來自相同分布且無資料洩漏。模型訓練準確率 99%、測試準確率 72%，最符合哪種情況？

- A. 模型在兩組資料皆有高偏差
- B. 模型在兩組資料皆能良好泛化
- C. 模型過度貼合訓練資料細節
- D. 模型尚未學到訓練資料規律

**Unique-answer rationale / explanation:** 訓練表現很好、同分布測試表現明顯下降，是過擬合的典型訊號。高偏差或尚未學到規律通常也會使訓練表現不佳；良好泛化則不應有這麼大的落差。

### Q017 — 過擬合

Protected mapping: 初級 / L11 / L11301 / easy; answer index 3 (D).
Length ratio: 2.0000 → 1.0833; lengths: 2/17/5/16 → 11/12/13/13.

**Review:** 四項都是訓練與驗證誤差走勢；只有訓練持續改善而驗證惡化符合題述過擬合訊號。

**Before:** 若模型在訓練資料表現很好，但新資料表現明顯變差，通常稱為？

- A. 分群
- B. 欠擬合（Underfitting）
- C. 資料正規化
- D. 過擬合（Overfitting）

**After:** 在資料分布與評估方式不變時，哪種訓練曲線最能提示模型逐漸過擬合？

- A. 訓練與驗證誤差同步下降
- B. 訓練與驗證誤差都維持偏高
- C. 訓練誤差上升而驗證誤差下降
- D. 訓練誤差下降而驗證誤差上升

**Unique-answer rationale / explanation:** 訓練誤差持續下降但驗證誤差開始上升，表示對訓練資料的改善未能泛化，是過擬合訊號。兩者都高偏向欠擬合；兩者同步下降則尚無此訊號。

### Q018 — 過擬合

Protected mapping: 初級 / L11 / L11301 / easy; answer index 2 (C).
Length ratio: 2.0000 → 1.0244; lengths: 5/2/16/17 → 13/15/14/13.

**Review:** 四項都是樹模型容量或選型方向；限制深度緩解記憶細節，不保證一定改善，須驗證。

**Before:** 模型記住訓練樣本細節而無法泛化，最接近下列哪一項？

- A. 資料正規化
- B. 分群
- C. 過擬合（Overfitting）
- D. 欠擬合（Underfitting）

**After:** 決策樹幾乎記住訓練樣本，卻在同分布驗證資料表現不佳。下列哪個調整方向較適合先嘗試緩解過擬合？

- A. 增加樹的深度，容納更多細節
- B. 降低葉節點最少樣本數以增加分支
- C. 限制樹的深度，減少模型複雜度
- D. 以訓練準確率挑選最複雜的樹

**Unique-answer rationale / explanation:** 限制樹深度可減少對訓練細節與雜訊的擬合，效果仍須以驗證資料確認。加深樹、降低葉節點最少樣本數或依訓練分數偏選複雜模型，都可能加劇過擬合。

### Q022 — 生成式與鑑別式 AI

Protected mapping: 初級 / L11 / L11401 / easy; answer index 3 (D).
Length ratio: 2.5000 → 1.0000; lengths: 11/6/13/25 → 21/21/21/21.

**Review:** 最終修訂以媒介、規模、部署、任務等常見分類誤解作干擾；四項平行句型且等長，無不相干檔案操作。

**Before:** 下列何者最能區分生成式 AI 與鑑別式 AI？

- A. 鑑別式 AI 只能處理文字
- B. 兩者完全相同
- C. 生成式 AI 不能使用神經網路
- D. 生成式 AI 偏向產生新內容；鑑別式 AI 偏向分類或預測

**After:** 以內容生成與分類應用為例，區分生成式 AI 與鑑別式 AI 時，哪個依據最適當？

- A. 依輸入媒介區分：文字為生成式，影像為鑑別式
- B. 依模型規模區分：大型為生成式，小型為鑑別式
- C. 依部署方式區分：雲端為生成式，本地為鑑別式
- D. 依主要任務區分：產生新內容或依輸入判定類別

**Unique-answer rationale / explanation:** 在題述應用中，生成式 AI 著重產生新內容，鑑別式 AI 著重依輸入判定類別。輸入是文字或影像、模型大小及部署地點，都不是區分兩者的依據。

### Q023 — 生成式與鑑別式 AI

Protected mapping: 初級 / L11 / L11401 / easy; answer index 3 (D).
Length ratio: 2.5000 → 1.0000; lengths: 13/6/11/25 → 16/17/15/16.

**Review:** 四項皆是兩個任務輸出的組合；文字媒介相同不代表生成／分類的輸出目標相同。

**Before:** 一個模型負責生成新文字，另一個模型負責判斷垃圾郵件，兩者最適當的分類是？

- A. 生成式 AI 不能使用神經網路
- B. 兩者完全相同
- C. 鑑別式 AI 只能處理文字
- D. 生成式 AI 偏向產生新內容；鑑別式 AI 偏向分類或預測

**After:** 甲依提示撰寫新郵件；乙使用鑑別式分類器判斷郵件是否為垃圾郵件。兩個任務的主要輸出依序為何？

- A. 甲輸出類別標籤；乙輸出新郵件內容
- B. 甲輸出新郵件內容；乙輸出新郵件內容
- C. 甲輸出類別標籤；乙輸出類別標籤
- D. 甲輸出新郵件內容；乙輸出類別標籤

**Unique-answer rationale / explanation:** 甲是文字生成任務，輸出新郵件內容；乙是分類任務，輸出垃圾或非垃圾等標籤。即使兩者皆處理文字，輸出目標仍不同。

### Q024 — 生成式與鑑別式 AI

Protected mapping: 初級 / L11 / L11401 / easy; answer index 2 (C).
Length ratio: 2.5000 → 1.0435; lengths: 6/13/25/11 → 15/15/16/16.

**Review:** 四項皆是影像應用配對；只有生成情境圖再判瑕疵符合指定順序，不主張所有分類都必須用鑑別模型。

**Before:** 「產生新內容」與「預測類別」的主要差異為何？

- A. 兩者完全相同
- B. 生成式 AI 不能使用神經網路
- C. 生成式 AI 偏向產生新內容；鑑別式 AI 偏向分類或預測
- D. 鑑別式 AI 只能處理文字

**After:** 同樣以產品照片為輸入，下列哪一組依序對應「生成式應用」與「鑑別式分類應用」？

- A. 辨識產品類別；判斷照片是否模糊
- B. 判斷產品有無瑕疵；生成新的背景
- C. 生成產品情境圖；判斷產品有無瑕疵
- D. 生成不同配色圖；生成新的拍攝角度

**Unique-answer rationale / explanation:** 生成情境圖需產生新的影像內容；判斷有無瑕疵則可由鑑別式分類器輸出類別。其他組合依序是分類／分類、分類／生成與生成／生成。

### Q034 — 工具選擇

Protected mapping: 初級 / L12 / L12201 / easy; answer index 2 (C).
Length ratio: 2.2059 → 1.0000; lengths: 8/15/25/11 → 13/13/13/13.

**Review:** 題幹已提供文字逐字稿，排除辨識錄音的前置工作；四項均為工具能力與輸出目的。

**Before:** 若任務是將長篇會議逐字稿濃縮成重點，較適合使用哪類生成式 AI 能力？

- A. 只看社群討論熱度
- B. 所有任務都應使用同一個文字模型
- C. 依任務模態、品質、成本、隱私與整合需求選擇合適工具
- D. 永遠選參數量最大的模型

**After:** 已有長篇會議逐字稿，要整理成決議與待辦事項。下列哪類工具能力最直接符合需求？

- A. 語音辨識，將錄音轉成逐字稿
- B. 語音合成，將逐字稿讀成音訊
- C. 文字摘要，從逐字稿擷取重點
- D. 文字翻譯，將逐字稿轉成外語

**Unique-answer rationale / explanation:** 輸入已是文字，需求是濃縮與整理，因此文字摘要最直接符合。語音辨識處理錄音、語音合成產生音訊、翻譯改變語言，皆不是本題的主要需求。

### Q035 — 工具選擇

Protected mapping: 初級 / L12 / L12201 / easy; answer index 2 (C).
Length ratio: 2.2059 → 1.0541; lengths: 11/15/25/8 → 12/13/13/12.

**Review:** 限定保留照片主體並變更背景，區分局部重繪與從文字重新生圖；解析保留人工核對需要。

**Before:** 希望把產品照片轉成不同風格視覺稿，應優先選擇哪類生成式工具？

- A. 永遠選參數量最大的模型
- B. 所有任務都應使用同一個文字模型
- C. 依任務模態、品質、成本、隱私與整合需求選擇合適工具
- D. 只看社群討論熱度

**After:** 設計師要保留產品照片的主體外觀，並生成不同風格的背景。應優先評估哪類工具？

- A. 以影像分類辨識產品的品類
- B. 以文字生圖重新想像整件產品
- C. 以影像編修局部重繪照片背景
- D. 以影像描述撰寫產品的介紹

**Unique-answer rationale / explanation:** 以原照片為輸入並遮罩背景的局部重繪，可較直接保留主體、變更背景，仍需人工核對。純文字生圖較難維持原產品外觀；分類與描述則不產生所需影像。

### Q036 — 工具選擇

Protected mapping: 初級 / L12 / L12201 / easy; answer index 0 (A).
Length ratio: 2.2059 → 1.0161; lengths: 25/8/11/15 → 21/21/20/21.

**Review:** 內網限制是明示必要條件，四項都是選型先後流程；不能等採購或上線後才核對部署。

**Before:** 選擇生成式 AI 工具時，最合理的原則是？

- A. 依任務模態、品質、成本、隱私與整合需求選擇合適工具
- B. 只看社群討論熱度
- C. 永遠選參數量最大的模型
- D. 所有任務都應使用同一個文字模型

**After:** 兩款文字摘要工具都能處理所需篇幅。企業規定內部資料不得傳出內網，選型時應先採取哪個做法？

- A. 確認可在內網部署，再以內部樣本比較摘要品質
- B. 依公開榜單先選高分，再於上線後確認部署方式
- C. 以免費方案先試正式資料，再依費用比較品質
- D. 以回覆速度先完成採購，再要求供應商調整部署

**Unique-answer rationale / explanation:** 資料不可出內網是選型的必要條件，應先確認部署方式符合，再比較任務品質等指標。公開分數、速度或免費方案都不能取代此限制的事前檢查。

### Q040 — 導入評估

Protected mapping: 初級 / L12 / L12301 / medium; answer index 1 (B).
Length ratio: 2.5588 → 1.0000; lengths: 8/29/12/14 → 18/18/18/18.

**Review:** 尚未釐清服務痛點，四項都是導入評估起點；需求與指標先於方案、硬體規模與同業範圍。

**Before:** 企業想導入生成式 AI 客服，正式開發前最應先確認什麼？

- A. 不需估算維運成本
- B. 定義問題、使用者情境、成功指標、資料／系統條件、成本與風險
- C. 只看模型 Demo 是否吸睛
- D. 先購買最大規模 GPU 再找用途

**After:** 企業規劃生成式 AI 客服，但尚未釐清最常見的服務痛點。哪項工作最應作為導入評估的起點？

- A. 比較供應商介面，選定後再盤點客服需求
- B. 盤點客服情境，訂出要改善的問題與指標
- C. 依模型規模編列預算，再挑選適合的情境
- D. 依同業使用的方案，建立相同的導入範圍

**Unique-answer rationale / explanation:** 導入評估應先釐清使用者情境、問題與成功指標，才有依據比較技術、成本及風險。介面、模型規模或同業方案可作參考，卻無法替代本身的需求定義。

### Q041 — 導入評估

Protected mapping: 初級 / L12 / L12301 / medium; answer index 3 (D).
Length ratio: 2.5588 → 1.0909; lengths: 12/8/14/29 → 15/15/14/16.

**Review:** 限定相同品質下的總工時目標；其他選項為可量測但不等價的速度、帳號、產量指標。

**Before:** 生成式 AI 導入評估中，哪一項做法最合理？

- A. 只看模型 Demo 是否吸睛
- B. 不需估算維運成本
- C. 先購買最大規模 GPU 再找用途
- D. 定義問題、使用者情境、成功指標、資料／系統條件、成本與風險

**After:** 某摘要工具讓初稿時間縮短，但常需人工更正。若目標是減少人員總工時，哪個指標較適合判斷導入成效？

- A. 每次請求從送出到產生初稿的秒數
- B. 每週使用摘要工具的人員帳號數量
- C. 工具每分鐘能生成的中文字數量
- D. 達到品質標準所需的撰寫與校對工時

**Unique-answer rationale / explanation:** 目標是總工時，因此須把初稿與校對成本一起計入，並維持相同品質標準。生成速度、使用人數或產字量不能直接證明總工時下降。

### Q042 — 導入評估

Protected mapping: 初級 / L12 / L12301 / medium; answer index 1 (B).
Length ratio: 2.5588 → 1.0500; lengths: 12/29/14/8 → 20/21/20/20.

**Review:** 效益相近下比較成本邊界；授權、開發、生成速度都是局部代理，不能取代生命週期成本。

**Before:** 若要判斷某 AI 構想是否值得投入，應先做？

- A. 只看模型 Demo 是否吸睛
- B. 定義問題、使用者情境、成功指標、資料／系統條件、成本與風險
- C. 先購買最大規模 GPU 再找用途
- D. 不需估算維運成本

**After:** 兩個 AI 導入方案的預估效益相近。甲需人工覆核且維運較複雜，乙可接入現有流程。評估投入價值時，哪種比較較合理？

- A. 比較兩案的模型授權費，以較低者推估總成本
- B. 比較兩案全生命週期成本，納入覆核與整合支出
- C. 比較兩案首次開發費，以較低者推估長期效益
- D. 比較兩案產生初稿速度，以較快者推估淨效益

**Unique-answer rationale / explanation:** 在效益相近的條件下，仍應比較開發、整合、人工覆核及持續維運等成本。授權費、首次開發費或初稿速度各自僅涵蓋部分因素，不足以推估淨效益。

### Q043 — PoC / Pilot

Protected mapping: 初級 / L12 / L12302 / easy; answer index 0 (A).
Length ratio: 2.0323 → 1.0678; lengths: 21/13/12/6 → 21/20/19/20.

**Review:** 先驗證文件擷取核心技術，PoC 與其量測直接對應；訪談、訓練及介面測試有用但非此驗證目標。

**Before:** 需求尚不確定，希望先小範圍驗證 AI 是否達成 KPI，最合理的是？

- A. 先做 PoC／Pilot 並設定可量測成功標準
- B. 先採購最大規模硬體再定需求
- C. 跳過測試，只看供應商簡報
- D. 直接全面上線

**After:** 團隊尚不確定模型能否從既有文件擷取所需欄位。若先以小型實驗驗證這個核心技術假設，最合適的安排為何？

- A. 執行 PoC，以代表性文件量測欄位擷取正確率
- B. 執行教育訓練，以課後測驗量測員工熟悉程度
- C. 執行需求訪談，以問卷量測使用者期待程度
- D. 執行介面測試，以操作步驟量測流程便利程度

**Unique-answer rationale / explanation:** PoC 適合驗證核心技術假設，此處應用代表性文件測試擷取品質。訓練、訪談與介面測試各有用途，但不能直接證明模型具備欄位擷取能力。

### Q044 — PoC / Pilot

Protected mapping: 初級 / L12 / L12302 / easy; answer index 3 (D).
Length ratio: 2.0323 → 0.9643; lengths: 12/6/13/21 → 19/19/18/18.

**Review:** PoC 已過，有限真實使用者及流程明確界定 Pilot；與需求訪談、離線比較及全量部署區分。

**Before:** 全面部署前，先以有限資料與使用者驗證可行性，稱為？

- A. 跳過測試，只看供應商簡報
- B. 直接全面上線
- C. 先採購最大規模硬體再定需求
- D. 先做 PoC／Pilot 並設定可量測成功標準

**After:** PoC 已驗證模型可行，接著要讓一個部門在實際工作流程中限量使用，觀察協作與例外處理。這個階段較適合稱為？

- A. 離線基準測試，比較固定測試集的模型分數
- B. 需求探索訪談，確認使用者尚未滿足的需求
- C. 全面正式部署，涵蓋所有部門的日常使用
- D. 有限範圍試行，觀察真實流程的運作成效

**Unique-answer rationale / explanation:** 題述是 Pilot：在有限真實場域試行，檢驗流程、人員協作與實際效益。它不同於離線測試、需求訪談，也尚未擴至全面部署。

### Q045 — PoC / Pilot

Protected mapping: 初級 / L12 / L12302 / easy; answer index 0 (A).
Length ratio: 2.0323 → 0.9692; lengths: 21/6/13/12 → 21/21/22/22.

**Review:** 四項都是擴大導入的判準策略；事前門檻避免事後選指標、採用量代理與最佳案例偏差。

**Before:** 降低一次大規模導入失敗風險的做法是？

- A. 先做 PoC／Pilot 並設定可量測成功標準
- B. 直接全面上線
- C. 先採購最大規模硬體再定需求
- D. 跳過測試，只看供應商簡報

**After:** Pilot 即將開始，團隊要據此決定是否擴大導入。哪種成功標準設定方式較合適？

- A. 事前訂出品質與工時門檻，期末依同一標準判斷
- B. 期末挑選改善最多的指標，再據此訂定通過門檻
- C. 以參與人數達標作為依據，取代實際工作品質評估
- D. 以展示案例的最佳表現作依據，推估全體使用成效

**Unique-answer rationale / explanation:** Pilot 前應訂出可量測且與目標相關的標準，避免事後挑指標或以最佳案例偏估成效。參與人數有助理解採用情形，但不能取代品質與效益驗證。

### Q061 — 技術可行性評估

Protected mapping: 中級 / L21 / L21201 / medium; answer index 2 (C).
Length ratio: 2.9032 → 1.0000; lengths: 7/8/30/16 → 15/15/15/15.

**Review:** 固定離線品質達標及尖峰負載問題，四項皆是模型／系統證據；須以目標環境端到端量測作答。

**Before:** 評估 AI 專案技術可行性時，何者最完整？

- A. 只看模型排行榜
- B. 只看主管是否喜歡
- C. 資料可得性與品質、模型能力、整合、延遲、成本、資安及維運條件
- D. 只要能做 Demo 就代表可正式部署

**After:** AI 模型在離線測試已達品質門檻，但尚未接入企業系統。若要確認尖峰時段的技術可行性，哪項證據最直接？

- A. 相同模型在公開榜單上的平均排名
- B. 開發電腦單次推論的最佳回應時間
- C. 目標環境預期負載下的端到端延遲
- D. 供應商展示時連續成功的回應次數

**Unique-answer rationale / explanation:** 尖峰可行性需要在目標環境、預期負載下量測端到端延遲，包含整合與等待時間。公開排名、單次最佳時間和展示成功次數都不能代表尖峰負載下的系統行為。

### Q062 — 技術可行性評估

Protected mapping: 中級 / L21 / L21201 / medium; answer index 1 (B).
Length ratio: 2.9032 → 1.0161; lengths: 7/30/8/16 → 21/21/20/21.

**Review:** 題幹已知資料與延遲瓶頸，干擾項為其他專案評估工作；只有驗證補足與改善方案直接解決瓶頸。

**Before:** 企業需求很有價值，但資料不足且推論延遲無法接受，這表示需要重新檢查哪一項？

- A. 只看模型排行榜
- B. 資料可得性與品質、模型能力、整合、延遲、成本、資安及維運條件
- C. 只看主管是否喜歡
- D. 只要能做 Demo 就代表可正式部署

**After:** 某 AI 方案商業效益可觀，但現有標註資料不足，原型延遲也超過業務可容忍範圍。下一步最適合做什麼？

- A. 提高預期營收目標，重新估算方案的市場吸引力
- B. 驗證資料補足方案與效能改善能否符合部署限制
- C. 增加使用者訪談，重新確認介面操作是否易學
- D. 比較供應商知名度，重新決定產品對外宣傳策略

**Unique-answer rationale / explanation:** 資料可用性與延遲是此處已知的技術瓶頸，應驗證改善方案及其資源需求能否滿足部署限制。市場、介面與宣傳評估無法直接解決這兩項可行性問題。

### Q063 — 技術可行性評估

Protected mapping: 中級 / L21 / L21201 / medium; answer index 1 (B).
Length ratio: 2.9032 → 1.0851; lengths: 16/30/8/7 → 16/17/15/16.

**Review:** 固定品質相近、離線及有限資源；雲端成本、展示與配額無法證明現場記憶體與延遲可行。

**Before:** AI 導入評估不應只看商業價值，也要看？

- A. 只要能做 Demo 就代表可正式部署
- B. 資料可得性與品質、模型能力、整合、延遲、成本、資安及維運條件
- C. 只看主管是否喜歡
- D. 只看模型排行榜

**After:** 兩個模型在代表性資料上的品質相近，但企業要求斷網運作，且現場運算資源有限。技術選型下一步應優先比較什麼？

- A. 公開服務的訂閱費率與雲端方案折扣
- B. 現場部署的記憶體需求與實測推論延遲
- C. 線上展示的回應品質與使用者評價
- D. 雲端服務的可用區域與彈性擴充配額

**Unique-answer rationale / explanation:** 斷網及有限現場資源是必要限制，需驗證模型可本地執行且記憶體、延遲符合需求。雲端費率、線上展示與雲端擴充配額無法證明現場部署可行。
