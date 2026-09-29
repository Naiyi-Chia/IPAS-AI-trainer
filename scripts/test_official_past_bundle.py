"""Contract tests for the flat master -> shared-context bundle boundary."""
import copy
import csv
import unittest
from pathlib import Path
from build_official_past_bundle import build

ROOT = Path(__file__).resolve().parents[1]

class SharedContextContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with (ROOT / 'data/official-past-papers-source.csv').open(encoding='utf-8-sig', newline='') as f:
            reader = csv.DictReader(f)
            cls.rows, cls.headers = list(reader), reader.fieldnames

    def test_groups_and_unchanged_ids(self):
        bundle, visuals, assets = build(self.rows, self.headers, ROOT)
        self.assertEqual((bundle['schema_version'], len(bundle['shared_contexts']), visuals, assets), (3, 12, 47, 63))
        self.assertEqual(sum(bool(q['shared_context_id']) for p in bundle['papers'] for q in p['questions']), 36)
        self.assertEqual(len({f"PAST-{p['paper_id']}-{q['question_no']}" for p in bundle['papers'] for q in p['questions']}), 700)
        self.assertIn('138,357,544', bundle['shared_contexts']['114-2-L23_q42-45_shared']['text'])

    def test_duplicate_context_metadata_drift(self):
        for field, value in [('shared_context_text', 'changed'), ('shared_context_source_page_end', '14'),
                             ('shared_context_visual_asset_file', '')]:
            with self.subTest(field=field):
                rows = copy.deepcopy(self.rows)
                row = next(r for r in rows if r['shared_context_id'] == '114-2-L22_q43-47_shared')
                row[field] = value
                with self.assertRaisesRegex(ValueError, 'inconsistent shared context'):
                    build(rows, self.headers, ROOT)

    def test_missing_or_duplicate_provenance_and_unverified_rows(self):
        cases = [('shared_context_id', ''), ('shared_context_source_page_start', ''),
                 ('visual_asset_file', 'assets/official-visuals/114-2-L22/114-2-L22_q43-47_shared.png'),
                 ('verification_status', 'unverified'), ('answer', 'AB')]
        for field, value in cases:
            with self.subTest(field=field):
                rows = copy.deepcopy(self.rows)
                next(r for r in rows if r['shared_context_id'] == '114-2-L22_q43-47_shared')[field] = value
                with self.assertRaises(ValueError):
                    build(rows, self.headers, ROOT)

    def test_cross_platform_newlines(self):
        lf = [{k:v.replace('\r\n', '\n').replace('\r', '\n') for k,v in r.items()} for r in self.rows]
        crlf = [{k:v.replace('\n', '\r\n') for k,v in r.items()} for r in lf]
        self.assertEqual(build(lf, self.headers, ROOT), build(crlf, self.headers, ROOT))

if __name__ == '__main__':
    unittest.main()
