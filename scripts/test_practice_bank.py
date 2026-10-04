"""Migration equivalence and validator negative controls; no stored baseline copy."""
import copy
import json
import re
import subprocess
import unittest

from audit_question_cues import ROOT, scan
from validate_practice_questions import validate

BASELINE = 'b99d89a'
DB = json.loads((ROOT / 'data/practice-questions.json').read_text(encoding='utf-8'))


class PracticeBankTests(unittest.TestCase):
    def test_migration(self):
        html = subprocess.check_output(['git', 'show', f'{BASELINE}:index.html'], cwd=ROOT).decode('utf-8')
        old = json.loads(re.search(r'^const DB = (.+);$', html, re.M)[1])
        self.assertEqual(DB, old)
        self.assertEqual(len(DB['questions']), 483)
        self.assertEqual(scan(DB), scan(old))
        self.assertNotIn('const DB = {', (ROOT / 'index.html').read_text(encoding='utf-8'))

    def test_valid(self):
        self.assertEqual(validate(DB), [])

    def test_negative_controls(self):
        changes = {
            'id': 'PAST-115-1-L11-1', 'level': '中級', 'subject': 'L99',
            'subjectName': 'incorrect', 'topic': 'L12101', 'topicName': 'incorrect',
            'concept': '', 'difficulty': 'expert', 'question': ' ',
            'options': ['a', 'b', '', 'd'], 'answer': True, 'explanation': '',
            'sourceType': '官方考古題', 'paper_id': '115-1-L11',
        }
        for field, value in changes.items():
            with self.subTest(field=field):
                bank = copy.deepcopy(DB)
                bank['questions'][0][field] = value
                self.assertTrue(validate(bank), field)
        for value in [-1, 4, 1.5, '0', None]:
            bank = copy.deepcopy(DB)
            bank['questions'][0]['answer'] = value
            self.assertTrue(validate(bank))
        for options in [['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e'],
                        ['a', 'a', 'c', 'd'], ['a', 'b', None, 'd'], 'abcd']:
            bank = copy.deepcopy(DB)
            bank['questions'][0]['options'] = options
            self.assertTrue(validate(bank))
        bank = copy.deepcopy(DB)
        bank['questions'].append(copy.deepcopy(bank['questions'][0]))
        self.assertTrue(validate(bank))
        bank = copy.deepcopy(DB)
        del bank['questions'][0]['explanation']
        self.assertTrue(validate(bank))
        for malformed in [None, [], {}, {'subjects': [], 'topics': [], 'questions': [None]}]:
            self.assertTrue(validate(malformed))


if __name__ == '__main__':
    unittest.main()
