#!/usr/bin/env python3
"""Audit self-authored IPAS questions for simple answer-cue signals.

This is a diagnostic tool. It never edits the question bank.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_questions(index_path: Path):
    text = index_path.read_text(encoding="utf-8")
    marker = "const DB = "
    start = text.find(marker)
    end = text.find(";\nconst officialBrochure", start)
    if start < 0 or end < 0:
        raise RuntimeError("Could not locate the embedded DB JSON in index.html")
    db = json.loads(text[start + len(marker) : end])
    return db["questions"]


def compact_len(value: str) -> int:
    return len("".join(str(value or "").split()))


def audit(question):
    lengths = [compact_len(option) for option in question["options"]]
    answer_index = question["answer"]
    correct_len = lengths[answer_index]
    distractors = [length for i, length in enumerate(lengths) if i != answer_index]
    avg_distractor = sum(distractors) / len(distractors)
    max_distractor = max(distractors)
    return {
        "id": question["id"],
        "subject": question.get("subject", ""),
        "topic": question.get("topic", ""),
        "concept": question.get("concept", ""),
        "answer": "ABCD"[answer_index],
        "lengths": lengths,
        "ratio": correct_len / avg_distractor if avg_distractor else 0,
        "margin": correct_len - max_distractor,
        "unique_longest": correct_len > max_distractor,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", default="index.html")
    parser.add_argument("--ratio", type=float, default=2.5)
    parser.add_argument("--margin", type=int, default=10)
    parser.add_argument("--limit", type=int, default=50)
    args = parser.parse_args()

    questions = load_questions(Path(args.index))
    results = [audit(q) for q in questions]

    positions = {letter: 0 for letter in "ABCD"}
    for row in results:
        positions[row["answer"]] += 1

    candidates = [
        row
        for row in results
        if row["unique_longest"]
        and row["ratio"] >= args.ratio
        and row["margin"] >= args.margin
    ]
    candidates.sort(key=lambda row: (-row["ratio"], -row["margin"], row["id"]))

    print(f"questions={len(results)}")
    print(f"unique_longest={sum(r['unique_longest'] for r in results)}")
    print(f"ratio>=1.5={sum(r['ratio'] >= 1.5 for r in results)}")
    print(f"ratio>=2.0={sum(r['ratio'] >= 2.0 for r in results)}")
    print(f"ratio>=2.5={sum(r['ratio'] >= 2.5 for r in results)}")
    print(f"ratio>=3.0={sum(r['ratio'] >= 3.0 for r in results)}")
    print("answer_positions=" + json.dumps(positions, ensure_ascii=False))
    print(
        f"candidates(ratio>={args.ratio}, margin>={args.margin})="
        f"{len(candidates)}"
    )
    print()
    print("id\tsubject\ttopic\tanswer\tratio\tmargin\tlengths\tconcept")
    for row in candidates[: args.limit]:
        print(
            f"{row['id']}\t{row['subject']}\t{row['topic']}\t{row['answer']}\t"
            f"{row['ratio']:.2f}\t{row['margin']}\t{row['lengths']}\t"
            f"{row['concept']}"
        )


if __name__ == "__main__":
    main()
