#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, OrderedDict
from pathlib import Path

EXPECTED_ROWS = 700
EXPECTED_PAPERS = 14
EXPECTED_Q = 50
EXPECTED_VISUAL_ROWS = 47
EXPECTED_ASSETS = 63
EXPECTED_CONTEXTS = 12
EXPECTED_DEPENDENTS = 36
BUNDLE_SCHEMA_VERSION = 4
SOURCE_ID = "1wXGl2u_1Ttd2LqPoRICclinqD-0hcFQPkm8uRJfSkUk"
SOURCE_SHEET = "AI應用規劃師_歷屆試題總表(700題)"
SOURCE_URL = f"https://docs.google.com/spreadsheets/d/{SOURCE_ID}/edit"
SOURCE_SNAPSHOT_DATE = "2026-10-03"

HEADERS = [
    "paper_id", "year", "session", "level", "subject", "question_no",
    "question_text", "option_a", "option_b", "option_c", "option_d",
    "answer", "source_page_start", "source_page_end", "has_visual",
    "visual_asset_file", "source_pdf_file", "notes", "verification_status",
]
SHARED_HEADERS = [
    "shared_context_id", "shared_context_text",
    "shared_context_source_page_start", "shared_context_source_page_end",
    "shared_context_visual_asset_file",
]
COMPETENCY_HEADERS = [
    "competency_topic", "competency_mapping_status", "competency_mapping_note",
]
HEADERS += SHARED_HEADERS + COMPETENCY_HEADERS

TOPICS_BY_SUBJECT = {
    "L11": {"L11101", "L11102", "L11201", "L11202", "L11203", "L11301", "L11302", "L11401", "L11402"},
    "L12": {"L12101", "L12102", "L12201", "L12202", "L12301", "L12302", "L12303"},
    "L21": {"L21101", "L21102", "L21103", "L21104", "L21201", "L21202", "L21203", "L21301", "L21302"},
    "L22": {"L22101", "L22102", "L22103", "L22201", "L22202", "L22203", "L22301", "L22302", "L22303", "L22401", "L22402", "L22403", "L22404"},
    "L23": {"L23101", "L23102", "L23103", "L23201", "L23202", "L23203", "L23301", "L23302", "L23303", "L23304", "L23401", "L23402"},
}


def norm_session(v, year):
    v = (v or "").strip()
    return {"第二次": "第二梯次", "第四次": "第四梯次"}.get(v, v) if int(year) == 114 else v


def to_int(v):
    v = (v or "").strip()
    return int(v) if v else None


def to_bool(v):
    v = (v or "").strip().upper()
    if v == "TRUE":
        return True
    if v == "FALSE":
        return False
    raise ValueError(f"invalid boolean {v!r}")


def split_assets(v):
    if not (v or "").strip():
        return []
    assets = [x.strip() for x in v.split(";")]
    if not all(assets) or len(set(assets)) != len(assets):
        raise ValueError("empty/duplicate asset path")
    return assets


def page_range(row, prefix=""):
    start = to_int(row.get(prefix + "source_page_start", ""))
    end = to_int(row.get(prefix + "source_page_end", ""))
    if not start or not end or not 1 <= start <= end:
        raise ValueError("invalid source page range")
    return start, end


def validate_competency(row, line):
    subject = row["subject"].strip()
    topic = row["competency_topic"].strip().upper()
    status = row["competency_mapping_status"].strip()
    if subject not in TOPICS_BY_SUBJECT:
        raise ValueError(f"row {line}: unknown subject {subject!r}")
    if not topic:
        raise ValueError(f"row {line}: empty competency_topic")
    if topic not in TOPICS_BY_SUBJECT[subject]:
        owner = next((s for s, topics in TOPICS_BY_SUBJECT.items() if topic in topics), None)
        if owner:
            raise ValueError(f"row {line}: cross-subject competency topic {topic} belongs to {owner}, not {subject}")
        raise ValueError(f"row {line}: invalid competency topic {topic!r}")
    if status != "verified":
        raise ValueError(f"row {line}: competency mapping not verified ({status!r})")
    return topic


def build(rows, fieldnames, repo_root):
    missing = [h for h in HEADERS if h not in fieldnames]
    if missing:
        raise ValueError(f"missing headers: {missing}")
    if len(rows) != EXPECTED_ROWS:
        raise ValueError(f"expected {EXPECTED_ROWS} rows, got {len(rows)}")

    papers = OrderedDict()
    contexts = OrderedDict()
    dependents = 0
    visual_rows = 0
    unique_assets = set()
    competency_distribution = Counter()

    for line, row in enumerate(rows, 2):
        # Git may check CSV out with CRLF, including quoted multiline cells.
        # Keep canonical strings identical across Windows and LF checkouts.
        row = {
            key: value.replace("\r\n", "\n").replace("\r", "\n")
            if isinstance(value, str) else value
            for key, value in row.items()
        }
        for key in [
            "paper_id", "year", "session", "level", "subject", "question_no",
            "question_text", "option_a", "option_b", "option_c", "option_d",
            "answer", "source_pdf_file", "verification_status",
            "competency_topic", "competency_mapping_status",
        ]:
            if not (row.get(key) or "").strip():
                raise ValueError(f"row {line}: empty {key}")

        if row["verification_status"].strip() != "verified":
            raise ValueError(f"row {line}: official question not verified")
        if row["answer"].strip() not in ["A", "B", "C", "D"]:
            raise ValueError(f"row {line}: bad answer")

        competency_topic = validate_competency(row, line)
        competency_distribution[(row["subject"].strip(), competency_topic)] += 1

        pid = row["paper_id"].strip()
        if pid not in papers:
            papers[pid] = {
                "paper_id": pid,
                "year": int(row["year"]),
                "session": norm_session(row["session"], row["year"]),
                "level": row["level"].strip(),
                "subject": row["subject"].strip(),
                "source_pdf_file": row["source_pdf_file"].strip(),
                "questions": [],
            }
        p = papers[pid]
        current = (
            int(row["year"]), norm_session(row["session"], row["year"]),
            row["level"].strip(), row["subject"].strip(), row["source_pdf_file"].strip(),
        )
        expected = (p["year"], p["session"], p["level"], p["subject"], p["source_pdf_file"])
        if current != expected:
            raise ValueError(f"row {line}: paper metadata drift")

        page_range(row)
        context_id = row["shared_context_id"].strip()
        shared_assets = []
        if context_id:
            dependents += 1
            if not context_id.startswith(pid + "_"):
                raise ValueError(f"row {line}: shared context belongs to another paper")
            start, end = page_range(row, "shared_context_")
            shared_assets = split_assets(row["shared_context_visual_asset_file"])
            context = {
                "paper_id": pid,
                "text": row["shared_context_text"].strip(),
                "source_page_start": start,
                "source_page_end": end,
                "visual_assets": shared_assets,
            }
            if not context["text"] and not shared_assets:
                raise ValueError(f"row {line}: empty shared context")
            if context_id in contexts and contexts[context_id] != context:
                raise ValueError(f"row {line}: inconsistent shared context {context_id}")
            contexts[context_id] = context
        elif any(row[key].strip() for key in SHARED_HEADERS[1:]):
            raise ValueError(f"row {line}: shared context fields without ID")

        has_visual = to_bool(row["has_visual"])
        assets = split_assets(row.get("visual_asset_file", ""))
        if set(assets) & set(shared_assets):
            raise ValueError(f"row {line}: shared asset duplicated as question asset")
        if has_visual:
            visual_rows += 1
            if not assets + shared_assets:
                raise ValueError(f"row {line}: missing visual mapping")
        elif assets + shared_assets:
            raise ValueError(f"row {line}: unexpected visual mapping")

        for asset in assets + shared_assets:
            unique_assets.add(asset)
            if not asset.startswith("assets/official-visuals/" + pid + "/") or ".." in Path(asset).parts:
                raise ValueError(f"row {line}: invalid asset path")
            if not (repo_root / asset).is_file():
                raise ValueError(f"row {line}: missing {asset}")

        p["questions"].append({
            "question_no": int(row["question_no"]),
            "question_text": row["question_text"].strip(),
            "options": {
                "A": row["option_a"].strip(), "B": row["option_b"].strip(),
                "C": row["option_c"].strip(), "D": row["option_d"].strip(),
            },
            "answer": row["answer"].strip(),
            "source_page_start": to_int(row.get("source_page_start", "")),
            "source_page_end": to_int(row.get("source_page_end", "")),
            "has_visual": has_visual,
            "visual_assets": assets,
            "notes": (row.get("notes") or "").strip(),
            "verification_status": "verified",
            "competency_topic": competency_topic,
            "competency_mapping_status": "verified",
            "competency_mapping_note": (row.get("competency_mapping_note") or "").strip(),
            "shared_context_id": context_id or None,
        })

    if len(papers) != EXPECTED_PAPERS:
        raise ValueError(f"expected {EXPECTED_PAPERS} papers, got {len(papers)}")
    for pid, p in papers.items():
        p["questions"].sort(key=lambda q: q["question_no"])
        if [q["question_no"] for q in p["questions"]] != list(range(1, EXPECTED_Q + 1)):
            raise ValueError(f"{pid}: numbering/count mismatch")

    if visual_rows != EXPECTED_VISUAL_ROWS:
        raise ValueError(f"expected {EXPECTED_VISUAL_ROWS} visual rows, got {visual_rows}")
    if len(unique_assets) != EXPECTED_ASSETS:
        raise ValueError(f"expected {EXPECTED_ASSETS} assets, got {len(unique_assets)}")
    if len(contexts) != EXPECTED_CONTEXTS or dependents != EXPECTED_DEPENDENTS:
        raise ValueError("shared context group/dependent count mismatch")

    bundle = {
        "schema_version": BUNDLE_SCHEMA_VERSION,
        "source": {
            "type": "verified-master-snapshot",
            "spreadsheet_id": SOURCE_ID,
            "sheet_name": SOURCE_SHEET,
            "spreadsheet_url": SOURCE_URL,
            "row_count": len(rows),
            "paper_count": len(papers),
            "verification_status": "verified",
            "competency_mapping_status": "verified",
            "snapshot_date": SOURCE_SNAPSHOT_DATE,
        },
        "competency_distribution": {
            subject: {
                topic: competency_distribution[(subject, topic)]
                for topic in sorted(TOPICS_BY_SUBJECT[subject])
                if competency_distribution[(subject, topic)]
            }
            for subject in sorted(TOPICS_BY_SUBJECT)
        },
        "shared_contexts": contexts,
        "papers": list(papers.values()),
    }
    return bundle, visual_rows, len(unique_assets)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="data/official-past-papers-source.csv")
    ap.add_argument("--output", default="data/official-past-papers.json")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    source = Path(args.source)
    output = Path(args.output)
    root = Path(__file__).resolve().parent.parent
    with source.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fields = reader.fieldnames or []
    bundle, visual_rows, asset_count = build(rows, fields, root)
    rendered = json.dumps(bundle, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not output.exists() or output.read_text(encoding="utf-8") != rendered:
            raise SystemExit(f"FAIL: {output} differs from deterministic rebuild")
    else:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(rendered, encoding="utf-8", newline="\n")
    print(
        f"PASS: {len(rows)} verified rows / {len(bundle['papers'])} papers / "
        f"{visual_rows} visual rows / {asset_count} unique assets / "
        f"{sum(len(v) for v in bundle['competency_distribution'].values())} populated competency topics"
    )


if __name__ == "__main__":
    main()
