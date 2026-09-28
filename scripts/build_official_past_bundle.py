#!/usr/bin/env python3
from __future__ import annotations
import argparse,csv,json
from collections import OrderedDict
from pathlib import Path

EXPECTED_ROWS=700
EXPECTED_PAPERS=14
EXPECTED_Q=50
EXPECTED_VISUAL_ROWS=47
EXPECTED_ASSETS=63
SOURCE_ID="1wXGl2u_1Ttd2LqPoRICclinqD-0hcFQPkm8uRJfSkUk"
SOURCE_SHEET="AI應用規劃師_歷屆試題總表(700題)"
SOURCE_URL=f"https://docs.google.com/spreadsheets/d/{SOURCE_ID}/edit"
HEADERS=["paper_id","year","session","level","subject","question_no","question_text","option_a","option_b","option_c","option_d","answer","source_page_start","source_page_end","has_visual","visual_asset_file","source_pdf_file","notes","verification_status"]

def norm_session(v):
    v=(v or "").strip()
    return {"第二次":"第二梯次","第四次":"第四梯次"}.get(v,v)

def to_int(v):
    v=(v or "").strip()
    return int(v) if v else None

def to_bool(v):
    v=(v or "").strip().upper()
    if v=="TRUE": return True
    if v=="FALSE": return False
    raise ValueError(f"invalid boolean {v!r}")

def split_assets(v):
    return [x.strip() for x in (v or "").split(";") if x.strip()]

def build(rows,fieldnames,repo_root):
    missing=[h for h in HEADERS if h not in fieldnames]
    if missing: raise ValueError(f"missing headers: {missing}")
    if len(rows)!=EXPECTED_ROWS: raise ValueError(f"expected {EXPECTED_ROWS} rows, got {len(rows)}")
    papers=OrderedDict(); visual_rows=0; unique_assets=set()
    for line,row in enumerate(rows,2):
        for key in ["paper_id","year","session","level","subject","question_no","question_text","option_a","option_b","option_c","option_d","answer","source_pdf_file","verification_status"]:
            if not (row.get(key) or "").strip(): raise ValueError(f"row {line}: empty {key}")
        if row["verification_status"].strip()!="verified": raise ValueError(f"row {line}: not verified")
        if row["answer"].strip() not in "ABCD": raise ValueError(f"row {line}: bad answer")
        pid=row["paper_id"].strip()
        if pid not in papers:
            papers[pid]={"paper_id":pid,"year":int(row["year"]),"session":norm_session(row["session"]),"level":row["level"].strip(),"subject":row["subject"].strip(),"source_pdf_file":row["source_pdf_file"].strip(),"questions":[]}
        p=papers[pid]
        current=(int(row["year"]),norm_session(row["session"]),row["level"].strip(),row["subject"].strip(),row["source_pdf_file"].strip())
        expected=(p["year"],p["session"],p["level"],p["subject"],p["source_pdf_file"])
        if current!=expected: raise ValueError(f"row {line}: paper metadata drift")
        has_visual=to_bool(row["has_visual"]); assets=split_assets(row.get("visual_asset_file",""))
        if has_visual:
            visual_rows+=1
            if not assets: raise ValueError(f"row {line}: missing visual mapping")
        elif assets: raise ValueError(f"row {line}: unexpected visual mapping")
        for asset in assets:
            unique_assets.add(asset)
            if not (repo_root/asset).is_file(): raise ValueError(f"row {line}: missing {asset}")
        p["questions"].append({"question_no":int(row["question_no"]),"question_text":row["question_text"].strip(),"options":{"A":row["option_a"].strip(),"B":row["option_b"].strip(),"C":row["option_c"].strip(),"D":row["option_d"].strip()},"answer":row["answer"].strip(),"source_page_start":to_int(row.get("source_page_start","")),"source_page_end":to_int(row.get("source_page_end","")),"has_visual":has_visual,"visual_assets":assets,"notes":(row.get("notes") or "").strip(),"verification_status":"verified"})
    if len(papers)!=EXPECTED_PAPERS: raise ValueError(f"expected {EXPECTED_PAPERS} papers, got {len(papers)}")
    for pid,p in papers.items():
        p["questions"].sort(key=lambda q:q["question_no"])
        if [q["question_no"] for q in p["questions"]]!=list(range(1,EXPECTED_Q+1)): raise ValueError(f"{pid}: numbering/count mismatch")
    if visual_rows!=EXPECTED_VISUAL_ROWS: raise ValueError(f"expected {EXPECTED_VISUAL_ROWS} visual rows, got {visual_rows}")
    if len(unique_assets)!=EXPECTED_ASSETS: raise ValueError(f"expected {EXPECTED_ASSETS} assets, got {len(unique_assets)}")
    bundle={"schema_version":2,"source":{"type":"verified-master-snapshot","spreadsheet_id":SOURCE_ID,"sheet_name":SOURCE_SHEET,"spreadsheet_url":SOURCE_URL,"row_count":len(rows),"paper_count":len(papers),"verification_status":"verified","snapshot_date":"2026-09-28"},"papers":list(papers.values())}
    return bundle,visual_rows,len(unique_assets)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--source",default="data/official-past-papers-source.csv")
    ap.add_argument("--output",default="data/official-past-papers.json")
    ap.add_argument("--check",action="store_true")
    args=ap.parse_args()
    source=Path(args.source); output=Path(args.output); root=Path(__file__).resolve().parent.parent
    with source.open("r",encoding="utf-8-sig",newline="") as f:
        reader=csv.DictReader(f); rows=list(reader); fields=reader.fieldnames or []
    bundle,visual_rows,asset_count=build(rows,fields,root)
    rendered=json.dumps(bundle,ensure_ascii=False,indent=2)+"\n"
    if args.check:
        if not output.exists() or output.read_text(encoding="utf-8")!=rendered: raise SystemExit(f"FAIL: {output} differs from deterministic rebuild")
    else:
        output.parent.mkdir(parents=True,exist_ok=True); output.write_text(rendered,encoding="utf-8")
    print(f"PASS: {len(rows)} verified rows / {len(bundle['papers'])} papers / {visual_rows} visual rows / {asset_count} unique assets")
if __name__=="__main__": main()
