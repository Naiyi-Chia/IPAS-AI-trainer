"""Contract tests for the canonical flat master -> official past-paper bundle boundary."""
import copy
import csv
import hashlib
import io
import unittest
from pathlib import Path

from build_official_past_bundle import BUNDLE_SCHEMA_VERSION, TOPICS_BY_SUBJECT, build

ROOT = Path(__file__).resolve().parents[1]
CANONICAL_AX_SHA256 = "e7476f1d5270822de66ba15e13c27d4e84a57349bc216d195e6bf8814d058118"


class OfficialPastBundleContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with (ROOT / "data/official-past-papers-source.csv").open(
            encoding="utf-8-sig", newline=""
        ) as f:
            reader = csv.DictReader(f)
            cls.rows, cls.headers = list(reader), reader.fieldnames

    def test_groups_metadata_and_unchanged_ids(self):
        bundle, visuals, assets = build(self.rows, self.headers, ROOT)
        self.assertEqual(
            (bundle["schema_version"], len(bundle["shared_contexts"]), visuals, assets),
            (BUNDLE_SCHEMA_VERSION, 12, 47, 63),
        )
        questions = [q for p in bundle["papers"] for q in p["questions"]]
        self.assertEqual(len(questions), 700)
        self.assertEqual(sum(bool(q["shared_context_id"]) for q in questions), 36)
        self.assertEqual(
            len({
                f"PAST-{p['paper_id']}-{q['question_no']}"
                for p in bundle["papers"] for q in p["questions"]
            }),
            700,
        )
        self.assertTrue(all(q["competency_mapping_status"] == "verified" for q in questions))
        self.assertTrue(all(q["competency_topic"] for q in questions))
        self.assertEqual(bundle["source"]["competency_mapping_status"], "verified")
        self.assertIn("138,357,544", bundle["shared_contexts"]["114-2-L23_q42-45_shared"]["text"])

    def test_all_topics_belong_to_paper_subject(self):
        bundle, _, _ = build(self.rows, self.headers, ROOT)
        for paper in bundle["papers"]:
            for q in paper["questions"]:
                self.assertIn(q["competency_topic"], TOPICS_BY_SUBJECT[paper["subject"]])

    def test_official_ax_content_fingerprint_is_unchanged(self):
        fields = self.headers[:24]
        out = io.StringIO()
        writer = csv.writer(out, lineterminator="\n", quoting=csv.QUOTE_ALL)
        writer.writerow(fields)
        for row in self.rows:
            writer.writerow([row[field] for field in fields])
        digest = hashlib.sha256(out.getvalue().encode("utf-8")).hexdigest()
        self.assertEqual(digest, CANONICAL_AX_SHA256)

    def test_duplicate_context_metadata_drift(self):
        for field, value in [
            ("shared_context_text", "changed"),
            ("shared_context_source_page_end", "14"),
            ("shared_context_visual_asset_file", ""),
        ]:
            with self.subTest(field=field):
                rows = copy.deepcopy(self.rows)
                row = next(r for r in rows if r["shared_context_id"] == "114-2-L22_q43-47_shared")
                row[field] = value
                with self.assertRaisesRegex(ValueError, "inconsistent shared context"):
                    build(rows, self.headers, ROOT)

    def test_missing_or_duplicate_provenance_and_unverified_official_rows(self):
        cases = [
            ("shared_context_id", ""),
            ("shared_context_source_page_start", ""),
            ("visual_asset_file", "assets/official-visuals/114-2-L22/114-2-L22_q43-47_shared.png"),
            ("verification_status", "unverified"),
            ("answer", "AB"),
        ]
        for field, value in cases:
            with self.subTest(field=field):
                rows = copy.deepcopy(self.rows)
                next(r for r in rows if r["shared_context_id"] == "114-2-L22_q43-47_shared")[field] = value
                with self.assertRaises(ValueError):
                    build(rows, self.headers, ROOT)

    def test_rejects_unverified_needs_review_invalid_and_cross_subject_competency(self):
        cases = [
            ("competency_mapping_status", "unverified", "not verified"),
            ("competency_mapping_status", "needs_review", "not verified"),
            ("competency_topic", "L99999", "invalid competency topic"),
            ("competency_topic", "L22101", "cross-subject competency topic"),
        ]
        for field, value, error in cases:
            with self.subTest(field=field, value=value):
                rows = copy.deepcopy(self.rows)
                row = next(r for r in rows if r["subject"] == "L11")
                row[field] = value
                with self.assertRaisesRegex(ValueError, error):
                    build(rows, self.headers, ROOT)

    def test_cross_platform_newlines(self):
        lf = [{k: v.replace("\r\n", "\n").replace("\r", "\n") for k, v in r.items()} for r in self.rows]
        crlf = [{k: v.replace("\n", "\r\n") for k, v in r.items()} for r in lf]
        self.assertEqual(build(lf, self.headers, ROOT), build(crlf, self.headers, ROOT))


if __name__ == "__main__":
    unittest.main()
