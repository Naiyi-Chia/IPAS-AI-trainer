# Issue #59 — Batch 4A question cue remediation

Engineering evidence, 2026-10-01. Independent Technical Review pending; not Product Verify.

## Baseline and scope

- Contract: [Issue #59](https://github.com/Naiyi-Chia/IPAS-AI-trainer/issues/59), including its Phase 4 Engineering handoff.
- Branch: `codex/issue-59-batch4a`; baseline `06d6c739ba5f1a04b1f66fe9b12acb1c4bba1ab2`, matching the pre-created branch and fetched epic integration branch.
- Exactly 24 self-authored questions: Q004–006, Q025–030, Q037–039, Q055–060, Q079–081, Q094–096. Only question/options/explanation changed; answer indices, metadata, other questions, official content, app shell and storage preserved.
- Isolated worktree preserves unrelated existing work. All 14 previous audit batch definitions compared and preserved. No dependencies added.

## Audit

```powershell
python -B scripts/audit_question_cues.py --batch batch4a --baseline 06d6c739ba5f1a04b1f66fe9b12acb1c4bba1ab2 --csv docs/QUESTION_CUE_BIAS_BATCH4A.csv
```

[CSV](QUESTION_CUE_BIAS_BATCH4A.csv): 966 rows, 483 before / 483 after. Length excludes whitespace; ratio is correct-option length divided by mean distractor length. Repeated sets ignore order and whitespace.

| Whole-bank metric | Before | After |
|---|---:|---:|
| Questions / unique IDs | 483 / 483 | 483 / 483 |
| Uniquely longest correct | 208 | 184 |
| Ratio >= 2 | 0 | 0 |
| Ratio >= 3 | 0 | 0 |
| Repeated groups | 46 | 38 |
| Questions in repeated groups | 192 | 168 |
| Answer A / B / C / D | 131 / 109 / 122 / 121 | 131 / 109 / 122 / 121 |

Scoped validation PASS: exactly 24 changed IDs, four distinct options, valid keys/topics, protected fields and shell unchanged. Scoped uniquely-longest correct 24 → 0; ratios 0.9167–1.0800; each option set unique across the whole bank. Only Q079 has a uniquely shortest key, due to numeric digit lengths within identical grammatical templates. No systematic inverse length cue introduced. Remaining out-of-scope cues are recorded in CSV.

## Editorial review

All 24 reviewed for one defensible key, plausible same-level distractors, grammar/completeness cues and consistent explanations. No protected-field or contract change required.

| IDs | Distinct checks and distractor rationale |
|---|---|
| Q004–006 | Complaint review, changed-population reassessment, accountable ownership. Convenience does not substitute for responsible review. |
| Q025–027 | Recognition plus generation, uncertainty handoff, factual consistency between stages. Fluency or verbosity cannot establish correctness. |
| Q028–030 | Low-code identification, no-code selection, reusable-component benefit. Tooling does not remove requirements/security/testing. |
| Q037–039 | Output schema, classification boundaries/examples, source-grounded missing information. Generic clarity or invented details fail the stated constraints. |
| Q055–057 | Fresh knowledge through RAG, behavior adaptation via fine-tuning, stale retrieval diagnosis. Stem assumptions distinguish knowledge freshness from response behavior. |
| Q058–060 | Combining modalities, timestamp alignment, controlled multimodal comparison. Single-modality and confounded comparisons do not demonstrate cross-modal value. |
| Q079–081 | Standardization, dispersion/peak shape, normal symmetry. Numeric alternatives represent distinct statistical errors. |
| Q094–096 | Observational limits, common cause, randomized concurrent comparison. Association and confounded assignment cannot isolate causal effects. |

## QA evidence

- Whole-bank audit PASS; 966 CSV rows; 14 previous batch definitions preserved.
- `python -B scripts/build_official_past_bundle.py --check`: PASS, 700 questions / 14 papers / 47 visual questions / 63 assets.
- `python -B scripts/test_official_past_bundle.py`: PASS, 4 tests.
- `node scripts/test_past_answer_feedback.cjs`: PASS, 16 answer combinations plus feedback/progress/navigation guards.
- `node scripts/test_past_progress_migration.cjs`: PASS, mapping, preservation and idempotence.
- Existing `scripts/test_official_bundle_browser.cjs`: PASS at 1280px and 375px; 36 direct and 36 wrong-answer contexts across 12 groups, migration, scoring, Practice/Mock, tabs and overflow.
- New `scripts/test_question_batch4a.cjs`: PASS at 1280×900 and 375×900. All 24 items exercised in both Practice and Mock at each width; exact rendered options, feedback, explanation, source and scoring checked.
- Practice: deliberately wrong Q004 entered wrong-question view; weak-area showed 2/3 (67%); correct retry removed it.
- Mock: L11/L12/L21/L22 each six items, deliberately wrong Q004/Q028/Q055/Q079 respectively. Each result: 5 correct, 1 wrong, 0 unanswered, score 83. Wrong-only review verified selected answer, correct key and explanation. Four native confirmations accepted per viewport.
- Seven tabs opened; official 115 second-session L11 loaded 50 questions. No browser warning/error, HTTP failure or document horizontal overflow in scoped tests.
- Visually inspected mobile Q029, desktop L21 review and mobile L22 review screenshots: options wrap and feedback/explanations remain usable.
- Inline app JS compilation, five existing Python script AST parses, new Node script syntax and `git diff --check`: PASS.

Re-run browser scripts with existing Playwright available via NODE_PATH and installed Edge:

```powershell
node scripts/test_question_batch4a.cjs <output-directory>
node scripts/test_official_bundle_browser.cjs <output-directory>
```

The new script emits `batch4a-results.json` and screenshots when an output directory is supplied. This run used local temporary directory `ipas-issue59-browser`; screenshots remain local supporting evidence. Committed script, CSV and report provide durable evidence.

Limits: scoped fixture filters the in-memory bank to 24 items and uses fresh browser profiles with real isolated localStorage, so full-bank random sampling is not covered. Native confirmations are accepted by automation. Existing official regression intercepts the Dev loader with schema-3 assets. In-app browser was unavailable; headless installed Edge was used. No physical device, Dev Preview or production validation claimed. No implementation blocker remains; independent Technical Review pending.

## Technical references

- [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/): accountability and lifecycle risk management.
- [Microsoft low-code / no-code](https://www.microsoft.com/en-us/power-platform/products/power-apps/topics/low-code-no-code/low-code-no-code-development-platforms): visual development and extensibility.
- [Microsoft RAG](https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation): retrieval-grounded knowledge.
- [NIST normal distribution](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm): standardization, shape and symmetry.

## Exact before / after review

### Q004 — key B

Option lengths A/B/C/D: 14/27/14/14 → 19/19/21/15; ratio 1.9286 → 1.0364.

**Before**

企業將 AI 用於影響客戶權益的決策時，哪一項治理措施最適當？

- A. 為避免爭議，取消所有稽核紀錄
- B. 建立責任歸屬、風險評估、監控、透明說明與申訴／覆核機制
- C. 只要準確率夠高，就不需要治理
- D. 把所有責任交給模型供應商即可

Explanation: AI 治理不能只看模型準確率，還需處理責任、透明、公平、安全、隱私、監控與救濟。

**After**

企業以 AI 輔助影響客戶權益的審核。客戶認為輸入資料有誤，要求重新檢視結果。哪項治理安排最直接回應這個需求？

- A. 由客服提供平均準確率，說明模型測試結果
- B. 由指定人員受理申訴，查核資料並覆核個案
- C. 由供應商安排年度評測，定期彙整各項技術指標
- D. 由業務統計滿意度，調整客服措辭

Explanation: 申訴處理需要有人受理並查核個案，必要時更正資料與結果。平均準確率、年度評測及滿意度可作為其他管理資訊，但不能取代這次資料爭議的覆核。

### Q005 — key D

Option lengths A/B/C/D: 14/14/14/27 → 17/19/22/19; ratio 1.9286 → 0.9828.

**Before**

高風險 AI 系統上線前後，何者最符合良好的治理做法？

- A. 把所有責任交給模型供應商即可
- B. 只要準確率夠高，就不需要治理
- C. 為避免爭議，取消所有稽核紀錄
- D. 建立責任歸屬、風險評估、監控、透明說明與申訴／覆核機制

Explanation: AI 治理不能只看模型準確率，還需處理責任、透明、公平、安全、隱私、監控與救濟。

**After**

AI 系統上線前已通過評估，半年後使用族群明顯改變。哪個做法最符合持續治理？

- A. 沿用上線前結論，在年度續約時再評估
- B. 維持原使用範圍，以客服案件總數判斷風險
- C. 增加新版功能推廣，以使用人數成長衡量治理成效
- D. 重新評估風險與分群表現，依結果調整控管

Explanation: 使用族群改變可能使原評估不再適用，應重新量測表現與風險並調整控管。合約時間、案件總數及使用成長都不能單獨反映新族群是否受到不利影響。

### Q006 — key A

Option lengths A/B/C/D: 27/14/14/14 → 21/20/21/23; ratio 1.9286 → 0.9844.

**Before**

若 AI 決策可能造成重大影響，團隊應優先建立哪種機制？

- A. 建立責任歸屬、風險評估、監控、透明說明與申訴／覆核機制
- B. 只要準確率夠高，就不需要治理
- C. 為避免爭議，取消所有稽核紀錄
- D. 把所有責任交給模型供應商即可

Explanation: AI 治理不能只看模型準確率，還需處理責任、透明、公平、安全、隱私、監控與救濟。

**After**

企業採購外部 AI 模型後，業務、資訊部門與供應商都認為事故應由別人處理。要解決責任不清，應優先做什麼？

- A. 指定風險負責人，訂明各方權責與事件升級流程
- B. 各部門自行保留紀錄，事故發生後再協調窗口
- C. 提高供應商模型準確率，由各部門自行判斷責任
- D. 將事故轉交客服受理，以客訴量安排處置人力與時程

Explanation: 採購模型不會自動釐清企業內部的決策責任。應預先指定負責人、分工與事件升級流程；分散留存紀錄、提升準確率或設客服窗口，都不足以決定誰有權採取處置。

### Q025 — key D

Option lengths A/B/C/D: 12/13/16/24 → 19/20/24/21; ratio 1.7561 → 1.0000.

**Before**

系統先用視覺模型判斷產品瑕疵，再用生成式 AI 自動撰寫檢測摘要，最符合哪個概念？

- A. 只要串接就不需要驗證輸出
- B. 整合後不再需要任何安全控管
- C. 生成式 AI 會自動取代所有資料來源
- D. 將預測／辨識能力與內容生成能力整合成完整工作流程

Explanation: 鑑別式模型可負責辨識、預測或分類，生成式模型再將結果轉成摘要、說明或其他內容。

**After**

工廠系統先辨識照片中的瑕疵類型，再依辨識結果產生檢測摘要。這個流程最符合哪種應用方式？

- A. 用生成模型製作瑕疵影像，擴充訓練資料集
- B. 用分群模型整理相似影像，由人工替各群命名
- C. 用分類模型估計瑕疵機率，再按固定門檻進行產品分流
- D. 先用辨識模型取得結果，再用生成模型撰寫說明

Explanation: 題述同時包含辨識與生成，將兩種能力串成工作流程。合成資料、影像分群及分類分流各有用途，但都不是題述的「辨識結果轉成摘要」。

### Q026 — key B

Option lengths A/B/C/D: 12/24/16/13 → 21/19/20/19; ratio 1.7561 → 0.9500.

**Before**

若企業把分類模型的判斷結果交給生成式 AI 產生可讀報告，這屬於？

- A. 只要串接就不需要驗證輸出
- B. 將預測／辨識能力與內容生成能力整合成完整工作流程
- C. 生成式 AI 會自動取代所有資料來源
- D. 整合後不再需要任何安全控管

Explanation: 鑑別式模型可負責辨識、預測或分類，生成式模型再將結果轉成摘要、說明或其他內容。

**After**

客服分類器將工單分為帳務或設備問題，生成模型再草擬回覆。若分類器信心不足，哪種串接設計較能避免錯誤一路傳到回覆？

- A. 將最高分類當成確認結果，再要求回覆語氣一致
- B. 將低信心工單送人工確認，再產生對應回覆
- C. 多次生成後取最長回覆，作為分類正確的佐證
- D. 改善文字流暢程度，以可讀性判斷能否寄出

Explanation: 分類的不確定性應傳遞到工作流程，低信心時可先確認再生成。流暢、篇幅或多次生成都不能證明上游分類正確；這是在整合時處理錯誤傳遞，不是單看模型輸出形式。

### Q027 — key B

Option lengths A/B/C/D: 13/24/16/12 → 17/20/21/20; ratio 1.7561 → 1.0345.

**Before**

鑑別式模型與生成式模型串接的主要價值之一是？

- A. 整合後不再需要任何安全控管
- B. 將預測／辨識能力與內容生成能力整合成完整工作流程
- C. 生成式 AI 會自動取代所有資料來源
- D. 只要串接就不需要驗證輸出

Explanation: 鑑別式模型可負責辨識、預測或分類，生成式模型再將結果轉成摘要、說明或其他內容。

**After**

瑕疵辨識結果會交給生成模型撰寫報告。某報告語句流暢，卻把辨識為刮傷的產品寫成裂痕。驗證整體流程時，最需要補上哪種檢查？

- A. 檢查報告字數分布，確認篇幅符合模板
- B. 核對報告主張與辨識結果，追蹤上下游一致性
- C. 檢查辨識服務延遲，確認各時段可如期產生報告
- D. 核對生成模型版本，確認使用者都使用同一版

Explanation: 整合流程需檢查資訊是否在模型之間正確傳遞，報告主張應與辨識證據一致。篇幅、延遲與版本一致性也可測試，但不會直接揭露刮傷被寫成裂痕的語意錯置。

### Q028 — key C

Option lengths A/B/C/D: 14/22/29/10 → 18/16/17/16; ratio 1.8913 → 1.0200.

**Before**

哪一個敘述最能說明 No Code 與 Low Code？

- A. Low Code 完全禁止寫程式
- B. No Code 一定比傳統開發更適合所有複雜系統
- C. 降低應用開發門檻，Low Code 通常保留較多程式化客製能力
- D. 兩者只能建立靜態網站

Explanation: No Code 著重視覺化、低門檻；Low Code 通常允許以程式碼擴充較複雜的需求。

**After**

團隊大多用拖拉元件建應用，但有一段特殊規則需要工程師以程式擴充。這最符合 Low Code 的哪項特性？

- A. 以現成模板為主，客製需求配合模板調整
- B. 以逐行編碼為主，視覺元件只作預覽
- C. 以視覺化開發為主，保留程式擴充能力
- D. 以模型訓練為主，透過標註修改規則

Explanation: Low Code 通常結合視覺化開發與程式擴充。它不等同於把所有功能逐行重寫，也不表示客製化必須改用模型訓練；實際擴充能力仍取決於平台。

### Q029 — key D

Option lengths A/B/C/D: 14/22/10/29 → 19/17/14/18; ratio 1.8913 → 1.0800.

**Before**

需要非工程人員以視覺化介面快速建立流程，通常較接近哪類工具？

- A. Low Code 完全禁止寫程式
- B. No Code 一定比傳統開發更適合所有複雜系統
- C. 兩者只能建立靜態網站
- D. 降低應用開發門檻，Low Code 通常保留較多程式化客製能力

Explanation: No Code 著重視覺化、低門檻；Low Code 通常允許以程式碼擴充較複雜的需求。

**After**

行政人員不會寫程式，只需用現成欄位、通知與簽核元件，建立標準請假流程。哪種工具最符合這項需求？

- A. 程式框架，以程式逐行實作表單與簽核流程
- B. 版本管理工具，追蹤程式碼及合併紀錄
- C. 容器部署工具，封裝並執行服務
- D. No Code 工具，以視覺元件組合流程

Explanation: 需求可由現成元件完成，且使用者不撰寫程式，適合以 No Code 組合表單與流程。版本管理與容器部署不是建立此流程的直接工具，程式框架則需要開發能力。

### Q030 — key A

Option lengths A/B/C/D: 29/22/14/10 → 15/14/15/16; ratio 1.8913 → 1.0000.

**Before**

No Code / Low Code 平台的主要目的之一是？

- A. 降低應用開發門檻，Low Code 通常保留較多程式化客製能力
- B. No Code 一定比傳統開發更適合所有複雜系統
- C. Low Code 完全禁止寫程式
- D. 兩者只能建立靜態網站

Explanation: No Code 著重視覺化、低門檻；Low Code 通常允許以程式碼擴充較複雜的需求。

**After**

No Code 平台已有表單與通知元件，團隊想快速建立活動報名原型。使用這類平台最直接的效益是？

- A. 重用現成元件，減少初期開發工作
- B. 以操作畫面，替代使用需求確認
- C. 沿用平台預設權限，免去存取設計
- D. 以元件組合完成，替代正式上線測試

Explanation: 現成元件能減少重複開發、縮短原型製作時間，但仍要確認需求、權限及上線品質。降低開發門檻並不代表這些工程與治理工作已由平台替代。

### Q037 — key C

Option lengths A/B/C/D: 15/9/22/10 → 18/17/18/17; ratio 1.9412 → 1.0385.

**Before**

希望模型穩定產出符合格式的需求分析表，哪種提示設計較好？

- A. 移除所有限制讓模型完全自由發揮
- B. 只輸入「幫我做好」
- C. 清楚交代任務、背景、限制、輸出格式與必要範例
- D. 避免提供任何背景資訊

Explanation: 高品質提示通常需要清楚描述任務、上下文、限制、輸出格式，必要時可提供示例。

**After**

希望模型把訪談內容整理成「需求、原因、優先度」三欄表格。哪個提示最直接約束輸出格式？

- A. 指定資深分析師角色，要求內容詳盡專業
- B. 先介紹訪談背景，再依重要性說明需求
- C. 請使用指定三欄表格，每列列出一項需求
- D. 參照專案報告慣例，自行選擇呈現方式

Explanation: 明訂欄位與每列的單位，直接對應所需表格格式。指定角色、背景或一般寫作風格都較間接；提示可改善格式一致性，但仍應檢查實際輸出。

### Q038 — key A

Option lengths A/B/C/D: 22/9/15/10 → 18/17/18/19; ratio 1.9412 → 1.0000.

**Before**

同一任務輸出品質不穩，若先從 Prompt 改善，何者最合理？

- A. 清楚交代任務、背景、限制、輸出格式與必要範例
- B. 只輸入「幫我做好」
- C. 移除所有限制讓模型完全自由發揮
- D. 避免提供任何背景資訊

Explanation: 高品質提示通常需要清楚描述任務、上下文、限制、輸出格式，必要時可提供示例。

**After**

模型常把「急件」與「一般件」標得不一致。若先從提示改善，哪項補充最能釐清分類標準？

- A. 列出兩類判準與邊界案例，示範對應標籤
- B. 肯定模型專業能力，鼓勵它有信心分類
- C. 連續重複分類指令，再要求模型簡短回答
- D. 補充無關的產業背景，增加提示資訊的總量

Explanation: 清楚的判準與邊界案例能釐清急件和一般件的區別。稱讚、重複指令或無關背景都未提供分類依據；仍須用代表性工單驗證改善效果。

### Q039 — key A

Option lengths A/B/C/D: 22/10/15/9 → 19/21/18/17; ratio 1.9412 → 1.0179.

**Before**

較完整的 Prompt 通常會包含哪些資訊？

- A. 清楚交代任務、背景、限制、輸出格式與必要範例
- B. 避免提供任何背景資訊
- C. 移除所有限制讓模型完全自由發揮
- D. 只輸入「幫我做好」

Explanation: 高品質提示通常需要清楚描述任務、上下文、限制、輸出格式，必要時可提供示例。

**After**

要依一份產品規格生成摘要，且規格未寫出的資訊要標為「未提供」。哪項提示最直接限制內容依據？

- A. 只根據所附規格摘要，缺少資訊標為未提供
- B. 依同類產品常見設計補足細節，再整理完整段落
- C. 先用模型記得的資訊，再依規格調整措辭
- D. 以介紹優點為目標，挑選吸引人的內容

Explanation: 提示應界定可使用的資料與資訊不足時的處理方式。常見設計、模型記憶或行銷目標都不能當成這份規格已記載的事實；實際摘要仍需核對來源。

### Q055 — key A

Option lengths A/B/C/D: 27/26/19/8 → 22/23/20/22; ratio 1.5283 → 1.0154.

**Before**

公司制度文件頻繁更新且答案要附來源，通常應優先考慮哪種方法？

- A. RAG：將知識維持在外部檢索層，查到相關內容再提供模型
- B. Fine-tuning：每次查詢都會自動搜尋最新文件
- C. RAG 必須重新訓練模型權重才可更新知識
- D. 兩者沒有實質差異

Explanation: RAG 適合頻繁更新、需引用來源的知識；Fine-tuning 更偏向改變模型行為、風格或任務適配。

**After**

公司制度每週更新，回答須附上目前版本的文件依據。系統可建立檢索索引，且不希望每次更新都重訓模型。哪個方案最符合需求？

- A. 更新文件索引，檢索相關段落後生成附來源的回答
- B. 把制度轉成訓練樣本，每週微調後僅依模型權重作答
- C. 將制度摘要固定寫入提示，每季集中更新摘要
- D. 保留原模型並縮短回答，以降低提及舊制度的機會

Explanation: RAG 可更新外部資料與索引，再將取得的段落作為生成依據，符合不反覆重訓與可追溯需求。仍須處理索引新鮮度與引用核對；微調權重本身不是每次查詢的來源檢索。

### Q056 — key A

Option lengths A/B/C/D: 27/8/26/19 → 19/21/19/18; ratio 1.5283 → 0.9828.

**Before**

知識需要快速更新、可追溯來源時，RAG 相較 Fine-tuning 的主要優點是？

- A. RAG：將知識維持在外部檢索層，查到相關內容再提供模型
- B. 兩者沒有實質差異
- C. Fine-tuning：每次查詢都會自動搜尋最新文件
- D. RAG 必須重新訓練模型權重才可更新知識

Explanation: RAG 適合頻繁更新、需引用來源的知識；Fine-tuning 更偏向改變模型行為、風格或任務適配。

**After**

客服已有能檢索最新文件的 RAG，但回覆常不遵守固定語氣與輸出欄位。提示改善後仍不穩定，且有足夠高品質示範。哪個後續實驗最對應這個缺口？

- A. 保留檢索並評估微調，以示範強化回覆行為
- B. 提高索引更新頻率，以最新文件強化語氣一致性
- C. 增加檢索段落數，以更多知識取代格式示範
- D. 停用外部檢索，以微調示範取代文件更新

Explanation: 缺口在語氣與格式行為，可評估以示範微調，並保留 RAG 處理會更新的知識。提高索引頻率或段落數未直接教導行為；微調也不等於自動取得最新文件。效果仍需用保留樣本驗證。

### Q057 — key A

Option lengths A/B/C/D: 27/8/26/19 → 19/18/21/18; ratio 1.5283 → 1.0000.

**Before**

某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，若希望不重新訓練模型就能更新大量內部知識，較適合？

- A. RAG：將知識維持在外部檢索層，查到相關內容再提供模型
- B. 兩者沒有實質差異
- C. Fine-tuning：每次查詢都會自動搜尋最新文件
- D. RAG 必須重新訓練模型權重才可更新知識

Explanation: RAG 適合頻繁更新、需引用來源的知識；Fine-tuning 更偏向改變模型行為、風格或任務適配。

**After**

團隊用 RAG 回答新版制度，卻仍引用舊條文。查詢紀錄顯示檢索階段只取回舊文件。若先修正已知原因，最合理的措施是？

- A. 修正文件版本與索引更新，再測試檢索結果
- B. 增加微調回合，讓模型更熟悉舊文件內容
- C. 提高生成隨機程度，讓模型產生不同版本的條文
- D. 增加回覆引用段落數，補足舊索引的證據

Explanation: 已知問題發生在檢索層的文件版本，應先修正資料與索引並驗證能否取回新版。微調、隨機生成或增加舊段落數，不能直接補上未被檢索到的新條文。

### Q058 — key C

Option lengths A/B/C/D: 14/10/21/8 → 18/17/19/22; ratio 1.9688 → 1.0000.

**Before**

客服系統同時分析使用者文字描述與故障照片，最符合哪個技術方向？

- A. 完全隔離各模態且禁止互相引用
- B. 僅將圖片檔名轉成文字
- C. 對齊或融合不同模態的資訊進行共同理解與推理
- D. 只增加文字資料量

Explanation: 多模態 AI 需要對齊或融合不同模態的表示，使系統可跨文字、影像、聲音等資訊推理。

**After**

客服需要同時利用使用者描述的故障經過與照片中的指示燈狀態判斷原因。哪種設計屬於多模態融合？

- A. 只分析故障描述，將照片保存為案件附件
- B. 只辨識照片，將描述當作檔案搜尋標籤
- C. 結合文字與影像特徵，產生共同的故障判斷
- D. 分別顯示文字與照片的分析，固定採用文字的結論

Explanation: 多模態融合把不同模態中的線索結合起來供共同判斷。只用一種模態、只存附件或固定採用單一路徑的結論，都沒有利用兩者的互補關係。

### Q059 — key A

Option lengths A/B/C/D: 21/10/8/14 → 17/19/19/14; ratio 1.9688 → 0.9808.

**Before**

某客服平台要把 AI 模型正式導入營運流程，團隊正在討論技術方案。 在此情境下，AI 要整合語音、文字、圖片資訊做共同決策，屬於？

- A. 對齊或融合不同模態的資訊進行共同理解與推理
- B. 僅將圖片檔名轉成文字
- C. 只增加文字資料量
- D. 完全隔離各模態且禁止互相引用

Explanation: 多模態 AI 需要對齊或融合不同模態的表示，使系統可跨文字、影像、聲音等資訊推理。

**After**

工廠要融合麥克風聲音與攝影機影像判斷設備異常。兩種感測器的紀錄時間相差數秒，可能對到不同事件。應先處理哪項問題？

- A. 校準時間並對齊同一事件的聲音與影像
- B. 提高影像解析度，仍按原紀錄順序配對聲音
- C. 提高聲音取樣頻率，沿用影像的原時間戳記
- D. 統一檔名格式，依字母排序配對

Explanation: 融合需要確認資料描述的是同一事件，時間偏移會讓不同事件的線索被錯配。提高解析度、取樣頻率或統一檔名，都不能直接修正事件的時間對齊。

### Q060 — key D

Option lengths A/B/C/D: 10/8/14/21 → 21/20/16/20; ratio 1.9688 → 1.0526.

**Before**

某製造企業正在建置 AI 應用，PM 與工程師需要確認下列技術觀念。 在此情境下，多模態 AI 的核心目標之一是？

- A. 僅將圖片檔名轉成文字
- B. 只增加文字資料量
- C. 完全隔離各模態且禁止互相引用
- D. 對齊或融合不同模態的資訊進行共同理解與推理

Explanation: 多模態 AI 需要對齊或融合不同模態的表示，使系統可跨文字、影像、聲音等資訊推理。

**After**

融合文字與照片的客服模型表現不錯。團隊想知道照片是否在文字之外提供額外資訊；已有固定測試集。哪個比較最能回答這個問題？

- A. 比較融合模型與舊文字模型，各用不同時期案件
- B. 比較融合模型的圖片張數，與文字輸入的字數
- C. 比較融合模型與人工回覆的平均篇幅
- D. 在相同測試集比較文字模型與文字加照片模型

Explanation: 在相同測試集、可比較的訓練與評估條件下做模態消融比較，才能評估照片的增益。不同時期資料會混入分布差異，輸入量或輸出篇幅則不是任務表現；增益也不是必然存在。

### Q079 — key B

Option lengths A/B/C/D: 10/18/9/11 → 12/11/12/12; ratio 1.8000 → 0.9167.

**Before**

常態分布的典型特性何者正確？

- A. 常態分布一定高度右偏
- B. 標準常態分布的平均數為 0、標準差為 1
- C. 常態分布沒有平均數
- D. 所有常態分布都只有正值

Explanation: 標準常態分布 N(0,1) 的平均數為 0、變異數與標準差分別為 1。

**After**

X 服從常態分布，平均數為 50、標準差為 10。令 Z＝(X−50)／10，Z 的平均數與標準差分別是多少？

- A. 平均數為 50，標準差為 1
- B. 平均數為 0，標準差為 1
- C. 平均數為 0，標準差為 10
- D. 平均數為 5，標準差為 10

Explanation: 減去平均數使中心變成 0，再除以標準差使尺度變成 1，因此 Z 服從標準常態分布。只縮放、只中心化或混用原參數，都不會得到同樣的結果。

### Q080 — key B

Option lengths A/B/C/D: 10/18/9/11 → 13/13/13/14; ratio 1.8000 → 0.9750.

**Before**

若資料近似 Normal Distribution，下列敘述何者較合理？

- A. 常態分布一定高度右偏
- B. 標準常態分布的平均數為 0、標準差為 1
- C. 常態分布沒有平均數
- D. 所有常態分布都只有正值

Explanation: 標準常態分布 N(0,1) 的平均數為 0、變異數與標準差分別為 1。

**After**

兩個常態分布的平均數相同，甲的標準差為 2，乙為 5。比較機率密度曲線，哪個敘述正確？

- A. 乙的中心較右，峰值高度相同
- B. 乙的分布較寬，中央峰值較低
- C. 乙的分布較窄，中央峰值較高
- D. 乙的中心較左，曲線總面積較小

Explanation: 平均數相同使中心相同；較大的標準差表示分散較廣。密度曲線總面積皆為 1，所以乙較寬且中央峰值較低，並非向左或向右移動。

### Q081 — key C

Option lengths A/B/C/D: 11/9/18/10 → 15/15/15/16; ratio 1.8000 → 0.9783.

**Before**

某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，標準常態分布的平均數與標準差分別為？

- A. 所有常態分布都只有正值
- B. 常態分布沒有平均數
- C. 標準常態分布的平均數為 0、標準差為 1
- D. 常態分布一定高度右偏

Explanation: 標準常態分布 N(0,1) 的平均數為 0、變異數與標準差分別為 1。

**After**

Z 服從標準常態分布。僅利用分布的對稱性，P(Z＞0) 等於多少？

- A. 0.25，因零右側只占四分之一
- B. 0.68，因零右側是一個標準差
- C. 0.50，因零左右兩側面積相等
- D. 0.95，因零右側包含主要觀測值

Explanation: 標準常態以 0 對稱，連續分布在單點的機率為 0，因此左右各占 0.5。約 68% 與 95% 分別對應中心兩側約一與兩個標準差的區間，不是零右側的機率。

### Q094 — key A

Option lengths A/B/C/D: 20/13/12/14 → 18/20/20/17; ratio 1.5385 → 0.9474.

**Before**

某製造公司每天產生大量感測器與生產資料，資料工程團隊正在設計分析流程。 在此情境下，分析發現兩個變數高度相關，最合理的解讀是？

- A. 變數間有關聯，但不能僅憑相關直接證明因果
- B. 只要樣本大就可自動證明因果
- C. 高度相關必定代表直接因果
- D. 相關係數高代表不存在混淆變數

Explanation: Correlation does not imply causation；因果推論需要更嚴謹的實驗設計或假設與方法。

**After**

觀察資料顯示加班時數與錯誤率正相關，但沒有控制任務難度，也沒有隨機分派加班。哪個結論最受目前證據支持？

- A. 兩者在資料中有關聯，因果方向尚待釐清
- B. 加班使錯誤率上升，相關係數已證明直接因果
- C. 錯誤使加班增加，因為反向關係符合工作經驗
- D. 任務難度沒有影響，因為正相關很穩定

Explanation: 觀察到關聯不足以識別因果方向，還可能有任務難度等混淆因素。正向、反向因果及共同原因都需要進一步證據，不能僅憑相關係數或直覺擇一。

### Q095 — key B

Option lengths A/B/C/D: 12/20/14/13 → 18/18/17/19; ratio 1.5385 → 1.0000.

**Before**

某金融機構準備用大數據支援風險分析，團隊需要確認資料處理與統計方法。 在此情境下，某網站發現冰淇淋銷量與中暑人數同時上升，能直接推論冰淇淋造成中暑嗎？

- A. 高度相關必定代表直接因果
- B. 變數間有關聯，但不能僅憑相關直接證明因果
- C. 相關係數高代表不存在混淆變數
- D. 只要樣本大就可自動證明因果

Explanation: Correlation does not imply causation；因果推論需要更嚴謹的實驗設計或假設與方法。

**After**

夏季資料顯示冰淇淋銷量與中暑人數一起增加。氣溫可能同時提高兩者。此時氣溫最適合被視為什麼？

- A. 銷量影響中暑的中介，先由銷量改變氣溫
- B. 兩者的共同原因，可能造成觀察到的關聯
- C. 中暑的替代指標，可當成相同結果變數
- D. 兩者的共同結果，先由銷量與中暑改變氣溫

Explanation: 若氣溫同時影響銷量與中暑，它是可能的共同原因或混淆因素。這與受銷量影響後再造成中暑的中介不同，也不是兩者共同造成的結果；仍需資料與合理假設支持因果結構。

### Q096 — key D

Option lengths A/B/C/D: 13/12/14/20 → 18/21/17/18; ratio 1.5385 → 0.9643.

**Before**

某企業資料團隊正在處理大量營運資料，準備建立分析與決策流程。 在此情境下，統計上的相關性通常代表？

- A. 只要樣本大就可自動證明因果
- B. 高度相關必定代表直接因果
- C. 相關係數高代表不存在混淆變數
- D. 變數間有關聯，但不能僅憑相關直接證明因果

Explanation: Correlation does not imply causation；因果推論需要更嚴謹的實驗設計或假設與方法。

**After**

新舊網頁的訪客若自行選版，兩組購買率差異可能來自使用者偏好。若要較可靠地估計頁面版本對購買率的影響，哪種設計較合適？

- A. 讓高消費會員看新版，再與一般會員比較
- B. 讓新版在促銷週上線，再與舊版的平日結果比較
- C. 讓問卷填答者用新版，再與未填者比較
- D. 將訪客隨機分派版本，在同期比較購買率

Explanation: 同期隨機分派可減少使用者自選與時間因素造成的混淆，是估計版本效果的合適設計。仍需檢查執行品質、樣本量與不確定性；依消費、時段或問卷意願分組會混入其他差異。
