# Official visual assets

These assets are direct crops rendered from official iPAS PDF pages for questions that require a figure, table, formula, code block, or shared visual context.

Rules:
- Official PDF is the visual source of truth.
- No AI/NotebookLM redraw, reconstruction, or restyling is permitted.
- Vector/text visuals are rendered from the official PDF page and cropped; they are not retyped.
- Shared question-group visuals are stored once and referenced by all dependent questions.
- `docs/OFFICIAL_VISUAL_ASSET_MANIFEST.json` is the canonical question-to-asset mapping artifact.

Provenance:
- Crop mapping: `falo-chinese/ipas-aiap/verification/07_正確圖片對應.csv`
- Crop implementation: `falo-chinese/ipas-aiap/verification/fix_images.py`
- Crop method: PyMuPDF direct PDF render/crop, 3x zoom, 6pt padding.

Current inventory: 47 visual-dependent rows, 63 unique PNG crops.

## 114-2-L23 manual override

For `114-2-L23`, human-reviewed crops supplied from the official PDF replace the earlier automated grouping where option-level and shared-context boundaries required finer granularity (Q45–Q49). These remain source-faithful screenshots; no redraw or AI reconstruction was used.

## 115-1-L21 / 115-1-L22 manual override

Human-reviewed screenshots from the official PDFs replace the previous automated crops for these papers. For `115-1-L22 Q49`, the four option visuals are stored separately as `q49_a/b/c/d` and referenced together with the Q48–50 shared visual.

## 115-1-L23 manual override

Human-reviewed screenshots from the official PDF replace the previous automated crops. Q45 is represented by two question-specific visuals (`q45_1/2`), and the Q46–48 shared context is represented by two shared visuals (`shared_1/2`).
