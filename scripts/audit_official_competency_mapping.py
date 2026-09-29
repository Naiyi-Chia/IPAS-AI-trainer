#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path

EXPECTED_ROWS = 700
REQUIRED_HEADERS = [
    "paper_id",
    "subject",
    "question_no",
    "competency_topic",
    "competency_mapping_status",
    "competency_mapping_note",
]
ALLOWED_STATUSES = {"unverified", "verified", "needs_review"}
TOPICS_BY_SUBJECT = {
    "L11": {
        "L11101", "L11102", "L11201", "L11202", "L11203",
        "L11301", "L11302", "L11401", "L11402",
    },
    "L12": {
        "L12101", "L12102", "L12201", "L12202",
        "L12301", "L12302", "L12303",
    },
    "L21": {
        "L21101", "L21102", "L21103", "L21104",
        "L21201", "L21202", "L21203", "L21301", "L21302",
    },
    "L22": {
        "L22101", "L22102", "L22103",
        "L22201", "L22202", "L22203",
        "L22301", "L22302", "L22303",
        "L22401", "L22402", "L22403", "L22404",
    },
    "L23": {
        "L23101", "L23102", "L23103",
        "L23201", "L23202", "L23203",
        "L23301", "L23302", "L23303", "L23304",
        "L23401", "L23402",
    },
}


def audit(rows: list[dict[str, str]], fieldnames: list[str], require_verified: bool = False) -> dict:
    missing_headers = [h for h in REQUIRED_HEADERS if h not in fieldnames]
    if missing_headers:
        raise ValueError(f"missing headers: {missing_headers}")
    if len(rows) != EXPECTED_ROWS:
        raise ValueError(f"expected {EXPECTED_ROWS} rows, got {len(rows)}")

    status_counts = Counter()
    topic_counts = Counter()
    subject_topic_counts: dict[str, Counter] = defaultdict(Counter)
    paper_topic_counts: dict[str, Counter] = defaultdict(Counter)
    mapped = 0
    errors: list[str] = []

    for line, row in enumerate(rows, 2):
        paper_id = (row.get("paper_id") or "").strip()
        subject = (row.get("subject") or "").strip()
        question_no = (row.get("question_no") or "").strip()
        topic = (row.get("competency_topic") or "").strip()
        status = (row.get("competency_mapping_status") or "").strip()

        if subject not in TOPICS_BY_SUBJECT:
            errors.append(f"row {line}: unknown subject {subject!r}")
            continue
        if status not in ALLOWED_STATUSES:
            errors.append(f"row {line}: invalid competency_mapping_status {status!r}")
            continue

        status_counts[status] += 1

        if not topic:
            if status != "unverified":
                errors.append(
                    f"row {line}: {paper_id} Q{question_no} has status {status!r} without competency_topic"
                )
            continue

        mapped += 1
        valid_topics = TOPICS_BY_SUBJECT[subject]
        if topic not in valid_topics:
            owner = next((s for s, topics in TOPICS_BY_SUBJECT.items() if topic in topics), None)
            if owner:
                errors.append(
                    f"row {line}: cross-subject topic {topic} belongs to {owner}, not {subject}"
                )
            else:
                errors.append(f"row {line}: invalid topic {topic!r}")
            continue

        topic_counts[topic] += 1
        subject_topic_counts[subject][topic] += 1
        paper_topic_counts[paper_id][topic] += 1

    if require_verified:
        if mapped != EXPECTED_ROWS:
            errors.append(f"final gate: mapped {mapped}/{EXPECTED_ROWS}")
        if status_counts["verified"] != EXPECTED_ROWS:
            errors.append(
                f"final gate: verified {status_counts['verified']}/{EXPECTED_ROWS}; "
                f"unverified={status_counts['unverified']}, needs_review={status_counts['needs_review']}"
            )

    if errors:
        raise ValueError("\n".join(errors[:50]))

    return {
        "rows": len(rows),
        "mapped": mapped,
        "unmapped": len(rows) - mapped,
        "status_counts": dict(status_counts),
        "topic_counts": dict(sorted(topic_counts.items())),
        "subject_topic_counts": {
            subject: dict(sorted(counts.items()))
            for subject, counts in sorted(subject_topic_counts.items())
        },
        "paper_topic_counts": {
            paper: dict(sorted(counts.items()))
            for paper, counts in sorted(paper_topic_counts.items())
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Audit official past-paper -> competency-topic mappings for Issue #103."
    )
    parser.add_argument(
        "--source",
        default="data/official-past-papers-source.csv",
        help="CSV snapshot of the canonical flat master table",
    )
    parser.add_argument(
        "--require-verified",
        action="store_true",
        help="Fail unless all 700 rows have a valid verified mapping",
    )
    args = parser.parse_args()

    source = Path(args.source)
    with source.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames or []

    result = audit(rows, fieldnames, require_verified=args.require_verified)

    print(
        "PASS: "
        f"{result['rows']} rows / "
        f"{result['mapped']} mapped / "
        f"{result['unmapped']} unmapped / "
        f"status={result['status_counts']}"
    )
    for subject, counts in result["subject_topic_counts"].items():
        print(subject + ": " + ", ".join(f"{topic}={count}" for topic, count in counts.items()))


if __name__ == "__main__":
    main()
