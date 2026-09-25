"""Read-only cue scan; optional scoped baseline checks. Python standard library only."""
import argparse
import collections
import csv
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
BATCH = ['Q046', 'Q047', 'Q048', 'Q142', 'Q143', 'Q144', 'Q163', 'Q164', 'Q165', 'Q424']
BATCHES = {'batch1a': BATCH,
           'batch2a': [f'Q{n:03d}' for start in (85, 112, 127, 133, 139, 154, 169)
                       for n in range(start, start + 3)],
           'batch2b': [f'Q{n:03d}' for start in (334, 340, 346, 388)
                       for n in range(start, start + 6)],
           'batch2c': [f'Q{n:03d}' for start in (430, 466)
                       for n in range(start, start + 6)],
           'batch3a': [f'Q{n:03d}' for start in (1, 10, 16, 22, 34, 40, 43, 61)
                       for n in range(start, start + 3)]}


def extract(text):
    start = re.search(r'const DB\s*=\s*', text).end()
    db, end = json.JSONDecoder().raw_decode(text[start:])
    return db, text[:start] + '<DB>' + text[start + end:]


def scan(db):
    rows = []
    groups = collections.defaultdict(list)
    for q in db['questions']:
        # Unicode code points excluding whitespace, including punctuation/English.
        lengths = [len(re.sub(r'\s', '', o)) for o in q['options']]
        correct = lengths[q['answer']]
        ratio = correct / ((sum(lengths) - correct) / 3)
        longest = correct > max(n for i, n in enumerate(lengths) if i != q['answer'])
        reasons = []
        if ratio >= 2:
            reasons.append('length>=3x' if ratio >= 3 else 'length>=2x')
        if longest:
            reasons.append('unique-longest-correct')
        key = tuple(sorted(re.sub(r'\s', '', o) for o in q['options']))
        groups[key].append(q['id'])
        rows.append(dict(id=q['id'], subject=q['subject'], topic=q['topic'],
                         concept=q['concept'], answer='ABCD'[q['answer']],
                         lengths='/'.join(map(str, lengths)), ratio=ratio,
                         unique_longest=longest, reasons=reasons, option_key=key))
    repeated = [ids for ids in groups.values() if len(ids) > 1]
    for row in rows:
        row['repeat_ids'] = ','.join(groups[row.pop('option_key')])
        if ',' in row['repeat_ids']:
            row['reasons'].append('repeated-option-set')
        row['reasons'] = ';'.join(row['reasons'])
    summary = dict(total=len(rows), unique_ids=len({r['id'] for r in rows}),
                   unique_longest=sum(r['unique_longest'] for r in rows),
                   ratio_ge_2=sum(r['ratio'] >= 2 for r in rows),
                   ratio_ge_3=sum(r['ratio'] >= 3 for r in rows),
                   repeated_groups=len(repeated), repeated_questions=sum(map(len, repeated)),
                   answers=dict(sorted(collections.Counter(r['answer'] for r in rows).items())))
    return summary, rows


def validate(before, after, before_shell, after_shell, rows, batch=BATCH):
    b = {q['id']: q for q in before['questions']}
    a = {q['id']: q for q in after['questions']}
    assert len(after['questions']) == len(a) == len(b) == 483, 'count/IDs'
    assert list(b) == list(a), 'ID order'
    changed = [qid for qid in a if a[qid] != b[qid]]
    assert changed == batch, changed
    for qid in a:
        q = a[qid]
        assert len(q['options']) == len(set(q['options'])) == 4, qid
        assert q['subject'] in after['subjects'] and q['topic'] in after['topics'], qid
        assert q['topic'].startswith(q['subject']), qid
        assert 0 <= q['answer'] < 4, qid
        if qid in batch:
            for key in set(q) | set(b[qid]):
                if key not in {'question', 'options', 'explanation'}:
                    assert q[key] == b[qid][key], (qid, key)
    assert {k: v for k, v in before.items() if k != 'questions'} == {
        k: v for k, v in after.items() if k != 'questions'}, 'DB metadata'
    assert before_shell == after_shell, 'HTML/CSS/JS outside DB changed'
    assert all(r['ratio'] < 2 for r in rows if r['id'] in batch), 'batch length ratio'
    assert all(',' not in r['repeat_ids'] for r in rows if r['id'] in batch), 'batch repeats'
    return changed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--html', type=pathlib.Path, default=ROOT / 'index.html')
    parser.add_argument('--baseline', help='Git ref containing the pre-batch index.html')
    parser.add_argument('--batch', choices=BATCHES, default='batch1a')
    parser.add_argument('--csv', type=pathlib.Path, help='Write all 483 traceable rows, before/after if baseline supplied')
    args = parser.parse_args()
    batch = BATCHES[args.batch]
    after, shell = extract(args.html.read_text(encoding='utf-8'))
    summary, rows = scan(after)
    result = {'after': summary}
    csv_rows = [dict(stage='after', **r) for r in rows]
    if args.baseline:
        text = subprocess.check_output(['git', 'show', f'{args.baseline}:index.html'], cwd=ROOT).decode('utf-8')
        before, before_shell = extract(text)
        old_summary, old_rows = scan(before)
        result['before'] = old_summary
        result['changed_ids'] = validate(before, after, before_shell, shell, rows, batch)
        result['batch_ratios'] = {r['id']: round(r['ratio'], 4) for r in rows if r['id'] in batch}
        result['batch_validation'] = 'PASS'
        csv_rows = [dict(stage='before', **r) for r in old_rows] + csv_rows
    if args.csv:
        with args.csv.open('w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=list(csv_rows[0]))
            writer.writeheader()
            writer.writerows(csv_rows)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
